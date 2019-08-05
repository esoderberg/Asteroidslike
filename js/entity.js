/*jshint esversion: 6 */

export default class Entity extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,...args){
        super(scene, ...args);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}