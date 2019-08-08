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

        let scoreText = this.add.text(cx, cy-80, "Score: " + data.score,{fontSize: 32});
        scoreText.setOrigin(0.5,0.5);

        let highScore = localStorage.getItem("high_score");
        let highScoreText;
        if(highScore > data.score){
            highScoreText = this.add.text(cx, cy-50, "High Score: " + highScore,{fontSize: 32});
        }else{
            highScoreText = this.add.text(cx, cy-50, "New High Score!",{fontSize: 32});
            if(highScore != null){
                let oldScoreText = this.add.text(cx, cy, "Old High Score: " + highScore,{fontSize: 32});
                oldScoreText.setOrigin(0.5,0.5);
            }
            localStorage.setItem("high_score", data.score);

        }

        highScoreText.setOrigin(0.5,0.5);

        let playText = this.add.text(cx, cy+80, "Play Again",{fontSize: 32});
        playText.setOrigin(0.5,0.5);
        playText.setInteractive();
        playText.on("pointerdown", () => {playText.setColor("gray"); this.startGame();});
        playText.on("pointerup", () => {playText.setColor("white");});
        this.backgroundSound = this.sound.add("background", {volume:0.5,loop:true});
        this.backgroundSound.play();
    }
    
    startGame(){
        this.sound.stopAll();
        this.scene.start("sceneGame");
        console.log(this);
    }
}