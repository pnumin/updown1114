import { DIFFICULTIES, GAME_STATUS } from "./constants.js";
import {
  createGame,
  createInitialState,
  validateGuess,
  applyGuess
} from "./game.js";
import {
  loadGameData,
  updateRecord,
  updateSettings
} from "./storage.js";
import { playFeedback, vibrate } from "./audio.js";
import { shareResult } from "./share.js";
import {
  showScreen,
  renderDifficulties,
  updateSelectedDifficulty,
  renderGame,
  resetGameFeedback,
  renderGuessFeedback,
  showInputError,
  clearInputError,
  clearGuessInput,
  setGuessInputEnabled,
  renderFinalResult,
  updateSoundButton,
  showShareFeedback
} from "./ui.js";

const elements = {
  startButton: document.querySelector("#start-button"),
  guessForm: document.querySelector("#guess-form"),
  guessInput: document.querySelector("#guess-input"),
  quitButton: document.querySelector("#quit-button"),
  restartButton: document.querySelector("#restart-button"),
  shareButton: document.querySelector("#share-button"),
  changeDifficultyButton: document.querySelector("#change-difficulty-button"),
  soundToggle: document.querySelector("#sound-toggle"),
  helpButton: document.querySelector("#help-button"),
  helpDialog: document.querySelector("#help-dialog"),
  helpCloseButton: document.querySelector("#help-close-button"),
  helpConfirmButton: document.querySelector("#help-confirm-button"),
  quitDialog: document.querySelector("#quit-dialog"),
  quitCancelButton: document.querySelector("#quit-cancel-button"),
  quitConfirmButton: document.querySelector("#quit-confirm-button")
};

let savedData = loadGameData();
let selectedDifficultyId = "normal";
let gameState = createInitialState();

function initializeApp() {
  renderDifficultyOptions();
  updateSoundButton(savedData.settings.soundEnabled);
  bindEvents();
  showScreen("start");
}

function renderDifficultyOptions() {
  renderDifficulties(
    DIFFICULTIES,
    selectedDifficultyId,
    savedData.records,
    handleDifficultySelect
  );
}

function bindEvents() {
  elements.startButton.addEventListener("click", startGame);
  elements.guessForm.addEventListener("submit", handleGuessSubmit);
  elements.quitButton.addEventListener("click", openQuitDialog);
  elements.restartButton.addEventListener("click", startGame);
  elements.shareButton.addEventListener("click", handleShare);
  elements.changeDifficultyButton.addEventListener(
    "click",
    returnToStart
  );
  elements.soundToggle.addEventListener("click", toggleSound);

  elements.helpButton.addEventListener("click", () => {
    elements.helpDialog.showModal();
  });
  elements.helpCloseButton.addEventListener("click", closeHelpDialog);
  elements.helpConfirmButton.addEventListener("click", closeHelpDialog);

  elements.quitCancelButton.addEventListener("click", () => {
    elements.quitDialog.close();
    elements.guessInput.focus();
  });
  elements.quitConfirmButton.addEventListener("click", () => {
    elements.quitDialog.close();
    returnToStart();
  });

  elements.helpDialog.addEventListener("click", closeDialogOnBackdrop);
  elements.quitDialog.addEventListener("click", closeDialogOnBackdrop);

  elements.guessInput.addEventListener("input", clearInputError);
}

function handleDifficultySelect(difficultyId) {
  selectedDifficultyId = difficultyId;
  updateSelectedDifficulty(difficultyId);
}

function startGame() {
  const difficulty = DIFFICULTIES[selectedDifficultyId];

  gameState = createGame(difficulty);
  resetGameFeedback();
  renderGame(gameState);
  setGuessInputEnabled(true);
  showScreen("game");

  window.setTimeout(() => {
    clearGuessInput();
  }, 80);
}

function handleGuessSubmit(event) {
  event.preventDefault();

  const validation = validateGuess(elements.guessInput.value, gameState);

  if (!validation.valid) {
    showInputError(validation.message);
    playFeedback("ERROR", savedData.settings.soundEnabled);
    vibrate(35, savedData.settings.vibrationEnabled);
    return;
  }

  clearInputError();

  const previousStatus = gameState.status;
  const guessOutcome = applyGuess(gameState, validation.value);

  gameState = guessOutcome.state;
  renderGame(gameState);

  if (gameState.status === GAME_STATUS.PLAYING) {
    renderGuessFeedback(guessOutcome.result, validation.value);
    playFeedback(guessOutcome.result, savedData.settings.soundEnabled);
    vibrate(guessOutcome.result === "UP" ? 40 : [25, 25, 25], savedData.settings.vibrationEnabled);
    clearGuessInput();
    return;
  }

  if (previousStatus === GAME_STATUS.PLAYING) {
    finishGame();
  }
}

function finishGame() {
  const won = gameState.status === GAME_STATUS.WON;
  const recordInfo = won
    ? updateRecord(
        savedData,
        gameState.difficulty.id,
        gameState.attemptsUsed
      )
    : {
        isNewRecord: false,
        record: savedData.records[gameState.difficulty.id]
      };

  setGuessInputEnabled(false);
  renderFinalResult(gameState, recordInfo);

  if (won) {
    playFeedback("CORRECT", savedData.settings.soundEnabled);
    vibrate([70, 40, 120], savedData.settings.vibrationEnabled);
  } else {
    playFeedback("LOST", savedData.settings.soundEnabled);
    vibrate([100, 60, 100], savedData.settings.vibrationEnabled);
  }

  window.setTimeout(() => {
    showScreen("result");
  }, 420);
}

function returnToStart() {
  gameState = createInitialState();
  renderDifficultyOptions();
  showScreen("start");
  elements.startButton.focus();
}

function openQuitDialog() {
  elements.quitDialog.showModal();
}

function closeHelpDialog() {
  elements.helpDialog.close();
  elements.helpButton.focus();
}

function closeDialogOnBackdrop(event) {
  if (event.target === event.currentTarget) {
    event.currentTarget.close();
  }
}

function toggleSound() {
  const nextValue = !savedData.settings.soundEnabled;

  updateSettings(savedData, {
    soundEnabled: nextValue
  });
  updateSoundButton(nextValue);

  if (nextValue) {
    playFeedback("UP", true);
  }
}

async function handleShare() {
  const result = await shareResult({
    difficulty: gameState.difficulty,
    attempts: gameState.attemptsUsed,
    won: gameState.status === GAME_STATUS.WON
  });

  if (result.cancelled) {
    return;
  }

  if (result.success && result.method === "share") {
    showShareFeedback("결과를 공유했어요.");
    return;
  }

  if (result.success && result.method === "clipboard") {
    showShareFeedback("결과를 클립보드에 복사했어요.");
    return;
  }

  if (result.fallbackText) {
    window.prompt(
      "아래 내용을 직접 복사해 주세요.",
      result.fallbackText
    );
    showShareFeedback("공유 내용을 표시했어요.");
    return;
  }

  showShareFeedback("결과를 공유하지 못했습니다.", true);
}

initializeApp();
