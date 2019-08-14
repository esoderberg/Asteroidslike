/*jshint esversion: 6 */
import Entity from "./entity.js";
import {StandardGun, TriGun} from "./gunModule.js";

export class Ship extends Entity{
    /**
     * @param {Object} config
     * @param {*} config.sargs - Arguments to Physics.Sprite
     * @param {Object.<string, Phaser.Input.Keyboard.Key} config.inputKeys - Keyboard keys map
     * @param {Phaser.Input.Keyboard.Key} config.inputKeys.forward - Move forward
     * @param {Phaser.Input.Keyboard.Key} config.inputKeys.left - Rotate ship left.
     * @param {Phaser.Input.Keyboard.Key} config.inputKeys.right - Rotate ship right.
     * @param {Phaser.Input.Keyboard.Key} config.inputKeys.fire - Fire ship gun.
     */
    constructor({sargs, inputKeys:{forward, left, right, fire}}){
        super(sargs);

        // Physics settings
        this.setDrag(0.99);
        this.setDamping(true);

        // Speed settings
        this.turnVel = 180;
        this.acceleration = 120;

        // Backing property fields
        this._score = 0;
        this._lives = 0;

        this.score = 0;
        this.lives = 0;
        this.vulnerable = true;

        // Bindings for input
        this.forwardKey = forward;
        this.leftKey = left;
        this.rightKey = right;
        this.fireKey = fire;

        this.gunModule = new StandardGun(this, 5, 0.2, 1.5);

        // Create particle system for engine trail

        this.particles = this.scene.add.particles('particles');
        this.engine = this.particles.createEmitter({
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
    }

    get lives(){
        return this._lives;
    }
    set lives(value){
        this._lives = value;
        this.scene.registry.set('playerLives', this._lives);
    }

    get score(){
        return this._score;
    }

    set score(value){
        this._score = value;
        this.scene.registry.set('score', this._score);
    }

    update(time, delta){
        let angularVel = 0;

        this.gunModule.update(time, delta);

        if(this.forwardKey.isDown){
            // Ensure that the engine particle system is correctly set up
            this.engine.setAngle(this.angleBack);
            this.engine.setSpeed({min:100+this.body.velocity.length(), max:150+this.body.velocity.length()});
            this.engine.followOffset.setToPolar(this.rotBack, 8);

            this.setAcceleration(this.acceleration*Math.cos(this.rotForward), this.acceleration*Math.sin(this.rotForward));
            this.engine.start();
            this.engineSound.resume();
        }else{
            this.setAcceleration(0,0);
            this.engine.stop();
            this.engineSound.pause();
        }

        // Set angular velocity
        if(this.leftKey.isDown){
            angularVel += -this.turnVel;
        }
        if(this.rightKey.isDown){
            angularVel += this.turnVel;
        }
        this.setAngularVelocity(angularVel);

        if(this.fireKey.isDown){
            this.gunModule.setTriggerHeld(true);
        }else{
            this.gunModule.setTriggerHeld(false);
        }
    }

    /**
     * Reloads the gun on this ship.
     */
    reload(){
        this.gunModule.reload();
    }

    /**
     * @returns {number} the rotation from +x-axis that would point a vector forward.
     */
    get rotForward() { return this.rotation-Math.PI/2;}

    /**
     * @returns {Phaser.Math.Vector2} Vector that points in the same direction as the ship.
     */
    facing(){
        return new Phaser.Math.Vector2(Math.sin(this.rotation), -Math.cos(this.rotation));
    }

    /**
     * Kills the ship.
     * This subtracts a life and makes the ship inactive and invisible.
     * Use respawn to restore ship.
     */
    kill(){
        this.vulnerable = false;
        this.lives -= 1;
        this.engine.stop();
        this.emit("ship_death");
        this.setActive(false).setVisible(false);
    }

    /**
     * @returns true if the ship can be damaged.
     */
    isVulnerable(){ return this.vulnerable; }

    /**
     * Makes the ship invulnerable for the specified duration. 
     * Whilst invulnerable the ship blinks.
     * 
     * @param {number} seconds the duration to make the ship invulerable.
     */
    makeTempInvulnerable(seconds){
        this.vulnerable = false;
        let blinkEvent = this.scene.time.addEvent({delay:200, callback: () => {this.setVisible(!this.visible);}, callbackScope: this, repeat:-1});
        this.scene.time.delayedCall(seconds*1000, // delay is given in milliseconds
            () => {
                this.vulnerable = true;
                blinkEvent.remove();
                this.setVisible(true);}, null, this);
    }

    /**
     * Respawns the ship and the coordinates provided and makes it invulnerable for 3 seconds.
     * 
     * @param {number} x 
     * @param {number} y 
     */
    respawn(x,y){
        this.setActive(true).setVisible(true);
        this.setRotation(0);
        this.setRotation(this.rotLeft);
        this.setPosition(x,y);
        this.body.setVelocity(0,0);
        this.makeTempInvulnerable(3);
    }


    /** Forward in relation to ship sprite */
    get rotForward() { return this.rotation;}
    /** Left in relation to ship sprite */
    get rotLeft() { return this.rotation - Math.PI/2;}
    /** Right in relation to ship sprite */
    get rotRight() { return this.rotation+ Math.PI/2;}
    /** Backwards in relation to ship sprite */
    get rotBack() { return this.rotation + Math.PI;}

    /** Forward in relation to ship sprite */
    get angleForward() { return this.angle;}
    /** Left in relation to ship sprite */
    get angleLeft() { return this.angle - 90;}
    /** Right in relation to ship sprite */
    get angleRight() { return this.angle + 90;}
    /** Back in relation to ship sprite */
    get angleBack() { return this.angle + 180;}
} 