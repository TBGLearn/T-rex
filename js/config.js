export const CANVAS_CONFIG = {
    WIDTH: 800,
    HEIGHT: 200,
    HEIGHT_2P: 400,
    GROUND_HEIGHT: 150,
    GROUND_HEIGHT_2P: 350
};

export const GAME_CONFIG = {
    INITIAL_OBSTACLE_SPEED: -4,
    SCORE_TIME_COUNT: 100,
    GRAVITY: 0.6,
    JUMP_POWER: -10,
    JUMP_DURATION: 12,
    MAX_SPEED: -12,
    SPEED_TIERS: [
        { score: 0, speed: -4 },
        { score: 100, speed: -5 },
        { score: 300, speed: -6 },
        { score: 500, speed: -7 },
        { score: 1000, speed: -8 }
    ],
    OBSTACLE_FREQUENCY: {
        INITIAL: 0.008,
        MAX: 0.02
    }
};

export const SPRITE_POSITIONS = {
    dino: {
        width: 44,
        height: 47,
        frames: {
            run: [
                { x: 848, y: 2, width: 44, height: 47 },
                { x: 892, y: 2, width: 44, height: 47 }
            ],
            duck: [
                { x: 1112, y: 19, width: 59, height: 30 },
                { x: 1171, y: 19, width: 59, height: 30 }
            ],
            jump: { x: 848, y: 2, width: 44, height: 47 },
            dead: { x: 1024, y: 2, width: 44, height: 47 }
        }
    },
    obstacles: {
        smallCactus: [
            { x: 228, y: 2, width: 17, height: 35 },
            { x: 245, y: 2, width: 34, height: 35 },
            { x: 279, y: 2, width: 51, height: 35 }
        ],
        largeCactus: [
            { x: 332, y: 2, width: 25, height: 50 },
            { x: 357, y: 2, width: 50, height: 50 },
            { x: 407, y: 2, width: 75, height: 50 }
        ],
        birds: [
            { x: 134, y: 2, width: 46, height: 40 },
            { x: 180, y: 2, width: 46, height: 40 }
        ]
    },
    clouds: [
        { x: 86, y: 2, width: 46, height: 13 },
        { x: 86, y: 2, width: 46, height: 13 }
    ],
    stars: [
        { x: 645, y: 2, width: 9, height: 9 },
        { x: 645, y: 2, width: 9, height: 9 }
    ],
    moon: { x: 484, y: 2, width: 20, height: 40 },
    ground: {
        x: 2,
        y: 54,
        width: 600,
        height: 12
    }
}; 