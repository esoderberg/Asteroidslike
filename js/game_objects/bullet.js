/*jshint esversion: 6 */
import Entity from "./entity.js";

export class Bullet extends Entity{
    constructor({sargs, owner}){
        super(sargs);
        this.owner = owner;
    }
}