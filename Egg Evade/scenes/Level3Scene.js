export default class Level3Scene extends Phaser.Scene {
  constructor() {
    super("level3");
  }

  createPauseUI() {
    const bg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);
    const box = this.add.rectangle(400, 300, 400, 260, 0x222222, 0.95);
    const resumeRect = this.add.rectangle(400, 320, 220, 50, 0x00aa00).setInteractive();
    const resumeText = this.add.text(400, 320, 'Volver al juego', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);
    const menuRect = this.add.rectangle(400, 390, 220, 50, 0xaa0000).setInteractive();
    const menuText = this.add.text(400, 390, 'Menu Principal', { fontSize: '20px', fill: '#000000' }).setOrigin(0.5);
    
    resumeRect.on('pointerup', () => this.resumeGame()); 
    menuRect.on('pointerup', () => this.goToMainMenu());

    this.pauseContainer = this.add.container(0, 0, [
      bg, box, resumeRect, resumeText, menuRect, menuText
    ]);
    this.pauseContainer.setDepth(1000).setVisible(false);
  }

  togglePause() {
    if (this.levelComplete) return; this.isPaused = !this.isPaused;
    if (this.isPaused) { this.physics.world.pause(); this.time.timeScale = 0; this.pauseContainer.setVisible(true); }
    else this.resumeGame();
  }

  resumeGame() { 
    this.isPaused = false; 
    this.physics.world.resume(); 
    this.time.timeScale = 1; 
    this.pauseContainer.setVisible(false); 
  }

  goToMainMenu() { 
    this.physics.world.resume(); 
    this.time.timeScale = 1; 
    this.scene.start('title'); 
  }

  onLevelComplete() {
    if (this.levelComplete) return; 
    this.levelComplete = true; 
    this.isPaused = true; 
    this.physics.world.pause(); 
    this.time.timeScale = 0;
    const bg = this.add.rectangle(400, 300, 640, 480, 0x000000, 0.85).setDepth(1001);
    this.add.text(400, 130, '¡JUEGO COMPLETADO!', { fontSize: '42px', fill: '#ffff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(1001);
    this.add.text(400, 190, `Puntuación final: ${this.score}`, { fontSize: '26px', fill: '#fff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(1001);
    this.add.text(400, 240, `Ciudadanos rescatados: ${this.rescuedCitizens}`, { fontSize: '26px', fill: '#ffff00', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(1001);
    this.add.text(400, 290, `Vidas restantes: ${this.lives}`, { fontSize: '26px', fill: '#ff3333', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(1001);

    // Botón Jugar de Nuevo
    const restartBtn = this.add.rectangle(280, 420, 220, 50, 0x00ff00).setInteractive().setDepth(1001);
    this.add.text(280, 420, 'REINTENTAR', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1001);

    // Botón Menú Principal
    const menuBtn = this.add.rectangle(520, 420, 220, 50, 0xffffff).setInteractive().setDepth(1001);
    this.add.text(520, 420, 'MENÚ PRINCIPAL', { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1001);

    // Eventos de los botones
    restartBtn.on('pointerup', () => {
      if (this.physics && this.physics.world) this.physics.world.resume();
      if (this.time) this.time.timeScale = 1;
      this.scene.start('hello-world'); 
    });

    menuBtn.on('pointerup', () => {
      if (this.physics && this.physics.world) this.physics.world.resume();
      if (this.time) this.time.timeScale = 1;
      this.scene.start('title');
    });
  }

  init(data) {
    this.health = data?.health ?? 3; this.score = data?.score ?? 0; this.lives = data?.lives ?? 3;
    this.rescuedCitizens = data?.rescued ?? 0; this.levelTime = 180000; this.currentEggDelay = 5000; this.currentEggSpeed = 150;
  }

  spawnMiniboss(x, y) {
    const boss = this.add.triangle(x, y, 0, 90, 45, 0, 90, 90, 0x800080);
    this.physics.add.existing(boss); this.minibosses.add(boss);
    boss.body.setSize(90, 90).setCollideWorldBounds(true);
    boss.health = 5; boss.isInvulnerable = false; boss.direction = 1; boss.body.setVelocityX(100);
  }

  damageMiniboss(boss) {
    boss.health--; boss.isInvulnerable = true;
    if (boss.health <= 0) { boss.destroy(); this.score += 5000; }
    else {
      this.tweens.add({ targets: boss, alpha: 0.2, yoyo: true, repeat: 5, duration: 150, onComplete: () => { if (boss.active) { boss.alpha = 1; boss.isInvulnerable = false; } } });
    }
  }

  handleMinibossCollision(player, boss) {
    if (player.body.touching.down && boss.body.touching.up) { player.setVelocityY(-400); if (!boss.isInvulnerable) this.damageMiniboss(boss); }
    else if (!boss.isInvulnerable) this.aplicarDaño();
  }

  create() {
    this.cameras.main.setBackgroundColor('#FFE0CC');
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 590, null).setDisplaySize(800, 40).refreshBody(); this.add.rectangle(400, 590, 800, 40, 0x228B22);
    [[100,520,140],[300,460,130],[500,400,140],[700,460,130],[200,340,120],[600,280,120],[400,200,150]].forEach(p => {
      this.platforms.create(p[0],p[1],null).setDisplaySize(p[2],25).refreshBody(); this.add.rectangle(p[0],p[1],p[2],25,0x00FF00);
    });

    this.player = this.physics.add.sprite(50, 540, null);
    const g = this.make.graphics({x:0,y:0,add:false}); g.fillStyle(0x0000FF,1); g.fillRect(0,0,30,30); g.generateTexture('p-l3',30,30); g.destroy();
    this.player.setTexture('p-l3').setCollideWorldBounds(true); this.physics.add.collider(this.player, this.platforms);

    this.minibosses = this.physics.add.group(); this.physics.add.collider(this.minibosses, this.platforms);
    this.physics.add.collider(this.player, this.minibosses, (p, b) => this.handleMinibossCollision(p, b));

    this.scoreText = this.add.text(780, 20, `Puntaje: ${this.score}`, { fontSize: '18px', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setScrollFactor(0);
    this.levelTimerText = this.add.text(400, 10, '03:00', { fontSize: '22px', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5, 0).setScrollFactor(0);
    this.livesText = this.add.text(20, 45, `Vidas: ${this.lives}`, { fontSize: '18px', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setScrollFactor(0);

    this.spawnMiniboss(400, 100);
    this.time.addEvent({ delay: 60000, callback: () => this.spawnMiniboss(150, 100), loop: false });
    this.time.addEvent({ delay: 120000, callback: () => this.spawnMiniboss(650, 100), loop: false });

    this.eggs = this.physics.add.group(); this.chickens = this.physics.add.group(); this.citizens = this.physics.add.group();
    this.spawnEgg();
    this.time.addEvent({ delay: 10000, callback: () => { this.currentEggDelay = Math.max(1000, this.currentEggDelay - 500); this.currentEggSpeed = Math.min(450, this.currentEggSpeed + 25); }, loop: true });
    this.cursors = this.input.keyboard.createCursorKeys(); this.zKey = this.input.keyboard.addKey('Z'); this.sKey = this.input.keyboard.addKey('S');
    this.createPauseUI(); this.input.keyboard.addKey('ENTER').on('down', () => this.togglePause());
  }

  aplicarDaño() {
    if (this.time.now - this.lastHitTime < 1000) return;
    this.lastHitTime = this.time.now; this.player.setAlpha(0.5);
    this.health--; if (this.health <= 0) { this.lives--; if (this.lives > 0) this.health = 3; else this.scene.start('game-over', { score: this.score }); }
  }

  update(t, d) {
    if (this.isPaused) return;
    if (this.levelTime > 0) { this.levelTime -= d; if (this.levelTime <= 0) this.onLevelComplete(); }
    if (this.cursors.left.isDown) this.player.setVelocityX(-200); else if (this.cursors.right.isDown) this.player.setVelocityX(200); else this.player.setVelocityX(0);
    if (this.zKey.isDown && this.player.body.touching.down) this.player.setVelocityY(-350);
    this.minibosses.getChildren().forEach(b => { if (b.body.blocked.left || b.body.blocked.right) { b.direction *= -1; b.body.setVelocityX(100 * b.direction); } });
    if (this.time.now - this.lastHitTime >= 1000) this.player.setAlpha(1);
  }
}