import { storage } from './storage';

const THEME_KEY = 'rewamart_theme';

export const getTheme = () => {
    const theme = storage.get(THEME_KEY, 'light');
    return theme;
};

export const setTheme = (theme) => {
    storage.set(THEME_KEY, theme);
    applyTheme(theme);
};

export const toggleTheme = () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
};

export const applyTheme = (theme) => {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
};

export const initTheme = () => {
    const theme = getTheme();
    applyTheme(theme);
};
