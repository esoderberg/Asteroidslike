/** @type {import("typings/phaser")} */
/*jshint esversion: 6 */

import {Ship} from "./ship.js";
import {Asteroid} from "./asteroid.js";
import {Bullet} from "./bullet.js";
import {randRange} from "./util.js";
const WIDTH = 800;
const HEIGHT = 600;
const CENTER = {x: WIDTH/2, y: HEIGHT/2};
const qRad = Math.PI/4;



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


/** Get a random point from the outer rim.
 *
 * x - x coordinate
 * y - y coordinate
 * direction : the radian angle of the coordinates from the world center. Add PI to get towards center.
 *
 * returned as {x,y,dir}
 */
function getOuterRimCoords(){
    let direction = Math.random()*Math.PI*2;
    let x = CENTER.x + Math.cos(direction) * randRange(WIDTH/2+100,WIDTH/2+200);
    let y = CENTER.y + Math.sin(direction) * randRange(HEIGHT/2+100,HEIGHT/2+200);
    return {x:x, y:y, dir:direction};
}


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
    bullet.owner.addScore(1);
    bullet.owner.reload();
    bullet.destroy();
    asteroid.destroy();
}

/*******************/

var world = {};

function initializeWorld(world, scene){

    world.maxAsteroids = 15;

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
    let offset = WIDTH/2 + 400;
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
    scene.physics.add.overlap(world.asteroids, world.worldBounds, world.respawnAsteroid, null, world);
}

// Factory Functions

/**
 * Shoots a bullet in the facing direction of {shooter}.
 * @param {number} x - initial x position
 * @param {number} y - initial y position
 * @param {Ship} shooter - the ship that fired the bullet
 */
world.spawnBullet = function spawnBullet(x, y, shooter){
    let bullet = new Bullet({sargs:[this.scene, x, y, "plasmaBullet",0], owner:shooter});
    this.bullets.add(bullet);

    bullet.rotation = shooter.rotation;
    let {x:fx, y:fy} = shooter.facing();
    bullet.setVelocity(300*fx+shooter.body.velocity.x, 300*fy+shooter.body.velocity.y);
    bullet.play("bullet");
};

/** Spawns an asteroid of size at location.
 *  It is added to the "asteroids" physics group.
 * @param {number} x - initial x position
 * @param {number} y - initial y position
 * @param {number} size - asteroid size
 * @returns {Asteroid} The spawned asteroid.
 */
world.spawnAsteroid = function spawnAsteroid(x, y, size){
    let asteroid = new Asteroid({sargs:[this.scene, x, y, asteroid_size_name[size], 0],size:size});
    this.asteroids.add(asteroid);
    return asteroid;
}

/**Spawn an asteroid at a random location on the outer rim */
world.spawnRandomAsteroid = function spawnRandomAsteroid(size){
    let {x,y, dir:direction} = getOuterRimCoords();
    let asteroid = world.spawnAsteroid(x, y, size);
    asteroid.launchAsteroid(60+randRange(-20, 20), direction + Math.PI, qRad);
};


/**
 * Collision event between asteroid and out-of-bounds rectangles.
 * Repositions the colliding asteroid onto the outer rim and launches it in a new direction.
 */
world.respawnAsteroid = function respawnAsteroid(asteroid, bound){
    let {x,y, dir:direction} = getOuterRimCoords();
    asteroid.setPosition(x, y);
    asteroid.launchAsteroid(60+randRange(-20, 20), direction + Math.PI, qRad);
};
/**
 * Creates two smaller pieces of an asteroid if possible.
 */
world.splitAsteroid = function splitAsteroid(asteroid){
    let newSize = asteroid.size-1;
    if(newSize <= 0) return;
    let originalVel = asteroid.body.velocity;

    let {x, y} = asteroid.getCenter();

    for(let i = 0; i < 2; i++){
        let {x:rx, y:ry} = Phaser.Math.RandomXY(new Phaser.Math.Vector2(),16);
        let asteroid = this.spawnAsteroid(x+rx, y+ry, newSize);

        // Launch with velocity that is slightly faster and somewhat in the same direction
        asteroid.launchAsteroid(originalVel.length() * randRange(1.05, 1.3), originalVel.angle(), qRad, 60/newSize);
    }
};

function create ()
{
    this.anims.create({key:"bullet", frames: this.anims.generateFrameNumbers("plasmaBullet",{start:0, end:6}), frameRate: 12, repeat:-1});

    initializeWorld(world, this);

    console.log(this);
    console.log(world);

    let inputKeys = {
        forward: this.input.keyboard.addKey('W'),
        left: this.input.keyboard.addKey('A'),
        right: this.input.keyboard.addKey('D'),
        fire: this.input.keyboard.addKey('Space')
    };
    let ship = new Ship({scene: this, x: CENTER.x, y: CENTER.y, texture: "ship", inputKeys: inputKeys, world:world});
    world.ships.add(ship);
    ship.setDrag(0.99);
    ship.setDamping(true);
    let scoreText = this.add.text(16,16,"Score: 0");
    ship.on("score", (score) => {scoreText.setText("Score: "+ score);});
    this.physics.config.debug = false;
}

function update ()
{
    if(world.asteroids.getLength() < world.maxAsteroids){
        world.spawnRandomAsteroid(3);
    }
}
