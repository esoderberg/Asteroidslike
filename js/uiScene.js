/*jshint esversion: 6 */

export class UiScene extends Phaser.Scene {
    constructor(config)
    {
        super("sceneUI");
    }
    preload(){
        this.load.image("ship", "assets/Ship.png");
    }

    create(){
        this.scoreText = this.add.text(16,16,"Score: 0");
        // this.livesText = this.add.text(this.game.config.width - 100, 16, "Lives: 3");
        this.registry.events.on("changedata", this.updateData, this);
        this.lives = [];
        let baseX = this.game.config.width;
        // Add in reverse order to make it look better when popping off lives.
        for (let i = 0; i < this.registry.get("playerLives"); i++) {
            let img = this.add.image(baseX - 32 - i*(32+8), 24,"ship");
            this.lives.push(img);
        }
    }

    updateData(parent, key, data){
        if(key == "score"){
            this.scoreText.setText("Score: "+ data);
        }else if(key == "playerLives"){
            if(data < this.lives.length && data >= 0){
                this.lives.pop().destroy();
            }
        }
    }
}