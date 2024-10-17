class Map extends Phaser.Scene {
    constructor() {
        super("mapScene");
        
        //perlin noise setup
        this.perm = [];
        this.gradP = [];
        //randomizes the seed
        this.seedValue = Math.random(); 
        this.initPerlin(this.seedValue); 

        //setting the initial scale
        this.scale = 0.08;
        this.move = true;
    }

    create() {

        //readibility
        let my = this.my;

        //keys to reload and adjust scene
        this.reload = this.input.keyboard.addKey('R');
        this.shrink = this.input.keyboard.addKey('COMMA');
        this.grow = this.input.keyboard.addKey('PERIOD');
        this.cursors = this.input.keyboard.createCursorKeys();

        //tilemap dimensions (min 20 tiles wide, 15 tiles tall)
        this.mapWidth = 60;
        this.mapHeight = 45;
        this.tileSize = 16;

        //random seed
        this.seed = Math.random(); 

        //initialize map data
        this.mapData = [];

        //generate the map using perlin noise
        this.generateMap();

        //create tiles based on generated map
        this.createTiles();

        //create player
        this.createPlayer();

        //filter spawn points (non-water and non-water2 tiles)
        const validTiles = [];
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.mapData[y][x] !== "water" && this.mapData[y][x] !== "water2") {
                    validTiles.push({ x: x * this.tileSize, y: y * this.tileSize });
                }
            }
        }

        //random point not in water
        const randomIndex = Phaser.Math.Between(0, validTiles.length - 1);
        const spawnPoint = validTiles[randomIndex];

        //camera
        this.cameras.main.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
        this.cameras.main.centerOn(this.mapWidth * this.tileSize / 2, this.mapHeight * this.tileSize / 2);

        //instruction text
        document.getElementById('description').innerHTML = '<h2>Map.js</h2><br>R: Restart Scene (to randomize tiles)</h2><br><: Shrink Noise Window</h2><br>>: Expand Noise Window</h2><br>Arrow Keys: Movement';
    }

    update() {

        //movement logic
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160); //left
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160); //right
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160); //up
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160); //down
        } else {
            this.player.setVelocityY(0); 
        }

        //restart
        if (Phaser.Input.Keyboard.JustDown(this.reload)) {
            //clearing the seed
            this.initPerlin(this.seedValue);
            this.scene.restart();
        }

        //increase scale
        if (Phaser.Input.Keyboard.JustDown(this.grow)) {
            this.scale += 0.01;
            console.log("increasing scale to", this.scale);
            this.clearTiles();
            this.generateMap();
            this.createTiles();
            this.createPlayer();
        }
        
        //decrease scale
        if (Phaser.Input.Keyboard.JustDown(this.shrink)) {
            this.scale = Math.max(0.01, this.scale - 0.01);
            console.log("decreasing scale to", this.scale);
            this.clearTiles();
            this.generateMap();
            this.createTiles();
            this.createPlayer();
        }

        //reset scale if NaN
        if (isNaN(this.scale)) {
            console.error('Scale is NaN! Resetting to default.');
            this.scale = 0.08; //resets default
        }
    }

    generateMap() {
        const seed = this.seed; //store seed
    
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const noiseValue = this.perlin2(x * this.scale + seed, y * this.scale + seed);
                
                //assigning terrain type to noise values
                this.mapData[y][x] = 
                    noiseValue < -0.3 ? "water2" :
                    noiseValue < -0.2 ? "water" :
                    noiseValue < 0.05 ? "grass" : 
                    noiseValue < 0.3 ? "grass2" : 
                    noiseValue < 0.5 ? "dirt" : 
                    noiseValue < 0.7 ? "dirt2" : 
                    "stone";
            }
        }
    }
       
    createTiles() {
        //terrain layer
        this.terrainLayer = this.add.group();
        this.mapData.forEach((row, y) => {
            row.forEach((terrain, x) => {
                this.terrainLayer.create(x * this.tileSize, y * this.tileSize, terrain).setOrigin(0);
            });
        });
    
        //road layer
        this.roadLayer = this.add.group();
        this.mapData.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === 'horizontalRoad' || tile === 'verticalRoad' || tile === 'intersection') {
                    this.roadLayer.create(x * this.tileSize, y * this.tileSize, tile).setOrigin(0);
                }
            });
        });
    }

    clearTiles() {
        //clear tiles
        this.terrainLayer.clear(true, true); 
        this.roadLayer.clear(true, true); 
    }

    createPlayer() {
        // clear previous sprite
        if (this.player) {
            this.player.destroy();
        }
    
        //valid spawn points
        const validTiles = [];
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.mapData[y][x] !== "water" && this.mapData[y][x] !== "water2") {
                    validTiles.push({ x: x * this.tileSize, y: y * this.tileSize });
                }
            }
        }
    
        // Random point not in water
        const randomIndex = Phaser.Math.Between(0, validTiles.length - 1);
        const spawnPoint = validTiles[randomIndex];
    
        //create player
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'playerSprite');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2);
    }
    
    //adapted perlin noise function
    perlin2(x, y) {
        const [X, Y] = [Math.floor(x) & 255, Math.floor(y) & 255];
        const [fx, fy] = [x - X, y - Y];

        const n00 = this.gradP[X + this.perm[Y]].dot2(fx, fy);
        const n01 = this.gradP[X + this.perm[Y + 1]].dot2(fx, fy - 1);
        const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(fx - 1, fy);
        const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(fx - 1, fy - 1);

        const u = this.fade(fx);
        return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(fy));
    }

    //helper functions
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10); 
    }

    lerp(a, b, t) {
        return a + t * (b - a); 
    }

    initPerlin() {
        for (let i = 0; i < 256; i++) {
            this.perm[i] = i;
            this.gradP[i] = {dot2: (x, y) => { 
                const h = i % 4;
                const u = h < 2 ? x : y;
                const v = h === 1 || h === 2 ? x : y;
                return (h % 2 === 0 ? u : -u) + (h < 2 ? v : -v);
            }};
        }

        for (let i = 0; i < 256; i++) {
            const r = Math.floor(Math.random() * 256);
            [this.perm[i], this.perm[r]] = [this.perm[r], this.perm[i]];
        }

        for (let i = 0; i < 256; i++) {
            this.perm[256 + i] = this.perm[i];
            this.gradP[256 + i] = this.gradP[i];
        }
    }
}