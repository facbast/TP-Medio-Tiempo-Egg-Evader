export default class TitleScene extends Phaser.Scene {
  constructor() {
    super("title");
  }

  preload() {
    // Cargar assets para la pantalla de título si es necesario
  }

  create() {
    // Fondo gradiente o color sólido
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // Título del juego - "EGG EVADE"
    const title = this.add.text(400, 150, "EGG EVADE", {
      fontSize: "72px",
      fontStyle: "bold",
      fill: "#00ff00",
      fontFamily: "Arial",
      stroke: "#00cc00",
      strokeThickness: 3,
    });
    title.setOrigin(0.5, 0.5);

    // Subtítulo
    const subtitle = this.add.text(400, 250, "Esquiva los Huevos", {
      fontSize: "24px",
      fill: "#ffffff",
      fontFamily: "Arial",
    });
    subtitle.setOrigin(0.5, 0.5);

    // Botón de Jugar con mejor configuración interactiva
    const playButton = this.add.rectangle(400, 400, 200, 60, 0x00ff00);
    playButton.setInteractive();

    // Texto del botón
    const playText = this.add.text(400, 400, "JUGAR", {
      fontSize: "32px",
      fontStyle: "bold",
      fill: "#000000",
      fontFamily: "Arial",
    });
    playText.setOrigin(0.5, 0.5);
    playText.setInteractive();

    // Eventos del botón
    playButton.on("pointerover", () => {
      playButton.setScale(1.1);
      playButton.setFillStyle(0x00dd00);
    });

    playButton.on("pointerout", () => {
      playButton.setScale(1);
      playButton.setFillStyle(0x00ff00);
    });

    playButton.on("pointerup", () => {
      this.startGame();
    });

    // Evento de clic en el texto también
    playText.on("pointerup", () => {
      this.startGame();
    });

    // Instrucciones adicionales (opcional)
    const instructions = this.add.text(400, 550, "Presiona JUGAR o ENTER para comenzar", {
      fontSize: "16px",
      fill: "#888888",
      fontFamily: "Arial",
      align: "center",
    });
    instructions.setOrigin(0.5, 0.5);

    // Agregar evento de teclado como fallback
    this.input.keyboard.on("keydown-ENTER", () => {
      this.startGame();
    });
  }

  startGame() {
    this.scene.start("hello-world");
  }

  update() {
    // Lógica de actualización si es necesaria
  }
}
