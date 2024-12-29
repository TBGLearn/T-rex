import { SPRITE_POSITIONS } from './config.js';

class SpriteManager {
    constructor() {
        this.spriteSheet = new Image();
        this.loaded = false;
        
        this.spriteSheet.onload = () => {
            console.log('Sprite sheet loaded successfully!');
            this.loaded = true;
        };

        this.spriteSheet.onerror = (err) => {
            console.error('Failed to load sprite sheet:', err);
        };

        this.loadPromise = new Promise((resolve, reject) => {
            this.spriteSheet.onload = () => {
                console.log('Sprite sheet loaded successfully!');
                this.loaded = true;
                resolve();
            };
            
            this.spriteSheet.onerror = (err) => {
                console.error('Failed to load sprite sheet:', err);
                reject(err);
            };
        });

        this.spriteSheet.src = 'assets/100-offline-sprite.png';
    }

    async waitForLoad() {
        return this.loadPromise;
    }

    isLoaded() {
        return this.loaded && this.spriteSheet.complete;
    }
}

export const spriteManager = new SpriteManager(); 