if (typeof window === 'undefined') {
    global.window = global;
}

const PNAE_COEFS = {
    brittle_flange_gv: 1.3, brittle_flange_nue: 2.2,
    s1_pnue: 1.2,
    s2_nue: 1.3, s2_pnue: 1.6,
    s1_as: 1.4, s2_as: 1.8,
    ss1_pz_cat1: 1.2, ss1_mrz_cat1: 1.4,
    ss2_pz_cat1: 1.6, ss2_mrz_cat1: 1.8,
    ss1_pz_cat2: 1.5, ss2_pz_cat2: 1.9,
    ts_pz: 0.6, ts_pz_cat2: 0.8, ts_mrz: 0.7,
    gv_s1: 1.35, gv_s2: 1.7,
    bolt_pnue: 1.2,
    bolt_s1_as: 1.4,
    bolt_s3w_nue: 1.3, bolt_s3w_pnue: 1.6, bolt_s3w_as: 1.8,
    bolt_s4w_nue: 1.7, bolt_s4w_pnue: 2.0, bolt_s4w_as: 2.4,
    bolt_ssmw_pz_cat1: 1.2, bolt_ssmw_mrz_cat1: 1.4,
    bolt_ss4w_pz_cat1: 2.0, bolt_ss4w_mrz_cat1: 2.2,
    bolt_ssmw_pz_cat2: 1.5,
    bolt_ss4w_pz_cat2: 2.3,
    bolt_ts_pz: 0.6, bolt_ts_pz_cat2: 0.8, bolt_ts_mrz: 0.7,
    bolt_gv_rtp_mult: 0.7,
    thread_gv: 0.25,
    thread_nue: 0.32,
    bolt_tau_sw: 0.5
};


const temperatures = [20, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];

const propertiesList = [
    { key: "RTm", symbol: "R<sup>T</sup><sub>m</sub>", name: "Значення тимчасового опору", units: "МПа" },
    { key: "RTp", symbol: "R<sup>T</sup><sub>p0,2</sub>", name: "Значення межі текучості", units: "МПа" },
    { key: "A", symbol: "A", name: "Відносне подовження", units: "%" },
    { key: "Z", symbol: "Z", name: "Відносне звуження", units: "%" },
    { key: "E", symbol: "E", name: "Модуль Юнга", units: "ГПа" },
    { key: "Ro", symbol: "&rho;", name: "Густина", units: "кг/м<sup>3</sup>" },
    { key: "Alpha", symbol: "&alpha;", name: "Коеф. лінійного розширення", units: "мкК<sup>-1</sup>" },
    { key: "Mu", symbol: "&mu;", name: "Коефіцієнт Пуассона", units: "—" }
];

const coreDB = typeof materialsDB !== 'undefined' ? materialsDB : [
    {
        name: "Ст3сп5 (Демо)",
        grades: [
            {
                kp: "245",
                description: "Демонстраційний матеріал. Створіть файл data.js для вашої бази.",
                data: {
                    "RTm": { 20: 373, 50: 363, 100: 353, 150: 353, 200: 343, 250: 323, 300: 284, 350: 284, 400: "—", 450: "—", 500: "—", 550: "—", 600: "—" },
                    "RTp": { 20: 245, 50: 235, 100: 235, 150: 235, 200: 235, 250: 206, 300: 186, 350: 186, 400: "—", 450: "—", 500: "—", 550: "—", 600: "—" },
                    "A":   { 20: 26, 50: 24, 100: 22, 150: 20, 200: 20, 250: 20, 300: 20, 350: "—", 400: "—", 450: "—", 500: "—", 550: "—", 600: "—" },
                    "Z":   { 20: 50, 49: 49, 100: 49, 150: 48, 200: 47, 250: 47, 300: 48, 350: "—", 400: "—", 450: "—", 500: "—", 550: "—", 600: "—" },
                    "E":   { 20: 200, 50: 197, 100: 195, 150: 192, 200: 190, 250: 185, 300: 180, 350: 175, 400: 170, 450: 165, 500: 160, 550: "—", 600: "—" },
                    "Ro":  { 20: 7856, 50: "—", 100: 7832, 150: "—", 200: 7800, 250: "—", 300: 7765, 350: "—", 400: 7730, 450: "—", 500: 7692, 550: "—", 600: 7653 },
                    "Alpha": { 20: "—", 50: 11.5, 100: 11.9, 150: 12.2, 200: 12.5, 250: 12.8, 300: 13.1, 350: 13.4, 400: 13.7, 450: 13.9, 500: 14.1, 550: 14.3, 600: 14.5 },
                    "Mu":  { 20: 0.3, 50: 0.3, 100: 0.3, 150: 0.3, 200: 0.3, 250: 0.3, 300: 0.3, 350: 0.3, 400: 0.3, 450: 0.3, 500: 0.3, 550: 0.3, 600: 0.3 }
                }
            }
        ]
    }
];

// Deterministic fingerprint for distinguishing a freshly imported data.js from
// browser modifications made against the previous version of that file.
function materialFingerprint(value) {
    const json = JSON.stringify(value);
    let hash = 2166136261;
    for (let i = 0; i < json.length; i++) {
        hash ^= json.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0') + ':' + json.length;
}

function getMaterialChangeFingerprint(changes) {
    return materialFingerprint({
        overrides: changes.overrides || [],
        custom: changes.custom || [],
        deletedBaseNames: changes.deletedBaseNames || []
    });
}

let lastExportSnapshot = null;

let appMaterials = JSON.parse(JSON.stringify(coreDB));
// Stable base identities: a base material can be edited, renamed or deleted
// without shifting other materials into the wrong base slot.
let appMaterialOrigins = coreDB.map(material => material.name);

function getSavedMaterialChanges() {
    const overrides = [];
    const deletedBaseNames = [];
    coreDB.forEach(base => {
        const index = appMaterialOrigins.indexOf(base.name);
        if (index < 0) {
            deletedBaseNames.push(base.name);
        } else if (JSON.stringify(base) !== JSON.stringify(appMaterials[index])) {
            overrides.push({ baseName: base.name, material: appMaterials[index] });
        }
    });
    const custom = appMaterials.filter((_, index) => appMaterialOrigins[index] === null);
    return { overrides, custom, deletedBaseNames, materialOrder: appMaterials.map(material => material.name) };
}

function restoreMaterialsFromState(state) {
    appMaterials = JSON.parse(JSON.stringify(coreDB));
    appMaterialOrigins = coreDB.map(material => material.name);

    if (Array.isArray(state.overrides)) {
        state.overrides.forEach(entry => {
            const index = appMaterialOrigins.indexOf(entry?.baseName);
            if (index >= 0 && isValidMaterial(entry.material)) appMaterials[index] = entry.material;
        });
    }
    if (Array.isArray(state.deletedBaseNames)) {
        const removedNames = new Set(state.deletedBaseNames);
        for (let index = appMaterialOrigins.length - 1; index >= 0; index--) {
            if (removedNames.has(appMaterialOrigins[index])) {
                appMaterials.splice(index, 1);
                appMaterialOrigins.splice(index, 1);
            }
        }
    }
    // An exported data.js already contains custom materials. Importing it while
    // older localStorage is present must not append duplicate copies.
    const existingNames = new Set(appMaterials.map(m => canonicalMaterialKey(m.name)));
    const custom = Array.isArray(state.custom) ? state.custom.filter(isValidMaterial) : [];
    custom.forEach(material => {
        const name = canonicalMaterialKey(material.name);
        if (existingNames.has(name)) return;
        existingNames.add(name);
        appMaterials.push(material);
        appMaterialOrigins.push(null);
    });
    // Preserve material positions across backup restore, renames and deletions.
    // Report references are normalized by name/signature after loading.
    if (Array.isArray(state.materialOrder)) {
        const order = new Map(state.materialOrder.map((name, index) => [name, index]));
        const paired = appMaterials.map((material, index) => ({
            material, origin: appMaterialOrigins[index], oldIndex: index
        }));
        paired.sort((a, b) => {
            const aOrder = order.has(a.material.name) ? order.get(a.material.name) : Infinity;
            const bOrder = order.has(b.material.name) ? order.get(b.material.name) : Infinity;
            return aOrder - bOrder || a.oldIndex - b.oldIndex;
        });
        appMaterials = paired.map(item => item.material);
        appMaterialOrigins = paired.map(item => item.origin);
    }
}

let isDevMode = false;
let chartInstance = null;
let editingMatIndex = -1;
let editingGradeIndex = -1;
let favoriteMaterials = [];
let reportMaterials = [];
let reportTemperatures = [20, 50, 100, 150];

// Equipment report sub-tab state
let activeReportSubTab = 'gaskets';
let reportMaterialsEquip = [];
let equipmentActiveProperties = ['RTm', 'RTp'];
let equipmentStressColumns = [
    { mode: 'gv', temp: 20 },
    { mode: 'nue', temp: 20 },
    { mode: 'pnue', temp: 20 }
];
let reportEquipSeismicVal = '1';

const el = {
    search: typeof document !== 'undefined' ? document.getElementById('searchInput') : null,
    mat: typeof document !== 'undefined' ? document.getElementById('materialSelect') : null,
    kp: typeof document !== 'undefined' ? document.getElementById('kpSelect') : null,
    title: typeof document !== 'undefined' ? document.getElementById('mTitle') : null,
    subtitle: typeof document !== 'undefined' ? document.getElementById('mSubtitle') : null,
    tHead: typeof document !== 'undefined' ? document.getElementById('tableHeader') : null,
    tBody: typeof document !== 'undefined' ? document.getElementById('tableBody') : null
};

// --- ВАЖЛИВО: Нова функція для точного округлення за правилом Excel (ROUND half away from zero) ---
function roundExcel(num, places = 2) {
    if (num === null || num === undefined) return "—";
    if (typeof num === "string") {
        let str = num.trim().replace(",", ".");
        if (str === "" || str === "—" || str === "-") return "—";
        num = Number(str);
    }
    if (typeof num !== "number" || !Number.isFinite(num)) return "—";

    const sign = num < 0 ? -1 : 1;
    const abs = Math.abs(num);

    // Exponential notation shifting avoids floating-point multiplication artifacts and handles scientific notation
    let parts = abs.toString().split('e');
    let exp = parts[1] ? (+parts[1] + places) : places;
    let shifted = Number(parts[0] + 'e' + (exp >= 0 ? '+' : '') + exp);
    let rounded = Math.round(shifted);

    parts = rounded.toString().split('e');
    exp = parts[1] ? (+parts[1] - places) : -places;
    let result = sign * Number(parts[0] + 'e' + (exp >= 0 ? '+' : '') + exp);

    if (Math.abs(result) === 0) result = 0;
    return places > 0 ? result.toFixed(places) : String(result);
}

// Допоміжна функція для форматування окремих характеристик з 2 знаками після коми
function formatPropertyValue(key, value) {
    if (value === "—" || value === "" || value === undefined || value === null) return "—";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (key === "Ro" || key === "Alpha" || key === "Mu") {
        return roundExcel(num, 2);
    }
    return value;
}

// У зведеному звіті всі числові характеристики відображаємо з двома
// десятковими знаками. Форматування не змінює вихідні дані або розрахунки.
function formatReportPropertyValue(value) {
    if (value === null || value === undefined || value === '' || value === '—') return '—';
    const number = typeof value === 'number' ? value : Number(String(value).trim().replace(',', '.'));
    return Number.isFinite(number)
        ? roundExcel(number, 2).replace('.', ',')
        : escapeHTML(String(value));
}

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// --- Валідація коефіцієнтів розрахунку (ПНАЕ Г-7-002-86) ---
const PNAE_DEFAULT_COEFFICIENTS = {
    calcNm: 2.6,
    calcNt: 1.5,
    calcNtBolt: 2.0,
    calcGc: 1.0,
    calcGm: 1.05,
    calcGnNue: 1.25,
    calcGnPz: 1.05
};

const COEFFICIENT_NAMES = {
    calcNm: 'nm (тимчасовий опір)',
    calcNt: 'nt (межа текучості)',
    calcNtBolt: 'ntBolt (кріплення)',
    calcGc: 'γc (умови роботи)',
    calcGm: 'γm (надійність матеріалу)',
    calcGnNue: 'γn(НУЕ) (призначення НУЕ)',
    calcGnPz: 'γn(ПЗ) (призначення ПЗ)'
};

function parseCoefficient(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') {
        return (Number.isFinite(value) && value > 0) ? value : null;
    }
    if (typeof value !== 'string') return null;
    const trimmed = value.trim().replace(',', '.');
    if (trimmed === '') return null;
    if (!/^[+]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
}

function validateCoefficients(customValues) {
    const keys = ['calcNm', 'calcNt', 'calcNtBolt', 'calcGc', 'calcGm', 'calcGnNue', 'calcGnPz'];
    const result = {
        valid: true,
        errors: [],
        values: {},
        raw: {}
    };

    keys.forEach(key => {
        let rawVal;
        let inputEl = null;
        if (customValues && typeof customValues === 'object' && key in customValues) {
            rawVal = customValues[key];
        } else if (typeof document !== 'undefined') {
            inputEl = document.getElementById(key);
            rawVal = inputEl ? inputEl.value : null;
        }

        result.raw[key] = rawVal;
        const parsed = parseCoefficient(rawVal);
        const errPlaceholder = inputEl ? inputEl.parentElement?.querySelector('.coef-error') : null;

        if (parsed === null) {
            result.valid = false;
            const msg = `${COEFFICIENT_NAMES[key] || key} має бути додатним числом (> 0)`;
            result.errors.push(msg);

            if (inputEl) {
                inputEl.classList.add('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/20');
                inputEl.classList.remove('border-slate-200', 'dark:border-slate-700', 'focus:border-brand-500');
            }
            if (errPlaceholder) {
                errPlaceholder.textContent = 'Має бути > 0';
                errPlaceholder.classList.remove('hidden');
            }
        } else {
            result.values[key] = parsed;
            if (inputEl) {
                inputEl.classList.remove('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/20');
                inputEl.classList.add('border-slate-200', 'dark:border-slate-700', 'focus:border-brand-500');
            }
            if (errPlaceholder) {
                errPlaceholder.classList.add('hidden');
                errPlaceholder.textContent = '';
            }
        }
    });

    return result;
}

let sourceDataChangedSinceSave = false;
let sourceDataBaselineHash = null;
function getCurrentCoefficientValues() {
    const values = {};
    if (typeof document === 'undefined') return { ...PNAE_DEFAULT_COEFFICIENTS };
    Object.keys(PNAE_DEFAULT_COEFFICIENTS).forEach(key => {
        const field = document.getElementById(key);
        values[key] = field ? field.value : String(PNAE_DEFAULT_COEFFICIENTS[key]);
    });
    return values;
}
function restoreCoefficientValues(values) {
    if (!values || typeof values !== 'object' || typeof document === 'undefined') return;
    for (const key of Object.keys(PNAE_DEFAULT_COEFFICIENTS)) {
        const parsed = parseCoefficient(values[key]);
        if (parsed !== null) {
            const field = document.getElementById(key);
            if (field) field.value = String(values[key]);
        }
    }
}

function resetCoefficientsToDefaults() {
    Object.entries(PNAE_DEFAULT_COEFFICIENTS).forEach(([key, defaultVal]) => {
        const input = document.getElementById(key);
        if (input) {
            input.value = String(defaultVal);
            input.classList.remove('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-500/20');
            input.classList.add('border-slate-200', 'dark:border-slate-700', 'focus:border-brand-500');
            const errPlaceholder = input.parentElement?.querySelector('.coef-error');
            if (errPlaceholder) {
                errPlaceholder.classList.add('hidden');
                errPlaceholder.textContent = '';
            }
        }
    });
    saveToLocalStorage();
    updateCalculator();
    renderReportStressTable();
    renderReportStressTableEquip();
    showToast("Коефіцієнти скинуто до нормативних значень (ПНАЕ Г-7-002-86)", "success");
}

// Explicit classification for the entire material brand (all its КП).
// Missing Rp0,2 values alone are NOT reliable evidence of brittleness.
function isBrittleMaterial(material) {
    return material?.isBrittle === true;
}

// Єдині правила застосовності базових напружень. Прапорець isBrittle
// має пріоритет над випадково заповненим R^T_p0,2.
function getPlasticBaseStress(material, rtm, rtp, nm, nt) {
    if (isBrittleMaterial(material)) return null;
    const m = Number(rtm), p = Number(rtp);
    if (![m, p, nm, nt].every(v => Number.isFinite(v) && v > 0)) return null;
    return Math.min(m / nm, p / nt);
}

function getBoltBaseStress(material, rtp, ntBolt) {
    if (isBrittleMaterial(material)) return null;
    const p = Number(rtp);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(ntBolt) || ntBolt <= 0) return null;
    return p / ntBolt;
}

// ПНАЕ Г-7-002-86, таблиця 5.17. Для II категорії МРЗ у цій таблиці
// не наведено; не можна обчислювати його як для I категорії.
function getSeismicShearFactor(seismicCategory, mode, isBolt = false) {
    const prefix = isBolt ? 'bolt_' : '';
    if (mode === 'pz') {
        if (String(seismicCategory) === '1') return PNAE_COEFS[prefix + 'ts_pz'];
        if (String(seismicCategory) === '2') return PNAE_COEFS[prefix + 'ts_pz_cat2'];
    }
    if (mode === 'mrz' && String(seismicCategory) === '1') {
        return PNAE_COEFS[prefix + 'ts_mrz'];
    }
    return null;
}

function brittleFlangeStress(rtm, isGv) {
    if (rtm === '—' || rtm === null || rtm === undefined || rtm === '') return null;
    const strength = Number(rtm);
    if (!Number.isFinite(strength) || strength <= 0) return null;
    return strength / (isGv ? PNAE_COEFS.brittle_flange_gv : PNAE_COEFS.brittle_flange_nue);
}

function brittleFlangeFormula(isGv) {
    const coefficient = isGv ? PNAE_COEFS.brittle_flange_gv : PNAE_COEFS.brittle_flange_nue;
    return `R<sup>T</sup><sub>m</sub> / ${String(coefficient).replace('.', ',')}`;
}

function getGradeSignature(grade) {
    if (!grade) return '';
    const kp = (grade.kp || '').trim();
    const desc = (grade.description || '').trim();
    return `${kp}||${desc}`;
}

// --- Нова функція Debounce для оптимізації пошуку ---
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function showToast(message, type = 'success') {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    
    let icon = '';
    let borderColor = '';
    
    if (type === 'success') {
        icon = `<svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
        borderColor = 'border-emerald-500';
    } else if (type === 'warning') {
        icon = `<svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path><circle cx="12" cy="16" r="1" fill="currentColor"></circle></svg>`;
        borderColor = 'border-amber-500';
    } else {
        icon = `<svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
        borderColor = 'border-rose-500';
    }
        
    toast.className = `transform transition-all duration-300 translate-y-full opacity-0 bg-white dark:bg-slate-800 border-l-4 ${borderColor} shadow-xl rounded-xl p-4 flex items-center gap-3 min-w-[280px] max-w-md pointer-events-auto`;
    toast.innerHTML = `${icon}<span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${escapeHTML(message)}</span>`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    });
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 4000); // Збільшено до 4 секунд для довгих повідомлень помилок
}

function toggleEmptyState(isEmpty) {
    const emptyState = document.getElementById('empty-state');
    const appContent = document.getElementById('app-content');
    if (isEmpty) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        appContent.classList.add('hidden');
        appContent.classList.remove('flex');
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        appContent.classList.remove('hidden');
        appContent.classList.add('flex');
    }
}

function initTheme() {
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        updateChartTheme();
    });
}

// Скасувати / Повторити: історія змін стану в поточному сеансі.
// Зберігаємо компактний pnae_state_v2 (тільки зміни відносно data.js), не 1.4 МБ бази на кожен крок.
const undoSnapshots = [];
const redoSnapshots = [];
const activityLog = [];
const HISTORY_LIMIT = 25;
let historyReady = false;
let historySuspended = false;
// Історія змін: зрозумілі записи з конкретними значеннями «до → після».
// Використовується лише стан pnae_state_v2; вміст data.js не копіюється до журналу.
const HISTORY_DIFF_LIMIT = 80;
const HISTORY_DETAILS_PREVIEW = 2;
const HISTORY_REPORT_MODE_NAMES = {
    gv: 'ГВ', nue: 'НУЕ', pnue: 'ПНУЕ', as: 'АС', pz: 'ПЗ', mrz: 'МРЗ'
};
function historyEquals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function historyText(value) {
    if (value === undefined || value === null || value === '') return 'не задано';
    if (typeof value === 'boolean') return value ? 'так' : 'ні';
    if (typeof value === 'number' && Number.isFinite(value)) return String(value).replace('.', ',');
    if (typeof value === 'string' && /^[+-]?\d+\.\d+$/.test(value.trim())) return value.trim().replace('.', ',');
    return String(value).slice(0, 250);
}
function historyPair(before, after, suffix = '') {
    return `${historyText(before)}${suffix} → ${historyText(after)}${suffix}`;
}
function historyList(value) {
    return Array.isArray(value) ? value : [];
}
function historySet(values) {
    return new Set(historyList(values));
}
function historyReportItemKey(item) {
    return [item?.matName ?? '', item?.kpSig ?? `${item?.kp ?? ''}||${item?.description ?? ''}`].join('|');
}
function historyReportItemLabel(item) {
    if (!item) return 'невідомий матеріал';
    const grade = item.kp ? `, КП ${item.kp}` : '';
    return `${item.matName || 'Без назви'}${grade}`;
}
function historyCompareReportLists(beforeList, afterList, name, add) {
    const oldList = historyList(beforeList);
    const newList = historyList(afterList);
    if (historyEquals(oldList, newList)) return;
    const oldIndex = new Map(oldList.map(item => [historyReportItemKey(item), item]));
    const newIndex = new Map(newList.map(item => [historyReportItemKey(item), item]));
    const oldKeys = oldList.map(historyReportItemKey);
    const newKeys = newList.map(historyReportItemKey);
    for (const [key, item] of newIndex) {
        if (!oldIndex.has(key)) add(name, `додано «${historyReportItemLabel(item)}»`);
    }
    for (const [key, item] of oldIndex) {
        if (!newIndex.has(key)) add(name, `видалено «${historyReportItemLabel(item)}»`);
    }
    for (const [key, item] of newIndex) {
        const old = oldIndex.get(key);
        if (!old || historyEquals(old.elements, item.elements)) continue;
        const before = historyList(old.elements).join(', ') || 'немає';
        const after = historyList(item.elements).join(', ') || 'немає';
        add(name, `елементи для «${historyReportItemLabel(item)}»: ${before} → ${after}`);
    }
    if (oldKeys.length === newKeys.length &&
        oldKeys.every(key => newIndex.has(key)) &&
        !historyEquals(oldKeys, newKeys)) {
        const names = list => list.map(item => historyReportItemLabel(item));
        const short = items => items.slice(0, 12).join(' → ') + (items.length > 12 ? ` … (усього ${items.length})` : '');
        add(name, `змінено порядок: ${short(names(oldList))}  ⟹  ${short(names(newList))}`);
    }
}
function historyCompareTemperatures(beforeList, afterList, add) {
    const oldT = historyList(beforeList);
    const newT = historyList(afterList);
    if (historyEquals(oldT, newT)) return;
    if (newT.length === oldT.length) {
        for (let i = 0; i < newT.length; i++) {
            if (historyEquals(oldT[i], newT[i])) continue;
            const mode = i === 0 ? 'ГВ' : 'НУЕ';
            add('Температури звіту', `стовпець №${i + 1} (${mode}): ${historyPair(oldT[i], newT[i], ' °C')}`);
        }
    } else {
        const common = Math.min(oldT.length, newT.length);
        let offset = 0;
        while (offset < common && historyEquals(oldT[offset], newT[offset])) offset++;
        if (newT.length === oldT.length + 1 && historyEquals([...newT.slice(0, offset), ...newT.slice(offset + 1)], oldT)) {
            add('Температури звіту', `додано стовпець №${offset + 1}: ${historyText(newT[offset])} °C`);
        } else if (oldT.length === newT.length + 1 && historyEquals([...oldT.slice(0, offset), ...oldT.slice(offset + 1)], newT)) {
            add('Температури звіту', `видалено стовпець №${offset + 1}: ${historyText(oldT[offset])} °C`);
        } else {
            add('Температури звіту', `набір температур: ${oldT.join(', ')} °C → ${newT.join(', ')} °C`);
        }
    }
}
function historyStressColumnLabel(column) {
    return `${HISTORY_REPORT_MODE_NAMES[column?.mode] || historyText(column?.mode)} / ${historyText(column?.temp)} °C`;
}
function historyCompareStressColumns(beforeList, afterList, add) {
    const oldList = historyList(beforeList);
    const newList = historyList(afterList);
    if (historyEquals(oldList, newList)) return;
    const oldLabels = oldList.map(historyStressColumnLabel);
    const newLabels = newList.map(historyStressColumnLabel);
    if (oldList.length === newList.length &&
        [...oldLabels].sort().join('|') === [...newLabels].sort().join('|') &&
        !historyEquals(oldLabels, newLabels)) {
        add('Стовпці напружень', `змінено порядок: ${oldLabels.join(' → ')}  ⟹  ${newLabels.join(' → ')}`);
        return;
    }
    if (newList.length === oldList.length + 1 || oldList.length === newList.length + 1) {
        const adding = newList.length > oldList.length;
        const longer = adding ? newList : oldList;
        const shorter = adding ? oldList : newList;
        let idx = 0;
        while (idx < shorter.length && historyEquals(longer[idx], shorter[idx])) idx++;
        if (historyEquals([...longer.slice(0, idx), ...longer.slice(idx + 1)], shorter)) {
            add('Стовпці напружень', `${adding ? 'додано' : 'видалено'} №${idx + 1}: ${historyStressColumnLabel(longer[idx])}`);
            return;
        }
    }
    if (oldList.length === newList.length) {
        for (let i = 0; i < oldList.length; i++) {
            const before = oldList[i];
            const after = newList[i];
            if (before?.mode !== after?.mode) {
                add('Стовпці напружень', `№${i + 1}, режим: ${historyText(HISTORY_REPORT_MODE_NAMES[before?.mode] || before?.mode)} → ${historyText(HISTORY_REPORT_MODE_NAMES[after?.mode] || after?.mode)}`);
            }
            if (before?.temp !== after?.temp) {
                add('Стовпці напружень', `№${i + 1}, температура: ${historyPair(before?.temp, after?.temp, ' °C')}`);
            }
        }
    } else {
        add('Стовпці напружень', `${oldList.length} → ${newList.length} шт.; новий склад: ${newLabels.join(', ')}`);
    }
}
function historyCompareMaterials(before, after, add) {
    const oldOverrides = new Map(historyList(before.overrides).map(row => [row.baseName, row.material]));
    const newOverrides = new Map(historyList(after.overrides).map(row => [row.baseName, row.material]));
    const oldDeleted = historySet(before.deletedBaseNames);
    const newDeleted = historySet(after.deletedBaseNames);
    const base = new Map(coreDB.map(row => [row.name, row]));
    const changedBaseNames = new Set([...oldOverrides.keys(), ...newOverrides.keys(), ...oldDeleted, ...newDeleted]);
    for (const name of changedBaseNames) {
        const oldMat = oldDeleted.has(name) ? null : (oldOverrides.get(name) || base.get(name));
        const newMat = newDeleted.has(name) ? null : (newOverrides.get(name) || base.get(name));
        historyCompareMaterial(oldMat, newMat, name, add);
    }
    const oldCustom = new Map(historyList(before.custom).map(row => [row.name, row]));
    const newCustom = new Map(historyList(after.custom).map(row => [row.name, row]));
    for (const name of new Set([...oldCustom.keys(), ...newCustom.keys()])) {
        historyCompareMaterial(oldCustom.get(name), newCustom.get(name), name, add);
    }
    if (!historyEquals(before.materialOrder, after.materialOrder)) {
        const oldOrder = historyList(before.materialOrder);
        const newOrder = historyList(after.materialOrder);
        if (oldOrder.length === newOrder.length && oldOrder.every(name => newOrder.includes(name))) {
            add('Довідник матеріалів', 'змінено порядок матеріалів у довіднику');
        }
    }
}
function historyCompareMaterial(oldMat, newMat, name, add) {
    if (!oldMat && !newMat) return;
    if (!oldMat) { add('Довідник матеріалів', `додано матеріал «${name}»`); return; }
    if (!newMat) { add('Довідник матеріалів', `видалено матеріал «${name}»`); return; }
    if (historyEquals(oldMat, newMat)) return;
    if (oldMat.name !== newMat.name) {
        add('Довідник матеріалів', `перейменовано: «${oldMat.name}» → «${newMat.name}»`);
    }
    if (!!oldMat.isBrittle !== !!newMat.isBrittle) {
        add('Довідник матеріалів', `«${name}», крихкий матеріал: ${historyPair(!!oldMat.isBrittle, !!newMat.isBrittle)}`);
    }
    const oldGrades = historyList(oldMat.grades);
    const newGrades = historyList(newMat.grades);
    const gradeKey = grade => `${grade?.kp || ''}||${grade?.description || ''}`;
    const oldKeys = oldGrades.map(gradeKey);
    const newKeys = newGrades.map(gradeKey);
    const label = grade => grade?.kp ? `КП ${grade.kp}` : 'Без КП';
    const describeGrade = grade => `${label(grade)}${grade?.description ? ` (${String(grade.description).slice(0, 100)})` : ''}`;
    const oldIndex = new Map(oldGrades.map(g => [gradeKey(g), g]));
    const newIndex = new Map(newGrades.map(g => [gradeKey(g), g]));
    if (!historyEquals(oldKeys, newKeys) && oldKeys.length === newKeys.length &&
        [...oldKeys].sort().join('|') === [...newKeys].sort().join('|')) {
        add('Довідник матеріалів', `«${name}», змінено порядок КП/сортаментів`);
    }
    for (const [key, grade] of newIndex) {
        if (!oldIndex.has(key)) {
            const sameIndex = newGrades.indexOf(grade);
            if (oldGrades[sameIndex]?.kp === grade.kp && oldGrades.length === newGrades.length &&
                !newIndex.has(gradeKey(oldGrades[sameIndex]))) {
                add('Довідник матеріалів', `«${name}», ${label(grade)}, опис: «${historyText(oldGrades[sameIndex].description)}» → «${historyText(grade.description)}»`);
            } else {
                add('Довідник матеріалів', `«${name}», додано сортамент ${describeGrade(grade)}`);
            }
        }
    }
    for (const [key, grade] of oldIndex) {
        if (!newIndex.has(key)) {
            const sameIndex = oldGrades.indexOf(grade);
            if (newGrades[sameIndex]?.kp === grade.kp && oldGrades.length === newGrades.length &&
                !oldIndex.has(gradeKey(newGrades[sameIndex]))) continue;
            add('Довідник матеріалів', `«${name}», видалено сортамент ${describeGrade(grade)}`);
        }
    }
    // Значення порівнюємо за КП + описом, а не індексом, щоб перестановка
    // сортаментів не створювала сотень хибних повідомлень про змінені числа.
    for (const [key, b] of newIndex) {
        const idx = newGrades.indexOf(b);
        const candidate = oldGrades[idx];
        const a = oldIndex.get(key) || (candidate?.kp === b.kp && !newIndex.has(gradeKey(candidate)) ? candidate : null);
        if (!a) continue;
        const title = `«${name}», ${label(b)}`;
        const props = new Set([...Object.keys(a.data || {}), ...Object.keys(b.data || {})]);
        for (const prop of props) {
            const aValues = a.data?.[prop] || {};
            const bValues = b.data?.[prop] || {};
            const temps = new Set([...Object.keys(aValues), ...Object.keys(bValues)]);
            for (const temp of temps) {
                if (!historyEquals(aValues[temp], bValues[temp])) {
                    add('Довідник матеріалів', `${title}, ${prop} при ${temp} °C: ${historyPair(aValues[temp], bValues[temp])}`);
                }
            }
        }
    }
}

function describeStateChange(beforeJSON, afterJSON) {
    try {
        const before = JSON.parse(beforeJSON || '{}');
        const after = JSON.parse(afterJSON || '{}');
        const changes = [];
        let remaining = 0;
        function add(section, text) {
            if (changes.length < HISTORY_DIFF_LIMIT) changes.push({section, text});
            else remaining++;
        }
        const oldCoeffs = before.coefficients || {};
        const newCoeffs = after.coefficients || {};
        for (const key of new Set([...Object.keys(oldCoeffs), ...Object.keys(newCoeffs)])) {
            if (!historyEquals(oldCoeffs[key], newCoeffs[key])) {
                add('Коефіцієнти', `${COEFFICIENT_NAMES[key] || key}: ${historyPair(oldCoeffs[key], newCoeffs[key])}`);
            }
        }
        historyCompareMaterials(before, after, add);
        historyCompareReportLists(before.reportMaterials, after.reportMaterials, 'Список прокладок', add);
        historyCompareReportLists(before.reportMaterialsEquip, after.reportMaterialsEquip, 'Список обладнання', add);
        historyCompareTemperatures(before.reportTemperatures, after.reportTemperatures, add);
        historyCompareStressColumns(before.equipmentStressColumns, after.equipmentStressColumns, add);
        const oldProps = historyList(before.equipmentActiveProperties);
        const newProps = historyList(after.equipmentActiveProperties);
        if (!historyEquals(oldProps, newProps)) {
            const labels = items => items.map(key => propertiesList.find(p => p.key === key)?.name || key).join(', ') || 'немає';
            const added = newProps.filter(key => !oldProps.includes(key));
            const removed = oldProps.filter(key => !newProps.includes(key));
            if (added.length) add('Властивості обладнання', `увімкнено: ${labels(added)}`);
            if (removed.length) add('Властивості обладнання', `вимкнено: ${labels(removed)}`);
            if (!added.length && !removed.length) add('Властивості обладнання', `порядок: ${labels(oldProps)} → ${labels(newProps)}`);
        }
        if (!historyEquals(before.reportEquipSeismicVal, after.reportEquipSeismicVal)) {
            add('Сейсмостійкість', `категорія: ${historyPair(before.reportEquipSeismicVal, after.reportEquipSeismicVal)}`);
        }
        if (!historyEquals(before.activeReportSubTab, after.activeReportSubTab)) {
            const label = value => ({gaskets: 'Для прокладок', equipment: 'Для обладнання'}[value] || historyText(value));
            add('Вкладка звіту', `${label(before.activeReportSubTab)} → ${label(after.activeReportSubTab)}`);
        }
        const oldFavorites = historySet(before.favoriteMaterials), newFavorites = historySet(after.favoriteMaterials);
        for (const name of newFavorites) if (!oldFavorites.has(name)) add('Вибране', `додано «${name}»`);
        for (const name of oldFavorites) if (!newFavorites.has(name)) add('Вибране', `прибрано «${name}»`);
        if (!historyEquals(before.lastExportSnapshot, after.lastExportSnapshot)) {
            add('Збереження бази', 'оновлено позначку експорту data.js');
        }
        if (before.sourceDataHash !== after.sourceDataHash && before.sourceDataHash !== undefined) {
            add('База матеріалів', 'оновлено контрольну суму data.js');
        }
        if (!changes.length) {
            const known = new Set(['coefficients','overrides','custom','deletedBaseNames','materialOrder',
                'reportMaterials','reportMaterialsEquip','reportTemperatures','equipmentStressColumns',
                'equipmentActiveProperties','reportEquipSeismicVal','activeReportSubTab','favoriteMaterials',
                'lastExportSnapshot','sourceDataHash']);
            const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
                .filter(key => !known.has(key) && !historyEquals(before[key], after[key]));
            add('Інші зміни', keys.length ? `оновлено поля: ${keys.join(', ')}` : 'оновлено технічні дані');
        }
        const first = changes[0];
        const count = changes.length + remaining;
        const changeWord = count % 10 === 1 && count % 100 !== 11 ? 'зміна'
            : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'зміни' : 'змін');
        const summary = changes.length === 1 && !remaining
            ? `${first.section}: ${first.text}`
            : `${count} ${changeWord} — ${[...new Set(changes.map(c => c.section))].slice(0, 3).join(', ')}${remaining ? '…' : ''}`;
        return {
            summary,
            details: changes.map(row => `${row.section}: ${row.text}`)
                .concat(remaining ? [`… і ще ${remaining} змін`] : []),
            count: changes.length + remaining
        };
    } catch (error) {
        console.error('Не вдалося описати зміну історії', error);
        return {summary: 'Зміна збережених даних (не вдалося визначити деталі)', details: [], count: 0};
    }
}
function recordChange(beforeJSON, afterJSON) {
    if (!historyReady || historySuspended || !beforeJSON || beforeJSON === afterJSON) return;
    undoSnapshots.push(beforeJSON);
    if (undoSnapshots.length > HISTORY_LIMIT) undoSnapshots.shift();
    redoSnapshots.length = 0;
    const details = describeStateChange(beforeJSON, afterJSON);
    activityLog.unshift({ ...details, date: new Date().toLocaleString('uk-UA') });
    if (activityLog.length > 35) activityLog.length = 35;
    refreshHistoryButtons();
}

function refreshHistoryButtons() {
    const undo = document.getElementById('btnUndo');
    const redo = document.getElementById('btnRedo');
    if (undo) undo.disabled = undoSnapshots.length === 0;
    if (redo) redo.disabled = redoSnapshots.length === 0;
}
function refreshAllAfterStateRestore() {
    const selectedName = el.mat && appMaterials[Number(el.mat.value)]?.name;
    if (el.search) el.search.value = '';
    updateMaterialList('');
    const selected = appMaterials.findIndex(m => m.name === selectedName);
    if (selected >= 0) { el.mat.value = String(selected); updateKpList(); }
    const cb = document.querySelectorAll('.equip-prop-cb');
    cb.forEach(input => { input.checked = equipmentActiveProperties.includes(input.value); });
    const seismic = document.getElementById('reportEquipSeismic');
    if (seismic) seismic.value = reportEquipSeismicVal;
    updateAllViews();
    renderReportList();
    renderReportTable();
    renderReportStressTable();
    renderReportTableEquip();
    renderReportStressTableEquip();
    switchReportSubTab(activeReportSubTab);
    updateDataSaveStatus();
    scheduleFrozenColumns();
}
function restoreHistorySnapshot(snapshot) {
    const previous = localStorage.getItem('pnae_state_v2');
    const previousCoefficients = getCurrentCoefficientValues();
    historySuspended = true;
    try {
        // Повертаємо всі 7 коефіцієнтів до стандарту перед відновленням старого стану.
        restoreCoefficientValues(PNAE_DEFAULT_COEFFICIENTS);
        localStorage.setItem('pnae_state_v2', snapshot);
        loadFromLocalStorage();
        refreshAllAfterStateRestore();
        return true;
    } catch (error) {
        console.error('Помилка відновлення історії', error);
        if (previous !== null) localStorage.setItem('pnae_state_v2', previous);
        else localStorage.removeItem('pnae_state_v2');
        restoreCoefficientValues(previousCoefficients);
        loadFromLocalStorage();
        showToast('Не вдалося відновити попередній стан', 'error');
        return false;
    } finally { historySuspended = false; refreshHistoryButtons(); }
}
function performHistoryStep(direction) {
    const source = direction === 'undo' ? undoSnapshots : redoSnapshots;
    const target = direction === 'undo' ? redoSnapshots : undoSnapshots;
    if (!source.length) return;
    const current = localStorage.getItem('pnae_state_v2');
    const next = source.pop();
    if (restoreHistorySnapshot(next)) {
        if (current) target.push(current);
        const description = describeStateChange(current, next);
        activityLog.unshift({
            ...description,
            summary: `${direction === 'undo' ? 'Скасовано' : 'Повторено'}: ${description.summary}`,
            date: new Date().toLocaleString('uk-UA'),
            kind: direction
        });
        if (activityLog.length > 35) activityLog.length = 35;
        showToast(direction === 'undo' ? 'Останню зміну скасовано' : 'Зміну повторено', 'success');
    } else source.push(next);
    refreshHistoryButtons();
}
// Журнал не вставляє користувацькі назви як HTML: усі значення через textContent.
function renderDetailedHistory(container) {
    if (!container) return;
    container.replaceChildren();
    if (!activityLog.length) {
        const empty = document.createElement('p');
        empty.className = 'sb-history-empty';
        empty.textContent = 'У цьому сеансі змін поки не було.';
        container.append(empty);
        return;
    }
    const header = document.createElement('div');
    header.className = 'sb-history-count';
    header.textContent = `Записів у цьому сеансі: ${activityLog.length}. Новіші зверху.`;
    container.append(header);
    for (const entry of activityLog) {
        const item = document.createElement('article');
        item.className = 'sb-history-entry';
        const heading = document.createElement('div');
        heading.className = 'sb-history-entry-head';
        const time = document.createElement('time');
        time.className = 'sb-history-time';
        time.textContent = entry.date;
        const title = document.createElement('span');
        title.className = 'sb-history-summary';
        title.textContent = entry.summary || entry.action || 'Зміна даних';
        heading.append(time, title);
        item.append(heading);
        const details = Array.isArray(entry.details) ? entry.details : [];
        const detailWord = details.length % 10 === 1 && details.length % 100 !== 11 ? 'деталь'
            : (details.length % 10 >= 2 && details.length % 10 <= 4 && (details.length % 100 < 12 || details.length % 100 > 14) ? 'деталі' : 'деталей');
        if (details.length > 1 || (details.length === 1 && title.textContent !== details[0])) {
            const expander = document.createElement('details');
            expander.className = 'sb-history-details';
            // Короткі зміни показуємо одразу; великий імпорт можна розгорнути.
            expander.open = details.length <= HISTORY_DETAILS_PREVIEW;
            const summary = document.createElement('summary');
            const refreshSummary = () => {
                summary.textContent = `${details.length} ${detailWord} — ${expander.open ? 'згорнути' : 'переглянути'}`;
            };
            refreshSummary();
            expander.addEventListener('toggle', refreshSummary);
            const list = document.createElement('ul');
            for (const detail of details) {
                const li = document.createElement('li');
                li.textContent = detail;
                list.append(li);
            }
            expander.append(summary, list);
            item.append(expander);
        }
        container.append(item);
    }
}
function initHistoryUI() {
    document.getElementById('btnUndo')?.addEventListener('click', () => performHistoryStep('undo'));
    document.getElementById('btnRedo')?.addEventListener('click', () => performHistoryStep('redo'));
    const modal = document.getElementById('historyModal');
    const close = () => { modal.hidden = true; };
    document.getElementById('btnShowHistory')?.addEventListener('click', () => {
        const log = document.getElementById('historyList');
        renderDetailedHistory(log);
        modal.hidden = false;
    });
    document.getElementById('btnCloseHistory')?.addEventListener('click', close);
    document.getElementById('btnCloseHistoryBottom')?.addEventListener('click', close);
    modal?.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => {
        if (!event.ctrlKey && !event.metaKey) return;
        if (event.altKey) return;
        const el = event.target;
        if (el?.isContentEditable || el?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
        if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
            if (undoSnapshots.length) { event.preventDefault(); performHistoryStep('undo'); }
        } else if (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
            if (redoSnapshots.length) { event.preventDefault(); performHistoryStep('redo'); }
        }
    });
    historyReady = true;
    refreshHistoryButtons();
}

function saveToLocalStorage() {
    try {
        // Ensure all report items have complete grade identity signatures before saving
        [reportMaterials, reportMaterialsEquip].forEach(list => {
            if (Array.isArray(list)) {
                list.forEach(item => {
                    const mat = appMaterials[item.matIndex];
                    const grade = mat?.grades?.[item.kpIndex];
                    if (grade) {
                        item.matName = mat.name;
                        item.kp = grade.kp || '';
                        item.description = grade.description || '';
                        item.kpSig = getGradeSignature(grade);
                    }
                });
            }
        });

        // One write keeps materials and report references in the same saved state.
        const materialChanges = getSavedMaterialChanges();
        const oldState = localStorage.getItem('pnae_state_v2');
        const newState = JSON.stringify({
            ...materialChanges, favoriteMaterials,
            reportMaterials, reportMaterialsEquip, reportTemperatures, activeReportSubTab,
            equipmentActiveProperties, equipmentStressColumns, reportEquipSeismicVal,
            coefficients: getCurrentCoefficientValues(), sourceDataHash: sourceDataBaselineHash || materialFingerprint(coreDB),
            lastExportSnapshot
        });
        localStorage.setItem('pnae_state_v2', newState);
        recordChange(oldState, newState);
        updateDataSaveStatus();
        return true;
    } catch (e) {
        console.error("Помилка збереження", e);
        showToast('Не вдалося зберегти дані в браузері. Звільніть місце або завантажте базу у файл.', 'error');
        updateDataSaveStatus(true);
        return false;
    }
}


// Два окремі стани: запис у браузері і встановлений data.js.
// Експорт завантажує файл, але НЕ підміняє data.js на диску автоматично.
function updateDataSaveStatus(saveError = false) {
    const node = typeof document !== 'undefined' ? document.getElementById('dataSaveStatus') : null;
    if (!node) return;
    const title = document.getElementById('dataSaveStatusLabel');
    const description = document.getElementById('dataSaveStatusInfo');
    node.classList.remove('sb-status-ok', 'sb-status-notice', 'sb-status-error');
    if (saveError) {
        node.classList.add('sb-status-error');
        title.textContent = 'Помилка збереження';
        description.textContent = 'Зробіть резервну копію JSON';
        return;
    }
    if (sourceDataChangedSinceSave) {
        node.classList.add('sb-status-notice');
        title.textContent = 'data.js змінено';
        description.textContent = 'Перевірте зміни перед наступним експортом';
        return;
    }
    const currentHash = materialFingerprint(appMaterials);
    const installedHash = materialFingerprint(coreDB);
    const exportedHash = lastExportSnapshot && lastExportSnapshot.dataHash;
    if (currentHash === installedHash) {
        node.classList.add('sb-status-ok');
        title.textContent = 'Дані збережено';
        description.textContent = 'data.js відповідає базі';
    } else if (exportedHash === currentHash) {
        node.classList.add('sb-status-notice');
        title.textContent = 'Збережено в браузері';
        description.textContent = 'Експортований data.js треба встановити';
    } else {
        node.classList.add('sb-status-notice');
        title.textContent = 'Збережено в браузері';
        description.textContent = 'Є зміни, не перенесені в data.js';
    }
}

let quickSearchMatches = [];
let quickSearchActive = 0;
function initQuickSearch() {
    const overlay = document.getElementById('quickSearchOverlay');
    const input = document.getElementById('quickSearchInput');
    const results = document.getElementById('quickSearchResults');
    if (!overlay || !input || !results) return;
    const close = () => { overlay.hidden = true; input.value = ''; };
    const choose = (index) => {
        const entry = quickSearchMatches[index];
        if (!entry) return;
        close();
        // Reset the sidebar filter so the selected material always exists in the list.
        if (el.search) { el.search.value = ''; }
        updateMaterialList('');
        el.mat.value = String(entry.matIndex);
        updateKpList();
        el.kp.value = String(entry.gradeIndex);
        updateAllViews();
    };
    function renderMatches() {
        const q = canonicalMaterialKey(input.value);
        quickSearchMatches = [];
        for (let matIndex=0; matIndex<appMaterials.length; matIndex++) {
            const mat=appMaterials[matIndex];
            for (let gradeIndex=0; gradeIndex<mat.grades.length; gradeIndex++) {
                const grade=mat.grades[gradeIndex];
                const description=formatDescription(mat.name, grade.description);
                if (!q || canonicalMaterialKey(`${mat.name} ${grade.kp || ''} ${description}`).includes(q)) {
                    quickSearchMatches.push({matIndex,gradeIndex,name:mat.name,kp:grade.kp || '—',description});
                    if (quickSearchMatches.length>=60) break;
                }
            }
            if (quickSearchMatches.length>=60) break;
        }
        quickSearchActive = Math.min(quickSearchActive, Math.max(0, quickSearchMatches.length-1));
        results.replaceChildren();
        quickSearchMatches.forEach((entry,index)=>{
            const option=document.createElement('button');
            option.type='button';
            option.className='sb-command-result'+(index===quickSearchActive?' is-active':'');
            option.setAttribute('role','option');
            option.setAttribute('aria-selected', String(index===quickSearchActive));
            const first=document.createElement('strong');
            first.textContent=entry.name;
            const meta=document.createElement('span');
            meta.textContent=`КП ${entry.kp} · ${entry.description}`;
            option.append(first,meta);
            option.addEventListener('mouseenter',()=>{quickSearchActive=index;results.querySelectorAll('.sb-command-result').forEach((e,i)=>{e.classList.toggle('is-active',i===index);e.setAttribute('aria-selected',String(i===index));});});
            option.addEventListener('click',()=>choose(index));
            results.append(option);
        });
        if (!quickSearchMatches.length) {
            const empty=document.createElement('div');empty.className='sb-command-empty';empty.textContent='Нічого не знайдено';results.append(empty);
        }
    }
    const open = () => { overlay.hidden=false; quickSearchActive=0;input.value='';renderMatches(); input.focus(); };
    document.getElementById('btnOpenQuickSearch')?.addEventListener('click', open);
    document.addEventListener('keydown',(event)=>{
        if ((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==='k') {
            event.preventDefault(); overlay.hidden ? open() : close(); return;
        }
        if (event.key==='Escape' && !overlay.hidden) { event.preventDefault();close(); }
    });
    input.addEventListener('input',()=>{quickSearchActive=0;renderMatches();});
    input.addEventListener('keydown',event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowUp'){
            event.preventDefault();
            const delta=event.key==='ArrowDown'?1:-1;
            quickSearchActive=Math.max(0,Math.min(quickSearchMatches.length-1,quickSearchActive+delta));
            renderMatches(); results.querySelector('.is-active')?.scrollIntoView({block:'nearest'});
        } else if(event.key==='Enter') {event.preventDefault();choose(quickSearchActive);}
    });
    document.getElementById('quickSearchBackdrop').addEventListener('click',close);
}

function readSavedJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (e) {
        console.error(`Помилка читання ${key}`, e);
        return fallback;
    }
}

function isValidMaterial(material) {
    return material && (material.isBrittle === undefined || typeof material.isBrittle === 'boolean') &&
        typeof material.name === 'string' && material.name.trim() &&
        Array.isArray(material.grades) && material.grades.length > 0 &&
        material.grades.every(grade => grade && typeof grade.kp === 'string' &&
            typeof grade.description === 'string' && grade.data && typeof grade.data === 'object' &&
            !Array.isArray(grade.data) && Object.values(grade.data).every(values => values &&
                typeof values === 'object' && !Array.isArray(values) && Object.entries(values).every(([temp, value]) =>
                    Number.isFinite(Number(temp)) && (value === '—' || (typeof value === 'number' && Number.isFinite(value) && value >= 0)))));
}

// Єдина реалізація А–Я v3. Нормалізуємо лише ключі порівняння,
// НЕ редагуючи оригінальні назви матеріалів у data.js.
const reportItemCollator = new Intl.Collator('uk-UA', { numeric: true, sensitivity: 'base' });
const LATIN_CYRILLIC_TWINS = Object.freeze({
    A:'А', B:'В', C:'С', E:'Е', H:'Н', I:'І', K:'К', M:'М', O:'О', P:'Р', T:'Т', X:'Х', Y:'У',
    a:'а', c:'с', e:'е', i:'і', o:'о', p:'р', x:'х', y:'у'
});
function normalizeReportSortText(value) {
    return String(value ?? '').normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
}
function canonicalMaterialKey(value) {
    const normalized = normalizeReportSortText(value);
    if (!/[А-Яа-яІіЇїЄєҐґ]/u.test(normalized)) return normalized.toLocaleLowerCase('uk-UA');
    return normalized.replace(/[ABCEHIKMOPTXYaceiopxy]/g, ch => LATIN_CYRILLIC_TWINS[ch] || ch)
        .toLocaleLowerCase('uk-UA');
}
function compareReportItems(a, b) {
    const first = reportItemCollator.compare(canonicalMaterialKey(a.matName), canonicalMaterialKey(b.matName));
    return first || reportItemCollator.compare(
        canonicalMaterialKey(a.kpName || a.kp || ''),
        canonicalMaterialKey(b.kpName || b.kp || '')
    );
}
function sortReportItemsAlphabetically(items) {
    items.sort(compareReportItems); // Stable sort in modern browsers.
    return items.map(item => normalizeReportSortText(item.matName));
}

function normalizeReportItems(items, defaultElements) {
    if (!Array.isArray(items)) return [];
    return items.flatMap(item => {
        if (!item || typeof item.matName !== 'string') return [];
        let matIndex = appMaterials.findIndex(material => material.name === item.matName);
        if (matIndex < 0) {
            const candidates = appMaterials.map((material, index) => canonicalMaterialKey(material.name) === canonicalMaterialKey(item.matName) ? index : -1).filter(index => index >= 0);
            if (candidates.length === 1) matIndex = candidates[0];
        }
        if (matIndex < 0) return [];
        const material = appMaterials[matIndex];
        if (!material.grades || material.grades.length === 0) return [];

        let resolvedGradeIndex = -1;
        const targetSig = item.kpSig || (item.kp !== undefined ? `${(item.kp || '').trim()}||${(item.description || '').trim()}` : null);

        // 1. Match by full signature (kp + description)
        if (targetSig) {
            resolvedGradeIndex = material.grades.findIndex(g => getGradeSignature(g) === targetSig);
        }

        // 2. Match by kp and description directly if available
        if (resolvedGradeIndex < 0 && item.kp !== undefined && item.description !== undefined) {
            resolvedGradeIndex = material.grades.findIndex(g =>
                (g.kp || '').trim() === (item.kp || '').trim() && (g.description || '').trim() === (item.description || '').trim()
            );
        }

        // 3. Match by kp string only
        if (resolvedGradeIndex < 0 && item.kp !== undefined && item.kp !== '') {
            resolvedGradeIndex = material.grades.findIndex(g => (g.kp || '').trim() === String(item.kp).trim());
        }

        // 4. Fallback to kpName string matching (exact description or exact whole-token KP)
        if (resolvedGradeIndex < 0 && item.kpName) {
            resolvedGradeIndex = material.grades.findIndex(g => {
                const desc = formatDescription(material.name, g.description);
                if (desc === item.kpName) return true;
                const kpToken = (g.kp || '').trim();
                if (!kpToken) return false;
                const tokenRegex = new RegExp('(?:^|[^0-9a-zA-Zа-яА-ЯёЁіІїЇєЄ])' + kpToken + '(?:[^0-9a-zA-Zа-яА-ЯёЁіІїЇєЄ]|$)', 'u');
                return tokenRegex.test(item.kpName);
            });
        }

        // 5. Positional index fallback
        if (resolvedGradeIndex < 0 && typeof item.kpIndex === 'number' && material.grades[item.kpIndex]) {
            resolvedGradeIndex = item.kpIndex;
        }

        // 6. Default to first grade if nothing matched
        if (resolvedGradeIndex < 0) {
            resolvedGradeIndex = 0;
        }

        const resolvedGrade = material.grades[resolvedGradeIndex];
        const elements = Array.isArray(item.elements) && item.elements.length
            ? item.elements.filter(element => defaultElements.includes(element))
            : defaultElements.slice();

        return [{
            ...item,
            matIndex,
            kpIndex: resolvedGradeIndex,
            matName: material.name,
            kp: resolvedGrade.kp || '',
            description: resolvedGrade.description || '',
            kpSig: getGradeSignature(resolvedGrade),
            kpName: getReportKpName({ matIndex, kpIndex: resolvedGradeIndex, kpName: item.kpName }),
            elements
        }];
    });
}

function loadFromLocalStorage() {
    const saved = readSavedJSON('pnae_state_v2', null);
    if (saved && Array.isArray(saved.overrides) && Array.isArray(saved.custom)) {
        lastExportSnapshot = saved.lastExportSnapshot || null;
        // If the file is precisely the exported database AND no changes were made
        // after that export, it is already authoritative. Applying old overrides
        // against re-ordered/renamed materials could create duplicated grades.
        const isExactExport = lastExportSnapshot &&
            lastExportSnapshot.dataHash === materialFingerprint(coreDB) &&
            lastExportSnapshot.changesHash === getMaterialChangeFingerprint(saved);
        if (!isExactExport) restoreMaterialsFromState(saved);
        else {
            appMaterials = JSON.parse(JSON.stringify(coreDB));
            appMaterialOrigins = coreDB.map(material => material.name);
        }
        favoriteMaterials = saved.favoriteMaterials;
        reportMaterials = saved.reportMaterials;
        reportMaterialsEquip = saved.reportMaterialsEquip;
        reportTemperatures = saved.reportTemperatures;
        activeReportSubTab = saved.activeReportSubTab;
        equipmentActiveProperties = saved.equipmentActiveProperties;
        equipmentStressColumns = saved.equipmentStressColumns;
        reportEquipSeismicVal = saved.reportEquipSeismicVal;
        restoreCoefficientValues(saved.coefficients);
        const savedSourceHash = saved.sourceDataHash;
        sourceDataChangedSinceSave = Boolean(savedSourceHash && savedSourceHash !== materialFingerprint(coreDB) && !isExactExport);
        sourceDataBaselineHash = sourceDataChangedSinceSave ? savedSourceHash : materialFingerprint(coreDB);
    } else {
        appMaterials = JSON.parse(JSON.stringify(coreDB));
        appMaterialOrigins = coreDB.map(material => material.name);
        loadLegacyStorage();
        appMaterialOrigins.push(...Array(appMaterials.length - coreDB.length).fill(null));
        sourceDataChangedSinceSave = false;
        sourceDataBaselineHash = materialFingerprint(coreDB);
    }
    favoriteMaterials = Array.isArray(favoriteMaterials) ? favoriteMaterials.filter(name => typeof name === 'string') : [];
    reportMaterials = normalizeReportItems(reportMaterials, ['Фланець', 'Шпильки', 'Різьба']);
    reportMaterialsEquip = normalizeReportItems(reportMaterialsEquip,
        ['Всі деталі (крім шпильок)', 'Зварювальні та наплавні матеріали', 'Шпильки', 'Опора']);
    reportTemperatures = Array.isArray(reportTemperatures) && reportTemperatures.length
        ? reportTemperatures.filter(t => temperatures.includes(t)) : [20, 50, 100, 150];
    if (!reportTemperatures.length) reportTemperatures = [20];
    activeReportSubTab = activeReportSubTab === 'equipment' ? 'equipment' : 'gaskets';
    equipmentActiveProperties = Array.isArray(equipmentActiveProperties)
        ? equipmentActiveProperties.filter(key => propertiesList.some(prop => prop.key === key)) : ['RTm', 'RTp'];
    equipmentStressColumns = Array.isArray(equipmentStressColumns) ? equipmentStressColumns.filter(col =>
        col && ['gv', 'nue', 'pnue', 'as', 'pz', 'mrz'].includes(col.mode) && temperatures.includes(col.temp)) : [{ mode: 'gv', temp: 20 }];
    reportEquipSeismicVal = reportEquipSeismicVal === '2' ? '2' : '1';
}

function loadLegacyStorage() {
    const savedDb = localStorage.getItem('pnae_materials_custom');
    if (savedDb) {
        try {
            const parsed = JSON.parse(savedDb);
            if (parsed && Array.isArray(parsed)) {
                parsed.forEach(customMat => {
                    if (isValidMaterial(customMat) && !coreDB.find(m => canonicalMaterialKey(m.name) === canonicalMaterialKey(customMat.name))) {
                        appMaterials.push(customMat);
                    }
                });
            }
        } catch (e) { console.error("Помилка читання", e); }
    }
    const extensions = readSavedJSON('pnae_materials_extensions', {});
    if (extensions && typeof extensions === 'object') {
        coreDB.forEach((base, index) => {
            const grades = extensions[base.name.toLowerCase()];
            if (Array.isArray(grades)) {
                appMaterials[index].grades.push(...grades.filter(grade => isValidMaterial({ name: base.name, grades: [grade] })));
            }
        });
    }
    const savedFavs = localStorage.getItem('pnae_favorites');
    if(savedFavs) {
        try { favoriteMaterials = JSON.parse(savedFavs); } catch(e){}
    }
    const savedReports = localStorage.getItem('pnae_report_materials');
    if(savedReports) {
        try { 
            reportMaterials = JSON.parse(savedReports); 
            reportMaterials.forEach(item => {
                if (!item.elements || !Array.isArray(item.elements) || item.elements.length === 0) {
                    item.elements = ["Фланець", "Шпильки", "Різьба"];
                }
            });
        } catch(e){}
    }
    
    const savedSubtab = localStorage.getItem('pnae_active_report_subtab');
    if (savedSubtab) activeReportSubTab = savedSubtab;
    
    const savedReportsEquip = localStorage.getItem('pnae_report_materials_equip');
    if(savedReportsEquip) {
        try { 
            reportMaterialsEquip = JSON.parse(savedReportsEquip); 
            reportMaterialsEquip.forEach(item => {
                if (!item.elements || !Array.isArray(item.elements) || item.elements.length === 0) {
                    item.elements = ["Всі деталі (крім шпильок)", "Зварювальні та наплавні матеріали", "Шпильки", "Опора"];
                }
            });
        } catch(e){}
    }
    
    const savedEquipProps = localStorage.getItem('pnae_equipment_active_properties');
    if(savedEquipProps) {
        try { equipmentActiveProperties = JSON.parse(savedEquipProps); } catch(e){}
    }
    
    const savedEquipCols = localStorage.getItem('pnae_equipment_stress_columns');
    if(savedEquipCols) {
        try { equipmentStressColumns = JSON.parse(savedEquipCols); } catch(e){}
    }

    const savedEquipSeismic = localStorage.getItem('pnae_report_equip_seismic');
    if(savedEquipSeismic) {
        reportEquipSeismicVal = savedEquipSeismic;
    }
}

function getTooltipIconHtml() {
    // Підказку створюємо окремо в document.body, інакше overflow-y-auto
    // у #view-calc обрізає її біля верхньої межі вкладки.
    return `<button type="button" class="sb-tooltip-icon" aria-label="Показати пояснення">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
    </button>`;
}

function initContextTooltips() {
    let activeTooltip = null;
    let activeTrigger = null;

    function hideTooltip() {
        if (activeTooltip) activeTooltip.remove();
        if (activeTrigger) activeTrigger.removeAttribute('aria-describedby');
        activeTooltip = null;
        activeTrigger = null;
    }

    document.querySelectorAll('.tooltip-trigger[data-tooltip]').forEach(label => {
        // Не додаємо другу іконку, якщо ініціалізацію викличуть повторно.
        if (label.querySelector('.sb-tooltip-icon')) return;
        label.insertAdjacentHTML('beforeend', getTooltipIconHtml());
        const trigger = label.querySelector('.sb-tooltip-icon');

        function showTooltip() {
            hideTooltip();
            const popup = document.createElement('div');
            popup.className = 'sb-tooltip-popup';
            popup.id = 'sb-context-tooltip';
            popup.role = 'tooltip';
            popup.textContent = label.dataset.tooltip || '';
            document.body.appendChild(popup);

            const rect = trigger.getBoundingClientRect();
            const size = popup.getBoundingClientRect();
            const margin = 12;
            const gap = 10;
            let top = rect.top - size.height - gap;
            if (top < margin) top = rect.bottom + gap;
            top = Math.max(margin, Math.min(top, window.innerHeight - size.height - margin));
            const left = Math.max(margin, Math.min(
                rect.left + rect.width / 2 - size.width / 2,
                window.innerWidth - size.width - margin
            ));
            popup.style.top = `${top}px`;
            popup.style.left = `${left}px`;
            trigger.setAttribute('aria-describedby', popup.id);
            activeTooltip = popup;
            activeTrigger = trigger;
        }

        trigger.addEventListener('pointerenter', showTooltip);
        trigger.addEventListener('pointerleave', hideTooltip);
        trigger.addEventListener('focus', showTooltip);
        trigger.addEventListener('blur', hideTooltip);
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Escape') hideTooltip();
        });
    });

    // Не залишаємо підказки «в повітрі» при прокручуванні вкладки.
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip);
}


// Ширина бічної панелі: окремий параметр UI, зберігається у браузері.
// Візуально закріплюємо перші дві логічні колонки в кожній таблиці.
// Позиції визначаємо з урахуванням rowspan/colspan, а не nth-child(2).
let frozenColumnsScheduled = false;
function scheduleFrozenColumns() {
    if (frozenColumnsScheduled || typeof document === 'undefined') return;
    frozenColumnsScheduled = true;
    requestAnimationFrame(() => { frozenColumnsScheduled = false; applyFrozenColumns(); });
}
function applyFrozenColumns() {
    document.querySelectorAll('#view-table table, #view-report table').forEach(table => {
        const mainHeader = table.tHead?.rows[0]?.cells[0];
        const firstWidth = mainHeader?.getBoundingClientRect().width || 240;
        table.style.setProperty('--sb-frozen-first-width', Math.round(firstWidth) + 'px');
        const mark = selector => {
            const rows = table.querySelectorAll(selector);
            if (!rows.length) return;
            const grid = buildTableGrid(table, selector);
            rows.forEach(row => [...row.cells].forEach(cell => {
                cell.classList.remove('sb-frozen-first', 'sb-frozen-second');
                if (cell.colSpan !== 1) return;
                const logicalCol = Number(cell.dataset.vCol);
                if (logicalCol === 0) cell.classList.add('sb-frozen-first');
                if (logicalCol === 1) cell.classList.add('sb-frozen-second');
            }));
        };
        mark('thead tr');
        mark('tbody tr');
    });
}
function initFrozenColumns() {
    const observer = new MutationObserver(() => scheduleFrozenColumns());
    ['view-table', 'view-report'].forEach(id => {
        const node = document.getElementById(id);
        if (node) observer.observe(node, { childList: true, subtree: true });
    });
    window.addEventListener('resize', scheduleFrozenColumns);
    scheduleFrozenColumns();
}

function initSidebarResize() {
    const handle = document.getElementById('sidebarResizeHandle');
    const sidebar = document.getElementById('mainSidebar');
    if (!handle || !sidebar) return;
    const key = 'superbase_sidebar_width';
    const setWidth = width => {
        const clamped = Math.max(260, Math.min(560, Math.round(width)));
        document.documentElement.style.setProperty('--sb-sidebar-width', clamped + 'px');
        return clamped;
    };
    const remembered = Number(localStorage.getItem(key));
    if (Number.isFinite(remembered) && remembered > 0) setWidth(remembered);
    let start = null;
    handle.addEventListener('pointerdown', event => {
        if (window.innerWidth < 768) return;
        start = { x: event.clientX, width: sidebar.getBoundingClientRect().width };
        handle.setPointerCapture(event.pointerId);
        document.documentElement.classList.add('sb-resizing');
        event.preventDefault();
    });
    handle.addEventListener('pointermove', event => {
        if (!start) return;
        setWidth(start.width + event.clientX - start.x);
    });
    const finish = () => {
        if (!start) return;
        start = null;
        document.documentElement.classList.remove('sb-resizing');
        localStorage.setItem(key, String(sidebar.getBoundingClientRect().width));
        scheduleFrozenColumns();
    };
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('dblclick', () => {
        setWidth(340);
        localStorage.setItem(key, '340');
    });
    handle.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
        event.preventDefault();
        const width = event.key === 'Home' ? 340 : sidebar.getBoundingClientRect().width + (event.key === 'ArrowRight' ? 20 : -20);
        localStorage.setItem(key, String(setWidth(width)));
    });
}

function initSyncDetails() {
    const button = document.getElementById('btnSyncDetails');
    if (!button) return;
    button.addEventListener('click', () => {
        const installed = new Map(coreDB.map(item => [canonicalMaterialKey(item.name), item]));
        const current = new Map(appMaterials.map(item => [canonicalMaterialKey(item.name), item]));
        const added = [...current.keys()].filter(name => !installed.has(name));
        const deleted = [...installed.keys()].filter(name => !current.has(name));
        const modified = [...current.keys()].filter(name => installed.has(name) &&
            JSON.stringify(installed.get(name)) !== JSON.stringify(current.get(name)));
        const lines = [
            'Порівняння бази в браузері та встановленого data.js',
            `Додано: ${added.length}, змінено: ${modified.length}, видалено: ${deleted.length}`,
            ...added.map(name => '+ ' + current.get(name).name),
            ...modified.map(name => '~ ' + current.get(name).name),
            ...deleted.map(name => '- ' + installed.get(name).name),
            '',
            'Увага: експорт завантажує новий data.js, але не замінює файл автоматично.',
            'Після експорту замініть data.js у папці SuperBase, зробивши резервну копію.',
            ...(sourceDataChangedSinceSave ? ['Файл data.js змінювався після попереднього збереження в браузері: перевірте відповідність даних.'] : [])
        ];
        const diff = document.getElementById('backupPreviewDiff');
        const info = document.getElementById('backupPreviewInfo');
        info.textContent = 'Перегляд змін без внесення правок';
        diff.textContent = lines.join('\n');
        const modal = document.getElementById('backupPreviewModal');
        modal.dataset.mode = 'sync';
        document.getElementById('btnConfirmBackupRestore').hidden = true;
        modal.hidden = false;
    });
}


function setSegmentedSelection(buttons, selected, isTab = false) {
    buttons.forEach(button => {
        const active = button === selected;
        button.classList.toggle('is-active', active);
        if (isTab) {
            button.setAttribute('aria-selected', active ? 'true' : 'false');
            button.tabIndex = active ? 0 : -1;
        } else {
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        }
    });
}

function initSegmentedKeyboard(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    const buttons = Array.from(group.querySelectorAll('[role="tab"]'));
    group.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        event.preventDefault();
        let next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
    });
}

function bindSegmentedSelect(selectId, segmentedId) {
    const select = document.getElementById(selectId);
    const wrapper = document.getElementById(segmentedId);
    if (!select || !wrapper) return;
    const buttons = Array.from(wrapper.querySelectorAll('.sb-segmented__option[data-value]'));
    const syncButtons = () => {
        const value = select.value === '2' ? '2' : '1';
        setSegmentedSelection(buttons, buttons.find(btn => btn.dataset.value === value));
    };
    buttons.forEach(button => button.addEventListener('click', () => {
        const nextValue = button.dataset.value === '2' ? '2' : '1';
        if (select.value !== nextValue) {
            select.value = nextValue;
            // A single change event updates the calculator or the report and persists its state.
            select.dispatchEvent(new Event('change', { bubbles:true }));
        }
        syncButtons();
    }));
    select.addEventListener('change', syncButtons);
    syncButtons();
}

function initTemperatureRuler(slider) {
    if (!slider) return () => {};
    const ruler = document.createElement('div');
    ruler.className = 'sb-temperature-ruler';
    ruler.setAttribute('aria-hidden', 'true');
    const min = Number(slider.min), max = Number(slider.max);
    temperatures.forEach(value => {
        const tick = document.createElement('span');
        tick.className = 'sb-temperature-ruler__tick';
        tick.style.left = `${((value - min) / (max - min)) * 100}%`;
        tick.dataset.temperature = String(value);
        ruler.appendChild(tick);
    });
    const startLabel = document.createElement('span');
    startLabel.className = 'sb-temperature-ruler__label sb-temperature-ruler__label--start';
    startLabel.textContent = `${min}°`;
    const endLabel = document.createElement('span');
    endLabel.className = 'sb-temperature-ruler__label sb-temperature-ruler__label--end';
    endLabel.textContent = `${max}°`;
    ruler.append(startLabel, endLabel);
    slider.insertAdjacentElement('afterend', ruler);
    let previousStep = Number(slider.value);
    const sync = (feedback = false) => {
        const value = Number(slider.value);
        const percent = Math.max(0, Math.min(100, 100 * (value - min) / (max - min)));
        slider.style.setProperty('--sb-range-fill', `${percent}%`);
        slider.setAttribute('aria-valuetext', `${value} °C`);
        ruler.querySelectorAll('[data-temperature]').forEach(tick => {
            const temp = Number(tick.dataset.temperature);
            tick.classList.toggle('is-passed', temp < value);
            tick.classList.toggle('is-current', Math.abs(temp - value) < Number(slider.step) / 2);
        });
        if (feedback && value !== previousStep && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            slider.classList.remove('sb-range-stepped');
            void slider.offsetWidth;
            slider.classList.add('sb-range-stepped');
            clearTimeout(slider._sbStepTimer);
            slider._sbStepTimer = setTimeout(() => slider.classList.remove('sb-range-stepped'), 130);
        }
        previousStep = value;
    };
    slider.addEventListener('input', () => sync(true));
    sync();
    return sync;
}

// Visual feedback does not alter the exact calculated value or clipboard content.
function snapshotCalculatorValues() {
    const values = new Map();
    document.querySelectorAll('#view-calc [id] > .sb-animated-number').forEach(node => {
        values.set(node.parentElement.id, node.textContent);
    });
    return values;
}
function animateCommittedCalculatorValues(before) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('#view-calc [id] > .sb-animated-number').forEach(node => {
        if (before.has(node.parentElement.id) && before.get(node.parentElement.id) !== node.textContent) {
            node.classList.remove('sb-number-updated');
            void node.offsetWidth;
            node.classList.add('sb-number-updated');
        }
    });
}

function init() {
    initTheme();
    initKpPicker();
    loadFromLocalStorage();
    updateDataSaveStatus();
    initQuickSearch();
    initReportCopyButtons();
    bindSegmentedSelect('calcSeismic', 'calcSeismicSegmented');
    bindSegmentedSelect('reportEquipSeismic', 'reportEquipSeismicSegmented');
    initSegmentedKeyboard('mainTabSegmented');
    initSegmentedKeyboard('reportTabSegmented');

    let headerHtml = `<th class="sticky-col-header first-col py-3.5 px-4 font-semibold text-left min-w-[280px]">Характеристика \\ Т, °С</th>`;
    temperatures.forEach(t => { 
        const th = `<th data-temp-col="${t}" class="sticky-col-header py-3.5 px-4 font-semibold text-center min-w-[80px] transition-colors duration-200">${t}</th>`;
        headerHtml += th;
    });
    el.tHead.innerHTML = headerHtml;

    const debouncedSearch = debounce((value) => updateMaterialList(value), 300);
    el.search.addEventListener('input', (e) => debouncedSearch(e.target.value));
    
    el.mat.addEventListener('change', updateKpList);
    el.kp.addEventListener('change', updateAllViews);
    
    document.getElementById('view-calc').addEventListener('input', updateCalculator);
    document.getElementById('view-calc').addEventListener('change', updateCalculator);
    document.getElementById('coefModal').addEventListener('input', updateCalculator);
    document.getElementById('coefModal').addEventListener('change', () => {
        if (validateCoefficients().valid) saveToLocalStorage();
        renderReportStressTable();
        renderReportStressTableEquip();
    });

    // --- Синхронізація слайдерів (повзунків) температур з інпутами ---
    const calcTemp = document.getElementById('calcTemp');
    const calcTempSlider = document.getElementById('calcTempSlider');
    const calcTempGv = document.getElementById('calcTempGv');
    const calcTempGvSlider = document.getElementById('calcTempGvSlider');

    [[calcTemp, calcTempSlider], [calcTempGv, calcTempGvSlider]].forEach(([field, slider]) => {
        if (!field || !slider) return;
        const syncRuler = initTemperatureRuler(slider);
        slider.addEventListener('input', () => {
            const previous = snapshotCalculatorValues();
            field.value = slider.value;
            updateCalculator();
            animateCommittedCalculatorValues(previous);
        });
        field.addEventListener('input', () => {
            const value = Number(field.value);
            if (Number.isFinite(value) && field.value.trim() !== '') {
                slider.value = String(Math.max(Number(slider.min), Math.min(Number(slider.max), value)));
                // Sync only the ruler; the number-input event already recalculated the real result.
                syncRuler();
            }
        });
    });

    document.getElementById('devModeToggle').addEventListener('change', (e) => {
        isDevMode = e.target.checked;
        updateCalculator();
    });

    document.getElementById('reportDevModeToggle').addEventListener('change', () => {
        if (activeReportSubTab === 'gaskets') {
            renderReportStressTable();
        } else {
            renderReportStressTableEquip();
        }
    });

    // Equipment properties checklist listeners
    document.querySelectorAll('.equip-prop-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            equipmentActiveProperties = Array.from(document.querySelectorAll('.equip-prop-cb:checked')).map(c => c.value);
            saveToLocalStorage();
            renderReportTableEquip();
        });
    });

    // Equipment seismic selector listener
    const reportEquipSeismic = document.getElementById('reportEquipSeismic');
    if (reportEquipSeismic) {
        reportEquipSeismic.addEventListener('change', (e) => {
            reportEquipSeismicVal = e.target.value;
            saveToLocalStorage();
            renderReportStressTableEquip();
        });
    }

    // Restore checkbox states from loaded state
    document.querySelectorAll('.equip-prop-cb').forEach(cb => {
        cb.checked = equipmentActiveProperties.includes(cb.value);
    });
    if (reportEquipSeismic) {
        reportEquipSeismic.value = reportEquipSeismicVal;
    }

    // Switch to active sub-tab to draw initial tables
    switchReportSubTab(activeReportSubTab);

    const coefModal = document.getElementById('coefModal');
    const closeCoefModal = () => coefModal.classList.add('hidden');
    document.getElementById('btnToggleCoef').addEventListener('click', () => {
        validateCoefficients();
        coefModal.classList.remove('hidden');
    });
    document.getElementById('btnCloseCoef').addEventListener('click', closeCoefModal);
    document.getElementById('btnApplyCoef').addEventListener('click', () => {
        const val = validateCoefficients();
        updateCalculator();
        renderReportStressTable();
        renderReportStressTableEquip();
        if (!val.valid) {
            showToast('Виправте помилки у значеннях коефіцієнтів (> 0)', 'error');
        } else {
            saveToLocalStorage();
            closeCoefModal();
            showToast('Коефіцієнти успішно застосовано', 'success');
        }
    });
    document.getElementById('coefModalBackdrop').addEventListener('click', closeCoefModal);

    const btnResetCoef = document.getElementById('btnResetCoef');
    if (btnResetCoef) {
        btnResetCoef.addEventListener('click', resetCoefficientsToDefaults);
    }

    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const mainSidebar = document.getElementById('mainSidebar');
    if (btnToggleSidebar && mainSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            mainSidebar.classList.toggle('sidebar-collapsed');
        });
    }

    const equipPropsModal = document.getElementById('equipPropsModal');
    const closeEquipPropsModal = () => equipPropsModal.classList.add('hidden');
    document.getElementById('btnToggleEquipProps').addEventListener('click', () => equipPropsModal.classList.remove('hidden'));
    document.getElementById('btnCloseEquipProps').addEventListener('click', closeEquipPropsModal);
    document.getElementById('btnApplyEquipProps').addEventListener('click', closeEquipPropsModal);
    document.getElementById('equipPropsModalBackdrop').addEventListener('click', closeEquipPropsModal);

    initAddMaterialModal();
    
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
    
    const btnSortReportList = document.getElementById('btnSortReportList');
    if (btnSortReportList) {
        btnSortReportList.addEventListener('click', () => {
            const items = activeReportSubTab === 'gaskets' ? reportMaterials : reportMaterialsEquip;
            if (items.length < 2) {
                showToast('Для сортування потрібно щонайменше два матеріали', 'warning');
                return;
            }
            sortReportItemsAlphabetically(items);
            renderReportList();
            showToast('Список відсортовано за алфавітом (А–Я)', 'success');
        });
    }

    document.getElementById('btnFavorite').addEventListener('click', toggleFavorite);
    document.getElementById('btnEditMat').addEventListener('click', openEditModal);
    
    document.getElementById('btnExportJS').addEventListener('click', exportToJS);

    const btnExportBackupJSON = document.getElementById('btnExportBackupJSON');
    if (btnExportBackupJSON) {
        btnExportBackupJSON.addEventListener('click', exportBackupJSON);
    }

    const btnImportBackupJSON = document.getElementById('btnImportBackupJSON');
    const importBackupFileInput = document.getElementById('importBackupFileInput');
    if (btnImportBackupJSON && importBackupFileInput) {
        btnImportBackupJSON.addEventListener('click', () => {
            importBackupFileInput.value = '';
            importBackupFileInput.click();
        });
        importBackupFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                importBackupJSONFile(e.target.files[0]);
            }
        });
    }

    const btnResetMatToCore = document.getElementById('btnResetMatToCore');
    if (btnResetMatToCore) {
        btnResetMatToCore.addEventListener('click', resetCurrentMaterialToCore);
    }
    const btnDeleteMat = document.getElementById('btnDeleteMat');
    if (btnDeleteMat) btnDeleteMat.addEventListener('click', deleteCurrentMaterial);
    const gradeSelect = document.getElementById('editGradeSelect');
    gradeSelect.addEventListener('change', () => switchEditorGrade(gradeSelect.value));
    document.getElementById('btnAddGrade').addEventListener('click', () => switchEditorGrade('new'));
    document.getElementById('btnDeleteGrade').addEventListener('click', deleteCurrentGrade);

    document.getElementById('btnAddToReport').addEventListener('click', () => {
        const matIndex = el.mat.value;
        const kpIndex = el.kp.value;
        if (matIndex === "" || kpIndex === "") return;
        
        const material = appMaterials[matIndex];
        const grade = material.grades[kpIndex];
        const matName = material.name;
        const cleanDesc = formatDescription(material.name, grade.description);
        const kpName = grade.kp ? (cleanDesc !== 'Не вказано' ? `КП ${grade.kp} (${cleanDesc})` : `КП ${grade.kp}`) : 'Без КП';
        const gradeSig = getGradeSignature(grade);

        if (activeReportSubTab === 'gaskets') {
            const selectedElements = Array.from(document.querySelectorAll('.report-element-cb:checked')).map(cb => cb.value);
            if (selectedElements.length === 0) {
                showToast('Оберіть хоча б один елемент (Фланець, Шпильки, Різьба)', 'warning');
                return;
            }
            const existingIndex = reportMaterials.findIndex(m =>
                m.matName === matName && (m.kpSig === gradeSig || (m.matIndex == matIndex && m.kpIndex == kpIndex))
            );
            
            if (existingIndex !== -1) {
                const existingItem = reportMaterials[existingIndex];
                const oldElementsStr = existingItem.elements.join(', ');
                const newElementsStr = selectedElements.join(', ');
                
                if (oldElementsStr === newElementsStr) {
                    showToast('Цей матеріал з такими елементами вже у списку!', 'warning');
                } else {
                    existingItem.elements = selectedElements;
                    saveToLocalStorage();
                    renderReportList();
                    showToast('Елементи для матеріалу оновлено', 'success');
                }
            } else {
                reportMaterials.push({
                    matIndex,
                    kpIndex,
                    matName,
                    kpName,
                    kp: grade.kp || '',
                    description: grade.description || '',
                    kpSig: gradeSig,
                    elements: selectedElements
                });

                saveToLocalStorage();
                renderReportList();
                playFlyToReportAnimation();
                showToast('Матеріал додано до списку', 'success');
            }
        } else {
            const selectedElements = Array.from(document.querySelectorAll('.report-element-equip-cb:checked')).map(cb => cb.value);
            if (selectedElements.length === 0) {
                showToast('Оберіть хоча б один елемент (Всі деталі, Зварювальні матеріали, Шпильки, Опора)', 'warning');
                return;
            }
            const existingIndex = reportMaterialsEquip.findIndex(m =>
                m.matName === matName && (m.kpSig === gradeSig || (m.matIndex == matIndex && m.kpIndex == kpIndex))
            );
            
            if (existingIndex !== -1) {
                const existingItem = reportMaterialsEquip[existingIndex];
                const oldElementsStr = existingItem.elements.join(', ');
                const newElementsStr = selectedElements.join(', ');
                
                if (oldElementsStr === newElementsStr) {
                    showToast('Цей матеріал з такими елементами вже у списку обладнання!', 'warning');
                } else {
                    existingItem.elements = selectedElements;
                    saveToLocalStorage();
                    renderReportList();
                    showToast('Елементи для матеріалу оновлено', 'success');
                }
            } else {
                reportMaterialsEquip.push({
                    matIndex,
                    kpIndex,
                    matName,
                    kpName,
                    kp: grade.kp || '',
                    description: grade.description || '',
                    kpSig: gradeSig,
                    elements: selectedElements
                });

                saveToLocalStorage();
                renderReportList();
                playFlyToReportAnimation();
                showToast('Матеріал додано до списку обладнання', 'success');
            }
        }
    });

    initContextTooltips();

    updateMaterialList();

    // --- Easter Egg Logic ---
    const easterEggTrigger = document.getElementById('easterEggTrigger');
    const devModal = document.getElementById('devModal');
    const devModalBackdrop = document.getElementById('devModalBackdrop');
    const devModalWrapper = document.getElementById('devModalWrapper');
    const btnCloseDevCross = document.getElementById('btnCloseDevCross');
    
    let sClickCount = 0;
    let sClickTimer = null;

    if (easterEggTrigger) {
        easterEggTrigger.addEventListener('click', () => {
            sClickCount++;
            clearTimeout(sClickTimer);
            
            if (sClickCount >= 5) {
                devModal.classList.remove('hidden');
                sClickCount = 0; // Reset
                
                // Міні-ефект конфетті
                for(let i = 0; i < 40; i++) {
                    const conf = document.createElement('div');
                    conf.className = 'fixed rounded-full z-[110] pointer-events-none opacity-80';
                    const size = Math.random() * 6 + 4;
                    conf.style.width = size + 'px';
                    conf.style.height = size + 'px';
                    conf.style.backgroundColor = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random()*5)];
                    conf.style.left = (Math.random() * 100) + 'vw';
                    conf.style.top = '-20px';
                    conf.style.transition = 'top 1.5s cubic-bezier(.37,0,.63,1), opacity 1.5s ease-in, transform 1.5s linear';
                    document.body.appendChild(conf);
                    
                    setTimeout(() => {
                        conf.style.top = '100vh';
                        conf.style.opacity = '0';
                        conf.style.transform = `translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 360}deg)`;
                        setTimeout(() => conf.remove(), 1500);
                    }, 10);
                }
            } else {
                // Якщо не натиснуто 5 разів за 1.5 секунди - скидаємо
                sClickTimer = setTimeout(() => {
                    sClickCount = 0;
                }, 1500);
            }
        });
    }

    const closeDevInfo = () => devModal.classList.add('hidden');
    if (devModalBackdrop) devModalBackdrop.addEventListener('click', closeDevInfo);
    if (devModalWrapper) {
        devModalWrapper.addEventListener('click', (e) => {
            // Перевіряємо, що клікнули саме по обгортці, а не всередині картки
            if (e.target === devModalWrapper) closeDevInfo();
        });
    }
    if (btnCloseDevCross) btnCloseDevCross.addEventListener('click', closeDevInfo);
    initSyncDetails();
    initHistoryUI();
    initSidebarResize();
    initFrozenColumns();
    initBackupPreview();
}

function switchTab(tab) {
    const btnTable = document.getElementById('tab-btn-table');
    const btnCalc = document.getElementById('tab-btn-calc');
    const btnChart = document.getElementById('tab-btn-chart');
    const btnReport = document.getElementById('tab-btn-report');
    
    const viewTable = document.getElementById('view-table');
    const viewCalc = document.getElementById('view-calc');
    const viewChart = document.getElementById('view-chart');
    const viewReport = document.getElementById('view-report');
    
    const reportActions = document.getElementById('reportActions');
    const defaultSidebarActions = document.getElementById('defaultSidebarActions');
    const reportSidebarActions = document.getElementById('reportSidebarActions');
    const btnOpenAddMat = document.getElementById('btnOpenAddMat');

    const headerMaterialInfo = document.getElementById('headerMaterialInfo');
    const headerReportInfo = document.getElementById('headerReportInfo');
    
    [viewTable, viewCalc, viewChart, viewReport].forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('tab-active');
    });
    const tabs = [btnTable, btnCalc, btnChart, btnReport];
    const activeTab = { table:btnTable, calc:btnCalc, chart:btnChart, report:btnReport }[tab];
    setSegmentedSelection(tabs, activeTab, true);

    if (tab === 'report') {
        reportActions.classList.remove('hidden');
        defaultSidebarActions.classList.add('hidden');
        defaultSidebarActions.classList.remove('flex');
        btnOpenAddMat.classList.add('hidden');
        btnOpenAddMat.classList.remove('flex');
        reportSidebarActions.classList.remove('hidden');
        reportSidebarActions.classList.add('flex');
        headerMaterialInfo.classList.add('hidden');
        headerMaterialInfo.classList.remove('flex');
        headerReportInfo.classList.remove('hidden');
        headerReportInfo.classList.add('flex');
    } else {
        reportActions.classList.add('hidden');
        defaultSidebarActions.classList.remove('hidden');
        defaultSidebarActions.classList.add('flex');
        btnOpenAddMat.classList.remove('hidden');
        btnOpenAddMat.classList.add('flex');
        reportSidebarActions.classList.add('hidden');
        reportSidebarActions.classList.remove('flex');
        headerMaterialInfo.classList.remove('hidden');
        headerMaterialInfo.classList.add('flex');
        headerReportInfo.classList.add('hidden');
        headerReportInfo.classList.remove('flex');
    }

    let activeView = null;
    if (tab === 'table') {
        activeView = viewTable;
    } else if (tab === 'calc') {
        activeView = viewCalc;
        updateCalculator();
    } else if (tab === 'chart') {
        activeView = viewChart;
        renderChart();
    } else if (tab === 'report') {
        activeView = viewReport;
        renderReportList();
    }

    if (activeView) {
        activeView.classList.remove('hidden');
        if (tab === 'report') {
            activeView.classList.add('flex');
        }
        requestAnimationFrame(() => {
            scheduleFrozenColumns();
            requestAnimationFrame(() => {
                activeView.classList.add('tab-active');
            });
        });
    }
}

function renderReportList() {
    // Preserve the current manual order; sorting runs only when А–Я is clicked.
    saveToLocalStorage();
    const listWrapper = document.getElementById('sidebarReportListWrapper');
    const listInner = document.getElementById('sidebarReportListInner');
    const toggleText = document.getElementById('reportListToggleText');
    if (!listInner) return;
    
    const isVisible = listWrapper.classList.contains('expanded');
    const activeList = activeReportSubTab === 'gaskets' ? reportMaterials : reportMaterialsEquip;
    const count = activeList.length;
    const previousScrollTop = listInner.scrollTop;
    
    toggleText.textContent = isVisible ? `Сховати список (${count})` : `Показати список (${count})`;
    
    if (count === 0) {
        listInner.innerHTML = `
            <div class="text-center p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Список порожній</p>
            </div>`;
        if (activeReportSubTab === 'gaskets') {
            renderReportTable();
        } else {
            renderReportTableEquip();
        }
        return;
    }
    
    const isGasketList = activeReportSubTab === 'gaskets';
    const gasketElementChoices = ['Фланець', 'Шпильки', 'Різьба'];
    listInner.innerHTML = activeList.map((item, index) => {
        // Each option is always visible: selected = indigo, unselected = outline.
        // The chip buttons live outside pointer-events-none text/details so they remain clickable.
        const chips = isGasketList ? `<div class="report-list-chips" role="group" aria-label="Елементи для ${escapeHTML(item.matName)}">
            ${gasketElementChoices.map((name, elementIndex) => {
                const isSelected = Array.isArray(item.elements) && item.elements.includes(name);
                return `<button type="button" draggable="false"
                    class="report-element-chip ${isSelected ? 'is-active' : ''}"
                    aria-pressed="${isSelected}" aria-label="${isSelected ? 'Виключити' : 'Додати'} ${name} для ${escapeHTML(item.matName)}"
                    title="${isSelected ? 'Прибрати' : 'Додати'}: ${name}"
                    onclick="toggleReportItemElement(event, ${index}, ${elementIndex})">${name}</button>`;
            }).join('')}
        </div>` : `<div class="report-list-equipped-label" title="${escapeHTML((item.elements || []).join(', '))}">${escapeHTML((item.elements || []).join(', '))}</div>`;

        return `<div class="report-list-item grid items-center w-full min-w-0 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-2 last:mb-0 transition-colors"
            draggable="true" data-index="${index}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)"
            ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)">
            <div class="report-list-details flex items-center gap-2 min-w-0 overflow-hidden pointer-events-none">
                <div class="report-drag-grip text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true">
                    <svg width="15" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="9" cy="19" r="1.3"/><circle cx="15" cy="5" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="15" cy="19" r="1.3"/></svg>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-500 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                    ${index + 1}
                </div>
                <div class="report-list-text min-w-0 flex-1 overflow-hidden">
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-xs truncate" title="${escapeHTML(item.matName)}">${escapeHTML(item.matName)}</div>
                    <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5" title="${escapeHTML(getReportKpName(item))}">${escapeHTML(getReportKpName(item))}</div>
                </div>
            </div>
            <button type="button" onclick="removeReportItem(${index})" aria-label="Видалити ${escapeHTML(item.matName)} зі списку" title="Видалити зі списку" class="report-list-delete pointer-events-auto text-slate-400 hover:text-rose-500 shrink-0 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 z-10 relative">
                <svg class="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            ${chips}
        </div>`;
    }).join('');
    listInner.scrollTop = previousScrollTop;

    if (activeReportSubTab === 'gaskets') {
        renderReportTable();
    } else {
        renderReportTableEquip();
    }
}

// Quick element selection in the report sidebar (gasket/flange report only).
// Updates the same elements array as the add-to-report dialog, so the report
// and JSON backup naturally reflect the selection. The material DB is unchanged.
window.toggleReportItemElement = function(event, itemIndex, elementIndex) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (activeReportSubTab !== 'gaskets') return;
    const names = ['Фланець', 'Шпильки', 'Різьба'];
    if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= reportMaterials.length ||
        !Number.isInteger(elementIndex) || elementIndex < 0 || elementIndex >= names.length) return;

    const item = reportMaterials[itemIndex];
    const current = Array.isArray(item.elements) ? names.filter(name => item.elements.includes(name)) : names.slice();
    const element = names[elementIndex];
    const updated = current.includes(element) ? current.filter(name => name !== element) : [...current, element];
    if (updated.length === 0) {
        showToast('Залиште хоча б один елемент у матеріалі.', 'warning');
        return;
    }
    item.elements = names.filter(name => updated.includes(name));
    // renderReportList persists the state and refreshes both gasket report tables.
    renderReportList();
};

// --- Drag & Drop функції для списку звітів ---
let draggedReportIndex = null;

window.handleDragStart = function(e) {
    if (e.target.closest('button')) {
        e.preventDefault();
        return;
    }
    draggedReportIndex = parseInt(e.target.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        e.target.classList.add('opacity-40', 'border-brand-500', 'border-dashed');
    }, 0);
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
};

window.handleDragEnter = function(e) {
    e.preventDefault();
    const target = e.target.closest('.report-list-item');
    if (target && parseInt(target.dataset.index) !== draggedReportIndex) {
        target.classList.add('scale-[1.02]', 'bg-brand-50', 'dark:bg-brand-900/30', 'border-brand-400');
    }
};

window.handleDragLeave = function(e) {
    const target = e.target.closest('.report-list-item');
    if (target && parseInt(target.dataset.index) !== draggedReportIndex) {
        target.classList.remove('scale-[1.02]', 'bg-brand-50', 'dark:bg-brand-900/30', 'border-brand-400');
    }
};

window.handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target.closest('.report-list-item');
    if (target) {
        target.classList.remove('scale-[1.02]', 'bg-brand-50', 'dark:bg-brand-900/30', 'border-brand-400');
        const targetIndex = parseInt(target.dataset.index);
        if (draggedReportIndex !== null && draggedReportIndex !== targetIndex) {
            const activeList = activeReportSubTab === 'gaskets' ? reportMaterials : reportMaterialsEquip;
            const item = activeList.splice(draggedReportIndex, 1)[0];
            activeList.splice(targetIndex, 0, item);
            draggedReportIndex = null;
            renderReportList(); // Save and update displayed report rows in manual order.
        }
    }
    return false;
};

window.handleDragEnd = function(e) {
    e.target.classList.remove('opacity-40', 'border-brand-500', 'border-dashed');
    draggedReportIndex = null;
};

window.removeReportItem = function(index) {
    const activeList = activeReportSubTab === 'gaskets' ? reportMaterials : reportMaterialsEquip;
    activeList.splice(index, 1);
    renderReportList();
};

function getNearestHigherValue(dataObj, targetT) {
    if (!dataObj) return "—";
    if (dataObj[targetT] !== undefined && dataObj[targetT] !== "—" && dataObj[targetT] !== null) {
        return dataObj[targetT];
    }

    let availableTemps = [];
    for (let tStr in dataObj) {
        let t = parseFloat(tStr);
        let v = dataObj[tStr];
        if (!isNaN(t) && v !== "—" && v !== undefined && v !== null) {
            availableTemps.push({t: t, v: parseFloat(v)});
        }
    }
    if (availableTemps.length === 0) return "—";

    availableTemps.sort((a, b) => a.t - b.t);

    for (let i = 0; i < availableTemps.length; i++) {
        if (availableTemps[i].t > targetT) {
            return availableTemps[i].v;
        }
    }
    
    return "—"; 
}

// Audit trail for report values taken at the nearest higher available temperature.
// The original selection rule stays unchanged: never interpolate and never extrapolate upward.
function getNearestHigherValueInfo(dataObj, targetT) {
    if (!dataObj) return { value: '—', sourceTemp: null, substituted: false };
    const direct = dataObj[targetT];
    if (direct !== undefined && direct !== '—' && direct !== null) {
        return { value: direct, sourceTemp: Number(targetT), substituted: false };
    }
    const available = [];
    for (const tempString in dataObj) {
        const temp = parseFloat(tempString);
        const value = dataObj[tempString];
        if (!Number.isNaN(temp) && value !== '—' && value !== undefined && value !== null) {
            available.push({ temp, value: parseFloat(value) });
        }
    }
    available.sort((a, b) => a.temp - b.temp);
    const higher = available.find(entry => entry.temp > targetT);
    return higher
        ? { value: higher.value, sourceTemp: higher.temp, substituted: true }
        : { value: '—', sourceTemp: null, substituted: false };
}

const reportFallbackRecords = new Map();
const REPORT_PROPERTY_LABELS = { RTm: 'Rᵀm', RTp: 'Rᵀp0,2', A: 'A', Z: 'Z', E: 'E', Ro: 'ρ', Alpha: 'α', Mu: 'μ' };
const REPORT_FALLBACK_LEGEND = '* Значення для заданої температури відсутнє; прийнято характеристику при найближчій вищій температурі, для якої є дані (без інтерполяції).';

function addReportFallbackRecord(records, item, propertyKey, requestedTemp, info) {
    if (!info?.substituted || info.value === '—') return;
    const name = item.matName || appMaterials[item.matIndex]?.name || '';
    const gradeName = getReportKpName(item);
    const key = JSON.stringify([name, gradeName, propertyKey, requestedTemp, info.sourceTemp]);
    records.set(key, {
        name, gradeName, propertyKey,
        requestedTemp: Number(requestedTemp), sourceTemp: info.sourceTemp
    });
}

function getReportFallbackTitle(requestedTemp, dependencies) {
    const used = dependencies.filter(([, info]) => info?.substituted && info.value !== '—');
    if (!used.length) return '';
    return `Для ${requestedTemp} °C використано: ` + used.map(([key, info]) =>
        `${REPORT_PROPERTY_LABELS[key] || key} при ${info.sourceTemp} °C`).join('; ');
}

function reportFallbackCellAttrs(title) {
    return title ? ` data-uses-higher-temp="true" title="${escapeHTML(title)}"` : '';
}

function reportFallbackMarker(title) {
    return title ? '<sup class="text-amber-600 dark:text-amber-400 font-bold ml-0.5" aria-label="значення при вищій температурі">*</sup>' : '';
}

function reportFallbackDetails(records) {
    const grouped = new Map();
    for (const record of records.values()) {
        const key = JSON.stringify([record.name, record.gradeName, record.propertyKey]);
        if (!grouped.has(key)) grouped.set(key, { ...record, pairs: [] });
        const group = grouped.get(key);
        const pair = `${record.requestedTemp} → ${record.sourceTemp} °C`;
        if (!group.pairs.includes(pair)) group.pairs.push(pair);
    }
    return [...grouped.values()].map(group =>
        `${group.name} (${group.gradeName}), ${REPORT_PROPERTY_LABELS[group.propertyKey] || group.propertyKey}: ${group.pairs.join(', ')}`);
}

function updateReportFallbackExplanation(tbody, records) {
    reportFallbackRecords.set(tbody.id, records);
    const wrapper = tbody.closest('.table-container');
    if (!wrapper?.parentElement) return;
    let area = wrapper.parentElement.querySelector(':scope > .report-fallback-explanation');
    if (!area) {
        area = document.createElement('div');
        area.className = 'report-fallback-explanation';
        wrapper.after(area);
    }
    if (!records.size) {
        area.className = 'report-fallback-explanation hidden';
        area.replaceChildren();
        return;
    }
    const details = reportFallbackDetails(records);
    area.className = 'report-fallback-explanation px-4 py-3 border-t border-amber-200/60 dark:border-amber-700/30 bg-amber-50/60 dark:bg-amber-900/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed';
    area.innerHTML = `
        <p><span class="text-amber-700 dark:text-amber-400 font-bold">*</span> ${escapeHTML(REPORT_FALLBACK_LEGEND.slice(2))}</p>
        <details class="mt-1.5"><summary class="cursor-pointer text-indigo-700 dark:text-indigo-300 font-semibold">Показати конкретні підстановки (${records.size})</summary>
            <ul class="list-disc pl-5 mt-2 space-y-1">${details.map(detail => `<li>${escapeHTML(detail)}</li>`).join('')}</ul>
        </details>`;
}

function attachReportClipboardExplanation(copy, source, selectedOnly) {
    if (!source.closest('#view-report')) return;
    let lines = [];
    if (selectedOnly) {
        lines = [...new Set([...source.querySelectorAll('td.cell-selected[data-uses-higher-temp]')]
            .map(cell => cell.getAttribute('title')).filter(Boolean))];
    } else {
        const records = reportFallbackRecords.get(source.tBodies[0]?.id);
        if (records?.size) lines = reportFallbackDetails(records);
    }
    if (!lines.length) return;
    const width = Math.max(1, ...buildTableGrid(copy, 'tr').map(row => row.length));
    const tfoot = copy.tFoot || copy.createTFoot();
    const row = tfoot.insertRow();
    const cell = row.insertCell();
    cell.colSpan = width;
    cell.style.cssText = 'border:1px solid #000;padding:6pt;color:#000;background:#fff;text-align:left;white-space:normal;font-size:10pt;';
    cell.textContent = `${REPORT_FALLBACK_LEGEND} Підстановки: ${lines.join('; ')}.`;
}

function renderReportHeader() {
    const thead1 = document.getElementById('reportTableHeader');
    const thead2 = document.getElementById('reportStressTableHeader');
    
    let htmlBase1 = `
        <th class="sticky-col-header first-col pt-4 pb-3 px-4 font-semibold text-left w-[240px] min-w-[240px] max-w-[240px] border-r border-slate-200 dark:border-slate-700 align-bottom">Матеріал</th>
        <th class="sticky-col-header pt-4 pb-3 px-4 font-semibold text-left w-[350px] min-w-[350px] max-w-[350px] border-r border-slate-200 dark:border-slate-700 align-bottom">Характеристика \\ Т, °С</th>
    `;

    let htmlBase2 = `
        <th rowspan="2" class="sticky-col-header first-col pt-4 pb-3 px-4 font-semibold text-left w-[240px] min-w-[240px] max-w-[240px] border-r border-slate-200 dark:border-slate-700 z-30 align-bottom">Матеріал</th>
        <th rowspan="2" class="sticky-col-header pt-4 pb-3 px-4 font-semibold text-center min-w-[120px] max-w-[160px] border-r border-slate-200 dark:border-slate-700 align-bottom">Найменування елемента</th>
        <th rowspan="2" class="sticky-col-header pt-4 pb-3 px-4 font-semibold text-left min-w-[120px] border-r border-slate-200 dark:border-slate-700 align-bottom">Характеристика \\ Т, °С</th>
    `;

    let groupHtml = '';
    if (reportTemperatures.length > 0) {
        groupHtml += `<th class="py-2 px-2 font-bold text-center border-b border-r border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider">ГВ</th>`;
    }
    if (reportTemperatures.length > 1) {
        groupHtml += `<th colspan="${reportTemperatures.length - 1}" class="py-2 px-2 font-bold text-center border-b border-slate-200 dark:border-slate-700 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] uppercase tracking-widest">НУЕ</th>`;
    }

    let addBtnHtml1 = `
        <th class="py-3 px-2 text-center min-w-[50px] border-b border-slate-200 dark:border-slate-700 align-middle">
            <button onclick="addReportTemp()" class="text-brand-500 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 p-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto" title="Додати стовпець температури">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"></path></svg>
            </button>
        </th>
    `;

    let addBtnHtml2 = `
        <th rowspan="2" class="py-3 px-2 text-center min-w-[50px] border-b border-slate-200 dark:border-slate-700 align-middle">
            <button onclick="addReportTemp()" class="text-brand-500 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 p-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto" title="Додати стовпець температури">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"></path></svg>
            </button>
        </th>
    `;

    let tempsHtml1 = '';
    let tempsHtml2 = '';

    reportTemperatures.forEach((t, index) => {
        let optionsHtml = temperatures.map(temp => 
            `<option value="${temp}" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" ${temp === t ? 'selected' : ''}>${temp}</option>`
        ).join('');

        const isGv = index === 0;

        tempsHtml1 += `
            <th class="py-2.5 px-2 font-semibold text-center min-w-[90px] group border-b border-slate-200 dark:border-slate-700 align-middle">
                <div class="relative inline-block w-full">
                    <select onchange="updateReportTemp(${index}, this.value)" class="text-center w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 focus:border-brand-500 outline-none transition-colors text-slate-700 dark:text-slate-200 cursor-pointer font-semibold appearance-none" style="text-align-last: center;" title="Змінити температуру">
                        ${optionsHtml}
                    </select>
                    <button onclick="removeReportTemp(${index})" class="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 rounded transition-all" title="Видалити стовпець">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </th>
        `;

        tempsHtml2 += `
            <th class="py-2.5 px-2 font-semibold text-center min-w-[90px] group border-b border-slate-200 dark:border-slate-700 align-middle">
                <div class="relative inline-block w-full">
                    <select onchange="updateReportTemp(${index}, this.value)" class="text-center w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 text-slate-700 dark:text-slate-200 outline-none transition-colors cursor-pointer font-semibold appearance-none" style="text-align-last: center;" title="Змінити температуру">
                        ${optionsHtml}
                    </select>
                    <button onclick="removeReportTemp(${index})" class="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 rounded transition-all" title="Видалити стовпець">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </th>
        `;
    });

    thead1.innerHTML = `
        <tr>${htmlBase1}${tempsHtml1}${addBtnHtml1}</tr>
    `;
    thead2.innerHTML = `
        <tr>${htmlBase2}${groupHtml}${addBtnHtml2}</tr>
        <tr>${tempsHtml2}</tr>
    `;
}

window.updateReportTemp = function(index, val) {
    let num = parseFloat(val);
    if (!isNaN(num)) {
        reportTemperatures[index] = num;
        saveToLocalStorage();
        renderReportTable();
        renderReportTableEquip();
    }
};

window.addReportTemp = function() {
    let lastT = reportTemperatures[reportTemperatures.length - 1] || 100;
    let nextTIndex = temperatures.indexOf(lastT) + 1;
    let nextT = temperatures[nextTIndex];
    
    if (nextT === undefined) {
        nextT = temperatures[temperatures.length - 1];
    }
    
    reportTemperatures.push(nextT);
    saveToLocalStorage();
    renderReportTable();
    renderReportTableEquip();
};

window.removeReportTemp = function(index) {
    if (reportTemperatures.length <= 1) {
        showToast('Залиште хоча б один температурний стовпець.', 'warning');
        return;
    }
    reportTemperatures.splice(index, 1);
    saveToLocalStorage();
    renderReportTable();
    renderReportTableEquip();
};

function renderReportTable() {
    renderReportHeader(); 
    renderReportStressTable(); 
    
    const tbody = document.getElementById('reportTableBody');
    // Clear any explanation left from an earlier view before recalculating.
    reportFallbackRecords.delete(tbody.id);
    const oldExplanation = tbody.closest('.table-container')?.parentElement?.querySelector(':scope > .report-fallback-explanation');
    if (oldExplanation) oldExplanation.classList.add('hidden');
    if (reportMaterials.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${reportTemperatures.length + 3}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку, щоб сформувати таблицю</td></tr>`;
        return;
    }

    let html = '';
    const fallbackRecords = new Map();
    
    const reportProps = propertiesList.filter(p => p.key === 'RTm' || p.key === 'RTp');

    reportMaterials.forEach((item, index) => {
        const material = appMaterials[item.matIndex];
        const grade = material.grades[item.kpIndex];
        const data = grade.data;

        reportProps.forEach((prop, pIdx) => {
            const rowClass = pIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50';
            html += `<tr class="hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-colors ${rowClass}">`;
            
            if (pIdx === 0) {
                html += `<td rowspan="2" class="sticky-col bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 w-[240px] min-w-[240px] max-w-[240px]">
                    <span data-report-number aria-hidden="true">${index + 1}. </span>${escapeHTML(item.matName)}<br>
                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words whitespace-normal">${escapeHTML(getReportKpName(item))}</span>
                </td>`;
            }

            html += `<td class="py-2.5 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 w-[350px] min-w-[350px] max-w-[350px]">
                    ${prop.name} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                </td>`;

            const propData = data[prop.key];
            reportTemperatures.forEach((t, tIdx) => {
                const info = getNearestHigherValueInfo(propData, t);
                const value = info.value;
                addReportFallbackRecord(fallbackRecords, item, prop.key, t, info);
                const fallbackTitle = getReportFallbackTitle(t, [[prop.key, info]]);
                const safeValue = formatReportPropertyValue(value);
                const displayValue = safeValue === '—' 
                    ? `<span class="text-slate-300 dark:text-slate-600">—</span>` 
                    : `<span class="font-semibold text-slate-700 dark:text-slate-200">${safeValue}${reportFallbackMarker(fallbackTitle)}</span>`;
                
                html += `<td class="py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"${reportFallbackCellAttrs(fallbackTitle)}>${displayValue}</td>`;
            });
            
            html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
            
            html += `</tr>`;
        });
    });
    tbody.innerHTML = html;
    updateReportFallbackExplanation(tbody, fallbackRecords);
}

function renderReportStressTable() {
    const tbody = document.getElementById('reportStressTableBody');
    // Clear any explanation left from an earlier view before recalculating.
    reportFallbackRecords.delete(tbody.id);
    const oldExplanation = tbody.closest('.table-container')?.parentElement?.querySelector(':scope > .report-fallback-explanation');
    if (oldExplanation) oldExplanation.classList.add('hidden');
    if (!tbody) return;

    if (reportMaterials.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${reportTemperatures.length + 4}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку, щоб сформувати таблицю</td></tr>`;
        return;
    }

    const coefs = validateCoefficients();
    if (!coefs.valid) {
        tbody.innerHTML = `<tr><td colspan="${reportTemperatures.length + 4}" class="p-6 text-center bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold border-2 border-dashed border-rose-300 dark:border-rose-800 rounded-xl">⚠ Розрахунок напружень заблоковано: введено некоректні коефіцієнти (${coefs.errors.map(escapeHTML).join('; ')}). Коефіцієнти мають бути додатними скінченними числами (> 0).</td></tr>`;
        return;
    }

    let html = '';
    const fallbackRecords = new Map();
    
    const nm = coefs.values.calcNm;
    const nt = coefs.values.calcNt;
    const ntBolt = coefs.values.calcNtBolt;
    
    const isReportDevMode = document.getElementById('reportDevModeToggle')?.checked || false;

    reportMaterials.forEach((item, index) => {
        const material = appMaterials[item.matIndex];
        const grade = material.grades[item.kpIndex];
        const data = grade.data;
        const isBrittle = isBrittleMaterial(material);

        let totalRows = 0;
        let elementGroups = [];

        const itemElements = (item.elements && Array.isArray(item.elements) && item.elements.length > 0)
            ? item.elements
            : ["Фланець", "Шпильки", "Різьба"];

        if (itemElements.includes("Фланець")) {
            let props = [
                { name: "Допуст. напруження", symbol: "(&sigma;)<sub>2</sub>", units: "МПа", key: "flange_s2" },
                ...(!isBrittle ? [{ name: "Допуст. напруження", symbol: "(&sigma;)<sub>RV</sub>", units: "МПа", key: "flange_srv" }] : [])
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

        let isFirstMatRow = true;

        elementGroups.forEach((group) => {
            group.props.forEach((prop, pIdx) => {
                const rowClass = pIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50';
                html += `<tr class="hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-colors ${rowClass}">`;
                
                if (isFirstMatRow) {
                    html += `<td rowspan="${totalRows}" class="sticky-col bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 w-[240px] min-w-[240px] max-w-[240px]">
                        <span data-report-number aria-hidden="true">${index + 1}. </span>${escapeHTML(item.matName)}<br>
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words whitespace-normal">${escapeHTML(getReportKpName(item))}</span>
                    </td>`;
                    isFirstMatRow = false;
                }

                if (pIdx === 0) {
                    html += `<td rowspan="${group.props.length}" class="bg-indigo-50/30 dark:bg-indigo-900/10 py-2.5 px-4 text-sm font-bold text-indigo-700 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 whitespace-normal break-words text-center shadow-inner">
                        ${group.elName}
                    </td>`;
                }

                html += `<td class="py-2.5 px-4 text-sm border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700">
                        <span class="inline-block text-slate-400 dark:text-slate-500 font-normal bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                    </td>`;

                reportTemperatures.forEach((t, tIdx) => {
                    const isGv = tIdx === 0;
                    const rtmInfo = getNearestHigherValueInfo(data['RTm'], t);
                    const rtpInfo = getNearestHigherValueInfo(data['RTp'], t);
                    const rtm = rtmInfo.value;
                    const rtp = rtpInfo.value;

                    let val = "—";
                    let formula = "";
                    
                    // For brittle materials ONLY the explicitly implemented flange σ₂
                    // under GV/NUE is available; other plastic-material paths are blocked.
                    if (isBrittle && prop.key === 'flange_s2') {
                        const brittleSigma = brittleFlangeStress(rtm, isGv);
                        if (brittleSigma !== null) {
                            val = roundExcel(brittleSigma, 2);
                            formula = brittleFlangeFormula(isGv);
                        }
                    } else if (getPlasticBaseStress(material, rtm, rtp, nm, nt) !== null) {
                        let sigma = getPlasticBaseStress(material, rtm, rtp, nm, nt);
                        let sigmaW = getBoltBaseStress(material, rtp, ntBolt);

                        if (isGv) {
                            switch (prop.key) {
                                case "flange_s2": val = roundExcel(sigma * PNAE_COEFS.gv_s2, 2); formula = `[σ]<sub>ГВ</sub> &times; ${PNAE_COEFS.gv_s2}`; break;
                                case "flange_srv": val = "—"; break;
                                case "bolt_s1": val = roundExcel(rtp * PNAE_COEFS.bolt_gv_rtp_mult, 2); formula = `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; ${PNAE_COEFS.bolt_gv_rtp_mult}`; break;
                                case "bolt_s3w": val = "—"; break;
                                case "bolt_s4w": val = "—"; break;
                                case "bolt_tau_sw": val = roundExcel(sigmaW * PNAE_COEFS.bolt_tau_sw, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_tau_sw}`; break;
                                case "thread_dash": val = roundExcel(rtp * PNAE_COEFS.thread_gv, 2); formula = `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; ${PNAE_COEFS.thread_gv}`; break;
                            }
                        } else {
                            switch (prop.key) {
                                case "flange_s2": val = roundExcel(sigma * PNAE_COEFS.s2_nue, 2); formula = `[σ] &times; ${PNAE_COEFS.s2_nue}`; break;
                                case "flange_srv": val = roundExcel(Math.min((2.5 - (rtp / rtm)) * rtp, 2 * rtp), 2); formula = `min((2.5-R<sup>T</sup><sub>p0,2</sub>/R<sup>T</sup><sub>m</sub>)R<sup>T</sup><sub>p0,2</sub>, 2R<sup>T</sup><sub>p0,2</sub>)`; break;
                                case "bolt_s1": val = roundExcel(sigmaW * 1.0, 2); formula = `[σ]<sub>w</sub>`; break;
                                case "bolt_s3w": val = roundExcel(sigmaW * PNAE_COEFS.bolt_s3w_nue, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s3w_nue}`; break;
                                case "bolt_s4w": val = roundExcel(sigmaW * PNAE_COEFS.bolt_s4w_nue, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s4w_nue}`; break;
                                case "bolt_tau_sw": val = roundExcel(sigmaW * PNAE_COEFS.bolt_tau_sw, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_tau_sw}`; break;
                                case "thread_dash": val = roundExcel(rtp * PNAE_COEFS.thread_nue, 2); formula = `R<sup>T</sup><sub>p0,2</sub> &times; ${PNAE_COEFS.thread_nue}`; break;
                            }
                        }
                    } else if (!isBrittle && getBoltBaseStress(material, rtp, ntBolt) !== null) {
                         let sigmaW = getBoltBaseStress(material, rtp, ntBolt);
                         if (isGv) {
                            switch (prop.key) {
                                case "bolt_s1": val = roundExcel(rtp * PNAE_COEFS.bolt_gv_rtp_mult, 2); formula = `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; ${PNAE_COEFS.bolt_gv_rtp_mult}`; break;
                                case "bolt_tau_sw": val = roundExcel(sigmaW * PNAE_COEFS.bolt_tau_sw, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_tau_sw}`; break;
                                case "thread_dash": val = roundExcel(rtp * PNAE_COEFS.thread_gv, 2); formula = `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; ${PNAE_COEFS.thread_gv}`; break;
                            }
                         } else {
                            switch (prop.key) {
                                case "bolt_s1": val = roundExcel(sigmaW * 1.0, 2); formula = `[σ]<sub>w</sub>`; break;
                                case "bolt_s3w": val = roundExcel(sigmaW * PNAE_COEFS.bolt_s3w_nue, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s3w_nue}`; break;
                                case "bolt_s4w": val = roundExcel(sigmaW * PNAE_COEFS.bolt_s4w_nue, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s4w_nue}`; break;
                                case "bolt_tau_sw": val = roundExcel(sigmaW * PNAE_COEFS.bolt_tau_sw, 2); formula = `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_tau_sw}`; break;
                                case "thread_dash": val = roundExcel(rtp * PNAE_COEFS.thread_nue, 2); formula = `R<sup>T</sup><sub>p0,2</sub> &times; ${PNAE_COEFS.thread_nue}`; break;
                            }
                         }
                    }

                    // A marked calculated stress depends on substituted *source* properties.
                    const stressDependencies = isBrittle && prop.key === 'flange_s2'
                        ? [['RTm', rtmInfo]]
                        : prop.key.startsWith('flange_')
                            ? [['RTm', rtmInfo], ['RTp', rtpInfo]]
                            : [['RTp', rtpInfo]];
                    const fallbackTitle = val === '—' ? '' : getReportFallbackTitle(t, stressDependencies);
                    if (val !== '—') {
                        stressDependencies.forEach(([key, info]) => addReportFallbackRecord(fallbackRecords, item, key, t, info));
                    }

                    let displayValue = "";
                    if (val === "—") {
                        displayValue = `<span class="text-slate-300 dark:text-slate-600">—</span>`;
                    } else {
                        let valStr = String(val).replace('.', ',');
                        if (isReportDevMode && formula !== "") {
                            const wrappedFormula = wrapFormulaVars(formula);
                            displayValue = `
                                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-1 leading-tight whitespace-nowrap tracking-tight font-medium">${wrappedFormula}</div>
                                <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${valStr}${reportFallbackMarker(fallbackTitle)}</div>
                            `;
                        } else {
                            displayValue = `<span class="font-bold text-slate-800 dark:text-slate-200">${valStr}${reportFallbackMarker(fallbackTitle)}</span>`;
                        }
                    }
                        
                    const bgClass = '';
                    
                    html += `<td class="${bgClass} py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"${reportFallbackCellAttrs(fallbackTitle)}>${displayValue}</td>`;
                });
                
                html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
                
                html += `</tr>`;
            });
        });
    });
    tbody.innerHTML = html;
    updateReportFallbackExplanation(tbody, fallbackRecords);
}

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

function toggleFavorite() {
    const matIndex = el.mat.value;
    if(matIndex === "") return;
    const matName = appMaterials[matIndex].name;
    
    const idx = favoriteMaterials.indexOf(matName);
    if (idx > -1) favoriteMaterials.splice(idx, 1);
    else favoriteMaterials.push(matName);
    
    saveToLocalStorage();
    updateFavoriteIcon();
    
    const currentKp = el.kp.value;
    updateMaterialList(el.search.value);
    el.mat.value = matIndex;
    updateKpList();
    el.kp.value = currentKp;
    syncKpPicker();
}

function updateFavoriteIcon() {
    const matIndex = el.mat.value;
    const btnFav = document.getElementById('btnFavorite');
    if(matIndex === "") { btnFav.classList.remove('text-amber-400'); btnFav.classList.add('text-slate-300'); return; }
    
    const matName = appMaterials[matIndex].name;
    if (favoriteMaterials.includes(matName)) {
        btnFav.classList.add('text-amber-400');
        btnFav.classList.remove('text-slate-300');
        btnFav.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    } else {
        btnFav.classList.remove('text-amber-400');
        btnFav.classList.add('text-slate-300');
        btnFav.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
}

function updateMaterialList(filterText = '') {
    el.mat.innerHTML = '';
    const lowerFilter = canonicalMaterialKey(filterText);
    
    let favOptions = [];
    let otherOptions = [];

    appMaterials.forEach((mat, index) => {
        if (canonicalMaterialKey(mat.name).includes(lowerFilter)) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = mat.name;
            
            if(favoriteMaterials.includes(mat.name)) {
                option.textContent = "★ " + mat.name;
                favOptions.push(option);
            } else {
                otherOptions.push(option);
            }
        }
    });

    if (favOptions.length > 0) {
        const favGroup = document.createElement('optgroup');
        favGroup.label = "Вибране";
        favOptions.forEach(opt => favGroup.appendChild(opt));
        el.mat.appendChild(favGroup);
    }
    if (otherOptions.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = "Всі матеріали";
        otherOptions.forEach(opt => otherGroup.appendChild(opt));
        el.mat.appendChild(otherGroup);
    }

    if (favOptions.length > 0 || otherOptions.length > 0) {
        el.mat.disabled = false;
        el.kp.disabled = false;
        toggleEmptyState(false);
        updateKpList();
    } else {
        el.mat.innerHTML = '<option disabled selected>Не знайдено</option>';
        el.kp.innerHTML = '<option disabled selected>—</option>';
        el.mat.disabled = true;
        el.kp.disabled = true;
        syncKpPicker();
        el.tBody.innerHTML = '';
        toggleEmptyState(true);
    }
}

function renameGradeDescriptionPrefix(description, oldName, newName) {
    if (typeof description !== 'string' || oldName === newName) return description;
    if (description.slice(0, oldName.length).toLowerCase() !== oldName.toLowerCase()) return description;
    const rest = description.slice(oldName.length);
    // Replace only a complete leading material name (not e.g. 45 inside 450).
    return !rest || /^[\s.,;:()\-]/.test(rest) ? newName + rest : description;
}

function formatDescription(matName, desc) {
    if (!desc) return 'Не вказано';
    const cleanMatName = matName.replace(" (Демо)", "").replace(" (Копія)", "").trim();
    if (desc.toLowerCase().startsWith(cleanMatName.toLowerCase())) {
        desc = desc.substring(cleanMatName.length).replace(/^[.,\-;\s]+/, '').trim();
    }
    // Remove trailing (КП <number>) or similar
    desc = desc.replace(/,?\s*\(\s*КП\s*\d+\s*\)\s*$/, '').trim();
    if (desc.length > 0) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    return desc || 'Не вказано';
}

function getReportKpName(item) {
    const material = appMaterials[item.matIndex];
    if (!material) return item.kpName || 'Без КП';
    const grade = material.grades[item.kpIndex];
    if (!grade) return item.kpName || 'Без КП';
    const cleanDesc = formatDescription(material.name, grade.description);
    return grade.kp ? (cleanDesc !== 'Не вказано' ? `КП ${grade.kp} (${cleanDesc})` : `КП ${grade.kp}`) : 'Без КП';
}

// Адаптивний вибір КП. Оригінальний select залишається джерелом значення
// для наявних розрахунків, звітів, збереження та обробників подій.
let kpPicker = null;

function initKpPicker() {
    const select = el.kp;
    const wrapper = document.createElement('div');
    wrapper.className = 'kp-picker';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add('kp-native-hidden');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'kpPickerButton';
    trigger.className = 'kp-picker-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'kpPickerOptions');
    const label = document.createElement('span');
    label.className = 'kp-picker-value';
    trigger.appendChild(label);
    trigger.insertAdjacentHTML('beforeend', '<svg class="kp-picker-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
    wrapper.appendChild(trigger);

    // Портал у body: список не обрізається прокручуваною боковою панеллю.
    const popup = document.createElement('div');
    popup.id = 'kpPickerOptions';
    popup.className = 'kp-picker-options';
    popup.setAttribute('role', 'listbox');
    popup.setAttribute('aria-label', 'Категорія міцності');
    popup.hidden = true;
    document.body.appendChild(popup);
    kpPicker = { trigger, label, popup };

    const pickerLabel = document.querySelector('label[for="kpSelect"]');
    if (pickerLabel) pickerLabel.htmlFor = trigger.id;

    trigger.addEventListener('click', () => {
        if (trigger.disabled) return;
        if (popup.hidden) openKpPicker();
        else closeKpPicker();
    });
    trigger.addEventListener('keydown', (event) => {
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            if (popup.hidden) openKpPicker();
            const options = Array.from(popup.querySelectorAll('.kp-picker-option'));
            if (!options.length) return;
            const chosen = event.key === 'End' ? options.length - 1 :
                event.key === 'Home' ? 0 :
                Math.max(0, options.findIndex(btn => btn.dataset.value === select.value));
            options[chosen].focus({ preventScroll: true });
            options[chosen].scrollIntoView({ block: 'nearest' });
        }
    });
    popup.addEventListener('keydown', (event) => {
        const buttons = Array.from(popup.querySelectorAll('.kp-picker-option'));
        const index = buttons.indexOf(document.activeElement);
        let next;
        if (event.key === 'ArrowDown') next = Math.min(index + 1, buttons.length - 1);
        else if (event.key === 'ArrowUp') next = Math.max(index - 1, 0);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        if (buttons[next]) {
            event.preventDefault();
            buttons[next].focus({ preventScroll: true });
            buttons[next].scrollIntoView({ block: 'nearest' });
        }
    });
    document.addEventListener('pointerdown', (event) => {
        if (!popup.hidden && !trigger.contains(event.target) && !popup.contains(event.target)) closeKpPicker();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !popup.hidden) {
            closeKpPicker();
            trigger.focus({ preventScroll: true });
        }
    });
    document.addEventListener('scroll', (event) => {
        if (!popup.hidden && !popup.contains(event.target)) closeKpPicker();
    }, true);
    window.addEventListener('resize', closeKpPicker);
    select.addEventListener('change', syncKpPicker);
    syncKpPicker();
}

function renderKpPickerOptions() {
    if (!kpPicker) return;
    const { popup } = kpPicker;
    popup.replaceChildren();
    Array.from(el.kp.options).forEach(option => {
        if (option.disabled || !option.hasAttribute('value')) return;
        const fullLabel = option.textContent;
        const split = fullLabel.indexOf(' (');
        const title = split >= 0 && fullLabel.endsWith(')') ? fullLabel.slice(0, split) : fullLabel;
        const description = split >= 0 && fullLabel.endsWith(')') ? fullLabel.slice(split + 2, -1) : '';
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'kp-picker-option';
        item.setAttribute('role', 'option');
        item.dataset.value = option.value;
        item.setAttribute('aria-selected', String(option.selected));
        if (option.selected) item.classList.add('kp-picker-option-selected');
        const heading = document.createElement('span');
        heading.className = 'kp-picker-option-title';
        heading.textContent = title;
        item.appendChild(heading);
        if (description) {
            const descriptionSpan = document.createElement('span');
            descriptionSpan.className = 'kp-picker-option-description';
            descriptionSpan.textContent = description;
            item.appendChild(descriptionSpan);
        }
        item.addEventListener('click', () => {
            el.kp.value = option.value;
            el.kp.dispatchEvent(new Event('change', { bubbles: true }));
            closeKpPicker();
            kpPicker.trigger.focus({ preventScroll: true });
        });
        popup.appendChild(item);
    });
}

function positionKpPicker() {
    if (!kpPicker || kpPicker.popup.hidden) return;
    const { popup, trigger } = kpPicker;
    const rect = trigger.getBoundingClientRect();
    const edge = 8;
    const gap = 6;
    const width = Math.min(window.innerWidth - edge * 2, Math.max(rect.width, 460));
    const left = Math.max(edge, Math.min(rect.left, window.innerWidth - edge - width));
    const below = window.innerHeight - rect.bottom - edge - gap;
    const above = rect.top - edge - gap;
    const showAbove = below < 180 && above > below;
    const freeSpace = showAbove ? above : below;
    const height = Math.max(60, Math.min(360, freeSpace));
    popup.style.width = `${width}px`;
    popup.style.left = `${left}px`;
    popup.style.maxHeight = `${height}px`;
    popup.style.top = showAbove ? 'auto' : `${rect.bottom + gap}px`;
    popup.style.bottom = showAbove ? `${window.innerHeight - rect.top + gap}px` : 'auto';
}

function openKpPicker() {
    if (!kpPicker || kpPicker.trigger.disabled) return;
    renderKpPickerOptions();
    kpPicker.popup.hidden = false;
    kpPicker.trigger.setAttribute('aria-expanded', 'true');
    positionKpPicker();
}

function closeKpPicker() {
    if (!kpPicker) return;
    kpPicker.popup.hidden = true;
    kpPicker.trigger.setAttribute('aria-expanded', 'false');
}

function syncKpPicker() {
    if (!kpPicker) return;
    const selected = el.kp.selectedOptions[0];
    const value = selected && !selected.disabled ? selected.textContent : '—';
    kpPicker.label.textContent = value;
    kpPicker.trigger.title = value;
    kpPicker.trigger.disabled = el.kp.disabled || !selected || selected.disabled;
    if (kpPicker.trigger.disabled) closeKpPicker();
    else if (!kpPicker.popup.hidden) {
        renderKpPickerOptions();
        positionKpPicker();
    }
}

function updateKpList() {
    el.kp.innerHTML = '';
    const matIndex = el.mat.value;
    if(!appMaterials[matIndex]) return;
    
    addToRecentViews(appMaterials[matIndex].name);
    
    appMaterials[matIndex].grades.forEach((grade, index) => {
        const option = document.createElement('option');
        option.value = index;
        
        let label = grade.kp ? `КП ${grade.kp}` : "Без КП";
        const cleanDesc = formatDescription(appMaterials[matIndex].name, grade.description);
        if (cleanDesc !== 'Не вказано') {
            label += ` (${cleanDesc})`;
        }
        
        option.textContent = label;
        el.kp.appendChild(option);
    });

    updateFavoriteIcon();
    syncKpPicker();
    updateAllViews();
}

function updateAllViews() {
    syncKpPicker();
    renderTable();
    updateCalculator();
    if(!document.getElementById('view-chart').classList.contains('hidden')) renderChart();
}

function renderTable() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    const material = appMaterials[matIndex];
    const grade = material.grades[kpIndex];
    const data = grade.data;

    el.title.textContent = material.name;
    const cleanDesc = formatDescription(material.name, grade.description);
    el.subtitle.textContent = `${grade.kp ? 'КП '+grade.kp : 'Не вказана'} | ${cleanDesc}${isBrittleMaterial(material) ? ' | Крихкий матеріал' : ''}`;

    let tbodyHtml = '';
    propertiesList.forEach((prop, index) => {
        const rowClass = index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900';
        
        tbodyHtml += `<tr class="hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${rowClass}">
            <td class="sticky-col bg-inherit py-3.5 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                ${prop.name} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">${prop.symbol}, ${prop.units}</span>
            </td>`;

        const propData = data[prop.key];
        temperatures.forEach(t => {
            let value = propData && propData[t] !== undefined && propData[t] !== null && propData[t] !== '' ? propData[t] : '—';
            
            // Застосовуємо форматування до 2 знаків після коми для густини, коефіцієнта розширення та Пуассона
            if (value !== '—') {
                value = formatPropertyValue(prop.key, value);
            }
            
            let safeValue = escapeHTML(String(value));
            if (safeValue !== '—') safeValue = safeValue.replace('.', ',');
            const displayValue = safeValue === '—' 
                ? `<span class="text-slate-300 dark:text-slate-600">—</span>` 
                : `<span class="font-semibold text-slate-700 dark:text-slate-200">${safeValue}</span>`;
            tbodyHtml += `<td data-temp-col="${t}" class="py-3.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50 transition-colors duration-200">${displayValue}</td>`;
        });
        tbodyHtml += `</tr>`;
    });
    el.tBody.innerHTML = tbodyHtml;
}

function applyChartVisualTheme(chart, isDark) {
    if (!chart) return;
    const gridColor = isDark ? 'rgba(100, 116, 139, 0.22)' : 'rgba(148, 163, 184, 0.28)';
    const borderColor = isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(71, 85, 105, 0.7)';
    const tickColor = isDark ? '#cbd5e1' : '#475569';
    const titleColor = isDark ? '#e2e8f0' : '#334155';

    chart.options.plugins.legend.labels.color = tickColor;
    chart.options.plugins.legend.labels.font = { family: 'Inter', size: 13, weight: '600' };
    chart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : 'rgba(255,255,255,0.96)';
    chart.options.plugins.tooltip.titleColor = isDark ? '#f8fafc' : '#0f172a';
    chart.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#334155';
    chart.options.plugins.tooltip.borderColor = isDark ? '#475569' : '#cbd5e1';

    const commonAxis = {
        grid: {
            color: gridColor,
            lineWidth: 1.2,
            drawTicks: true,
            tickLength: 6
        },
        border: {
            display: true,
            color: borderColor,
            width: 2
        },
        ticks: {
            color: tickColor,
            padding: 8,
            font: { family: 'Inter', size: 12, weight: '600' }
        }
    };

    chart.options.scales.x.title = {
        display: true,
        text: 'Температура, °C',
        color: titleColor,
        padding: { top: 14 },
        font: { family: 'Inter', size: 14, weight: '700' }
    };
    chart.options.scales.x.grid = { ...commonAxis.grid, drawOnChartArea: true };
    chart.options.scales.x.border = { ...commonAxis.border };
    chart.options.scales.x.ticks = { ...commonAxis.ticks };

    chart.options.scales.y.title = {
        display: true,
        text: 'Напруження, МПа',
        color: titleColor,
        padding: { bottom: 10 },
        font: { family: 'Inter', size: 14, weight: '700' }
    };
    chart.options.scales.y.grid = { ...commonAxis.grid, drawOnChartArea: true };
    chart.options.scales.y.border = { ...commonAxis.border };
    chart.options.scales.y.ticks = { ...commonAxis.ticks };
}

function updateChartTheme() {
    if (typeof Chart === 'undefined' || !chartInstance) return;
    const isDark = document.documentElement.classList.contains('dark');
    applyChartVisualTheme(chartInstance, isDark);
    chartInstance.update();
}

function renderChart() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    const warningEl = document.getElementById('chart-warning');
    const canvasEl = document.getElementById('matChart');
    const noDataEl = document.getElementById('chart-no-data');
    const offlineFallbackEl = document.getElementById('chart-offline-fallback');

    if (typeof Chart === 'undefined') {
        if (warningEl) warningEl.classList.add('hidden');
        if (canvasEl) canvasEl.classList.add('hidden');
        if (noDataEl) noDataEl.classList.add('hidden');
        if (offlineFallbackEl) offlineFallbackEl.classList.remove('hidden');
        return;
    }
    if (offlineFallbackEl) offlineFallbackEl.classList.add('hidden');

    const data = appMaterials[matIndex].grades[kpIndex].data;
    const isDark = document.documentElement.classList.contains('dark');

    let rtmData = [];
    let rtpData = [];
    let validTemps = [];

    temperatures.forEach(t => {
        let m = data["RTm"]?.[t];
        let p = data["RTp"]?.[t];
        validTemps.push(t);
        rtmData.push(Number.isFinite(Number(m)) && m !== '—' && m !== '' && m != null ? Number(m) : null);
        rtpData.push(Number.isFinite(Number(p)) && p !== '—' && p !== '' && p != null ? Number(p) : null);
    });

    const existingPoints = rtmData.filter(v => v !== null).length + rtpData.filter(v => v !== null).length;
    // Keep internal missing temperatures to show gaps, but avoid drawing a long empty tail.
    let lastMeasured = -1;
    for (let i = 0; i < validTemps.length; i++) {
        if (rtmData[i] !== null || rtpData[i] !== null) lastMeasured = i;
    }
    validTemps = validTemps.slice(0, lastMeasured + 1);
    rtmData = rtmData.slice(0, lastMeasured + 1);
    rtpData = rtpData.slice(0, lastMeasured + 1);
    if (existingPoints === 0) {
        if (warningEl) warningEl.classList.add('hidden');
        if (canvasEl) canvasEl.classList.add('hidden');
        if (noDataEl) noDataEl.classList.remove('hidden');
        return;
    } else {
        if (canvasEl) canvasEl.classList.remove('hidden');
        if (noDataEl) noDataEl.classList.add('hidden');
        
        if (existingPoints < 3) {
            if (warningEl) warningEl.classList.remove('hidden');
        } else {
            if (warningEl) warningEl.classList.add('hidden');
        }
    }

    if (chartInstance) {
        chartInstance.data.labels = validTemps;
        chartInstance.data.datasets[0].data = rtmData;
        chartInstance.data.datasets[0].tension = 0;
        chartInstance.data.datasets[1].data = rtpData;
        chartInstance.data.datasets[1].tension = 0;
        
        applyChartVisualTheme(chartInstance, isDark);
        chartInstance.update();
    } else {
        const ctx = document.getElementById('matChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: validTemps,
                datasets: [
                    {
                        label: 'Тимчасовий опір (Rₘ), МПа',
                        data: rtmData,
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0,
                        spanGaps: false
                    },
                    {
                        label: 'Межа текучості (Rₚ₀,₂), МПа',
                        data: rtpData,
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0,
                        spanGaps: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', labels: { color: isDark ? '#cbd5e1' : '#475569', font: { family: 'Inter', size: 13, weight: '600' }, boxWidth: 34, boxHeight: 10, padding: 16 } },
                    tooltip: { backgroundColor: isDark ? '#1e293b' : 'rgba(255,255,255,0.96)', titleColor: isDark ? '#f8fafc' : '#0f172a', bodyColor: isDark ? '#cbd5e1' : '#334155', borderColor: isDark ? '#475569' : '#cbd5e1', borderWidth: 1 }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Температура, °C', color: isDark ? '#e2e8f0' : '#334155', font: { family: 'Inter', size: 14, weight: '700' }, padding: { top: 14 } },
                        grid: { color: isDark ? 'rgba(100, 116, 139, 0.22)' : 'rgba(148, 163, 184, 0.28)', lineWidth: 1.2, drawTicks: true, tickLength: 6 },
                        border: { display: true, color: isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(71, 85, 105, 0.7)', width: 2 },
                        ticks: { color: isDark ? '#cbd5e1' : '#475569', font: { family: 'Inter', size: 12, weight: '600' }, padding: 8 }
                    },
                    y: {
                        title: { display: true, text: 'Напруження, МПа', color: isDark ? '#e2e8f0' : '#334155', font: { family: 'Inter', size: 14, weight: '700' }, padding: { bottom: 10 } },
                        grid: { color: isDark ? 'rgba(100, 116, 139, 0.22)' : 'rgba(148, 163, 184, 0.28)', lineWidth: 1.2, drawTicks: true, tickLength: 6 },
                        border: { display: true, color: isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(71, 85, 105, 0.7)', width: 2 },
                        ticks: { color: isDark ? '#cbd5e1' : '#475569', font: { family: 'Inter', size: 12, weight: '600' }, padding: 8 },
                        beginAtZero: false
                    }
                }
            }
        });
    }
}

function getStepValue(targetT, xArray, yArray) {
    let validPoints = [];
    for (let i = 0; i < xArray.length; i++) {
        let yVal = yArray[i];
        if (yVal !== undefined && yVal !== null && yVal !== "—" && !isNaN(yVal)) {
            validPoints.push({x: xArray[i], y: parseFloat(yVal)});
        }
    }
    if (validPoints.length === 0) return null;
    for (let p of validPoints) {
        if (p.x >= targetT) return p.y;
    }
    return null;
}

function getStepTemperature(targetT, xArray, yArray) {
    let validPoints = [];
    for (let i = 0; i < xArray.length; i++) {
        let yVal = yArray[i];
        if (yVal !== undefined && yVal !== null && yVal !== "—" && !isNaN(yVal)) {
            validPoints.push({x: xArray[i], y: parseFloat(yVal)});
        }
    }
    if (validPoints.length === 0) return null;
    for (let p of validPoints) {
        if (p.x >= targetT) return p.x;
    }
    return null;
}

function highlightActiveColumn(activeTemp) {
    document.querySelectorAll('[data-temp-col]').forEach(cell => {
        cell.classList.remove('active-temp-col', 'active-temp-col-header');
    });

    if (activeTemp === null || isNaN(activeTemp)) return;

    document.querySelectorAll(`[data-temp-col="${activeTemp}"]`).forEach(cell => {
        if (cell.tagName === 'TH') {
            cell.classList.add('active-temp-col-header');
        } else {
            cell.classList.add('active-temp-col');
        }
    });
}

const VAR_DEFINITIONS = {
    'R<sup>T</sup><sub>m</sub>': '<strong>R<sup>T</sup><sub>m</sub></strong>: Значення тимчасового опору для вибраної марки при даній температурі (з бази даних).',
    'R<sup>T</sup><sub>m(ГВ)</sub>': '<strong>R<sup>T</sup><sub>m(ГВ)</sub></strong>: Тимчасовий опір при температурі гідровипробувань.',
    'R<sup>T</sup><sub>p0,2</sub>': '<strong>R<sup>T</sup><sub>p0,2</sub></strong>: Межа текучості при робочій температурі (з бази даних).',
    'R<sup>T</sup><sub>p0,2(ГВ)</sub>': '<strong>R<sup>T</sup><sub>p0,2(ГВ)</sub></strong>: Межа текучості при температурі гідровипробувань.',
    'n<sub>m</sub>': '<strong>n<sub>m</sub></strong>: Коефіцієнт запасу міцності за тимчасовим опором (за ПНАЕ = 2.6).',
    'n<sub>0,2</sub>': '<strong>n<sub>0,2</sub></strong>: Коефіцієнт запасу міцності за межею текучості (за ПНАЕ = 1.5).',
    'n<sub>0,2(болти)</sub>': '<strong>n<sub>0,2(болти)</sub></strong>: Запас міцності для кріплення (за ПНАЕ = 2.0).',
    '&gamma;<sub>m</sub>': '<strong>&gamma;<sub>m</sub></strong>: Коефіцієнт надійності за матеріалом (за замовчуванням = 1.05).',
    '&gamma;<sub>c</sub>': '<strong>&gamma;<sub>c</sub></strong>: Коефіцієнт умов роботи (за замовчуванням = 1.0).',
    '&gamma;<sub>n(НУЕ)</sub>': '<strong>&gamma;<sub>n(НУЕ)</sub></strong>: Коефіцієнт надійності за призначенням для нормальних умов (1.25).',
    '&gamma;<sub>n(ПЗ)</sub>': '<strong>&gamma;<sub>n(ПЗ)</sub></strong>: Коефіцієнт надійності за призначенням для сейсмічності (1.05).',
    'R<sub>y</sub>': '<strong>R<sub>y</sub></strong>: Розрахунковий опір матеріалу для опорних конструкцій.',
    'R<sub>y(ГВ)</sub>': '<strong>R<sub>y(ГВ)</sub></strong>: Розрахунковий опір при температурі гідровипробувань.',
    '[σ]': '<strong>[σ]</strong>: Базове допустиме напруження для робочого стану конструкції.',
    '[σ]<sub>w</sub>': '<strong>[σ]<sub>w</sub></strong>: Базове допустиме напруження для шпильок/болтів.',
    '[σ]<sub>ГВ</sub>': '<strong>[σ]<sub>ГВ</sub></strong>: Базове допустиме напруження в режимі гідровипробувань.'
};

function wrapFormulaVars(formulaStr) {
    if (!formulaStr) return formulaStr;
    let res = formulaStr;
    
    for (let key in VAR_DEFINITIONS) {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        const tooltipHtml = `<span class="formula-var">${key}<span class="formula-tooltip">${VAR_DEFINITIONS[key]}</span></span>`;
        res = res.replace(regex, tooltipHtml);
    }
    return res;
}

let recentViews = [];

function addToRecentViews(matName) {
    if (!matName) return;
    const cleanName = matName.replace('★ ', '').trim();
    
    const idx = recentViews.indexOf(cleanName);
    if (idx > -1) {
        recentViews.splice(idx, 1);
    }
    
    recentViews.unshift(cleanName);
    
    if (recentViews.length > 5) {
        recentViews.pop();
    }
    
    renderRecentViews();
}

function renderRecentViews() {
    const wrapper = document.getElementById('recentMaterialsWrapper');
    const container = document.getElementById('recentMaterialsList');
    if (!wrapper || !container) return;
    
    if (recentViews.length === 0) {
        wrapper.classList.add('hidden');
        return;
    }
    
    wrapper.classList.remove('hidden');
    
    container.innerHTML = recentViews.map((name, index) => `
        <button type="button" onclick="selectRecentMaterial(recentViews[${index}])" class="text-[11px] font-semibold px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200/50 dark:border-slate-700/50 transition-all truncate max-w-[120px]" title="${escapeHTML(name)}">
            ${escapeHTML(name)}
        </button>
    `).join('');
}

window.selectRecentMaterial = function(name) {
    const allOptions = Array.from(el.mat.options);
    const opt = allOptions.find(o => o.textContent.replace('★ ', '').trim() === name);
    if (opt) {
        el.mat.value = opt.value;
        updateKpList();
    }
};

function playFlyToReportAnimation() {
    const btnAdd = document.getElementById('btnAddToReport');
    const tabReport = document.getElementById('tab-btn-report');
    if (!btnAdd || !tabReport) return;

    const startRect = btnAdd.getBoundingClientRect();
    const endRect = tabReport.getBoundingClientRect();

    const dot = document.createElement('div');
    dot.className = 'fixed bg-indigo-600 dark:bg-indigo-500 rounded-full z-[999] pointer-events-none shadow-lg brand-glow transition-all duration-700 ease-in-out';
    dot.style.width = '16px';
    dot.style.height = '16px';
    dot.style.left = `${startRect.left + startRect.width / 2 - 8}px`;
    dot.style.top = `${startRect.top + startRect.height / 2 - 8}px`;
    dot.style.transform = 'scale(1)';
    dot.style.opacity = '1';

    document.body.appendChild(dot);

    requestAnimationFrame(() => {
        dot.style.transform = `translate(${endRect.left - startRect.left + endRect.width / 2}px, ${endRect.top - startRect.top + endRect.height / 2}px) scale(0.2)`;
        dot.style.opacity = '0';
    });

    setTimeout(() => {
        dot.remove();
        tabReport.classList.add('scale-110', 'text-indigo-600', 'dark:text-indigo-400');
        setTimeout(() => {
            tabReport.classList.remove('scale-110', 'text-indigo-600', 'dark:text-indigo-400');
        }, 300);
    }, 700);
}

function renderCell(id, value, formulaStr) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (value === null || isNaN(value)) {
        el.innerHTML = `<span class="text-slate-300 dark:text-slate-600">—</span>`;
        return;
    }

    const valStr = roundExcel(value, 2).replace('.', ',');

    if (isDevMode) {
        const wrappedFormula = wrapFormulaVars(formulaStr);
        el.innerHTML = `
            <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-1 leading-tight whitespace-nowrap tracking-tight font-medium">${wrappedFormula}</div>
            <div class="sb-animated-number text-base leading-tight font-semibold">${valStr}</div>
        `;
    } else {
        el.innerHTML = `<span class="sb-animated-number font-semibold">${valStr}</span>`;
    }
}

function updateCalculator() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    const material = appMaterials[matIndex];
    const isBrittle = isBrittleMaterial(material);
    const data = material.grades[kpIndex].data;
    const targetT = parseFloat(document.getElementById('calcTemp').value);
    const targetTGv = parseFloat(document.getElementById('calcTempGv').value);
    const seismicCategory = document.getElementById('calcSeismic').value; 

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

    let yRtm = temperatures.map(t => data["RTm"] ? data["RTm"][t] : null);
    let yRtp = temperatures.map(t => data["RTp"] ? data["RTp"][t] : null);

    let stepRtm = getStepValue(targetT, temperatures, yRtm);
    let stepRtp = getStepValue(targetT, temperatures, yRtp);
    
    let stepRtmGv = getStepValue(targetTGv, temperatures, yRtm);
    let stepRtpGv = getStepValue(targetTGv, temperatures, yRtp);

    let activeColTemp = getStepTemperature(targetT, temperatures, isBrittle ? yRtm : yRtp);
    highlightActiveColumn(activeColTemp);

    const coefs = validateCoefficients();
    if (!coefs.valid) {
        isCritical = true;
        warnings.push(...coefs.errors);
    }

    const nm = coefs.values.calcNm;
    const nt = coefs.values.calcNt;
    const ntBolt = coefs.values.calcNtBolt;
    const gm = coefs.values.calcGm;
    const gc = coefs.values.calcGc;
    const gnNue = coefs.values.calcGnNue;
    const gnPz = coefs.values.calcGnPz;

    // Safety margin audits
    if (coefs.valid) {
        if (nm !== PNAE_DEFAULT_COEFFICIENTS.calcNm) warnings.push(`Запас nm (${nm}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcNm}`);
        if (nt !== PNAE_DEFAULT_COEFFICIENTS.calcNt) warnings.push(`Запас nt (${nt}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcNt}`);
        if (ntBolt !== PNAE_DEFAULT_COEFFICIENTS.calcNtBolt) warnings.push(`Запас для кріплень ntBolt (${ntBolt}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcNtBolt}`);
        if (gc !== PNAE_DEFAULT_COEFFICIENTS.calcGc) warnings.push(`Коефіцієнт gc (${gc}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcGc}`);
        if (gm !== PNAE_DEFAULT_COEFFICIENTS.calcGm) warnings.push(`Коефіцієнт gm (${gm}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcGm}`);
        if (gnNue !== PNAE_DEFAULT_COEFFICIENTS.calcGnNue) warnings.push(`Коефіцієнт gn(НУЕ) (${gnNue}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcGnNue}`);
        if (gnPz !== PNAE_DEFAULT_COEFFICIENTS.calcGnPz) warnings.push(`Коефіцієнт gn(ПЗ) (${gnPz}) відрізняється від ${PNAE_DEFAULT_COEFFICIENTS.calcGnPz}`);
    }

    if (isCritical) {
        stepRtm = null;
        stepRtp = null;
        stepRtmGv = null;
        stepRtpGv = null;
    }

    if (isBrittle) {
        warnings.push('Крихкий матеріал: для фланця обчислюється σ₂ лише в режимах ГВ та НУЕ; для інших випадків потрібні окремі правила.');
    }

    // Temperature limits audits
    let validTemps = temperatures.filter(t => data["RTm"] && data["RTm"][t] !== "—" && data["RTm"][t] !== undefined);
    let maxGradeTemp = validTemps.length > 0 ? Math.max(...validTemps) : 600;

    if (targetT > maxGradeTemp) {
        warnings.push(`Робоча температура (${targetT}°C) вище межі випробувань сталі (${maxGradeTemp}°C). Значення за межами даних не обчислюються.`);
    }
    if (targetTGv > maxGradeTemp) {
        warnings.push(`Температура ГВ (${targetTGv}°C) вище межі випробувань сталі (${maxGradeTemp}°C). Значення за межами даних не обчислюються.`);
    }
    if (targetT < 20) {
        warnings.push(`Робоча температура (${targetT}°C) нижче 20°C.`);
    }
    if (targetTGv < 20) {
        warnings.push(`Температура ГВ (${targetTGv}°C) нижче 20°C.`);
    }

    const sigma = getPlasticBaseStress(material, stepRtm, stepRtp, nm, nt);
    const sigmaGv = getPlasticBaseStress(material, stepRtmGv, stepRtpGv, nm, nt);
    const sigmaW = getBoltBaseStress(material, stepRtp, ntBolt);

    const devModeInfoBox = document.getElementById('devModeInfo');
    if (isDevMode && !isBrittle && stepRtm !== null && stepRtp !== null) {
        devModeInfoBox.classList.remove('hidden');
        
        let sigmaFormula = `
            <div class="text-slate-400 mb-1">[σ] = min(R<sup>T</sup><sub>m</sub> / n<sub>m</sub>, R<sup>T</sup><sub>p0,2</sub> / n<sub>0,2</sub>)</div>
            <div class="text-slate-300 mb-1">[σ] = min(${roundExcel(stepRtm, 1).replace('.', ',')} / ${nm.toString().replace('.', ',')}, ${roundExcel(stepRtp, 1).replace('.', ',')} / ${nt.toString().replace('.', ',')})</div>
            <div class="text-white font-bold">[σ] = <span class="bg-blue-500 text-white px-2 py-0.5 rounded-md">${roundExcel(sigma, 2).replace('.', ',')}</span> МПа</div>
        `;
        document.getElementById('devInfoSigma').innerHTML = sigmaFormula;

        let sigmaWFormula = `
            <div class="text-slate-400 mb-1">[σ]<sub>w</sub> = R<sup>T</sup><sub>p0,2</sub> / n<sub>0,2(болти)</sub></div>
            <div class="text-slate-300 mb-1">[σ]<sub>w</sub> = ${roundExcel(stepRtp, 1).replace('.', ',')} / ${ntBolt.toString().replace('.', ',')}</div>
            <div class="text-white font-bold">[σ]<sub>w</sub> = <span class="bg-emerald-500 text-white px-2 py-0.5 rounded-md">${roundExcel(sigmaW, 2).replace('.', ',')}</span> МПа</div>
        `;
        document.getElementById('devInfoSigmaW').innerHTML = sigmaWFormula;

        let Ry = stepRtp / gm;
        let ryFormula = `
            <div class="text-slate-400 mb-1">R<sub>y</sub> = R<sup>T</sup><sub>p0,2</sub> / &gamma;<sub>m</sub></div>
            <div class="text-slate-300 mb-1">R<sub>y</sub> = ${roundExcel(stepRtp, 1).replace('.', ',')} / ${gm.toString().replace('.', ',')}</div>
            <div class="text-white font-bold">R<sub>y</sub> = <span class="bg-amber-500 text-white px-2 py-0.5 rounded-md">${roundExcel(Ry, 2).replace('.', ',')}</span> МПа</div>
        `;
        document.getElementById('devInfoRy').innerHTML = ryFormula;
    } else {
        devModeInfoBox.classList.add('hidden');
    }

    if (sigma !== null) {
        renderCell('det_s1_nue', sigma * 1.0, `[σ] &times; 1.0`);
        renderCell('det_s1_pnue', sigma * PNAE_COEFS.s1_pnue, `[σ] &times; ${PNAE_COEFS.s1_pnue}`);
        renderCell('det_s1_as', sigma * PNAE_COEFS.s1_as, `[σ] &times; ${PNAE_COEFS.s1_as}`);
        renderCell('det_s1_pz', null, ""); renderCell('det_s1_mrz', null, "");

        renderCell('det_s2_nue', sigma * PNAE_COEFS.s2_nue, `[σ] &times; ${PNAE_COEFS.s2_nue}`);
        renderCell('det_s2_pnue', sigma * PNAE_COEFS.s2_pnue, `[σ] &times; ${PNAE_COEFS.s2_pnue}`);
        renderCell('det_s2_as', sigma * PNAE_COEFS.s2_as, `[σ] &times; ${PNAE_COEFS.s2_as}`);
        renderCell('det_s2_pz', null, ""); renderCell('det_s2_mrz', null, "");

        renderCell('det_ss1_nue', null, ""); renderCell('det_ss1_pnue', null, "");
        renderCell('det_ss1_as', null, "");
        renderCell('det_ss2_nue', null, ""); renderCell('det_ss2_pnue', null, "");
        renderCell('det_ss2_as', null, "");

        if (seismicCategory === '1') {
            renderCell('det_ss1_pz', sigma * PNAE_COEFS.ss1_pz_cat1, `[σ] &times; ${PNAE_COEFS.ss1_pz_cat1}`);
            renderCell('det_ss1_mrz', sigma * PNAE_COEFS.ss1_mrz_cat1, `[σ] &times; ${PNAE_COEFS.ss1_mrz_cat1}`);
            renderCell('det_ss2_pz', sigma * PNAE_COEFS.ss2_pz_cat1, `[σ] &times; ${PNAE_COEFS.ss2_pz_cat1}`);
            renderCell('det_ss2_mrz', sigma * PNAE_COEFS.ss2_mrz_cat1, `[σ] &times; ${PNAE_COEFS.ss2_mrz_cat1}`);
        } else if (seismicCategory === '2') {
            renderCell('det_ss1_pz', sigma * PNAE_COEFS.ss1_pz_cat2, `[σ] &times; ${PNAE_COEFS.ss1_pz_cat2}`);
            renderCell('det_ss1_mrz', null, "");
            renderCell('det_ss2_pz', sigma * PNAE_COEFS.ss2_pz_cat2, `[σ] &times; ${PNAE_COEFS.ss2_pz_cat2}`);
            renderCell('det_ss2_mrz', null, "");
        }

        let sigmaRv = Math.min((2.5 - (stepRtp / stepRtm)) * stepRtp, 2 * stepRtp);
        let rvFormulaStr = `min((2.5 - R<sup>T</sup><sub>p0,2</sub>/R<sup>T</sup><sub>m</sub>)&times;R<sup>T</sup><sub>p0,2</sub>, 2&times;R<sup>T</sup><sub>p0,2</sub>)`;
        renderCell('det_srv_nue', sigmaRv, rvFormulaStr);
        renderCell('det_srv_pnue', sigmaRv, rvFormulaStr);
        renderCell('det_srv_as', null, "");
        renderCell('det_srv_pz', null, ""); renderCell('det_srv_mrz', null, "");

        renderCell('det_ts_nue', null, ""); renderCell('det_ts_pnue', null, "");
        renderCell('det_ts_as', null, "");
        const detPzFactor = getSeismicShearFactor(seismicCategory, 'pz');
        const detMrzFactor = getSeismicShearFactor(seismicCategory, 'mrz');
        renderCell('det_ts_pz', detPzFactor === null ? null : sigma * detPzFactor,
            detPzFactor === null ? '' : `[σ] &times; ${detPzFactor}`);
        renderCell('det_ts_mrz', detMrzFactor === null ? null : sigma * detMrzFactor,
            detMrzFactor === null ? '' : `[σ] &times; ${detMrzFactor}`);
    } else {
        ['nue', 'pnue', 'as', 'pz', 'mrz'].forEach(col => {
            renderCell(`det_s1_${col}`, null, ""); renderCell(`det_s2_${col}`, null, ""); renderCell(`det_srv_${col}`, null, "");
            renderCell(`det_ss1_${col}`, null, ""); renderCell(`det_ss2_${col}`, null, ""); renderCell(`det_ts_${col}`, null, "");
        });
    }

    if (sigmaGv !== null) {
        renderCell('det_s1_gv', sigmaGv * PNAE_COEFS.gv_s1, `[σ]<sub>ГВ</sub> &times; ${PNAE_COEFS.gv_s1}`);
        renderCell('det_s2_gv', sigmaGv * PNAE_COEFS.gv_s2, `[σ]<sub>ГВ</sub> &times; ${PNAE_COEFS.gv_s2}`);
    } else {
        renderCell('det_s1_gv', null, "");
        renderCell('det_s2_gv', null, "");
    }
    if (isBrittle) {
        // Only σ₂ of a flange is established for brittle materials (ГВ/НУЕ).
        // Do not extrapolate the plastic-material equations to other modes.
        renderCell('det_s2_gv', brittleFlangeStress(stepRtmGv, true), brittleFlangeFormula(true));
        renderCell('det_s2_nue', brittleFlangeStress(stepRtm, false), brittleFlangeFormula(false));
    }
    renderCell('det_srv_gv', null, ""); 
    renderCell('det_ss1_gv', null, ""); 
    renderCell('det_ss2_gv', null, ""); 
    renderCell('det_ts_gv', null, "");

    if (sigmaW !== null && stepRtp !== null) {
        renderCell('bolt_s1_nue', sigmaW * 1.0, `[σ]<sub>w</sub>`);
        renderCell('bolt_s1_pnue', sigmaW * PNAE_COEFS.bolt_pnue, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_pnue}`);
        renderCell('bolt_s1_as', sigmaW * PNAE_COEFS.bolt_s1_as, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s1_as}`);
        renderCell('bolt_s1_pz', null, ""); renderCell('bolt_s1_mrz', null, "");

        renderCell('bolt_s3w_nue', sigmaW * PNAE_COEFS.bolt_s3w_nue, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s3w_nue}`);
        renderCell('bolt_s3w_pnue', sigmaW * PNAE_COEFS.bolt_s3w_pnue, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s3w_pnue}`);
        renderCell('bolt_s3w_as', sigmaW * PNAE_COEFS.bolt_s3w_as, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s3w_as}`);
        renderCell('bolt_s3w_pz', null, ""); renderCell('bolt_s3w_mrz', null, "");

        renderCell('bolt_s4w_nue', sigmaW * PNAE_COEFS.bolt_s4w_nue, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s4w_nue}`);
        renderCell('bolt_s4w_pnue', sigmaW * PNAE_COEFS.bolt_s4w_pnue, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s4w_pnue}`);
        renderCell('bolt_s4w_as', sigmaW * PNAE_COEFS.bolt_s4w_as, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_s4w_as}`);
        renderCell('bolt_s4w_pz', null, ""); renderCell('bolt_s4w_mrz', null, "");

        renderCell('bolt_ssmw_nue', null, ""); renderCell('bolt_ssmw_pnue', null, ""); 
        renderCell('bolt_ssmw_as', null, "");
        renderCell('bolt_ss4w_nue', null, ""); renderCell('bolt_ss4w_pnue', null, ""); 
        renderCell('bolt_ss4w_as', null, "");

        if (seismicCategory === '1') {
            renderCell('bolt_ssmw_pz', sigmaW * PNAE_COEFS.bolt_ssmw_pz_cat1, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ssmw_pz_cat1}`);
            renderCell('bolt_ssmw_mrz', sigmaW * PNAE_COEFS.bolt_ssmw_mrz_cat1, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ssmw_mrz_cat1}`);
            renderCell('bolt_ss4w_pz', sigmaW * PNAE_COEFS.bolt_ss4w_pz_cat1, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ss4w_pz_cat1}`);
            renderCell('bolt_ss4w_mrz', sigmaW * PNAE_COEFS.bolt_ss4w_mrz_cat1, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ss4w_mrz_cat1}`);
        } else if (seismicCategory === '2') {
            renderCell('bolt_ssmw_pz', sigmaW * PNAE_COEFS.bolt_ssmw_pz_cat2, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ssmw_pz_cat2}`);
            renderCell('bolt_ssmw_mrz', null, "");
            renderCell('bolt_ss4w_pz', sigmaW * PNAE_COEFS.bolt_ss4w_pz_cat2, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ss4w_pz_cat2}`);
            renderCell('bolt_ss4w_mrz', null, "");
        }

        renderCell('bolt_ts_nue', null, ""); renderCell('bolt_ts_pnue', null, ""); 
        renderCell('bolt_ts_as', null, "");
        const boltPzFactor = getSeismicShearFactor(seismicCategory, 'pz', true);
        const boltMrzFactor = getSeismicShearFactor(seismicCategory, 'mrz', true);
        renderCell('bolt_ts_pz', boltPzFactor === null ? null : sigmaW * boltPzFactor,
            boltPzFactor === null ? '' : `[σ]<sub>w</sub> &times; ${boltPzFactor}`);
        renderCell('bolt_ts_mrz', boltMrzFactor === null ? null : sigmaW * boltMrzFactor,
            boltMrzFactor === null ? '' : `[σ]<sub>w</sub> &times; ${boltMrzFactor}`);
    } else {
        ['nue', 'pnue', 'as', 'pz', 'mrz'].forEach(col => {
            renderCell(`bolt_s1_${col}`, null, ""); renderCell(`bolt_s3w_${col}`, null, ""); renderCell(`bolt_s4w_${col}`, null, "");
            renderCell(`bolt_ssmw_${col}`, null, ""); renderCell(`bolt_ss4w_${col}`, null, ""); renderCell(`bolt_ts_${col}`, null, "");
        });
    }

    if (!isBrittle && stepRtpGv !== null) {
        renderCell('bolt_s1_gv', stepRtpGv * PNAE_COEFS.bolt_gv_rtp_mult, `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; ${PNAE_COEFS.bolt_gv_rtp_mult}`);
    } else {
        renderCell('bolt_s1_gv', null, "");
    }
    renderCell('bolt_s3w_gv', null, ""); 
    renderCell('bolt_s4w_gv', null, ""); 
    renderCell('bolt_ssmw_gv', null, ""); 
    renderCell('bolt_ss4w_gv', null, ""); 
    renderCell('bolt_ts_gv', null, "");

    if (!isBrittle && stepRtp !== null) {
        let Ry = stepRtp / gm;
        let rNue = (Ry * gc) / gnNue;
        let rPz = (Ry * gc) / gnPz;

        let fNue = `(R<sub>y</sub>&times;&gamma;<sub>c</sub>) / &gamma;<sub>n(НУЕ)</sub>`;
        let fPz = `(R<sub>y</sub>&times;&gamma;<sub>c</sub>) / &gamma;<sub>n(ПЗ)</sub>`;

        renderCell('op_R_nue', rNue, fNue);
        renderCell('op_R_pnue', rPz, fPz);
        renderCell('op_R_as', rPz, fPz);
        renderCell('op_R_pz', rPz, fPz);
        renderCell('op_R_mrz', seismicCategory === '1' ? rPz : null, seismicCategory === '1' ? fPz : '');
    } else {
        renderCell('op_R_nue', null, ""); renderCell('op_R_pnue', null, ""); 
        renderCell('op_R_as', null, "");
        renderCell('op_R_pz', null, ""); renderCell('op_R_mrz', null, "");
    }

    if (!isBrittle && stepRtpGv !== null) {
        let RyGv = stepRtpGv / gm;
        let rGv = (RyGv * gc) / gnNue;
        let fGv = `(R<sub>y(ГВ)</sub>&times;&gamma;<sub>c</sub>) / &gamma;<sub>n(НУЕ)</sub>`;
        renderCell('op_R_gv', rGv, fGv);
    } else {
        renderCell('op_R_gv', null, "");
    }

    if (auditPanel && auditDot && auditTitle && auditDesc && auditWarnings) {
        // Reset class styles first
        auditPanel.className = "p-4 rounded-2xl text-xs font-semibold shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 mb-5 relative overflow-hidden";
        auditWarnings.classList.add('hidden');
        auditWarnings.innerHTML = "";

        if (isCritical) {
            auditPanel.classList.add('bg-rose-50/50', 'dark:bg-rose-950/20', 'text-rose-800', 'dark:text-rose-300', 'border-rose-200/50', 'dark:border-rose-900/30');
            auditDot.className = "relative inline-flex rounded-full h-3 w-3 bg-rose-500";
            if (auditPing) auditPing.className = "hidden";
            auditTitle.textContent = "Розрахунок заблоковано";
            auditDesc.textContent = "Введено некоректні значення коефіцієнтів (> 0) або температур. Розрахунок призупинено.";
            auditWarnings.classList.remove('hidden');
            auditWarnings.innerHTML = warnings.map(w => `<div>⚠ ${escapeHTML(w)}</div>`).join('');
        } else if (warnings.length > 0) {
            auditPanel.classList.add('bg-amber-50/50', 'dark:bg-amber-950/20', 'text-amber-800', 'dark:text-amber-300', 'border-amber-200/50', 'dark:border-amber-900/30');
            auditDot.className = "relative inline-flex rounded-full h-3 w-3 bg-amber-500";
            if (auditPing) auditPing.className = "hidden";
            auditTitle.textContent = "Аудит: Застереження";
            auditDesc.textContent = "Виявлено нестандартні коефіцієнти розрахунку або вихід за межі температурної сітки матеріалу.";
            
            auditWarnings.classList.remove('hidden');
            auditWarnings.innerHTML = warnings.map(w => `<div>⚠ ${escapeHTML(w)}</div>`).join('');
        } else {
            auditPanel.classList.add('hidden');
        }
    }
}

let addMatModalSnapshot = "";

function takeAddMatFormSnapshot() {
    const name = document.getElementById('newMatName').value.trim();
    const desc = document.getElementById('newMatDesc').value.trim();
    let values = [name, document.getElementById('newMatKp').value.trim(), desc,
        document.getElementById('newMatBrittle').checked];
    document.querySelectorAll('#newMatTableBody input').forEach(inp => {
        values.push(inp.value.trim());
    });
    return JSON.stringify(values);
}

function isAddMatFormChanged() {
    return takeAddMatFormSnapshot() !== addMatModalSnapshot;
}

function validateNewMatGrid() {
    temperatures.forEach(t => {
        const inputRtm = document.querySelector(`#newMatTableBody input[data-prop="RTm"][data-temp="${t}"]`);
        const inputRtp = document.querySelector(`#newMatTableBody input[data-prop="RTp"][data-temp="${t}"]`);
        
        if (inputRtm && inputRtp) {
            let valRtm = inputRtm.value.trim().replace(',', '.');
            let valRtp = inputRtp.value.trim().replace(',', '.');
            
            let rtm = valRtm === "" ? null : parseFloat(valRtm);
            let rtp = valRtp === "" ? null : parseFloat(valRtp);
            
            if (rtm !== null && rtp !== null && !isNaN(rtm) && !isNaN(rtp) && rtp > rtm) {
                inputRtm.classList.add('input-error');
                inputRtp.classList.add('input-error');
            } else {
                inputRtm.classList.remove('input-error');
                inputRtp.classList.remove('input-error');
            }
        }
    });
}

function closeMaterialModal(force = false) {
    const addMatModal = typeof document !== 'undefined' ? document.getElementById('addMatModal') : null;
    if (!addMatModal) return;
    if (!force && typeof isAddMatFormChanged === 'function' && isAddMatFormChanged()) {
        if (typeof confirm === 'function' && !confirm("У вас є незбережені зміни. Ви впевнені, що хочете закрити вікно? Всі внесені дані буде втрачено.")) {
            return;
        }
    }
    addMatModal.classList.add('hidden');
    editingMatIndex = -1;
    editingGradeIndex = -1;
    if (typeof buildMaterialFormEmpty === 'function') buildMaterialFormEmpty();
}

function initAddMaterialModal() {
    const addMatModal = document.getElementById('addMatModal');
    const closeAddMatModal = (force = false) => closeMaterialModal(force);
    
    document.getElementById('btnOpenAddMat').addEventListener('click', () => {
        editingMatIndex = -1;
        editingGradeIndex = -1;
        document.getElementById('addMatTitle').textContent = "Додати власний матеріал";
        buildMaterialFormEmpty();
        addMatModalSnapshot = takeAddMatFormSnapshot();
        addMatModal.classList.remove('hidden');
    });

    document.getElementById('btnCloseAddMat').addEventListener('click', () => closeAddMatModal(false));
    document.getElementById('btnCancelAddMat').addEventListener('click', () => closeAddMatModal(false));
    
    // Блокування випадкових закриттів по backdrop
    document.getElementById('addMatModalBackdrop').addEventListener('click', () => {
        // Backdrop click does not close modal automatically to prevent data loss.
    });

    // Миттєва валідація на події input в таблиці форми
    document.getElementById('newMatTableBody').addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            validateNewMatGrid();
            if (e.target.dataset.prop === 'RTm' || e.target.dataset.prop === 'RTp') updateBrittleEditorHint();
        }
    });

    document.getElementById('btnSaveAddMat').addEventListener('click', () => {
        const matName = document.getElementById('newMatName').value.trim();
        const matDesc = document.getElementById('newMatDesc').value.trim();
        const matKp = document.getElementById('newMatKp').value.trim();
        const isBrittle = document.getElementById('newMatBrittle').checked;
        
        if (!matName) {
            showToast('Будь ласка, введіть марку сталі/сплаву.', 'error');
            return;
        }

        const matchingIndex = appMaterials.findIndex(m => canonicalMaterialKey(m.name) === canonicalMaterialKey(matName));
        const targetMatIndex = editingMatIndex >= 0 ? Number(editingMatIndex) : matchingIndex;
        if (editingMatIndex >= 0 && matchingIndex >= 0 && matchingIndex !== targetMatIndex) {
            showToast('Матеріал з такою назвою вже існує. Виберіть іншу назву.', 'error');
            return;
        }
        if (targetMatIndex >= 0 && appMaterials[targetMatIndex].grades.some((grade, index) =>
            !(editingMatIndex >= 0 && editingGradeIndex >= 0 && index === Number(editingGradeIndex)) &&
            canonicalMaterialKey(grade.kp) === canonicalMaterialKey(matKp) &&
            canonicalMaterialKey(formatDescription(appMaterials[targetMatIndex].name, grade.description)) ===
                canonicalMaterialKey(formatDescription(matName, matDesc)))) {
            showToast('Такий КП з цим описом уже існує. Відредагуйте наявний варіант.', 'error');
            return;
        }
        let newGrade = { kp: matKp, description: matDesc, data: {} };
        let invalidInput = null;
        
        propertiesList.forEach(prop => {
            newGrade.data[prop.key] = {};
            temperatures.forEach(t => {
                const input = document.querySelector(`#newMatTableBody input[data-prop="${prop.key}"][data-temp="${t}"]`);
                let val = input ? input.value.trim().replace(',', '.') : "";
                if (val === "" || val === "-" || val === "—") {
                    newGrade.data[prop.key][t] = "—";
                } else {
                    const num = Number(val);
                    if (!Number.isFinite(num) || num < 0) {
                        input.classList.add('input-error');
                        invalidInput ||= input;
                    }
                    newGrade.data[prop.key][t] = num;
                }
            });
        });

        if (invalidInput) {
            invalidInput.focus();
            showToast('Введіть невід’ємне число або прочерк. Текст і нескінченні значення не допускаються.', 'error');
            return;
        }

        // --- Валідація: Rp0,2 <= Rm ---
        let validationFailed = false;
        let errorTemp = null;

        for (let i = 0; i < temperatures.length; i++) {
            let t = temperatures[i];
            let rtm = newGrade.data['RTm'][t];
            let rtp = newGrade.data['RTp'][t];

            if (typeof rtm === 'number' && typeof rtp === 'number') {
                if (rtp > rtm) {
                    validationFailed = true;
                    errorTemp = t;

                    // Підсвічуємо проблемні поля (знімаємо підсвітку при зміні значень)
                    const inputRtm = document.querySelector(`#newMatTableBody input[data-prop="RTm"][data-temp="${t}"]`);
                    const inputRtp = document.querySelector(`#newMatTableBody input[data-prop="RTp"][data-temp="${t}"]`);

                    if (inputRtp) {
                        inputRtp.classList.add('input-error');
                        inputRtp.addEventListener('input', function clearErr() {
                            inputRtp.classList.remove('input-error');
                            inputRtp.removeEventListener('input', clearErr);
                        });
                    }
                    if (inputRtm) {
                        inputRtm.classList.add('input-error');
                        inputRtm.addEventListener('input', function clearErr() {
                            inputRtm.classList.remove('input-error');
                            inputRtm.removeEventListener('input', clearErr);
                        });
                    }
                    break; // Зупиняємось на першій же помилці
                }
            }
        }

        if (validationFailed) {
            showToast(`Помилка: Межа текучості (Rp0,2) більша за тимчасовий опір (Rm) при ${errorTemp} °C! Це фізично неможливо.`, 'error');
            return; // Блокуємо збереження
        }
        // --- Кінець валідації ---

        const previous = JSON.stringify({ appMaterials, appMaterialOrigins, favoriteMaterials, reportMaterials, reportMaterialsEquip });
        const savedMatIndex = targetMatIndex >= 0 ? targetMatIndex : appMaterials.length;
        const savedGradeIndex = editingMatIndex >= 0 && editingGradeIndex >= 0
            ? Number(editingGradeIndex) : (appMaterials[savedMatIndex]?.grades.length || 0);
        if (editingMatIndex >= 0) {
            const oldName = appMaterials[savedMatIndex].name;
            appMaterials[savedMatIndex].name = matName;
            if (isBrittle) appMaterials[savedMatIndex].isBrittle = true;
            else delete appMaterials[savedMatIndex].isBrittle;
            if (editingGradeIndex >= 0) appMaterials[savedMatIndex].grades[savedGradeIndex] = newGrade;
            else appMaterials[savedMatIndex].grades.push(newGrade);
            if (oldName !== matName) {
                appMaterials[savedMatIndex].grades.forEach((grade, idx) => {
                    if (idx !== savedGradeIndex) {
                        grade.description = renameGradeDescriptionPrefix(grade.description, oldName, matName);
                    }
                });
            }
            favoriteMaterials = favoriteMaterials.map(name => name === oldName ? matName : name);
        } else if (targetMatIndex >= 0) {
            appMaterials[savedMatIndex].grades.push(newGrade);
            if (isBrittle) appMaterials[savedMatIndex].isBrittle = true;
        } else {
            appMaterials.push({ name: matName, grades: [newGrade], ...(isBrittle ? { isBrittle: true } : {}) });
            appMaterialOrigins.push(null);
        }
        [...reportMaterials, ...reportMaterialsEquip].forEach(item => {
            if (Number(item.matIndex) === savedMatIndex) {
                item.matName = appMaterials[savedMatIndex].name;
                item.kpName = getReportKpName(item);
            }
        });
        if (!saveToLocalStorage()) {
            ({ appMaterials, appMaterialOrigins, favoriteMaterials, reportMaterials, reportMaterialsEquip } = JSON.parse(previous));
            return;
        }
        showToast('Матеріал збережено в цьому браузері', 'success');
        recentViews = recentViews.filter(name => appMaterials.some(material => material.name === name));
        closeAddMatModal(true);
        el.search.value = '';
        updateMaterialList();
        el.mat.value = savedMatIndex;
        updateKpList();
        el.kp.value = savedGradeIndex;
        updateAllViews();
        renderReportList();
        renderReportTable();
        renderReportStressTable();
        renderReportTableEquip();
        renderReportStressTableEquip();
    });

    // --- Excel-like виділення мишкою для полів вводу ---
    const editTableBody = document.getElementById('newMatTableBody');
    let isInputSelecting = false;
    let startInputRow = -1;
    let startInputCol = -1;
    let inputGrid = [];

    const clearInputSelection = () => {
        document.querySelectorAll('.input-selected').forEach(el => el.classList.remove('input-selected'));
    };

    editTableBody.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const input = e.target.closest('input');
        if (!input) return;

        isInputSelecting = true;
        clearInputSelection();
        input.classList.add('input-selected');
        
        // Тимчасово вимикаємо виділення тексту на сторінці під час протягування мишкою
        document.body.style.userSelect = 'none';

        // Будуємо карту координат інпутів
        inputGrid = [];
        Array.from(editTableBody.querySelectorAll('tr')).forEach((row, r) => {
            inputGrid[r] = [];
            Array.from(row.querySelectorAll('input')).forEach((inp, c) => {
                inputGrid[r][c] = inp;
                inp.dataset.gridR = r;
                inp.dataset.gridC = c;
            });
        });

        startInputRow = parseInt(input.dataset.gridR);
        startInputCol = parseInt(input.dataset.gridC);
    });

    editTableBody.addEventListener('mouseover', (e) => {
        if (!isInputSelecting) return;
        const input = e.target.closest('input');
        if (!input) return;

        const currR = parseInt(input.dataset.gridR);
        const currC = parseInt(input.dataset.gridC);

        clearInputSelection();

        const minR = Math.min(startInputRow, currR);
        const maxR = Math.max(startInputRow, currR);
        const minC = Math.min(startInputCol, currC);
        const maxC = Math.max(startInputCol, currC);

        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                if (inputGrid[r] && inputGrid[r][c]) {
                    inputGrid[r][c].classList.add('input-selected');
                }
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isInputSelecting) {
            isInputSelecting = false;
            document.body.style.userSelect = ''; 
            
            const firstSelected = document.querySelector('.input-selected');
            if (firstSelected) firstSelected.focus();
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('#newMatTableBody') && !isInputSelecting) {
            clearInputSelection();
        }
    });

    editTableBody.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyA' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'ф')) {
            const target = e.target;
            if (target.tagName === 'INPUT') {
                if (target.value === '' || (target.selectionStart === 0 && target.selectionEnd === target.value.length)) {
                    e.preventDefault();
                    clearInputSelection();
                    editTableBody.querySelectorAll('input').forEach(inp => inp.classList.add('input-selected'));
                    target.blur(); 
                }
            }
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedInputs = document.querySelectorAll('.input-selected');
            if (selectedInputs.length > 1) { 
                e.preventDefault();
                selectedInputs.forEach(inp => {
                    inp.value = '';
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        }
    });

    editTableBody.addEventListener('paste', function(e) {
        let selectedInputs = Array.from(document.querySelectorAll('.input-selected'));
        if (selectedInputs.length === 0 && e.target.tagName === 'INPUT') {
            selectedInputs = [e.target];
        }
        
        if (selectedInputs.length === 0) return;

        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text/plain');
        if (!pastedText) return;

        const rows = pastedText.replace(/\r?\n$/, '').split(/\r?\n/).map(row => row.split('\t'));

        let grid = [];
        Array.from(editTableBody.querySelectorAll('tr')).forEach((tr, r) => {
            grid[r] = Array.from(tr.querySelectorAll('input'));
        });

        let startR = 9999, startC = 9999;
        selectedInputs.forEach(inp => {
            for(let r=0; r<grid.length; r++) {
                let c = grid[r].indexOf(inp);
                if(c !== -1) {
                    if (r < startR) startR = r;
                    if (c < startC) startC = c;
                }
            }
        });

        clearInputSelection();

        for (let i = 0; i < rows.length; i++) {
            if (startR + i >= grid.length) break;
            for (let j = 0; j < rows[i].length; j++) {
                if (startC + j >= grid[startR + i].length) break;
                
                const val = rows[i][j].trim();
                if (val !== "") {
                    const inp = grid[startR + i][startC + j];
                    inp.value = val;
                    inp.classList.add('input-selected');
                    
                    // Якщо вставляємо нове значення, видаляємо стан помилки, якщо він був
                    inp.classList.remove('input-error');
                    
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    });
}

function buildMaterialFormEmpty() {
    const thead = document.getElementById('newMatTableHeader');
    const tbody = document.getElementById('newMatTableBody');
    
    let thHtml = `<th class="sticky-col-header first-col p-3 border-r border-b border-slate-200 dark:border-slate-700 min-w-[200px] font-semibold select-none bg-slate-50 dark:bg-slate-900 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Властивість \\ Т, °С</th>`;
    temperatures.forEach(t => { thHtml += `<th class="p-2 text-center border-r border-b border-slate-200 dark:border-slate-700 min-w-[65px] font-semibold select-none">${t}</th>`; });
    thead.innerHTML = thHtml;
    
    let tbHtml = '';
    propertiesList.forEach(prop => {
        tbHtml += `<tr class="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><td class="sticky-col bg-inherit p-3 border-r border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 select-none z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">${prop.name} (${prop.symbol})</td>`;
        temperatures.forEach(t => {
            tbHtml += `<td class="p-1.5 border-r border-b border-slate-200 dark:border-slate-700"><input type="text" data-prop="${prop.key}" data-temp="${t}" class="custom-input"></td>`;
        });
        tbHtml += `</tr>`;
    });
    tbody.innerHTML = tbHtml;
    
    document.getElementById('newMatName').value = '';
    document.getElementById('newMatKp').value = '';
    document.getElementById('newMatDesc').value = '';
    document.getElementById('newMatBrittle').checked = false;
    updateBrittleEditorHint();

    const btnResetMatToCore = document.getElementById('btnResetMatToCore');
    if (btnResetMatToCore) btnResetMatToCore.classList.add('hidden');
    const btnDeleteMat = document.getElementById('btnDeleteMat');
    if (btnDeleteMat) btnDeleteMat.classList.add('hidden');
    document.getElementById('editGradePanel').classList.add('hidden');
    document.getElementById('newMatKpLabel').textContent = 'Категорія міцності (КП)';
}

function updateBrittleEditorHint() {
    const box = document.getElementById('brittleAutoHint');
    if (!box) return;
    const hasRtm = [...document.querySelectorAll('#newMatTableBody input[data-prop="RTm"]')]
        .some(input => input.value.trim() !== '');
    const hasRtp = [...document.querySelectorAll('#newMatTableBody input[data-prop="RTp"]')]
        .some(input => input.value.trim() !== '');
    box.classList.toggle('hidden', !hasRtm || hasRtp);
}

function editorGradeLabel(grade) {
    let label = grade.kp ? `КП ${grade.kp}` : 'Без КП';
    const desc = formatDescription(appMaterials[editingMatIndex].name, grade.description);
    if (desc !== 'Не вказано') label += ` — ${desc}`;
    return label;
}

function refreshEditorGradeList() {
    const select = document.getElementById('editGradeSelect');
    const material = appMaterials[editingMatIndex];
    if (!material) return;
    select.innerHTML = '';
    material.grades.forEach((grade, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = editorGradeLabel(grade);
        select.appendChild(option);
    });
    if (editingGradeIndex < 0) {
        const option = document.createElement('option');
        option.value = 'new';
        option.textContent = '+ Нова КП (незбережена)';
        select.appendChild(option);
    }
    select.value = editingGradeIndex < 0 ? 'new' : String(editingGradeIndex);
    document.getElementById('btnDeleteGrade').disabled = editingGradeIndex < 0 || material.grades.length < 2;
    document.getElementById('btnAddGrade').disabled = editingGradeIndex < 0;
    document.getElementById('btnDeleteGrade').title = material.grades.length < 2
        ? 'Для видалення останньої КП видаліть усю марку' : 'Видалити тільки вибрану КП';
    document.getElementById('editGradeHint').textContent = editingGradeIndex < 0
        ? 'Нова КП буде додана до цієї марки після натискання «Зберегти матеріал».'
        : `Варіант ${editingGradeIndex + 1} із ${material.grades.length}. Зміни в таблиці стосуються лише цієї КП.`;
}

function fillEditorGrade(index) {
    const mat = appMaterials[editingMatIndex];
    if (!mat) return;
    editingGradeIndex = index;
    const grade = index >= 0 ? mat.grades[index] : null;
    // Material name is shared by all grades. Only grade-specific fields change.
    document.getElementById('newMatName').value = mat.name;
    document.getElementById('newMatBrittle').checked = isBrittleMaterial(mat);
    document.getElementById('newMatKp').value = grade ? grade.kp : '';
    document.getElementById('newMatKpLabel').textContent = grade ? 'Номер КП (можна змінити)' : 'Номер нової КП';
    const description = grade ? formatDescription(mat.name, grade.description) : '';
    document.getElementById('newMatDesc').value = description === 'Не вказано' ? '' : description;
    document.querySelectorAll('#newMatTableBody input').forEach(input => {
        const value = grade?.data?.[input.dataset.prop]?.[input.dataset.temp];
        input.value = value !== undefined && value !== null && value !== '—' ? value : '';
        input.classList.remove('input-error', 'input-selected');
    });
    refreshEditorGradeList();
    addMatModalSnapshot = takeAddMatFormSnapshot();
    validateNewMatGrid();
    updateBrittleEditorHint();
}

function switchEditorGrade(value) {
    if (editingMatIndex < 0) return;
    const nextIndex = value === 'new' ? -1 : Number(value);
    const select = document.getElementById('editGradeSelect');
    if (nextIndex === editingGradeIndex) { select.value = value; return; }
    if (isAddMatFormChanged() && typeof confirm === 'function' &&
        !confirm('Ви змінили дані поточної КП. Перемкнутися без збереження? Незбережені зміни буде втрачено.')) {
        select.value = editingGradeIndex < 0 ? 'new' : String(editingGradeIndex);
        return;
    }
    fillEditorGrade(nextIndex);
}

function deleteCurrentGrade() {
    const matIndex = editingMatIndex;
    const gradeIndex = editingGradeIndex;
    const material = appMaterials[matIndex];
    if (!material || gradeIndex < 0) return false;
    if (material.grades.length <= 1) {
        showToast('Це остання КП. Для її видалення використайте «Видалити матеріал».', 'warning');
        return false;
    }
    const grade = material.grades[gradeIndex];
    const label = editorGradeLabel(grade);
    if (typeof confirm === 'function' && !confirm(
        `Видалити тільки «${label}» у матеріалі «${material.name}»?\n\n` +
        'Ця КП також буде вилучена з обох списків «Для звіту». Решта КП залишаться без змін.')) return false;
    const previous = JSON.stringify({ appMaterials, appMaterialOrigins, reportMaterials, reportMaterialsEquip });
    // Match by the material index + selected grade index, NOT by KP number:
    // several assortments may share the very same KP.
    const removeAndReindex = items => items.filter(item => !(
        Number(item.matIndex) === matIndex && Number(item.kpIndex) === gradeIndex
    )).map(item => {
        if (Number(item.matIndex) === matIndex && Number(item.kpIndex) > gradeIndex) {
            return { ...item, kpIndex: Number(item.kpIndex) - 1 };
        }
        return item;
    });
    reportMaterials = removeAndReindex(reportMaterials);
    reportMaterialsEquip = removeAndReindex(reportMaterialsEquip);
    material.grades.splice(gradeIndex, 1);
    if (!saveToLocalStorage()) {
        ({ appMaterials, appMaterialOrigins, reportMaterials, reportMaterialsEquip } = JSON.parse(previous));
        return false;
    }
    reportMaterials = normalizeReportItems(reportMaterials, ['Фланець', 'Шпильки', 'Різьба']);
    reportMaterialsEquip = normalizeReportItems(reportMaterialsEquip,
        ['Всі деталі (крім шпильок)', 'Зварювальні та наплавні матеріали', 'Шпильки', 'Опора']);
    fillEditorGrade(Math.min(gradeIndex, material.grades.length - 1));
    if (el.mat) el.mat.value = matIndex;
    updateKpList();
    el.kp.value = editingGradeIndex;
    updateAllViews();
    renderReportList();
    renderReportTable();
    renderReportStressTable();
    renderReportTableEquip();
    renderReportStressTableEquip();
    showToast(`КП «${label}» видалено`, 'success');
    return true;
}

function openEditModal() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    buildMaterialFormEmpty();
    document.getElementById('addMatTitle').textContent = 'Редагувати матеріал';
    editingMatIndex = Number(matIndex);
    document.getElementById('editGradePanel').classList.remove('hidden');
    fillEditorGrade(Number(kpIndex));

    const btnResetMatToCore = document.getElementById('btnResetMatToCore');
    if (btnResetMatToCore) {
        if (appMaterialOrigins[editingMatIndex] !== null) {
            btnResetMatToCore.classList.remove('hidden');
        } else {
            btnResetMatToCore.classList.add('hidden');
        }
    }

    const btnDeleteMat = document.getElementById('btnDeleteMat');
    if (btnDeleteMat) btnDeleteMat.classList.remove('hidden');

    document.getElementById('addMatModal').classList.remove('hidden');
    addMatModalSnapshot = takeAddMatFormSnapshot();
    validateNewMatGrid();
}

function exportToJS() {
    // Remember the exact exported database. Once installed as data.js, it must
    // not be overlaid again by stale browser modifications based on the old file.
    const previousMarker = lastExportSnapshot;
    lastExportSnapshot = {
        dataHash: materialFingerprint(appMaterials),
        changesHash: getMaterialChangeFingerprint(getSavedMaterialChanges())
    };
    if (!saveToLocalStorage()) {
        lastExportSnapshot = previousMarker;
        return;
    }
    const blob = new Blob([`const materialsDB = ${JSON.stringify(appMaterials, null, 4)};`],
        { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.js';
    document.body.appendChild(link);
    link.click();
    link.remove();
    updateDataSaveStatus();
    showToast('data.js підготовлено. Замініть ним файл у папці застосунку.', 'success');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportBackupJSON() {
    try {
        const coefs = validateCoefficients();
        if (!coefs.valid) {
            showToast('Перевірте значення коефіцієнтів перед експортом резервної копії', 'error');
            return;
        }
        const materialChanges = getSavedMaterialChanges();

        const backupData = {
            format: "SUPERBASE_BACKUP",
            version: 3,
            materials: appMaterials,
            exportedAt: new Date().toISOString(),
            appMaterialsCount: appMaterials.length,
            state: {
                ...materialChanges,
                favoriteMaterials,
                reportMaterials,
                reportMaterialsEquip,
                reportTemperatures,
                activeReportSubTab,
                equipmentActiveProperties,
                equipmentStressColumns,
                reportEquipSeismicVal,
                coefficients: coefs.raw
            }
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        link.download = `superbase_backup_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Резервну копію (JSON) успішно експортовано", "success");
    } catch (e) {
        console.error("Помилка експорту резервної копії:", e);
        showToast("Помилка під час створення резервної копії", "error");
    }
}

function validateBackupSchema(data) {
    if (!data || typeof data !== 'object') return { valid: false, reason: "Файл не містить валідного JSON-об'єкта" };
    const stateObj = (data.state && typeof data.state === 'object') ? data.state : data;
    if (data.format !== undefined && data.format !== 'SUPERBASE_BACKUP')
        return { valid: false, reason: 'Це не резервна копія SuperBase' };
    const recognized = Array.isArray(data.materials) ||
        ['overrides', 'custom', 'deletedBaseNames', 'reportMaterials', 'reportMaterialsEquip'].some(key => key in stateObj);
    if (!recognized) return { valid: false, reason: 'JSON не містить стану резервної копії SuperBase' };
    if (data.materials !== undefined && (!Array.isArray(data.materials) ||
        !data.materials.every(isValidMaterial) ||
        new Set(data.materials.map(m => canonicalMaterialKey(m.name))).size !== data.materials.length)) {
        return { valid: false, reason: 'Список матеріалів резервної копії пошкоджений' };
    }

    if (stateObj.overrides !== undefined) {
        if (!Array.isArray(stateObj.overrides)) return { valid: false, reason: "Поле 'overrides' має бути масивом" };
        for (const ov of stateObj.overrides) {
            if (!ov || typeof ov.baseName !== 'string' || !isValidMaterial(ov.material)) {
                return { valid: false, reason: `Некоректний запис перевизначення для марки ${ov?.baseName || 'невідомо'}` };
            }
        }
    }

    if (stateObj.custom !== undefined) {
        if (!Array.isArray(stateObj.custom)) return { valid: false, reason: "Поле 'custom' має бути масивом" };
        for (const mat of stateObj.custom) {
            if (!isValidMaterial(mat)) {
                return { valid: false, reason: `Некоректний власний матеріал ${mat?.name || 'невідомо'}` };
            }
        }
    }

    if (stateObj.deletedBaseNames !== undefined &&
        (!Array.isArray(stateObj.deletedBaseNames) ||
         !stateObj.deletedBaseNames.every(name => typeof name === 'string'))) {
        return { valid: false, reason: "Поле 'deletedBaseNames' має бути масивом назв" };
    }

    if (stateObj.favoriteMaterials !== undefined && !Array.isArray(stateObj.favoriteMaterials)) {
        return { valid: false, reason: "Поле 'favoriteMaterials' має бути масивом" };
    }

    if (stateObj.reportMaterials !== undefined && !Array.isArray(stateObj.reportMaterials)) {
        return { valid: false, reason: "Поле 'reportMaterials' має бути масивом" };
    }

    if (stateObj.reportMaterialsEquip !== undefined && !Array.isArray(stateObj.reportMaterialsEquip)) {
        return { valid: false, reason: "Поле 'reportMaterialsEquip' має бути масивом" };
    }
    for (const key of ['reportMaterials', 'reportMaterialsEquip']) {
        if (Array.isArray(stateObj[key]) && !stateObj[key].every(row => row && typeof row.matName === 'string' && row.matName.trim())) {
            return { valid: false, reason: `Некоректні записи у ${key}` };
        }
    }

    if (stateObj.coefficients !== undefined) {
        if (!stateObj.coefficients || typeof stateObj.coefficients !== 'object')
            return { valid: false, reason: 'Некоректний блок коефіцієнтів' };
        for (const [key, val] of Object.entries(stateObj.coefficients)) {
            if (key in PNAE_DEFAULT_COEFFICIENTS && parseCoefficient(val) === null)
                return { valid: false, reason: `Некоректний коефіцієнт ${key}` };
        }
    }
    return { valid: true, state: stateObj };
}

function applyBackupState(data) {
    const validation = validateBackupSchema(data);
    if (!validation.valid) {
        return { success: false, reason: validation.reason };
    }

    const stateObj = validation.state;
    const previousState = typeof localStorage !== 'undefined' ? localStorage.getItem('pnae_state_v2') : null;
    const previousCoefficients = getCurrentCoefficientValues();

    if (Array.isArray(data.materials)) {
        // v3 backup is self-contained and does not depend on the data.js that
        // happened to be installed when the backup was created.
        appMaterials = JSON.parse(JSON.stringify(data.materials));
        appMaterialOrigins = appMaterials.map(material =>
            coreDB.find(base => base.name === material.name) ? material.name : null);
    } else {
        restoreMaterialsFromState(stateObj);
    }
    lastExportSnapshot = null;
    sourceDataChangedSinceSave = false;
    sourceDataBaselineHash = materialFingerprint(coreDB);

    if (Array.isArray(stateObj.favoriteMaterials)) {
        favoriteMaterials = stateObj.favoriteMaterials.filter(name => typeof name === 'string');
    }

    if (Array.isArray(stateObj.reportTemperatures)) {
        reportTemperatures = stateObj.reportTemperatures.filter(t => temperatures.includes(t));
        if (reportTemperatures.length === 0) reportTemperatures = [20, 50, 100, 150];
    }

    if (stateObj.activeReportSubTab === 'equipment' || stateObj.activeReportSubTab === 'gaskets') {
        activeReportSubTab = stateObj.activeReportSubTab;
    }

    if (Array.isArray(stateObj.equipmentActiveProperties)) {
        equipmentActiveProperties = stateObj.equipmentActiveProperties.filter(key => propertiesList.some(p => p.key === key));
    }

    if (Array.isArray(stateObj.equipmentStressColumns)) {
        equipmentStressColumns = stateObj.equipmentStressColumns.filter(col =>
            col && ['gv', 'nue', 'pnue', 'as', 'pz', 'mrz'].includes(col.mode) && temperatures.includes(col.temp));
    }

    if (stateObj.reportEquipSeismicVal === '1' || stateObj.reportEquipSeismicVal === '2') {
        reportEquipSeismicVal = stateObj.reportEquipSeismicVal;
    }

    reportMaterials = normalizeReportItems(stateObj.reportMaterials || [], ['Фланець', 'Шпильки', 'Різьба']);
    reportMaterialsEquip = normalizeReportItems(stateObj.reportMaterialsEquip || [],
        ['Всі деталі (крім шпильок)', 'Зварювальні та наплавні матеріали', 'Шпильки', 'Опора']);

    if (stateObj.coefficients && typeof stateObj.coefficients === 'object' && typeof document !== 'undefined') {
        Object.entries(stateObj.coefficients).forEach(([k, v]) => {
            const inp = document.getElementById(k);
            if (inp && v !== null && v !== undefined) inp.value = String(v);
        });
    }

    if (typeof localStorage !== 'undefined') {
        if (!saveToLocalStorage()) {
            if (previousState) localStorage.setItem('pnae_state_v2', previousState);
            else localStorage.removeItem('pnae_state_v2');
            restoreCoefficientValues(previousCoefficients);
            loadFromLocalStorage();
            return { success: false, reason: "Помилка запису сховища під час імпорту" };
        }
    }

    // Refresh UI if DOM is available
    if (typeof document !== 'undefined') {
        if (typeof updateMaterialList === 'function') updateMaterialList();
        if (el.mat) el.mat.value = 0;
        if (typeof updateKpList === 'function') updateKpList();
        if (el.kp) el.kp.value = 0;
        if (typeof renderTable === 'function') renderTable();
        if (typeof renderChart === 'function') renderChart();
        if (typeof updateCalculator === 'function') updateCalculator();
        if (typeof renderReportList === 'function') renderReportList();
        if (typeof renderReportTable === 'function') renderReportTable();
        if (typeof renderReportStressTable === 'function') renderReportStressTable();
        if (typeof renderReportTableEquip === 'function') renderReportTableEquip();
        if (typeof renderReportStressTableEquip === 'function') renderReportStressTableEquip();
        if (typeof switchReportSubTab === 'function') switchReportSubTab(activeReportSubTab);
    }

    return { success: true };
}

let pendingBackupRestore = null;
function initBackupPreview() {
    const modal = document.getElementById('backupPreviewModal');
    if (!modal) return;
    const close = () => { modal.hidden = true; pendingBackupRestore = null; };
    document.getElementById('btnCloseBackupPreview').addEventListener('click', close);
    document.getElementById('btnCancelBackupPreview').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.getElementById('btnConfirmBackupRestore').addEventListener('click', () => {
        if (!pendingBackupRestore) return;
        const data = pendingBackupRestore;
        const result = applyBackupState(data);
        if (result.success) {
            close();
            showToast('Резервну копію відновлено; попередній стан доступний через «Скасувати»', 'success');
        } else showToast('Помилка відновлення: ' + result.reason, 'error');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
}
function previewBackup(data, fileName) {
    const validation = validateBackupSchema(data);
    if (!validation.valid) return {success:false, reason:validation.reason};
    const state = validation.state;
    const importedMaterials = Array.isArray(data.materials) ? data.materials : (() => {
        const byOrigin = new Map(coreDB.map(m => [m.name, structuredClone(m)]));
        for (const name of state.deletedBaseNames || []) byOrigin.delete(name);
        for (const row of state.overrides || []) byOrigin.set(row.baseName, row.material);
        for (const mat of state.custom || []) byOrigin.set(mat.name, mat);
        return [...byOrigin.values()];
    })();
    const current = new Map(appMaterials.map(m => [canonicalMaterialKey(m.name), m]));
    const next = new Map(importedMaterials.map(m => [canonicalMaterialKey(m.name), m]));
    const added = [...next].filter(([key]) => !current.has(key)).map(([,m])=>m.name);
    const removed = [...current].filter(([key]) => !next.has(key)).map(([,m])=>m.name);
    const changed = [...next].filter(([key,m]) => current.has(key) && JSON.stringify(current.get(key)) !== JSON.stringify(m)).map(([,m])=>m.name);
    const sanitize = values => values.length ? values.slice(0,40).join(', ') + (values.length>40?' …':'') : 'немає';
    const info = document.getElementById('backupPreviewInfo');
    const diff = document.getElementById('backupPreviewDiff');
    info.textContent = `${fileName}\nПоточна база: ${appMaterials.length} матеріалів. Резервна копія: ${importedMaterials.length} матеріалів.\nВідновлення ЗАМІНИТЬ поточний стан браузера. data.js на диску не зміниться.`;
    diff.textContent = [
        `Додано матеріалів: ${added.length}\n${sanitize(added)}`,
        `Змінено матеріалів: ${changed.length}\n${sanitize(changed)}`,
        `Буде вилучено матеріалів: ${removed.length}\n${sanitize(removed)}`,
        `Список прокладок: ${reportMaterials.length} → ${(state.reportMaterials || []).length}`,
        `Список обладнання: ${reportMaterialsEquip.length} → ${(state.reportMaterialsEquip || []).length}`,
        `Коефіцієнти: ${state.coefficients ? 'відновлюються з копії' : 'не містяться в цій копії (поточні значення залишаться)'}`,
        `Робочі температури та параметри звіту: будуть відновлені з копії, якщо присутні`
    ].join('\n\n');
    pendingBackupRestore = data;
    const modal = document.getElementById('backupPreviewModal');
    modal.dataset.mode = 'backup';
    document.getElementById('btnConfirmBackupRestore').hidden = false;
    modal.hidden = false;
    return {success:true};
}
function importBackupJSONFile(file) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { showToast('JSON більший за 20 МБ. Перевірте файл.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const parsed = JSON.parse(e.target.result);
            const result = previewBackup(parsed, file.name);
            if (!result.success) showToast('Помилка імпорту: ' + result.reason, 'error');
        } catch (error) {
            console.error('Некоректний JSON резервної копії', error);
            showToast('Не вдалося прочитати резервну копію JSON', 'error');
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function deleteCurrentMaterial() {
    const index = editingMatIndex;
    if (index < 0 || !appMaterials[index]) return false;
    const material = appMaterials[index];
    const versionCount = material.grades.length;
    const message = `Видалити матеріал «${material.name}» (усі варіанти: ${versionCount})?\n\n` +
        'Він також буде вилучений з обраного та обох списків «Для звіту». Дію можна скасувати кнопкою «Скасувати» до закриття сторінки.';
    if (typeof confirm === 'function' && !confirm(message)) return false;

    const previous = JSON.stringify({ appMaterials, appMaterialOrigins, favoriteMaterials,
        reportMaterials, reportMaterialsEquip, recentViews });
    appMaterials.splice(index, 1);
    appMaterialOrigins.splice(index, 1);
    favoriteMaterials = favoriteMaterials.filter(name => name !== material.name);
    recentViews = recentViews.filter(name => name !== material.name);
    reportMaterials = normalizeReportItems(reportMaterials.filter(item => item.matName !== material.name),
        ['Фланець', 'Шпильки', 'Різьба']);
    reportMaterialsEquip = normalizeReportItems(reportMaterialsEquip.filter(item => item.matName !== material.name),
        ['Всі деталі (крім шпильок)', 'Зварювальні та наплавні матеріали', 'Шпильки', 'Опора']);

    if (!saveToLocalStorage()) {
        ({ appMaterials, appMaterialOrigins, favoriteMaterials, reportMaterials,
            reportMaterialsEquip, recentViews } = JSON.parse(previous));
        return false;
    }

    closeMaterialModal(true);
    if (el.search) el.search.value = '';
    updateMaterialList();
    renderReportList();
    renderReportTable();
    renderReportStressTable();
    renderReportTableEquip();
    renderReportStressTableEquip();
    if (typeof renderRecentViews === 'function') renderRecentViews();
    showToast(`Матеріал «${material.name}» видалено`, 'success');
    return true;
}

function resetCurrentMaterialToCore(skipConfirm = false) {
    const baseName = appMaterialOrigins[editingMatIndex];
    const baseMat = coreDB.find(material => material.name === baseName);
    if (editingMatIndex < 0 || !baseMat) {
        showToast('Цю дію можна застосувати лише до базових марок ПНАЕ', 'warning');
        return false;
    }
    if (!skipConfirm && typeof confirm === 'function' &&
        !confirm(`Відновити початкові нормативні дані для марки «${baseMat.name}»? Всі локальні зміни для цієї марки будуть скасовані.`)) {
        return false;
    }

    const previous = JSON.stringify({ appMaterials, favoriteMaterials,
        reportMaterials, reportMaterialsEquip, recentViews });
    const index = editingMatIndex;
    const oldName = appMaterials[index].name;
    appMaterials[index] = JSON.parse(JSON.stringify(baseMat));
    favoriteMaterials = [...new Set(favoriteMaterials.map(name => name === oldName ? baseMat.name : name))];
    recentViews = [...new Set(recentViews.map(name => name === oldName ? baseMat.name : name))];
    const rebind = items => items.flatMap(item => {
        if (Number(item.matIndex) !== index) return [item];
        const sig = item.kpSig || getGradeSignature({ kp: item.kp, description: item.description });
        let gradeIndex = baseMat.grades.findIndex(grade => getGradeSignature(grade) === sig);
        if (gradeIndex < 0) {
            const candidates = baseMat.grades.map((grade, i) => ({grade, i}))
                .filter(entry => entry.grade.kp === item.kp);
            if (candidates.length === 1) gradeIndex = candidates[0].i;
        }
        // Never silently redirect an obsolete assortment to the wrong KP.
        if (gradeIndex < 0) return [];
        return [{ ...item, matName: baseMat.name, kpIndex: gradeIndex }];
    });
    reportMaterials = rebind(reportMaterials);
    reportMaterialsEquip = rebind(reportMaterialsEquip);
    if (!saveToLocalStorage()) {
        ({ appMaterials, favoriteMaterials, reportMaterials, reportMaterialsEquip,
            recentViews } = JSON.parse(previous));
        return false;
    }
    closeMaterialModal(true);

    if (typeof document !== 'undefined') {
        if (el.search) el.search.value = '';
        if (typeof updateMaterialList === 'function') updateMaterialList();
        if (el.mat) el.mat.value = index;
        if (typeof updateKpList === 'function') updateKpList();
        if (el.kp) el.kp.value = 0;
        if (typeof renderTable === 'function') renderTable();
        if (typeof renderChart === 'function') renderChart();
        if (typeof updateCalculator === 'function') updateCalculator();
        if (typeof renderReportList === 'function') renderReportList();
        if (typeof renderReportTable === 'function') renderReportTable();
        if (typeof renderReportStressTable === 'function') renderReportStressTable();
        if (typeof renderReportTableEquip === 'function') renderReportTableEquip();
        if (typeof renderReportStressTableEquip === 'function') renderReportStressTableEquip();
    }

    showToast(`Початкові дані марки «${baseMat.name}» успішно відновлено з бази ПНАЕ`, 'success');
    return true;
}

let isSelecting = false;
let startRowIndex = -1;
let startColIndex = -1;
let activeTable = null;
let activeGrid = [];

function clearCellSelection() {
    document.querySelectorAll('.cell-selected').forEach(el => el.classList.remove('cell-selected'));
}

function initReportCopyButtons() {
    ['reportTableWrapper', 'reportStressTableWrapper', 'reportTableEquipWrapper', 'reportStressTableEquipWrapper'].forEach(id => {
        const wrapper = document.getElementById(id);
        const header = wrapper.previousElementSibling;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'copy-table-button';
        button.textContent = 'Копіювати таблицю';
        button.setAttribute('aria-label', `Копіювати таблицю: ${header.querySelector('h3').textContent}`);
        button.addEventListener('click', event => {
            event.stopPropagation();
            copyReportTable(wrapper.querySelector('table'));
        });
        header.insertBefore(button, header.lastElementChild);
    });
}

function cleanClipboardCell(source) {
    const cell = source.cloneNode(true);
    const originalControls = source.querySelectorAll('select, input');
    cell.querySelectorAll('select, input').forEach((control, index) => {
        const original = originalControls[index];
        const text = original.tagName === 'SELECT' ? original.selectedOptions[0]?.textContent : original.value;
        control.replaceWith(document.createTextNode(text || ''));
    });
    cell.querySelectorAll('button, svg, script, style, .hidden, .invisible, .font-mono, [data-report-number]').forEach(node => node.remove());
    [cell, ...cell.querySelectorAll('*')].forEach(node => {
        Array.from(node.attributes).forEach(attr => {
            if (!['rowspan', 'colspan'].includes(attr.name)) node.removeAttribute(attr.name);
        });
    });
    cell.style.cssText = 'border:1px solid #000;padding:5pt;color:#000;background:#fff;vertical-align:middle;';
    return cell;
}

function makeClipboardTable(source, selectedOnly = false) {
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.style.cssText = 'border-collapse:collapse;font-family:Times New Roman,serif;font-size:11pt;color:#000;background:#fff;';
    if (selectedOnly) {
        const grid = buildTableGrid(source);
        const positions = grid.flatMap((row, r) => row.flatMap((cell, c) =>
            cell?.classList.contains('cell-selected') ? [{ r, c }] : []));
        if (!positions.length) return table;

        // A selected merged cell is ONE clipboard cell, even if it spans many rows.
        const selectedCells = new Set(positions.map(({ r, c }) => grid[r][c]));
        if (selectedCells.size === 1) {
            const cell = cleanClipboardCell(selectedCells.values().next().value);
            cell.removeAttribute('rowspan');
            cell.removeAttribute('colspan');
            table.insertRow().appendChild(cell);
            attachReportClipboardExplanation(table, source, true);
            return table;
        }

        const minR = Math.min(...positions.map(p => p.r)), maxR = Math.max(...positions.map(p => p.r));
        const minC = Math.min(...positions.map(p => p.c)), maxC = Math.max(...positions.map(p => p.c));
        const emitted = new Set();
        for (let r = minR; r <= maxR; r++) {
            const row = table.insertRow();
            for (let c = minC; c <= maxC; c++) {
                const sourceCell = grid[r]?.[c];
                if (!sourceCell || !sourceCell.classList.contains('cell-selected')) {
                    row.appendChild(document.createElement('td'));
                    continue;
                }
                if (emitted.has(sourceCell)) continue;
                emitted.add(sourceCell);
                const cell = cleanClipboardCell(sourceCell);
                // Clip merged cells to the selected rectangle; never duplicate their contents.
                let rowSpan = 1, colSpan = 1;
                while (r + rowSpan <= maxR && grid[r + rowSpan]?.[c] === sourceCell) rowSpan++;
                while (c + colSpan <= maxC && grid[r]?.[c + colSpan] === sourceCell) colSpan++;
                if (rowSpan > 1) cell.setAttribute('rowspan', rowSpan);
                else cell.removeAttribute('rowspan');
                if (colSpan > 1) cell.setAttribute('colspan', colSpan);
                else cell.removeAttribute('colspan');
                row.appendChild(cell);
            }
        }
    } else {
        Array.from(source.children).filter(section => ['THEAD', 'TBODY', 'TFOOT'].includes(section.tagName)).forEach(section => {
            const copy = document.createElement(section.tagName);
            Array.from(section.rows).forEach((row, index) => {
                const newRow = copy.insertRow();
                Array.from(row.cells).forEach((cell, cellIndex) => {
                    // Remove UI-only trailing control cells, not merged equipment group headings.
                    const lastCell = cellIndex === row.cells.length - 1;
                    const actionHeader = section.tagName === 'THEAD' && index === 0 &&
                        lastCell && !!cell.querySelector('button[onclick^="add"]');
                    const blankActionColumn = section.tagName === 'TBODY' &&
                        lastCell && row.cells.length > 1 && !cell.textContent.trim() &&
                        !cell.querySelector('button') && !cell.hasAttribute('colspan');
                    if (source.closest('#view-report') && (actionHeader || blankActionColumn)) return;
                    newRow.appendChild(cleanClipboardCell(cell));
                });
            });
            table.appendChild(copy);
        });
    }
    attachReportClipboardExplanation(table, source, selectedOnly);
    return table;
}

function clipboardTableText(table) {
    const grid = buildTableGrid(table, 'tr');
    return grid.map((row, r) => row.map((cell, c) => {
        // Plain text does not support rowspan/colspan. Keep empty slots instead
        // of repeating a merged cell's text on every occupied grid position.
        if (!cell || (r > 0 && grid[r - 1]?.[c] === cell) ||
            (c > 0 && row[c - 1] === cell)) return '';
        return cell.textContent.replace(/\s+/g, ' ').trim();
    }).join('\t')).join('\n');
}

function copyHTMLFallback(html, text) {
    let copied = false;
    const onCopy = event => {
        event.clipboardData.setData('text/html', html);
        event.clipboardData.setData('text/plain', text);
        event.preventDefault();
        event.stopImmediatePropagation();
        copied = true;
    };
    document.addEventListener('copy', onCopy, true);
    try {
        return document.execCommand('copy') && copied;
    } catch (error) {
        return false;
    } finally {
        document.removeEventListener('copy', onCopy, true);
    }
}

function flashCopiedTable(table) {
    if (!table) return;
    table.classList.remove('sb-copied-table');
    void table.offsetWidth;
    table.classList.add('sb-copied-table');
    setTimeout(() => table.classList.remove('sb-copied-table'), 460);
}

async function copyReportTable(source) {
    if (!source.tHead?.rows.length || !source.tBodies[0]?.rows.length ||
        source.tBodies[0].rows[0].cells.length === 1) {
        showToast('Спочатку додайте матеріали та характеристики до таблиці.', 'warning');
        return;
    }
    const table = makeClipboardTable(source);
    const html = table.outerHTML;
    const text = clipboardTableText(table);
    try {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('HTML Clipboard API unavailable');
        await navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' })
        })]);
    } catch (error) {
        if (!copyHTMLFallback(html, text)) {
            showToast('Браузер не дозволив копіювання. Виділіть комірки та натисніть Ctrl+C.', 'error');
            return;
        }
    }
    flashCopiedTable(source);
    showToast('Таблицю скопійовано. Вставте у Word за допомогою Ctrl+V.', 'success');
}

function buildTableGrid(table, rowSelector = 'tbody tr') {
    let grid = [];
    const rows = table.querySelectorAll(rowSelector);
    rows.forEach((row, r) => {
        if (!grid[r]) grid[r] = [];
        let c = 0;
        Array.from(row.children).forEach(cell => {
            while (grid[r][c]) c++; 
            const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
            const colspan = parseInt(cell.getAttribute('colspan')) || 1;
            for (let i = 0; i < rowspan; i++) {
                for (let j = 0; j < colspan; j++) {
                    if (!grid[r+i]) grid[r+i] = [];
                    grid[r+i][c+j] = cell;
                }
            }
            cell.dataset.vRow = r;
            cell.dataset.vCol = c;
            c += colspan;
        });
    });
    return grid;
}

if (typeof document !== 'undefined') {
document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const td = e.target.closest('td');
    
    if (!td || e.target.closest('input') || e.target.closest('button')) {
        clearCellSelection();
        return;
    }

    const tr = td.parentElement;
    const table = tr.closest('table');
    if (!table || td.tagName === 'TH' || tr.parentElement.tagName === 'THEAD') return;

    isSelecting = true;
    activeTable = table;

    activeGrid = buildTableGrid(table); 

    startRowIndex = parseInt(td.dataset.vRow);
    startColIndex = parseInt(td.dataset.vCol);

    clearCellSelection();
    td.classList.add('cell-selected');
});

document.addEventListener('mouseover', (e) => {
    if (!isSelecting || !activeTable) return;
    const td = e.target.closest('td');
    if (!td) return;

    const tr = td.parentElement;
    if (tr.closest('table') !== activeTable || td.tagName === 'TH') return;

    const currentRowIndex = parseInt(td.dataset.vRow);
    const currentColIndex = parseInt(td.dataset.vCol);

    clearCellSelection();

    const rowStart = Math.min(startRowIndex, currentRowIndex);
    const rowEnd = Math.max(startRowIndex, currentRowIndex);
    const colStart = Math.min(startColIndex, currentColIndex);
    const colEnd = Math.max(startColIndex, currentColIndex);

    const selectedSet = new Set();
    for (let r = rowStart; r <= rowEnd; r++) {
        if (!activeGrid[r]) continue;
        for (let c = colStart; c <= colEnd; c++) {
            const cell = activeGrid[r][c];
            if (cell && cell.tagName === 'TD') {
                selectedSet.add(cell);
            }
        }
    }
    
    selectedSet.forEach(cell => cell.classList.add('cell-selected'));
});

document.addEventListener('mouseup', () => { isSelecting = false; });

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyA' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'ф')) {
        
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.target.closest('#newMatTableBody')) return; 
            return;
        }

        let hoveredTable = null;
        const hoverElements = document.querySelectorAll(':hover');
        for (let i = hoverElements.length - 1; i >= 0; i--) {
            if (hoverElements[i].tagName === 'TABLE') {
                hoveredTable = hoverElements[i];
                break;
            }
        }

        const targetTable = e.target.closest('table') || hoveredTable;
        if (!targetTable) {
            // Neither focus nor hover is inside a table: allow standard browser text selection
            return;
        }

        e.preventDefault(); 
        clearCellSelection();
        document.querySelectorAll('.input-selected').forEach(el => el.classList.remove('input-selected'));

        if (targetTable.closest('#addMatModal')) {
            document.querySelectorAll('#newMatTableBody input').forEach(inp => inp.classList.add('input-selected'));
            return;
        }

        if (targetTable.offsetParent !== null) {
            buildTableGrid(targetTable); 
            const cells = targetTable.querySelectorAll('tbody td:not(.sticky-col):not(.border-r)');
            cells.forEach(td => {
                if (td.innerText.trim() !== '' || td.querySelector('span') || td.id) {
                    td.classList.add('cell-selected');
                }
            });
        }
    }
});

document.addEventListener('copy', (e) => {
    const selectedInputs = document.querySelectorAll('.input-selected');
    if (selectedInputs.length > 0) {
        let rows = new Map();
        selectedInputs.forEach(inp => {
            const r = parseInt(inp.dataset.gridR);
            const c = parseInt(inp.dataset.gridC);
            if (!rows.has(r)) rows.set(r, []);
            rows.get(r).push({ col: c, val: inp.value });
        });

        const sortedRowKeys = Array.from(rows.keys()).sort((a, b) => a - b);
        let clipboardText = '';
        sortedRowKeys.forEach(key => {
            const rowData = rows.get(key).sort((a, b) => a.col - b.col).map(item => item.val);
            clipboardText += rowData.join('\t') + '\n';
        });

        e.clipboardData.setData('text/plain', clipboardText.trim());
        e.preventDefault();
        
        selectedInputs.forEach(inp => {
            inp.style.transition = 'none';
            inp.style.backgroundColor = '#10b981';
            inp.style.color = '#ffffff';
            setTimeout(() => {
                inp.style.transition = '';
                inp.style.backgroundColor = '';
                inp.style.color = '';
            }, 420);
        });
        return;
    }

    const selectedCells = document.querySelectorAll('.cell-selected');
    if (selectedCells.length === 0) return;

    const tables = [...new Set(Array.from(selectedCells, cell => cell.closest('table')))];
    const copies = tables.map(table => makeClipboardTable(table, true));
    e.clipboardData.setData('text/html', copies.map(table => table.outerHTML).join('<br>'));
    e.clipboardData.setData('text/plain', copies.map(clipboardTableText).join('\n\n'));
    e.preventDefault();
    
    selectedCells.forEach(td => {
        td.classList.add('cell-copied');
        setTimeout(() => {
            td.classList.remove('cell-copied');
        }, 450);
    });
});
}

window.switchReportSubTab = function(tab) {
    activeReportSubTab = tab;
    const btnGaskets = document.getElementById('btnReportSubTabGaskets');
    const btnEquip = document.getElementById('btnReportSubTabEquipment');
    const contentGaskets = document.getElementById('report-content-gaskets');
    const contentEquip = document.getElementById('report-content-equipment');
    const actionsGaskets = document.getElementById('reportActionsGaskets');
    const actionsEquipment = document.getElementById('reportActionsEquipment');
    const equipControls = document.getElementById('reportEquipControls');
    setSegmentedSelection([btnGaskets, btnEquip], tab === 'gaskets' ? btnGaskets : btnEquip, true);

    if (tab === 'gaskets') {
        contentGaskets.classList.remove('hidden');
        contentEquip.classList.add('hidden');
        actionsGaskets.classList.remove('hidden');
        actionsEquipment.classList.add('hidden');
        if (equipControls) {
            equipControls.classList.add('hidden');
            equipControls.classList.remove('flex');
        }
    } else {
        contentGaskets.classList.add('hidden');
        contentEquip.classList.remove('hidden');
        actionsGaskets.classList.add('hidden');
        actionsEquipment.classList.remove('hidden');
        if (equipControls) {
            equipControls.classList.remove('hidden');
            equipControls.classList.add('flex');
        }
    }

    saveToLocalStorage();
    renderReportList();
};

let isReportTableEquipVisible = true;
window.toggleReportTableEquip = function() {
    isReportTableEquipVisible = !isReportTableEquipVisible;
    const wrapper = document.getElementById('reportTableEquipWrapper');
    const icon = document.getElementById('reportTableEquipToggleIcon');
    
    if (isReportTableEquipVisible) {
        wrapper.classList.add('expanded');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.remove('expanded');
        icon.classList.remove('rotate-180');
    }
};

let isReportStressTableEquipVisible = true;
window.toggleReportStressTableEquip = function() {
    isReportStressTableEquipVisible = !isReportStressTableEquipVisible;
    const wrapper = document.getElementById('reportStressTableEquipWrapper');
    const icon = document.getElementById('reportStressTableEquipToggleIcon');
    
    if (isReportStressTableEquipVisible) {
        wrapper.classList.add('expanded');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.remove('expanded');
        icon.classList.remove('rotate-180');
    }
};

window.addEquipmentStressColumn = function() {
    const mode = 'nue';
    const temp = 100;
    
    equipmentStressColumns.push({ mode, temp });
    
    saveToLocalStorage();
    renderReportStressTableEquip();
};

window.updateEquipmentStressColumnMode = function(index, newMode) {
    if (equipmentStressColumns[index]) {
        equipmentStressColumns[index].mode = newMode;
        saveToLocalStorage();
        renderReportStressTableEquip();
    }
};

window.updateEquipmentStressColumnTemp = function(index, newTemp) {
    if (equipmentStressColumns[index]) {
        equipmentStressColumns[index].temp = parseFloat(newTemp);
            saveToLocalStorage();
        renderReportStressTableEquip();
    }
};

window.moveEquipmentStressColumn = function(index, direction) {
    const next = index + direction;
    if (!Number.isInteger(index) || !Number.isInteger(direction) ||
        Math.abs(direction) !== 1 || index < 0 || next < 0 || next >= equipmentStressColumns.length) return;
    const [column] = equipmentStressColumns.splice(index, 1);
    equipmentStressColumns.splice(next, 0, column);
    saveToLocalStorage();
    renderReportStressTableEquip();
};

window.removeEquipmentStressColumn = function(index) {
    equipmentStressColumns.splice(index, 1);
    saveToLocalStorage();
    renderReportStressTableEquip();
};

function renderReportTableEquip() {
    const thead = document.getElementById('reportEquipTableHeader');
    const tbody = document.getElementById('reportEquipTableBody');
    // Clear any explanation left from an earlier view before recalculating.
    reportFallbackRecords.delete(tbody.id);
    const oldExplanation = tbody.closest('.table-container')?.parentElement?.querySelector(':scope > .report-fallback-explanation');
    if (oldExplanation) oldExplanation.classList.add('hidden');
    if (!thead || !tbody) return;

    renderReportStressTableEquip();

    if (reportMaterialsEquip.length === 0) {
        thead.innerHTML = '';
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку обладнання, щоб сформувати таблицю</td></tr>`;
        return;
    }

    let headerHtml = `
        <tr>
            <th class="sticky-col-header first-col pt-4 pb-3 px-4 font-semibold text-left w-[240px] min-w-[240px] max-w-[240px] border-r border-slate-200 dark:border-slate-700 align-bottom bg-slate-50 dark:bg-slate-900">Матеріал</th>
            <th class="sticky-col-header pt-4 pb-3 px-4 font-semibold text-left w-[350px] min-w-[350px] max-w-[350px] border-r border-slate-200 dark:border-slate-700 align-bottom bg-slate-50 dark:bg-slate-900">Характеристика \\ Т, °С</th>
    `;

    reportTemperatures.forEach((t, index) => {
        let optionsHtml = temperatures.map(temp => 
            `<option value="${temp}" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" ${temp === t ? 'selected' : ''}>${temp}</option>`
        ).join('');

        headerHtml += `
            <th class="py-2.5 px-2 font-semibold text-center min-w-[90px] group border-b border-slate-200 dark:border-slate-700 align-middle bg-slate-50 dark:bg-slate-900">
                <div class="relative inline-block w-full">
                    <select onchange="updateReportTemp(${index}, this.value)" class="text-center w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 focus:border-brand-500 outline-none transition-colors text-slate-700 dark:text-slate-200 cursor-pointer font-semibold appearance-none" style="text-align-last: center;" title="Змінити температуру">
                        ${optionsHtml}
                    </select>
                    <button onclick="removeReportTemp(${index})" class="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 rounded transition-all" title="Видалити стовпець">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </th>
        `;
    });

    headerHtml += `
            <th class="py-3 px-2 text-center min-w-[50px] border-b border-slate-200 dark:border-slate-700 align-middle bg-slate-50 dark:bg-slate-900">
                <button onclick="addReportTemp()" class="text-brand-500 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 p-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto" title="Додати стовпець температури">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"></path></svg>
                </button>
            </th>
        </tr>
    `;
    thead.innerHTML = headerHtml;

    let html = '';
    const fallbackRecords = new Map();
    const activeProps = propertiesList.filter(p => equipmentActiveProperties.includes(p.key));

    if (activeProps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${reportTemperatures.length + 3}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Оберіть хоча б одну характеристику для відображення</td></tr>`;
        return;
    }

    reportMaterialsEquip.forEach((item, index) => {
        const material = appMaterials[item.matIndex];
        const grade = material.grades[item.kpIndex];
        const data = grade.data;

        activeProps.forEach((prop, pIdx) => {
            const rowClass = pIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50';
            html += `<tr class="hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-colors ${rowClass}">`;

            if (pIdx === 0) {
                html += `<td rowspan="${activeProps.length}" class="sticky-col bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 w-[240px] min-w-[240px] max-w-[240px]">
                    <span data-report-number aria-hidden="true">${index + 1}. </span>${escapeHTML(item.matName)}<br>
                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words whitespace-normal">${escapeHTML(getReportKpName(item))}</span>
                </td>`;
            }

            html += `<td class="py-2.5 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 w-[350px] min-w-[350px] max-w-[350px]">
                    ${prop.name} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                </td>`;

            const propData = data[prop.key];
            reportTemperatures.forEach((t) => {
                const info = getNearestHigherValueInfo(propData, t);
                const value = info.value;
                addReportFallbackRecord(fallbackRecords, item, prop.key, t, info);
                const fallbackTitle = getReportFallbackTitle(t, [[prop.key, info]]);
                const safeValue = formatReportPropertyValue(value);
                const displayValue = safeValue === '—' 
                    ? `<span class="text-slate-300 dark:text-slate-600">—</span>` 
                    : `<span class="font-semibold text-slate-700 dark:text-slate-200">${safeValue}${reportFallbackMarker(fallbackTitle)}</span>`;

                html += `<td class="py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"${reportFallbackCellAttrs(fallbackTitle)}>${displayValue}</td>`;
            });

            html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
            html += `</tr>`;
        });
    });
    tbody.innerHTML = html;
    updateReportFallbackExplanation(tbody, fallbackRecords);
}

function renderReportStressTableEquipHeader() {
    const thead = document.getElementById('reportEquipStressTableHeader');
    if (!thead) return;

    const modeOptions = [
        { value: "gv", label: "ГВ" },
        { value: "nue", label: "НУЕ, РР" },
        { value: "pnue", label: "ПНУЕ" },
        { value: "as", label: "АС" },
        { value: "pz", label: "НУЕ+ПЗ, ПНУЕ+ПЗ" },
        { value: "mrz", label: "НУЕ+МРЗ, ПНУЕ+МРЗ" }
    ];

    if (equipmentStressColumns.length === 0) {
        thead.innerHTML = `
            <tr>
                <th rowspan="2" class="sticky-col-header first-col pt-4 pb-3 px-4 font-semibold text-left w-[240px] min-w-[240px] max-w-[240px] border-r border-slate-200 dark:border-slate-700 z-30 align-bottom bg-slate-50 dark:bg-slate-900">Матеріал</th>
                <th rowspan="2" class="sticky-col-header pt-4 pb-3 px-4 font-semibold text-left w-[350px] min-w-[350px] max-w-[350px] border-r border-slate-200 dark:border-slate-700 align-bottom bg-slate-50 dark:bg-slate-900">Характеристика \\ Т, °С</th>
                <th rowspan="2" class="py-3 px-2 text-center min-w-[50px] border-b border-slate-200 dark:border-slate-700 align-middle bg-slate-50 dark:bg-slate-900">
                    <button onclick="addEquipmentStressColumn()" class="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 p-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto" title="Додати стовпець">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"></path></svg>
                    </button>
                </th>
            </tr>
            <tr></tr>
        `;
        return;
    }

    let row1 = `
        <th rowspan="2" class="sticky-col-header first-col pt-4 pb-3 px-4 font-semibold text-left w-[240px] min-w-[240px] max-w-[240px] border-r border-slate-200 dark:border-slate-700 z-30 align-bottom bg-slate-50 dark:bg-slate-900">Матеріал</th>
        <th rowspan="2" class="sticky-col-header pt-4 pb-3 px-4 font-semibold text-left w-[350px] min-w-[350px] max-w-[350px] border-r border-slate-200 dark:border-slate-700 align-bottom bg-slate-50 dark:bg-slate-900">Характеристика \\ Т, °С</th>
    `;
    let row2 = '';

    equipmentStressColumns.forEach((col, idx) => {
        let bgStyleClass = 'bg-slate-50/80 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';

        let modeSelectOptions = modeOptions.map(opt => 
            `<option value="${opt.value}" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" ${opt.value === col.mode ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        row1 += `
            <th class="py-2 px-2 font-bold text-center border-b border-r border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider relative group ${bgStyleClass} align-middle">
                <div class="relative inline-block w-full min-w-[90px] px-3">
                    <select onchange="updateEquipmentStressColumnMode(${idx}, this.value)" class="text-center w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 focus:border-brand-500 outline-none transition-colors text-slate-700 dark:text-slate-200 cursor-pointer font-bold appearance-none" style="text-align-last: center;" title="Змінити режим">
                        ${modeSelectOptions}
                    </select>
                    <button onclick="removeEquipmentStressColumn(${idx})" class="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 rounded transition-all" title="Видалити стовпець">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="sb-equip-column-order-controls" role="group" aria-label="Змінити порядок стовпця ${idx + 1}">
                    <button type="button" onclick="moveEquipmentStressColumn(${idx}, -1)" aria-label="Перемістити стовпець ліворуч" title="Перемістити ліворуч" ${idx === 0 ? 'disabled' : ''}>←</button>
                    <button type="button" onclick="moveEquipmentStressColumn(${idx}, 1)" aria-label="Перемістити стовпець праворуч" title="Перемістити праворуч" ${idx === equipmentStressColumns.length - 1 ? 'disabled' : ''}>→</button>
                </div>
            </th>
        `;

        let tempSelectOptions = temperatures.map(t => 
            `<option value="${t}" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" ${t === col.temp ? 'selected' : ''}>${t}</option>`
        ).join('');

        row2 += `
            <th class="py-2 px-2 font-semibold text-center min-w-[90px] border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 align-middle">
                <div class="relative inline-block w-full px-2">
                    <select onchange="updateEquipmentStressColumnTemp(${idx}, this.value)" class="text-center w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 focus:border-brand-500 outline-none transition-colors cursor-pointer font-semibold appearance-none" style="text-align-last: center;" title="Змінити температуру">
                        ${tempSelectOptions}
                    </select>
                </div>
            </th>
        `;
    });

    let addBtnHtml1 = `
        <th rowspan="2" class="py-3 px-2 text-center min-w-[50px] border-b border-slate-200 dark:border-slate-700 align-middle bg-slate-50 dark:bg-slate-900">
            <button onclick="addEquipmentStressColumn()" class="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 p-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto" title="Додати стовпець">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14"></path></svg>
            </button>
        </th>
    `;

    thead.innerHTML = `
        <tr>${row1}${addBtnHtml1}</tr>
        <tr>${row2}</tr>
    `;
}

function renderReportStressTableEquip() {
    renderReportStressTableEquipHeader();
    const tbody = document.getElementById('reportEquipStressTableBody');
    // Clear any explanation left from an earlier view before recalculating.
    reportFallbackRecords.delete(tbody.id);
    const oldExplanation = tbody.closest('.table-container')?.parentElement?.querySelector(':scope > .report-fallback-explanation');
    if (oldExplanation) oldExplanation.classList.add('hidden');
    if (!tbody) return;

    if (reportMaterialsEquip.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${equipmentStressColumns.length + 3}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку обладнання, щоб сформувати таблицю</td></tr>`;
        return;
    }

    if (equipmentStressColumns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте стовпець (режим, температура) за допомогою панелі вище</td></tr>`;
        return;
    }

    const coefs = validateCoefficients();
    if (!coefs.valid) {
        tbody.innerHTML = `<tr><td colspan="${equipmentStressColumns.length + 3}" class="p-6 text-center bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold border-2 border-dashed border-rose-300 dark:border-rose-800 rounded-xl">⚠ Розрахунок напружень заблоковано: введено некоректні коефіцієнти (${coefs.errors.map(escapeHTML).join('; ')}). Коефіцієнти мають бути додатними скінченними числами (> 0).</td></tr>`;
        return;
    }

    const nm = coefs.values.calcNm;
    const nt = coefs.values.calcNt;
    const ntBolt = coefs.values.calcNtBolt;
    const gm = coefs.values.calcGm;
    const gc = coefs.values.calcGc;
    const gnNue = coefs.values.calcGnNue;
    const gnPz = coefs.values.calcGnPz;
    
    const seismicCategory = document.getElementById('reportEquipSeismic')?.value || '1';
    const isReportDevMode = document.getElementById('reportDevModeToggle')?.checked || false;

    let html = '';
    const fallbackRecords = new Map();

    const equipElementsConfig = [
        {
            name: "Всі деталі (крім шпильок)",
            props: [
                { symbol: "(&sigma;)<sub>1</sub>", units: "МПа", key: "det_s1" },
                { symbol: "(&sigma;)<sub>2</sub>", units: "МПа", key: "det_s2" },
                { symbol: "(&sigma;)<sub>RV</sub>", units: "МПа", key: "det_srv" },
                { symbol: "(&sigma;<sub>s</sub>)<sub>1</sub>", units: "МПа", key: "det_ss1" },
                { symbol: "(&sigma;<sub>s</sub>)<sub>2</sub>", units: "МПа", key: "det_ss2" },
                { symbol: "(&tau;)<sub>s</sub>", units: "МПа", key: "det_ts" }
            ]
        },
        {
            name: "Зварювальні та наплавні матеріали",
            props: [
                { symbol: "(&sigma;)<sub>1</sub>", units: "МПа", key: "det_s1" },
                { symbol: "(&sigma;)<sub>2</sub>", units: "МПа", key: "det_s2" },
                { symbol: "(&sigma;)<sub>RV</sub>", units: "МПа", key: "det_srv" },
                { symbol: "(&sigma;<sub>s</sub>)<sub>1</sub>", units: "МПа", key: "det_ss1" },
                { symbol: "(&sigma;<sub>s</sub>)<sub>2</sub>", units: "МПа", key: "det_ss2" },
                { symbol: "(&tau;)<sub>s</sub>", units: "МПа", key: "det_ts" }
            ]
        },
        {
            name: "Шпильки",
            props: [
                { symbol: "(&sigma;)<sub>1</sub>", units: "МПа", key: "bolt_s1" },
                { symbol: "(&sigma;)<sub>3w</sub>", units: "МПа", key: "bolt_s3w" },
                { symbol: "(&sigma;)<sub>4w</sub>", units: "МПа", key: "bolt_s4w" },
                { symbol: "(&sigma;<sub>s</sub>)<sub>mw</sub>", units: "МПа", key: "bolt_ssmw" },
                { symbol: "(&sigma;<sub>s</sub>)<sub>4w</sub>", units: "МПа", key: "bolt_ss4w" },
                { symbol: "(&tau;<sub>s</sub>)<sub>s</sub>", units: "МПа", key: "bolt_ts" }
            ]
        },
        {
            name: "Опора",
            props: [
                { symbol: "[R]", units: "МПа", key: "support_R" }
            ]
        }
    ];

    equipElementsConfig.forEach((el) => {
        const matchingMaterials = reportMaterialsEquip.filter(item => {
            const itemElements = (item.elements && Array.isArray(item.elements) && item.elements.length > 0)
                ? item.elements
                : ["Всі деталі (крім шпильок)", "Зварювальні та наплавні матеріали", "Шпильки", "Опора"];
            return itemElements.includes(el.name);
        });

        if (matchingMaterials.length === 0) return;

        html += `
            <tr class="bg-indigo-50/50 dark:bg-indigo-950/20 font-bold text-indigo-700 dark:text-indigo-400">
                <td colspan="${equipmentStressColumns.length + 3}" class="py-2.5 px-4 text-center border-b border-slate-200 dark:border-slate-700 text-sm font-bold uppercase tracking-wider">
                    ${el.name}
                </td>
            </tr>
        `;

        matchingMaterials.forEach((item, matIdx) => {
            const material = appMaterials[item.matIndex];
            const grade = material.grades[item.kpIndex];
            const data = grade.data;
            const isBrittle = isBrittleMaterial(material);

            el.props.forEach((prop, pIdx) => {
                const rowClass = pIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50';
                html += `<tr class="hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-colors ${rowClass}">`;

                if (pIdx === 0) {
                    html += `<td rowspan="${el.props.length}" class="sticky-col bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 w-[240px] min-w-[240px] max-w-[240px]">
                        <span data-report-number aria-hidden="true">${matIdx + 1}. </span>${escapeHTML(item.matName)}<br>
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words whitespace-normal">${escapeHTML(getReportKpName(item))}</span>
                        ${isBrittle ? '<span class="sb-brittle-notice" title="Для цього крихкого матеріалу у звіті обладнання не передбачено розрахунок за формулами пластичних матеріалів">Крихкий матеріал · потрібна окрема методика</span>' : ''}
                    </td>`;
                }

                html += `<td class="py-2.5 px-4 text-sm border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 w-[350px] min-w-[350px] max-w-[350px]">
                    <span class="inline-block text-slate-400 dark:text-slate-500 font-normal bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                </td>`;

                equipmentStressColumns.forEach((col) => {
                    const rtmInfo = getNearestHigherValueInfo(data['RTm'], col.temp);
                    const rtpInfo = getNearestHigherValueInfo(data['RTp'], col.temp);
                    const rtm = rtmInfo.value;
                    const rtp = rtpInfo.value;

                    let val = "—";
                    let formula = "";

                    const sigma = getPlasticBaseStress(material, rtm, rtp, nm, nt);
                    const sigmaW = getBoltBaseStress(material, rtp, ntBolt);
                    const hasRtp = !isBrittle && rtp !== "—";

                    if (prop.key.startsWith("det_")) {
                        if (sigma !== null) {
                            
                            if (prop.key === "det_s1") {
                                if (col.mode === "gv") { val = roundExcel(sigma * PNAE_COEFS.gv_s1, 2); formula = `[σ]<sub>ГВ</sub> &times; 1,35`; }
                                else if (col.mode === "nue") { val = roundExcel(sigma * 1.0, 2); formula = `[σ]`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigma * PNAE_COEFS.s1_pnue, 2); formula = `[σ] &times; 1,2`; }
                                else if (col.mode === "as") { val = roundExcel(sigma * PNAE_COEFS.s1_as, 2); formula = `[σ] &times; 1,4`; }
                            } else if (prop.key === "det_s2") {
                                if (col.mode === "gv") { val = roundExcel(sigma * PNAE_COEFS.gv_s2, 2); formula = `[σ]<sub>ГВ</sub> &times; 1,7`; }
                                else if (col.mode === "nue") { val = roundExcel(sigma * PNAE_COEFS.s2_nue, 2); formula = `[σ] &times; 1,3`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigma * PNAE_COEFS.s2_pnue, 2); formula = `[σ] &times; 1,6`; }
                                else if (col.mode === "as") { val = roundExcel(sigma * PNAE_COEFS.s2_as, 2); formula = `[σ] &times; 1,8`; }
                            } else if (prop.key === "det_srv") {
                                if (col.mode === "nue" || col.mode === "pnue") {
                                    val = roundExcel(Math.min((2.5 - (rtp / rtm)) * rtp, 2 * rtp), 2);
                                    formula = `min((2,5-R<sup>T</sup><sub>p0,2</sub>/R<sup>T</sup><sub>m</sub>)R<sup>T</sup><sub>p0,2</sub>, 2R<sup>T</sup><sub>p0,2</sub>)`;
                                }
                            } else if (prop.key === "det_ss1") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * PNAE_COEFS.ss1_pz_cat1, 2); formula = `[σ] &times; 1,2`; }
                                    else { val = roundExcel(sigma * PNAE_COEFS.ss1_pz_cat2, 2); formula = `[σ] &times; 1,5`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * PNAE_COEFS.ss1_mrz_cat1, 2); formula = `[σ] &times; 1,4`; }
                                }
                            } else if (prop.key === "det_ss2") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * PNAE_COEFS.ss2_pz_cat1, 2); formula = `[σ] &times; 1,6`; }
                                    else { val = roundExcel(sigma * PNAE_COEFS.ss2_pz_cat2, 2); formula = `[σ] &times; 1,9`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * PNAE_COEFS.ss2_mrz_cat1, 2); formula = `[σ] &times; 1,8`; }
                                }
                            } else if (prop.key === "det_ts") {
                                const shearFactor = getSeismicShearFactor(seismicCategory, col.mode);
                                if (shearFactor !== null) {
                                    val = roundExcel(sigma * shearFactor, 2);
                                    formula = `[σ] &times; ${String(shearFactor).replace('.', ',')}`;
                                }
                            }
                        }
                    } 
                    else if (prop.key.startsWith("bolt_")) {
                        if (sigmaW !== null) {

                            if (prop.key === "bolt_s1") {
                                if (col.mode === "gv") { val = roundExcel(rtp * PNAE_COEFS.bolt_gv_rtp_mult, 2); formula = `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; 0,7`; }
                                else if (col.mode === "nue") { val = roundExcel(sigmaW * 1.0, 2); formula = `[σ]<sub>w</sub>`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_pnue, 2); formula = `[σ]<sub>w</sub> &times; 1,2`; }
                                else if (col.mode === "as") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s1_as, 2); formula = `[σ]<sub>w</sub> &times; 1,4`; }
                            } else if (prop.key === "bolt_s3w") {
                                if (col.mode === "nue") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s3w_nue, 2); formula = `[σ]<sub>w</sub> &times; 1,3`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s3w_pnue, 2); formula = `[σ]<sub>w</sub> &times; 1,6`; }
                                else if (col.mode === "as") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s3w_as, 2); formula = `[σ]<sub>w</sub> &times; 1,8`; }
                            } else if (prop.key === "bolt_s4w") {
                                if (col.mode === "nue") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s4w_nue, 2); formula = `[σ]<sub>w</sub> &times; 1,7`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s4w_pnue, 2); formula = `[σ]<sub>w</sub> &times; 2,0`; }
                                else if (col.mode === "as") { val = roundExcel(sigmaW * PNAE_COEFS.bolt_s4w_as, 2); formula = `[σ]<sub>w</sub> &times; 2,4`; }
                            } else if (prop.key === "bolt_ssmw") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * PNAE_COEFS.bolt_ssmw_pz_cat1, 2); formula = `[σ]<sub>w</sub> &times; 1,2`; }
                                    else { val = roundExcel(sigmaW * PNAE_COEFS.bolt_ssmw_pz_cat2, 2); formula = `[σ]<sub>w</sub> &times; 1,5`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * PNAE_COEFS.bolt_ssmw_mrz_cat1, 2); formula = `[σ]<sub>w</sub> &times; 1,4`; }
                                }
                            } else if (prop.key === "bolt_ss4w") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * PNAE_COEFS.bolt_ss4w_pz_cat1, 2); formula = `[σ]<sub>w</sub> &times; 2,0`; }
                                    else { val = roundExcel(sigmaW * PNAE_COEFS.bolt_ss4w_pz_cat2, 2); formula = `[σ]<sub>w</sub> &times; 2,3`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * PNAE_COEFS.bolt_ss4w_mrz_cat1, 2); formula = `[σ]<sub>w</sub> &times; 2,2`; }
                                }
                            } else if (prop.key === "bolt_ts") {
                                const shearFactor = getSeismicShearFactor(seismicCategory, col.mode, true);
                                if (shearFactor !== null) {
                                    val = roundExcel(sigmaW * shearFactor, 2);
                                    formula = `[σ]<sub>w</sub> &times; ${String(shearFactor).replace('.', ',')}`;
                                }
                            }
                        }
                    } 
                    else if (prop.key === "support_R") {
                        if (hasRtp) {
                            const Ry = rtp / gm;
                            if (col.mode === "gv") {
                                val = roundExcel((Ry * gc) / gnNue, 2);
                                formula = `(R<sub>y(ГВ)</sub> &times; &gamma;<sub>c</sub>) / &gamma;<sub>n(НУЕ)</sub>`;
                            } else if (col.mode === "nue") {
                                val = roundExcel((Ry * gc) / gnNue, 2);
                                formula = `(R<sub>y</sub> &times; &gamma;<sub>c</sub>) / &gamma;<sub>n(НУЕ)</sub>`;
                            } else if (col.mode === "pnue" || col.mode === "as" || col.mode === "pz") {
                                val = roundExcel((Ry * gc) / gnPz, 2);
                                formula = `(R<sub>y</sub> &times; &gamma;<sub>c</sub>) / &gamma;<sub>n(ПЗ)</sub>`;
                            } else if (col.mode === "mrz") {
                                if (seismicCategory === '1') {
                                    val = roundExcel((Ry * gc) / gnPz, 2);
                                    formula = `(R<sub>y</sub> &times; &gamma;<sub>c</sub>) / &gamma;<sub>n(ПЗ)</sub>`;
                                }
                            }
                        }
                    }

                    const stressDependencies = prop.key.startsWith('det_')
                        ? [['RTm', rtmInfo], ['RTp', rtpInfo]]
                        : [['RTp', rtpInfo]];
                    const fallbackTitle = val === '—' ? '' : getReportFallbackTitle(col.temp, stressDependencies);
                    if (val !== '—') {
                        stressDependencies.forEach(([key, info]) => addReportFallbackRecord(fallbackRecords, item, key, col.temp, info));
                    }

                    let displayValue = "";
                    if (val === "—") {
                        displayValue = `<span class="text-slate-300 dark:text-slate-600">—</span>`;
                    } else {
                        let valStr = String(val).replace('.', ',');
                        const isGvOrSeismic = col.mode === 'gv' || col.mode === 'pz' || col.mode === 'mrz';
                        if (isReportDevMode && formula !== "") {
                            const wrappedFormula = wrapFormulaVars(formula);
                            displayValue = `
                                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-1 leading-tight whitespace-nowrap tracking-tight font-medium">${wrappedFormula}</div>
                                <div class="font-bold text-slate-800 dark:text-slate-200 text-base">${valStr}${reportFallbackMarker(fallbackTitle)}</div>
                            `;
                        } else {
                            displayValue = `<span class="font-bold text-slate-800 dark:text-slate-200">${valStr}${reportFallbackMarker(fallbackTitle)}</span>`;
                        }
                    }

                    const bgClass = '';

                    html += `<td class="${bgClass} py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"${reportFallbackCellAttrs(fallbackTitle)}>${displayValue}</td>`;
                });

                html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
                html += `</tr>`;
            });
        });
    });
    tbody.innerHTML = html;
    updateReportFallbackExplanation(tbody, fallbackRecords);
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        roundExcel,
        parseCoefficient,
        validateCoefficients,
        PNAE_DEFAULT_COEFFICIENTS,
        getGradeSignature,
        getSavedMaterialChanges,
        restoreMaterialsFromState,
        makeClipboardTable,
        clipboardTableText,
        deleteCurrentMaterial,
        normalizeReportItems,
        isValidMaterial,
        validateBackupSchema,
        applyBackupState,
        resetCurrentMaterialToCore,
        closeMaterialModal,
        PNAE_COEFS,
        isBrittleMaterial,
        brittleFlangeStress,
        brittleFlangeFormula,
        getPlasticBaseStress,
        getBoltBaseStress,
        getSeismicShearFactor,
        appMaterials,
        coreDB
    };
}
