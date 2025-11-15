'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker();
    }
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers are not supported');
      return;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered successfully:', registration.scope);

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New service worker available
            console.log('[SW] New service worker available');

            // Show update notification to user
            if (confirm('A new version is available! Reload to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // Handle controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Service worker controller changed');
      window.location.reload();
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW] Message from service worker:', event.data);

      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[SW] Cache updated');
      }
    });

    // Check if app is running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('[PWA] App is running in standalone mode');
    }

    // Prompt to install PWA (only on mobile)
    promptToInstallPWA();
  } catch (error) {
    console.error('[SW] Service worker registration failed:', error);
  }
}

let deferredPrompt: any = null;

function promptToInstallPWA() {
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Store the event for later use
    deferredPrompt = e;

    console.log('[PWA] Install prompt available');

    // Show install button/banner after a delay (optional)
    setTimeout(() => {
      showInstallPrompt();
    }, 30000); // Show after 30 seconds
  });

  // Listen for app installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;

    // Track installation (optional analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA Installed',
      });
    }
  });
}

function showInstallPrompt() {
  // Check if install prompt is still available
  if (!deferredPrompt) {
    return;
  }

  // Check if user has dismissed the prompt recently
  const dismissedAt = localStorage.getItem('pwa-install-dismissed');
  if (dismissedAt) {
    const daysSinceDismissal = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissal < 7) {
      // Don't show again for 7 days
      return;
    }
  }

  // Create install banner
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FFB380 0%, #E8844A 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      max-width: 90%;
      width: 400px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">
          Install ChatGPT PH
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Access offline and get a better experience!
        </div>
      </div>
      <button id="pwa-install-btn" style="
        background: white;
        color: #E8844A;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      ">
        Install
      </button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: white;
        border: none;
        padding: 8px;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
      ">
        ×
      </button>
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(banner);

  // Handle install button click
  const installBtn = document.getElementById('pwa-install-btn');
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);

    // Track user choice (optional analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install_prompt', {
        event_category: 'engagement',
        event_label: outcome,
      });
    }

    // Clear the prompt
    deferredPrompt = null;

    // Remove banner
    banner.remove();
  });

  // Handle dismiss button click
  const dismissBtn = document.getElementById('pwa-dismiss-btn');
  dismissBtn?.addEventListener('click', () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    banner.remove();
  });

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (document.body.contains(banner)) {
      banner.remove();
    }
  }, 15000);
}

// Utility function to check cache stats (for debugging)
export async function getCacheStats() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const messageChannel = new MessageChannel();

  return new Promise((resolve) => {
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    registration.active?.postMessage(
      { type: 'GET_CACHE_STATS' },
      [messageChannel.port2]
    );
  });
}

// Utility function to clear cache (for debugging)
export async function clearCache() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const messageChannel = new MessageChannel();

  return new Promise((resolve) => {
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.success);
    };

    registration.active?.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    );
  });
}
