# Специфікація дизайну та функціональності — Раунд 3

Цей документ містить опис архітектурних рішень, стилів та інтерактивної логіки для Раунду 3 покращень застосунку **SuperBase**.

---

## 1. Ефектні мікро-анімації кнопок «Акорд» (Accordion Smooth Flow)

### 1.1 Мета
Позбутися різкого перемикання блоків порівняльного звіту та бокового меню шляхом додавання плавних переходів висоти елементів від `0` до `auto`.

### 1.2 Технічна реалізація
Використання сучасної верстки CSS Grid для плавного переходу `grid-template-rows` з `0fr` до `1fr`. Це забезпечує ідеальний розрахунок висоти без жорстких обмежень у пікселях:

```css
.accordion-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    opacity: 0;
    overflow: hidden;
}
.accordion-wrapper.expanded {
    grid-template-rows: 1fr;
    opacity: 1;
}
.accordion-inner {
    min-height: 0;
}
```

### 1.3 Зміни в коді
* **`index.html`:**
  * Додати клас `accordion-wrapper` до `#sidebarReportListWrapper`, `#reportTableWrapper` та `#reportStressTableWrapper`.
  * Обгорнути їхній внутрішній контент у контейнер з класом `accordion-inner` та відповідними ідентифікаторами (наприклад, `#sidebarReportListInner`).
* **`app.js`:**
  * У функціях `toggleReportTable()`, `toggleReportStressTable()` та слухачі `btnToggleReportList` замінити виклики `.classList.toggle('hidden')` та `.classList.add('hidden')` на додавання/видалення класу `expanded`.
  * Перенаправити оновлення `innerHTML` у `renderReportList()` на новостворений внутрішній блок `#sidebarReportListInner`.

---

## 2. Інженерна лупа активного стовпця (Active Column Magnifier)

### 2.1 Мета
Візуально сфокусувати увагу користувача на тій температурній колонці таблиці характеристик, яка відповідає обраній робочій температурі в калькуляторі, створюючи тривимірний преміальний ефект лінзи.

### 2.2 Технічна реалізація
* Застосувати `transition: transform 0.3s` до осередків та заголовків таблиць.
* Для активних осередків (`.active-temp-col` та `.active-temp-col-header`) задати відносне позиціонування (`position: relative`), високий пріоритет накладання (`z-index: 10`) та легке збільшення розміру (`transform: scale(1.025)`).
* Додати тіні та бічні кордони кольору Indigo для створення ефекту опуклої скляної лінзи.

```css
#view-table tbody td, #view-table thead th {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.3s ease,
                box-shadow 0.3s ease,
                color 0.3s ease;
}
.active-temp-col {
    position: relative;
    z-index: 10;
    transform: scale(1.025);
    background-color: rgba(99, 102, 241, 0.06) !important;
    box-shadow: 0 4px 12px -2px rgba(99, 102, 241, 0.15), 
                inset 1px 0 0 0 rgba(99, 102, 241, 0.3),
                inset -1px 0 0 0 rgba(99, 102, 241, 0.3) !important;
}
html.dark .active-temp-col {
    background-color: rgba(99, 102, 241, 0.15) !important;
    box-shadow: 0 4px 16px -2px rgba(99, 102, 241, 0.3),
                inset 1px 0 0 0 rgba(99, 102, 241, 0.4),
                inset -1px 0 0 0 rgba(99, 102, 241, 0.4) !important;
}
.active-temp-col-header {
    position: relative;
    z-index: 20;
    transform: scale(1.025);
    background-color: #e0e7ff !important;
    color: #4f46e5 !important;
    box-shadow: 0 4px 15px -3px rgba(99, 102, 241, 0.25) !important;
}
html.dark .active-temp-col-header {
    background-color: rgba(79, 70, 229, 0.35) !important;
    color: #e0e7ff !important;
}
```

---

## 3. Автоматичний аудит розрахунків (Calculation Safety Audit)

### 3.1 Мета
Забезпечити найвищу прозорість та надійність інженерних розрахунків. Автоматично аналізувати робочі температури та коефіцієнти, попереджати про консервативну екстраполяцію за межі сертифікованої температурної сітки матеріалу та зміну стандартних запасів міцності за ПНАЕ G-7-002-86.

### 3.2 Елементи інтерфейсу
У файл `index.html` (між `#devModeInfo` та таблицями результатів) впроваджується інтерактивна панель аудиту:

```html
<div id="calcAuditPanel" class="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl text-xs font-semibold shadow-sm border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-between gap-4 transition-all duration-300 mb-5">
    <div class="flex items-center gap-3">
        <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" id="auditPing"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" id="auditStatusDot"></span>
        </span>
        <div class="leading-tight">
            <div class="font-bold text-sm uppercase tracking-wider mb-0.5" id="auditStatusTitle">Параметри розрахунку: Норма</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium" id="auditStatusDesc">Розрахунок виконується за стандартними коефіцієнтами запасу ПНАЕ G-7-002-86 в межах температурної сітки матеріалу.</div>
        </div>
    </div>
    <div class="hidden text-right text-[10px] font-bold space-y-0.5 max-w-[40%] text-slate-600 dark:text-slate-400" id="auditWarningList"></div>
</div>
```

### 3.3 Алгоритм перевірки (`app.js`)
Кожен розрахунок у `updateCalculator()` проходить такі тести:
1. **Тест коефіцієнтів запасу:**
   * Чи дорівнює `nm` значенню `2.6`?
   * Чи дорівнює `nt` значенню `1.5`?
   * Чи дорівнює `ntBolt` значенню `2.0`?
   * Чи дорівнює `gm` значенню `1.05`?
   * У разі відхилення формується застереження про використання нестандартних запасів міцності.
2. **Тест температурних меж:**
   * Визначається `maxTemp` — максимальний стовпчик випробувань у базі для цієї марки сталі.
   * Якщо `targetT` або `targetTGv` перевищує `maxTemp`: застосовується консервативне обмеження властивостей за останньою точкою (згідно з ПНАЕ), формується застереження: *"Робоча температура (T) перевищує межу бази даних (maxTemp °C)"*.
   * Якщо `targetT` або `targetTGv` менше `20` °C: формується попередження.
3. **Статуси та стилізація панелі:**
   * **🟢 Норма (Green):** Всі тести пройдені успішно.
     * Класи: `bg-emerald-50/50 text-emerald-800 border-emerald-200/50` (та темний відповідник).
     * Індикатор: `bg-emerald-500` / `bg-emerald-400` (ping).
   * **🟡 Застереження (Amber):** Змінено коефіцієнти або застосовано консервативну температурну екстраполяцію.
     * Класи: `bg-amber-50/50 text-amber-800 border-amber-200/50` (та темний відповідник).
     * Індикатор: `bg-amber-500` / `bg-amber-400` (ping).
     * Вивід списку знайдених застережень у правому кутку.
   * **🔴 Помилка (Rose):** Введено некоректні дані (наприклад, $T \le 0$).
     * Класи: `bg-rose-50/50 text-rose-800 border-rose-200/50` (та темний відповідник).
     * Індикатор: `bg-rose-500` / `bg-rose-400` (ping).
