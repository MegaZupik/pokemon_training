// ==UserScript==
// @name         Pokemon Training x50
// @namespace    http://tampermonkey.net/
// @version      1.2
// @match        https://*.moswar.ru/pokemon/*
// @grant        none
// @updateURL    https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.user.js
// @downloadURL  https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.user.js
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_X = 'mw-pokemon-btn-x';
    const STORAGE_Y = 'mw-pokemon-btn-y';

    const btn = document.createElement('div');

    btn.textContent = 'Тренировка\nпокемона';

    btn.style.cssText = `
        position: fixed;
        left: ${localStorage.getItem(STORAGE_X) ?? 20}px;
        top: ${localStorage.getItem(STORAGE_Y) ?? 100}px;
        width: 150px;
        height: 100px;
        background: #1976d2;
        color: white;
        font-size: 20px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        white-space: pre-line;
        border: 2px solid black;
        border-radius: 10px;
        cursor: grab;
        user-select: none;
        touch-action: none;
        z-index: 2147483647;
        box-sizing: border-box;
    `;

    document.body.appendChild(btn);

    // ---------- Статус ----------
    const status = document.createElement('div');
    status.id = 'mw-pokemon-status';
    status.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2147483647;
        font-size: 72px;
        font-weight: bold;
        color: white;
        text-shadow: 2px 2px 8px black;
        pointer-events: none;
        user-select: none;
        display: none;
    `;
    document.body.appendChild(status);

    let dragging = false;
    let moved = false;
    let offsetX = 0;
    let offsetY = 0;
    let running = false;

    // ---------- Перетаскивание ----------
    btn.addEventListener('pointerdown', (e) => {
        dragging = true;
        moved = false;

        offsetX = e.clientX - btn.offsetLeft;
        offsetY = e.clientY - btn.offsetTop;

        btn.setPointerCapture(e.pointerId);
        btn.style.cursor = 'grabbing';

        e.preventDefault();
    });

    btn.addEventListener('pointermove', (e) => {
        if (!dragging) return;

        moved = true;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        x = Math.max(0, Math.min(window.innerWidth - btn.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - btn.offsetHeight, y));

        btn.style.left = x + 'px';
        btn.style.top = y + 'px';

        e.preventDefault();
    });

    btn.addEventListener('pointerup', (e) => {
        dragging = false;

        try {
            btn.releasePointerCapture(e.pointerId);
        } catch (err) {}

        btn.style.cursor = 'grab';

        localStorage.setItem(STORAGE_X, btn.offsetLeft);
        localStorage.setItem(STORAGE_Y, btn.offsetTop);

        setTimeout(() => moved = false, 100);
    });

    // ---------- Клик ----------
    btn.addEventListener('click', async () => {

        if (moved || running) return;

        running = true;

        status.style.display = 'block';

        for (let i = 1; i <= 50; i++) {

            status.textContent = i;

            $.post('/pokemon/', {
                action: 'train-pokemon'
            }, 'post', 1);

            await new Promise(resolve => setTimeout(resolve, 30));
        }

        status.textContent = 'Операция завершена';

        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);

        running = false;
    });

})();
