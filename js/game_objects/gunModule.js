/*jshint esversion: 6 */

class GunModule{
    /**
     * 
     * @param {Phaser.GameObjects} owner - game object that owns the module
     * @param {number} maxBullets
     * @param {number} fireCooldown
     * @param {number} passiveRegenCooldown
     **/
    constructor(owner, maxBullets, fireCooldown, passiveRegenCooldown){
        this.owner = owner;
        this.scene = owner.scene;

        this.fireCooldown = fireCooldown*1000; // Convert to milliseconds
        this.passiveRegenCooldown = passiveRegenCooldown*1000;

        this.sinceFired = 0;
        this.sinceRegen = 0;
        this.storedBullets = maxBullets;
        this.maxBullets = maxBullets;
        this.triggerHeld = false;
    }

    update(time, delta){
        this.sinceFired += delta;
        this.sinceRegen += delta;
        if(this.sinceRegen > this.passiveRegenCooldown && this.storedBullets < this.maxBullets){
            this.reload();
            this.sinceRegen = 0;
        }
    }

    setTriggerHeld(isHeld){
        this.triggered = isHeld;
    }

    reload(){
        this.storedBullets = Math.min(this.storedBullets+1, this.maxBullets);
    }
}

export class StandardGun extends GunModule{
    constructor(owner, maxBullets, fireCooldown, passiveRegenCooldown){
        super(owner,  maxBullets, fireCooldown, passiveRegenCooldown);
    }

    update(time, delta){
        super.update(time, delta);
        if(this.triggered && this.canFire()){
            this.fire({pos:this.owner.getCenter(), rotation:this.owner.rotForward, speed:300});
        }
    } 

    /** */
    fire({pos:{x, y}, rotation, speed}){
        this.storedBullets -= 1;
        this.scene.spawnBullet(x,y, rotation, speed, this.owner);
        this.scene.bulletSound.play();
        this.sinceFired = 0;
    }
    canFire(){
        return this.storedBullets > 0 && this.sinceFired > this.fireCooldown;
    }
}

export class TriGun extends GunModule{
        constructor(owner, maxBullets, fireCooldown, passiveRegenCooldown){
        super(owner,  maxBullets, fireCooldown, passiveRegenCooldown);
    }
    update(time, delta){
        super.update(time, delta);
        if(this.triggered && this.canFire()){
            this.fire({pos:this.owner.getCenter(), rotation:this.owner.rotForward, speed:300});
        }
    } 

    /** */
    fire({pos:{x, y}, rotation, speed}){
        this.storedBullets -= 1;
        for(let i = 0; i < 3; i++){
            this.scene.spawnBullet(x,y, rotation-(1*Math.PI/8)+(i*Math.PI/8), speed, this.owner);
            this.scene.bulletSound.play();
        }
        this.sinceFired = 0;
    }

    canFire(){
        return this.storedBullets > 0 && this.sinceFired > this.fireCooldown;
    }
}