export function createShareText({ difficulty, attempts, won }) {
  if (won) {
    return [
      "🎯 UP & DOWN 도전 성공!",
      `난이도: ${difficulty.label}`,
      `기록: ${attempts}회`,
      "당신도 숨겨진 숫자를 맞혀보세요!"
    ].join("\n");
  }

  return [
    "🎯 UP & DOWN에 도전했어요!",
    `난이도: ${difficulty.label}`,
    "다음에는 꼭 성공할 거예요!"
  ].join("\n");
}

export async function shareResult(result) {
  const text = createShareText(result);
  const shareData = {
    title: "UP & DOWN",
    text,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: "share" };
    } catch (error) {
      if (error.name === "AbortError") {
        return { success: false, cancelled: true };
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      return { success: true, method: "clipboard" };
    } catch (error) {
      console.warn("클립보드 복사에 실패했습니다.", error);
    }
  }

  return {
    success: false,
    fallbackText: `${text}\n${window.location.href}`
  };
}
