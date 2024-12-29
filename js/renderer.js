import { spriteManager } from './sprites.js';
import { SPRITE_POSITIONS } from './config.js';
import { CANVAS_CONFIG } from './config.js';
import { GAME_CONFIG } from './config.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.groundX = 0;
        this.dinoSpriteX = 0;
        this.frameCount = 0;
        
        // Khởi tạo clouds
        this.clouds = [
            {
                x: canvas.width,
                y: 30,
                sprite: SPRITE_POSITIONS.clouds[0]
            },
            {
                x: canvas.width + 200,
                y: 50,
                sprite: SPRITE_POSITIONS.clouds[1]
            }
        ];
    }

    draw(gameState, players, obstacles) {
        if (!spriteManager.isLoaded()) {
            console.log('Waiting for sprite sheet to load...');
            return;
        }

        // Clear canvas trước khi vẽ frame mới
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        try {
            // Draw all elements
            this.drawBackground(gameState);
            this.drawGround(gameState.gameMode);
            
            if (players.length > 0) {
                this.drawPlayers(players);
            }
            
            if (obstacles.length > 0) {
                this.drawObstacles(obstacles);
            }
            
            this.drawUI(gameState, players);
        } catch (err) {
            console.error('Error drawing game:', err);
        }
    }

    drawBackground(gameState) {
        // Vẽ background trước
        this.ctx.fillStyle = '#f7f7f7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Vẽ clouds
        this.clouds.forEach(cloud => {
            if (cloud && cloud.sprite) {
                this.ctx.drawImage(
                    spriteManager.spriteSheet,
                    cloud.sprite.x, cloud.sprite.y,
                    cloud.sprite.width, cloud.sprite.height,
                    cloud.x, cloud.y,
                    cloud.sprite.width, cloud.sprite.height
                );
            }
        });

        // Chỉ vẽ night mode khi có player và đủ điểm
        if (gameState.players && gameState.players[0] && 
            Math.floor(gameState.players[0].score / GAME_CONFIG.NIGHT_TIME) % 2 === 1) {
            
            this.ctx.fillStyle = '#1c1c1c';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw stars
            for (let i = 0; i < 20; i++) {
                const star = SPRITE_POSITIONS.stars[Math.floor(Math.random() * 2)];
                this.ctx.drawImage(
                    spriteManager.spriteSheet,
                    star.x, star.y, star.width, star.height,
                    Math.random() * this.canvas.width,
                    Math.random() * (CANVAS_CONFIG.GROUND_HEIGHT - 50),
                    star.width, star.height
                );
            }
            
            // Draw moon
            this.ctx.drawImage(
                spriteManager.spriteSheet,
                SPRITE_POSITIONS.moon.x, SPRITE_POSITIONS.moon.y,
                SPRITE_POSITIONS.moon.width, SPRITE_POSITIONS.moon.height,
                this.canvas.width - 100, 50,
                SPRITE_POSITIONS.moon.width, SPRITE_POSITIONS.moon.height
            );
        }
    }

    drawGround(gameMode) {
        const groundSprite = SPRITE_POSITIONS.ground;
        
        // Draw ground for player 1
        for(let i = 0; i <= this.canvas.width/groundSprite.width + 1; i++) {
            this.ctx.drawImage(
                spriteManager.spriteSheet,
                groundSprite.x,
                groundSprite.y,
                groundSprite.width,
                groundSprite.height,
                this.groundX + (i * groundSprite.width), 
                CANVAS_CONFIG.GROUND_HEIGHT,
                groundSprite.width,
                groundSprite.height
            );
        }

        // Draw ground for player 2 if in 2 player mode
        if(gameMode === 2) {
            for(let i = 0; i <= this.canvas.width/groundSprite.width + 1; i++) {
                this.ctx.drawImage(
                    spriteManager.spriteSheet,
                    groundSprite.x,
                    groundSprite.y,
                    groundSprite.width,
                    groundSprite.height,
                    this.groundX + (i * groundSprite.width), 
                    CANVAS_CONFIG.GROUND_HEIGHT_2P,
                    groundSprite.width,
                    groundSprite.height
                );
            }
        }
    }

    drawPlayers(players) {
        players.forEach(player => {
            let frame;
            let spriteWidth, spriteHeight;

            if (player.gameOver) {
                frame = SPRITE_POSITIONS.dino.frames.dead;
                spriteWidth = frame.width;
                spriteHeight = frame.height;
            } else if (player.isJumping) {
                frame = SPRITE_POSITIONS.dino.frames.jump;
                spriteWidth = frame.width;
                spriteHeight = frame.height;
            } else if (player.isDucking) {
                frame = SPRITE_POSITIONS.dino.frames.duck[this.dinoSpriteX ? 1 : 0];
                spriteWidth = frame.width;
                spriteHeight = frame.height;
            } else {
                frame = SPRITE_POSITIONS.dino.frames.run[this.dinoSpriteX ? 1 : 0];
                spriteWidth = frame.width;
                spriteHeight = frame.height;
            }

            this.ctx.drawImage(
                spriteManager.spriteSheet,
                frame.x,
                frame.y,
                spriteWidth,
                spriteHeight,
                player.x,
                player.y,
                player.width,
                player.height
            );
        });
    }

    drawObstacles(obstacles) {
        obstacles.forEach(obstacle => {
            let spriteData;
            
            switch(obstacle.type) {
                case 'smallCactus':
                    spriteData = SPRITE_POSITIONS.obstacles.smallCactus[obstacle.variant];
                    break;
                case 'largeCactus':
                    spriteData = SPRITE_POSITIONS.obstacles.largeCactus[obstacle.variant];
                    break;
                case 'bird':
                    spriteData = SPRITE_POSITIONS.obstacles.birds[obstacle.frameIndex];
                    break;
                default:
                    console.error('Unknown obstacle type:', obstacle.type);
                    return;
            }

            if (spriteData) {
                this.ctx.drawImage(
                    spriteManager.spriteSheet,
                    spriteData.x, spriteData.y,
                    spriteData.width, spriteData.height,
                    obstacle.x, obstacle.y,
                    spriteData.width, spriteData.height
                );
            }
        });
    }

    drawUI(gameState, players) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        
        // Tính toán vị trí dựa trên gameMode
        const scoreY = gameState.gameMode === 1 ? 30 : [30, this.canvas.height/2 + 30];
        
        // Draw scores
        players.forEach((player, index) => {
            const y = gameState.gameMode === 1 ? scoreY : scoreY[index];
            this.ctx.fillText(`Player ${index + 1} Score: ${player.score}`, 20, y);
        });
        
        // Draw high score - luôn ở góc phải trên
        const highScoreText = 'High Score: ' + gameState.highScore;
        const highScoreWidth = this.ctx.measureText(highScoreText).width;
        this.ctx.fillText(highScoreText, this.canvas.width - highScoreWidth - 20, 30);
        
        // Draw timer - ở giữa trên cùng
        const timerText = 'Time: ' + gameState.timer + 's';
        const timerWidth = this.ctx.measureText(timerText).width;
        this.ctx.fillText(timerText, (this.canvas.width - timerWidth) / 2, 30);

        // Draw buttons based on game state
        if (!gameState.gameRunning && !gameState.gameOver) {
            this.drawModeButtons();
        } else if (gameState.gameOver) {
            this.drawGameOverButton();
        }
    }

    drawModeButtons() {
        // Vẽ nút ở giữa màn hình
        const buttonY = this.canvas.height / 2 - 20; // Căn giữa theo chiều dọc

        // 1 Player button
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(250, buttonY, 100, 40);
        
        // 2 Players button
        this.ctx.fillRect(450, buttonY, 100, 40);
        
        // Button text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('1 Player', 260, buttonY + 25);
        this.ctx.fillText('2 Players', 460, buttonY + 25);
    }

    drawGameOverButton() {
        // Vẽ nút Restart ở giữa màn hình
        const buttonY = this.canvas.height / 2 - 20;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(350, buttonY, 100, 40);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Restart', 365, buttonY + 25);

        // Game Over text
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 30px Arial';
        const gameOverText = 'Game Over!';
        const textWidth = this.ctx.measureText(gameOverText).width;
        this.ctx.fillText(gameOverText, (this.canvas.width - textWidth) / 2, buttonY - 40);
    }

    updateAnimations() {
        try {
            // Update ground position
            this.groundX = (this.groundX - 5) % SPRITE_POSITIONS.ground.width;

            // Update cloud positions
            this.clouds.forEach(cloud => {
                cloud.x -= 1;
                if (cloud.x + cloud.sprite.width < 0) {
                    cloud.x = this.canvas.width;
                }
            });

            // Update dino animation at a fixed rate
            this.frameCount = (this.frameCount + 1) % 5;
            if (this.frameCount === 0) {
                this.dinoSpriteX = !this.dinoSpriteX;
            }
        } catch (error) {
            console.error('Error in updateAnimations:', error);
        }
    }
} 