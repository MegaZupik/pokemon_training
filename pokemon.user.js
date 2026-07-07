// ==UserScript==
// @name         Pokemon Training x50
// @namespace    http://tampermonkey.net/
// @version      1.1
// @match        https://*.moswar.ru/*
// @grant        none
// ==/UserScript==
// @updateURL https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.user.js
// @downloadURL https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.user.js

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

    let dragging = false;
    let moved = false;
    let offsetX = 0;
    let offsetY = 0;

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

        btn.releasePointerCapture(e.pointerId);
        btn.style.cursor = 'grab';

        localStorage.setItem(STORAGE_X, btn.offsetLeft);
        localStorage.setItem(STORAGE_Y, btn.offsetTop);

        setTimeout(() => moved = false, 100);
    });

    btn.addEventListener('click', () => {
        if (moved) return;

        for (let i = 0; i < 50; i++) {
            $.post('/pokemon/', {
                action: 'train-pokemon'
            }, 'post', 1);
        }
    });

    document.body.appendChild(btn);

})();
