const themeSwitch = document.getElementById('theme_switch');
const theme = 'coffee-house-theme';

function setTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
    themeSwitch.setAttribute('aria-pressed', theme === 'dark');
}

const savedTheme = localStorage.getItem(theme);
if (savedTheme === 'dark' || savedTheme === 'light') {
    setTheme(savedTheme);
} else {
    setTheme('light');
}
themeSwitch.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-theme')
        ? 'light'
        : 'dark';
    localStorage.setItem(theme, newTheme);
    setTheme(newTheme);
});