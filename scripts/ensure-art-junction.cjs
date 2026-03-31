'use strict';
/**
 * Vite serves game/public/* at the site root (/ART/...).
 * Live Server / Live Preview use root "game/", so /ART/ would miss public/ART.
 * This links game/ART → game/public/ART so /ART/ and relative ART/ work everywhere.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gameRoot = path.resolve(__dirname, '..', 'game');
const target = path.join(gameRoot, 'public', 'ART');
const link = path.join(gameRoot, 'ART');

function main() {
    if (!fs.existsSync(target)) {
        console.warn('[ensure-art-junction] game/public/ART missing — skip');
        return;
    }
    if (fs.existsSync(link)) {
        try {
            if (fs.realpathSync(link) === fs.realpathSync(target)) {
                return;
            }
        } catch {
            /* broken link */
        }
        const st = fs.lstatSync(link);
        if (st.isSymbolicLink()) {
            fs.unlinkSync(link);
        } else if (st.isDirectory()) {
            const inner = fs.readdirSync(link);
            if (inner.length > 0) {
                console.warn(
                    '[ensure-art-junction] game/ART exists and is not empty — remove or rename it, then run again'
                );
                process.exitCode = 0;
                return;
            }
            fs.rmdirSync(link);
        } else {
            fs.unlinkSync(link);
        }
    }
    if (process.platform === 'win32') {
        execSync(`cmd /c mklink /J "${link}" "${target}"`, { stdio: 'inherit' });
    } else {
        const rel = path.relative(path.dirname(link), target);
        fs.symlinkSync(rel, link, 'dir');
    }
    console.log('[ensure-art-junction] game/ART → public/ART');
}

main();
