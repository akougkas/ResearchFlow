/**
 * ThemeManager - Manages Cyberpunk UI color schemes
 * Persists theme preference to LocalStorage (rf.theme.v1)
 */

export const THEMES = [
    { id: 'default', name: 'NEO YELLOW', primary: '#F3F91A', secondary: '#00F0FF' },
    { id: 'matrix', name: 'TERMINAL MATRIX', primary: '#39FF14', secondary: '#00FF66' },
    { id: 'cyan', name: 'CYBER CYAN', primary: '#00F0FF', secondary: '#FF007F' },
    { id: 'synthwave', name: 'SYNTHWAVE VIOLET', primary: '#BF5AF2', secondary: '#F3F91A' }
];

const THEME_KEY = 'rf.theme.v1';

class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.applyTheme(this.currentTheme);
    }

    loadTheme() {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(THEME_KEY) || 'default';
        }
        return 'default';
    }

    setTheme(themeId) {
        if (!THEMES.some(t => t.id === themeId)) return;
        this.currentTheme = themeId;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(THEME_KEY, themeId);
        }
        this.applyTheme(themeId);
    }

    applyTheme(themeId) {
        if (typeof document !== 'undefined' && document.documentElement) {
            if (themeId === 'default') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', themeId);
            }
        }
    }

    getTheme() {
        return this.currentTheme;
    }
}

export const themeManager = new ThemeManager();
