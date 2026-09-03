export function readPrompt() {
  return window.installPrompt || null;
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

export function isInstalled() {
  return window.appInstalled === true || isStandalone();
}
