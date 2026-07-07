



Потому что этот кусок не является самостоятельным кодом, который можно просто вставить в консоль. Он выглядит как часть userscript-а, который зависит от переменных и функций, объявленных выше по файлу.

Вот что сразу бросается в глаза:

1. Нет обёртки })();
В начале у тебя, судя по концу:

})();
Значит выше было что-то вроде:

(function() {
   ...
})();
Если вставить только этот кусок, браузер видит закрытие:

})();
но не видит открытие. Будет ошибка:

Uncaught SyntaxError: Unexpected token '}'
2. Не существуют переменные
Например:

if (eqCell.querySelector('#abilki-eq-btn')) return;
А где:

const eqCell = ...
нет.

То же самое:

navykiBtn
eqObserver
setWidths
initInventoryChanges
Они должны быть объявлены выше.

В консоли получишь что-то типа:

Uncaught ReferenceError: eqCell is not defined
или:

Uncaught ReferenceError: setWidths is not defined
3. window._mwSchedulerEnabled
Тут:

if (!window._mwSchedulerEnabled) return;
Код специально проверяет, включён ли какой-то модуль.

Если ты просто вставил этот кусок, скорее всего:

window._mwSchedulerEnabled
равен:

undefined
и функция сразу выходит.

То есть:

addNastroika();
ничего не сделает.

4. Он ждёт структуру страницы
Например:

document.querySelector('td.equipment-cell')
Если ты вставляешь в консоль сразу после загрузки, а нужный AJAX ещё не отрисовал инвентарь — он ничего не найдёт.

Как проверить прямо в консоли
Попробуй:

console.log(document.querySelector('td.equipment-cell'))
Если:

null
значит элемента ещё нет.

Как сделать, чтобы кусок работал отдельно
Нужно минимум добавить недостающие части:

(function(){

const eqCell = document.querySelector('td.equipment-cell');

if (!eqCell) {
    console.log('Нет equipment-cell');
    return;
}

console.log('Запуск');

})();
Но всё равно не заработает полностью, потому что отсутствуют:

setWidths()
navykiBtn
eqObserver
Судя по структуре, это кусок из твоего MW userscript-а. Чтобы запустить его в консоли, надо либо:

вставлять весь скрипт целиком,

либо вытащить только нужную функцию и добавить все её зависимости.

Если хочешь — кинь начало файла (где начинается function(){ и первые ~100 строк), я покажу, какие именно переменные надо подтянуть, чтобы этот кусок можно было запускать отдельно из консоли.


// ====== ИЗМЕНЕНИЯ ИНВЕНТАРЯ ======
(function() {
  let eqObserver = null;

  if (!document.getElementById('inv-changes-css')) {
    const style = document.createElement('style');
    style.id = 'inv-changes-css';
    style.textContent = 'span.htab[htab="eatDops"] { display: none !important; } td.dopings-cell { display: none !important; }';
    (document.head || document.documentElement).appendChild(style);
  }

  const setWidths = function(eqW, petW) {
    const eqCell = document.querySelector('td.equipment-cell');
    const petCell = document.querySelector('td.pet-cell');
    if (!eqCell || !petCell) return;
    eqCell.style.width = eqW + 'px';
    const innerDiv = eqCell.querySelector('div[style*="width"]');
    if (innerDiv) innerDiv.style.width = eqW + 'px';
    const vtabs = eqCell.querySelector('.vtabs');
    if (vtabs) vtabs.style.width = eqW + 'px';
    const dd = eqCell.querySelector('.vtabs > dd');
    if (dd) dd.style.width = eqW + 'px';
    eqCell.querySelectorAll('.object-thumbs').forEach(el => el.style.width = eqW + 'px');
    petCell.style.width = petW + 'px';
    const petVtabs = petCell.querySelector('.vtabs');
    if (petVtabs) petVtabs.style.width = petW + 'px';
    const petDd = petCell.querySelector('.vtabs > dd');
    if (petDd) petDd.style.width = petW + 'px';
    petCell.querySelectorAll('.object-thumbs').forEach(el => el.style.width = petW + 'px');
  };

  const initInventoryChanges = function() {
    const eqCell = document.querySelector('td.equipment-cell');
    if (!eqCell) return;

    const allBtns = Array.from(document.querySelectorAll('div.button#trainer-button'));
    const trainBtn = allBtns.find(el => el.querySelector('.f')?.textContent.trim() === 'Тренироваться');
    if (trainBtn) trainBtn.querySelector('.f').textContent = 'Тренер';
    const navykiBtn = allBtns.find(el => el.querySelector('.f')?.textContent.trim() === 'Навыки');

    // Кнопка Абилки — перемещаем из dopings-cell сразу как появится eatDops таб
    const moveAbilki = function() {
      if (eqCell.querySelector('#abilki-eq-btn')) return;
      const srcBtn = document.querySelector('td.dopings-cell span.htab.cocktails[htab="dopings"]');
      const dopHtab = eqCell.querySelector('span.htab[htab="eatDops"]');
      if (srcBtn && dopHtab) {
        srcBtn.id = 'abilki-eq-btn';
        dopHtab.after(srcBtn);
      }
    };
    moveAbilki();
    if (!eqCell.querySelector('#abilki-eq-btn')) {
      const abilkiObs = new MutationObserver(() => {
        if (eqCell.querySelector('span.htab[htab="eatDops"]') &&
            document.querySelector('td.dopings-cell span.htab.cocktails[htab="dopings"]')) {
          abilkiObs.disconnect();
          moveAbilki();
          addNastroika();
        }
      });
      abilkiObs.observe(document.body, { childList: true, subtree: true });
    }

    const addNastroika = function() {
      if (!window._mwSchedulerEnabled) return;
      if (document.getElementById('mw-nastroika-tab')) return;
      const statDt = document.querySelector('#statistics-accordion dt');
      if (!statDt) return;
      const btn = document.createElement('span');
      btn.id = 'mw-nastroika-tab';
      btn.textContent = 'Настройка';
      btn.style.cssText = 'float:right;cursor:pointer;font-size:11px;opacity:0.75;text-decoration:underline;';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window._mwOpenScheduler === 'function') window._mwOpenScheduler();
      });
      statDt.querySelector('div > div').prepend(btn);
    };
    addNastroika();

    if (!document.getElementById('dopy-toggle-btn') && navykiBtn) {
      const dopyBtn = navykiBtn.cloneNode(true);
      dopyBtn.id = 'dopy-toggle-btn';
      dopyBtn.querySelector('.f').innerHTML = '<img src="/@/images/obj/gifts2023/icecream/items/blue_3_64.png" style="width:36px;height:32px;vertical-align:middle;margin-top:-14px;">';
      dopyBtn.removeAttribute('onclick');
      dopyBtn.style.cursor = 'pointer';
      navykiBtn.after(document.createTextNode('\n'), dopyBtn);
      dopyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dopTab = document.querySelector('span.htab[htab="eatDops"]');
        if (dopTab) dopTab.click();
      });
    }

    setWidths(432, 220);

    if (eqObserver) eqObserver.disconnect();
    eqObserver = new MutationObserver(() => {
      if (!document.getElementById('dopy-toggle-btn') || !eqCell.querySelector('#abilki-eq-btn')) initInventoryChanges();
    });
    eqObserver.observe(eqCell, { childList: true, subtree: true });
  };
  window._mwInitInventory = initInventoryChanges;

  $(document).ajaxStop(() => {
    if (window.location.pathname.startsWith('/player/')) {
      setTimeout(initInventoryChanges, 100);
    } else {
      if (eqObserver) { eqObserver.disconnect(); eqObserver = null; }
    }
  });

  const _startObserver = setInterval(() => {
    if (!window.location.pathname.startsWith('/player/')) return;
    const eqCell = document.querySelector('td.equipment-cell');
    if (eqCell) {
      clearInterval(_startObserver);
      initInventoryChanges();
    }
  }, 200);
})();
// ====== КОНЕЦ ИЗМЕНЕНИЙ ИНВЕНТАРЯ ======

теперь появилась даже нужная кнопка, но она не реагирует на нажатие

Ага, теперь понятно. Кнопка создаётся, но клик не срабатывает, скорее всего из-за вот этого места:

if (!document.getElementById('dopy-toggle-btn') && navykiBtn) {
      const dopyBtn = navykiBtn.cloneNode(true);
Ты делаешь cloneNode(true). Он копирует HTML, но не копирует обработчики событий, которые были навешены на оригинальную кнопку. Потом ты добавляешь свой:

dopyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dopTab = document.querySelector('span.htab[htab="eatDops"]');
    if (dopTab) dopTab.click();
});
На первый взгляд всё правильно. Значит надо проверить дальше.

1. Возможно, клик перехватывает родитель
У тебя есть:

e.stopPropagation();
но это останавливает всплытие после того, как событие дошло до кнопки.

Проверка:

В консоль:

document.getElementById('dopy-toggle-btn').click()
Если вкладка откроется — обработчик есть, проблема именно с физическим кликом.

2. Возможно кнопка перекрыта другим элементом
Проверь:

document.elementFromPoint(
    document.getElementById('dopy-toggle-btn').getBoundingClientRect().left + 5,
    document.getElementById('dopy-toggle-btn').getBoundingClientRect().top + 5
)
Если вернёт не dopy-toggle-btn, значит сверху лежит другой элемент.

3. У тебя может ломаться из-за .f
Вот тут:

dopyBtn.querySelector('.f').innerHTML = '<img ...>';
Если .f содержит структуру, на которую висит логика клика, ты её уничтожаешь.

Лучше заменить:

dopyBtn.querySelector('.f').innerHTML = '<img src="/@/images/obj/gifts2023/icecream/items/blue_3_64.png" style="width:36px;height:32px;vertical-align:middle;margin-top:-14px;">';
на:

dopyBtn.querySelector('.f').insertAdjacentHTML(
    'afterbegin',
    '<img src="/@/images/obj/gifts2023/icecream/items/blue_3_64.png" style="width:36px;height:32px;vertical-align:middle;margin-top:-14px;">'
);
4. Самая вероятная причина — addEventListener навешивается не туда
Поставь временно:

dopyBtn.addEventListener('click', (e) => {
    console.log('КНОПКА НАЖАТА');
    e.preventDefault();
    e.stopPropagation();

    const dopTab = document.querySelector('span.htab[htab="eatDops"]');
    console.log('dopTab:', dopTab);

    if (dopTab) dopTab.click();
});
Нажми кнопку.

Результат скажет:

если в консоли нет КНОПКА НАЖАТА → событие не приходит;

если есть, но dopTab: null → вкладка ещё не создана;

если есть dopTab, но ничего не происходит → у игры свой обработчик и надо вызывать его иначе.

Ещё заметил одну реальную ошибку выше:

moveAbilki();

if (!eqCell.querySelector('#abilki-eq-btn')) {
    const abilkiObs = new MutationObserver(() => {
        ...
        addNastroika();
    });
}
Ты вызываешь addNastroika() до её объявления. В const так нельзя. Если этот участок реально выполняется — должен быть:

Cannot access 'addNastroika' before initialization
Его надо просто перенести выше moveAbilki().

Я бы первым делом проверил вот это в консоли:

document.getElementById('dopy-toggle-btn').onclick
и:

document.getElementById('dopy-toggle-btn').click()
По результату будет сразу видно, где проблема.


document.getElementById('dopy-toggle-btn').click()
undefined
document.getElementById('dopy-toggle-btn').click()
undefined
document.getElementById('dopy-toggle-btn').onclick
null
document.getElementById('dopy-toggle-btn').click()
undefined
dopyBtn.addEventListener('click', (e) => {
    console.log('КНОПКА НАЖАТА');
    e.preventDefault();
    e.stopPropagation();
…
Uncaught ReferenceError: dopyBtn is not defined
    <anonymous> debugger eval code:1

Отлично, теперь картина яснее.

Вот это:

document.getElementById('dopy-toggle-btn').onclick
вернуло:

null
— это нормально. Потому что ты добавлял обработчик через:

addEventListener('click', ...)
а не через:

element.onclick = ...
onclick его не показывает.

А вот это:

document.getElementById('dopy-toggle-btn').click()
тоже вернуло:

undefined
Это тоже нормально, но оно ничего не доказывает. Метод click() всегда возвращает undefined. Важно — произошло ли действие.

А вот главная подсказка:

dopyBtn.addEventListener(...)
дал:

Uncaught ReferenceError: dopyBtn is not defined
Потому что:

const dopyBtn = ...
создан внутри:

if (!document.getElementById('dopy-toggle-btn') && navykiBtn) {
    const dopyBtn = ...
}
и снаружи его уже нет.

Давай проверим, есть ли вообще обработчик. Выполни в консоли:

const btn = document.getElementById('dopy-toggle-btn');

btn.addEventListener('click', () => {
    console.log('ТЕСТ КЛИК');
});
Теперь нажми кнопку.

Варианты:
1. Появилось:
ТЕСТ КЛИК
Значит кнопка живая, проблема в твоём:

const dopTab = document.querySelector('span.htab[htab="eatDops"]');
dopTab.click();
Проверяем:

document.querySelector('span.htab[htab="eatDops"]')
2. Ничего нет
Значит реальный клик до кнопки не доходит. Тогда проверяем:

document.elementFromPoint(
    btn.getBoundingClientRect().left + 10,
    btn.getBoundingClientRect().top + 10
)
Если там не будет:

<span id="dopy-toggle-btn">
или сам элемент — его перекрывает что-то.

Ещё я заметил возможную проблему именно в твоём коде:

Ты делаешь:

const dopyBtn = navykiBtn.cloneNode(true);
а потом:

navykiBtn.after(document.createTextNode('\n'), dopyBtn);
У MW кнопки часто работают не как обычные кнопки, а через делегирование событий на родителе. Клон может выглядеть как кнопка, но игра его не считает вкладкой.

Я бы попробовал вообще без клона:

заменить:

const dopyBtn = navykiBtn.cloneNode(true);
на:

const dopyBtn = document.createElement('div');
dopyBtn.className = navykiBtn.className;
dopyBtn.innerHTML = '<span class="f"><img src="/@/images/obj/gifts2023/icecream/items/blue_3_64.png" style="width:36px;height:32px;vertical-align:middle;margin-top:-14px;"></span>';
Так мы создадим чистую кнопку без скрытых старых обработчиков.

Но сначала сделай тест с:

const btn = document.getElementById('dopy-toggle-btn');
btn.addEventListener('click', () => console.log('ТЕСТ КЛИК'));
и скажи, выводится ли сообщение. Это сразу разделит проблему на 2 части.


const btn = document.getElementById('dopy-toggle-btn');

btn.addEventListener('click', () => {
    console.log('ТЕСТ КЛИК');
});
undefined
ТЕСТ КЛИК 4 debugger eval code:4:13
document.querySelector('span.htab[htab="eatDops"]')
null 

так, я создал отличный скрипт для вайлент манкей, как теперь мне его распротранять по ссылке, что бы в вайолент манкей было легко его добавить

Есть несколько удобных способов. Для Violentmonkey лучший вариант — разместить скрипт по постоянной ссылке с правильным MIME-типом, тогда установка будет происходить буквально в пару кликов.

Вариант 1. GitHub (рекомендую)
Создай публичный репозиторий на GitHub.

Загрузи туда файл, например:

mw-helper.user.js
В начале файла обязательно должен быть заголовок:

// ==UserScript==
// @name         MW Helper
// @namespace    https://github.com/yourname
// @version      1.0.0
// @description  Улучшения интерфейса
// @match        https://*.moswar.ru/*
// @grant        none
// ==/UserScript==
Нажми Raw и получишь ссылку вида:

https://raw.githubusercontent.com/yourname/repo/main/mw-helper.user.js
Если пользователь с установленным Violentmonkey откроет эту ссылку, расширение обычно предложит установить скрипт.

Вариант 2. Greasy Fork (самый удобный для пользователей)
Если хочешь распространять скрипт публично, лучше использовать Greasy Fork.

Плюсы:

установка в один клик;

автоматические обновления;

страница с описанием;

версии;

статистика скачиваний.

Для пользователей это выглядит примерно так:

Открыли страницу → нажали Install this script → подтвердили установку.

Вариант 3. Собственный сайт
Можно просто разместить файл:

https://mysite.com/mw-helper.user.js
Главное:

имя должно оканчиваться на .user.js;

сервер должен отдавать его как JavaScript (или хотя бы как обычный текст — большинство менеджеров скриптов это понимают).

Автоматические обновления
Добавь в заголовок:

// @downloadURL https://...
// @updateURL   https://...
Например:

// @downloadURL https://raw.githubusercontent.com/yourname/repo/main/mw-helper.user.js
// @updateURL   https://raw.githubusercontent.com/yourname/repo/main/mw-helper.user.js
Тогда Violentmonkey сможет периодически проверять наличие новых версий (при увеличении @version).

Что я бы выбрал
Если скрипт предназначен для друзей или небольшой группы игроков:

GitHub + ссылка на raw.githubusercontent.com — быстро и бесплатно.

Если планируешь регулярно обновлять скрипт и распространять его среди многих пользователей:

Greasy Fork — наиболее удобный вариант для установки и обновлений.

Могу также показать, как сделать установку вообще в один клик: пользователь открывает красивую страницу с кнопкой «Установить», а дальше Violentmonkey сам предлагает установить последнюю версию скрипта.


так а что бы добавить скрипт через архив зип то что дложно лежать в этом архиве и в каком формате

Сформированное изображение: Интерфейс стратегии с ярким переключателем


Редактировать


ты чо сделал дура? ты скрипт напиши такой для вайолент манкей, который будет по нажатию на кнопку запросы указанные отправлять

😂 Похоже, я не туда свернул — вместо кода вызвал генерацию картинки.

Вот готовый блок для Violentmonkey. Он создаёт квадрат 100×100 px в левом верхнем углу, всегда поверх страницы (position: fixed), изначально находится в режиме HARD (красный), а при каждом нажатии переключает режим и отправляет соответствующий POST-запрос.

// ==UserScript==
// @name         Moswar Hard/Usual Switch
// @namespace    http://tampermonkey.net/
// @version      1.0
// @match        https://*.moswar.ru/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let hardMode = true;

    const btn = document.createElement('div');
    btn.id = 'mw-hard-switch';

    btn.style.cssText = `
        position: fixed;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 100px;
        height: 100px;
        z-index: 2147483647;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        color: white;
        user-select: none;
        border: 2px solid #000;
        box-sizing: border-box;
    `;

    function updateButton() {
        if (hardMode) {
            btn.style.background = "#c00000";
            btn.textContent = "HARD";
        } else {
            btn.style.background = "#009900";
            btn.textContent = "USUAL";
        }
    }

    function sendMode() {
        $.post('/neftlenin/', {
            action: 'selectType',
            type: hardMode ? 'hard' : 'usual'
        }, 'json');
    }

    btn.addEventListener('click', function () {
        hardMode = !hardMode;
        updateButton();
        sendMode();
    });

    document.body.appendChild(btn);

    // Начальное состояние
    updateButton();
    sendMode();

})();
Что делает:
✅ создаёт кнопку 100×100;

✅ всегда поверх всего (z-index: 2147483647);

✅ не двигается при прокрутке (position: fixed);

✅ стартует в режиме HARD (красная);

✅ при первом клике становится USUAL (зелёная);

✅ при следующем снова HARD;

✅ при каждом переключении отправляет:

type: 'hard' или

type: 'usual'.

Если хочешь, могу сделать её полупрозрачной, перетаскиваемой мышью, а также добавить сохранение выбранного режима между перезагрузками страницы через localStorage.


мне нравится, но лучше сделай всё таки что бы его можно было перетаскивать курсором

Конечно. Ниже версия с перетаскиванием мышью. Позиция кнопки сохраняется в localStorage, поэтому после перезагрузки она останется там, куда ты её перетащил.

// ==UserScript==
// @name         Moswar Hard/Usual Switch
// @namespace    http://tampermonkey.net/
// @version      1.1
// @match        https://*.moswar.ru/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let hardMode = true;

    const btn = document.createElement('div');
    btn.id = 'mw-hard-switch';

    const savedX = localStorage.getItem('mw-hard-switch-x');
    const savedY = localStorage.getItem('mw-hard-switch-y');

    btn.style.cssText = `
        position: fixed;
        left: ${savedX ?? 0}px;
        top: ${savedY ?? 50}px;
        width: 100px;
        height: 100px;
        z-index: 2147483647;
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        color: white;
        user-select: none;
        border: 2px solid #000;
        border-radius: 8px;
        box-sizing: border-box;
        transition: background .15s;
    `;

    function updateButton() {
        if (hardMode) {
            btn.style.background = "#c00000";
            btn.textContent = "HARD";
        } else {
            btn.style.background = "#009900";
            btn.textContent = "USUAL";
        }
    }

    function sendMode() {
        $.post('/neftlenin/', {
            action: 'selectType',
            type: hardMode ? 'hard' : 'usual'
        }, 'json');
    }

    // ---------- Переключение режима ----------
    btn.addEventListener('click', function () {
        if (dragMoved) return; // после перетаскивания клик не выполняем

        hardMode = !hardMode;
        updateButton();
        sendMode();
    });

    // ---------- Перетаскивание ----------
    let dragging = false;
    let dragMoved = false;
    let offsetX = 0;
    let offsetY = 0;

    btn.addEventListener('mousedown', function (e) {
        dragging = true;
        dragMoved = false;

        offsetX = e.clientX - btn.offsetLeft;
        offsetY = e.clientY - btn.offsetTop;

        btn.style.cursor = "grabbing";

        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!dragging) return;

        dragMoved = true;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        x = Math.max(0, Math.min(window.innerWidth - btn.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - btn.offsetHeight, y));

        btn.style.left = x + "px";
        btn.style.top = y + "px";
    });

    document.addEventListener('mouseup', function () {
        if (!dragging) return;

        dragging = false;
        btn.style.cursor = "grab";

        localStorage.setItem('mw-hard-switch-x', btn.offsetLeft);
        localStorage.setItem('mw-hard-switch-y', btn.offsetTop);

        // Чтобы после отпускания мыши не произошёл клик
        setTimeout(() => dragMoved = false, 100);
    });

    document.body.appendChild(btn);

    // Начальное состояние
    updateButton();
    sendMode();

})();
Что изменилось
✅ кнопку можно перетаскивать мышью;

✅ после отпускания положение сохраняется;

✅ после перетаскивания не происходит случайное переключение режима;

✅ по обычному клику всё работает как раньше.

Единственное изменение, которое я бы ещё предложил — сохранять также режим HARD/USUAL в localStorage. Тогда после обновления страницы кнопка не будет каждый раз возвращаться в HARD, а останется в том режиме, который был выбран последним.


перетаскивание на телефоне не работает в яндекс браузере

Если по одному обычному тапу на Honor X7d открывается поиск, то это не должно происходить при стандартном поведении лаунчера. В штатной MagicOS точки сами по себе не являются кнопками, но и поиск обычно не должен открываться именно от касания индикатора.

Я бы проверил следующее:

Отключи HONOR Search, если есть такая настройка:

Настройки → Главный экран и стиль → Настройки главного экрана → HONOR Search → Выкл.

Проверь, повторяется ли это в безопасном режиме. Если нет — значит, какое-то установленное приложение (например, с жестами или плавающими окнами) вмешивается.

Посмотри, обновлён ли лаунчер и MagicOS через системное обновление.

У меня есть подозрение, что это может быть особенность именно твоей версии прошивки, а не нормальное поведение всех X7d.

Можешь сделать маленькую проверку?

Нажми точно на левый или правый кружочек.

Затем нажми между кружочками.

Во всех случаях открывается поиск, или только если нажать между ними? Это поможет понять, реагирует ли система на сам индикатор или на всю нижнюю область экрана.


$.post('/pokemon/', {action: 'train-pokemon'}, 'post', 1); так, опять же сделай кнопку, перетаскивающуюся на телефона и компах, только с надписью тренировка покемона, 150 в длинну и 100 в высоту и там должен вот этот код что я тебе скинул выполниться 50 раз, это опять для вайолент манкей скрипт

Вот готовый userscript для Violentmonkey. Он:

✅ создаёт кнопку 150×100 px;

✅ её можно перетаскивать мышью и пальцем (через Pointer Events);

✅ положение сохраняется после перезагрузки;

✅ по нажатию отправляет 50 POST-запросов:

$.post('/pokemon/', {action: 'train-pokemon'}, 'post', 1);
// ==UserScript==
// @name         Pokemon Training x50
// @namespace    http://tampermonkey.net/
// @version      1.0
// @match        https://*.moswar.ru/*
// @grant        none
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
Небольшое замечание
Этот вариант отправляет 50 запросов практически одновременно. Если сервер игры ограничивает частоту запросов, часть из них может быть проигнорирована.

Если окажется, что засчитывается, например, только 10–20 тренировок, можно сделать более надёжный вариант — отправлять по одному запросу с небольшой задержкой (например, 20–50 мс между ними). Это обычно работает стабильнее, чем массовая отправка всех 50 сразу.


Проблема в нескольких вещах.

У тебя файл называется:

pokemon.js
Для Violentmonkey он должен называться:

pokemon.user.js
Ссылка у тебя неправильная. Ты используешь:

https://github.com/MegaZupik/pokemon_training/raw/refs/heads/main/pokemon.js
Правильный raw-адрес на GitHub имеет вид:

https://raw.githubusercontent.com/MegaZupik/pokemon_training/main/pokemon.user.js
или, если оставишь имя файла pokemon.js:

https://raw.githubusercontent.com/MegaZupik/pokemon_training/main/pokemon.js
Но для автоматической установки лучше именно .user.js.

Ещё важнее — в начале файла должна быть шапка userscript. Например:

// ==UserScript==
// @name         Pokemon Training
// @namespace    https://github.com/MegaZupik
// @version      1.0
// @match        https://*.moswar.ru/*
// @grant        none
// ==/UserScript==
Без неё Violentmonkey не распознает файл как userscript.

Давай проверим репозиторий
Пришли ссылку не на файл, а на сам репозиторий, например:

https://github.com/MegaZupik/pokemon_training
Или скажи:

репозиторий публичный?

файл уже переименован в pokemon.user.js?

Я сразу дам тебе готовую ссылку, по которой скрипт будет устанавливаться в один клик.


а это потому что без впн гит хаб недоступен

Да, это вполне может быть причиной.

Если ты находишься в России, то GitHub у многих провайдеров работает нестабильно: у кого-то открывается полностью, у кого-то не открываются raw.githubusercontent.com, у кого-то не открывается вообще без VPN. Это зависит от провайдера и способа блокировки.

Есть ещё один нюанс:

github.com и raw.githubusercontent.com — это разные домены.

Бывает, что сам GitHub открывается, а raw.githubusercontent.com — нет (или наоборот).

Если распространяешь скрипт среди игроков
Я бы не использовал GitHub как единственный источник, если часть аудитории сидит без VPN.

Гораздо удобнее:

разместить скрипт на Greasy Fork — он как раз предназначен для Userscript'ов, автоматически проверяет обновления и обычно гораздо удобнее для установки;

либо использовать другой хостинг, который доступен твоей аудитории.

Быстрый вопрос
Ты хочешь распространять скрипт:

только для себя и нескольких друзей, или

для большого количества игроков?

От этого зависит, что будет самым удобным способом.


себя

Тогда вообще не заморачивайся с GitHub. 🙂

Если скрипт нужен только тебе, есть несколько простых вариантов:

Хранить его прямо в Violentmonkey. Это самый простой способ, если работаешь на одном устройстве.

Хранить файл .user.js в облаке (например, на Яндекс Диске, Google Drive, Dropbox и т.п.). Если понадобится установить на другое устройство — просто скачал и открыл.

GitHub тоже подходит, но если у тебя без VPN он работает плохо, смысла в этом мало.

Если всё же хочешь пользоваться GitHub для синхронизации между устройствами, можно:

использовать VPN только на момент обновления файла;

хранить репозиторий как резервную копию.

Самый удобный способ между ПК и телефоном
Я бы сделал так:

все скрипты лежат в папке на Яндекс Диске;

файлы имеют вид:

pokemon.user.js
hard_switch.user.js
inventory.user.js
при необходимости просто открываешь файл и импортируешь его в Violentmonkey.

Кстати, у Violentmonkey есть экспорт и импорт всех скриптов. Можно сделать резервную копию сразу всех своих скриптов одним JSON-файлом и потом восстановить их на другом устройстве за пару минут. Это часто удобнее, чем держать каждый скрипт отдельно.


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

    btn.style.cssText = 
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
    ;

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

так а теперь давай всё таки выпустим новую версию скрипта в которой между отправками запросов будет 30мс и еще и после каждого запроса на экран будет выводиться цифрой его номер, и в конце будет выводиться операция завершена, но без всяких доп окон, просто в центр экрана сделай текст с позишион аболют

Да, так будет надёжнее. Вместо того чтобы отправлять 50 запросов одновременно, можно отправлять их последовательно с задержкой 30 мс и показывать прогресс прямо на экране.

Заменить нужно только обработчик click на этот:

btn.addEventListener('click', async () => {
    if (moved) return;

    if (btn.dataset.running === '1') return;
    btn.dataset.running = '1';

    let status = document.getElementById('mw-pokemon-status');

    if (!status) {
        status = document.createElement('div');
        status.id = 'mw-pokemon-status';
        status.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 2147483647;
            font-size: 64px;
            font-weight: bold;
            color: #fff;
            text-shadow: 2px 2px 6px #000;
            pointer-events: none;
            user-select: none;
        `;
        document.body.appendChild(status);
    }

    for (let i = 1; i <= 50; i++) {

        $.post('/pokemon/', {
            action: 'train-pokemon'
        }, 'post', 1);

        status.textContent = i;

        await new Promise(resolve => setTimeout(resolve, 30));
    }

    status.textContent = 'Операция завершена';

    setTimeout(() => {
        status.remove();
    }, 2000);

    btn.dataset.running = '0';
});
Что изменилось
✅ запросы идут по одному;

✅ между ними пауза 30 мс;

✅ по центру экрана показывается:

1
2
3
...
50
а затем

Операция завершена
через 2 секунды надпись исчезает.

Ещё лучше будет не просто ждать 30 мс, а ждать ответа сервера, а уже потом делать паузу 30 мс. Тогда гарантированно не будет ситуации, когда браузер накопит очередь из запросов. Для этого достаточно использовать возможности $.post() и await. Такой вариант обычно работает заметно стабильнее в AJAX-играх вроде Moswar.


вай вай нет, ты мне весь скрипт дай исправленный 

Вот полностью обновлённый скрипт. Изменения:

✅ кнопка по-прежнему перетаскивается мышью и пальцем;

✅ положение сохраняется;

✅ повторный запуск во время выполнения невозможен;

✅ запросы отправляются по одному с задержкой 30 мс;

✅ в центре экрана отображается номер текущего запроса;

✅ после окончания появляется надпись «Операция завершена» на 2 секунды.

// ==UserScript==
// @name         Pokemon Training x50
// @namespace    http://tampermonkey.net/
// @version      1.2
// @match        https://*.moswar.ru/*
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
Я бы ещё улучшил один момент
Сейчас скрипт не ждёт ответа сервера. Он просто делает:

запрос → 30 мс → запрос → 30 мс...
Это лучше, чем 50 одновременно, но всё равно не идеально.

Можно сделать ещё надёжнее:

отправил запрос →
дождался ответа сервера →
30 мс →
следующий запрос
Для AJAX-игр вроде Moswar такой вариант обычно работает стабильнее и практически исключает потерю запросов, если сервер начинает отвечать медленнее.


