'use strict';

// GLOBAL VARIABLES

var allowedKeys_directional = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    }, // Allowed keys
    allowedKeys_shootEmAll = {
        13: 'enter',
        82: 'R'
    },
    msgAlphaTick = 1, // used by @renderMessages function, defines text's opacity
    x_initial = 202, // x initial position
    y_initial = 322, // y initial position
    row = [64, 147, 230], // Row steps
    // Array for chronological position subtraction value of the bug when collision with player, for creating a car crash animation effect
    collisionAnimationValue = [0, -5, -3, -4, -5, -7, -5, -6, -5, -6, -6, -6, -7, -7, -8, -8, -8, -6, -5, -4, -3, -2, -1, 0],
    // An object temporary stocking the bug who's just been shot by Char-Boy, in the shootEmAll scenario or
    // the one who just hit Char-Boy in a collision in the default scenario
    chosenOne;


// Helpfull FUNCTION'S

// Returns a random integer between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if number is even or odd
function isEven(value) {
    if (value % 2 == 0)
        return true;
    else
        return false;
}


// CONSTRUCTOR Game : Handle the different status and scenario's during the play and stock important paramaters of the game

var Game = function(player, scenario, allowedKeys) {
    this.player = player;
    this.scenario = scenario;
    this.counter = 0;
    this.allowedKeys = allowedKeys_directional;
}


// @update FUNCTION for Game : Backbone of the game
// Update's the game, everything transit first through this function, and depending on reports, launch's enemy and player animation and update function's and scenario's to follow, modify enemy and player properties.
// Trigger's a scenario with certain animation's, text's, playing mode according to the last scene (creating a report of acting enemies, player, game).
// Set's the allowed key's for the game

Game.prototype.update = function(dt) {
    switch (this.scenario) {

        // Reset's all data related to game, player and enemies.
        case 'restart':
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
                enemy.sprite = 'images/enemy-bug.png';
                enemy.animation.animationTick2 = 0;
                enemy.animation.animationTick = 0;
                enemy.animation.animationPositionStart = [];
                // For the fade out title 'Story of Char boy', 1 is for full opacity of RGBA alpha channel
                msgAlphaTick = 1;
            });
            // Clear chosenOne temporary variable
            chosenOne = null;
            this.player.reset('animationData');
            this.player.reset('position');
            this.player.reset('life');
            this.scenario = 'default';
            break;

            // Default scenario, no collision, player not reaching water, no kill'em all...
        case 'default':
            this.allowedKeys = allowedKeys_directional;
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });
            this.player.update();
            break;

            // When a collision happen's between player and a bug
        case 'collision':
            // All key's are disabled, player can't move
            this.allowedKeys = {};

            // If player player loose all his life's
            if (this.player.life == 1) {
                // When animation is finished (player.animate return true)
                if (this.player.animate(50, 'carCrash')) {
                    // Trigger's the game over scenario
                    this.scenario = 'gameOver';
                }
            } else {
                if (this.player.animate(50, 'carCrash')) {
                    // When animation is finished
                    this.player.reset('animationData');
                    this.player.reset('position');
                    this.player.life--;
                    this.player.changeImage();
                    this.scenario = 'default';
                };
            }

            allEnemies.forEach(function(enemy) {
                // In a collision we just want the selected bug (chosenOne, defined in Player.collision method) to burn with a car crash animation effect, other bug's act as usual
                if (enemy != chosenOne) {
                    enemy.update(dt);
                } else {
                    // When carCrash animation is finished (method return true)
                    if (enemy.animate(23, 'carCrash')) {
                        enemy.animation.animationTick = 0;
                        chosenOne = null;
                    }
                }

            });
            break;

            // When player life = 0
        case 'gameOver':
            // ENEMY
            // Enemy's act as usual
            allEnemies.forEach(function(enemy) {
                enemy.update(dt);
            });

            // PLAYER
            this.player.life = 0;
            // Keep skeletonBlink animation till restart
            this.player.animate(0, 'skeletonBlink', 20);
            // Move to right when bugs crush
            this.player.update();
            // Player only allowed to press enter to restart
            this.allowedKeys = {
                13: 'enter'
            };
            break;

            // When player reach's the water
        case 'revengeWater':
            // ENEMY
            chosenOne = null;
            // Only Enter (fire) and R (restart) key are allowed
            this.allowedKeys = allowedKeys_shootEmAll;

            // All enemies are burning... ^^
            allEnemies.forEach(function(enemy) {
                enemy.animate(0, 'itBurns');
                enemy.update(dt);
                enemy.animation.animationTick2 = 0;
            });

            // PLAYER
            // Player image turn to bug killer pirate
            this.player.sprite = 'images/char-boy-pirate.png';
            // Preparing for gunShot animation, stocking the 2 images serving for the animation
            this.player.animation.alternateImages = ['images/char-boy-pirate-shoot.png', 'images/char-boy-pirate.png'];
            // Player drift in the see
            this.player.animate(0, 'float', 50);
            break;

            // Game's passing in 'kill them all' mode
        case 'shootEmALL':
            // PLAYER
            this.allowedKeys = allowedKeys_shootEmAll;
            this.player.animate(0, 'float', 50);

            // ENEMY
            // Randomly searching for an enemy on screen when player hit enter
            if (chosenOne == null) {
                allEnemies.forEach(function(enemy) {
                    // Searching for an enemy not 'offscreen'
                    if (enemy.x > 0 && enemy.x < 425 && enemy.y != null) {
                        // We stock that enemy in a global temporary variable
                        chosenOne = enemy;
                        return false;
                    }
                });
            }

            // All other enemies act as usual revengeWater scenario
            allEnemies.forEach(function(enemy) {
                if (enemy !== chosenOne) {
                    enemy.animate(0, 'itBurns');
                    enemy.update(dt);
                }
            });

            // Bug who's been shot is animated
            if (chosenOne != null) {
                // When animation is finished, scenario go back to revengeWater
                if (chosenOne.animate(0, 'itHurts')) {
                    this.scenario = 'revengeWater';
                }
            }
            break;
    }

}


// Enemy CONSTRUCTOR, for enemies our player must avoid.

// the @animation property store's animation information data for each enemy bug : counters, and images that make animation. Information's are processed in the Enemy.prototype.animate method.
// @animationPositionStart memorise the exact coordonate position of the enemy just before animation begins.
// @animationTick and @animationTick2 help defining a timing for each animation. Each time Enemy.prototype.animate is called those two increment like counters.
// Counters help creating variations of images, positions, opacity...
// @alternateImages (burning bug) and @alternateImages2 (strikened bug) stock images used by Enemy.prototype.animate to create an animaton effect.

var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
    this.animation = {
        'animationTick': 0,
        'animationTick2': 0,
        'animationPositionStart': [],
        'alternateImages': ['images/enemy-bug.png', 'images/enemy-bug-burn1.png', 'images/enemy-bug-burn2.png', 'images/enemy-bug-burn3.png'],
        'alternateImages2': ['images/enemy-bug-hit1.png', 'images/enemy-bug-hit2.png', 'images/enemy-bug-hit3.png']
    };
};


// @update FUNCTION for Enemy, update the enemy's position, required method for game.
Enemy.prototype.update = function(dt) {

    // Increment the x position with initial speed, make the bug move from left to right
    this.x = this.x + this.speed * dt;

    // When the bug as exceed the board game limit
    if (this.x > 505) {
        // Put the enemy offscreen so it can make a loop
        this.x = -200;
        // Change his speed randomly
        this.speed = getRandomInt(600, 1400);
        // Change his row randomly
        this.y = row[getRandomInt(0, 3)];
    }
};


// @animate FUNCTION for Enemy, create a chosen animation on enemy depending on game scenario.
// Animation stop when it sends true to Game.update method
// parameters : @time : Indicate duration of the animation, in ticks. If set to 0, the method wait for another event to return true (stop).
// @type : type of animation, either carCrash, itBurns or itHurts
// @data : additional data

Enemy.prototype.animate = function(time, type, data) {

    // We need 2 counters as an enemy can have 2 animation running simultaneously
    // Counters help creating variations of images, positions, opacity...
    // Each time this function is called, counter increments
    var counter = this.animation.animationTick;
    var counter2 = this.animation.animationTick2;

    // If animation hasn't started yet, we store the enemy position we're the animation start
    if (counter == 0) {
        this.animation.animationPositionStart.push(this.x, this.y);
    }

    // We start animation at tick 01
    this.animation.animationTick++;
    counter++;


    switch (type) {
        // Simulate a bounce effect changing x position
        case 'carCrash':
            this.x = this.x + collisionAnimationValue[counter];
            // The enemy burns a few times because of the collision
            this.sprite = this.animation.alternateImages[(counter % 3)];
            // When time is finished we send true to informe Game.update
            if (counter == time) {
                // As animation is finished, sprite is now the original bug image
                this.sprite = this.animation.alternateImages[0];
                return true;
            }
            break;
            // Flame animation on top of the bug
        case 'itBurns':
            // Each 3 ticks, sprite alternate's between the 3 images of alternateImages
            this.sprite = this.animation.alternateImages[(counter % 3)];
            break;

            // Enemy is shot down by player and slip off-screen
        case 'itHurts':
            this.animation.animationTick2++;
            counter2++;

            // Player
            // Taking care of the player shotgun animation
            // Each 8 ticks, sprite alternate's between the 2 images of alternateImages2
            if (counter2 % 8 == 0) {
                player.animation.alternateImages.reverse();
            }
            // We want the player animation to stop before the enemy animation (which can be more than 32 tick's, depending on the enemy postiion)
            if (counter2 < 32) {
                player.sprite = player.animation.alternateImages[0];
            }

            // Enemy
            // Each 3 ticks, sprite alternate's between the 3 images of alternateImages2
            this.sprite = this.animation.alternateImages2[(counter2 % 3)];
            // Slipping effect
            this.y += counter2 / 3;
            // Little bounce effect (shotgun impact)
            this.x += getRandomInt(0, 3);
            // We wait till the enemy goes off-screen to stop the animation
            if (this.y > 550) {
                return true;
                this.animation.animationTick2 = 0;
            }
            break;
    }


}

// @render function for Enemy, simply render's the enemy
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player CONSTRUCTOR

// the @animation property store's in an object animation information data for the player : counters, and images that make animation. Information's are processed in the Player.prototype.animate method.
// @animationPositionStart memorise the exact coordonate position of the player just before animation begins.
// @animationTick and @animationTick2 help defining a timing for each animation. Each time player.prototype.animate is called those two increment like counters.
// Counters help creating variations of images, positions, opacity...
// @alternateImages (dead skeleton char-boy) stock's images used by Player.prototype.animate to create an animaton effect.
// @floatingData : array that contains values for an right to left floating effect

var Player = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = 'images/char-boy.png';
    this.life = 3;
    this.animation = {
        'animationTick': 0,
        'animationTick2': 0,
        'animationPositionStart': [],
        'alternateImages': ['images/char-boy.png', 'images/char-boy-dead-dirty2.png'],
        'floatingData': [1.5, -1.5, -1.5, 1.5]
    };
}

// @update FUNCTION for Player, update the player's position and check for collision
Player.prototype.update = function() {

    // We check if there is any collision
    if (this.checkCollision()) {
        // If scenario is gameOver (life=0), the bugs push's the dead player off screen
        if (game1.scenario == 'gameOver') {
            this.x = this.x + 2;
        } else {
            game1.scenario = 'collision';
        }
    }

    // If player reach's water
    if (this.playerWater()) {
        game1.scenario = 'revengeWater';
        // Before floating animation start's we center the player's position
        this.x = 150;
    }

}

// @reset FUNCTION for Player, reset's most of the player's data
// @type parameter for choosing which property we want to reset
Player.prototype.reset = function(type) {

    switch (type) {
        // we had 3 life to the player
        case 'life':
            this.life = 3;
            break;
            // the player goes back to his original position
        case 'position':
            this.x = x_initial;
            this.y = y_initial;
            break;
            // cleans animation object, and assign the original char-boy sprite
        case 'animationData':
            this.animation.animationTick = 0;
            this.animation.animationTick2 = 0;
            this.animation.animationPositionStart.length = 0;
            this.animation.alternateImages = ['images/char-boy.png', 'images/char-boy-dead-dirty2.png'];
            this.sprite = 'images/char-boy.png';
            break;
    }
}


// @animate FUNCTION for Player, create a chosen animation depending on game scenario.
// Animation stop when function sends true to Game.update method
// parameters : @time : Indicate duration of the animation, in ticks. If set to 0, the method wait for another event to return true (stop).
// @type : type of animation, either carCrash, skeletonBlink or float
// @data : additional data

Player.prototype.animate = function(time, type, data) {

    // Counters help creating variations of images, positions, opacity.
    // Each time this function is called, counter increments
    var counter = this.animation.animationTick;

    // If animation hasn't started yet, we store the position we're the animation start
    if (counter == 0) {
        this.animation.animationPositionStart.push(this.x, this.y);
    }

    // We start animation at tick 01
    this.animation.animationTick++;
    counter++;

    switch (type) {
        // Simulate a bounce/rumble effect changing x position
        case 'carCrash':
            // alternate +- 5px, creating a carCrash collision effect
            if (isEven(counter)) {
                this.x = this.animation.animationPositionStart[0] + 5;
                this.y = this.animation.animationPositionStart[1];
            } else {
                this.x = this.animation.animationPositionStart[0] - 5;
                this.y = this.animation.animationPositionStart[1];
            }

            // When time is finished we send true to informe game.update
            if (counter == time) {
                return true;
            }
            break;
            // When game is over, player's image blinks
        case 'skeletonBlink':
            // Each '@data' number of ticks, we change players image creating a blink effect
            // Each image has to stay a '@data' number of ticks before switching
            if (counter % data == 0) {
                this.animation.alternateImages.reverse();
            }
            this.sprite = this.animation.alternateImages[0];
            // When time is over
            if (counter >= time) {
                return true;
            }
            break;
            // Right to left floating effect, when player has reached water
        case 'float':
            // We need a sub-counter inside to go over animation.floatingData each '@data' number of ticks
            var subcounter = this.animation.animationTick2;

            // Each '@data' ticks we change players image switching position values inside the animationfloatingData array

            if (counter % data == 0 && counter != 0) {
                this.animation.animationTick2++;
                subcounter++;
            }

            if (subcounter == this.animation.floatingData.length) {
                this.animation.animationTick2 = 0;
                subcounter = 0;
            }

            this.x = this.x + this.animation.floatingData[subcounter];

            break;
    }
}



// @checkCollision FUNCTION for Player, check if player touch's an enemy or not
Player.prototype.checkCollision = function() {
    // Check the position of all bugs compare to the player
    // If enemy is too close return true
    for (var i = 0; i < allEnemies.length; i++) {

        if ((allEnemies[i].x - this.x < 50 && allEnemies[i].x - this.x > -50) &&
            (allEnemies[i].y - this.y < 20 && allEnemies[i].y - this.y > -20)) {
            chosenOne = allEnemies[i];
            return true;
        }

    };
}

// @playerWater FUNCTION for Player, check if Player reach's the water.
Player.prototype.playerWater = function() {
    if (this.y < 0) {
        return true;
    }
}


// @changeImage FUNCTION for Player, handles the different sprites mode depending on how many life is left
Player.prototype.changeImage = function() {

    switch (this.life) {
        case 3:
            this.sprite = 'images/char-boy.png';
            break;
        case 2:
            this.sprite = 'images/char-boy-hurt1.png';
            break;
        case 1:
            this.sprite = 'images/char-boy-hurt2.png';
            break;
    }

}

// @handleInput FUNCTION for Player, moves the player, depending on choice parameters and scenario's
//
Player.prototype.handleInput = function(choice) {

    if (game1.scenario == 'gameOver' && choice == 'enter') {
        game1.scenario = 'restart';
    }

    if (game1.scenario == 'revengeWater' && choice == 'enter') {
        game1.scenario = 'shootEmALL';
    }

    if (game1.scenario == 'revengeWater' && choice == 'R') {
        game1.scenario = 'restart';
    }

    // Array move is the amount of pixel shifting when player is displaced (x,y)
    var move = [0, 0];

    // Puts the limits of player's shifting, doesn't go offscreen
    if (choice == 'left' && this.x > 50) {
        move[0] = -101;
        move[1] = 0;
    } else if (choice == 'right' && this.x < 350) {
        move[0] = 101;
        move[1] = 0;
    } else if (choice == 'up' && this.y > 50) {
        move[0] = 0;
        move[1] = -83;
    } else if (choice == 'down' && this.y < 332) {
        move[0] = 0;
        move[1] = 83;
    } else {
        move = [0, 0];
    }

    this.x = this.x + move[0];
    this.y = this.y + move[1];

};

// @render FUNCTION for Player, simply render's the player
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Messages CONSTRUCTOR
// Creates customizable messages and texts appearing on screen using HTML5 canvas fillText function and properties
// @font : font of the text
// @fillStyle : color of the text
// @align : text align type
// @text : text contents
// @coords :  x and y coordinates
var Messages = function(font, color, align, text, coords) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, coords[0], coords[1]);
}

// @renderMessages FUNCTION for Messages, instanciate all texts appearing on screen, depending on game scenario
function renderMessages() {

    Messages('70px Creepster', 'rgba(0, 0, 0, ' + msgAlphaTick + ')', 'center', 'Story of Char-boy', [250, 250]);
    msgAlphaTick -= 0.007;

    Messages('17px "Press Start 2P"', 'greenyellow', 'right', 'LIFE : ' + player.life, [490, 35]);

    switch (game1.scenario) {
        case 'revengeWater':
        case 'shootEmALL':
            Messages('70px Creepster', '#FF0000', 'center', 'KILL THEM ALL !', [250, 440]);
            Messages('35px Creepster', '#FF0000', 'center', 'Press Enter to fire', [250, 480]);
            Messages('20px Creepster', '#FF0000', 'center', 'R to restart', [250, 510]);
            break;
        case 'gameOver':
            Messages('100px Creepster', '#FF0000', 'center', 'CONTINUE ?', [250, 270]);
            Messages('50px Creepster', '#FF0000', 'center', 'Press Enter', [250, 325]);
            break;
    }

}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var diablo1 = new Enemy(1, 64, getRandomInt(600, 1400));
var diablo2 = new Enemy(1, 64, getRandomInt(600, 1400));
var diablo3 = new Enemy(1, 64, getRandomInt(600, 1400));
var diablo4 = new Enemy(1, 64, getRandomInt(600, 1400));
var diablo5 = new Enemy(1, 64, getRandomInt(600, 1400));

var allEnemies = [diablo1, diablo2, diablo3, diablo4, diablo5];

var player = new Player(x_initial, y_initial);

var game1 = new Game(player, 'default', allowedKeys_directional);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {

    var allowedKeys = game1.allowedKeys;

    player.handleInput(allowedKeys[e.keyCode]);

});