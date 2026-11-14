import { GAME_STATUS, GUESS_RESULT } from "./constants.js";

const elements = {
  screens: {
    start: document.querySelector("#start-screen"),
    game: document.querySelector("#game-screen"),
    result: document.querySelector("#result-screen")
  },
  difficultyList: document.querySelector("#difficulty-list"),
  rangeDisplay: document.querySelector("#range-display"),
  rangeTrackFill: document.querySelector("#range-track-fill"),
  attemptsRemaining: document.querySelector("#attempts-remaining"),
  attemptDots: document.querySelector("#attempt-dots"),
  attemptsCard: document.querySelector(".status-card--attempts"),
  resultCard: document.querySelector("#result-card"),
  resultIcon: document.querySelector("#result-icon"),
  resultLabel: document.querySelector("#result-label"),
  resultMessage: document.querySelector("#result-message"),
  guessInput: document.querySelector("#guess-input"),
  inputHelp: document.querySelector("#input-help"),
  inputError: document.querySelector("#input-error"),
  historyList: document.querySelector("#history-list"),
  historyCount: document.querySelector("#history-count"),
  finalSummary: document.querySelector(".result-summary"),
  finalSymbol: document.querySelector("#final-symbol"),
  finalEyebrow: document.querySelector("#final-eyebrow"),
  finalTitle: document.querySelector("#final-title"),
  finalDescription: document.querySelector("#final-description"),
  finalAnswer: document.querySelector("#final-answer"),
  finalAttempts: document.querySelector("#final-attempts"),
  finalDifficulty: document.querySelector("#final-difficulty"),
  finalRecord: document.querySelector("#final-record"),
  newRecordMessage: document.querySelector("#new-record-message"),
  shareFeedback: document.querySelector("#share-feedback"),
  soundToggle: document.querySelector("#sound-toggle"),
  soundIcon: document.querySelector("#sound-icon")
};

export function showScreen(screenName) {
  Object.entries(elements.screens).forEach(([name, screen]) => {
    const isActive = name === screenName;
    screen.hidden = !isActive;
    screen.classList.toggle("screen--active", isActive);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function renderDifficulties(
  difficulties,
  selectedDifficultyId,
  records,
  onSelect
) {
  elements.difficultyList.replaceChildren();

  Object.values(difficulties).forEach((difficulty) => {
    const button = document.createElement("button");
    const record = records[difficulty.id];

    button.type = "button";
    button.className = "difficulty-card";
    button.setAttribute("role", "radio");
    button.setAttribute(
      "aria-checked",
      String(difficulty.id === selectedDifficultyId)
    );
    button.dataset.difficultyId = difficulty.id;

    const check = document.createElement("span");
    check.className = "difficulty-card__check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";

    const name = document.createElement("span");
    name.className = "difficulty-card__name";
    name.textContent = difficulty.label;

    const range = document.createElement("span");
    range.className = "difficulty-card__range";
    range.textContent = `${difficulty.minNumber} ~ ${difficulty.maxNumber}`;

    const meta = document.createElement("span");
    meta.className = "difficulty-card__meta";
    meta.textContent = `${difficulty.maxAttempts}회 도전 · ${difficulty.description}`;

    const recordElement = document.createElement("span");
    recordElement.className = "difficulty-card__record";
    recordElement.textContent =
      typeof record === "number"
        ? `BEST ${record}회`
        : "BEST 기록 없음";

    button.append(check, name, range, meta, recordElement);

    button.addEventListener("click", () => {
      onSelect(difficulty.id);
    });

    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        return;
      }

      event.preventDefault();

      const cards = [...elements.difficultyList.querySelectorAll("[role='radio']")];
      const currentIndex = cards.indexOf(button);
      const direction =
        event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + direction + cards.length) % cards.length;

      cards[nextIndex].click();
      cards[nextIndex].focus();
    });

    elements.difficultyList.append(button);
  });
}

export function updateSelectedDifficulty(difficultyId) {
  elements.difficultyList
    .querySelectorAll("[role='radio']")
    .forEach((card) => {
      card.setAttribute(
        "aria-checked",
        String(card.dataset.difficultyId === difficultyId)
      );
    });
}

export function renderGame(state) {
  const { difficulty } = state;
  const totalRange = difficulty.maxNumber - difficulty.minNumber + 1;
  const currentRange = state.currentMax - state.currentMin + 1;
  const rangeRatio = Math.max(0, (currentRange / totalRange) * 100);

  elements.rangeDisplay.replaceChildren(
    document.createTextNode(String(state.currentMin)),
    createRangeSeparator(),
    document.createTextNode(String(state.currentMax))
  );
  elements.rangeTrackFill.style.width = `${rangeRatio}%`;
  elements.attemptsRemaining.textContent = String(state.attemptsRemaining);
  elements.attemptsCard.classList.toggle(
    "is-warning",
    state.attemptsRemaining <= 3
  );

  renderAttemptDots(state);
  renderHistory(state.history);
  updateInputRange(state);
}

function createRangeSeparator() {
  const separator = document.createElement("span");
  separator.textContent = "~";
  return separator;
}

function renderAttemptDots(state) {
  elements.attemptDots.replaceChildren();

  for (let index = 0; index < state.difficulty.maxAttempts; index += 1) {
    const dot = document.createElement("span");

    if (index < state.attemptsUsed) {
      dot.classList.add("is-used");
    }

    elements.attemptDots.append(dot);
  }
}

function updateInputRange(state) {
  elements.guessInput.min = String(state.currentMin);
  elements.guessInput.max = String(state.currentMax);
  elements.guessInput.placeholder = `${state.currentMin} ~ ${state.currentMax}`;
  elements.inputHelp.textContent =
    `${state.currentMin}부터 ${state.currentMax} 사이의 정수를 입력하세요.`;
}

export function resetGameFeedback() {
  elements.resultCard.className = "result-card";
  elements.resultIcon.textContent = "?";
  elements.resultLabel.textContent = "첫 번째 숫자를 입력해 보세요";
  elements.resultMessage.textContent = "정답은 현재 범위 안에 있어요.";
  clearInputError();
}

export function renderGuessFeedback(result, value) {
  elements.resultCard.className = "result-card";

  if (result === GUESS_RESULT.UP) {
    elements.resultCard.classList.add("is-up");
    elements.resultIcon.textContent = "↑";
    elements.resultLabel.textContent = `${value}보다 높은 숫자`;
    elements.resultMessage.textContent = "UP! 더 큰 숫자를 입력하세요.";
  }

  if (result === GUESS_RESULT.DOWN) {
    elements.resultCard.classList.add("is-down");
    elements.resultIcon.textContent = "↓";
    elements.resultLabel.textContent = `${value}보다 낮은 숫자`;
    elements.resultMessage.textContent = "DOWN! 더 작은 숫자를 입력하세요.";
  }
}

export function renderHistory(history) {
  elements.historyList.replaceChildren();
  elements.historyCount.textContent = `${history.length}회`;

  if (history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "history-empty";

    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⌁";

    emptyItem.append(icon, document.createTextNode("아직 입력 기록이 없어요."));
    elements.historyList.append(emptyItem);
    return;
  }

  history.forEach((item) => {
    const listItem = document.createElement("li");
    const resultClass = item.result.toLowerCase();
    const resultText =
      item.result === GUESS_RESULT.CORRECT
        ? "정답 ✓"
        : item.result === GUESS_RESULT.UP
          ? "UP ↑"
          : "DOWN ↓";

    listItem.className = `history-item history-item--${resultClass}`;

    const numberGroup = document.createElement("div");
    const number = document.createElement("span");
    const attempt = document.createElement("span");

    number.className = "history-item__number";
    number.textContent = String(item.value);
    attempt.className = "history-item__attempt";
    attempt.textContent = `${item.attemptNumber}번째 시도`;

    numberGroup.append(number, attempt);

    const result = document.createElement("span");
    result.className = "history-item__result";
    result.textContent = resultText;

    listItem.append(numberGroup, result);
    elements.historyList.append(listItem);
  });
}

export function showInputError(message) {
  elements.guessInput.setAttribute("aria-invalid", "true");
  elements.inputError.textContent = message;
  elements.guessInput.focus();
}

export function clearInputError() {
  elements.guessInput.removeAttribute("aria-invalid");
  elements.inputError.textContent = "";
}

export function clearGuessInput() {
  elements.guessInput.value = "";
  elements.guessInput.focus();
}

export function setGuessInputEnabled(enabled) {
  elements.guessInput.disabled = !enabled;
  document.querySelector("#guess-form button[type='submit']").disabled = !enabled;
}

export function renderFinalResult(state, recordInfo) {
  const won = state.status === GAME_STATUS.WON;

  elements.finalSummary.classList.toggle("is-lost", !won);
  elements.finalSymbol.textContent = won ? "✓" : "×";
  elements.finalEyebrow.textContent = won ? "GAME CLEAR" : "GAME OVER";
  elements.finalTitle.textContent = won ? "정답입니다!" : "아쉽네요!";
  elements.finalDescription.textContent = won
    ? `총 ${state.attemptsUsed}번 만에 숨겨진 숫자를 찾았습니다.`
    : "모든 기회를 사용했습니다. 다시 도전해 보세요.";
  elements.finalAnswer.textContent = String(state.answer);
  elements.finalAttempts.textContent = `${state.attemptsUsed}회`;
  elements.finalDifficulty.textContent = state.difficulty.label;
  elements.finalRecord.textContent =
    typeof recordInfo.record === "number"
      ? `${recordInfo.record}회`
      : "-";
  elements.newRecordMessage.hidden = !recordInfo.isNewRecord;
  elements.shareFeedback.textContent = "";
}

export function updateSoundButton(enabled) {
  elements.soundToggle.setAttribute("aria-pressed", String(enabled));
  elements.soundToggle.setAttribute(
    "aria-label",
    enabled ? "사운드 끄기" : "사운드 켜기"
  );
  elements.soundIcon.textContent = enabled ? "🔊" : "🔇";
}

export function showShareFeedback(message, isError = false) {
  elements.shareFeedback.textContent = message;
  elements.shareFeedback.style.color = isError
    ? "var(--color-danger)"
    : "var(--color-success)";
}
