import { GAME_STATUS, GUESS_RESULT } from "./constants.js";

export function createInitialState() {
  return {
    status: GAME_STATUS.READY,
    difficulty: null,
    answer: null,
    currentMin: null,
    currentMax: null,
    attemptsUsed: 0,
    attemptsRemaining: 0,
    history: [],
    startedAt: null,
    endedAt: null
  };
}

export function createRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createGame(difficulty) {
  return {
    status: GAME_STATUS.PLAYING,
    difficulty,
    answer: createRandomNumber(
      difficulty.minNumber,
      difficulty.maxNumber
    ),
    currentMin: difficulty.minNumber,
    currentMax: difficulty.maxNumber,
    attemptsUsed: 0,
    attemptsRemaining: difficulty.maxAttempts,
    history: [],
    startedAt: Date.now(),
    endedAt: null
  };
}

export function validateGuess(rawValue, state) {
  if (state.status !== GAME_STATUS.PLAYING) {
    return {
      valid: false,
      code: "NOT_PLAYING",
      message: "현재 진행 중인 게임이 없습니다."
    };
  }

  if (String(rawValue).trim() === "") {
    return {
      valid: false,
      code: "EMPTY",
      message: "숫자를 입력해 주세요."
    };
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return {
      valid: false,
      code: "NOT_INTEGER",
      message: "정수를 입력해 주세요."
    };
  }

  if (value < state.currentMin || value > state.currentMax) {
    return {
      valid: false,
      code: "OUT_OF_RANGE",
      message: `현재 가능한 범위는 ${state.currentMin}부터 ${state.currentMax}까지입니다.`
    };
  }

  const isDuplicated = state.history.some(
    (historyItem) => historyItem.value === value
  );

  if (isDuplicated) {
    return {
      valid: false,
      code: "DUPLICATED",
      message: "이미 입력한 숫자입니다."
    };
  }

  return {
    valid: true,
    value
  };
}

export function applyGuess(state, value) {
  let result;

  if (value < state.answer) {
    result = GUESS_RESULT.UP;
  } else if (value > state.answer) {
    result = GUESS_RESULT.DOWN;
  } else {
    result = GUESS_RESULT.CORRECT;
  }

  const nextState = {
    ...state,
    attemptsUsed: state.attemptsUsed + 1,
    attemptsRemaining: state.attemptsRemaining - 1,
    history: [
      {
        value,
        result,
        attemptNumber: state.attemptsUsed + 1
      },
      ...state.history
    ]
  };

  if (result === GUESS_RESULT.CORRECT) {
    nextState.status = GAME_STATUS.WON;
    nextState.endedAt = Date.now();
    return { state: nextState, result };
  }

  if (result === GUESS_RESULT.UP) {
    nextState.currentMin = value + 1;
  }

  if (result === GUESS_RESULT.DOWN) {
    nextState.currentMax = value - 1;
  }

  if (nextState.attemptsRemaining <= 0) {
    nextState.status = GAME_STATUS.LOST;
    nextState.endedAt = Date.now();
  }

  return { state: nextState, result };
}
