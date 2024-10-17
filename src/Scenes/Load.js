class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {

        this.load.setPath("./assets/");

        //load tilemap information
        //this.load.image("tilemap tiles", "mapPack_tilesheet.png");         // Packed tilemap
        this.load.image("grass", "grassTile.png");
        this.load.image("grass2", "grass2Tile.png");
        //this.load.image("sand", "sandTile.png");
        this.load.image("dirt", "dirtTile.png");
        this.load.image("dirt2", "dirt2Tile.png");
        this.load.image("water", "waterTile.png");
        this.load.image("water2", "water2Tile.png");
        this.load.image("stone", "stoneTile.png");
        this.load.image("playerSprite", "redCircle.png");

        this.load.image("horizontalRoad", "horizontalrd.png");
        this.load.image("verticalRoad", "verticalrd.png");
        this.load.image("intersection", "intersect.png");

    }

    create(){
        console.log("Assets preloaded");  // Debugging line
        this.scene.start("mapScene");
    }

    //empty because load never gets here
    update(){

    }
}