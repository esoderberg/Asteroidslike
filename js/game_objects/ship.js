/*jshint esversion: 6 */
import Entity from "./entity.js";
import {StandardGun, TriGun} from "./gunModule.js";

export class Ship extends Entity{
    constructor({sargs, world,  inputKeys:{forward, left, right, fire}}){
        super(sargs);
        
        this.setDrag(0.99);
        this.setDamping(true);

        this.score = 0;
        this.lives = 3;
        this.scene.registry.set('playerLives', this.lives);
        this.world = world;
        // Bindings for input
        this.forward = forward;
        this.left = left;
        this.right = right;
        this.fire = fire;
        this.vulnerable = true;

        this.gunModule = new StandardGun(this, 5, 0.2, 1.5);


        this.turnVel = 180;
        this.acceleration = 120;
       
        this.engine = this.scene.trailParticles.createEmitter({
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
        this.engine.stop();

        this.spawner = (...args) => this.scene.spawnBullet(...args);

    }

    update(time, delta){
        let angularVel = 0;
        let acceleration = 0;

        this.gunModule.update(time, delta);

        this.engine.setAngle(90+this.angle);
        this.engine.setSpeed({min:100+this.body.velocity.length(), max:150+this.body.velocity.length()});
        this.engine.followOffset.setToPolar(this.rotation+Math.PI/2, 8);

        if(this.forward.isDown){
            this.setAcceleration(this.acceleration*Math.sin(this.rotation), -this.acceleration*Math.cos(this.rotation));
            this.engine.start();
            this.engineSound.resume();
        }else{
            this.setAcceleration(0,0);
            this.engine.stop();
            this.engineSound.pause();
        }
        if(this.left.isDown){
            angularVel += -this.turnVel;
        }
        if(this.right.isDown){
            angularVel += this.turnVel;
        }
        this.setAngularVelocity(angularVel);

        if(this.fire.isDown){
            this.gunModule.setTriggerHeld(true);
        }else{
            this.gunModule.setTriggerHeld(false);
        }
    }

    reload(){
        this.gunModule.reload();
    }

    get rotForward() { return this.rotation-Math.PI/2;}

    facing(){
        return new Phaser.Math.Vector2(Math.sin(this.rotation), -Math.cos(this.rotation));
    }

    addScore(score){
        this.score += score;
        this.scene.registry.set('score', this.score);
    }

    kill(){
        this.vulnerable = false;
        this.lives -= 1;
        this.scene.registry.set('playerLives', this.lives);
        this.engine.stop();
        this.emit("ship_death");
        this.setActive(false).setVisible(false);
    }

    isVulnerable(){ return this.vulnerable; }

    makeTempInvulnerable(seconds){
        this.vulnerable = false;
        let blinkEvent = this.scene.time.addEvent({delay:200, callback: () => {this.setVisible(!this.visible);}, callbackScope: this, repeat:-1});
        this.scene.time.delayedCall(seconds*1000, // delay is given in milliseconds
            () => {
                this.vulnerable = true;
                blinkEvent.remove();
                this.setVisible(true);}, null, this);
    }

    respawn(x,y){
        this.setActive(true).setVisible(true);
        this.setRotation(0);
        this.setPosition(x,y);
        this.body.setVelocity(0,0);
        this.makeTempInvulnerable(3);
    }
}