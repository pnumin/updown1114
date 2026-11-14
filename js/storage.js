import { STORAGE_KEY } from "./constants.js";

function createDefaultData() {
  return {
    records: {},
    settings: {
      soundEnabled: true,
      vibrationEnabled: true
    }
  };
}

function normalizeData(data) {
  const defaults = createDefaultData();

  if (!data || typeof data !== "object") {
    return defaults;
  }

  return {
    records:
      data.records && typeof data.records === "object"
        ? data.records
        : defaults.records,
    settings: {
      soundEnabled:
        typeof data.settings?.soundEnabled === "boolean"
          ? data.settings.soundEnabled
          : defaults.settings.soundEnabled,
      vibrationEnabled:
        typeof data.settings?.vibrationEnabled === "boolean"
          ? data.settings.vibrationEnabled
          : defaults.settings.vibrationEnabled
    }
  };
}

export function loadGameData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return createDefaultData();
    }

    return normalizeData(JSON.parse(savedData));
  } catch (error) {
    console.warn("저장된 게임 데이터를 불러올 수 없습니다.", error);
    return createDefaultData();
  }
}

export function saveGameData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
    return true;
  } catch (error) {
    console.warn("게임 데이터를 저장할 수 없습니다.", error);
    return false;
  }
}

export function updateRecord(data, difficultyId, attempts) {
  const previousRecord = data.records[difficultyId];
  const isNewRecord =
    typeof previousRecord !== "number" || attempts < previousRecord;

  if (isNewRecord) {
    data.records[difficultyId] = attempts;
    saveGameData(data);
  }

  return {
    isNewRecord,
    record: data.records[difficultyId]
  };
}

export function updateSettings(data, settings) {
  data.settings = {
    ...data.settings,
    ...settings
  };

  saveGameData(data);
  return data.settings;
}
