/*jshint esversion: 6 */
export class GameOverScene extends Phaser.Scene {
    
    constructor(config)
    {
        super("sceneGameOver");
    }

    preload(){
        
    }
    create(data){
        let cx =  this.cameras.main.centerX;
        let cy = this.cameras.main.centerY;
        // this.add.line(cx, cy, 0, 0, this.cameras.main.width,0,0xffffff );
        // this.add.line(cx, cy, 0, 0, 0, this.cameras.main.height,0xffffff);
        let gameOverText = this.add.text(cx, cy-150, "Game Over",{fontSize: 64});
        gameOverText.setOrigin(0.5, 0.5);

        let scoreText = this.add.text(cx, cy-50, "Score: " + data.score,{fontSize: 32});
        scoreText.setOrigin(0.5,0.5);
        let playText = this.add.text(cx, cy-100, "Play Again",{fontSize: 32});
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