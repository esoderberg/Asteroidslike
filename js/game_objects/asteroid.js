/*jshint esversion: 6 */
import Entity from "./entity.js";
import {randRange} from "../util.js";

export class Asteroid extends Entity{
    constructor({sargs, size=3}){
        super(sargs);
        this.size = size;
    }

    /** Launches this asteroid in the specified direction at the specified speed.
     * 
     * @param {number} speed - velocity of asteroid.
     * @param {number} direction - (radians) main direction of launch.
     * @param {number} dirRandom - (radians) adds randomness to direction.
     * @param {number} angVelRange - specifies range within which the angular velocity will be.
    */
    launchAsteroid(speed, direction, dirRandom=0, angVelRange=30){  
        let dirx = randRange(direction-dirRandom, direction+dirRandom);
        let diry = randRange(direction-dirRandom, direction+dirRandom);
        let vx = speed * Math.cos(dirx);
        let vy = speed * Math.sin(diry);
        this.setVelocity(vx, vy);
        this.setAngularVelocity(randRange(-angVelRange, angVelRange));
    }
}
