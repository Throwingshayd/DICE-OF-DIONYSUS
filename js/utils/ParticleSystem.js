// ParticleSystem - Balatro-style particle effects
// Inspired by Balatro's particles.lua

class ParticleSystem {
    constructor(config = {}) {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.lastUpdate = performance.now();
        
        // Configuration
        this.config = {
            lifespan: config.lifespan || 1.0,
            speed: config.speed || 1.0,
            colors: config.colors || ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
            maxParticles: config.maxParticles || 100,
            gravity: config.gravity !== undefined ? config.gravity : 100,
            friction: config.friction || 0.99,
            size: config.size || 4,
            sizeVariation: config.sizeVariation || 0.5
        };
        
        this.createCanvas();
        Logger.info('ParticleSystem initialized');
    }
    
    /**
     * Create particle canvas overlay
     */
    createCanvas() {
        // Check if canvas already exists
        this.canvas = document.getElementById('particle-canvas');
        
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particle-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize canvas to match window
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Spawn a single particle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Override default config
     */
    spawn(x, y, options = {}) {
        if (this.particles.length >= this.config.maxParticles) {
            // Remove oldest particle
            this.particles.shift();
        }
        
        const speed = options.speed !== undefined ? options.speed : this.config.speed;
        const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
        const colors = options.colors || this.config.colors;
        
        const particle = {
            x,
            y,
            vx: Math.cos(angle) * speed * (50 + Math.random() * 50),
            vy: Math.sin(angle) * speed * (50 + Math.random() * 50),
            life: 0,
            maxLife: options.lifespan || this.config.lifespan,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: (this.config.size * (1 - this.config.sizeVariation) + 
                   this.config.size * this.config.sizeVariation * Math.random()),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        };
        
        this.particles.push(particle);
        
        // Start animation loop if not running
        if (!this.isRunning) {
            this.start();
        }
    }
    
    /**
     * Spawn a burst of particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles
     * @param {Object} options - Override default config
     */
    burst(x, y, count = 20, options = {}) {
        for (let i = 0; i < count; i++) {
            this.spawn(x, y, options);
        }
    }
    
    /**
     * Spawn particles in a specific direction (fountain effect)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles
     * @param {number} angle - Direction angle in radians
     * @param {number} spread - Angle spread in radians
     */
    fountain(x, y, count = 15, angle = -Math.PI / 2, spread = Math.PI / 4) {
        for (let i = 0; i < count; i++) {
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            this.spawn(x, y, { angle: particleAngle });
        }
    }
    
    /**
     * Emit particles from an element
     * @param {HTMLElement} element - Element to emit from
     * @param {number} count - Number of particles
     * @param {Object} options - Override default config
     */
    emitFromElement(element, count = 20, options = {}) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        this.burst(x, y, count, options);
    }
    
    /**
     * Create a trail effect following a moving element
     * @param {HTMLElement} element - Element to follow
     * @param {number} duration - Trail duration in ms
     * @param {number} particlesPerSecond - Spawn rate
     */
    trail(element, duration = 1000, particlesPerSecond = 30) {
        const interval = 1000 / particlesPerSecond;
        const startTime = performance.now();
        
        const spawnTrail = () => {
            const elapsed = performance.now() - startTime;
            if (elapsed >= duration) return;
            
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            this.spawn(x, y, {
                speed: 0.3,
                lifespan: 0.5
            });
            
            setTimeout(spawnTrail, interval);
        };
        
        spawnTrail();
    }
    
    /**
     * Start the particle system animation loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdate = performance.now();
        this.animate();
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (this.particles.length === 0) {
            this.isRunning = false;
            return;
        }
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdate) / 1000;
        this.lastUpdate = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Update all particles
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += deltaTime;
            
            // Remove dead particles
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            
            // Apply gravity
            p.vy += this.config.gravity * deltaTime;
            
            // Apply friction
            p.vx *= this.config.friction;
            p.vy *= this.config.friction;
            
            // Update rotation
            p.rotation += p.rotationSpeed;
        }
    }
    
    /**
     * Draw all particles
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw each particle
        this.particles.forEach(p => {
            const progress = p.life / p.maxLife;
            
            // Alpha fade (fade in and out)
            const alpha = 1 - progress;
            
            // Scale (grow then shrink)
            const scale = 2 * Math.min(progress / 0.5, (1 - progress) / 0.5);
            const size = p.size * scale;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = alpha;
            
            // Parse color and apply alpha
            const color = this.hexToRgb(p.color);
            this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            
            // Draw square particle
            this.ctx.fillRect(-size / 2, -size / 2, size, size);
            
            this.ctx.restore();
        });
    }
    
    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isRunning = false;
    }
    
    /**
     * Preset: Gold coins effect
     */
    goldCoins(x, y, count = 15) {
        this.burst(x, y, count, {
            colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFE55C'],
            speed: 1.2,
            lifespan: 0.8
        });
    }
    
    /**
     * Preset: Score celebration
     */
    scoreCelebration(x, y, count = 30) {
        this.burst(x, y, count, {
            colors: ['#00FF00', '#32CD32', '#7FFF00', '#ADFF2F'],
            speed: 1.5,
            lifespan: 1.2
        });
    }
    
    /**
     * Preset: Divine sparkle
     */
    divineSparkle(x, y, count = 20) {
        this.burst(x, y, count, {
            colors: ['#FFD700', '#FFF8DC', '#FFFACD', '#E6E6FA'],
            speed: 0.8,
            lifespan: 1.5
        });
    }
    
    /**
     * Preset: Dark magic
     */
    darkMagic(x, y, count = 25) {
        this.burst(x, y, count, {
            colors: ['#800080', '#9370DB', '#8B008B', '#4B0082'],
            speed: 1.0,
            lifespan: 1.0
        });
    }
}

// Preset particle configurations
const ParticlePresets = {
    SCORE: {
        colors: ['#00FF00', '#32CD32', '#7FFF00', '#ADFF2F'],
        speed: 1.5,
        lifespan: 1.2
    },
    GOLD: {
        colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFE55C'],
        speed: 1.2,
        lifespan: 0.8
    },
    DIVINE: {
        colors: ['#FFD700', '#FFF8DC', '#FFFACD', '#E6E6FA'],
        speed: 0.8,
        lifespan: 1.5
    },
    DANGER: {
        colors: ['#FF0000', '#FF4500', '#DC143C', '#8B0000'],
        speed: 1.3,
        lifespan: 0.9
    },
    MAGIC: {
        colors: ['#800080', '#9370DB', '#8B008B', '#4B0082'],
        speed: 1.0,
        lifespan: 1.0
    },
    ICE: {
        colors: ['#00FFFF', '#87CEEB', '#B0E0E6', '#ADD8E6'],
        speed: 0.9,
        lifespan: 1.1
    }
};

// Global instance
window.particleSystem = window.particleSystem || new ParticleSystem();
window.ParticlePresets = ParticlePresets;

