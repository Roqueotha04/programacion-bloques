export const SAVE_KEY_STUDENT = "robot-bloques-v2";
export const SAVE_KEY_TEACHER = "robot-bloques-profe";
export const SAVE_KEY_KIDS = "robot-bloques-chicos";

export function isProfe() {
  return /[?&]profe/.test(location.search);
}

export function isKids() {
  return /[?&]chicos/.test(location.search);
}

/* edición Python (?python, 13 a 15 años): tiene prioridad sobre ?chicos */
export const SAVE_KEY_PYTHON = "robot-bloques-python";
export function isPython() {
  return /[?&]python/.test(location.search);
}

export function saveKey() {
  if (isPython()) return isProfe() ? SAVE_KEY_PYTHON + "-profe" : SAVE_KEY_PYTHON;
  if (isKids()) return isProfe() ? SAVE_KEY_KIDS + "-profe" : SAVE_KEY_KIDS;
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
    color: "marino",
    body: "gris",
    face: "normal",
    faces: ["normal"],
    seen: ["A", "PA"], /* primer grupo de cada edición (PA: Python), para que no avise «nuevo» al entrar */
    codes: [],
  };
}
