/*jshint esversion: 6 */

export class UiScene extends Phaser.Scene {
    constructor(config)
    {
        super({key:"SceneUI", active:true});
    }
    preload(){

    }
    create(){
        this.scoreText = this.add.text(16,16,"Score: 0");
        this.livesText = this.add.text(this.game.config.width - 100, 16, "Lives: 3");

        this.registry.events.on("changedata", this.updateData, this);
    }

    updateData(parent, key, data){
        if(key == "score"){
            this.scoreText.setText("Score: "+ data);
        }else if(key == "lives"){
            this.livesText.setText("Lives: " + data);
        }
    }
}