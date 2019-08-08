/** @type {import("typings/phaser")} */
/*jshint esversion: 6 */


import {GameScene} from "./gameScene.js";
import {UiScene} from "./uiScene.js";
import {MenuScene} from "./menuScene.js";
import {GameOverScene} from "./gameOverScene.js";
const WIDTH = 800;
const HEIGHT = 600;

var config = {
    type: Phaser.CANVAS,
    width: WIDTH,
    height: HEIGHT,
    // Fills whole screen
    // scale: {
    //     mode: Phaser.Scale.RESIZE,
    //     autoCenter: Phaser.Scale.CENTER_BOTH
    //   },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: false
        }
    },
    scene: [MenuScene, GameScene, UiScene, GameOverScene]
};

var game = new Phaser.Game(config);