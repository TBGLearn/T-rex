const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = [];
let initialObstacleSpeed = -5; // Initial obstacle speed
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isJumping = false;
let gameRunning = false;
let gameOver = false;
let obstacleSpeed = -5; // Initial obstacle spee    d

let obstacles = [];
let scoreInterval;
let timer = 0; // Initialize timer
let timerInterval; // Variable to store the timer interval
let gameMode = 1; // Default to one-player mode
let scoreTimeCount = 200;

// Sửa đường dẫn sprites
const sprites = {
    dino: new Image(),
    ground: new Image(),
    cactus: new Image(),
    clouds: new Image()
};

// Chỉ cần dùng 1 sprite sheet thay vì nhiều file riêng lẻ
const spriteSheet = new Image();
spriteSheet.src = 'assets/100-offline-sprite.png';

// Định nghĩa vị trí cắt trong sprite sheet
const spritePositions = {
    dino: {
        x: 848,
        y: 2,
        width: 44,
        height: 47,
        frames: [
            { x: 848, y: 2 },  // Frame 1
            { x: 892, y: 2 }   // Frame 2
        ]
    },
    ground: {
        x: 2,
        y: 54,
        width: 600,
        height: 12
    },
    cactus: {
        small: { x: 228, y: 2, width: 17, height: 35 },
        large: { x: 332, y: 2, width: 25, height: 50 }
    },
    cloud: {
        x: 86,
        y: 2,
        width: 46,
        height: 13
    }
};

// Thêm biến cho animation
let groundX = 0;
let cloudX = canvas.width;
let dinoSpriteX = 0; // Để control frame của animation khủng long

// Thêm biến để control animation
let animationFrame = 0;
let frameCount = 0;

let assetsLoaded = 0;
const totalAssets = 4; // số lượng sprites cần load

function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        init(); // Bắt đầu game khi tất cả assets đã load
    }
}

// Thêm event listener cho mỗi sprite
sprites.dino.onload = assetLoaded;
sprites.ground.onload = assetLoaded;
sprites.cactus.onload = assetLoaded;
sprites.clouds.onload = assetLoaded;

sprites.dino.onerror = function() {
    console.error('Error loading dino sprite');
};
// Tương tự cho các sprites khác

// control dino
document.addEventListener('keydown', function(event) {
    if ((event.code === 'KeyW' || event.code === 'Space') && 
        players[0] && !players[0].isJumping && gameRunning) {
        players[0].dy = players[0].jumpPower;
        players[0].isJumping = true;
    }
    if (event.code === 'ArrowUp' && players[1] && !players[1].isJumping && gameRunning) {
        players[1].dy = players[1].jumpPower;
        players[1].isJumping = true;
    }
});
// button start
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x >= 250 && x <= 350 && y >= 80 && y <= 120 && !gameRunning && !gameOver) {
        gameMode = 1;
        canvas.height = 200;
        startGame();
    }

    if (x >= 450 && x <= 550 && y >= 80 && y <= 120 && !gameRunning && !gameOver) {
        gameMode = 2;
        canvas.height = 400;
        startGame();
    }

    if (x >= 350 && x <= 450 && y >= 80 && y <= 120 && gameOver) {
        showModeSelection();
    }
    // if (x >= 350 && x <= 450 && y >= 80 && y <= 120 && !gameRunning) {
    //     gameRunning = true;
    //     gameLoop();
    //     startScoreInterval();
    // }
    // if (x >= 350 && x <= 450 && y >= 80 && y <= 120 && gameOver) {
    //     restartGame();
    // }
});

function drawModeButtons() {
    ctx.fillStyle = '#000';
    ctx.fillRect(250, 80, 100, 40);
    ctx.fillRect(450, 80, 100, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('1 Player', 260, 105);
    ctx.fillText('2 Players', 460, 105);
}

function drawGameOverButton() {
    ctx.fillStyle = '#000';
    ctx.fillRect(350, 80, 100, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Restart', 365, 105);
}

function drawObstacle(obstacle) {
    ctx.fillStyle = obstacle.color || '#000';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    players.forEach((player, index) => {
        ctx.fillText(`Player ${index + 1} Score: ${player.score}`, 10, 20 + index * 20);
    });
    ctx.fillText('High Score: ' + highScore, 10, 60);
    ctx.fillText('Time: ' + timer + 's', 10, 80); // Display timer
}
function updateObstacleSpeed(obstacle, score) {
    const baseSpeed = -5;
    const speedIncrease = Math.floor(score / 100) * 0.5;
    obstacle.dx = baseSpeed - speedIncrease;
}

function updateDinoAnimation() {
    if (gameRunning) {
        frameCount++;
        if (frameCount >= 5) {  // Điều chỉnh tốc độ animation
            frameCount = 0;
            dinoSpriteX = (dinoSpriteX === 0) ? 1 : 0;
        }
    }
}

function checkCollision(player, obstacle) {
    // Tạo hitbox nhỏ hơn một chút so với sprite
    const hitboxReduction = 10;
    return obstacle.x < player.x + player.width - hitboxReduction &&
           obstacle.x + obstacle.width - hitboxReduction > player.x &&
           obstacle.y < player.y + player.height - hitboxReduction &&
           obstacle.y + obstacle.height - hitboxReduction > player.y;
}

function update() {
    if (gameOver) return; // Skip update if game is over

    // Di chuyển ground
    groundX -= 5;
    if (groundX <= -spritePositions.ground.width) {
        groundX = 0;
    }

    // Di chuyển mây
    cloudX -= 1;
    if (cloudX <= -spritePositions.cloud.width) {
        cloudX = canvas.width;
    }

    // Animation cho khủng long khi chạy
    if (gameRunning) {
        dinoSpriteX = (dinoSpriteX === 0) ? 1 : 0; // Chuyển đổi giữa 2 frame
    }

    players.forEach((player, index) => {
        if(player.gameOver) return;
        // Update player position
        player.dy += player.gravity;
        player.y += player.dy;

        if (player.y > player.maxJumpHeight) {
            player.y = player.maxJumpHeight;
            player.dy = 0;
            player.isJumping = false;
        }
        // if (players[1].y > 300) {
        //     players[1].y = 300;
        //     players[1].dy = 0;
        //     players[1].isJumping = false;
        // }

        // Update obstacle speed based on score
        updateObstacleSpeed(obstacles[index], player.score);

        // Update obstacle position
        obstacles[index].x += obstacles[index].dx;
        if (obstacles[index].x + obstacles[index].width < 0) {
            obstacles[index].x = canvas.width;
            //player.score++;
        }

        // Check for collision
        if (checkCollision(player, obstacles[index])) {
            if (player.score > highScore) {
                highScore = player.score;
                localStorage.setItem('highScore', highScore);
            }
            player.gameOver = true;
            // gameOver = true;
            // gameRunning = false;
            // clearInterval(scoreInterval); // Clear the score interval
            // clearInterval(timerInterval); // Clear the timer interval
            // drawGameOverButton();
        }
    });
    // Check if all players are game over
    if (players.every(player => player.gameOver)) {
        gameOver = true;
        gameRunning = false;
        clearInterval(scoreInterval); // Clear the score interval
        clearInterval(timerInterval); // Clear the timer interval
        drawGameOverButton();
    }
    updateDinoAnimation();
}
function draw() {
    if (!spriteSheet.complete) return; // Đợi sprite sheet load xong

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ background màu trắng
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ mây
    ctx.drawImage(
        spriteSheet,
        spritePositions.cloud.x,
        spritePositions.cloud.y,
        spritePositions.cloud.width,
        spritePositions.cloud.height,
        cloudX, 30,
        spritePositions.cloud.width,
        spritePositions.cloud.height
    );
    
    // Vẽ ground liên tục cho player 1
    for(let i = 0; i <= canvas.width/spritePositions.ground.width + 1; i++) {
        ctx.drawImage(
            spriteSheet,
            spritePositions.ground.x,
            spritePositions.ground.y,
            spritePositions.ground.width,
            spritePositions.ground.height,
            groundX + (i * spritePositions.ground.width), 
            canvas.height/2 - 30,
            spritePositions.ground.width,
            spritePositions.ground.height
        );
    }

    // Vẽ thêm ground cho player 2 nếu là chế độ 2 người chơi
    if(gameMode === 2) {
        for(let i = 0; i <= canvas.width/spritePositions.ground.width + 1; i++) {
            ctx.drawImage(
                spriteSheet,
                spritePositions.ground.x,
                spritePositions.ground.y,
                spritePositions.ground.width,
                spritePositions.ground.height,
                groundX + (i * spritePositions.ground.width), 
                canvas.height - 30,
                spritePositions.ground.width,
                spritePositions.ground.height
            );
        }
    }

    // Vẽ khủng long
    players.forEach(player => {
        const frame = spritePositions.dino.frames[dinoSpriteX ? 1 : 0];
        ctx.drawImage(
            spriteSheet,
            frame.x,
            frame.y,
            spritePositions.dino.width,
            spritePositions.dino.height,
            player.x,
            player.y,
            player.width,
            player.height
        );
    });

    // Vẽ obstacles
    obstacles.forEach(obstacle => {
        ctx.drawImage(
            spriteSheet,
            spritePositions.cactus.small.x,
            spritePositions.cactus.small.y,
            spritePositions.cactus.small.width,
            spritePositions.cactus.small.height,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    });

    // Vẽ score và buttons
    if (!gameRunning && !gameOver) {
        drawModeButtons();
    } else if (gameOver) {
        drawGameOverButton();
    }
    drawScore();
}

function gameLoop() {
    if (gameRunning && !gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else if (gameOver) {
        drawGameOverButton();
    }
}
function startScoreInterval() {
    clearInterval(scoreInterval); // Clear any existing interval
    scoreInterval = setInterval(() => {
        if (gameRunning && !gameOver) {
            players.forEach(player => {
                if (!player.gameOver) {
                    player.score++;
                }
            });
        }
    }, scoreTimeCount);
}

function startTimer() {
    clearInterval(timerInterval); // Clear any existing interval
    timer = 0; // Reset timer
    timerInterval = setInterval(() => {
        if (gameRunning && !gameOver) {
            timer++;
        }
    }, 1000);
}

function startGame() {
    players = [
        {
            x: 50,
            y: canvas.height/2 - 80, // Điều chỉnh vị trí player 1
            width: 44,
            height: 47,
            dy: 0,
            gravity: 0.5,
            jumpPower: -10,
            isJumping: false,
            score: 0,
            maxJumpHeight: canvas.height/2 - 80, // Điều chỉnh độ cao nhảy
            gameOver: false
        }
    ];
    
    obstacles = [
        { 
            x: canvas.width, 
            y: canvas.height/2 - 70, // Điều chỉnh vị trí obstacle 1
            width: 20, 
            height: 40, 
            dx: initialObstacleSpeed,
            color: 'red' 
        }
    ];

    if (gameMode === 2) {
        players.push({ 
            x: 50, 
            y: canvas.height - 80, // Điều chỉnh vị trí player 2
            width: 44, 
            height: 47, 
            dy: 0, 
            gravity: 0.5, 
            jumpPower: -10, 
            isJumping: false, 
            score: 0, 
            color: 'green', 
            maxJumpHeight: canvas.height - 80, // Điều chỉnh độ cao nhảy
            gameOver: false 
        });
        
        obstacles.push({ 
            x: canvas.width, 
            y: canvas.height - 70, // Điều chỉnh vị trí obstacle 2
            width: 20, 
            height: 40, 
            dx: initialObstacleSpeed, 
            color: 'green'
        });
    }

    gameRunning = true;
    gameOver = false;
    gameLoop();
    startScoreInterval();
    startTimer();
}

function showModeSelection() {
    gameRunning = false;
    gameOver = false;
    clearInterval(scoreInterval); // Clear the score interval
    clearInterval(timerInterval); // Clear the timer interval
    draw();
    drawModeButtons();
}

function restartGame() {
    timer = 0; // Reset timer
    startGame();
}

function init() {
    draw();
    drawModeButtons();
}

const sounds = {
    jump: new Audio('assets/jump.mp3'),
    die: new Audio('assets/die.mp3'),
    point: new Audio('assets/point.mp3')
};

function playSound(sound) {
    sounds[sound].currentTime = 0;
    sounds[sound].play();
}

// Đợi sprite sheet load xong mới init game
spriteSheet.onload = function() {
    init();
};

spriteSheet.onerror = function() {
    console.error('Error loading sprite sheet');
};