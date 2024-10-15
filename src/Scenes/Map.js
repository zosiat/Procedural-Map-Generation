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
    }

    create() {

        //readibility
        let my = this.my;

        //keys to reload and adjust scene
        this.reload = this.input.keyboard.addKey('R');
        this.shrink = this.input.keyboard.addKey('COMMA');
        this.grow = this.input.keyboard.addKey('PERIOD');

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

        //create tiles based on generated map data
        this.createTiles();

        //camera centered
        this.cameras.main.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
        this.cameras.main.centerOn(this.mapWidth * this.tileSize / 2, this.mapHeight * this.tileSize / 2);

        //instruction text
        document.getElementById('description').innerHTML = '<h2>Map.js</h2><br>R: Restart Scene (to randomize tiles)';
    }

    update() {
        //restart
        if (Phaser.Input.Keyboard.JustDown(this.reload)) {
            this.initPerlin(this.seedValue);
            this.scene.restart();
        }

        //increase scale
        if (Phaser.Input.Keyboard.JustDown(this.grow)) {
            this.scale += 0.1;
            console.log("increasing");
        }
        
        //decrease scale
        if (Phaser.Input.Keyboard.JustDown(this.shrink)) {
            this.scale = Math.max(0.1, this.scale - 0.01);
            console.log("decreasing");
        }
    }

    generateMap() {
        const scale = 0.08; //adjustable
        const seed = this.seed; //store seed
    
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const noiseValue = this.perlin2(x * scale + seed, y * scale + seed);
                
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
        this.mapData.forEach((row, y) => {
            row.forEach((terrain, x) => {
                this.add.image(x * this.tileSize, y * this.tileSize, terrain).setOrigin(0);
            });
        });
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