/*jshint esversion: 6 */
import Entity from "./entity.js";

export class Asteroid extends Entity{
    constructor({sargs,size=3}){
        super(...sargs);
        this.size = size;
    }
}
