// ===================== Color Palette Generator =====================

class ColorPaletteGenerator {
    constructor() {
        this.currentPalette = [];
        this.lockedColors = new Set();
        this.savedPalettes = this.loadSavedPalettes();
        this.harmonyMode = 'complementary';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generatePalette();
    }

    setupEventListeners() {
        // Generator Controls
        document.getElementById('generateBtn').addEventListener('click', () => this.generatePalette());
        document.getElementById('harmonyMode').addEventListener('change', (e) => {
            this.harmonyMode = e.target.value;
            this.generatePalette();
        });

        // Save/Export
        document.getElementById('savePaletteBtn').addEventListener('click', () => this.showSaveModal());
        document.getElementById('exportCssBtn').addEventListener('click', () => this.exportAsCSS());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportAsJSON());

        // Modal Controls
        document.getElementById('modalSaveBtn').addEventListener('click', () => this.savePalette());
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.closeSaveModal());
        document.getElementById('paletteName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.savePalette();
        });

        // Export Modal
        document.getElementById('exportCloseBtn').addEventListener('click', () => this.closeExportModal());
        document.getElementById('copyExportBtn').addEventListener('click', () => this.copyExportContent());

        // Tab Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-tab')));
        });

        // Saved Palettes
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllPalettes());
    }

    // ===================== Color Generation =====================

    generatePalette() {
        const locked = Array.from(this.lockedColors).map(idx => this.currentPalette[idx]);
        let newPalette = [];

        if (this.harmonyMode === 'random') {
            newPalette = this.generateRandomPalette();
        } else {
            const baseColor = locked.length > 0 ? locked[0] : this.generateRandomColor();
            const baseHsl = this.hexToHsl(baseColor);

            newPalette = this.generateHarmony(baseHsl);

            // Replace locked positions
            locked.forEach((color, idx) => {
                if (idx < newPalette.length) {
                    newPalette[idx] = color;
                }
            });
        }

        this.currentPalette = newPalette;
        this.renderPalette();
    }

    generateRandomPalette(count = 5) {
        const palette = [];
        for (let i = 0; i < count; i++) {
            palette.push(this.generateRandomColor());
        }
        return palette;
    }

    generateHarmony(baseHsl) {
        const hue = baseHsl.h;
        const saturation = baseHsl.s;
        const lightness = baseHsl.l;

        let hueDifferences = [];

        switch (this.harmonyMode) {
            case 'complementary':
                hueDifferences = [0, 180];
                break;
            case 'analogous':
                hueDifferences = [0, 30, 60];
                break;
            case 'triadic':
                hueDifferences = [0, 120, 240];
                break;
            case 'tetradic':
                hueDifferences = [0, 90, 180, 270];
                break;
            case 'monochromatic':
                hueDifferences = [0, 0, 0, 0, 0];
                break;
            default:
                hueDifferences = [0, 30, 60];
        }

        const palette = hueDifferences.map((diff, idx) => {
            const newHue = (hue + diff) % 360;
            let newSat = saturation;
            let newLight = lightness;

            // Add variation for monochromatic
            if (this.harmonyMode === 'monochromatic') {
                newLight = 30 + (idx * 15);
            } else {
                newSat = Math.max(30, Math.min(100, saturation + (Math.random() - 0.5) * 20));
                newLight = Math.max(25, Math.min(75, lightness + (Math.random() - 0.5) * 15));
            }

            return this.hslToHex(newHue, newSat, newLight);
        });

        return palette;
    }

    generateRandomColor() {
        return this.hslToHex(
            Math.random() * 360,
            50 + Math.random() * 30,
            50 + Math.random() * 20
        );
    }

    // ===================== Color Conversions =====================

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s; const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hslToHex(h, s, l) {
        h = h % 360;
        s = s / 100;
        l = l / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;

        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        return this.rgbToHex(
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        );
    }

    hexToRgbString(hex) {
        const rgb = this.hexToRgb(hex);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    hexToHslString(hex) {
        const hsl = this.hexToHsl(hex);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    // ===================== Rendering =====================

    renderPalette() {
        const grid = document.getElementById('paletteGrid');
        grid.innerHTML = '';

        this.currentPalette.forEach((color, idx) => {
            const card = document.createElement('div');
            card.className = 'color-card';

            const hsl = this.hexToHsl(color);
            this.hexToRgb(color); // ensure conversion is available for future use
            const colorName = this.getColorName(hsl);

            card.innerHTML = `
                <div class="color-swatch" style="background-color: ${color}">
                    <button class="lock-btn ${this.lockedColors.has(idx) ? 'locked' : ''}" 
                            data-index="${idx}" title="Lock color">
                        ${this.lockedColors.has(idx) ? '🔒' : '🔓'}
                    </button>
                </div>
                <div class="color-info">
                    <div class="color-name">${colorName}</div>
                    <div class="color-values">
                        <div class="color-value">
                            <span class="color-value-text" title="${color}">${color}</span>
                            <button class="copy-btn-small" data-type="hex" data-value="${color}" 
                                    title="Copy HEX">📋</button>
                        </div>
                        <div class="color-value">
                            <span class="color-value-text" title="${this.hexToRgbString(color)}">rgb(...)</span>
                            <button class="copy-btn-small" data-type="rgb" 
                                    data-value="${this.hexToRgbString(color)}" 
                                    title="Copy RGB">📋</button>
                        </div>
                        <div class="color-value">
                            <span class="color-value-text" title="${this.hexToHslString(color)}">hsl(...)</span>
                            <button class="copy-btn-small" data-type="hsl" 
                                    data-value="${this.hexToHslString(color)}" 
                                    title="Copy HSL">📋</button>
                        </div>
                    </div>
                </div>
            `;

            // Lock button
            card.querySelector('.lock-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLock(idx);
            });

            // Copy buttons
            card.querySelectorAll('.copy-btn-small').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(btn.dataset.value, btn.dataset.type);
                });
            });

            // Color swatch click to copy hex
            card.querySelector('.color-swatch').addEventListener('click', () => {
                this.copyToClipboard(color, 'hex');
            });

            grid.appendChild(card);
        });
    }

    // ===================== Lock Colors =====================

    toggleLock(index) {
        if (this.lockedColors.has(index)) {
            this.lockedColors.delete(index);
        } else {
            this.lockedColors.add(index);
        }
        this.generatePalette();
    }

    // ===================== Copy & Export =====================

    copyToClipboard(text, type) {
        navigator.clipboard.writeText(text).then(() => {
            const typeMap = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL' };
            this.showToast(`${typeMap[type] || 'Value'} copied!`, 'success');
        }).catch(() => {
            this.showToast('Failed to copy', 'error');
        });
    }

    exportAsCSS() {
        let css = ':root {\n';
        this.currentPalette.forEach((color, idx) => {
            const varName = `--color-${idx + 1}`;
            css += `  ${varName}: ${color};\n`;
        });
        css += '}';

        this.showExportModal(css, 'CSS Variables');
    }

    exportAsJSON() {
        const data = {
            name: 'Color Palette',
            mode: this.harmonyMode,
            colors: this.currentPalette.map((hex, idx) => ({
                hex,
                rgb: this.hexToRgbString(hex),
                hsl: this.hexToHslString(hex),
                locked: this.lockedColors.has(idx)
            })),
            timestamp: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        this.showExportModal(json, 'JSON Export');
    }

    showExportModal(content, _title) {
        const modal = document.getElementById('exportModal');
        document.getElementById('exportContent').textContent = content;
        modal.dataset.content = content;
        modal.classList.add('active');
    }

    closeExportModal() {
        document.getElementById('exportModal').classList.remove('active');
    }

    copyExportContent() {
        const content = document.getElementById('exportModal').dataset.content;
        navigator.clipboard.writeText(content).then(() => {
            this.showToast('Content copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy', 'error');
        });
    }

    // ===================== Palette Management =====================

    showSaveModal() {
        document.getElementById('paletteName').value = '';
        document.getElementById('savePaletteModal').classList.add('active');
        document.getElementById('paletteName').focus();
    }

    closeSaveModal() {
        document.getElementById('savePaletteModal').classList.remove('active');
    }

    savePalette() {
        const name = document.getElementById('paletteName').value.trim();
        if (!name) {
            this.showToast('Please enter a palette name', 'error');
            return;
        }

        const palette = {
            id: Date.now(),
            name,
            colors: [...this.currentPalette],
            mode: this.harmonyMode,
            timestamp: new Date().toISOString()
        };

        this.savedPalettes.push(palette);
        this.savePalettesToStorage();
        this.closeSaveModal();
        this.showToast('Palette saved successfully!', 'success');
    }

    loadPalette(id) {
        const palette = this.savedPalettes.find(p => p.id === id);
        if (palette) {
            this.currentPalette = [...palette.colors];
            this.harmonyMode = palette.mode;
            document.getElementById('harmonyMode').value = palette.mode;
            this.lockedColors.clear();
            this.renderPalette();
            this.switchTab(document.querySelector('[data-tab="generator"]'));
            this.showToast('Palette loaded!', 'success');
        }
    }

    deletePalette(id) {
        this.savedPalettes = this.savedPalettes.filter(p => p.id !== id);
        this.savePalettesToStorage();
        this.renderSavedPalettes();
        this.showToast('Palette deleted', 'success');
    }

    clearAllPalettes() {
        if (confirm('Are you sure you want to delete all saved palettes? This cannot be undone.')) {
            this.savedPalettes = [];
            this.savePalettesToStorage();
            this.renderSavedPalettes();
            this.showToast('All palettes cleared', 'success');
        }
    }

    // ===================== Storage =====================

    savePalettesToStorage() {
        localStorage.setItem('colorPalettes', JSON.stringify(this.savedPalettes));
    }

    loadSavedPalettes() {
        try {
            const stored = localStorage.getItem('colorPalettes');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    // ===================== Saved Palettes UI =====================

    renderSavedPalettes() {
        const container = document.getElementById('savedPalettesContainer');

        if (this.savedPalettes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1;">
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <div class="empty-state-text">No saved palettes yet</div>
                        <p style="font-size: 14px; color: var(--text-secondary);">
                            Generate a palette and save it to see it here
                        </p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        this.savedPalettes.forEach(palette => {
            const card = document.createElement('div');
            card.className = 'saved-palette-card';

            const date = new Date(palette.timestamp);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const colorsHtml = palette.colors.map(color => 
                `<div class="palette-color-mini" style="background-color: ${color}" title="${color}"></div>`
            ).join('');

            card.innerHTML = `
                <div class="palette-header">
                    <div>
                        <div class="palette-name">${this.escapeHtml(palette.name)}</div>
                        <div class="palette-date">${dateStr}</div>
                    </div>
                </div>
                <div class="palette-colors-grid">
                    ${colorsHtml}
                </div>
                <div class="palette-actions">
                    <button class="btn btn-secondary btn-load" data-id="${palette.id}">
                        📂 Load
                    </button>
                    <button class="btn btn-danger btn-delete" data-id="${palette.id}">
                        🗑️ Delete
                    </button>
                </div>
            `;

            card.querySelector('.btn-load').addEventListener('click', () => {
                this.loadPalette(palette.id);
            });

            card.querySelector('.btn-delete').addEventListener('click', () => {
                this.deletePalette(palette.id);
            });

            container.appendChild(card);
        });
    }

    switchTab(tabElement) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tabElement.classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const tabName = tabElement.dataset.tab;
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'saved') {
            this.renderSavedPalettes();
        }
    }

    // ===================== Utilities =====================

    getColorName(hsl) {
        const h = hsl.h;
        const s = hsl.s;
        const l = hsl.l;

        if (s < 10) return 'Gray';
        if (s < 50 && l > 70) return 'Light';
        if (s < 50 && l < 30) return 'Dark';

        const hueNames = [
            'Red', 'Red', 'Orange', 'Orange', 'Yellow', 'Yellow-Green',
            'Green', 'Green', 'Cyan', 'Cyan', 'Blue', 'Blue',
            'Purple', 'Purple', 'Magenta', 'Red'
        ];

        const hueIndex = Math.round(h / 24) % 16;
        return hueNames[hueIndex];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ===================== Initialize =====================

document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteGenerator();
});
