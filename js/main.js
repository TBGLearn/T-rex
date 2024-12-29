import { GameState } from './gameState.js';
import { Renderer } from './renderer.js';
import { Controls } from './controls.js';
import { Player } from './player.js';
import { Obstacle } from './obstacle.js';
import { CANVAS_CONFIG, GAME_CONFIG } from './config.js';
import { spriteManager } from './sprites.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_CONFIG.WIDTH;
        this.canvas.height = CANVAS_CONFIG.HEIGHT;
        
        this.gameState = new GameState();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.players = [];
        this.obstacles = [];
        this.scoreInterval = null;
        this.timerInterval = null;
        
        // Bind gameLoop
        this.gameLoop = this.gameLoop.bind(this);
        
        // Khởi tạo game
        this.initGame();
    }

    async initGame() {
        try {
            await spriteManager.waitForLoad();
            console.log('Sprite sheet loaded, initializing game...');
            this.init();
            this.setupEventListeners();
        } catch (err) {
            console.error('Failed to initialize game:', err);
        }
    }

    init() {
        // Draw initial screen
        this.renderer.draw(this.gameState, this.players, this.obstacles);
        this.renderer.drawModeButtons();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            this.handleCanvasClick(x, y);
        });

        this.controls = new Controls(this.gameState, this.players);
    }

    handleCanvasClick(x, y) {
        console.log('Click at:', x, y);
        const buttonY = this.canvas.height / 2 - 20;
        
        // Mode selection buttons
        if (!this.gameState.gameRunning && !this.gameState.gameOver) {
            // 1 Player button
            if (x >= 250 && x <= 350 && y >= buttonY && y <= buttonY + 40) {
                console.log('Starting 1 player mode');
                this.gameState.gameMode = 1;
                this.canvas.height = CANVAS_CONFIG.HEIGHT;
                this.startGame();
                return;
            }
            // 2 Players button
            if (x >= 450 && x <= 550 && y >= buttonY && y <= buttonY + 40) {
                this.gameState.gameMode = 2;
                this.canvas.height = CANVAS_CONFIG.HEIGHT_2P;
                this.startGame();
                return;
            }
        }

        // Restart button
        if (this.gameState.gameOver && 
            x >= 350 && x <= 450 && y >= buttonY && y <= buttonY + 40) {
            console.log('Restarting game');
            this.showModeSelection();
        }
    }

    startGame() {
        console.log('Starting new game with mode:', this.gameState.gameMode);
        
        // Cleanup hoàn toàn
        this.cleanup();
        
        // Tạo mới game state
        this.gameState = new GameState();
        this.gameState.gameMode = this.gameState.gameMode;
        this.gameState.startGame();
        
        // Tạo mới players
        this.createPlayers();
        
        // Setup controls mới
        this.controls = new Controls(this.gameState, this.players);
        
        // Bắt đầu các hệ thống game
        this.startScoreInterval();
        this.startTimer();
        
        // Bắt đầu game loop
        requestAnimationFrame(this.gameLoop);
    }

    cleanup() {
        // Clear all intervals
        if (this.scoreInterval) clearInterval(this.scoreInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Clear all game objects
        this.players = [];
        this.obstacles = [];
        
        // Reset controls
        if (this.controls) {
            this.controls.cleanup();
            this.controls = null;
        }
        
        this.scoreInterval = null;
        this.timerInterval = null;
    }

    createPlayers() {
        // Create player 1
        this.players.push(
            new Player(
                50,  // x position
                CANVAS_CONFIG.GROUND_HEIGHT,  // groundY
                this.gameState  // Truyền gameState vào
            )
        );
        
        // Create player 2 if in 2 player mode
        if (this.gameState.gameMode === 2) {
            this.players.push(
                new Player(
                    50,  // x position
                    CANVAS_CONFIG.GROUND_HEIGHT_2P,  // groundY
                    this.gameState  // Truyền gameState vào
                )
            );
        }
    }

    startScoreInterval() {
        clearInterval(this.scoreInterval);
        this.scoreInterval = setInterval(() => {
            if (this.gameState.gameRunning && !this.gameState.gameOver) {
                this.players.forEach(player => {
                    if (!player.gameOver) {
                        player.score++;
                        // Cập nhật tốc độ dựa trên điểm số mới
                        this.gameState.updateObstacleSpeed(player.score);
                    }
                });
            }
        }, GAME_CONFIG.SCORE_TIME_COUNT);
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.gameState.gameRunning && !this.gameState.gameOver) {
                this.gameState.timer++;
            }
        }, 1000);
    }

    gameLoop() {
        // Chỉ update và vẽ khi game đang chạy
        if (this.gameState.gameRunning && !this.gameState.gameOver) {
            // Update game objects
            this.renderer.updateAnimations();
            
            // Update players
            this.players.forEach(player => {
                if (!player.gameOver) {
                    player.update();
                }
            });

            // Update và filter obstacles với tốc độ hiện tại từ gameState
            this.obstacles = this.obstacles.filter(obstacle => {
                // Sử dụng tốc độ từ gameState
                obstacle.dx = this.gameState.obstacleSpeed;
                obstacle.update(Math.max(...this.players.map(p => p.score)));
                return obstacle.x + obstacle.width > 0;
            });

            // Generate new obstacles
            if (this.obstacles.length < 3) {
                this.players.forEach((player, index) => {
                    if (!player.gameOver && Math.random() < 0.01) {
                        const groundHeight = index === 0 ? 
                            CANVAS_CONFIG.GROUND_HEIGHT : 
                            CANVAS_CONFIG.GROUND_HEIGHT_2P;
                        
                        const lastObstacle = this.obstacles[this.obstacles.length - 1];
                        if (!lastObstacle || lastObstacle.x < this.canvas.width - 300) {
                            try {
                                const obstacle = Obstacle.generateRandom(
                                    this.canvas,
                                    groundHeight
                                );
                                if (obstacle) {
                                    this.obstacles.push(obstacle);
                                }
                            } catch (error) {
                                console.error('Error generating obstacle:', error);
                            }
                        }
                    }
                });
            }

            // Check collisions
            this.players.forEach(player => {
                if (!player.gameOver) {
                    for (const obstacle of this.obstacles) {
                        if (this.checkCollision(player, obstacle)) {
                            player.gameOver = true;
                            this.gameState.updateHighScore(player.score);
                            break;
                        }
                    }
                }
            });

            // Check game over condition
            if (this.players.every(player => player.gameOver)) {
                this.gameState.endGame();
                clearInterval(this.scoreInterval);
                clearInterval(this.timerInterval);
            }
        }

        // Vẽ frame hiện tại
        this.renderer.draw(this.gameState, this.players, this.obstacles);

        // Request next frame
        requestAnimationFrame(this.gameLoop);
    }

    checkCollisions() {
        this.players.forEach(player => {
            if (!player.gameOver) {
                for (const obstacle of this.obstacles) {
                    if (this.checkCollision(player, obstacle)) {
                        player.gameOver = true;
                        this.gameState.updateHighScore(player.score);
                        break;
                    }
                }
            }
        });

        if (this.players.every(player => player.gameOver)) {
            this.gameState.endGame();
            clearInterval(this.scoreInterval);
            clearInterval(this.timerInterval);
        }
    }

    checkCollision(player, obstacle) {
        const hitboxReduction = player.isDucking ? 5 : 10;
        
        const playerHitbox = {
            x: player.x + hitboxReduction,
            y: player.y + hitboxReduction,
            width: player.width - (hitboxReduction * 2),
            height: player.height - (hitboxReduction * 2)
        };
        
        const obstacleHitbox = {
            x: obstacle.x + hitboxReduction,
            y: obstacle.y + hitboxReduction,
            width: obstacle.width - (hitboxReduction * 2),
            height: obstacle.height - (hitboxReduction * 2)
        };

        return !(playerHitbox.x + playerHitbox.width < obstacleHitbox.x || 
                 playerHitbox.x > obstacleHitbox.x + obstacleHitbox.width || 
                 playerHitbox.y + playerHitbox.height < obstacleHitbox.y ||
                 playerHitbox.y > obstacleHitbox.y + obstacleHitbox.height);
    }

    showModeSelection() {
        // Reset mọi thứ về ban đầu
        this.cleanup();
        this.gameState = new GameState(); // Tạo mới hoàn toàn game state
        
        // Reset canvas
        this.canvas.height = CANVAS_CONFIG.HEIGHT;
        
        // Vẽ lại màn hình ban đầu
        this.renderer.draw(this.gameState, [], []);
        this.renderer.drawModeButtons();
    }
}

// Start the game
const game = new Game(); 