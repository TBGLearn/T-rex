export class Controls {
    constructor(gameState, players) {
        this.gameState = gameState;
        this.players = players;
        this.setupControls();
    }

    setupControls() {
        this.keydownHandler = (e) => {
            if (this.gameState.gameRunning && !this.gameState.gameOver) {
                switch(e.code) {
                    // Player 1 controls
                    case 'Space':
                    case 'ArrowUp':
                        this.players[0]?.jump();
                        break;
                    case 'ArrowDown':
                        this.players[0]?.duck(true);
                        break;
                        
                    // Player 2 controls
                    case 'KeyW':
                        if (this.gameState.gameMode === 2) {
                            this.players[1]?.jump();
                        }
                        break;
                    case 'KeyS':
                        if (this.gameState.gameMode === 2) {
                            this.players[1]?.duck(true);
                        }
                        break;
                }
            }
        };

        this.keyupHandler = (e) => {
            if (this.gameState.gameRunning && !this.gameState.gameOver) {
                switch(e.code) {
                    // Player 1 controls
                    case 'ArrowDown':
                        this.players[0]?.duck(false);
                        break;
                        
                    // Player 2 controls
                    case 'KeyS':
                        if (this.gameState.gameMode === 2) {
                            this.players[1]?.duck(false);
                        }
                        break;
                }
            }
        };

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    cleanup() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
    }
} 