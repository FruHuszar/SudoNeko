import { useEffect, useState } from 'react';
import { isStandalone, readPrompt } from '../utils/install';

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function DownloadMark() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 L12 14.5" />
      <path d="M7.5 10.5 L12 15 L16.5 10.5" />
      <path d="M5 19 L19 19" />
    </svg>
  );
}

export default function InstallApp() {
  const [prompt, setPrompt] = useState(readPrompt);
  const [installed, setInstalled] = useState(isStandalone);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      window.installPrompt = event;
      setPrompt(event);
      setShowHint(false);
    };
    const onInstalled = () => {
      window.installPrompt = null;
      setInstalled(true);
      setPrompt(null);
      setShowHint(false);
    };
    const onChange = () => setPrompt(readPrompt());
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('installchange', onChange);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('installchange', onChange);
    };
  }, []);

  const install = async () => {
    if (!prompt) {
      setShowHint((current) => !current);
      return;
    }
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    window.installPrompt = null;
    setPrompt(null);
  };

  if (installed || (!prompt && !isIos())) return null;

  return (
    <div className="install-app">
      <button type="button" className="pill-button small install-app-button" onPointerDown={install}>
        <DownloadMark />
        <span className="install-app-label">Install app</span>
      </button>
      {showHint && (
        <p className="install-app-hint">Open the Share menu and choose “Add to Home Screen”.</p>
      )}
    </div>
  );
}
