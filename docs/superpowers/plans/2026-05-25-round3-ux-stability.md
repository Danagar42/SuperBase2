# Round 3 UX/UI and Stability Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement premium accordion transitions, a 3D active column magnifier lens, and an automated Calculation Safety Audit panel for PNAE calculations.

**Architecture:** Integrate a CSS Grid-based zero-to-auto height transition for accordions, use CSS transitions with `transform: scale(1.025)` and z-index offsets to make the active column act as a 3D overlay lens, and inject a dynamic safety status card above calculator results evaluated on-the-fly during calculator updates.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES5/ES6).

---

### Task 1: Accordion Styles and Layout Setup

**Files:**
- Modify: `styles.css` (at the end)
- Modify: `index.html:183-185`, `index.html:580-590`, `index.html:601-610`

- [ ] **Step 1: Write the accordion CSS transition classes**

Add to [styles.css](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/styles.css):
```css
/* Accordion transition styles */
.accordion-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
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

- [ ] **Step 2: Restructure the HTML for collapsible elements**

Modify [index.html](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/index.html) to apply the accordion wrapper and inner elements:

*Sidebar report list wrapper (around lines 183-185):*
Replace:
```html
                    <div id="sidebarReportListWrapper" class="hidden flex-col gap-2 max-h-[35vh] overflow-y-auto pr-1">
                    </div>
```
With:
```html
                    <div id="sidebarReportListWrapper" class="accordion-wrapper pr-1 max-h-[35vh] overflow-y-auto">
                        <div id="sidebarReportListInner" class="accordion-inner flex flex-col gap-2 pb-2">
                        </div>
                    </div>
```

*Mechanical properties report wrapper (around lines 582-589):*
Replace:
```html
                        <div id="reportTableWrapper" class="table-container overflow-x-auto w-full relative">
                            <table class="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
                                <thead id="reportTableHeader" class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                                </thead>
                                <tbody id="reportTableBody" class="divide-y divide-slate-100 dark:divide-slate-700">
                                </tbody>
                            </table>
                        </div>
```
With:
```html
                        <div id="reportTableWrapper" class="accordion-wrapper expanded w-full">
                            <div class="accordion-inner table-container overflow-x-auto w-full relative">
                                <table class="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
                                    <thead id="reportTableHeader" class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                                    </thead>
                                    <tbody id="reportTableBody" class="divide-y divide-slate-100 dark:divide-slate-700">
                                    </tbody>
                                </table>
                            </div>
                        </div>
```

*Stress allowable report wrapper (around lines 603-610):*
Replace:
```html
                        <div id="reportStressTableWrapper" class="table-container overflow-x-auto w-full relative">
                            <table class="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
                                <thead id="reportStressTableHeader" class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                                </thead>
                                <tbody id="reportStressTableBody" class="divide-y divide-slate-100 dark:divide-slate-700">
                                </tbody>
                            </table>
                        </div>
```
With:
```html
                        <div id="reportStressTableWrapper" class="accordion-wrapper expanded w-full">
                            <div class="accordion-inner table-container overflow-x-auto w-full relative">
                                <table class="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
                                    <thead id="reportStressTableHeader" class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                                    </thead>
                                    <tbody id="reportStressTableBody" class="divide-y divide-slate-100 dark:divide-slate-700">
                                    </tbody>
                                </table>
                            </div>
                        </div>
```

- [ ] **Step 3: Commit structural accordion layouts**
```bash
git add styles.css index.html
git commit -m "style: define grid-based accordion transitions and layout containers"
```

---

### Task 2: Accordion JavaScript Logic Integration

**Files:**
- Modify: `app.js:275-290` (btnToggleReportList listener)
- Modify: `app.js:493-520` (renderReportList inner ref)
- Modify: `app.js:940-971` (toggleReportTable & toggleReportStressTable functions)

- [ ] **Step 1: Update the sidebar list toggler event listener**

In [app.js](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/app.js), replace the old `.hidden` toggle logic:
```javascript
    let isReportListVisible = false;
    document.getElementById('btnToggleReportList').addEventListener('click', () => {
        isReportListVisible = !isReportListVisible;
        const wrapper = document.getElementById('sidebarReportListWrapper');
        const icon = document.getElementById('reportListToggleIcon');
        
        if (isReportListVisible) {
            wrapper.classList.remove('hidden');
            wrapper.classList.add('flex');
            icon.classList.add('rotate-180');
        } else {
            wrapper.classList.add('hidden');
            wrapper.classList.remove('flex');
            icon.classList.remove('rotate-180');
        }
        renderReportList();
    });
```
With:
```javascript
    let isReportListVisible = false;
    document.getElementById('btnToggleReportList').addEventListener('click', () => {
        isReportListVisible = !isReportListVisible;
        const wrapper = document.getElementById('sidebarReportListWrapper');
        const icon = document.getElementById('reportListToggleIcon');
        
        if (isReportListVisible) {
            wrapper.classList.add('expanded');
            icon.classList.add('rotate-180');
        } else {
            wrapper.classList.remove('expanded');
            icon.classList.remove('rotate-180');
        }
        renderReportList();
    });
```

- [ ] **Step 2: Update renderReportList to target the inner wrapper**

In [app.js](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/app.js) `renderReportList()`, replace the innerHTML updates to direct to `sidebarReportListInner`:
```javascript
function renderReportList() {
    saveToLocalStorage();
    const listWrapper = document.getElementById('sidebarReportListWrapper');
    const toggleText = document.getElementById('reportListToggleText');
    
    const isVisible = !listWrapper.classList.contains('hidden');
```
With:
```javascript
function renderReportList() {
    saveToLocalStorage();
    const listWrapper = document.getElementById('sidebarReportListWrapper');
    const listInner = document.getElementById('sidebarReportListInner');
    const toggleText = document.getElementById('reportListToggleText');
    if (!listInner) return;
    
    const isVisible = listWrapper.classList.contains('expanded');
```
And replace every instance of `listWrapper.innerHTML` inside `renderReportList()` with `listInner.innerHTML`.

- [ ] **Step 3: Update toggleReportTable and toggleReportStressTable functions**

In [app.js](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/app.js), replace the table toggler functions:
```javascript
let isReportTableVisible = true;
window.toggleReportTable = function() {
    isReportTableVisible = !isReportTableVisible;
    const wrapper = document.getElementById('reportTableWrapper');
    const icon = document.getElementById('reportTableToggleIcon');
    
    if (isReportTableVisible) {
        wrapper.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
};

let isReportStressTableVisible = true;
window.toggleReportStressTable = function() {
    isReportStressTableVisible = !isReportStressTableVisible;
    const wrapper = document.getElementById('reportStressTableWrapper');
    const icon = document.getElementById('reportStressTableToggleIcon');
    
    if (isReportStressTableVisible) {
        wrapper.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
};
```
With:
```javascript
let isReportTableVisible = true;
window.toggleReportTable = function() {
    isReportTableVisible = !isReportTableVisible;
    const wrapper = document.getElementById('reportTableWrapper');
    const icon = document.getElementById('reportTableToggleIcon');
    
    if (isReportTableVisible) {
        wrapper.classList.add('expanded');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.remove('expanded');
        icon.classList.remove('rotate-180');
    }
};

let isReportStressTableVisible = true;
window.toggleReportStressTable = function() {
    isReportStressTableVisible = !isReportStressTableVisible;
    const wrapper = document.getElementById('reportStressTableWrapper');
    const icon = document.getElementById('reportStressTableToggleIcon');
    
    if (isReportStressTableVisible) {
        wrapper.classList.add('expanded');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.remove('expanded');
        icon.classList.remove('rotate-180');
    }
};
```

- [ ] **Step 4: Commit accordion logical connections**
```bash
git add app.js
git commit -m "feat: integrate accordion expanded toggles and target inner list blocks"
```

---

### Task 3: 3D Active Column Magnifier Style Polish

**Files:**
- Modify: `styles.css:160-190` (Active Temperature Column Highlight)

- [ ] **Step 1: Redefine active column highlight for 3D scale zoom magnifier**

Replace lines 160-190 in [styles.css](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/styles.css):
```css
/* Active Temperature Column Highlight */
.active-temp-col {
    background-color: rgba(99, 102, 241, 0.05) !important;
    font-weight: 500;
}
html.dark .active-temp-col {
    background-color: rgba(99, 102, 241, 0.12) !important;
}
.active-temp-col-header {
    background-color: #e0e7ff !important; /* brand-100 */
    color: #4f46e5 !important; /* brand-600 */
    font-weight: 700 !important;
    position: relative;
}
html.dark .active-temp-col-header {
    background-color: rgba(79, 70, 229, 0.35) !important;
    color: #e0e7ff !important;
}
.active-temp-col-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #4f46e5;
}
html.dark .active-temp-col-header::after {
    background-color: #818cf8;
}
```
With:
```css
/* Active Temperature Column Highlight & Magnifier Effect */
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
    font-weight: 600;
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
    font-weight: 700 !important;
    box-shadow: 0 4px 15px -3px rgba(99, 102, 241, 0.25) !important;
}
html.dark .active-temp-col-header {
    background-color: rgba(79, 70, 229, 0.35) !important;
    color: #e0e7ff !important;
}
.active-temp-col-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #4f46e5;
}
html.dark .active-temp-col-header::after {
    background-color: #818cf8;
}
```

- [ ] **Step 2: Commit Magnifier lens styles**
```bash
git add styles.css
git commit -m "style: build active column magnifier transform scale overlay"
```

---

### Task 4: Calculation Safety Audit HTML Panel Layout

**Files:**
- Modify: `index.html:355-356`

- [ ] **Step 1: Inject Audit Panel Layout**

In [index.html](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/index.html), insert the audit panel HTML directly before the results grid layout (right above line 356 `<!-- Деталі -->`):
```html
                    <!-- Calculation Safety Audit Panel -->
                    <div id="calcAuditPanel" class="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl text-xs font-semibold shadow-sm border border-emerald-200/50 dark:border-emerald-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 mb-5 relative overflow-hidden">
                        <div class="flex items-center gap-3">
                            <span class="flex h-3 w-3 relative shrink-0">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" id="auditPing"></span>
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" id="auditStatusDot"></span>
                            </span>
                            <div class="leading-tight">
                                <div class="font-bold text-sm uppercase tracking-wider mb-0.5" id="auditStatusTitle">Параметри розрахунку: Норма</div>
                                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium" id="auditStatusDesc">Розрахунок відповідає вимогам нормативності ПНАЕ G-7-002-86.</div>
                            </div>
                        </div>
                        <div class="hidden text-left sm:text-right text-[10px] font-bold space-y-0.5 max-w-full sm:max-w-[50%] text-slate-600 dark:text-slate-400" id="auditWarningList"></div>
                    </div>
```

- [ ] **Step 2: Commit audit layout**
```bash
git add index.html
git commit -m "style: insert calculation safety audit panel structural mockup"
```

---

### Task 5: Calculation Safety Audit Javascript Logic

**Files:**
- Modify: `app.js:1458-1651` (updateCalculator function)

- [ ] **Step 1: Integrate safety checks inside updateCalculator**

In [app.js](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/app.js) `updateCalculator()`, perform audit validation checks:

*Locate the top of updateCalculator():*
```javascript
function updateCalculator() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;
```

*Insert right after validating index values (before calculations start):*
```javascript
    const targetT = parseFloat(document.getElementById('calcTemp').value);
    const targetTGv = parseFloat(document.getElementById('calcTempGv').value);

    // Dynamic audit logs
    const auditPanel = document.getElementById('calcAuditPanel');
    const auditPing = document.getElementById('auditPing');
    const auditDot = document.getElementById('auditStatusDot');
    const auditTitle = document.getElementById('auditStatusTitle');
    const auditDesc = document.getElementById('auditStatusDesc');
    const auditWarnings = document.getElementById('auditWarningList');

    let warnings = [];
    let isCritical = false;

    if (isNaN(targetT) || targetT <= 0 || isNaN(targetTGv) || targetTGv <= 0) {
        isCritical = true;
        warnings.push("Некоректні вхідні температури");
    }
```

*Locate safety margin factor extractions:*
```javascript
    const nm = parseFloat(document.getElementById('calcNm').value) || 2.6;
    const nt = parseFloat(document.getElementById('calcNt').value) || 1.5;
    const ntBolt = parseFloat(document.getElementById('calcNtBolt').value) || 2.0;
    const gm = parseFloat(document.getElementById('calcGm').value) || 1.05;
    const gc = parseFloat(document.getElementById('calcGc').value) || 1.0;
    const gnNue = parseFloat(document.getElementById('calcGnNue').value) || 1.25;
    const gnPz = parseFloat(document.getElementById('calcGnPz').value) || 1.05;
```

*Add verification checks for coefficients:*
```javascript
    if (nm !== 2.6) warnings.push(`Запас nm (${nm}) відрізняється від 2,6`);
    if (nt !== 1.5) warnings.push(`Запас nt (${nt}) відрізняється від 1,5`);
    if (ntBolt !== 2.0) warnings.push(`Запас для кріплень ntBolt (${ntBolt}) відрізняється від 2,0`);
    if (gm !== 1.05) warnings.push(`Коефіцієнт gm (${gm}) відрізняється від 1,05`);
```

*Extract maximum temperature and check limits:*
```javascript
    // Retrieve base temperatures limits with valid values
    let validTemps = temperatures.filter(t => data["RTm"] && data["RTm"][t] !== "—" && data["RTm"][t] !== undefined);
    let maxGradeTemp = validTemps.length > 0 ? Math.max(...validTemps) : 600;

    if (targetT > maxGradeTemp) {
        warnings.push(`Робоча температура (${targetT}°C) вище межі випробувань сталі (${maxGradeTemp}°C). Консервативно обмежено.`);
    }
    if (targetTGv > maxGradeTemp) {
        warnings.push(`Температура ГВ (${targetTGv}°C) вище межі випробувань сталі (${maxGradeTemp}°C). Консервативно обмежено.`);
    }
    if (targetT < 20) {
        warnings.push(`Робоча температура (${targetT}°C) нижче 20°C.`);
    }
    if (targetTGv < 20) {
        warnings.push(`Температура ГВ (${targetTGv}°C) нижче 20°C.`);
    }
```

*Update UI style and classes of calcAuditPanel at the end of the calculations:*
```javascript
    if (auditPanel && auditDot && auditTitle && auditDesc && auditWarnings) {
        // Reset styles first
        auditPanel.className = "p-4 rounded-2xl text-xs font-semibold shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 mb-5 relative overflow-hidden";
        auditWarnings.classList.add('hidden');
        auditWarnings.innerHTML = "";

        if (isCritical) {
            auditPanel.classList.add('bg-rose-50/50', 'dark:bg-rose-950/20', 'text-rose-800', 'dark:text-rose-300', 'border-rose-200/50', 'dark:border-rose-900/30');
            auditDot.className = "relative inline-flex rounded-full h-3 w-3 bg-rose-500";
            if (auditPing) auditPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75";
            auditTitle.textContent = "Розрахунок заблоковано";
            auditDesc.textContent = "Введено некоректні фізичні значення температур. Розрахунок призупинено.";
        } else if (warnings.length > 0) {
            auditPanel.classList.add('bg-amber-50/50', 'dark:bg-amber-950/20', 'text-amber-800', 'dark:text-amber-300', 'border-amber-200/50', 'dark:border-amber-900/30');
            auditDot.className = "relative inline-flex rounded-full h-3 w-3 bg-amber-500";
            if (auditPing) auditPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75";
            auditTitle.textContent = "Аудит: Застереження";
            auditDesc.textContent = "Виявлено нестандартні коефіцієнти розрахунку або вихід за межі температурної сітки матеріалу.";
            
            auditWarnings.classList.remove('hidden');
            auditWarnings.innerHTML = warnings.map(w => `<div>⚠ ${w}</div>`).join('');
        } else {
            auditPanel.classList.add('bg-emerald-50/50', 'dark:bg-emerald-950/20', 'text-emerald-800', 'dark:text-emerald-300', 'border-emerald-200/50', 'dark:border-emerald-900/30');
            auditDot.className = "relative inline-flex rounded-full h-3 w-3 bg-emerald-500";
            if (auditPing) auditPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
            auditTitle.textContent = "Параметри розрахунку: Норма";
            auditDesc.textContent = "Розрахунок відповідає вимогам нормативності ПНАЕ G-7-002-86.";
        }
    }
```

- [ ] **Step 2: Run verification checks**

Run the calculator and test custom safety factors (e.g. set `nm` = 3.0), as well as temperatures (e.g. set `T` = 550 °C for a material whose maximum is 450 °C). Verify that the panel colors transition seamlessly and detail lists appear.

- [ ] **Step 3: Commit audit implementation**
```bash
git add app.js
git commit -m "feat: complete automated calculation safety audit triggers and status overrides"
```
