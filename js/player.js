import { GAME_CONFIG } from './config.js';

export class Player {
    constructor(x, groundY, gameState) {
        this.x = x;
        this.groundY = groundY;
        this.gameState = gameState;
        this.reset();
    }

    reset() {
        // Reset position and dimensions
        this.width = 44;
        this.height = 47;
        this.normalWidth = 44;
        this.normalHeight = 47;
        this.duckWidth = 59;
        this.duckHeight = 30;
        
        // Set initial position
        this.height = this.normalHeight;
        this.width = this.normalWidth;
        this.y = this.groundY - this.height;
        
        // Reset physics
        this.dy = 0;
        this.jumpTime = 0;
        this.isJumping = false;
        this.isDucking = false;
        
        // Reset state
        this.score = 0;
        this.gameOver = false;
    }

    jump() {
        if (!this.isDucking && (this.y >= this.groundY - this.height)) {
            this.isJumping = true;
            this.dy = this.gameState.jumpPower;
            this.jumpTime = 0;
        }
    }

    update() {
        if (this.gameOver) return;

        if (this.isJumping) {
            // Tăng thời gian nhảy
            this.jumpTime++;

            // Áp dụng trọng lực với tốc độ giảm dần khi đang lên
            if (this.dy < 0 && this.jumpTime < GAME_CONFIG.JUMP_DURATION) {
                this.dy += this.gameState.gravity * 0.7;
            } else {
                this.dy += this.gameState.gravity;
            }

            // Cập nhật vị trí
            this.y += this.dy;

            // Kiểm tra chạm đất
            if (this.y >= this.groundY - this.height) {
                this.y = this.groundY - this.height;
                this.isJumping = false;
                this.dy = 0;
                this.jumpTime = 0;
            }
        } else {
            this.y = this.groundY - this.height;
        }
    }

    duck(isDucking) {
        if (!this.isJumping) {
            this.isDucking = isDucking;
            this.width = isDucking ? this.duckWidth : this.normalWidth;
            this.height = isDucking ? this.duckHeight : this.normalHeight;
            this.y = this.groundY - this.height;
        }
    }
} 