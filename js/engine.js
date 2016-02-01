/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.querySelector('canvas'),
        ctx = canvas.getContext('2d'),
        counter = 0, // Counters needed for playing the waves animations
        subcounter = 0,
        lastTime;


    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
        main();
        reset();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        // We only upadte game1 who will update player and enemies
        game1.update(dt);
    }


    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */

        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Waves animation position's for each block
        var arrayWavesPosition = [
            [60, 30, 0, 10, 25],
            [55, 25, 5, 15, 30],
            [50, 20, 10, 20, 35],
            [45, 15, 15, 25, 40],
            [40, 10, 20, 30, 45],
            [35, 5, 25, 35, 50],
            [30, 0, 30, 40, 55],
            [25, 5, 35, 45, 60],
            [20, 10, 40, 50, 55],
            [15, 15, 45, 55, 50],
            [10, 20, 50, 60, 45],
            [5, 25, 55, 55, 40],
            [0, 30, 60, 50, 35],
            [5, 35, 55, 45, 30],
            [10, 40, 50, 40, 25],
            [15, 45, 45, 35, 20],
            [20, 50, 40, 30, 15],
            [25, 55, 35, 25, 10],
            [30, 60, 30, 20, 5],
            [35, 55, 25, 15, 0],
            [40, 50, 20, 10, 5],
            [45, 45, 15, 5, 10],
            [50, 40, 10, 0, 15],
            [55, 35, 5, 5, 20],
        ];

        // We want to loop over arrayWavesPosition, changing water block y position's every 4 ticks
        // We need a sub-counter inside to read arrayWavesPosition each 4 ticks
        if (counter % 4 == 0 && counter != 0) {
            subcounter++;
        }

        // We restart on the first indice of arrayWavesPosition each 24*4 ticks, 24 = arrayWavesPosition.length
        if (subcounter == 24) {
            subcounter = 0;
        }

        // On the first game row (water row), we animate each water blocks creating a wave effect
        for (col = 0; col < numCols; col++) {
            ctx.drawImage(Resources.get(rowImages[0]), col * 101, arrayWavesPosition[subcounter][col]);
            ctx.clearRect(col * 101, arrayWavesPosition[subcounter][col], 101, 50);
        }

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */

        // From the second row
        for (row = 1; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }


        renderEntities();
        counter++;

    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        player.render();
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        renderMessages();

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // Timer in milliseconds (starts at 60 seconds then decrement each seconds)
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/enemy-bug-burn1.png',
        'images/enemy-bug-burn2.png',
        'images/enemy-bug-burn3.png',
        'images/enemy-bug-hit1.png',
        'images/enemy-bug-hit2.png',
        'images/enemy-bug-hit3.png',
        'images/char-boy.png',
        'images/char-boy-dead-dirty2.png',
        'images/char-boy-hurt1.png',
        'images/char-boy-hurt2.png',
        'images/char-boy-pirate.png',
        'images/char-boy-pirate-shoot.png'

    ]);

    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;


})(this);