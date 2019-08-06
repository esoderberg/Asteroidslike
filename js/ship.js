/*jshint esversion: 6 */
import Entity from "./entity.js";

export class Ship extends Entity{
    constructor({scene, x, y, texture, frame, world,  inputKeys:{forward, left, right, fire}, fireCooldown=0.2, reloadCooldown=0.8}){
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
        this.sinceReload = 0;
        this.reloadCooldown = reloadCooldown*1000;
        this.storedBullets = 10;
        this.maxBullets = 10;


        this.turnVel = 180;
        this.acceleration = 120;

    }

    update(time, delta){
        let angularVel = 0;
        let acceleration = 0;

        this.sinceFired += delta;
        this.sinceReload += delta;

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

        if(this.sinceReload > this.reloadCooldown && this.storedBullets < this.maxBullets){
            this.reload();
            this.sinceReload = 0;
        }

        if(this.fire.isDown && this.sinceFired > this.fireCooldown && this.storedBullets > 0){
            this.storedBullets -= 1;
            this.world.spawnBullet(this.getCenter().x, this.getCenter().y, this);
            this.sinceFired = 0;
        }
    }

    reload(){
        this.storedBullets += 1;
    }

    facing(){
        return new Phaser.Math.Vector2(Math.sin(this.rotation), -Math.cos(this.rotation));
    }

    addScore(score){
        this.score += score;
        this.emit("score", this.score);
    }

}