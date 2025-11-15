'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedDate) / (1000 * 60 * 60 * 24);

    // Don't show if dismissed within the last 7 days
    if (daysSinceDismissed < 7) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Show the prompt after a delay (user engagement)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 seconds after page load
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src="/icons/icon-96x96.png"
              alt="ChatGPT Philippines"
              className="w-16 h-16 rounded-xl"
            />
          </div>

          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Install ChatGPT Philippines
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Get quick access to AI tools with our mobile app. Works offline and loads faster!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-[#E8844A] hover:bg-[#D46D38] text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Works offline with cached content</li>
            <li>• Lightning-fast loading times</li>
            <li>• No app store required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
