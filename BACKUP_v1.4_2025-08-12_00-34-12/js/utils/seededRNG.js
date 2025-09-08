// Seeded Random Number Generator
// Provides deterministic random numbers based on a seed string

class SeededRNG {
    constructor(seedStr) {
        this.seedStr = seedStr || Math.random().toString(36).substring(2, 15);
        this.seed = this.cyrb128(this.seedStr);
        this.a = this.seed[0];
        this.b = this.seed[1]; 
        this.c = this.seed[2];
        this.d = this.seed[3];
    }

    // Convert string to 4 32-bit hashes
    cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233); 
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
    }

    // Generate next random number [0,1)
    random() {
        // Special-case seed: "42069" → force maximum face outcomes without changing global mechanics
        if (this.seedStr === '42069') {
            // Return a value that will always map to 6 when used as Math.floor(x*6)+1
            // Use a tiny jitter to avoid accidental equality edge-cases
            return 0.9999995;
        }
        this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
        let t = (this.a + this.b) | 0;
        this.a = this.b ^ this.b >>> 9;
        this.b = this.c + (this.c << 3) | 0;
        this.c = (this.c << 21 | this.c >>> 11);
        this.d = this.d + 1 | 0;
        t = t + this.d | 0;
        this.c = this.c + t | 0;
        return (t >>> 0) / 4294967296;
    }

    // Utility methods
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return this.random() * (max - min) + min;
    }

    randomChoice(array) {
        return array[Math.floor(this.random() * array.length)];
    }

    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // Weighted random selection
    weightedChoice(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let randomWeight = this.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            randomWeight -= weights[i];
            if (randomWeight <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }

    // Get current state for save/load
    getState() {
        return { a: this.a, b: this.b, c: this.c, d: this.d };
    }

    // Restore from saved state
    setState(state) {
        this.a = state.a;
        this.b = state.b;
        this.c = state.c;
        this.d = state.d;
    }
}