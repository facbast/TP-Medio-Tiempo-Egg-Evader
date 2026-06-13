import HelloWorldScene from "./scenes/Level1Scene.js";
import TitleScene from "./scenes/TitleScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import Level2Scene from "./scenes/Level2Scene.js";
import Level3Scene from "./scenes/Level3Scene.js";


// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: true,
    },
  },
  // List of scenes to load
  // Only the first scene will be shown
  // Remember to import the scene before adding it to the list
  scene: [TitleScene, HelloWorldScene, Level2Scene, Level3Scene, GameOverScene],
};

// Create a new Phaser game instance
window.game = new Phaser.Game(config);
