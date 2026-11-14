let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function playTone(frequency, duration, type = "sine", delay = 0, volume = 0.08) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + delay;
  const endAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

export function playFeedback(type, enabled) {
  if (!enabled) {
    return;
  }

  if (type === "UP") {
    playTone(392, 0.1, "sine", 0);
    playTone(523, 0.14, "sine", 0.09);
  } else if (type === "DOWN") {
    playTone(523, 0.1, "sine", 0);
    playTone(392, 0.14, "sine", 0.09);
  } else if (type === "CORRECT") {
    playTone(523, 0.12, "sine", 0);
    playTone(659, 0.12, "sine", 0.11);
    playTone(784, 0.22, "sine", 0.22);
  } else if (type === "LOST") {
    playTone(330, 0.14, "triangle", 0);
    playTone(247, 0.22, "triangle", 0.12);
  } else if (type === "ERROR") {
    playTone(180, 0.12, "square", 0, 0.035);
  }
}

export function vibrate(pattern, enabled) {
  if (!enabled || !("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate(pattern);
}
