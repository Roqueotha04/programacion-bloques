export const SAVE_KEY_STUDENT = "robot-bloques-v2";
export const SAVE_KEY_TEACHER = "robot-bloques-profe";

export function isProfe() {
  return /[?&]profe/.test(location.search);
}

export function saveKey() {
  return isProfe() ? SAVE_KEY_TEACHER : SAVE_KEY_STUDENT;
}

export function freshSave() {
  return {
    stars: {},
    best: {},
    custom: null,
    spent: 0,
    owned: ["robi"],
    skin: "robi",
    color: "cel",
    seen: ["A"],
  };
}
