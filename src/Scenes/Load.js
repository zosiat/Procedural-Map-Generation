class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {

        this.load.setPath("./assets/");

        // Load tilemap information
        //this.load.image("tilemap tiles", "tilemap_packed.png");         // Packed tilemap

        //this.load.tilemapTiledJSON("Azure Level", "Azure Level.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap sheet", "tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

   
    }
}