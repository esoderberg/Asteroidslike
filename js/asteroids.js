/** @type {import("typings/phaser")} */
/*jshint esversion: 6 */

const WIDTH = 800;
const HEIGHT = 600;
const CENTER = {x: WIDTH/2, y: HEIGHT/2};


function randRange(min, max){
    return min + Math.random()*(max - min);
}


class Entity extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,...args){
        super(scene, ...args);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}

class Ship extends Entity{
    constructor({scene, x, y, texture, frame, world,  inputKeys:{forward, left, right, fire}, fireCooldown=1}){
        super(scene, x, y, texture, frame);
        this.score = 0;
        this.world = world;
        // Bindings for input
        this.forward = forward;
        this.left = left;
        this.right = right;
        this.fire = fire;

        this.fireCooldown = fireCooldown*1000; // Convert to milliseconds
        this.sinceFired = 0;

        this.turnVel = 180;
        this.acceleration = 50;
    }

    update(time, delta){
        let angularVel = 0;
        let acceleration = 0;

        this.sinceFired += delta;

        if(this.forward.isDown){
            this.setAcceleration(this.acceleration*Math.sin(this.rotation), -this.acceleration*Math.cos(this.rotation));    
        }else{
            this.setAcceleration(0,0);
        }
        if(this.left.isDown){
            angularVel += -this.turnVel;
        }
        if(this.right.isDown){
            angularVel += this.turnVel;
        }
        this.setAngularVelocity(angularVel);

        if(this.fire.isDown && this.sinceFired > this.fireCooldown){
            world.spawnBullet(this);
            this.sinceFired = 0;
        }
    }
    facing(){
        return new Phaser.Math.Vector2(Math.sin(this.rotation), -Math.cos(this.rotation));
    }
}

class Asteroid extends Entity{
    constructor({sargs,size=3}){
        super(...sargs);
        this.size = size;
    }
}

class Bullet extends Entity{
    constructor({sargs, owner}){
        super(...sargs);
        this.owner = owner;
    }
}



var config = {
    type: Phaser.CANVAS,
    width: WIDTH,
    height: HEIGHT,
    // Fills whole screen
    // scale: {
    //     mode: Phaser.Scale.RESIZE,
    //     autoCenter: Phaser.Scale.CENTER_BOTH
    //   },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};




var asteroid_size_name = {3: "bigAsteroids", 2:"asteroids", 1:"smallAsteroids"};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.spritesheet("asteroids", "assets/Asteroids.png",
     {frameWidth: 32, frameHeight: 32});
     this.load.spritesheet("smallAsteroids", "assets/SmallAsteroids.png",
     {frameWidth: 8, frameHeight: 8});
     this.load.spritesheet("bigAsteroids", "assets/BigAsteroids.png",
     {frameWidth: 64, frameHeight: 64});
     this.load.spritesheet("plasmaBullet", "assets/PlasmaBullet.png",
     {frameWidth:8, frameHeight:8});
    this.load.image("ship", "assets/Ship.png");

}

/* Collision functions */

function asteroidCollision(ship, asteroid){
    ship.setPosition(WIDTH/2, HEIGHT/2);
}

function asteroidHit(bullet, asteroid){
    world.splitAsteroid(asteroid);
    console.log("Asteroid hit");
    bullet.owner.score += 1;
    bullet.destroy();
    asteroid.destroy();
}

/*******************/

var world = {};

function initializeWorld(world, scene){
    // Sets up scene physics
    world.scene = scene;
    world.asteroids = scene.physics.add.group();
    world.asteroids.runChildUpdate = true;

    world.bullets = scene.physics.add.group();
    world.bullets.runChildUpdate = true;

    world.ships = scene.physics.add.group();
    world.ships.runChildUpdate = true;


    /** Calculate world bounds as offset from the center */
    let rect_width = 5;
    let offset = 300;
    let left = CENTER.x-offset;
    let right = CENTER.x + (offset-rect_width);
    let top = CENTER.y-offset;
    let bottom = CENTER.y + (offset-rect_width);
    let wx = right-left;
    let wy = bottom-top;

    let middle_y = top + wy/2;
    let middle_x = left + wx/2;
    
    world.worldBounds = scene.physics.add.staticGroup();
    //Rectangle x,y is the center
    world.worldBounds.add(new Phaser.GameObjects.Rectangle(scene, middle_x, top, wx, rect_width)); // Top
    world.worldBounds.add(new Phaser.GameObjects.Rectangle(scene, left, middle_y, rect_width, wy));// Left

    world.worldBounds.add(new Phaser.GameObjects.Rectangle(scene, middle_x, bottom, wx, rect_width)); // Bottom
    world.worldBounds.add(new Phaser.GameObjects.Rectangle(scene, right, middle_y, rect_width, wy)); // Right

    scene.physics.add.overlap(world.ships, world.asteroids, asteroidCollision);
    scene.physics.add.overlap(world.bullets, world.asteroids, asteroidHit);
}

world.spawnBullet = function spawnBullet(shooter){
    let {x, y} = shooter.body.position;
    let bullet = new Bullet({sargs:[this.scene, x, y, "plasmaBullet",0], owner:shooter});
    this.bullets.add(bullet);

    bullet.rotation = shooter.rotation;
    let {x:fx, y:fy} = shooter.facing();
    bullet.setVelocity(300*fx, 300*fy);
    bullet.play("bullet");
}

world.spawnRandomAsteroid = function spawnRandomAsteroid(){
    let asteroid = new Asteroid({sargs:[this.scene, 150+Math.random()*100,150+Math.random()*100, "bigAsteroids", 0],size:3});
    this.asteroids.add(asteroid);
    // asteroid.setSize(64,64);
    asteroid.setVelocity(30, 30);
    asteroid.setAngularVelocity(-15+Math.random()*30);
    
};

world.splitAsteroid = function splitAsteroid(asteroid){
    let newSize = asteroid.size-1;
    console.log("NewSize:", newSize);
    if(newSize <= 0) return;

    let {x, y} = asteroid.body.position;
    for(let i = 0; i < 2; i++){
        let {x:rx, y:ry} = Phaser.Math.RandomXY(new Phaser.Math.Vector2(),16);
        let asteroid = new Asteroid({sargs:[this.scene, x, y, asteroid_size_name[newSize], 0],size:newSize});
        this.asteroids.add(asteroid);
        let {x:vx, y:vy} = Phaser.Math.RandomXY(new Phaser.Math.Vector2(), 10);
        asteroid.setVelocity(vx,vy);
        asteroid.setAngularVelocity(-15+Math.random()*30);
    }
};

function create ()
{
    this.anims.create({key:"bullet", frames: this.anims.generateFrameNumbers("plasmaBullet",{start:0, end:6}), frameRate: 12, repeat:-1});

    initializeWorld(world, this);

    console.log(this);
    console.log(world);
    // world.groups.player = this.physics.group
    inputKeys = {
        forward: this.input.keyboard.addKey('W'),
        left: this.input.keyboard.addKey('A'),
        right: this.input.keyboard.addKey('D'),
        fire: this.input.keyboard.addKey('Space')
    }
    
    world.ships.add(new Ship({scene: this, x: 100, y: 100, texture: "ship", inputKeys: inputKeys, world:world}));

    world.spawnRandomAsteroid(this);
    // world.asteroids.push(new Asteroid({scene: this, x:200, y:400, texture: "asteroids", frame:1}));

}

function update ()
{
}
