/*jshint esversion: 6 */

import {Ship} from "./ship.js";
import {Asteroid} from "./asteroid.js";
import {Bullet} from "./bullet.js";
import {randRange, QUARTRAD, ASTEROID_SIZE_NAME} from "./util.js";

let explosionAudio = [
    // "sfx_exp_short_hard2.wav",
    // "sfx_exp_short_hard6.wav",
    "sfx_exp_short_soft1.wav",
    "sfx_exp_short_soft10.wav",
    "sfx_exp_short_soft5.wav"];

export class GameScene extends Phaser.Scene {
    
    constructor(config)
    {
        super("sceneGame");
    }
    
    preload(){
        this.load.spritesheet("asteroids", "assets/Asteroids.png",
            {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("smallAsteroids", "assets/SmallAsteroids.png",
            {frameWidth: 8, frameHeight: 8});
        this.load.spritesheet("bigAsteroids", "assets/BigAsteroids.png",
            {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("plasmaBullet", "assets/PlasmaBullet.png",
            {frameWidth:8, frameHeight:8});
        this.load.image("ship", "assets/Ship.png");
        this.load.image("blue_orb", "assets/RadialGradientBlue.png");
        this.load.atlas("particles", "assets/particles.png", "assets/particles.json");

        this.load.audio("shot", "assets/audio/sfx_wpn_cannon1.wav");
        let audiopath = "assets/audio/";
        explosionAudio.forEach((v,i) => this.load.audio("explosion_"+i, audiopath+v));
    }

    create(data){
        this.WIDTH = this.game.config.width;
        this.HEIGHT = this.game.config.height;
        this.CENTER = {x: this.WIDTH/2, y:this.HEIGHT/2};
        
        this.anims.create({key:"bullet", frames: this.anims.generateFrameNumbers("plasmaBullet",{start:0, end:6}), frameRate: 12, repeat:-1});
        this.bulletSound = this.sound.add("shot", {volume: 0.5});
        this.explosionSounds = [];
        explosionAudio.forEach((v,i) => this.explosionSounds.push(this.sound.add("explosion_"+i)));

        this.trailParticles = this.add.particles('particles');
        this.particles = {};
        let particles = this.add.particles('particles');
        particles.setDepth(10);
        let bulletExplosionConfig = {
            frame: ["blue","red"],
            scale: {start: 0.6, end:0},
            quantity: 30,
            alpha: {start:1, end:0},
            lifespan: {min:500, max:1000},
            speed: {min:120 , max:150},
            frequency: -1,
            blendMode: "ADD",
        };

        let asteroidExplosionConfig = {
            frame: ["white"],
            scale: {start: 0.6, end:0},
            quantity: 60,
            alpha: {start:1, end:0},
            lifespan: {min:300, max:600},
            speed: {min:20 , max:150},
            frequency: -1,
            blendMode: "ADD",
        };

        this.particles.bulletImpact = particles.createEmitter(bulletExplosionConfig);
        this.particles.asteroidExplode = particles.createEmitter(asteroidExplosionConfig);
        

        this.initializeWorld();
    
        let inputKeys = {
            forward: this.input.keyboard.addKey("W"),
            left: this.input.keyboard.addKey("A"),
            right: this.input.keyboard.addKey("D"),
            fire: this.input.keyboard.addKey("Space")
        };
        let ship = new Ship({scene: this, x: this.CENTER.x, y: this.CENTER.y, texture: "ship", inputKeys: inputKeys, world:this});
        this.ships.add(ship);
        ship.setDrag(0.99);
        ship.setDamping(true);
        console.log(ship);
        this.physics.config.debug = false;
    }

    update(time, delta){
        if(this.asteroids.getLength() < this.maxAsteroids){
            this.spawnRandomAsteroid(3);
        }
    }

    initializeWorld(){
        this.maxAsteroids = 15;
    
        // Sets up scene physics
        this.asteroids = this.physics.add.group();
        this.asteroids.runChildUpdate = true;
    
        this.bullets = this.physics.add.group();
        this.bullets.runChildUpdate = true;
    
        this.ships = this.physics.add.group();
        this.ships.runChildUpdate = true;

        this.initializeWorldBounds();

        this.physics.add.overlap(this.ships, this.asteroids, this.asteroidCollision, null, this);
        this.physics.add.overlap(this.bullets, this.asteroids, this.asteroidHit, null, this);
        this.physics.add.overlap(this.asteroids, this.worldBounds, this.respawnAsteroid, null, this);
        this.physics.add.overlap(this.bullets, this.worldBounds, (bullet, _) => {bullet.destroy();});
    }

    initializeWorldBounds(){
        /** Calculate world bounds as offset from the center */
        let rect_width = 5;
        let offset = this.WIDTH/2 + 400;
        let left = this.CENTER.x-offset;
        let right = this.CENTER.x + (offset-rect_width);
        let top = this.CENTER.y-offset;
        let bottom = this.CENTER.y + (offset-rect_width);
        let wx = right-left;
        let wy = bottom-top;
    
        let middle_y = top + wy/2;
        let middle_x = left + wx/2;
        
        this.worldBounds = this.physics.add.staticGroup();
        //Rectangle x,y is the center
        this.worldBounds.add(new Phaser.GameObjects.Rectangle(this, middle_x, top, wx, rect_width)); // Top
        this.worldBounds.add(new Phaser.GameObjects.Rectangle(this, left, middle_y, rect_width, wy));// Left
    
        this.worldBounds.add(new Phaser.GameObjects.Rectangle(this, middle_x, bottom, wx, rect_width)); // Bottom
        this.worldBounds.add(new Phaser.GameObjects.Rectangle(this, right, middle_y, rect_width, wy)); // Right
    }

        /**
     * Shoots a bullet in the facing direction of {shooter}.
     * @param {number} x - initial x position
     * @param {number} y - initial y position
     * @param {Ship} shooter - the ship that fired the bullet
     */
    spawnBullet(x, y, shooter){
        let bullet = new Bullet({sargs:[this, x, y, "plasmaBullet",0], owner:shooter});
        this.bullets.add(bullet);

        bullet.rotation = shooter.rotation;
        let {x:fx, y:fy} = shooter.facing();
        bullet.setVelocity(300*fx+shooter.body.velocity.x, 300*fy+shooter.body.velocity.y);
        bullet.play("bullet");

        let trail = this.add.particles('blue_orb');
        let emitter = trail.createEmitter({
            scale: {start: 0.2, end:0},
            alpha: {start:1, end:0},
            quantity:1,
            lifespan: {min:200, max:500},
            speed: {min:10 , max:50},
            blendMode: "ADD",
            follow:bullet,
        });

        bullet.on("destroy", () => trail.destroy());
    }

    /** Spawns an asteroid of size at location.
     *  It is added to the "asteroids" physics group.
     * @param {number} x - initial x position
     * @param {number} y - initial y position
     * @param {number} size - asteroid size
     * @returns {Asteroid} The spawned asteroid.
     */
    spawnAsteroid(x, y, size){
        let asteroid = new Asteroid({sargs:[this, x, y, ASTEROID_SIZE_NAME[size], Math.round(Math.random()*2)],size:size});
        this.asteroids.add(asteroid);
        return asteroid;
    }

    /**Spawn an asteroid at a random location on the outer rim */
    spawnRandomAsteroid(size){
        let {x,y, dir:direction} = this.getOuterRimCoords();
        let asteroid = this.spawnAsteroid(x, y, size);
        asteroid.launchAsteroid(60+randRange(-20, 20), direction + Math.PI, QUARTRAD);
    }


    /**
     * Collision event between asteroid and out-of-bounds rectangles.
     * Repositions the colliding asteroid onto the outer rim and launches it in a new direction.
     */
    respawnAsteroid(asteroid, bound){
        let {x,y, dir:direction} = this.getOuterRimCoords();
        asteroid.setPosition(x, y);
        asteroid.launchAsteroid(60+randRange(-20, 20), direction + Math.PI, QUARTRAD);
    }

    asteroidCollision(ship, asteroid){
        ship.setPosition(this.WIDTH/2, this.HEIGHT/2);
    }

    asteroidHit(bullet, asteroid){
        this.splitAsteroid(asteroid);
        this.particles.asteroidExplode.emitParticleAt(asteroid.x, asteroid.y, 10*asteroid.size);
        this.explosionSounds[Math.floor(Math.random()*(this.explosionSounds.length-1))].play();

        bullet.owner.addScore(1);
        bullet.owner.reload();
        // this.particles.bulletImpact.emitParticleAt(bullet.x, bullet.y);
        bullet.destroy();
        asteroid.destroy();
    }
    /**
     * Creates two smaller pieces of an asteroid if possible.
     */
    splitAsteroid(asteroid){
        let newSize = asteroid.size-1;
        if(newSize <= 0) return;
        let originalVel = asteroid.body.velocity;

        let {x, y} = asteroid.getCenter();

        for(let i = 0; i < 2; i++){
            let {x:rx, y:ry} = Phaser.Math.RandomXY(new Phaser.Math.Vector2(),16);
            let asteroid = this.spawnAsteroid(x+rx, y+ry, newSize);

            // Launch with velocity that is slightly faster and somewhat in the same direction
            asteroid.launchAsteroid(originalVel.length() * randRange(1.05, 1.3), originalVel.angle(), QUARTRAD, 60/newSize);
        }
    }

    /** Get a random point from the outer rim.
     *
     * x - x coordinate
     * y - y coordinate
     * direction : the radian angle of the coordinates from the world center. Add PI to get towards center.
     *
     * returned as {x,y,dir}
     */
    getOuterRimCoords(){
        let direction = Math.random()*Math.PI*2;
        let x = this.CENTER.x + Math.cos(direction) * randRange(this.WIDTH/2+100, this.WIDTH/2+200);
        let y = this.CENTER.y + Math.sin(direction) * randRange(this.HEIGHT/2+100,this.HEIGHT/2+200);
        return {x:x, y:y, dir:direction};
    }
}