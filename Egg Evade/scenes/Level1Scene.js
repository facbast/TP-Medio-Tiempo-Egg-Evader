export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  createPauseUI() {
    // Contenedor con fondo semi-transparente y botones
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
    if (this.levelComplete) return; // no pausar si ya terminó el nivel
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
    // Asegurar que se reanude el mundo antes de cambiar de escena
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

    // Mostrar mensaje de nivel completado
    const winBg = this.add.rectangle(400, 300, 600, 200, 0x000000, 0.7).setDepth(1001);
    const winText = this.add.text(400, 280, '¡Nivel completado!', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5).setDepth(1001);
    const contText = this.add.text(400, 340, 'Presiona ENTER para volver al menú', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5).setDepth(1001);

    // Rebind ENTER to go to level 2 when level complete
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
    // Variables del juego
    this.player = null;
    this.platforms = null;
    this.cursors = null;
    this.zKey = null;
    this.canJump = true;
    this.health = 3; // Vidas del jugador (máximo 3)
    this.hearts = []; // Array para almacenar los corazones visuales
    this.eggs = null; // Grupo de huevos
    this.chickens = null; // Grupo de pollos
    this.citizens = null; // Grupo de ciudadanos
    this.nextEggWarning = null; // Indicador de próximo huevo
    this.nextEggX = null; // Posición x del siguiente huevo
    this.eggSpawner = null; // Timer para generar huevos
    this.citizenSpawner = null; // Timer para generar ciudadanos
    this.lastHitTime = 0; // Tiempo del último impacto recibido
    this.damageCooldown = 1000; // Duración del cooldown visual en ms
    this.score = 0; // Puntos actuales del jugador
    this.nextHealthScoreThreshold = 10000; // Siguiente umbral para vida extra
    this.sKey = null; // Tecla para salvar ciudadanos
    this.rescuedCitizens = 0;
    this.isPaused = false;
    this.pauseContainer = null;
    this.enterKey = null;
    this.lives = 3;
    this.livesText = null;
      this.levelTime = 60000; // ms to survive
      this.levelTimerText = null;
      this.levelComplete = false;
    this.currentEggDelay = 5000;
    this.currentEggSpeed = 150;
  }

  preload() {
    // Cargar assets si es necesario
  }

  dibujarVidas() {
    // Limpiar corazones anteriores
    this.hearts.forEach(heart => heart.destroy());
    this.hearts = [];

    // Dibujar corazones en la esquina superior izquierda
    const totalHearts = Math.max(this.health, 3);
    for (let i = 0; i < totalHearts; i++) {
      const x = 25 + (i * 35); // Espaciado entre corazones
      const y = 25;

      // Crear un gráfico con forma de corazón
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });

      if (i < this.health) {
        // Corazón lleno (rojo)
        graphics.fillStyle(0xFF0000, 1);
      } else {
        // Corazón vacío (gris)
        graphics.fillStyle(0x888888, 1);
      }

      // Dibujar un corazón simplificado como dos círculos arriba y un triángulo abajo
      graphics.fillCircle(4, 4, 4); // Círculo izquierdo
      graphics.fillCircle(10, 4, 4); // Círculo derecho
      graphics.fillTriangleShape([
        { x: 2, y: 8 },
        { x: 12, y: 8 },
        { x: 7, y: 14 },
      ]);

      graphics.generateTexture(`heart-${i}`, 14, 14);
      graphics.destroy();

      const heart = this.add.image(x, y, `heart-${i}`);
      heart.setOrigin(0.5, 0.5);
      heart.setScrollFactor(0); // Fijo en la pantalla
      this.hearts.push(heart);
    }
  }

perderVida() {
    if (this.health > 0) {
      this.health--;
      this.dibujarVidas();
    }

    if (this.health <= 0) {
      this.lives--;
      if (this.livesText) this.livesText.setText(`Vidas: ${this.lives}`);

      if (this.lives > 0) {
        this.health = 3; // Restaurar salud
        this.dibujarVidas();
      } else {
        this.scene.start("game-over", { 
          score: this.score, 
          rescued: this.rescuedCitizens 
        });
      }
    }
  }

  aplicarDaño() {
    const now = this.time.now;
    if (now - this.lastHitTime < this.damageCooldown) {
      return false;
    }

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
    // Usar la posición advertida si existe, en caso contrario elegir una aleatoria
    const spawnX = this.nextEggX !== null ? this.nextEggX : Phaser.Math.Between(50, 750);
    this.nextEggX = null;
    if (this.nextEggWarning) {
      this.nextEggWarning.setVisible(false);
    }

    const egg = this.eggs.create(spawnX, -20, null);

    // Crear/actualizar textura del huevo si no existe o para seguridad
    const eggTextureKey = "egg-texture";
    const eggW = 16;
    const eggH = 16;
    const eggGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    eggGraphics.fillStyle(0xFF0000, 1);
    eggGraphics.fillCircle(eggW / 2, eggH / 2, 8);
    eggGraphics.generateTexture(eggTextureKey, eggW, eggH);
    eggGraphics.destroy();

    egg.setTexture(eggTextureKey);
    egg.setOrigin(0.5, 0.5);
    egg.setDisplaySize(eggW, eggH);
    // Ajustar el cuerpo del sprite al tamaño visual
    if (egg.body && egg.body.setSize) {
      egg.body.setSize(eggW, eggH);
      egg.body.setOffset(0, 0);
    }
    egg.setVelocityY(this.currentEggSpeed); // Velocidad de caída dinámica
    egg.setBounce(0.3);
    egg.isOnGround = false; // Flag para saber si está en el suelo
    egg.timeLeft = 10000; // 10 segundos antes de convertirse en pollo
    egg.birthTime = this.time.now;

    // Mostrar advertencia para el siguiente huevo
    this.showNextEggWarning();

    // Programar el siguiente huevo con el delay actual (recursivo)
    this.time.delayedCall(this.currentEggDelay, this.spawnEgg, [], this);
  }

  showNextEggWarning() {
    const warningX = Phaser.Math.Between(50, 750);
    this.nextEggX = warningX;
    if (!this.nextEggWarning) {
      const warningGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      warningGraphics.fillStyle(0xFFFF00, 1);
      warningGraphics.fillRect(0, 0, 20, 20);
      warningGraphics.fillStyle(0x000000, 1);
      warningGraphics.fillRect(9, 4, 2, 9);
      warningGraphics.fillCircle(10, 16, 2);
      warningGraphics.generateTexture("warning-icon", 20, 20);
      warningGraphics.destroy();

      this.nextEggWarning = this.add.image(warningX, 60, "warning-icon");
      this.nextEggWarning.setOrigin(0.5, 0.5);
      this.nextEggWarning.setScrollFactor(0);
      this.nextEggWarning.setDepth(10);
    } else {
      this.nextEggWarning.setPosition(warningX, 60);
      this.nextEggWarning.setVisible(true);
    }
  }

  manejarColisionEggJugador(jugador, egg) {
    // Si el jugador salta sobre el huevo (desde arriba)
    if (jugador.body.touching.down && egg.body.touching.up) {
      egg.destroy();
      this.cambiarPuntaje(500);
    } else if (!egg.isOnGround) {
      // Si el jugador toca el huevo mientras cae, recibe daño
      this.aplicarDaño();
    }
  }

  spawnCitizen() {
    // Seleccionar una plataforma aleatoria existente y posicionar el ciudadano
    const plats = this.platforms && this.platforms.getChildren ? this.platforms.getChildren() : [];
    if (!plats || plats.length === 0) {
      return;
    }

    const platform = Phaser.Utils.Array.GetRandom(plats);
    // Colocar el ciudadano centrado sobre la plataforma, justo encima (sin clipping)
    const px = platform.x;
    const pHeight = platform.displayHeight || (platform.body && platform.body.height) || 30;
    const citizenW = 24;
    const citizenH = 24;
    const citizenY = platform.y - (pHeight / 2) - (citizenH / 2) - 2; // pequeño offset hacia arriba

    const citizen = this.citizens.create(px, citizenY, "citizen-texture");
    citizen.setOrigin(0.5, 0.5);
    citizen.setDisplaySize(citizenW, citizenH);
    if (citizen.body && citizen.body.setSize) {
      citizen.body.setSize(citizenW, citizenH);
      citizen.body.setOffset(0, 0);
    }
    citizen.setImmovable(true);
    if (citizen.body) {
      citizen.body.setAllowGravity(false);
    }
  }

  transformarEnPollo(egg) {
    // Crear un triángulo rojo para representar un pollo
    const chickenTextureKey = "chicken-texture";
    const chickW = 20;
    const chickH = 16;
    const chickenGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    chickenGraphics.fillStyle(0xFF0000, 1);
    // Dibujar triángulo: punta arriba (10,0), izquierda (0,16), derecha (20,16)
    chickenGraphics.fillTriangle(10, 0, 0, 16, 20, 16);
    chickenGraphics.generateTexture(chickenTextureKey, chickW, chickH);
    chickenGraphics.destroy();

    // Crear el pollo en la posición del huevo
    const chicken = this.chickens.create(egg.x, egg.y, null);
    chicken.setTexture(chickenTextureKey);
    chicken.setOrigin(0.5, 0.5);
    chicken.setDisplaySize(chickW, chickH);
    if (chicken.body && chicken.body.setSize) {
      chicken.body.setSize(chickW, chickH);
      chicken.body.setOffset(0, 0);
    }
    chicken.direction = 1; // 1 = derecha, -1 = izquierda
    chicken.setVelocityX(120 * chicken.direction); // Velocidad horizontal inicial
    chicken.setCollideWorldBounds(true);
    chicken.body.onWorldBounds = true;
    chicken.setBounce(0, 0);
    chicken.flipCooldown = 0;
    chicken.touchingChicken = false;

    // Destruir el huevo
    egg.destroy();
  }

  manejarColisionPollo(chicken, objeto) {
    // Cambiar dirección cuando colisiona con plataformas o bordes
    if (objeto === chicken) return; // Evitar auto-colisiones
    
    // Si toca un borde del mundo, cambiar dirección
    if (chicken.body.blocked.left || chicken.body.blocked.right) {
      chicken.direction *= -1;
      chicken.setVelocityX(120 * chicken.direction);
    }
  }

  manejarColisionChickenJugador(jugador, chicken) {
    // Si el jugador salta sobre el pollo (desde arriba)
    if (jugador.body.touching.down && chicken.body.touching.up) {
      chicken.destroy();
      return;
    }

    // Cualquier otra colisión con el pollo causa daño
    this.aplicarDaño();
  }

  create() {
    // Fondo del juego
    this.cameras.main.setBackgroundColor("#87CEEB");

    // Crear grupo de plataformas estáticas
    this.platforms = this.physics.add.staticGroup();

    // Plataforma inferior (piso principal)
    const groundPlatform = this.platforms.create(400, 590, null);
    groundPlatform.setDisplaySize(800, 40);
    groundPlatform.body.setSize(800, 40);
    groundPlatform.refreshBody();
    this.add.rectangle(400, 590, 800, 40, 0x228B22);

    // Plataforma 1 - Izquierda
    const platform1 = this.platforms.create(150, 480, null);
    platform1.setDisplaySize(200, 30);
    platform1.body.setSize(200, 30);
    platform1.refreshBody();
    this.add.rectangle(150, 480, 200, 30, 0x00FF00);

    // Plataforma 2 - Centro
    const platform2 = this.platforms.create(400, 400, null);
    platform2.setDisplaySize(200, 30);
    platform2.body.setSize(200, 30);
    platform2.refreshBody();
    this.add.rectangle(400, 400, 200, 30, 0x00FF00);

    // Plataforma 3 - Derecha
    const platform3 = this.platforms.create(650, 480, null);
    platform3.setDisplaySize(200, 30);
    platform3.body.setSize(200, 30);
    platform3.refreshBody();
    this.add.rectangle(650, 480, 200, 30, 0x00FF00);

    // Plataforma 4 - Centro arriba
    const platform4 = this.platforms.create(400, 300, null);
    platform4.setDisplaySize(200, 30);
    platform4.body.setSize(200, 30);
    platform4.refreshBody();
    this.add.rectangle(400, 300, 200, 30, 0x00FF00);

    // Plataforma 5 - Izquierda arriba
    const platform5 = this.platforms.create(150, 200, null);
    platform5.setDisplaySize(200, 30);
    platform5.body.setSize(200, 30);
    platform5.refreshBody();
    this.add.rectangle(150, 200, 200, 30, 0x00FF00);

    // Plataforma 6 - Derecha arriba
    const platform6 = this.platforms.create(650, 200, null);
    platform6.setDisplaySize(200, 30);
    platform6.body.setSize(200, 30);
    platform6.refreshBody();
    this.add.rectangle(650, 200, 200, 30, 0x00FF00);

    // Crear el jugador (cuadrado azul)
    this.player = this.physics.add.sprite(400, 550, null);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    
    // Dibujar el cuadrado azul del jugador
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000FF, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture("player-texture", 30, 30);
    playerGraphics.destroy();
    
    // Asignar la textura al jugador
    this.player.setTexture("player-texture");
    this.player.setOrigin(0.5, 0.5);

    // Colisión entre jugador y plataformas
    this.physics.add.collider(this.player, this.platforms);

    // Crear grupo de ciudadanos (sin gravedad, inmovibles)
    this.citizens = this.physics.add.group({ allowGravity: false, immovable: true });

    // Generar textura del ciudadano amarillo
    const citizenGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    citizenGraphics.fillStyle(0xFFFF00, 1);
    citizenGraphics.fillRect(0, 0, 24, 24);
    // Cara miedosa
    citizenGraphics.fillStyle(0x000000, 1);
    citizenGraphics.fillRect(5, 6, 4, 4);  // Ojo izquierdo
    citizenGraphics.fillRect(15, 6, 4, 4); // Ojo derecho
    citizenGraphics.fillRect(7, 16, 10, 3); // Boca de preocupación
    citizenGraphics.generateTexture("citizen-texture", 24, 24);
    citizenGraphics.destroy();

    // Texto de advertencia para salvar ciudadanos
    this.savePromptText = this.add.text(400, 560, "", {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Arial",
    }).setOrigin(0.5, 0.5);
    this.savePromptText.setScrollFactor(0);
    // Texto de puntaje en la esquina superior derecha
    this.scoreText = this.add.text(780, 20, "Puntaje: 0", {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(1, 0);
    this.scoreText.setScrollFactor(0);

    // Texto del temporizador de nivel (centro superior)
    this.levelTimerText = this.add.text(400, 10, "01:00", {
      fontSize: "22px",
      fill: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5, 0);
    this.levelTimerText.setScrollFactor(0);

    // Crear UI del menú de pausa (invisible por defecto)
    this.createPauseUI();

    // Tecla ENTER para pausar/reanudar
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on('down', () => {
      this.togglePause();
    });

    // Crear grupo de huevos dinámicos
    this.eggs = this.physics.add.group();

    // Colisión entre huevos y plataformas
    this.physics.add.collider(this.eggs, this.platforms, (egg, platform) => {
      egg.isOnGround = true;
    });

    // Colisión entre jugador y huevos
    this.physics.add.overlap(this.player, this.eggs, this.manejarColisionEggJugador, null, this);

    // Crear grupo de pollos dinámicos
    this.chickens = this.physics.add.group();

    // Colisión entre pollos y plataformas
    this.physics.add.collider(this.chickens, this.platforms, (chicken) => {
      if (this.time.now - chicken.flipCooldown > 100) {
        if (chicken.body.blocked.left && chicken.direction !== 1) {
          chicken.direction = 1;
          chicken.setVelocityX(120);
          chicken.flipCooldown = this.time.now;
        } else if (chicken.body.blocked.right && chicken.direction !== -1) {
          chicken.direction = -1;
          chicken.setVelocityX(-120);
          chicken.flipCooldown = this.time.now;
        }
      }
    });

    // Colisión de pollos contra bordes del mundo
    this.physics.world.on("worldbounds", (body) => {
      const chicken = body.gameObject;
      if (!chicken || !chicken.texture || chicken.texture.key !== "chicken-texture") {
        return;
      }
      if (this.time.now - chicken.flipCooldown > 100) {
        chicken.direction *= -1;
        chicken.setVelocityX(120 * chicken.direction);
        chicken.flipCooldown = this.time.now;
      }
    });

    // Colisión entre pollos entre sí (cambio de dirección controlado)
    this.physics.add.overlap(this.chickens, this.chickens, (c1, c2) => {
      if (c1 === c2) {
        return;
      }
      if (this.time.now - c1.flipCooldown > 100 && this.time.now - c2.flipCooldown > 100) {
        c1.direction *= -1;
        c2.direction *= -1;
        c1.setVelocityX(120 * c1.direction);
        c2.setVelocityX(120 * c2.direction);
        c1.flipCooldown = this.time.now;
        c2.flipCooldown = this.time.now;
      }
    });

    // Colisión entre jugador y pollos
    this.physics.add.overlap(this.player, this.chickens, this.manejarColisionChickenJugador, null, this);

    // Ciudadanos afectados por huevos y pollos
    this.physics.add.overlap(this.eggs, this.citizens, (egg, citizen) => {
      if (!citizen.active) {
        return;
      }
      egg.destroy();
      citizen.destroy();
      this.cambiarPuntaje(-500);
    });
    this.physics.add.overlap(this.chickens, this.citizens, (chicken, citizen) => {
      if (!citizen.active) {
        return;
      }
      citizen.destroy();
      this.cambiarPuntaje(-500);
    });

    // Spawnear el primer huevo inmediatamente y mostrar advertencia del siguiente
    this.spawnEgg();

    // Timer para aumentar la dificultad: reduce el intervalo cada 10s hasta un mínimo de 1s
    this.time.addEvent({
      delay: 10000,
      callback: () => {
        this.currentEggDelay = Math.max(1000, this.currentEggDelay - 500);
        this.currentEggSpeed = Math.min(450, this.currentEggSpeed + 25);
      },
      loop: true,
    });

    // Timer para generar ciudadanos cada 20 segundos
    this.time.addEvent({
      delay: 20000,
      callback: this.spawnCitizen,
      callbackScope: this,
      loop: true,
    });

    // Controles de teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Dibujar la barra de vida
    this.dibujarVidas();
    this.livesText = this.add.text(20, 45, `Vidas: ${this.lives}`, {
      fontSize: "18px", fill: "#ffffff", fontFamily: "Arial", stroke: "#000000", strokeThickness: 3
    }).setScrollFactor(0);
  }

  update(time, delta) {
    if (this.isPaused) {
      return;
    }

    // Actualizar temporizador de nivel
    if (!this.levelComplete && this.levelTime > 0) {
      this.levelTime -= delta;
      if (this.levelTime <= 0) {
        this.levelTime = 0;
        this.levelTimerText.setText('00:00');
        this.onLevelComplete();
      } else {
        const totalSeconds = Math.ceil(this.levelTime / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const mm = String(mins).padStart(2, '0');
        const ss = String(secs).padStart(2, '0');
        this.levelTimerText.setText(`${mm}:${ss}`);
      }
    }
    // Movimiento izquierda
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    }
    // Movimiento derecha
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }
    // Sin movimiento horizontal
    else {
      this.player.setVelocityX(0);
    }

    // Salto con tecla Z
    if (this.zKey.isDown && this.player.body.touching.down && this.canJump) {
      this.player.setVelocityY(-350);
      this.canJump = false;
    }

    // Permitir salto de nuevo cuando se suelta la tecla
    if (!this.zKey.isDown) {
      this.canJump = true;
    }

    // Ciudadanos cercanos y rescate con S
    let citizenNearby = null;
    if (this.citizens && Array.isArray(this.citizens.getChildren ? this.citizens.getChildren() : [])) {
      const citizens = this.citizens.getChildren();
      citizens.forEach(citizen => {
        const distanceX = Math.abs(citizen.x - this.player.x);
        const distanceY = Math.abs(citizen.y - this.player.y);
        if (distanceX < 40 && distanceY < 40) {
          citizenNearby = citizen;
        }
      });
    }

    if (citizenNearby) {
      this.savePromptText.setText("Presiona S para salvar al ciudadano");
      if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
        citizenNearby.destroy();
        this.savePromptText.setText("Ciudadano salvado!");
        this.rescuedCitizens++;
        this.cambiarPuntaje(2000);
      }
    } else {
      this.savePromptText.setText("");
    }

    // Transformar huevos en pollos después de 10 segundos
    if (this.eggs && Array.isArray(this.eggs.getChildren ? this.eggs.getChildren() : [])) {
      const eggs = this.eggs.getChildren();
      eggs.forEach(egg => {
        if (egg && this.time.now - egg.birthTime >= 10000) {
          this.transformarEnPollo(egg);
        }
      });
    }

    // Limpiar pollos que hayan salido de la pantalla
    if (this.chickens && Array.isArray(this.chickens.getChildren ? this.chickens.getChildren() : [])) {
      const chickens = this.chickens.getChildren();
      chickens.forEach(chicken => {
        if (!chicken || !chicken.body) {
          return;
        }

        if (chicken.body.blocked.left && chicken.direction !== 1) {
          chicken.direction = 1;
          chicken.setVelocityX(120);
        } else if (chicken.body.blocked.right && chicken.direction !== -1) {
          chicken.direction = -1;
          chicken.setVelocityX(-120);
        }

        if (chicken.y > 650) {
          chicken.destroy();
        }
      });
    }

    // Limpiar huevos que hayan salido de la pantalla
    if (this.eggs && Array.isArray(this.eggs.getChildren ? this.eggs.getChildren() : [])) {
      const eggs = this.eggs.getChildren();
      eggs.forEach(egg => {
        if (egg && egg.y > 650) {
          egg.destroy();
        }
      });
    }

    // Restaurar alpha del jugador cuando termine el cooldown de daño
    const now = this.time.now;
    if (now - this.lastHitTime >= this.damageCooldown) {
      this.player.setAlpha(1);
    }
  }
}
