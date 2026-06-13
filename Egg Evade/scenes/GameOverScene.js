export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create(data) {
    const finalScore = data.score || 0;
    const rescuedCount = data.rescued || 0;
    const { width, height } = this.scale;
    // Fondo negro para dar el efecto de Game Over
    this.cameras.main.setBackgroundColor("#000000");

    // Texto de "GAME OVER"
    const gameOverText = this.add.text(width / 2, height * 0.33, "GAME OVER", {
      fontSize: "64px",
      fontStyle: "bold",
      fill: "#ff0000",
      fontFamily: "Arial",
      stroke: "#880000",
      strokeThickness: 3,
    });
    gameOverText.setOrigin(0.5, 0.5);

    // Etiqueta de puntuación obtenida
    const scoreText = this.add.text(width / 2, height * 0.4, `Puntuación final: ${finalScore}`, {
      fontSize: "26px",
      fill: "#ffffff",
      fontFamily: "Arial",
    });
    scoreText.setOrigin(0.5, 0.5);

    // Contador de ciudadanos rescatados
    const rescuedText = this.add.text(width / 2, height * 0.5, `Ciudadanos rescatados: ${rescuedCount}`, {
      fontSize: "26px",
      fill: "#ffff00", 
      fontFamily: "Arial",
    });
    rescuedText.setOrigin(0.5, 0.5);

    // Botón para volver al menú
    const menuButton = this.add.rectangle(width / 2, height * 0.67, 300, 60, 0xffffff);
    menuButton.setInteractive();

    // Texto del botón
    const menuText = this.add.text(width / 2, height * 0.67, "Volver al Menú", {
      fontSize: "28px",
      fontStyle: "bold",
      fill: "#000000",
      fontFamily: "Arial",
    });
    menuText.setOrigin(0.5, 0.5);
    menuText.setInteractive();

    // Eventos visuales para el botón (hover)
    menuButton.on("pointerover", () => {
      menuButton.setScale(1.1);
      menuButton.setFillStyle(0xdddddd);
    });

    menuButton.on("pointerout", () => {
      menuButton.setScale(1);
      menuButton.setFillStyle(0xffffff);
    });

    // Acción al hacer clic en el botón o en el texto
    const returnToMenu = () => {
      this.scene.start("title");
    };

    menuButton.on("pointerup", returnToMenu);
    menuText.on("pointerup", returnToMenu);

    // Fallback para teclado (tecla Enter)
    this.input.keyboard.on("keydown-ENTER", returnToMenu);
  }
}