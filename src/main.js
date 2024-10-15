// Zosia Trela
// Created: 10/14/2024
// Phaser: 3.70.0
//
// PCG Map
//
//Adapted from Nathan Altice's Mappy Examples

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 960,
    height: 720,
    //add more scenes here
    scene: [Load, Map]
}

const game = new Phaser.Game(config);