/*jshint esversion: 6 */

class GunModule{
    constructor(maxBullets, fireCooldown, passiveRegenCooldown, owner){
        this.fireCooldown = fireCooldown*1000; // Convert to milliseconds
        this.passiveRegenCooldown = passiveRegenCooldown*1000;
        this.owner = owner;

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

    holdTrigger(){
        this.triggered = true;
    }
    reload(){
        this.storedBullets = Math.min(this.storedBullets+1, this.maxBullets);
    }
}

export class StandardGun extends GunModule{
    constructor(maxBullets, fireCooldown, passiveRegenCooldown, owner){ super(maxBullets, fireCooldown, passiveRegenCooldown, owner); }

    holdTrigger(){
        if(this.canFire()){
            this.fire({pos: this.owner.getCenter(), rotation: this.owner.rotation-Math.Pi/2, speed: 300,})
        }
    }
        // if(this.gunModule.canFire() && this.fire.isDown){
        //     this.gunModule.fire({pos: this.getCenter(), rotation:this.rotation-Math.PI/2, speed:300, spawner: this.spawner });
        //     this.world.bulletSound.play();
        // }
    /** */
    fire({pos:{x, y}, rotation, speed, spawner: spawner}){
        this.storedBullets -= 1;
        spawner(x, y, rotation, speed, this.owner);
        this.sinceFired = 0;
    }
    canFire(){
        return this.storedBullets > 0 && this.sinceFired > this.fireCooldown;
    }
}

export class TriGun extends GunModule{
    constructor(maxBullets, fireCooldown, passiveRegenCooldown, owner){ super(maxBullets, fireCooldown, passiveRegenCooldown, owner); }
    /** */
    fire({pos:{x, y}, rotation, speed, spawner: spawner}){
        this.storedBullets -= 1;
        for(let i = 0; i < 3; i++){
            spawner(x, y, rotation-(1*Math.PI/8)+(i*Math.PI/8), speed, this.owner);
        }
        
        this.sinceFired = 0;
    }
    canFire(){
        return this.storedBullets > 0 && this.sinceFired > this.fireCooldown;
    }
}