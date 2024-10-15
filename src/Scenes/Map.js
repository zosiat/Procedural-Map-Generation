class Map extends Phaser.Scene {
    constructor() {
        super("mapScene")
    }

    create() {
    this.reload = this.input.keyboard.addKey('R')



    }

    update() {
        // scene switching / restart
        if(Phaser.Input.Keyboard.JustDown(this.reload)) {
            this.scene.restart()
        }
    }
}