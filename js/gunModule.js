/*jshint esversion: 6 */

export class GunModule{
    constructor(maxBullets, fireCooldown, passiveRegenCooldown, owner){
        this.fireCooldown = fireCooldown*1000; // Convert to milliseconds
        this.passiveRegenCooldown = passiveRegenCooldown*1000;
        this.owner = owner;

        this.sinceFired = 0;
        this.sinceRegen = 0;
        this.storedBullets = maxBullets;
        this.maxBullets = maxBullets;
    }

    update(time, delta){
        this.sinceFired += delta;
        this.sinceRegen += delta;
        if(this.sinceRegen > this.passiveRegenCooldown && this.storedBullets < this.maxBullets){
            this.reload();
            this.sinceRegen = 0;
        }
    }

    reload(){
        this.storedBullets = Math.min(this.storedBullets+1, this.maxBullets);
    }

    canFire(){
        return this.storedBullets > 0 && this.sinceFired > this.sinceFired;
    }

    /** */
    fire(bulletSpawner){
        this.storedBullets -= 1;
        this.world.spawnBullet(this.getCenter().x, this.getCenter().y, this);
        this.sinceFired = 0;
    }
}

export class StandardGun extends GunModule{
    constructor(maxBullets, fireCooldown, passiveRegenCooldown, owner){ super(maxBullets, fireCooldown, passiveRegenCooldown, owner); }
    fire(bulletSpawner){

    }
}