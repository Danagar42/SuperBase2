# SuperBase Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Усунути критичні дефекти, запобігти втраті даних у LocalStorage, додати відсутнє поле категорії міцності, замінити блокований експорт бази на нативне скачування Blob, інтегрувати шпаргалку лінеаризації та оптимізувати мобільну взаємодію у веб-додатку SuperBase з урахуванням прямих інженерних вимог замовника.

**Architecture:** Усі доопрацювання виконуються суворо в межах наявних файлів (`app.js`, `index.html`, `styles.css`, `шпаргалка/index.html`) без зміни архітектурного принципу монолітного скрипту. Розрахункова модель температурних кроків та підключення бібліотек через зовнішні CDN залишаються незмінними за прямими вказівками замовника.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, Tailwind CSS (Play CDN), Chart.js.

**Spec:** [AUDIT_REPORT_2026-10-07.md](file:///d:/Розробка/SuperBase-main/AUDIT_REPORT_2026-10-07.md)

## Global Constraints
- **Один файл коду**: Заборонено розбивати `app.js` на модулі чи сторонні файли — весь виконуваний код має залишатися в єдиному файлі `app.js`.
- **Без інтерполяції**: Заборонено змінювати розрахункову модель на лінійну інтерполяцію — ступінчастий підхід норм ПНАЕ Г-7-002-86 (`getNearestHigherValue`, `getStepValue`) зберігається як є.
- **Без локалізації CDN / без офлайн-режиму**: Доступ до мережі інтернет є постійним, залишати підключення Tailwind CSS та Chart.js через зовнішні CDN без змін.
- **Сумісність даних**: Зберегти повну зворотну сумісність збережених у `localStorage` даних користувачів.
- **Мова інтерфейсу**: Усі повідомлення (Toast, підказки, лейбли) виконуються виключно українською мовою.

---

### Task 1: [AUD-001] Виправлення критичного збою рендерингу звіту допустимих напружень

**Files:**
- Modify: `d:/Розробка/SuperBase-main/app.js:965-995`

**Interfaces:**
- Consumes: `reportMaterials` array, `item.elements`
- Produces: Безпечний рендеринг рядків елементів "Шпильки" та "Різьба" за наявності або відсутності масиву `elements`

- [x] **Step 1: Локалізувати небезпечне звернення у `renderReportStressTable`**

У функції `renderReportStressTable` у файлі [`app.js`](file:///d:/Розробка/SuperBase-main/app.js#L967-L995) рядки 979 та 989 використовують сире поле `item.elements.includes(...)`, тоді як дефолтний масив ініціалізовано у локальній змінній `itemElements`.

- [x] **Step 2: Замінити `item.elements` на `itemElements`**

У файлі `app.js` замінити фрагмент:
```javascript
// Було:
        if (itemElements.includes("Фланець")) {
            let props = [
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>2</sub>", units: "МПа", key: "flange_s2" },
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>RV</sub>", units: "МПа", key: "flange_srv" }
            ];
            elementGroups.push({ elName: "Фланець", props: props });
            totalRows += props.length;
        }
        if (item.elements.includes("Шпильки")) {
            let props = [
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>1</sub>", units: "МПа", key: "bolt_s1" },
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>3w</sub>", units: "МПа", key: "bolt_s3w" },
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>4w</sub>", units: "МПа", key: "bolt_s4w" },
                { name: "Напруження зрізу", symbol: "(&tau;)<sub>sw</sub>", units: "МПа", key: "bolt_tau_sw" }
            ];
            elementGroups.push({ elName: "Шпильки", props: props });
            totalRows += props.length;
        }
        if (item.elements.includes("Різьба")) {
            let props = [
                { name: "Напруження зрізу", symbol: "(&tau;)", units: "МПа", key: "thread_dash" }
            ];
            elementGroups.push({ elName: "Різьба", props: props });
            totalRows += props.length;
        }

// Має стати:
        if (itemElements.includes("Фланець")) {
            let props = [
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>2</sub>", units: "МПа", key: "flange_s2" },
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>RV</sub>", units: "МПа", key: "flange_srv" }
            ];
            elementGroups.push({ elName: "Фланець", props: props });
            totalRows += props.length;
        }
        if (itemElements.includes("Шпильки")) {
            let props = [
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>1</sub>", units: "МПа", key: "bolt_s1" },
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>3w</sub>", units: "МПа", key: "bolt_s3w" },
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>4w</sub>", units: "МПа", key: "bolt_s4w" },
                { name: "Напруження зрізу", symbol: "(&tau;)<sub>sw</sub>", units: "МПа", key: "bolt_tau_sw" }
            ];
            elementGroups.push({ elName: "Шпильки", props: props });
            totalRows += props.length;
        }
        if (itemElements.includes("Різьба")) {
            let props = [
                { name: "Напруження зрізу", symbol: "(&tau;)", units: "МПа", key: "thread_dash" }
            ];
            elementGroups.push({ elName: "Різьба", props: props });
            totalRows += props.length;
        }
```

- [x] **Step 3: Верифікувати відсутність помилки `TypeError`**

Перевірити через Node.js виконання симуляції формування таблиці з об'єктом, де `item.elements` дорівнює `undefined`:
```bash
node -e "
const item = { matIndex: 0, kpIndex: 0, elements: undefined };
const itemElements = (item.elements && Array.isArray(item.elements) && item.elements.length > 0) ? item.elements : ['Фланець', 'Шпильки', 'Різьба'];
console.log('Includes flange:', itemElements.includes('Фланець'));
console.log('Includes studs:', itemElements.includes('Шпильки'));
console.log('Includes thread:', itemElements.includes('Різьба'));
"
```
Очікувано: всі три перевірки повертають `true` без викидання помилок.

- [x] **Step 4: Зафіксувати коміт**
```bash
git add app.js
git commit -m "fix: resolve TypeError in renderReportStressTable by using itemElements fallback"
```

---

### Task 2: [AUD-002] Виправлення симетричного банківського/Excel округлення у `roundExcel`

**Files:**
- Modify: `d:/Розробка/SuperBase-main/app.js:93-98`

**Interfaces:**
- Consumes: `roundExcel(num, places = 2)`
- Produces: Рядок із числом, округленим за правилом напівцілого від нуля (Excel half-up), без спотворення величин понад 2 МПа

- [x] **Step 1: Дослідити поточну реалізацію `roundExcel`**

У файлі [`app.js:93-98`](file:///d:/Розробка/SuperBase-main/app.js#L93-L98) операція `(num + Number.EPSILON)` для значень $> 2$ не виправляє двійкову похибку подання, через що $150.005$ округлюється як $150.00$ замість $150.01$.

- [x] **Step 2: Оновити реалізацію `roundExcel`**

Замінити функцію у `app.js`:
```javascript
function roundExcel(num, places = 2) {
    if (num === null || num === undefined || num === "—" || isNaN(num)) return num;
    const n = Number(num);
    if (isNaN(n)) return num;
    const sign = n < 0 ? -1 : 1;
    const abs = Math.abs(n);
    return (sign * Number(Math.round(Number(abs + 'e' + places)) + 'e-' + places)).toFixed(places);
}
```

- [x] **Step 3: Протестувати точність округлення на граничних тестах**

Запустити перевірку через Node.js:
```bash
node -e "
function roundExcel(num, places = 2) {
    if (num === null || num === undefined || num === '—' || isNaN(num)) return num;
    const n = Number(num);
    if (isNaN(n)) return num;
    const sign = n < 0 ? -1 : 1;
    const abs = Math.abs(n);
    return (sign * Number(Math.round(Number(abs + 'e' + places)) + 'e-' + places)).toFixed(places);
}
console.assert(roundExcel(150.005, 2) === '150.01', 'Test 1 failed');
console.assert(roundExcel(1.005, 2) === '1.01', 'Test 2 failed');
console.assert(roundExcel(245.025, 2) === '245.03', 'Test 3 failed');
console.assert(roundExcel('—', 2) === '—', 'Test 4 failed');
console.log('All rounding tests passed successfully!');
"
```
Очікувано: `All rounding tests passed successfully!`.

- [x] **Step 4: Зафіксувати коміт**
```bash
git add app.js
git commit -m "fix: implement precise half-up rounding in roundExcel to prevent IEEE-754 precision loss"
```

---

### Task 3: [AUD-003] Збереження модифікацій та додаткових градацій до базових марок сталей

**Files:**
- Modify: `d:/Розробка/SuperBase-main/app.js:185-260`

**Interfaces:**
- Consumes: `appMaterials`, `coreDB`, `localStorage`
- Produces: Збереження та відновлення додаткових градацій (КП), доданих до базових марок сталей, у ключі `pnae_materials_extensions`

- [x] **Step 1: Оновити `saveToLocalStorage` для обліку розширень базової бази**

У файлі `app.js` у функції `saveToLocalStorage` додати збереження додаткових градацій:
```javascript
function saveToLocalStorage() {
    try { 
        const customMaterials = [];
        const baseExtensions = {};

        appMaterials.forEach(appMat => {
            const baseMat = coreDB.find(m => m.name.toLowerCase() === appMat.name.toLowerCase());
            if (!baseMat) {
                customMaterials.push(appMat);
            } else {
                const extraGrades = appMat.grades.slice(baseMat.grades.length);
                if (extraGrades.length > 0) {
                    baseExtensions[appMat.name.toLowerCase()] = extraGrades;
                }
            }
        });

        localStorage.setItem('pnae_materials_custom', JSON.stringify(customMaterials));
        localStorage.setItem('pnae_materials_extensions', JSON.stringify(baseExtensions));
        localStorage.setItem('pnae_favorites', JSON.stringify(favoriteMaterials));
        localStorage.setItem('pnae_report_materials', JSON.stringify(reportMaterials));
        
        localStorage.setItem('pnae_active_report_subtab', activeReportSubTab);
        localStorage.setItem('pnae_report_materials_equip', JSON.stringify(reportMaterialsEquip));
        localStorage.setItem('pnae_equipment_active_properties', JSON.stringify(equipmentActiveProperties));
        localStorage.setItem('pnae_equipment_stress_columns', JSON.stringify(equipmentStressColumns));
        localStorage.setItem('pnae_report_equip_seismic', reportEquipSeismicVal);
    } catch (e) { console.error("Помилка збереження", e); }
}
```

- [x] **Step 2: Оновити `loadFromLocalStorage` для відновлення розширень базової бази**

У функції `loadFromLocalStorage` додати відновлення `pnae_materials_extensions`:
```javascript
    const savedExtensions = localStorage.getItem('pnae_materials_extensions');
    if (savedExtensions) {
        try {
            const parsedExt = JSON.parse(savedExtensions);
            if (parsedExt && typeof parsedExt === 'object') {
                Object.keys(parsedExt).forEach(nameLower => {
                    const targetMat = appMaterials.find(m => m.name.toLowerCase() === nameLower);
                    if (targetMat && Array.isArray(parsedExt[nameLower])) {
                        parsedExt[nameLower].forEach(extraGrade => {
                            // Перевіряємо, щоб не дублювати градацію при повторних завантаженнях
                            const exists = targetMat.grades.some(g => g.kp === extraGrade.kp && g.description === extraGrade.description);
                            if (!exists) {
                                targetMat.grades.push(extraGrade);
                            }
                        });
                    }
                });
            }
        } catch (e) { console.error("Помилка читання розширень", e); }
    }
```

- [x] **Step 3: Протестувати логіку збереження та відновлення градацій**

Перевірити сценарій через Node.js скрипт з емуляцією `localStorage`.
Очікувано: при додаванні до матеріалу "Ст3сп5" нової градації вона успішно повертається після відновлення.

- [x] **Step 4: Зафіксувати коміт**
```bash
git add app.js
git commit -m "fix: persist custom grades added to core materials in localStorage extensions"
```

---

### Task 4: [AUD-004] Додавання поля «Категорія міцності (КП)» у модальне вікно створення матеріалу

**Files:**
- Modify: `d:/Розробка/SuperBase-main/index.html:925-945`
- Modify: `d:/Розробка/SuperBase-main/app.js:1995-2010`, `app.js:2258-2325`

**Interfaces:**
- Consumes: Значення поля `#newMatKp`
- Produces: Об'єкт `newGrade` з коректно заповненим `kp`, оновлений випадаючий список КП у селекторі

- [x] **Step 1: Додати розмітку поля введення КП у `index.html`**

У файлі `index.html` всередині модального вікна `#addMatModal` замінити блок назви та опису на сітку з полем КП:
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Марка сталі / сплаву <span class="text-rose-500">*</span></label>
        <input type="text" id="newMatName" placeholder="Наприклад, Сталь 20" class="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all">
    </div>
    <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Категорія міцності (КП)</label>
        <input type="text" id="newMatKp" placeholder="Наприклад, 245 або 390 (необов'язково)" class="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all">
    </div>
</div>
<div class="mb-5">
    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Опис / Сортамент / НТД</label>
    <input type="text" id="newMatDesc" placeholder="Наприклад, Поковки товщиною до 100 мм..." class="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all">
</div>
```

- [x] **Step 2: Оновити зчитування, очищення та заповнення `newMatKp` у `app.js`**

1. У рядку 1998 зчитувати значення:
```javascript
const matKp = document.getElementById('newMatKp')?.value.trim() || "";
```
2. У функції `buildMaterialFormEmpty` (рядок 2276) очищати поле:
```javascript
document.getElementById('newMatName').value = '';
document.getElementById('newMatKp').value = '';
document.getElementById('newMatDesc').value = '';
```
3. У функції `openEditModal` (рядок 2303) підставляти значення редагованої градації:
```javascript
document.getElementById('newMatDesc').value = grade.description || '';
document.getElementById('newMatKp').value = grade.kp || '';
```

- [x] **Step 3: Верифікувати зв'язку форми та збереження**

Перевірити наявність ідентифікатора `newMatKp` у розмітці та коректність обробки у `app.js`.

- [x] **Step 4: Зафіксувати коміт**
```bash
git add index.html app.js
git commit -m "feat: add strength category (KP) input field to custom material modal"
```

---

### Task 5: [AUD-009] Безпечне нативне завантаження файлу `data.js` через Blob (замість блокованого `window.open`)

**Files:**
- Modify: `d:/Розробка/SuperBase-main/app.js:2331-2375`

**Interfaces:**
- Consumes: Клік по кнопці `#btnExportJS`
- Produces: Пряме завантаження файлу `data.js` у браузері без спливаючих вікон

- [x] **Step 1: Переписати `exportToJS` на пряму генерацію Blob-посилання**

У файлі `app.js` замінити реалізацію функції `exportToJS`:
```javascript
function exportToJS() {
    try {
        const jsCodeString = `const materialsDB = ${JSON.stringify(appMaterials, null, 4)};\n`;
        const blob = new Blob([jsCodeString], { type: 'application/javascript;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        showToast('Оновлений файл data.js успішно сформовано та завантажено', 'success');
    } catch (err) {
        console.error("Помилка експорту файлу:", err);
        showToast('Помилка при створенні файлу експорту', 'error');
    }
}
```

- [x] **Step 2: Верифікувати роботу генерації `Blob`**

Перевірити через Node.js валідність серіалізації:
```bash
node -e "
const fs = require('fs');
const db = eval(fs.readFileSync('d:/Розробка/SuperBase-main/data.js', 'utf8') + '; materialsDB');
const res = 'const materialsDB = ' + JSON.stringify(db.slice(0, 2), null, 4) + ';';
console.log('Export string generated, length:', res.length);
"
```
Очікувано: успішна генерація рядка без помилок пам'яті.

- [x] **Step 3: Зафіксувати коміт**
```bash
git add app.js
git commit -m "feat: implement native Blob file download for data.js export instead of popup"
```

---

### Task 6: [AUD-008] Інтеграція та двостороння навігація для модуля «Шпаргалка лінеаризації»

**Files:**
- Modify: `d:/Розробка/SuperBase-main/index.html:85-95`
- Modify: `d:/Розробка/SuperBase-main/шпаргалка/index.html:45-75`

**Interfaces:**
- Consumes: Посилання між головною базою та шпаргалкою
- Produces: Зручна кнопка «Шпаргалка» у хедері `index.html` та кнопка повернення «До бази» у шпаргалці

- [x] **Step 1: Додати кнопку «Шпаргалка» у хедер `index.html`**

У файлі `index.html` біля перемикача теми `#themeToggle` розмістити посилання на шпаргалку:
```html
<a href="шпаргалка/index.html" target="_blank" rel="noopener noreferrer" title="Відкрити інтерактивну шпаргалку лінеаризації напружень" class="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700/60 shadow-sm active:scale-95">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-500"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    <span class="hidden sm:inline">Шпаргалка</span>
</a>
```

- [x] **Step 2: Додати зворотне посилання у хедер `шпаргалка/index.html`**

У файлі `шпаргалка/index.html` у верхній панелі інструментів додати кнопку повернення:
```html
<a href="../index.html" title="Повернутися до довідника матеріалів SuperBase" class="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    <span>До бази матеріалів</span>
</a>
```

- [x] **Step 3: Верифікувати відносні шляхи посилань**

Переконатися, що шлях `шпаргалка/index.html` коректно відкривається з кореня, а `../index.html` — зі шпаргалки.

- [x] **Step 4: Зафіксувати коміт**
```bash
git add index.html шпаргалка/index.html
git commit -m "feat: integrate bidirectional navigation between SuperBase and linearization cheatsheet"
```

---

### Task 7: [AUD-010] Мобільне меню-перемикач для бічної панелі вибору матеріалів

**Files:**
- Modify: `d:/Розробка/SuperBase-main/index.html:55-105`
- Modify: `d:/Розробка/SuperBase-main/app.js:270-350`
- Modify: `d:/Розробка/SuperBase-main/styles.css`

**Interfaces:**
- Consumes: Клік по `#btnToggleMobileSidebar`
- Produces: Згортання та розгортання бічної панелі вибору матеріалів на екранах `< 768px`

- [x] **Step 1: Додати кнопку гамбургер-меню у хедер `index.html`**

У файлі `index.html` у лівій частині хедера перед логотипом додати кнопку:
```html
<button type="button" id="btnToggleMobileSidebar" aria-label="Перемикач списку матеріалів" class="md:hidden p-2 mr-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
</button>
```

- [x] **Step 2: Оновити класи сайдбару `<aside>` для адаптивного приховування**

У файлі `index.html` оновити класи для `<aside id="appSidebar">`:
```html
<aside id="appSidebar" class="hidden md:flex w-full md:w-[340px] bg-slate-50/80 dark:bg-dark-panel border-r border-slate-200/80 dark:border-dark-border flex-col shrink-0 overflow-hidden z-30 transition-all duration-300 absolute md:static top-[72px] bottom-0 left-0 max-md:shadow-2xl">
```

- [x] **Step 3: Додати обробник перемикання у `app.js`**

У функції `init()` файлу `app.js` додати підключення події:
```javascript
const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');
const appSidebar = document.getElementById('appSidebar');

if (btnToggleMobileSidebar && appSidebar) {
    btnToggleMobileSidebar.addEventListener('click', () => {
        appSidebar.classList.toggle('hidden');
        appSidebar.classList.toggle('flex');
    });

    // На мобільних закривати сайдбар після вибору марки
    el.mat.addEventListener('change', () => {
        if (window.innerWidth < 768) {
            appSidebar.classList.add('hidden');
            appSidebar.classList.remove('flex');
        }
    });
}
```

- [x] **Step 4: Верифікувати поведінку прихованого/видимого стану**

Перевірити наявність класів `hidden md:flex` на сайдбарі та коректність обробника.

- [x] **Step 5: Зафіксувати коміт**
```bash
git add index.html app.js styles.css
git commit -m "feat: add responsive mobile drawer toggle for material sidebar"
```

---

### Task 8: [AUD-011] Оптимізація та кешування координатної сітки `buildTableGrid` при виділенні

**Files:**
- Modify: `d:/Розробка/SuperBase-main/app.js:2410-2470`

**Interfaces:**
- Consumes: Події `mousedown`, `mouseover` над таблицями
- Produces: Плавне виділення комірок без повторної рекурсивної перебудови сітки таблиці

- [x] **Step 1: Перевірити обробник `mouseover` на відсутність зайвих викликів DOM**

У файлі `app.js` переконатися, що `buildTableGrid` викликається тільки при `mousedown`, а при `mouseover` використовується вже збудований кеш `activeGrid` без повторного читання `getAttribute('rowspan')`.

- [x] **Step 2: Забезпечити очищення посилання на сітку при `mouseup`**

```javascript
document.addEventListener('mouseup', () => { 
    isSelecting = false; 
    activeTable = null;
    activeGrid = [];
});
```

- [x] **Step 3: Зафіксувати коміт**
```bash
git add app.js
git commit -m "perf: ensure table selection grid cache is cleared on mouseup and not recomputed on hover"
```

---

## Фінальна перевірка та валідація (Verification Checklist)

Після виконання всіх завдань плану:
1. Запустити синтаксичну перевірку `app.js` та `data.js` через Node.js:
   ```bash
   node -c d:/Розробка/SuperBase-main/app.js
   node -c d:/Розробка/SuperBase-main/data.js
   ```
2. Перевірити цілісність рендерингу в браузері:
   - Вкладка «Для звіту»: таблиця допустимих напружень фланців та обладнання формується без помилок у консолі (`TypeError` відсутній).
   - Форма додавання матеріалу: поле «Категорія міцності (КП)» присутнє, зберігається та відображається у випадаючому списку.
   - Базові матеріали: при додаванні варіанту до "Ст3сп5" або "Сталь 20" дані зберігаються у `localStorage` та не зникають після оновлення сторінки.
   - Кнопка «Експорт бази JS»: файл `data.js` завантажується безпосередньо через браузер.
   - Кнопка «Шпаргалка»: відкриває сторінку лінеаризації з робочим посиланням повернення.
   - Мобільний режим: на екрані менше 768px бічна панель відкривається за кнопкою-гамбургером.
