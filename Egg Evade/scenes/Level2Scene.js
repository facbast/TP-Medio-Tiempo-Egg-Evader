export default class Level2Scene extends Phaser.Scene {
  constructor() {
    super("level2");
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
    menuRect.on('pointerup', () => { this.goToMainMenu(); });
    this.pauseContainer = this.add.container(0, 0, [bg, box, title, resumeRect, resumeText, menuRect, menuText]);
    this.pauseContainer.setDepth(1000).setVisible(false);
  }

  togglePause() {
    if (this.levelComplete) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.world.pause(); this.time.timeScale = 0; this.pauseContainer.setVisible(true);
    } else this.resumeGame();
  }

  resumeGame() { this.isPaused = false; this.physics.world.resume(); this.time.timeScale = 1; this.pauseContainer.setVisible(false); }
  goToMainMenu() { this.physics.world.resume(); this.time.timeScale = 1; this.scene.start('title'); }

  onLevelComplete() {
    if (this.levelComplete) return;
    this.levelComplete = true; this.isPaused = true; this.physics.world.pause(); this.time.timeScale = 0;
    const winBg = this.add.rectangle(400, 300, 600, 200, 0x000000, 0.7).setDepth(1001);
    this.add.text(400, 280, '¡Nivel completado!', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5).setDepth(1001);
    this.enterKey.off('down').on('down', () => {
      this.physics.world.resume(); this.time.timeScale = 1;
      this.scene.start('level3', { score: this.score, health: this.health, lives: this.lives, rescued: this.rescuedCitizens });
    });
  }

  init(data) {
    this.health = (data && data.health !== undefined) ? data.health : 3;
    this.score = (data && data.score !== undefined) ? data.score : 0;
    this.lives = (data && data.lives !== undefined) ? data.lives : 3;
    this.rescuedCitizens = (data && data.rescued !== undefined) ? data.rescued : 0;
    this.nextHealthScoreThreshold = (Math.floor(this.score / 10000) + 1) * 10000;
    this.levelTime = 120000; this.isPaused = false; this.levelComplete = false;
    this.currentEggDelay = 5000; this.currentEggSpeed = 150; this.hearts = []; this.lastHitTime = 0; this.damageCooldown = 1000;
  }

  dibujarVidas() {
    this.hearts.forEach(h => h.destroy()); this.hearts = [];
    for (let i = 0; i < Math.max(this.health, 3); i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(i < this.health ? 0xFF0000 : 0x888888, 1); g.fillCircle(4, 4, 4); g.fillCircle(10, 4, 4); g.fillTriangleShape([{x:2,y:8},{x:12,y:8},{x:7,y:14}]);
      g.generateTexture(`heart-l2-${i}`, 14, 14); g.destroy();
      this.hearts.push(this.add.image(25 + (i * 35), 25, `heart-l2-${i}`).setScrollFactor(0));
    }
  }

  perderVida() {
    if (this.health > 0) { this.health--; this.dibujarVidas(); }
    if (this.health <= 0) {
      this.lives--; if (this.livesText) this.livesText.setText(`Vidas: ${this.lives}`);
      if (this.lives > 0) { this.health = 3; this.dibujarVidas(); }
      else this.scene.start('game-over', { score: this.score, rescued: this.rescuedCitizens });
    }
  }

  cambiarPuntaje(p) {
    this.score = Math.max(0, this.score + p); if (this.scoreText) this.scoreText.setText(`Puntaje: ${this.score}`);
    while (this.score >= this.nextHealthScoreThreshold) { this.health++; this.dibujarVidas(); this.nextHealthScoreThreshold += 10000; }
  }

  spawnEgg() {
    const x = Phaser.Math.Between(50, 750);
    const egg = this.eggs.create(x, -20, 'egg-texture');
    egg.setVelocityY(this.currentEggSpeed).setBounce(0.3); egg.birthTime = this.time.now;
    this.time.delayedCall(this.currentEggDelay, this.spawnEgg, [], this);
  }

  spawnCitizen() {
    const p = Phaser.Utils.Array.GetRandom(this.platforms.getChildren());
    const c = this.citizens.create(p.x, p.y - 30, null);
    const g = this.make.graphics({x:0,y:0,add:false}); g.fillStyle(0xFFFF00, 1); g.fillRect(0,0,24,24); g.generateTexture('cit-l2',24,24); g.destroy();
    c.setTexture('cit-l2').setDisplaySize(24,24).setImmovable(true); if (c.body) c.body.setAllowGravity(false);
  }

  transformarEnPollo(egg) {
    const chick = this.chickens.create(egg.x, egg.y, null);
    const g = this.make.graphics({x:0,y:0,add:false}); g.fillStyle(0xFF0000,1); g.fillTriangle(10,0,0,16,20,16); g.generateTexture('ch-l2',20,16); g.destroy();
    chick.setTexture('ch-l2').setVelocityX(120).setCollideWorldBounds(true).direction = 1; egg.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor('#DDEEFF');
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 590, null).setDisplaySize(800, 40).refreshBody(); this.add.rectangle(400, 590, 800, 40, 0x228B22);
    [[120,480,180],[320,420,160],[520,360,140],[720,300,160],[480,220,200]].forEach(p => {
      this.platforms.create(p[0],p[1],null).setDisplaySize(p[2],30).refreshBody(); this.add.rectangle(p[0],p[1],p[2],30,0x00FF00);
    });

    this.player = this.physics.add.sprite(100, 540, null);
    const g = this.make.graphics({x:0,y:0,add:false}); g.fillStyle(0x0000FF,1); g.fillRect(0,0,30,30); g.generateTexture('p-l2',30,30); g.destroy();
    this.player.setTexture('p-l2').setCollideWorldBounds(true).setBounce(0.2);
    this.physics.add.collider(this.player, this.platforms);

    this.citizens = this.physics.add.group(); this.eggs = this.physics.add.group(); this.chickens = this.physics.add.group();
    this.physics.add.collider(this.eggs, this.platforms, e => e.isOnGround = true);
    this.physics.add.overlap(this.player, this.eggs, (p, e) => { if (p.body.touching.down && e.body.touching.up) { e.destroy(); this.cambiarPuntaje(500); } else if (!e.isOnGround) this.aplicarDaño(); });
    this.physics.add.overlap(this.player, this.chickens, (p, c) => { if (p.body.touching.down && c.body.touching.up) c.destroy(); else this.aplicarDaño(); });
    this.physics.add.collider(this.chickens, this.platforms, c => { if (c.body.blocked.left || c.body.blocked.right) { c.direction *= -1; c.setVelocityX(120 * c.direction); } });

    this.scoreText = this.add.text(780, 20, `Puntaje: ${this.score}`, { fontSize: '18px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(1, 0).setScrollFactor(0);
    this.levelTimerText = this.add.text(400, 10, '02:00', { fontSize: '22px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5, 0).setScrollFactor(0);
    this.livesText = this.add.text(20, 45, `Vidas: ${this.lives}`, { fontSize: '18px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setScrollFactor(0);

    this.createPauseUI(); this.enterKey = this.input.keyboard.addKey('ENTER').on('down', () => this.togglePause());
    this.spawnEgg();
    this.time.addEvent({ delay: 10000, callback: () => { this.currentEggDelay = Math.max(1000, this.currentEggDelay - 500); this.currentEggSpeed = Math.min(450, this.currentEggSpeed + 25); }, loop: true });
    this.time.addEvent({ delay: 20000, callback: this.spawnCitizen, callbackScope: this, loop: true });
    this.cursors = this.input.keyboard.createCursorKeys(); this.zKey = this.input.keyboard.addKey('Z'); this.sKey = this.input.keyboard.addKey('S');
    this.dibujarVidas();
  }

  aplicarDaño() {
    if (this.time.now - this.lastHitTime < this.damageCooldown) return;
    this.lastHitTime = this.time.now; this.player.setAlpha(0.5); this.perderVida();
  }

  update(t, d) {
    if (this.isPaused) return;
    if (!this.levelComplete && this.levelTime > 0) {
      this.levelTime -= d; if (this.levelTime <= 0) this.onLevelComplete();
      else { const s = Math.ceil(this.levelTime/1000); this.levelTimerText.setText(`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`); }
    }
    if (this.cursors.left.isDown) this.player.setVelocityX(-200); else if (this.cursors.right.isDown) this.player.setVelocityX(200); else this.player.setVelocityX(0);
    if (this.zKey.isDown && this.player.body.touching.down) this.player.setVelocityY(-350);
    this.eggs.getChildren().forEach(e => { if (e && this.time.now - e.birthTime >= 10000) this.transformarEnPollo(e); });
    if (this.time.now - this.lastHitTime >= this.damageCooldown) this.player.setAlpha(1);
  }
}