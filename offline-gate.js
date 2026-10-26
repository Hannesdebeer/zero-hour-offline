// GPL-3.0-or-later. A direct game bookmark must first prepare its own worker.
if (!crossOriginIsolated || !navigator.serviceWorker?.controller) {
  location.replace(new URL('./', document.currentScript.src).href);
}
