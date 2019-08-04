/** @type {import("typings/phaser")} */
/*jshint esversion: 6 */

const WIDTH = 800;
const HEIGHT = 600;

class Entity extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,...args){
        super(scene, ...args);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}

class Ship extends Entity{
    constructor({scene, x, y, texture, frame,  inputKeys:{forward, left, right, fire}}){
        super(scene, x, y, texture, frame);
        // Bindings for input
        this.forward = forward;
        this.left = left;
        this.right = right;
        this.fire = fire;

        this.turnVel = 180;
        this.acceleration = 50;
    }

    update(time, delta){
        let angularVel = 0;
        let acceleration = 0;
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

        if(this.fire.isDown){
            // this.scene.add()
        }
    }
}

class Asteroid extends Entity{
    constructor({sargs,scale=1}){
        super(...sargs);
        this.setScale(scale);
    }
}

var world = {asteroids:[]};

world.spawnAsteroid = function spawnAsteroid(scene){
    let asteroid = new Asteroid({sargs:[scene, -150+Math.random()*100,-150+Math.random()*100, "asteroids", 0]});
    asteroid.setVelocity(30, 30);
    asteroid.setAngularVelocity(-15+Math.random()*30);
    this.asteroids.push(asteroid);
};

var config = {
    type: Phaser.CANVAS,
    width: WIDTH,
    height: HEIGHT,
    // roundPixels: true,
    // pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.spritesheet("asteroids", "assets/Asteroids.png",
     {frameWidth: 32, frameHeight: 32})
    this.load.image("ship", "assets/Ship.png")
}



function create ()
{
    console.log(this);
    inputKeys = {
        forward: this.input.keyboard.addKey('W'),
        left: this.input.keyboard.addKey('A'),
        right: this.input.keyboard.addKey('D'),
        fire: this.input.keyboard.addKey('Space')
    }
    
    world.ship = new Ship({scene: this, x: 100, y: 100, texture: "ship", inputKeys: inputKeys});
    world.ship.setVelocity(10,10);


    world.spawnAsteroid(this);
    // world.asteroids.push(new Asteroid({scene: this, x:200, y:400, texture: "asteroids", frame:1}));

}

function update ()
{
    world.ship.update();
}