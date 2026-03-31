/**
 * SettingsOverlay - Balatro-style settings UI created on demand
 * Balatro: G.FUNCS.overlay_menu { definition = create_UIBox_settings() }
 * Creates overlay when shown, removes when hidden (like Balatro's UIBox lifecycle)
 */
class SettingsOverlay {
    constructor() {
        this.overlay = null;
        this.onClose = null;
    }

    /** Show settings overlay — create and append to body (Balatro: overlay_menu) */
    show(onClose) {
        this.onClose = onClose;
        if (this.overlay) {
            this.overlay.remove();
        }
        this.overlay = this._createOverlay();
        document.body.appendChild(this.overlay);
    }

    /** Hide and remove overlay (Balatro: exit_overlay_menu) */
    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.onClose) {
            this.onClose();
            this.onClose = null;
        }
    }

    _createOverlay() {
        const s = (window.dataManager?.getSettings?.()) || {};
        const preset = ['small', 'default', 'large'].includes(s.displayScalePreset) ? s.displayScalePreset : 'default';
        const maxVal = s.displayMaxScale;
        const maxSel =
            maxVal === 1 ? '1' :
            maxVal === 1.25 ? '1.25' :
            maxVal === 2 ? '2' : '';
        const overlay = document.createElement('div');
        overlay.className = 'overlay settings-overlay-created';
        overlay.id = 'settingsOverlayDynamic';
        overlay.style.cssText = 'z-index: 10002;';
        overlay.innerHTML = `
            <div class="modal-content settings-modal">
                <h2 class="shop-title">Settings</h2>
                <div class="settings-content">
                    <div class="settings-row">
                        <label for="settingSound">Sound</label>
                        <input type="checkbox" id="settingSound" ${s.soundEnabled !== false ? 'checked' : ''}>
                    </div>
                    <div class="settings-row settings-row-slider">
                        <label for="settingMusicVolume">Music</label>
                        <div class="slider-with-value">
                            <input type="range" id="settingMusicVolume" min="0" max="100" value="${Math.round((s.musicVolume ?? 0.6) * 100)}">
                            <span class="slider-value" id="settingMusicVolumeValue">${Math.round((s.musicVolume ?? 0.6) * 100)}%</span>
                        </div>
                    </div>
                    <div class="settings-row settings-row-slider">
                        <label for="settingSfxVolume">SFX</label>
                        <div class="slider-with-value">
                            <input type="range" id="settingSfxVolume" min="0" max="100" value="${Math.round((s.sfxVolume ?? 0.8) * 100)}">
                            <span class="slider-value" id="settingSfxVolumeValue">${Math.round((s.sfxVolume ?? 0.8) * 100)}%</span>
                        </div>
                    </div>
                    <div class="settings-row">
                        <label for="settingAnimations">Animations</label>
                        <input type="checkbox" id="settingAnimations" ${s.animationsEnabled !== false ? 'checked' : ''}>
                    </div>
                    <div class="settings-row">
                        <label for="settingAutoSave">Auto-save</label>
                        <input type="checkbox" id="settingAutoSave" ${s.autoSave !== false ? 'checked' : ''}>
                    </div>
                    <div class="settings-row">
                        <label for="settingTutorial">Show tutorial hints</label>
                        <input type="checkbox" id="settingTutorial" ${s.showTutorial !== false ? 'checked' : ''}>
                    </div>
                    <div class="settings-row">
                        <label for="settingGameSpeed">Game Speed</label>
                        <select id="settingGameSpeed">
                            <option value="0.5" ${s.gameSpeed === 0.5 ? 'selected' : ''}>0.5×</option>
                            <option value="1" ${s.gameSpeed === 1 ? 'selected' : ''}>1×</option>
                            <option value="2" ${(s.gameSpeed === 2 || s.gameSpeed == null) ? 'selected' : ''}>2×</option>
                            <option value="4" ${s.gameSpeed === 4 ? 'selected' : ''}>4×</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <label for="settingDisplayPreset">Display size</label>
                        <select id="settingDisplayPreset">
                            <option value="small" ${preset === 'small' ? 'selected' : ''}>Small (85%)</option>
                            <option value="default" ${preset === 'default' ? 'selected' : ''}>Default (fit)</option>
                            <option value="large" ${preset === 'large' ? 'selected' : ''}>Large (115%)</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <label for="settingDisplayMaxScale">Max scale</label>
                        <select id="settingDisplayMaxScale" title="Cap upscaling (fit-to-window is still limited by screen)">
                            <option value="" ${maxSel === '' ? 'selected' : ''}>No cap</option>
                            <option value="1" ${maxSel === '1' ? 'selected' : ''}>1× (native size)</option>
                            <option value="1.25" ${maxSel === '1.25' ? 'selected' : ''}>1.25×</option>
                            <option value="2" ${maxSel === '2' ? 'selected' : ''}>2×</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <label for="settingDisplayInteger">Integer width snap</label>
                        <input type="checkbox" id="settingDisplayInteger" ${s.displayIntegerScale ? 'checked' : ''} title="Snap scaled width to whole pixels (can help crispness on some displays)">
                    </div>
                </div>
                <button class="divine-button" id="settingsCloseBtn">Close</button>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hide();
        });

        const closeBtn = overlay.querySelector('#settingsCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

        ['settingSound', 'settingAnimations', 'settingAutoSave', 'settingTutorial', 'settingGameSpeed', 'settingDisplayPreset', 'settingDisplayMaxScale', 'settingDisplayInteger'].forEach(id => {
            const el = overlay.querySelector(`#${id}`);
            if (el) el.addEventListener('change', () => this._applySettings(overlay));
        });

        // When Sound is toggled, enable/disable volume sliders
        const soundCheck = overlay.querySelector('#settingSound');
        const updateSliderState = () => {
            const enabled = soundCheck?.checked ?? true;
            overlay.querySelector('#settingMusicVolume')?.toggleAttribute('disabled', !enabled);
            overlay.querySelector('#settingSfxVolume')?.toggleAttribute('disabled', !enabled);
        };
        if (soundCheck) soundCheck.addEventListener('change', updateSliderState);
        updateSliderState();

        // Sliders: 'input' for live feedback, 'change' to persist
        ['settingMusicVolume', 'settingSfxVolume'].forEach(id => {
            const el = overlay.querySelector(`#${id}`);
            if (el) {
                el.addEventListener('input', () => {
                    const valEl = overlay.querySelector(`#${id}Value`);
                    if (valEl) valEl.textContent = el.value + '%';
                    this._applySettings(overlay);
                });
                el.addEventListener('change', () => this._applySettings(overlay));
            }
        });

        return overlay;
    }

    _applySettings(overlay) {
        const prev = window.dataManager?.getSettings?.() || {};
        const musicVal = parseInt(overlay.querySelector('#settingMusicVolume')?.value || '60', 10);
        const sfxVal = parseInt(overlay.querySelector('#settingSfxVolume')?.value || '80', 10);
        const maxRaw = overlay.querySelector('#settingDisplayMaxScale')?.value ?? '';
        let displayMaxScale = null;
        if (maxRaw !== '') {
            const n = parseFloat(maxRaw);
            if (Number.isFinite(n) && n > 0) displayMaxScale = n;
        }
        let displayScalePreset = overlay.querySelector('#settingDisplayPreset')?.value || 'default';
        if (!['small', 'default', 'large'].includes(displayScalePreset)) displayScalePreset = 'default';
        const settings = {
            ...prev,
            soundEnabled: overlay.querySelector('#settingSound')?.checked ?? true,
            musicVolume: Math.max(0, Math.min(1, musicVal / 100)),
            sfxVolume: Math.max(0, Math.min(1, sfxVal / 100)),
            animationsEnabled: overlay.querySelector('#settingAnimations')?.checked ?? true,
            autoSave: overlay.querySelector('#settingAutoSave')?.checked ?? true,
            showTutorial: overlay.querySelector('#settingTutorial')?.checked ?? true,
            theme: prev.theme || 'default',
            gameSpeed: parseFloat(overlay.querySelector('#settingGameSpeed')?.value || '2'),
            displayScalePreset,
            displayMaxScale,
            displayIntegerScale: overlay.querySelector('#settingDisplayInteger')?.checked ?? false
        };
        if (![0.5, 1, 2, 4].includes(settings.gameSpeed)) settings.gameSpeed = 2;
        window.dataManager?.saveSettings?.(settings);
        if (typeof window.DisplayScale?.refresh === 'function') window.DisplayScale.refresh();
        if (window.app) {
            window.app.applySoundSetting?.(settings.soundEnabled, settings.musicVolume, settings.sfxVolume);
            window.app.applyAutoSaveSetting?.(settings.autoSave);
        }
    }

    isVisible() {
        return !!this.overlay && document.body.contains(this.overlay);
    }
}

window.settingsOverlay = window.settingsOverlay || new SettingsOverlay();
