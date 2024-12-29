import { GAME_CONFIG } from './config.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameMode = 1;
        this.gameRunning = false;
        this.gameOver = false;
        this.timer = 0;
        this.currentScore = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Reset physics constants
        this.gravity = GAME_CONFIG.GRAVITY;
        this.jumpPower = GAME_CONFIG.JUMP_POWER;
        this.obstacleSpeed = GAME_CONFIG.INITIAL_OBSTACLE_SPEED;
    }

    startGame() {
        console.log('Game state: Starting game with mode:', this.gameMode);
        this.gameRunning = true;
        this.gameOver = false;
        this.timer = 0;
        this.currentScore = 0;
        
        // Reset physics on game start
        this.gravity = GAME_CONFIG.GRAVITY;
        this.jumpPower = GAME_CONFIG.JUMP_POWER;
        this.obstacleSpeed = GAME_CONFIG.INITIAL_OBSTACLE_SPEED;
    }

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
    }

    updateHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('highScore', this.highScore);
        }
    }

    updateObstacleSpeed(score) {
        // Reset về tốc độ ban đầu nếu score = 0
        if (score === 0) {
            this.obstacleSpeed = GAME_CONFIG.INITIAL_OBSTACLE_SPEED;
            return;
        }

        // Tìm mốc tốc độ phù hợp với score hiện tại
        for (let i = 0; i < GAME_CONFIG.SPEED_TIERS.length; i++) {
            const tier = GAME_CONFIG.SPEED_TIERS[i];
            if (score < tier.score) {
                // Nếu chưa đạt đến mốc này, sử dụng tốc độ của mốc trước
                if (i > 0) {
                    this.obstacleSpeed = GAME_CONFIG.SPEED_TIERS[i - 1].speed;
                } else {
                    this.obstacleSpeed = GAME_CONFIG.INITIAL_OBSTACLE_SPEED;
                }
                return;
            }
        }
        
        // Nếu vượt qua tất cả các mốc, sử dụng tốc độ của mốc cuối cùng
        this.obstacleSpeed = GAME_CONFIG.SPEED_TIERS[GAME_CONFIG.SPEED_TIERS.length - 1].speed;
    }
} 