'use strict';
/**
 * Pack die face PNGs into one horizontal sprite sheet + JSON frame map.
 * Usage: npm run build-dice-spritesheet
 */

const fs = require('fs');
const path = require('path');

const ART = path.resolve(__dirname, '..', 'game', 'public', 'ART');
const SHEET_PNG = path.join(ART, 'dice-faces-sheet.png');
const SHEET_JSON = path.join(ART, 'dice-faces-sheet.json');

/** Frame order left → right (matches CSS background-position steps) */
const FRAME_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'question'];

const SOURCE_FILES = {
    1: 'die face 1.png',
    2: 'die face 2.png',
    3: 'die face 3.png',
    4: 'die face 4.png',
    5: 'die face 5.png',
    6: 'die face 6.png',
    7: 'die face 7.png',
    8: 'die face 8.png',
    9: 'die face 9.png',
    question: 'dice face question mark.png',
};

async function main() {
    let sharp;
    try {
        sharp = require('sharp');
    } catch {
        console.error('Missing sharp — run: npm install');
        process.exit(1);
    }

    const CELL = 256;
    const columns = FRAME_ORDER.length;
    const composites = [];

    for (let col = 0; col < FRAME_ORDER.length; col += 1) {
        const key = FRAME_ORDER[col];
        const file = SOURCE_FILES[key];
        const src = path.join(ART, file);
        if (!fs.existsSync(src)) {
            console.error(`Missing source: ${file}`);
            process.exit(1);
        }
        const resized = await sharp(src)
            .resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();
        composites.push({ input: resized, left: col * CELL, top: 0 });
    }

    await sharp({
        create: {
            width: CELL * columns,
            height: CELL,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite(composites)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(SHEET_PNG);

    const frames = {};
    FRAME_ORDER.forEach((key, index) => {
        const faceKey = key === 'question' ? '?' : key;
        frames[faceKey] = {
            x: index * CELL,
            y: 0,
            w: CELL,
            h: CELL,
            col: index,
        };
    });

    const manifest = {
        sheet: 'dice-faces-sheet.png',
        cellWidth: CELL,
        cellHeight: CELL,
        columns,
        frames,
    };

    fs.writeFileSync(SHEET_JSON, `${JSON.stringify(manifest, null, 2)}\n`);

    const sheetSize = fs.statSync(SHEET_PNG).size;
    console.log(`[build-dice-spritesheet] ${columns} frames @ ${CELL}px → ${path.basename(SHEET_PNG)} (${(sheetSize / 1024).toFixed(1)} KB)`);
    console.log(`[build-dice-spritesheet] Manifest → ${path.basename(SHEET_JSON)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
