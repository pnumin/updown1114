export const DIFFICULTIES = {
  easy: {
    id: "easy",
    label: "쉬움",
    minNumber: 1,
    maxNumber: 50,
    maxAttempts: 10,
    description: "가볍게 시작하기"
  },
  normal: {
    id: "normal",
    label: "보통",
    minNumber: 1,
    maxNumber: 100,
    maxAttempts: 10,
    description: "균형 잡힌 난이도"
  },
  hard: {
    id: "hard",
    label: "어려움",
    minNumber: 1,
    maxNumber: 500,
    maxAttempts: 12,
    description: "집중력이 필요한 도전"
  }
};

export const GAME_STATUS = {
  READY: "READY",
  PLAYING: "PLAYING",
  WON: "WON",
  LOST: "LOST"
};

export const GUESS_RESULT = {
  UP: "UP",
  DOWN: "DOWN",
  CORRECT: "CORRECT"
};

export const STORAGE_KEY = "upDownGame";
