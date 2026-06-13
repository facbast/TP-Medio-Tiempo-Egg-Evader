# Egg Evade - Por Facundo Bastida

**Egg Evade** es un dinámico juego de plataformas y acción desarrollado en Phaser 3. El jugador toma el papel de un héroe que debe sobrevivir a una incesante lluvia de huevos mutantes mientras rescata a ciudadanos en peligro a través de diversos escenarios que aumentan su dificultad de forma caótica.

## Controles

| Acción | Tecla |
| :--- | :--- |
| Moverse | Flechas de Dirección (Izquierda / Derecha) |
| Saltar | **Z** |
| Rescatar Ciudadano | **S** (cuando estés cerca) |
| Pausar / Reanudar | **ENTER** |

## Objetivo del Juego
Sobrevivir durante todo el tiempo estipulado en cada nivel, acumulando la mayor puntuación posible mediante el rescate de ciudadanos y la eliminación de enemigos, evitando perder todas las vidas ante la lluvia de huevos y los pollos mutantes.
El juego se relaciona con el concepto “Está mal, pero no tan mal” por tener que maltratar animales para ganar puntos y salvar ciudadanos.

## Mecánicas Principales
- **Dificultad Progresiva:** Cada 10 segundos, la frecuencia de caída de los huevos aumenta y su velocidad de descenso se incrementa.
- **Transformación:** Si un huevo permanece 10 segundos en el suelo sin ser destruido, se transforma en un pollo mutante que patrulla las plataformas.
- **Sistema de Salud y Vidas:** El jugador cuenta con 3 corazones de salud. Al agotarse, pierde una de sus 3 vidas totales y reaparece con salud completa.
- **Persistencia:** La puntuación, salud y vidas se mantienen al avanzar entre los tres niveles.

## Niveles
1. **Nivel 1 (60s):** Introducción en un entorno boscoso. Ideal para aprender los tiempos de salto y rescate.
2. **Nivel 2 (120s):** Plataformas más pequeñas y mayor verticalidad, lo que dificulta la esquiva.
3. **Nivel 3 (180s):** El desafío final. Introducción de minijefes y una velocidad de huevos extrema hacia el final del cronómetro.

## Sistema de Puntuación

### Suma puntos:
- **+2000 pts:** Rescatar a un ciudadano (Tecla **S**).
- **+500 pts:** Destruir un huevo saltando sobre él antes de que toque el suelo.
- **+5000 pts:** Derrotar a un Minijefe (Nivel 3).
- **Salud Extra:** Se otorga un corazón adicional cada 10,000 puntos.

### Resta puntos:
- **-500 pts:** Si un ciudadano es golpeado por un huevo o un pollo (el ciudadano desaparece).

## Peligros (Resta de Vida)
- Ser golpeado lateralmente por un huevo que cae.
- Tocar a un pollo mutante (a menos que saltes sobre él).
- Colisionar con un Minijefe (sin saltar sobre su cabeza).

## NPCs

### Ciudadanos (Amarillos)
Aparecen aleatoriamente sobre las plataformas cada 20 segundos. Son estáticos y vulnerables. El jugador debe acercarse y presionar **S** para ponerlos a salvo antes de que un proyectil los alcance.

### Pollos Mutantes (Rojos)
Son el resultado de huevos que eclosionan. Se mueven de forma autónoma por las plataformas y cambian de dirección al chocar con obstáculos o bordes. Pueden ser eliminados si el jugador salta sobre ellos.

### Minijefe: El Triángulo Morado (Nivel 3)
Un enemigo de gran tamaño que aparece periódicamente. 
- **Comportamiento:** Se mueve pesadamente por las plataformas.
- **Combate:** Posee 5 puntos de vida. La única forma de dañarlo es saltando sobre su parte superior. Al recibir daño, entra en un estado de invulnerabilidad temporal (parpadeo).

## Ejecución Local

Para ejecutar el juego en tu computadora, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/facbast/TP-Medio-Tiempo-Egg-Evader.git
    ```
2.  **Servidor Local:**
    Debido a que el juego utiliza módulos de JavaScript y carga assets externos, es necesario ejecutarlo a través de un servidor local. Puedes usar:
    - **Live Server** (Extensión de VS Code).
    - **http-server** (Node.js):
      ```bash
      npx http-server
      ```
3.  **Abrir en el navegador:**
    Accede a `http://localhost:8080` (o el puerto indicado por tu servidor).

## Juego Publicado
https://github.com/facbast/TP-Medio-Tiempo-Egg-Evader

## Tecnologias utilizadas
-Javascript
-Phaser 3
-Visual Studio Code
-Git y Github