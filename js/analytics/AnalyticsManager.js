/**
 * Analytics Manager
 * Collects game analytics and telemetry for balancing and player insights
 */

class AnalyticsManager {
    constructor() {
        this.isEnabled = true;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.metrics = {};
        this.userPreferences = {};
        
        this.init();
    }

    init() {
        this.setupEventTracking();
        this.setupPerformanceTracking();
        this.setupUserBehaviorTracking();
        this.setupGameplayMetrics();
        this.setupErrorTracking();
    }

    // Event Tracking
    setupEventTracking() {
        this.trackEvent('session_start', {
            sessionId: this.sessionId,
            timestamp: this.startTime,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    trackEvent(eventName, data = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            name: eventName,
            data: {
                ...data,
                sessionId: this.sessionId,
                timestamp: Date.now(),
                gameTime: Date.now() - this.startTime
            }
        };
        
        this.events.push(event);
        
        // Send to analytics service if available
        this.sendToAnalytics(event);
        
        // Log for debugging
        console.log('Analytics Event:', event);
    }

    // Performance Tracking
    setupPerformanceTracking() {
        this.metrics.performance = {
            frameRate: 0,
            memoryUsage: 0,
            loadTime: 0,
            renderTime: 0
        };
        
        // Track page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.performance.loadTime = loadTime;
            this.trackEvent('page_load', { loadTime });
        });
        
        // Track memory usage
        if (performance.memory) {
            setInterval(() => {
                this.metrics.performance.memoryUsage = performance.memory.usedJSHeapSize;
            }, 5000);
        }
    }

    // User Behavior Tracking
    setupUserBehaviorTracking() {
        // Track mouse movements and clicks
        document.addEventListener('click', (event) => {
            this.trackEvent('user_click', {
                element: event.target.tagName,
                className: event.target.className,
                id: event.target.id,
                x: event.clientX,
                y: event.clientY
            });
        });
        
        // Track keyboard usage
        document.addEventListener('keydown', (event) => {
            this.trackEvent('user_keydown', {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey
            });
        });
        
        // Track focus changes
        document.addEventListener('focusin', (event) => {
            this.trackEvent('user_focus', {
                element: event.target.tagName,
                className: event.target.className,
                id: event.target.id
            });
        });
    }

    // Gameplay Metrics
    setupGameplayMetrics() {
        this.metrics.gameplay = {
            totalGames: 0,
            totalScore: 0,
            averageScore: 0,
            highestScore: 0,
            averageGameLength: 0,
            totalPlayTime: 0,
            favoriteCategories: {},
            diceRolls: 0,
            cardsAcquired: 0,
            shopVisits: 0
        };
    }

    trackGameStart(seed) {
        this.trackEvent('game_start', { seed });
        this.metrics.gameplay.totalGames++;
    }

    trackGameEnd(score, ante, won) {
        this.trackEvent('game_end', { score, ante, won });
        
        this.metrics.gameplay.totalScore += score;
        this.metrics.gameplay.averageScore = this.metrics.gameplay.totalScore / this.metrics.gameplay.totalGames;
        
        if (score > this.metrics.gameplay.highestScore) {
            this.metrics.gameplay.highestScore = score;
        }
    }

    trackDiceRoll(dice, rollsLeft) {
        this.trackEvent('dice_roll', { dice, rollsLeft });
        this.metrics.gameplay.diceRolls++;
    }

    trackScore(category, score, pips, favour) {
        this.trackEvent('score', { category, score, pips, favour });
        
        if (!this.metrics.gameplay.favoriteCategories[category]) {
            this.metrics.gameplay.favoriteCategories[category] = 0;
        }
        this.metrics.gameplay.favoriteCategories[category]++;
    }

    trackCardAcquisition(cardId, cardType, cost) {
        this.trackEvent('card_acquisition', { cardId, cardType, cost });
        this.metrics.gameplay.cardsAcquired++;
    }

    trackShopVisit(items, goldSpent) {
        this.trackEvent('shop_visit', { items, goldSpent });
        this.metrics.gameplay.shopVisits++;
    }

    trackAnteProgress(ante, score, threshold) {
        this.trackEvent('ante_progress', { ante, score, threshold });
    }

    // Error Tracking
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.trackEvent('error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.trackEvent('unhandled_rejection', {
                reason: event.reason,
                stack: event.reason?.stack
            });
        });
    }

    // User Preferences
    trackUserPreference(key, value) {
        this.userPreferences[key] = value;
        this.trackEvent('user_preference', { key, value });
    }

    // Game Balance Analytics
    trackGameBalance() {
        const balance = {
            averageScorePerAnte: {},
            categoryUsage: {},
            cardEffectiveness: {},
            difficultyProgression: {}
        };
        
        // Calculate average score per ante
        const anteScores = {};
        this.events.forEach(event => {
            if (event.name === 'ante_progress') {
                const { ante, score } = event.data;
                if (!anteScores[ante]) {
                    anteScores[ante] = [];
                }
                anteScores[ante].push(score);
            }
        });
        
        Object.keys(anteScores).forEach(ante => {
            const scores = anteScores[ante];
            balance.averageScorePerAnte[ante] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });
        
        // Calculate category usage
        Object.keys(this.metrics.gameplay.favoriteCategories).forEach(category => {
            balance.categoryUsage[category] = this.metrics.gameplay.favoriteCategories[category];
        });
        
        return balance;
    }

    // Heatmap Data
    generateHeatmapData() {
        const heatmap = {
            clicks: [],
            timeSpent: {},
            focusAreas: []
        };
        
        this.events.forEach(event => {
            if (event.name === 'user_click') {
                heatmap.clicks.push({
                    x: event.data.x,
                    y: event.data.y,
                    timestamp: event.data.timestamp
                });
            }
        });
        
        return heatmap;
    }

    // Player Journey
    trackPlayerJourney() {
        const journey = {
            milestones: [],
            progression: [],
            challenges: []
        };
        
        // Track milestones
        if (this.metrics.gameplay.totalGames === 1) {
            journey.milestones.push('first_game');
        }
        
        if (this.metrics.gameplay.highestScore > 1000) {
            journey.milestones.push('high_score');
        }
        
        if (this.metrics.gameplay.totalGames > 10) {
            journey.milestones.push('experienced_player');
        }
        
        return journey;
    }

    // A/B Testing
    trackABTest(testName, variant, result) {
        this.trackEvent('ab_test', {
            testName,
            variant,
            result
        });
    }

    // Send to Analytics Service
    sendToAnalytics(event) {
        // In a real implementation, this would send to your analytics service
        // For now, we'll just store locally
        
        // Example: Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event.name, {
                event_category: 'game',
                event_label: event.data.category || 'general',
                value: event.data.score || 0
            });
        }
        
        // Example: Send to custom analytics endpoint
        if (this.analyticsEndpoint) {
            fetch(this.analyticsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }).catch(error => {
                console.error('Failed to send analytics event:', error);
            });
        }
    }

    // Export Data
    exportData() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: Date.now(),
            events: this.events,
            metrics: this.metrics,
            userPreferences: this.userPreferences,
            balance: this.trackGameBalance(),
            heatmap: this.generateHeatmapData(),
            journey: this.trackPlayerJourney()
        };
    }

    // Privacy Controls
    enableAnalytics() {
        this.isEnabled = true;
        this.trackEvent('analytics_enabled');
    }

    disableAnalytics() {
        this.isEnabled = false;
        this.trackEvent('analytics_disabled');
        this.clearData();
    }

    clearData() {
        this.events = [];
        this.metrics = {};
        this.userPreferences = {};
    }

    // Utility Methods
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getMetrics() {
        return {
            ...this.metrics,
            totalEvents: this.events.length,
            sessionDuration: Date.now() - this.startTime
        };
    }

    // Cleanup
    destroy() {
        this.trackEvent('session_end', {
            sessionDuration: Date.now() - this.startTime,
            totalEvents: this.events.length
        });
        
        // Send final analytics
        this.sendToAnalytics({
            name: 'session_summary',
            data: this.exportData()
        });
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}

