/**
 * Progressive Web App Manager
 * Handles PWA installation, updates, and offline functionality
 */

class PWAManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.updateAvailable = false;
        
        this.init();
    }

    async init() {
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check if app is already installed
        this.checkInstallationStatus();
        
        // Setup online/offline detection
        this.setupOnlineDetection();
        
        // Check for updates
        this.checkForUpdates();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/js/pwa/ServiceWorker.js', {
                    scope: '/'
                });
                
                console.log('PWA: Service Worker registered successfully', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.updateAvailable = true;
                                this.showUpdateNotification();
                            }
                        });
                    }
                });
                
            } catch (error) {
                console.error('PWA: Service Worker registration failed', error);
            }
        }
    }

    setupEventListeners() {
        // Before install prompt
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('PWA: Before install prompt triggered');
            event.preventDefault();
            this.deferredPrompt = event;
            this.showInstallPrompt();
        });

        // App installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallPrompt();
        });

        // Service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event);
            });
        }
    }

    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOnlineStatusChange(false);
        });
    }

    checkInstallationStatus() {
        // Check if app is running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
        
        // Check if app is installed on iOS
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
        }
    }

    async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                }
            } catch (error) {
                console.error('PWA: Failed to check for updates', error);
            }
        }
    }

    showInstallPrompt() {
        // Create install button if it doesn't exist
        let installButton = document.getElementById('pwa-install-button');
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.className = 'btn btn-primary';
            installButton.textContent = 'Install App';
            installButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            installButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Install App
            `;
            
            document.body.appendChild(installButton);
        }
        
        installButton.addEventListener('click', () => this.installApp());
        installButton.style.display = 'block';
    }

    hideInstallPrompt() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('PWA: Install prompt not available');
            return;
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('PWA: Install prompt outcome', outcome);
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            
            if (outcome === 'accepted') {
                this.showMessage('App installation started!');
            } else {
                this.showMessage('App installation cancelled.');
            }
            
        } catch (error) {
            console.error('PWA: Failed to show install prompt', error);
        }
    }

    showUpdateNotification() {
        // Create update notification
        const updateNotification = document.createElement('div');
        updateNotification.id = 'pwa-update-notification';
        updateNotification.className = 'pwa-notification';
        updateNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-primary);
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 300px;
        `;
        
        updateNotification.innerHTML = `
            <div>
                <strong>Update Available!</strong>
                <div style="font-size: 14px; margin-top: 4px;">
                    A new version of the app is available.
                </div>
            </div>
            <button id="pwa-update-button" style="
                background: white;
                color: var(--color-primary);
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            ">Update</button>
            <button id="pwa-update-dismiss" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                margin-left: 8px;
            ">×</button>
        `;
        
        document.body.appendChild(updateNotification);
        
        // Add event listeners
        document.getElementById('pwa-update-button').addEventListener('click', () => {
            this.updateApp();
        });
        
        document.getElementById('pwa-update-dismiss').addEventListener('click', () => {
            updateNotification.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (updateNotification.parentNode) {
                updateNotification.remove();
            }
        }, 10000);
    }

    async updateApp() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.waiting) {
                    // Tell the waiting service worker to skip waiting
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    
                    // Reload the page
                    window.location.reload();
                }
            } catch (error) {
                console.error('PWA: Failed to update app', error);
            }
        }
    }

    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            this.showMessage('Connection restored!');
            this.syncOfflineData();
        } else {
            this.showMessage('You are now offline. Some features may be limited.');
        }
    }

    async syncOfflineData() {
        // Sync any offline data when coming back online
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    registration.sync.register('game-save');
                }
            }
        } catch (error) {
            console.error('PWA: Failed to sync offline data', error);
        }
    }

    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'CACHE_UPDATED':
                console.log('PWA: Cache updated', data);
                break;
                
            case 'OFFLINE_DATA_SYNCED':
                console.log('PWA: Offline data synced', data);
                break;
                
            default:
                console.log('PWA: Unknown service worker message', type);
        }
    }

    // Offline functionality
    async cacheGameData(gameData) {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                    registration.active.postMessage({
                        type: 'CACHE_GAME_DATA',
                        data: gameData
                    });
                }
            } catch (error) {
                console.error('PWA: Failed to cache game data', error);
            }
        }
    }

    async getCachedGameData() {
        try {
            const response = await fetch('/api/game-data');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('PWA: Failed to get cached game data', error);
        }
        return null;
    }

    // Utility methods
    showMessage(message, duration = 3000) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'pwa-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-surface);
            color: var(--color-text);
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            text-align: center;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        requestAnimationFrame(() => {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // Auto-dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    // Get PWA status
    getStatus() {
        return {
            isOnline: this.isOnline,
            isInstalled: this.isInstalled,
            updateAvailable: this.updateAvailable,
            canInstall: !!this.deferredPrompt,
            hasServiceWorker: 'serviceWorker' in navigator
        };
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', this.handleAppInstalled);
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}

