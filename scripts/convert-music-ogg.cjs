'use strict';
/**
 * Convert game/public/ART/Music/*.wav → .ogg (Vorbis) for smaller load + decode.
 * Usage: npm run convert-music
 *        npm run convert-music -- --remove-wav
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MUSIC_DIR = path.resolve(__dirname, '..', 'game', 'public', 'ART', 'Music');
const REMOVE_WAV = process.argv.includes('--remove-wav');
/** Vorbis quality ~4 ≈ 128 kbps — good for ambient lute tracks */
const OGG_QUALITY = '4';

function fmtBytes(n) {
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function main() {
    if (!fs.existsSync(MUSIC_DIR)) {
        console.error('Music folder not found:', MUSIC_DIR);
        process.exit(1);
    }

    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
    } catch {
        console.error('ffmpeg not found — install ffmpeg to convert music.');
        process.exit(1);
    }

    const wavs = fs.readdirSync(MUSIC_DIR).filter((f) => f.toLowerCase().endsWith('.wav'));
    if (wavs.length === 0) {
        console.log('[convert-music] No WAV files found.');
        return;
    }

    let beforeTotal = 0;
    let afterTotal = 0;

    for (const wav of wavs) {
        const input = path.join(MUSIC_DIR, wav);
        const oggName = wav.replace(/\.wav$/i, '.ogg');
        const output = path.join(MUSIC_DIR, oggName);
        const before = fs.statSync(input).size;
        beforeTotal += before;

        execSync(
            `ffmpeg -y -i ${JSON.stringify(input)} -c:a libvorbis -q:a ${OGG_QUALITY} ${JSON.stringify(output)}`,
            { stdio: 'ignore' }
        );

        const after = fs.statSync(output).size;
        afterTotal += after;
        const pct = (((before - after) / before) * 100).toFixed(1);
        console.log(`  ${wav} → ${oggName}: ${fmtBytes(before)} → ${fmtBytes(after)} (${pct}%)`);

        if (REMOVE_WAV) {
            fs.unlinkSync(input);
            console.log(`    removed ${wav}`);
        }
    }

    console.log('');
    console.log(`[convert-music] Total: ${fmtBytes(beforeTotal)} → ${fmtBytes(afterTotal)}`);
    if (!REMOVE_WAV) console.log('[convert-music] WAV sources kept. Pass --remove-wav to delete after convert.');
}

main();
