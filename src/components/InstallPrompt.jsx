import { useState, useEffect } from 'react';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
        setIsIOS(true);
        setIsVisible(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-prompt-container">
      <div className="install-content">
        {isIOS ? (
           <p>To install: Tap <span style={{fontSize: '1.2em'}}>⎋</span> (Share) and select <strong>Add to Home Screen</strong>.</p>
        ) : (
           <>
            <p>Install <strong>StairCalc</strong> for offline use.</p>
            <button onClick={handleInstallClick}>Install</button>
           </>
        )}
        <button className="close-btn" onClick={() => setIsVisible(false)}>✕</button>
      </div>
    </div>
  );
};

export default InstallPrompt;
