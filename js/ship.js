/*jshint esversion: 6 */
import Entity from "./entity.js";
import {StandardGun, TriGun} from "./gunModule.js";

export class Ship extends Entity{
    constructor({scene, x, y, texture, frame, world,  inputKeys:{forward, left, right, fire}}){
        super(scene, x, y, texture, frame);
        this.score = 0;
        this.world = world;
        // Bindings for input
        this.forward = forward;
        this.left = left;
        this.right = right;
        this.fire = fire;

        this.gunModule = new TriGun(10, 0.2, 0.8, this);


        this.turnVel = 180;
        this.acceleration = 120;
       
        this.emitter = scene.trailParticles.createEmitter({
            frame: ["red","orange"],
            scale: {start: 0.2, end:0},
            alpha: {start:1, end:0},
            x:0,y:0,
            quantity:3,
            lifespan: {min:400, max:700},
            speed: {min:100, max:150},
            blendMode: "ADD",
            follow:this,
        });
        this.emitter.stop();

        this.spawner = (...args) => this.world.spawnBullet(...args);

    }

    update(time, delta){
        let angularVel = 0;
        let acceleration = 0;

        this.gunModule.update(time, delta);

        this.emitter.setAngle(90+this.angle);
        this.emitter.setSpeed({min:100+this.body.velocity.length(), max:150+this.body.velocity.length()});
        this.emitter.followOffset.setToPolar(this.rotation+Math.PI/2, 8);

        if(this.forward.isDown){
            this.setAcceleration(this.acceleration*Math.sin(this.rotation), -this.acceleration*Math.cos(this.rotation));
            this.emitter.start();
            this.engineSound.resume();
        }else{
            this.setAcceleration(0,0);
            this.emitter.stop();
            this.engineSound.pause();
        }
        if(this.left.isDown){
            angularVel += -this.turnVel;
        }
        if(this.right.isDown){
            angularVel += this.turnVel;
        }
        this.setAngularVelocity(angularVel);
        if(this.gunModule.canFire() && this.fire.isDown){
            this.gunModule.fire({pos: this.getCenter(), rotation:this.rotation-Math.PI/2, speed:300, spawner: this.spawner });
            this.world.bulletSound.play();
        }
    }

    reload(){
        this.gunModule.reload();
    }

    facing(){
        return new Phaser.Math.Vector2(Math.sin(this.rotation), -Math.cos(this.rotation));
    }

    addScore(score){
        this.score += score;
        this.scene.registry.set('score', this.score);
    }

}