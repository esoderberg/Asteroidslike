/*jshint esversion: 6 */

export default class Entity extends Phaser.Physics.Arcade.Sprite{
    constructor({scene, group,  x, y, texture, frame}){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        group.add(this);
    }
}