/*jshint esversion: 6 */
import {GameScene} from "./gameScene.js";

export class MenuScene extends Phaser.Scene {
    
    constructor(config)
    {
        super("sceneMenu");
    }

    preload(){
        
    }
    create(){
        let cx =  this.cameras.main.centerX;
        let cy = this.cameras.main.centerY;
        // this.add.line(cx, cy, 0, 0, this.cameras.main.width,0,0xffffff );
        // this.add.line(cx, cy, 0, 0, 0, this.cameras.main.height,0xffffff);
        let scoreText = this.add.text(cx, cy-150, "Asteroids",{fontSize: 64});
        scoreText.setOrigin(0.5,0.5);

        let playText = this.add.text(cx, cy-50, "Play",{fontSize: 32});
        playText.setOrigin(0.5,0.5);
        playText.setInteractive();
        playText.on("pointerdown", () => {playText.setColor("gray"); this.startGame();});
        playText.on("pointerup", () => {playText.setColor("white");});
    }
    
    startGame(){
        this.scene.start("sceneGame");
        console.log(this);
    }
}