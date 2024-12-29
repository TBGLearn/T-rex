import { GAME_CONFIG, SPRITE_POSITIONS } from './config.js';

export class Obstacle {
    constructor(x, y, type, variant) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.variant = variant;
        this.frameIndex = 0;
        this.animationCounter = 0;
        
        // Lấy sprite data dựa trên loại obstacle
        let spriteData;
        switch(type) {
            case 'smallCactus':
                spriteData = SPRITE_POSITIONS.obstacles.smallCactus[variant];
                break;
            case 'largeCactus':
                spriteData = SPRITE_POSITIONS.obstacles.largeCactus[variant];
                break;
            case 'bird':
                spriteData = SPRITE_POSITIONS.obstacles.birds[0];
                break;
            default:
                console.error('Invalid obstacle type:', type);
                return;
        }
        
        this.width = spriteData.width;
        this.height = spriteData.height;
        
        // Luôn bắt đầu với tốc độ ban đầu
        this.dx = GAME_CONFIG.INITIAL_OBSTACLE_SPEED;
    }

    update(playerScore) {
        // Cập nhật vị trí với tốc độ hiện tại
        this.x += this.dx;

        // Animate birds
        if (this.type === 'bird') {
            this.animationCounter = (this.animationCounter + 1) % 15;
            if (this.animationCounter === 0) {
                this.frameIndex = (this.frameIndex + 1) % 2;
            }
        }
    }

    static generateRandom(canvas, groundHeight) {
        const types = ['smallCactus', 'largeCactus', 'bird'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let variant = 0;
        let y = groundHeight;

        switch(type) {
            case 'bird':
                // Birds can fly at different heights
                const heights = [
                    groundHeight - 40,  // Low
                    groundHeight - 70,  // Medium
                    groundHeight - 100  // High
                ];
                y = heights[Math.floor(Math.random() * heights.length)];
                break;
            case 'smallCactus':
                variant = Math.floor(Math.random() * SPRITE_POSITIONS.obstacles.smallCactus.length);
                y = groundHeight - SPRITE_POSITIONS.obstacles.smallCactus[variant].height;
                break;
            case 'largeCactus':
                variant = Math.floor(Math.random() * SPRITE_POSITIONS.obstacles.largeCactus.length);
                y = groundHeight - SPRITE_POSITIONS.obstacles.largeCactus[variant].height;
                break;
        }

        return new Obstacle(canvas.width, y, type, variant);
    }
} 