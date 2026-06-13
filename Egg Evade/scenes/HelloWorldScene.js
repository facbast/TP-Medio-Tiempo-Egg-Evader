export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  createPauseUI() {
    const bg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);
    const box = this.add.rectangle(400, 300, 400, 260, 0x222222, 0.95);
    const title = this.add.text(400, 240, 'PAUSA', { fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5, 0.5);

    const resumeRect = this.add.rectangle(400, 320, 220, 50, 0x00aa00).setInteractive();
    const resumeText = this.add.text(400, 320, 'Volver al juego', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);

    const menuRect = this.add.rectangle(400, 390, 220, 50, 0xaa0000).setInteractive();
    const menuText = this.add.text(400, 390, 'Menu Principal', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);

    resumeRect.on('pointerup', () => { this.resumeGame(); });
    resumeText.on('pointerup', () => { this.resumeGame(); });
    menuRect.on('pointerup', () => { this.goToMainMenu(); });
    menuText.on('pointerup', () => { this.goToMainMenu(); });

    this.pauseContainer = this.add.container(0, 0, [bg, box, title, resumeRect, resumeText, menuRect, menuText]);
    this.pauseContainer.setDepth(1000);
    this.pauseContainer.setVisible(false);
  }

  togglePause() {
    if (this.levelComplete) return;
    if (!this.isPaused) {
      this.isPaused = true;
      if (this.physics && this.physics.world) this.physics.world.pause();
      if (this.time) this.time.timeScale = 0;
      this.pauseContainer.setVisible(true);
    } else {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.isPaused = false;
    if (this.physics && this.physics.world) this.physics.world.resume();
    if (this.time) this.time.timeScale = 1;
    this.pauseContainer.setVisible(false);
  }

  goToMainMenu() {
    if (this.physics && this.physics.world) this.physics.world.resume();
    if (this.time) this.time.timeScale = 1;
    this.scene.start('title');
  }

  onLevelComplete() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.isPaused = true;
    if (this.physics && this.physics.world) this.physics.world.pause();
    if (this.time) this.time.timeScale = 0;

    const winBg = this.add.rectangle(400, 300, 600, 200, 0x000000, 0.7).setDepth(1001);
    const winText = this.add.text(400, 280, '¡Nivel completado!', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5).setDepth(1001);
    const contText = this.add.text(400, 340, 'Presiona ENTER para volver al menú', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5).setDepth(1001);

    this.enterKey.off('down');
    this.enterKey.on('down', () => { 
      if (this.physics && this.physics.world) this.physics.world.resume();
      if (this.time) this.time.timeScale = 1;
      this.scene.start('level2', { 
        score: this.score, 
        health: this.health, 
        lives: this.lives,
        rescued: this.rescuedCitizens 
      });
    });
  }

  init() {
    this.player = null;
    this.platforms = null;
    this.cursors = null;
    this.zKey = null;
    this.canJump = true;
    this.health = 3;
    this.hearts = [];
    this.eggs = null;
    this.chickens = null;
    this.citizens = null;
    this.nextEggWarning = null;
    this.nextEggX = null;
    this.lastHitTime = 0;
    this.damageCooldown = 1000;
    this.score = 0;
    this.nextHealthScoreThreshold = 10000;
    this.sKey = null;
    this.rescuedCitizens = 0;
    this.isPaused = false;
    this.lives = 3;
    this.levelTime = 60000;
    this.levelComplete = false;
    this.currentEggDelay = 5000;
    this.currentEggSpeed = 150;
  }

  dibujarVidas() {
    this.hearts.forEach(heart => heart.destroy());
    this.hearts = [];
    const totalHearts = Math.max(this.health, 3);
    for (let i = 0; i < totalHearts; i++) {
      const x = 25 + (i * 35);
      const y = 25;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      if (i < this.health) graphics.fillStyle(0xFF0000, 1); else graphics.fillStyle(0x888888, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.fillCircle(10, 4, 4);
      graphics.fillTriangleShape([{ x: 2, y: 8 }, { x: 12, y: 8 }, { x: 7, y: 14 }]);
      graphics.generateTexture(`heart-${i}`, 14, 14);
      graphics.destroy();
      const heart = this.add.image(x, y, `heart-${i}`);
      heart.setOrigin(0.5, 0.5);
      heart.setScrollFactor(0);
      this.hearts.push(heart);
    }
  }

  perderVida() {
    if (this.health > 0) { this.health--; this.dibujarVidas(); }
    if (this.health <= 0) {
      this.lives--;
      if (this.livesText) this.livesText.setText(`Vidas: ${this.lives}`);
      if (this.lives > 0) { this.health = 3; this.dibujarVidas(); }
      else { this.scene.start("game-over", { score: this.score, rescued: this.rescuedCitizens }); }
    }
  }

  aplicarDaño() {
    const now = this.time.now;
    if (now - this.lastHitTime < this.damageCooldown) return false;
    this.lastHitTime = now;
    this.player.setAlpha(0.5);
    this.perderVida();
    return true;
  }

  cambiarPuntaje(puntos) {
    this.score += puntos;
    this.scoreText.setText(`Puntaje: ${this.score}`);
    while (this.score >= this.nextHealthScoreThreshold) {
      this.health++;
      this.dibujarVidas();
      this.nextHealthScoreThreshold += 10000;
    }
  }

  spawnEgg() {
    const spawnX = this.nextEggX !== null ? this.nextEggX : Phaser.Math.Between(50, 750);
    this.nextEggX = null;
    if (this.nextEggWarning) this.nextEggWarning.setVisible(false);
    const egg = this.eggs.create(spawnX, -20, null);
    const eggTextureKey = "egg-texture";
    const eggW = 16, eggH = 16;
    const eggGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    eggGraphics.fillStyle(0xFF0000, 1); eggGraphics.fillCircle(8, 8, 8);
    eggGraphics.generateTexture(eggTextureKey, eggW, eggH); eggGraphics.destroy();
    egg.setTexture(eggTextureKey); egg.setOrigin(0.5, 0.5); egg.setDisplaySize(eggW, eggH);
    if (egg.body) { egg.body.setSize(eggW, eggH); egg.body.setOffset(0, 0); }
    egg.setVelocityY(this.currentEggSpeed); egg.setBounce(0.3); egg.isOnGround = false; egg.birthTime = this.time.now;
    this.showNextEggWarning();
    this.time.delayedCall(this.currentEggDelay, this.spawnEgg, [], this);
  }

  showNextEggWarning() {
    const warningX = Phaser.Math.Between(50, 750);
    this.nextEggX = warningX;
    if (!this.nextEggWarning) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xFFFF00, 1); graphics.fillRect(0, 0, 20, 20);
      graphics.fillStyle(0x000000, 1); graphics.fillRect(9, 4, 2, 9); graphics.fillCircle(10, 16, 2);
      graphics.generateTexture("warning-icon", 20, 20); graphics.destroy();
      this.nextEggWarning = this.add.image(warningX, 60, "warning-icon");
      this.nextEggWarning.setOrigin(0.5, 0.5); this.nextEggWarning.setScrollFactor(0); this.nextEggWarning.setDepth(10);
    } else { this.nextEggWarning.setPosition(warningX, 60); this.nextEggWarning.setVisible(true); }
  }

  manejarColisionEggJugador(jugador, egg) {
    if (jugador.body.touching.down && egg.body.touching.up) { egg.destroy(); this.cambiarPuntaje(500); }
    else if (!egg.isOnGround) { this.aplicarDaño(); }
  }

  spawnCitizen() {
    const plats = this.platforms.getChildren();
    if (plats.length === 0) return;
    const platform = Phaser.Utils.Array.GetRandom(plats);
    const citizen = this.citizens.create(platform.x, platform.y - 30, "citizen-texture");
    citizen.setOrigin(0.5, 0.5); citizen.setDisplaySize(24, 24);
    if (citizen.body) { citizen.body.setSize(24, 24); citizen.body.setAllowGravity(false); }
    citizen.setImmovable(true);
  }

  transformarEnPollo(egg) {
    const chickW = 20, chickH = 16;
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xFF0000, 1); graphics.fillTriangle(10, 0, 0, 16, 20, 16);
    graphics.generateTexture("chicken-texture", chickW, chickH); graphics.destroy();
    const chicken = this.chickens.create(egg.x, egg.y, "chicken-texture");
    chicken.setOrigin(0.5, 0.5); chicken.setDisplaySize(chickW, chickH);
    if (chicken.body) chicken.body.setSize(chickW, chickH);
    chicken.direction = 1; chicken.setVelocityX(120); chicken.setCollideWorldBounds(true); chicken.body.onWorldBounds = true;
    egg.destroy();
  }

  manejarColisionPollo(chicken) {
    if (chicken.body.blocked.left || chicken.body.blocked.right) {
      chicken.direction *= -1; chicken.setVelocityX(120 * chicken.direction);
    }
  }

  manejarColisionChickenJugador(jugador, chicken) {
    if (jugador.body.touching.down && chicken.body.touching.up) { chicken.destroy(); return; }
    this.aplicarDaño();
  }

  create() {
    this.cameras.main.setBackgroundColor("#87CEEB");
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 590, null).setDisplaySize(800, 40).refreshBody();
    this.add.rectangle(400, 590, 800, 40, 0x228B22);
    [ [150,480,200],[400,400,200],[650,480,200],[400,300,200],[150,200,200],[650,200,200] ].forEach(p => {
      this.platforms.create(p[0], p[1], null).setDisplaySize(p[2], 30).refreshBody();
      this.add.rectangle(p[0], p[1], p[2], 30, 0x00FF00);
    });

    this.player = this.physics.add.sprite(400, 550, null);
    const pG = this.make.graphics({ x: 0, y: 0, add: false }); pG.fillStyle(0x0000FF, 1); pG.fillRect(0, 0, 30, 30); pG.generateTexture("player-texture", 30, 30); pG.destroy();
    this.player.setTexture("player-texture").setCollideWorldBounds(true).setBounce(0.2);
    this.physics.add.collider(this.player, this.platforms);

    this.citizens = this.physics.add.group({ allowGravity: false, immovable: true });
    const cG = this.make.graphics({ x: 0, y: 0, add: false }); cG.fillStyle(0xFFFF00, 1); cG.fillRect(0, 0, 24, 24); cG.generateTexture("citizen-texture", 24, 24); cG.destroy();

    this.savePromptText = this.add.text(400, 560, "", { fontSize: "18px", fill: "#ffffff", fontFamily: "Arial" }).setOrigin(0.5, 0.5).setScrollFactor(0);
    this.scoreText = this.add.text(780, 20, "Puntaje: 0", { fontSize: "18px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 3 }).setOrigin(1, 0).setScrollFactor(0);
    this.levelTimerText = this.add.text(400, 10, "01:00", { fontSize: "22px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 3 }).setOrigin(0.5, 0).setScrollFactor(0);

    this.createPauseUI();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on('down', () => this.togglePause());

    this.eggs = this.physics.add.group();
    this.physics.add.collider(this.eggs, this.platforms, egg => egg.isOnGround = true);
    this.physics.add.overlap(this.player, this.eggs, this.manejarColisionEggJugador, null, this);

    this.chickens = this.physics.add.group();
    this.physics.add.collider(this.chickens, this.platforms, (c) => {
      if (this.time.now - c.flipCooldown > 100) {
        if (c.body.blocked.left || c.body.blocked.right) { c.direction *= -1; c.setVelocityX(120 * c.direction); c.flipCooldown = this.time.now; }
      }
    });
    this.physics.add.overlap(this.player, this.chickens, this.manejarColisionChickenJugador, null, this);
    this.physics.add.overlap(this.eggs, this.citizens, (e, c) => { e.destroy(); c.destroy(); this.cambiarPuntaje(-500); });

    this.spawnEgg();
    this.time.addEvent({ delay: 10000, callback: () => { this.currentEggDelay = Math.max(1000, this.currentEggDelay - 500); this.currentEggSpeed = Math.min(450, this.currentEggSpeed + 25); }, loop: true });
    this.time.addEvent({ delay: 20000, callback: this.spawnCitizen, callbackScope: this, loop: true });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.dibujarVidas();
    this.livesText = this.add.text(20, 45, `Vidas: ${this.lives}`, { fontSize: "18px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 3 }).setScrollFactor(0);
  }

  update(time, delta) {
    if (this.isPaused) return;
    if (!this.levelComplete && this.levelTime > 0) {
      this.levelTime -= delta;
      if (this.levelTime <= 0) { this.levelTime = 0; this.onLevelComplete(); }
      else {
        const sec = Math.ceil(this.levelTime / 1000);
        this.levelTimerText.setText(`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`);
      }
    }
    if (this.cursors.left.isDown) this.player.setVelocityX(-200); else if (this.cursors.right.isDown) this.player.setVelocityX(200); else this.player.setVelocityX(0);
    if (this.zKey.isDown && this.player.body.touching.down && this.canJump) { this.player.setVelocityY(-350); this.canJump = false; }
    if (!this.zKey.isDown) this.canJump = true;

    let near = null;
    this.citizens.getChildren().forEach(c => { if (Phaser.Math.Distance.Between(c.x, c.y, this.player.x, this.player.y) < 40) near = c; });
    if (near) {
      this.savePromptText.setText("Presiona S para salvar al ciudadano");
      if (Phaser.Input.Keyboard.JustDown(this.sKey)) { near.destroy(); this.rescuedCitizens++; this.cambiarPuntaje(2000); }
    } else this.savePromptText.setText("");

    this.eggs.getChildren().forEach(e => { if (e && this.time.now - e.birthTime >= 10000) this.transformarEnPollo(e); });
    if (this.time.now - this.lastHitTime >= this.damageCooldown) this.player.setAlpha(1);
  }
}