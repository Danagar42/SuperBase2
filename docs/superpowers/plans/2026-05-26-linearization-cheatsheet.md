# Шпаргалка лінеаризації в стилі SuperBase: План реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Створити нову папку `шпаргалка/` для застосунку лінеаризації напружень, винести стилі у `шпаргалка/styles.css`, оновити дизайн `шпаргалка/index.html` відповідно до преміум-дизайну SuperBase (колірна гама Indigo/Slate, шрифт Inter, темна тема через клас `dark`, тости, діалогові вікна, SVG іконки), та видалити застарілий файл `Шпаргалка.html` в корені.

**Architecture:** 
1. Створення папки `шпаргалка/` та винесення туди CSS-стилів.
2. Реалізація преміум-дизайну у `шпаргалка/index.html` з використанням Tailwind CSS для розмітки та кастомного `styles.css` для Excel-style виділень та Fluent-карт.
3. Синхронізація теми зі світлої на темну через єдиний ключ `localStorage.theme` та клас `.dark` на тегу `<html>` для безшовного користувацького досвіду з основним застосунком.
4. Видалення застарілого файлу в корені.

**Tech Stack:** HTML5, CSS3, Tailwind CSS (via CDN), Vanilla JavaScript, Google Fonts (Inter).

---

### Task 1: Створення папки та файлу стилів `шпаргалка/styles.css`

**Files:**
- Create: `d:/Розробка/SuperBase-main/шпаргалка/styles.css`

- [ ] **Step 1: Створити та записати файл `шпаргалка/styles.css` з преміум-стилями для шпаргалки**

Створіть файл `d:/Розробка/SuperBase-main/шпаргалка/styles.css` з наступним вмістом:
```css
/* Кастомні стилі для шпаргалки лінеаризації */

body {
    background-color: #f8fafc;
    transition: background-color 0.3s, color 0.3s;
}
html.dark body {
    background-color: #080b11;
}

::-webkit-scrollbar { height: 8px; width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; border: 2px solid transparent; background-clip: content-box; }
::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
html.dark ::-webkit-scrollbar-thumb { background: #475569; border: 2px solid transparent; background-clip: content-box; }
html.dark ::-webkit-scrollbar-thumb:hover { background: #64748b; }

/* Drag and Drop styles */
tr.dragging {
    opacity: 0.5;
    background-color: rgba(99, 102, 241, 0.15) !important;
    border: 2px dashed #6366f1 !important;
}
tr.drag-over-top {
    border-top: 2px solid #6366f1 !important;
}
tr.drag-over-bottom {
    border-bottom: 2px solid #6366f1 !important;
}

/* Excel-Style Cell Selection */
.col-s.cell-selected {
    background-color: #e0e7ff !important;
    box-shadow: inset 0 0 0 2px #6366f1 !important;
    color: #1e3a8a !important;
    position: relative;
    z-index: 5;
}
html.dark .col-s.cell-selected {
    background-color: rgba(99, 102, 241, 0.25) !important;
    box-shadow: inset 0 0 0 2px #818cf8 !important;
    color: #e0e7ff !important;
}

/* Fluent Glassmorphic Cards */
.fluent-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(16px) saturate(130%);
    -webkit-backdrop-filter: blur(16px) saturate(130%);
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04), 
                inset 0 1px 0 0 rgba(255, 255, 255, 0.8) !important;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}
html.dark .fluent-card {
    background: rgba(17, 22, 37, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3), 
                inset 0 1px 0 0 rgba(255, 255, 255, 0.05) !important;
}

/* Glassmorphism Header */
.glass-panel {
    background: rgba(255, 255, 255, 0.75) !important;
    backdrop-filter: blur(12px) saturate(120%);
    -webkit-backdrop-filter: blur(12px) saturate(120%);
}
html.dark .glass-panel {
    background: rgba(8, 11, 17, 0.75) !important;
    border-color: #1e2640 !important;
}

.brand-glow {
    box-shadow: 0 4px 20px -2px rgba(99, 102, 241, 0.08);
}
html.dark .brand-glow {
    box-shadow: 0 4px 25px -2px rgba(99, 102, 241, 0.18);
}

/* Custom Tooltip Arrow */
.tooltip-arrow::after {
    content: ''; position: absolute; top: 100%; left: 50%; margin-left: -5px;
    border-width: 5px; border-style: solid; border-color: #0f172a transparent transparent transparent;
}
html.dark .tooltip-arrow::after { border-color: #1e293b transparent transparent transparent; }
```

---

### Task 2: Реалізація `шпаргалка/index.html` з оновленим дизайном

**Files:**
- Create: `d:/Розробка/SuperBase-main/шпаргалка/index.html`

- [ ] **Step 1: Створити та записати файл `шпаргалка/index.html`**

Створіть файл `d:/Розробка/SuperBase-main/шпаргалка/index.html` з повністю оновленою структурою та логікою:
```html
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperBase | Шпаргалка лінеаризації</title>
    <link rel="icon" type="image/png" href="../favicon.png">
    
    <!-- Запобігання FOUC -->
    <script>
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: {
                            50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
                            500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
                        },
                        dark: {
                            bg: '#080b11', panel: '#111625', border: '#1e2640'
                        }
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="text-slate-800 dark:text-slate-200 h-screen flex flex-col overflow-hidden antialiased relative">

    <!-- Container для Toasts -->
    <div id="toastContainer" class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"></div>

    <!-- Confirm Modal -->
    <div id="confirmModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="fluent-card brand-glow border border-slate-200 dark:border-dark-border rounded-2xl p-6 text-center max-w-sm w-full transform scale-95 opacity-0 transition-all duration-300 ease-out" id="confirmModalCard">
            <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/30">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p id="confirmMessage" class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6 leading-relaxed"></p>
            <div class="flex gap-3 justify-center">
                <button class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 px-6 rounded-xl transition-all shadow-sm active:scale-95" id="confirmYesBtn">Так</button>
                <button class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95" id="confirmNoBtn">Ні</button>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="glass-panel brand-glow border-b border-slate-200 dark:border-dark-border z-40 flex items-center shrink-0 transition-colors h-[72px]">
        <div class="w-auto md:w-[340px] shrink-0 h-full flex items-center md:justify-center relative px-4 md:px-0">
            <svg viewBox="0 0 221 39" class="h-8 md:h-9 w-auto cursor-pointer" xmlns="http://www.w3.org/2000/svg" onclick="window.location.href='../index.html'">
                 <g>
                  <g>
                   <path d="m56.57869,19.46381l-9.1488,0l0,3.3044l10.6736,-0.0542l0,2.4558l-13.7414,0l0,-13.3621l13.7414,0l0.0182,2.4558l-10.6918,0l0,2.7627l9.1488,0l0,2.4376z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m63.77619,16.77341l8.8039,0l0,-4.9657l3.0496,0l0,13.3621l-3.0496,0l0,-5.7782l-8.8039,0l0,5.7782l-3.0678,0l0,-13.3621l3.0678,0l0,4.9657z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m90.71089,19.46381l-9.1489,0l0,3.3044l10.6737,-0.0542l0,2.4558l-13.7414,0l0,-13.3621l13.7414,0l0.0181,2.4558l-10.6918,0l0,2.7627l9.1489,0l0,2.4376z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m104.33399,11.80771c1.126,0 2.118,0.1866 2.977,0.5598c0.872,0.3732 1.543,0.8968 2.015,1.5709c0.484,0.6621 0.726,1.4326 0.726,2.3113l0,0.0722c0,1.4687 -0.441,2.5882 -1.325,3.3586c-0.883,0.7704 -2.178,1.1556 -3.884,1.1556l-6.9346,0l0,4.3337l-3.0678,0l0,-13.3621l9.4934,0zm-0.345,6.6449c0.69,0 1.241,-0.03 1.652,-0.0902c0.424,-0.0723 0.781,-0.2589 1.071,-0.5598c0.291,-0.313 0.436,-0.7945 0.436,-1.4445c0,-0.6862 -0.145,-1.1858 -0.436,-1.4988c-0.29,-0.325 -0.647,-0.5236 -1.071,-0.5958c-0.411,-0.0723 -0.962,-0.1084 -1.652,-0.1084l-0.708,0c-0.314,0 -0.859,0.006 -1.633,0.0181c-0.775,0 -2.0213,0 -3.7396,0l0,4.2794l6.0806,0z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m124.17099,11.80771l0,2.4377l-8.55,0l0,10.9244l-3.067,0l0,-13.3621l11.617,0z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m133.34299,11.51891c1.573,0 2.989,0.301 4.248,0.9029c1.27,0.6019 2.263,1.4385 2.977,2.5099c0.714,1.0713 1.071,2.2751 1.071,3.6113c0,1.3242 -0.357,2.516 -1.071,3.5753c-0.714,1.0592 -1.701,1.8959 -2.959,2.5098c-1.259,0.602 -2.675,0.9029 -4.248,0.9029c-1.525,0 -2.929,-0.3009 -4.211,-0.9029c-1.283,-0.6139 -2.3,-1.4506 -3.05,-2.5098c-0.75,-1.0715 -1.125,-2.2632 -1.125,-3.5753c0,-1.3242 0.375,-2.5219 1.125,-3.5933c0.75,-1.0714 1.761,-1.908 3.032,-2.5099c1.282,-0.6139 2.686,-0.9209 4.211,-0.9209zm0,11.5202c0.883,0 1.718,-0.1745 2.505,-0.5236c0.787,-0.3491 1.422,-0.8607 1.906,-1.5348c0.484,-0.6862 0.726,-1.4987 0.726,-2.4377c0,-0.9269 -0.248,-1.7334 -0.744,-2.4196c-0.484,-0.6862 -1.126,-1.2098 -1.924,-1.5709c-0.787,-0.3612 -1.622,-0.5417 -2.505,-0.5417c-0.944,0 -1.809,0.1805 -2.596,0.5417c-0.775,0.3611 -1.392,0.8787 -1.852,1.5528c-0.46,0.6742 -0.689,1.4747 -0.689,2.4016c0,0.9509 0.236,1.7696 0.707,2.4557c0.484,0.6742 1.12,1.1918 1.906,1.5529c0.787,0.3491 1.64,0.5236 2.56,0.5236z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m159.47299,25.16981l-3.196,0l-1.543,-2.835l-8.477,0l-1.543,2.835l-3.194,0l7.279,-13.3621l3.394,0l7.28,13.3621zm-8.968,-10.6174l-2.904,5.3087l5.79,0l-2.886,-5.3087z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m157.22899,14.35381l0,-2.5461l15.212,0l-15.212,2.5461zm15.212,-2.5461l0,2.6002l-6.027,0l0,10.7619l-3.067,0l0,-10.7619l-6.118,0l0,-2.6002l15.212,0z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m182.01399,11.51891c1.573,0 2.99,0.301 4.248,0.9029c1.271,0.6019 2.263,1.4385 2.977,2.5099c0.714,1.0713 1.07,2.2751 1.07,3.6113c0,1.3242 -0.356,2.516 -1.07,3.5753c-0.714,1.0592 -1.701,1.8959 -2.959,2.5098c-1.259,0.602 -2.674,0.9029 -4.247,0.9029c-1.526,0 -2.929,-0.3009 -4.212,-0.9029c-1.283,-0.6139 -2.299,-1.4506 -3.049,-2.5098c-0.75,-1.0715 -1.126,-2.2632 -1.126,-3.5753c0,-1.3242 0.376,-2.5219 1.126,-3.5933c0.75,-1.0714 1.76,-1.908 3.031,-2.5099c1.283,-0.6139 2.687,-0.9209 4.211,-0.9209zm0,11.5202c0.884,0 1.719,-0.1745 2.505,-0.5236c0.787,-0.3491 1.422,-0.8607 1.906,-1.5348c0.485,-0.6862 0.726,-1.4987 0.726,-2.4377c0,-0.9269 -0.248,-1.7334 -0.745,-2.4196c-0.483,-0.6862 -1.124,-1.2098 -1.923,-1.5709c-0.787,-0.3612 -1.622,-0.5417 -2.505,-0.5417c-0.943,0 -1.81,0.1805 -2.596,0.5417c-0.774,0.3611 -1.392,0.8787 -1.852,1.5528c-0.459,0.6742 -0.689,1.4747 -0.689,2.4016c0,0.9509 0.235,1.7696 0.708,2.4557c0.483,0.6742 1.119,1.1918 1.906,1.5529c0.787,0.3491 1.639,0.5236 2.559,0.5236z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m210.43199,11.80771l0,13.3621l-3.069,0l0,-8.3603l-4.101,8.3603l-3.069,0l-4.392,-8.4867l0,8.4867l-3.067,0l0,-13.3621l3.702,0l5.265,10.2924l5.045,-10.2924l3.686,0z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                   <path d="m18.11239,0.00001c-3.8136,0.00246 -7.5292,1.19954 -10.61802,3.42087c-3.0888,2.22134 -5.3934,5.35373 -6.58574,8.95123c-1.19234,3.5976 -1.21168,7.477 -0.05526,11.0861c1.15641,3.6093 3.42966,6.7641 6.49618,9.0157c3.06654,2.2516 6.77004,3.4852 10.58334,3.5251c3.8135,0.04 7.5422,-1.1157 10.6559,-3.3026c3.1137,-2.1867 5.4535,-5.2933 6.6863,-8.8775c1.2328,-3.584 1.2959,-7.463 0.1802,-11.0848c-1.1379,-3.6864 -3.4369,-6.91297 -6.5587,-9.20519c-3.1219,-2.29223 -6.9019,-3.52916 -10.7842,-3.52891zm-12.14097,9.1734l12.04087,0l2.9901,6.8544l-2.9901,0l0,-1.85l-12.04087,0l0,-5.0044zm12.14097,25.9088l-0.1001,0l0,-8.0908l-12.04087,0l0,-10.9721l12.01787,0l0,4.8027l-7.7258,0l0,1.3668l7.7258,0l0,-1.3668l5.0875,0l2.5754,5.9137l5.4995,0l-7.6829,-17.5879l-5.4565,0l0,-8.1958l0.1001,0c4.5191,0.05792 8.8333,1.88149 12.0083,5.07576c3.1752,3.19434 4.9555,7.50214 4.9555,11.99074c0,4.4886 -1.7803,8.7965 -4.9555,11.9907c-3.175,3.1942 -7.4892,5.0178 -12.0083,5.0758l0,-0.0028z" fill="currentColor" class="text-slate-800 dark:text-white"/>
                  </g>
                  <text xml:space="preserve" text-anchor="start" font-family="Inter, sans-serif" font-weight="500" font-size="8.5" y="37" x="42" stroke-width="0" fill="currentColor" class="text-slate-800 dark:text-white">Філія «ВП «Науково-технічний центр»</text>
                 </g>
            </svg>
            <div class="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div class="flex-1 h-full flex items-center justify-between px-4 md:px-6">
            <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span class="flex items-baseline"><span class="text-3xl font-black text-brand-600 dark:text-brand-500 cursor-pointer select-none" onclick="window.location.href='../index.html'">S</span>uperBase</span>
                <span class="text-brand-600 dark:text-brand-400 font-semibold text-xs bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/50 px-2.5 py-1 rounded-md">
                    Шпаргалка лінеаризації (Path Results)
                </span>
            </h1>

            <div class="flex items-center gap-3">
                <button id="themeToggle" aria-label="Перемикач теми" title="Перемикач теми" class="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                    <svg id="icon-sun" class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    <svg id="icon-moon" class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex flex-col flex-1 overflow-hidden p-4 md:p-6 gap-4">
        
        <!-- Toolbar Panel -->
        <div class="fluent-card brand-glow rounded-2xl border border-slate-200 dark:border-dark-border p-4 flex flex-wrap gap-4 items-center justify-between shrink-0">
            <div class="flex flex-wrap gap-2.5 items-center">
                <button class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95" id="btnAddRow" title="Додати Path (Enter)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"></path></svg>
                    Додати Path
                </button>
                <button class="bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-semibold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95" id="btnClearTable" title="Очистити все">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Очистити таблицю
                </button>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                
                <!-- Undo Redo -->
                <button class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95" id="btnUndo" title="Скасувати (Ctrl+Z)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path></svg>
                </button>
                <button class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95" id="btnRedo" title="Повторити (Ctrl+Y)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z"></path></svg>
                </button>
            </div>

            <div class="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden lg:inline">Клавіші: [Enter] - додати, [Delete] - видалити виділені, [Esc] - зняти виділення, [Ctrl+A] - все</span>
                <div class="flex items-center gap-2">
                    <select id="bulkZoneSelect" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2.5 outline-none transition-all cursor-pointer font-semibold min-w-[180px]"></select>
                    <button class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5" id="btnBulkApply" title="Застосувати зону до виділених">
                        <span>Застосувати</span>
                        <span class="bg-white/20 dark:bg-black/20 text-white px-2 py-0.5 rounded-full font-bold text-[10px]" id="selectedCount">0</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Table Viewport container -->
        <div class="fluent-card brand-glow rounded-2xl border border-slate-200 dark:border-dark-border flex-1 overflow-hidden flex flex-col">
            <div class="overflow-auto flex-1 w-full relative">
                <table class="w-full text-sm text-left border-separate border-spacing-0" id="pathTable">
                    <thead class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                        <tr>
                            <th class="py-3 px-2 text-center w-[3%] border-b border-slate-200 dark:border-slate-700"></th>
                            <th class="py-3 px-2 text-center w-[4%] border-b border-slate-200 dark:border-slate-700">
                                <input type="checkbox" id="selectAll" class="w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer">
                            </th>
                            <th class="py-3 px-4 w-[22%] border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                                <div class="flex items-center gap-1.5 justify-between">
                                    <span>Назва шляху</span>
                                    <button class="copy-col-btn text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-col="path-name" title="Копіювати стовпець">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    </button>
                                </div>
                            </th>
                            <th class="py-3 px-4 w-[28%] border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">Зона / Тип перерізу</th>
                            <th class="py-3 px-4 w-[13%] border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-center">
                                <div class="flex items-center gap-1.5 justify-center">
                                    <span>S<sub>1</sub></span>
                                    <button class="copy-col-btn text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-col="s1-val" title="Копіювати стовпець">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    </button>
                                </div>
                            </th>
                            <th class="py-3 px-4 w-[13%] border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-center">
                                <div class="flex items-center gap-1.5 justify-center">
                                    <span>S<sub>2</sub></span>
                                    <button class="copy-col-btn text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-col="s2-val" title="Копіювати стовпець">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    </button>
                                </div>
                            </th>
                            <th class="py-3 px-4 w-[13%] border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-center">
                                <div class="flex items-center gap-1.5 justify-center">
                                    <span>S<sub>rv</sub></span>
                                    <button class="copy-col-btn text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-col="srv-val" title="Копіювати стовпець">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    </button>
                                </div>
                            </th>
                            <th class="py-3 px-4 w-[8%] border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-center">Дії</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <!-- Рядки рендеряться динамічно -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        // Enum-style constants
        const ZONES = {
            NONE: '',
            FLANGE: 'flange',
            WELD_FLANGE_ELLIPTICAL: 'weld_flange_elliptical',
            WELD_FLANGE_SHELL: 'weld_flange_shell',
            FASTENERS: 'fasteners',
            SHELL: 'shell',
            FLAT_COVER: 'flat_cover',
            ELLIPTICAL_HEAD: 'elliptical_head',
            NOZZLE: 'nozzle',
            TUBESHEET: 'tubesheet'
        };

        // Пастельна преміальна гама кольорів SuperBase
        const ZONE_COLORS = {
            [ZONES.NONE]: 'transparent',
            [ZONES.FLANGE]: '#3b82f6', // Синій
            [ZONES.WELD_FLANGE_ELLIPTICAL]: '#10b981', // Смарагдовий
            [ZONES.WELD_FLANGE_SHELL]: '#0d9488', // Тіловий
            [ZONES.FASTENERS]: '#f59e0b', // Бурштиновий
            [ZONES.SHELL]: '#8b5cf6', // Фіолетовий
            [ZONES.FLAT_COVER]: '#ec4899', // Рожевий
            [ZONES.ELLIPTICAL_HEAD]: '#06b6d4', // Блакитний ціан
            [ZONES.NOZZLE]: '#f43f5e', // Рожево-червоний
            [ZONES.TUBESHEET]: '#6366f1' // Індиго
        };

        const ZONE_BG_COLORS = {
            [ZONES.NONE]: 'transparent',
            [ZONES.FLANGE]: 'rgba(59, 130, 246, 0.12)',
            [ZONES.WELD_FLANGE_ELLIPTICAL]: 'rgba(16, 185, 129, 0.12)',
            [ZONES.WELD_FLANGE_SHELL]: 'rgba(13, 148, 136, 0.12)',
            [ZONES.FASTENERS]: 'rgba(245, 158, 11, 0.12)',
            [ZONES.SHELL]: 'rgba(139, 92, 246, 0.12)',
            [ZONES.FLAT_COVER]: 'rgba(236, 72, 153, 0.12)',
            [ZONES.ELLIPTICAL_HEAD]: 'rgba(6, 182, 212, 0.12)',
            [ZONES.NOZZLE]: 'rgba(244, 63, 94, 0.12)',
            [ZONES.TUBESHEET]: 'rgba(99, 102, 241, 0.12)'
        };

        const T_SM = '<span class="tt border-b border-dashed border-slate-400 cursor-help" title="Membrane (Мембранні)">σ<sub>m</sub></span>';
        const T_SB = '<span class="tt border-b border-dashed border-slate-400 cursor-help" title="Bending (Згинні)">σ<sub>b</sub></span>';
        const T_ST = '<span class="tt border-b border-dashed border-slate-400 cursor-help" title="Thermal (Температурні)">σ<sub>T</sub></span>';

        const stressData = {
            [ZONES.NONE]: { name: "-- Оберіть зону --", s1: "-", s2: "-", srv: "-" },
            [ZONES.FLANGE]: { 
                name: "Фланець", 
                s1: `${T_SM}`, 
                s2: `${T_SM} + ${T_SB}`, 
                srv: `${T_SM} + ${T_SB} + ${T_ST}` 
            },
            [ZONES.WELD_FLANGE_ELLIPTICAL]: { 
                name: "Зона приварки фланця до еліптичного днища", 
                s1: "-", 
                s2: `${T_SM}`, 
                srv: `${T_SM} + ${T_SB} + ${T_ST}` 
            },
            [ZONES.WELD_FLANGE_SHELL]: { 
                name: "Зона приварки фланця до обичайки", 
                s1: "-", 
                s2: `${T_SM}`, 
                srv: `${T_SM} + ${T_SB} + ${T_ST}` 
            },
            [ZONES.FASTENERS]: { 
                name: "Болти/шпильки", 
                s1: `${T_SM}`, 
                s2: `${T_SM} + ${T_SB}`, 
                srv: `${T_SM} + ${T_SB} + ${T_ST}` 
            },
            [ZONES.SHELL]: { 
                name: "Обичайка", 
                s1: `${T_SM}`, 
                s2: "-", 
                srv: `${T_SM} + ${T_ST}` 
            },
            [ZONES.FLAT_COVER]: { 
                name: "Плоска кришка", 
                s1: "-", 
                s2: `${T_SB}`, 
                srv: `${T_SB} + ${T_ST}` 
            },
            [ZONES.ELLIPTICAL_HEAD]: { 
                name: "Еліптичне днище", 
                s1: `${T_SM}`, 
                s2: `${T_SM} + ${T_SB}`, 
                srv: `${T_SM} + ${T_SB} + ${T_ST}` 
            },
            [ZONES.NOZZLE]: { 
                name: "Зона патрубка", 
                s1: `${T_SM}`, 
                s2: `${T_SM} + ${T_SB}`, 
                srv: `${T_SB} + ${T_ST}` 
            },
            [ZONES.TUBESHEET]: { 
                name: "Трубна дошка", 
                s1: "-", 
                s2: `${T_SB}`, 
                srv: `${T_SM} + ${T_SB} + ${T_ST}` 
            }
        };

        const tableBody = document.getElementById('tableBody');
        const bulkZoneSelect = document.getElementById('bulkZoneSelect');
        const selectAllCheckbox = document.getElementById('selectAll');
        const selectedCountSpan = document.getElementById('selectedCount');
        
        let state = []; 
        let history = [];
        let historyIndex = -1;
        let pathCounter = 1;
        
        let isDraggingSelect = false;
        let startRowId = null;
        let draggedRowForReorder = null;

        // Excel-style Selection state
        let isSelectingCells = false;
        let startCell = null;

        // --- State Management ---
        function generateId() {
            return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        }

        function syncStateFromDOM() {
            state = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)')).map(tr => ({
                id: tr.dataset.id,
                name: tr.querySelector('.path-name').value,
                zone: tr.querySelector('.zone-select').value,
                selected: tr.classList.contains('selected-row')
            }));
        }

        function saveState(pushToHistory = true) {
            syncStateFromDOM();
            localStorage.setItem('ansys_paths_state', JSON.stringify(state));
            localStorage.setItem('ansys_paths_counter', pathCounter);
            
            if (pushToHistory) {
                if (historyIndex < history.length - 1) {
                    history = history.slice(0, historyIndex + 1);
                }
                history.push(JSON.stringify(state));
                if (history.length > 50) history.shift();
                historyIndex = history.length - 1;
            }
            updateSelectedCount();
        }

        function loadState(stateStr, isInit = false) {
            if (!stateStr) return false;
            state = JSON.parse(stateStr);
            renderTable();
            if (isInit) {
                history = [stateStr];
                historyIndex = 0;
                const savedCounter = localStorage.getItem('ansys_paths_counter');
                if (savedCounter) pathCounter = parseInt(savedCounter, 10);
            }
            return true;
        }

        function undo() {
            if (historyIndex > 0) {
                historyIndex--;
                loadState(history[historyIndex]);
                syncStateFromDOM();
                localStorage.setItem('ansys_paths_state', JSON.stringify(state));
                showNotification("Скасовано");
            }
        }

        function redo() {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                loadState(history[historyIndex]);
                syncStateFromDOM();
                localStorage.setItem('ansys_paths_state', JSON.stringify(state));
                showNotification("Повторено");
            }
        }

        // --- Rendering ---
        function renderTable() {
            tableBody.innerHTML = '';
            if (state.length === 0) {
                const tr = document.createElement('tr');
                tr.className = 'empty-state-row';
                tr.innerHTML = `
                    <td colspan="8" class="py-16 text-center text-slate-400 dark:text-slate-500 font-medium italic border-b border-slate-200 dark:border-slate-800">
                        Таблиця порожня. Натисніть "+ Додати Path" або кнопку [Enter] для створення нового шляху.
                    </td>
                `;
                tableBody.appendChild(tr);
                updateSelectedCount();
                return;
            }

            state.forEach(row => {
                const tr = createRowElement(row);
                tableBody.appendChild(tr);
            });
            updateSelectedCount();
        }

        function createRowElement(rowData) {
            const tr = document.createElement('tr');
            tr.dataset.id = rowData.id;
            tr.className = "hover:bg-slate-50/40 dark:hover:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800/50 transition-colors";
            tr.setAttribute('draggable', 'false');
            if (rowData.selected) tr.classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');

            let optionsHtml = '';
            for (const [key, data] of Object.entries(stressData)) {
                const isSelected = rowData.zone === key ? 'selected' : '';
                optionsHtml += `<option value="${key}" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium" ${isSelected}>${data.name}</option>`;
            }

            const stress = stressData[rowData.zone] || stressData[ZONES.NONE];
            const zoneColor = ZONE_COLORS[rowData.zone] || 'transparent';
            const zoneBg = ZONE_BG_COLORS[rowData.zone] || 'transparent';

            tr.innerHTML = `
                <td class="drag-handle py-3.5 px-2 text-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing font-bold select-none text-base" title="Затисніть для перетягування">
                    <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8h16M4 16h16"></path></svg>
                </td>
                <td class="py-3.5 px-2 text-center">
                    <input type="checkbox" class="row-select w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer" ${rowData.selected ? 'checked' : ''}>
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100 font-mono">
                    <input type="text" class="path-name bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl py-2 px-3 outline-none transition-all block w-full focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold" value="${rowData.name}" placeholder="Назва шляху" style="border-left: 4px solid ${zoneColor}; background-color: ${zoneBg};">
                </td>
                <td class="py-3.5 px-4">
                    <select class="zone-select w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-2.5 outline-none transition-all cursor-pointer font-bold appearance-none" style="border-left: 4px solid ${zoneColor}; background-color: ${zoneBg}; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.1em;">
                        ${optionsHtml}
                    </select>
                </td>
                <td class="col-s s1-val py-3.5 px-4 text-center font-bold font-mono text-xs">${stress.s1}</td>
                <td class="col-s s2-val py-3.5 px-4 text-center font-bold font-mono text-xs">${stress.s2}</td>
                <td class="col-s srv-val py-3.5 px-4 text-center font-bold font-mono text-xs">${stress.srv}</td>
                <td class="py-3.5 px-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button class="dup-btn text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-action="duplicate" title="Дублювати рядок">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        </button>
                        <button class="remove-btn text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors" data-action="remove" title="Видалити рядок">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            return tr;
        }

        function getNextPathName() {
            const name = `Path ${String.fromCharCode(64 + pathCounter)}`;
            pathCounter = pathCounter > 25 ? 1 : pathCounter + 1;
            return name;
        }

        // --- Custom Confirm Modal ---
        function showConfirm(message, onConfirm) {
            const modal = document.getElementById('confirmModal');
            const card = document.getElementById('confirmModalCard');
            document.getElementById('confirmMessage').textContent = message;
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                card.classList.remove('scale-95', 'opacity-0');
                card.classList.add('scale-100', 'opacity-100');
            }, 10);
            
            const yesBtn = document.getElementById('confirmYesBtn');
            const noBtn = document.getElementById('confirmNoBtn');
            
            const cleanup = () => {
                card.classList.remove('scale-100', 'opacity-100');
                card.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
            };
            
            const handleYes = () => {
                cleanup();
                onConfirm();
            };
            
            const handleNo = () => {
                cleanup();
            };
            
            yesBtn.addEventListener('click', handleYes);
            noBtn.addEventListener('click', handleNo);
        }

        // --- Basic Operations ---
        document.getElementById('btnAddRow').addEventListener('click', () => {
            const emptyRow = tableBody.querySelector('.empty-state-row');
            if (emptyRow) emptyRow.remove();

            const newRow = { id: generateId(), name: getNextPathName(), zone: ZONES.NONE, selected: false };
            const tr = createRowElement(newRow);
            tableBody.appendChild(tr);
            saveState(true);
        });

        document.getElementById('btnClearTable').addEventListener('click', () => {
            showConfirm("Дійсно очистити таблицю?", () => {
                tableBody.innerHTML = '';
                pathCounter = 1;
                saveState(true);
                showNotification("Таблицю очищено!");
            });
        });

        document.getElementById('btnUndo').addEventListener('click', undo);
        document.getElementById('btnRedo').addEventListener('click', redo);

        // ESC, Delete, Enter, Ctrl+A Shortcuts
        document.addEventListener('keydown', e => {
            const activeEl = document.activeElement;
            const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT');

            if (e.key === 'Escape') {
                const rows = document.querySelectorAll('#tableBody tr');
                rows.forEach(tr => {
                    tr.classList.remove('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                    const cb = tr.querySelector('.row-select');
                    if (cb) cb.checked = false;
                });
                selectAllCheckbox.checked = false;
                updateSelectedCount();
                clearCellSelection(); 
                saveState(false);
                showNotification("Виділення знято");
                return;
            }

            if (e.key === 'Delete') {
                if (!isInputFocused) {
                    const selectedRows = Array.from(tableBody.querySelectorAll('tr.selected-row'));
                    if (selectedRows.length > 0) {
                        selectedRows.forEach(row => row.remove());
                        saveState(true);
                        showNotification(`Вилучено рядків: ${selectedRows.length}`);
                    }
                }
                return;
            }

            if (e.key === 'Enter') {
                if (isInputFocused && activeEl.classList.contains('path-name')) {
                    activeEl.blur();
                }
                if (activeEl.tagName !== 'SELECT' && activeEl.tagName !== 'BUTTON') {
                    e.preventDefault();
                    document.getElementById('btnAddRow').click();
                    setTimeout(() => {
                        const lastRowInput = tableBody.querySelector('tr:last-child .path-name');
                        if (lastRowInput) {
                            lastRowInput.focus();
                            lastRowInput.select();
                        }
                    }, 50);
                }
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                if (!isInputFocused) {
                    e.preventDefault();
                    const rows = tableBody.querySelectorAll('tr:not(.empty-state-row)');
                    rows.forEach(tr => {
                        tr.classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                        const cb = tr.querySelector('.row-select');
                        if (cb) cb.checked = true;
                    });
                    saveState(false);
                    updateSelectedCount();
                    showNotification("Виділено всі рядки");
                }
                return;
            }

            if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isInputFocused) {
                e.preventDefault();
                const rows = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
                if (rows.length === 0) return;
                
                let activeIdx = rows.findIndex(tr => tr.classList.contains('selected-row'));
                if (activeIdx === -1) {
                    const selectIdx = e.key === 'ArrowDown' ? 0 : rows.length - 1;
                    rows[selectIdx].classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                    const cb = rows[selectIdx].querySelector('.row-select');
                    if (cb) cb.checked = true;
                    startRowId = rows[selectIdx].dataset.id;
                } else {
                    rows.forEach(r => { 
                        r.classList.remove('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10'); 
                        const cb = r.querySelector('.row-select'); 
                        if(cb) cb.checked = false; 
                    });
                    let nextIdx = e.key === 'ArrowDown' ? activeIdx + 1 : activeIdx - 1;
                    if (nextIdx >= rows.length) nextIdx = rows.length - 1;
                    if (nextIdx < 0) nextIdx = 0;
                    rows[nextIdx].classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                    const cb = rows[nextIdx].querySelector('.row-select');
                    if (cb) cb.checked = true;
                    startRowId = rows[nextIdx].dataset.id;
                }
                saveState(false);
                updateSelectedCount();
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redo(); else undo();
                } else if (e.key.toLowerCase() === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        });

        // --- Delegation on Table Body ---
        tableBody.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (btn) {
                const tr = btn.closest('tr');
                if (btn.dataset.action === 'remove') {
                    tr.remove();
                    saveState(true);
                } else if (btn.dataset.action === 'duplicate') {
                    const trData = {
                        id: generateId(),
                        name: tr.querySelector('.path-name').value + ' (Copy)',
                        zone: tr.querySelector('.zone-select').value,
                        selected: false
                    };
                    const newTr = createRowElement(trData);
                    tr.parentNode.insertBefore(newTr, tr.nextSibling);
                    saveState(true);
                }
                return;
            }

            // Checkbox click
            if (e.target.classList.contains('row-select')) {
                const tr = e.target.closest('tr');
                if (e.target.checked) tr.classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                else tr.classList.remove('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                saveState(false);
                updateSelectedCount();
            }
        });

        tableBody.addEventListener('change', e => {
            if (e.target.classList.contains('zone-select')) {
                const tr = e.target.closest('tr');
                const data = stressData[e.target.value];
                tr.querySelector('.s1-val').innerHTML = data.s1;
                tr.querySelector('.s2-val').innerHTML = data.s2;
                tr.querySelector('.srv-val').innerHTML = data.srv;

                const zoneColor = ZONE_COLORS[e.target.value] || 'transparent';
                const zoneBg = ZONE_BG_COLORS[e.target.value] || 'transparent';

                e.target.style.borderLeft = `4px solid ${zoneColor}`;
                e.target.style.backgroundColor = zoneBg;

                const pathNameInput = tr.querySelector('.path-name');
                if (pathNameInput) {
                    pathNameInput.style.borderLeft = `4px solid ${zoneColor}`;
                    pathNameInput.style.backgroundColor = zoneBg;
                }
                saveState(true);
            } else if (e.target.classList.contains('path-name')) {
                saveState(true);
            }
        });
        
        // --- Excel-Style Cell Selection Logic ---
        function clearCellSelection() {
            tableBody.querySelectorAll('td.col-s.cell-selected').forEach(cell => {
                cell.classList.remove('cell-selected');
            });
        }

        function selectCellRange(cellA, cellB) {
            clearCellSelection();
            const minRow = Math.min(cellA.row, cellB.row);
            const maxRow = Math.max(cellA.row, cellB.row);
            const minCol = Math.min(cellA.col, cellB.col);
            const maxCol = Math.max(cellA.col, cellB.col);

            const trs = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
            for (let r = minRow; r <= maxRow; r++) {
                const tr = trs[r];
                if (!tr) continue;
                const cells = [
                    tr.querySelector('.s1-val'),
                    tr.querySelector('.s2-val'),
                    tr.querySelector('.srv-val')
                ];
                for (let c = minCol; c <= maxCol; c++) {
                    if (cells[c]) {
                        cells[c].classList.add('cell-selected');
                    }
                }
            }
        }

        // --- Selection and D&D Handlers ---
        tableBody.addEventListener('mousedown', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || tr.classList.contains('empty-state-row')) return;

            // Reordering trigger
            if (e.target.closest('.drag-handle')) {
                tr.setAttribute('draggable', 'true');
                return;
            }

            // Excel-style selection of stresses
            const targetTd = e.target.closest('td.col-s');
            if (targetTd) {
                clearCellSelection();
                if (document.activeElement) document.activeElement.blur();

                isSelectingCells = true;
                document.body.classList.add('dragging-active');

                const trs = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
                const rIndex = trs.indexOf(tr);

                let cIndex = 0;
                if (targetTd.classList.contains('s2-val')) cIndex = 1;
                if (targetTd.classList.contains('srv-val')) cIndex = 2;

                startCell = { row: rIndex, col: cIndex };
                targetTd.classList.add('cell-selected');
                
                e.preventDefault();
                return; 
            }

            // Ignore inputs
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.target.closest('button') || e.target.tagName === 'OPTION') {
                return;
            }

            // Regular row selection drag
            isDraggingSelect = true;
            document.body.classList.add('dragging-active');
            
            const rows = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
            
            if (e.shiftKey && startRowId) {
                const startRow = tableBody.querySelector(`tr[data-id="${startRowId}"]`);
                if(startRow) selectRange(startRow, tr);
            } else if (e.ctrlKey || e.metaKey) {
                tr.classList.toggle('selected-row');
                tr.classList.toggle('bg-indigo-50/30');
                tr.classList.toggle('dark:bg-indigo-950/10');
                tr.querySelector('.row-select').checked = tr.classList.contains('selected-row');
                startRowId = tr.dataset.id;
            } else {
                rows.forEach(r => { 
                    r.classList.remove('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10'); 
                    r.querySelector('.row-select').checked = false; 
                });
                tr.classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                tr.querySelector('.row-select').checked = true;
                startRowId = tr.dataset.id;
            }
            updateSelectedCount();
        });

        tableBody.addEventListener('mouseover', (e) => {
            if (isSelectingCells && startCell) {
                const targetTd = e.target.closest('td.col-s');
                if (!targetTd) return;

                const tr = targetTd.closest('tr');
                const trs = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
                const rIndex = trs.indexOf(tr);

                let cIndex = 0;
                if (targetTd.classList.contains('s2-val')) cIndex = 1;
                if (targetTd.classList.contains('srv-val')) cIndex = 2;

                selectCellRange(startCell, { row: rIndex, col: cIndex });
                return;
            }

            if (!isDraggingSelect || !startRowId) return;
            const tr = e.target.closest('tr');
            if (!tr || tr.classList.contains('empty-state-row')) return;
            if (e.target.classList.contains('col-s') || e.target.closest('.col-s')) return;
            const startRow = tableBody.querySelector(`tr[data-id="${startRowId}"]`);
            if (startRow) selectRange(startRow, tr);
            updateSelectedCount();
        });

        document.addEventListener('mouseup', () => {
            if (isDraggingSelect) {
                isDraggingSelect = false;
                document.body.classList.remove('dragging-active');
                saveState(false);
            }
            if (isSelectingCells) {
                isSelectingCells = false;
                document.body.classList.remove('dragging-active');
            }
            document.querySelectorAll('#tableBody tr').forEach(r => r.setAttribute('draggable', 'false'));
        });

        function selectRange(rowA, rowB) {
            const rows = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
            const indexA = rows.indexOf(rowA);
            const indexB = rows.indexOf(rowB);
            const start = Math.min(indexA, indexB);
            const end = Math.max(indexA, indexB);
            
            rows.forEach((row, idx) => {
                const isSel = (idx >= start && idx <= end);
                if(isSel) {
                    row.classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                } else {
                    row.classList.remove('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                }
                row.querySelector('.row-select').checked = isSel;
            });
        }

        // --- HTML5 Drag and Drop Reordering ---
        tableBody.addEventListener('dragstart', e => {
            const tr = e.target.closest('tr');
            if (tr) {
                draggedRowForReorder = tr;
                e.dataTransfer.effectAllowed = 'move';
                if (e.dataTransfer.setData) e.dataTransfer.setData('text/plain', '');
                setTimeout(() => draggedRowForReorder.classList.add('dragging'), 0);
            }
        });

        tableBody.addEventListener('dragover', e => {
            e.preventDefault();
            if (!draggedRowForReorder) return;
            const tr = e.target.closest('tr');
            if (tr && tr !== draggedRowForReorder && tr.parentNode === tableBody && !tr.classList.contains('empty-state-row')) {
                const rect = tr.getBoundingClientRect();
                const relY = e.clientY - rect.top;
                
                Array.from(tableBody.children).forEach(r => {
                    r.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                if (relY < rect.height / 2) {
                    tr.classList.add('drag-over-top');
                } else {
                    tr.classList.add('drag-over-bottom');
                }
            }
        });

        tableBody.addEventListener('dragleave', e => {
            if (!draggedRowForReorder) return;
            const tr = e.target.closest('tr');
            if (tr) {
                tr.classList.remove('drag-over-top', 'drag-over-bottom');
            }
        });

        tableBody.addEventListener('drop', e => {
            e.preventDefault();
            if (!draggedRowForReorder) return;
            
            const tr = e.target.closest('tr');
            if (tr && tr !== draggedRowForReorder && tr.parentNode === tableBody && !tr.classList.contains('empty-state-row')) {
                const rect = tr.getBoundingClientRect();
                const relY = e.clientY - rect.top;
                
                if (relY < rect.height / 2) {
                    tableBody.insertBefore(draggedRowForReorder, tr);
                } else {
                    tableBody.insertBefore(draggedRowForReorder, tr.nextSibling);
                }
            }
        });

        tableBody.addEventListener('dragend', e => {
            if (draggedRowForReorder) {
                draggedRowForReorder.classList.remove('dragging');
                draggedRowForReorder.setAttribute('draggable', 'false');
                draggedRowForReorder = null;
            }
            Array.from(tableBody.children).forEach(r => {
                r.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            saveState(true);
        });

        // --- Bulk Application & Copy Column ---
        selectAllCheckbox.addEventListener('change', function() {
            const rows = document.querySelectorAll('#tableBody tr:not(.empty-state-row)');
            rows.forEach(tr => {
                if (this.checked) tr.classList.add('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                else tr.classList.remove('selected-row', 'bg-indigo-50/30', 'dark:bg-indigo-950/10');
                tr.querySelector('.row-select').checked = this.checked;
            });
            saveState(false);
            updateSelectedCount();
        });

        document.getElementById('btnBulkApply').addEventListener('click', () => {
            const selectedZone = bulkZoneSelect.value;
            if (!selectedZone) {
                showNotification("Оберіть зону для застосування!", true);
                return;
            }
            
            const selectedRows = document.querySelectorAll('#tableBody tr.selected-row');
            if (selectedRows.length === 0) {
                showNotification("Виділіть рядки перед застосуванням!", true);
                return;
            }

            const zoneColor = ZONE_COLORS[selectedZone] || 'transparent';
            const zoneBg = ZONE_BG_COLORS[selectedZone] || 'transparent';
            
            selectedRows.forEach(tr => {
                const select = tr.querySelector('.zone-select');
                if (select) {
                    select.value = selectedZone;
                    select.style.borderLeft = `4px solid ${zoneColor}`;
                    select.style.backgroundColor = zoneBg;
                }

                const pathNameInput = tr.querySelector('.path-name');
                if (pathNameInput) {
                    pathNameInput.style.borderLeft = `4px solid ${zoneColor}`;
                    pathNameInput.style.backgroundColor = zoneBg;
                }
                
                const data = stressData[selectedZone];
                tr.querySelector('.s1-val').innerHTML = data.s1;
                tr.querySelector('.s2-val').innerHTML = data.s2;
                tr.querySelector('.srv-val').innerHTML = data.srv;
            });
            
            saveState(true);
            showNotification(`Успішно оновлено рядків: ${selectedRows.length}`);
        });

        // Buffer Copying
        function copyTextToClipboard(text, successMsg) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) showNotification(successMsg);
                else showNotification("Помилка копіювання", true);
            } catch (err) {
                showNotification("Не підтримується пристроєм", true);
            }
            document.body.removeChild(textArea);
        }

        // Copy columns as tab-separated text
        document.querySelectorAll('.copy-col-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const colClass = btn.dataset.col;
                let textToCopy = "";

                if (colClass === 'path-name') {
                    const elements = tableBody.querySelectorAll(`.${colClass}`);
                    textToCopy = Array.from(elements).map(el => el.value).join('\n');
                } else {
                    const elements = tableBody.querySelectorAll(`.${colClass}`);
                    textToCopy = Array.from(elements).map(el => el.innerText.trim()).join('\n');
                }

                if (!textToCopy) {
                    showNotification("Стовпець порожній", true);
                    return;
                }
                copyTextToClipboard(textToCopy, "Стовпець скопійовано!");
            });
        });

        // Copy on clipboard event (Excel style)
        document.addEventListener('copy', (e) => {
            const selectedCells = Array.from(tableBody.querySelectorAll('td.col-s.cell-selected'));
            if (selectedCells.length === 0) return;

            const trs = Array.from(tableBody.querySelectorAll('tr:not(.empty-state-row)'));
            const rowMap = new Map();

            selectedCells.forEach(cell => {
                const tr = cell.closest('tr');
                const rIndex = trs.indexOf(tr);
                let cIndex = 0;
                if (cell.classList.contains('s2-val')) cIndex = 1;
                if (cell.classList.contains('srv-val')) cIndex = 2;

                if (!rowMap.has(rIndex)) {
                    rowMap.set(rIndex, []);
                }
                rowMap.get(rIndex).push({ col: cIndex, text: cell.innerText.trim() });
            });

            const sortedRowIndices = Array.from(rowMap.keys()).sort((a, b) => a - b);
            const lines = sortedRowIndices.map(rIndex => {
                const cols = rowMap.get(rIndex).sort((a, b) => a.col - b.col);
                return cols.map(c => c.text).join('\t');
            });

            const clipboardText = lines.join('\n');
            e.clipboardData.setData('text/plain', clipboardText);
            e.preventDefault();
            showNotification("Скопійовано виділені клітинки!");
        });

        function updateSelectedCount() {
            const rows = document.querySelectorAll('#tableBody tr:not(.empty-state-row)');
            const selectedRows = document.querySelectorAll('#tableBody tr.selected-row');
            selectedCountSpan.textContent = selectedRows.length;
            if (rows.length > 0) {
                selectAllCheckbox.checked = (selectedRows.length === rows.length);
            } else {
                selectAllCheckbox.checked = false;
            }
        }

        // --- System / General ---
        function showNotification(message, isWarning = false) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            
            let icon = '';
            let borderColor = '';
            
            if (!isWarning) {
                icon = `<svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
                borderColor = 'border-emerald-500';
            } else {
                icon = `<svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
                borderColor = 'border-amber-500';
            }
                
            toast.className = `transform transition-all duration-300 translate-y-full opacity-0 bg-white dark:bg-slate-800 border-l-4 ${borderColor} shadow-xl rounded-xl p-4 flex items-center gap-3 min-w-[280px] max-w-md pointer-events-auto`;
            toast.innerHTML = `${icon}<span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${message}</span>`;
            
            container.appendChild(toast);
            
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-full', 'opacity-0');
            });
            
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
        });

        function initBulkDropdown() {
            let optionsHtml = '<option value="" class="font-bold">-- Оберіть зону --</option>';
            for (const [key, data] of Object.entries(stressData)) {
                if (key !== "") optionsHtml += `<option value="${key}">${data.name}</option>`;
            }
            bulkZoneSelect.innerHTML = optionsHtml;
        }

        window.onload = () => {
            initBulkDropdown();
            
            const savedState = localStorage.getItem('ansys_paths_state');
            if (savedState && JSON.parse(savedState).length > 0) {
                loadState(savedState, true);
            } else {
                document.getElementById('btnAddRow').click();
                document.getElementById('btnAddRow').click();
                document.getElementById('btnAddRow').click();
            }
        };
    </script>
</body>
</html>
```

---

### Task 3: Вилучення застарілого файлу та фінальна перевірка

**Files:**
- Delete: `d:/Розробка/SuperBase-main/Шпаргалка.html`

- [ ] **Step 1: Видалити застарілий файл `Шпаргалка.html` у корені проекту**

Запустіть команду PowerShell для видалення файлу:
Run: `Remove-Item -Path "d:\Розробка\SuperBase-main\Шпаргалка.html" -Force`

- [ ] **Step 2: Верифікація роботи застосунку шляхом перевірки наявності нових файлів**

Перевірте, чи існують файли в папці `шпаргалка/`:
Run: `Test-Path "d:\Розробка\SuperBase-main\шпаргалка\index.html"`
Expected: True

Run: `Test-Path "d:\Розробка\SuperBase-main\шпаргалка\styles.css"`
Expected: True
