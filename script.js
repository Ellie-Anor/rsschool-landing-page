const themeSwitch = document.getElementById('theme_switch');
const theme = 'coffee-house-theme';

function setTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
    themeSwitch.setAttribute('aria-pressed', String(theme === 'dark'));
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

const burger = document.querySelector('.burger');
const nav = document.querySelector('header nav');
const desktopQuery = window.matchMedia('(min-width: 769px)');

function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'close menu' : 'open menu');
}

burger.addEventListener('click', () => {
    setMenu(!document.body.classList.contains('menu-open'));
});

nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
});

desktopQuery.addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        setMenu(false);
        closeModal();
    }
});

const carousel = document.querySelector('.carousel');

if (carousel) {
    const track = carousel.querySelector('.carousel_track');
    const slides = Array.from(track.children);
    const [prevBtn, nextBtn] = carousel.querySelectorAll('.carousel_controls button');

    const step = 100 / slides.length;
    track.style.display = 'flex';
    track.style.width = `${slides.length * 100}%`;
    slides.forEach((slide) => {
        slide.style.flex = `0 0 ${step}%`;
        slide.style.maxWidth = `${step}%`;
    });

    let current = 0;

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = `translateX(${-current * step}%)`;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    goTo(0);
}

const goodsList = document.querySelector('.goods-list');

let modal = null;
let modalWindow = null;
let modalProduct = null;
let modalState = null;
let lastFocused = null;

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

function createModal() {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal_window" role="dialog" aria-modal="true"></div>';
    document.body.append(modal);
    modalWindow = modal.firstElementChild;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    modalWindow.addEventListener('click', (e) => {
        if (e.target.closest('.modal_close')) {
            closeModal();
            return;
        }
        const sizeBtn = e.target.closest('[data-size]');
        if (sizeBtn) {
            modalState.size = sizeBtn.dataset.size;
            updateModal();
            return;
        }
        const addBtn = e.target.closest('[data-additive]');
        if (addBtn) {
            const i = Number(addBtn.dataset.additive);
            if (modalState.additives.has(i)) modalState.additives.delete(i);
            else modalState.additives.add(i);
            updateModal();
        }
    });
}

function updateModal() {
    const p = modalProduct;
    const size = p.sizes[modalState.size];
    const chosen = p.additives.filter((_, i) => modalState.additives.has(i));

    modalWindow.querySelectorAll('[data-size]').forEach((btn) => {
        const active = btn.dataset.size === modalState.size;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
    });

    modalWindow.querySelectorAll('[data-additive]').forEach((btn) => {
        const active = modalState.additives.has(Number(btn.dataset.additive));
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
    });

    const total = Number(p.price)
        + Number(size['add-price'])
        + chosen.reduce((sum, a) => sum + Number(a['add-price']), 0);

    modalWindow.querySelector('.modal_total_price').textContent = formatPrice(total);
}

function openModal(product) {
    if (!modal) createModal();
    modalProduct = product;
    modalState = { size: Object.keys(product.sizes)[0], additives: new Set() };
    lastFocused = document.activeElement;

modalWindow.setAttribute('aria-label', product.name);
modalWindow.innerHTML = `
    <img class="modal_image" src="${product.image}" alt="${product.name} image">
    <div class="modal_info">
        <h3 class="modal_name">${product.name}</h3>
        <p class="modal_description">${product.description}</p>

        <div class="modal_group">
            <h4 class="modal_group_title">Size</h4>
            <div class="modal_options">
                ${Object.entries(product.sizes).map(([key, s]) => `
                    <button type="button" class="modal_option" data-size="${key}">
                        <span class="modal_option_marker">${key.toUpperCase()}</span>
                        <span>${s.size.replace(/(\d)\s*(ml|g)$/, '$1 $2')}</span>
                    </button>`).join('')}
            </div>
        </div>

        <div class="modal_group">
            <h4 class="modal_group_title">Additives</h4>
            <div class="modal_options">
                ${product.additives.map((a, i) => `
                    <button type="button" class="modal_option" data-additive="${i}">
                        <span class="modal_option_marker">${i + 1}</span>
                        <span>${a.name}</span>
                    </button>`).join('')}
            </div>
        </div>

        <div class="modal_total">
            <span>Total:</span>
            <span class="modal_total_price"></span>
        </div>

        <p class="modal_note">
            <span class="modal_note_icon" aria-hidden="true">i</span>
            <span>The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.</span>
        </p>

        <button type="button" class="modal_close">Close</button>
    </div>`;

    updateModal();
    modalWindow.scrollTop = 0;
    document.body.classList.add('modal-open');
    modal.classList.add('is-open');
    modalWindow.querySelector('.modal_close').focus();
}

function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

async function initCatalog() {
    const moreBtn = document.querySelector('.goods_more');
    const categoryBtns = Array.from(document.querySelectorAll('.categories_btn'));
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const MOBILE_LIMIT = 4;

    let products = [];
    let category = categoryBtns[0].dataset.filter;
    let expanded = false;

    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(response.status);
        products = await response.json();

        const categoryMap = { coffee: 'coffee', tea: 'tea', dessert: 'desserts' };
        products.forEach((p) => {
            p.filter = categoryMap[p.category] || p.category;
        });
    } catch (err) {
        goodsList.innerHTML = '<p class="catalog_error">Could not load the menu. Please try again later.</p>';
        return;
    }

    function render() {
        const items = products
            .map((product, index) => ({ product, index }))
            .filter(({ product }) => product.filter === category);

        const limit = mobileQuery.matches && !expanded ? MOBILE_LIMIT : items.length;
        const visible = items.slice(0, limit);

        goodsList.innerHTML = visible.map(({ product, index }) => `
            <article class="goods" data-index="${index}" tabindex="0" role="button" aria-label="${product.name}">
                <img src="${product.image}" alt="${product.name} image">
                <h3 class="goods_name">${product.name}</h3>
                <p class="goods_description">${product.description}</p>
                <p class="price">${formatPrice(product.price)}</p>
            </article>`).join('');

        moreBtn.hidden = visible.length >= items.length;
    }

    function setCategory(name) {
        category = name;
        expanded = false;
        categoryBtns.forEach((btn) => {
            const active = btn.dataset.filter === name;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        render();
    }

    categoryBtns.forEach((btn) => {
        btn.addEventListener('click', () => setCategory(btn.dataset.filter));
    });

    moreBtn.addEventListener('click', () => {
        expanded = true;
        render();
    });

    mobileQuery.addEventListener('change', () => {
        expanded = false;
        render();
    });

    goodsList.addEventListener('click', (e) => {
        const card = e.target.closest('.goods');
        if (card) openModal(products[Number(card.dataset.index)]);
    });

    goodsList.addEventListener('keydown', (e) => {
        const card = e.target.closest('.goods');
        if (card && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openModal(products[Number(card.dataset.index)]);
        }
    });

    setCategory(category);
}

if (goodsList) initCatalog();