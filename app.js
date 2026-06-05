const PNAE_COEFS = {
    s1_pnue: 1.2,
    s2_nue: 1.3, s2_pnue: 1.6,
    s1_as: 1.4, s2_as: 1.8,
    ss1_pz_cat1: 1.2, ss1_mrz_cat1: 1.4,
    ss2_pz_cat1: 1.6, ss2_mrz_cat1: 1.8,
    ss1_pz_cat2: 1.5, ss2_pz_cat2: 1.9,
    ts_pz: 0.6, ts_mrz: 0.7,
    gv_s1: 1.35, gv_s2: 1.7,
    bolt_pnue: 1.2,
    bolt_s1_as: 1.4,
    bolt_s3w_nue: 1.3, bolt_s3w_pnue: 1.6, bolt_s3w_as: 1.8,
    bolt_s4w_nue: 1.7, bolt_s4w_pnue: 2.0, bolt_s4w_as: 2.4,
    bolt_ssmw_pz_cat1: 1.2, bolt_ssmw_mrz_cat1: 1.4,
    bolt_ss4w_pz_cat1: 2.0, bolt_ss4w_mrz_cat1: 2.2,
    bolt_ssmw_pz_cat2: 1.5,
    bolt_ss4w_pz_cat2: 2.3,
    bolt_ts_pz: 0.6, bolt_ts_mrz: 0.7,
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

let appMaterials = JSON.parse(JSON.stringify(coreDB));

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
    search: document.getElementById('searchInput'),
    mat: document.getElementById('materialSelect'),
    kp: document.getElementById('kpSelect'),
    title: document.getElementById('mTitle'),
    subtitle: document.getElementById('mSubtitle'),
    tHead: document.getElementById('tableHeader'),
    tBody: document.getElementById('tableBody')
};

// --- ВАЖЛИВО: Нова функція для точного округлення ---
function roundExcel(num, places = 2) {
    if (num === null || isNaN(num)) return num;
    const multiplier = Math.pow(10, places);
    return (Math.round((num + Number.EPSILON) * multiplier) / multiplier).toFixed(places);
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

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
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
    const container = document.getElementById('toastContainer');
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

function saveToLocalStorage() {
    try { 
        const customMaterials = appMaterials.filter(appMat => 
            !coreDB.find(m => m.name.toLowerCase() === appMat.name.toLowerCase())
        );
        localStorage.setItem('pnae_materials_custom', JSON.stringify(customMaterials)); 
        localStorage.setItem('pnae_favorites', JSON.stringify(favoriteMaterials));
        localStorage.setItem('pnae_report_materials', JSON.stringify(reportMaterials));
        
        localStorage.setItem('pnae_active_report_subtab', activeReportSubTab);
        localStorage.setItem('pnae_report_materials_equip', JSON.stringify(reportMaterialsEquip));
        localStorage.setItem('pnae_equipment_active_properties', JSON.stringify(equipmentActiveProperties));
        localStorage.setItem('pnae_equipment_stress_columns', JSON.stringify(equipmentStressColumns));
        localStorage.setItem('pnae_report_equip_seismic', reportEquipSeismicVal);
    } catch (e) { console.error("Помилка збереження", e); }
}

function loadFromLocalStorage() {
    const savedDb = localStorage.getItem('pnae_materials_custom');
    if (savedDb) {
        try {
            const parsed = JSON.parse(savedDb);
            if (parsed && Array.isArray(parsed)) {
                parsed.forEach(customMat => {
                    if (!coreDB.find(m => m.name.toLowerCase() === customMat.name.toLowerCase())) {
                        appMaterials.push(customMat);
                    }
                });
            }
        } catch (e) { console.error("Помилка читання", e); }
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

function getTooltipIconHtml(text) {
    return `
    <div class="group relative inline-block ml-1 cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-brand-500 hover:text-brand-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 dark:bg-slate-900 text-white text-[10px] font-normal leading-tight rounded-lg shadow-xl tooltip-arrow pointer-events-none z-50">
            ${text}
        </div>
    </div>`;
}

function init() {
    initTheme();
    loadFromLocalStorage();

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

    // --- Синхронізація слайдерів (повзунків) температур з інпутами ---
    const calcTemp = document.getElementById('calcTemp');
    const calcTempSlider = document.getElementById('calcTempSlider');
    const calcTempGv = document.getElementById('calcTempGv');
    const calcTempGvSlider = document.getElementById('calcTempGvSlider');

    if (calcTemp && calcTempSlider) {
        calcTempSlider.addEventListener('input', (e) => {
            calcTemp.value = e.target.value;
            updateCalculator();
        });
        calcTemp.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                calcTempSlider.value = Math.max(20, Math.min(600, val));
            }
        });
    }

    if (calcTempGv && calcTempGvSlider) {
        calcTempGvSlider.addEventListener('input', (e) => {
            calcTempGv.value = e.target.value;
            updateCalculator();
        });
        calcTempGv.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                calcTempGvSlider.value = Math.max(20, Math.min(600, val));
            }
        });
    }

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
    document.getElementById('btnToggleCoef').addEventListener('click', () => coefModal.classList.remove('hidden'));
    document.getElementById('btnCloseCoef').addEventListener('click', closeCoefModal);
    document.getElementById('btnApplyCoef').addEventListener('click', closeCoefModal);
    document.getElementById('coefModalBackdrop').addEventListener('click', closeCoefModal);

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
    
    document.getElementById('btnFavorite').addEventListener('click', toggleFavorite);
    document.getElementById('btnEditMat').addEventListener('click', openEditModal);
    
    document.getElementById('btnExportJS').addEventListener('click', exportToJS);

    document.getElementById('btnAddToReport').addEventListener('click', () => {
        const matIndex = el.mat.value;
        const kpIndex = el.kp.value;
        if (matIndex === "" || kpIndex === "") return;
        
        const material = appMaterials[matIndex];
        const grade = material.grades[kpIndex];
        const matName = material.name;
        const kpName = grade.kp ? `КП ${grade.kp}` : 'Без КП';

        if (activeReportSubTab === 'gaskets') {
            const selectedElements = Array.from(document.querySelectorAll('.report-element-cb:checked')).map(cb => cb.value);
            if (selectedElements.length === 0) {
                showToast('Оберіть хоча б один елемент (Фланець, Шпильки, Різьба)', 'warning');
                return;
            }
            const existingIndex = reportMaterials.findIndex(m => m.matIndex == matIndex && m.kpIndex == kpIndex);
            
            if (existingIndex !== -1) {
                const existingItem = reportMaterials[existingIndex];
                const oldElementsStr = existingItem.elements.join(', ');
                const newElementsStr = selectedElements.join(', ');
                
                if (oldElementsStr === newElementsStr) {
                    showToast('Цей матеріал з такими елементами вже у списку!', 'warning');
                } else {
                    existingItem.elements = selectedElements;
                    renderReportList();
                    showToast('Елементи для матеріалу оновлено', 'success');
                }
            } else {
                reportMaterials.push({ matIndex, kpIndex, matName, kpName, elements: selectedElements });
                
                reportMaterials.sort((a, b) => {
                    const nameCmp = a.matName.localeCompare(b.matName, 'uk');
                    if (nameCmp !== 0) return nameCmp;
                    return a.kpName.localeCompare(b.kpName, 'uk');
                });

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
            const existingIndex = reportMaterialsEquip.findIndex(m => m.matIndex == matIndex && m.kpIndex == kpIndex);
            
            if (existingIndex !== -1) {
                const existingItem = reportMaterialsEquip[existingIndex];
                const oldElementsStr = existingItem.elements.join(', ');
                const newElementsStr = selectedElements.join(', ');
                
                if (oldElementsStr === newElementsStr) {
                    showToast('Цей матеріал з такими елементами вже у списку обладнання!', 'warning');
                } else {
                    existingItem.elements = selectedElements;
                    renderReportList();
                    showToast('Елементи для матеріалу оновлено', 'success');
                }
            } else {
                reportMaterialsEquip.push({ matIndex, kpIndex, matName, kpName, elements: selectedElements });
                
                reportMaterialsEquip.sort((a, b) => {
                    const nameCmp = a.matName.localeCompare(b.matName, 'uk');
                    if (nameCmp !== 0) return nameCmp;
                    return a.kpName.localeCompare(b.kpName, 'uk');
                });

                renderReportList();
                playFlyToReportAnimation();
                showToast('Матеріал додано до списку обладнання', 'success');
            }
        }
    });

    document.querySelectorAll('.tooltip-trigger').forEach(elem => {
        const text = elem.getAttribute('data-tooltip');
        elem.insertAdjacentHTML('beforeend', getTooltipIconHtml(text));
    });

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
    
    const activeClass = "flex-1 sm:flex-none py-2 px-4 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/50 dark:border-slate-600 transition-all focus:outline-none whitespace-nowrap";
    const inactiveClass = "flex-1 sm:flex-none py-2 px-4 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none border border-transparent whitespace-nowrap";

    [viewTable, viewCalc, viewChart, viewReport].forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('tab-active');
    });
    [btnTable, btnCalc, btnChart, btnReport].forEach(b => b.className = inactiveClass);

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
        btnTable.className = activeClass;
    } else if (tab === 'calc') {
        activeView = viewCalc;
        btnCalc.className = activeClass;
        updateCalculator();
    } else if (tab === 'chart') {
        activeView = viewChart;
        btnChart.className = activeClass;
        renderChart();
    } else if (tab === 'report') {
        activeView = viewReport;
        btnReport.className = activeClass;
        renderReportList();
    }

    if (activeView) {
        activeView.classList.remove('hidden');
        if (tab === 'report') {
            activeView.classList.add('flex');
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                activeView.classList.add('tab-active');
            });
        });
    }
}

function renderReportList() {
    saveToLocalStorage();
    const listWrapper = document.getElementById('sidebarReportListWrapper');
    const listInner = document.getElementById('sidebarReportListInner');
    const toggleText = document.getElementById('reportListToggleText');
    if (!listInner) return;
    
    const isVisible = listWrapper.classList.contains('expanded');
    const activeList = activeReportSubTab === 'gaskets' ? reportMaterials : reportMaterialsEquip;
    const count = activeList.length;
    
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
    
    listInner.innerHTML = activeList.map((item, index) => `
        <div class="report-list-item flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-2 last:mb-0 cursor-move transition-colors" draggable="true" data-index="${index}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)" ondragend="handleDragEnd(event)">
            <div class="flex items-center gap-3 overflow-hidden pointer-events-none">
                <div class="text-slate-400 dark:text-slate-500 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-500 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                    ${index + 1}
                </div>
                <div class="truncate">
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-xs truncate" title="${item.matName}">${item.matName}</div>
                    <div class="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">${item.kpName}</div>
                    <div class="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 truncate mt-0.5">${(item.elements || []).join(', ')}</div>
                </div>
            </div>
            <button onclick="removeReportItem(${index})" title="Видалити" class="pointer-events-auto text-slate-400 hover:text-rose-500 p-1.5 shrink-0 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 z-10 relative">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `).join('');

    if (activeReportSubTab === 'gaskets') {
        renderReportTable();
    } else {
        renderReportTableEquip();
    }
}

// --- Drag & Drop функції для списку звітів ---
let draggedReportIndex = null;

window.handleDragStart = function(e) {
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
    e.stopPropagation();
    const target = e.target.closest('.report-list-item');
    if (target) {
        target.classList.remove('scale-[1.02]', 'bg-brand-50', 'dark:bg-brand-900/30', 'border-brand-400');
        const targetIndex = parseInt(target.dataset.index);
        if (draggedReportIndex !== null && draggedReportIndex !== targetIndex) {
            const activeList = activeReportSubTab === 'gaskets' ? reportMaterials : reportMaterialsEquip;
            const item = activeList.splice(draggedReportIndex, 1)[0];
            activeList.splice(targetIndex, 0, item);
            renderReportList();
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
        groupHtml += `<th class="py-2 px-2 font-bold text-center border-b border-r border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider">ГВ</th>`;
    }
    if (reportTemperatures.length > 1) {
        groupHtml += `<th colspan="${reportTemperatures.length - 1}" class="py-2 px-2 font-bold text-center border-b border-slate-200 dark:border-slate-700 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] uppercase tracking-widest">НУЕ</th>`;
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
                    <button onclick="removeReportTemp(${index})" class="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity" title="Видалити стовпець">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </th>
        `;

        tempsHtml2 += `
            <th class="py-2.5 px-2 font-semibold text-center min-w-[90px] group border-b ${isGv ? 'border-r border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'} align-middle">
                <div class="relative inline-block w-full">
                    <select onchange="updateReportTemp(${index}, this.value)" class="text-center w-full bg-transparent border-b border-dashed ${isGv ? 'border-emerald-400 dark:border-emerald-600 hover:border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 text-slate-700 dark:text-slate-200'} outline-none transition-colors cursor-pointer font-semibold appearance-none" style="text-align-last: center;" title="Змінити температуру">
                        ${optionsHtml}
                    </select>
                    <button onclick="removeReportTemp(${index})" class="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity" title="Видалити стовпець">
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
        renderReportTable(); 
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
    renderReportTable();
};

window.removeReportTemp = function(index) {
    reportTemperatures.splice(index, 1);
    renderReportTable();
};

function renderReportTable() {
    renderReportHeader(); 
    renderReportStressTable(); 
    
    const tbody = document.getElementById('reportTableBody');
    if (reportMaterials.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${reportTemperatures.length + 3}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку, щоб сформувати таблицю</td></tr>`;
        return;
    }

    let html = '';
    
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
                    ${index + 1}. ${item.matName}<br>
                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words max-w-[200px] whitespace-normal">${item.kpName}</span>
                </td>`;
            }

            html += `<td class="py-2.5 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 w-[350px] min-w-[350px] max-w-[350px]">
                    ${prop.name} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                </td>`;

            const propData = data[prop.key];
            reportTemperatures.forEach((t, tIdx) => {
                const value = getNearestHigherValue(propData, t);
                let safeValue = escapeHTML(String(value));
                if (safeValue !== '—') safeValue = safeValue.replace('.', ',');
                const displayValue = safeValue === '—' 
                    ? `<span class="text-slate-300 dark:text-slate-600">—</span>` 
                    : `<span class="font-semibold text-slate-700 dark:text-slate-200">${safeValue}</span>`;
                
                html += `<td class="py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50">${displayValue}</td>`;
            });
            
            html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
            
            html += `</tr>`;
        });
    });
    tbody.innerHTML = html;
}

function renderReportStressTable() {
    const tbody = document.getElementById('reportStressTableBody');
    if (!tbody) return;

    if (reportMaterials.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${reportTemperatures.length + 4}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку, щоб сформувати таблицю</td></tr>`;
        return;
    }

    let html = '';
    
    const nm = parseFloat(document.getElementById('calcNm').value) || 2.6;
    const nt = parseFloat(document.getElementById('calcNt').value) || 1.5;
    const ntBolt = parseFloat(document.getElementById('calcNtBolt').value) || 2.0;
    
    const isReportDevMode = document.getElementById('reportDevModeToggle')?.checked || false;

    reportMaterials.forEach((item, index) => {
        const material = appMaterials[item.matIndex];
        const grade = material.grades[item.kpIndex];
        const data = grade.data;

        let totalRows = 0;
        let elementGroups = [];

        const itemElements = (item.elements && Array.isArray(item.elements) && item.elements.length > 0)
            ? item.elements
            : ["Фланець", "Шпильки", "Різьба"];

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

        let isFirstMatRow = true;

        elementGroups.forEach((group) => {
            group.props.forEach((prop, pIdx) => {
                const rowClass = pIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50';
                html += `<tr class="hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-colors ${rowClass}">`;
                
                if (isFirstMatRow) {
                    html += `<td rowspan="${totalRows}" class="sticky-col bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 w-[240px] min-w-[240px] max-w-[240px]">
                        ${index + 1}. ${item.matName}<br>
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words max-w-[200px] whitespace-normal">${item.kpName}</span>
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
                    const rtm = getNearestHigherValue(data['RTm'], t);
                    const rtp = getNearestHigherValue(data['RTp'], t);

                    let val = "—";
                    let formula = "";
                    
                    if (rtm !== "—" && rtp !== "—") {
                        let sigma = Math.min(rtm / nm, rtp / nt);
                        let sigmaW = rtp / ntBolt;

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
                    } else if (rtp !== "—") {
                         let sigmaW = rtp / ntBolt;
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

                    let displayValue = "";
                    if (val === "—") {
                        displayValue = `<span class="text-slate-300 dark:text-slate-600">—</span>`;
                    } else {
                        let valStr = String(val).replace('.', ',');
                        if (isReportDevMode && formula !== "") {
                            const wrappedFormula = wrapFormulaVars(formula);
                            displayValue = `
                                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-1 leading-tight whitespace-nowrap tracking-tight font-medium" title="${formula}">${wrappedFormula}</div>
                                <div class="font-bold ${isGv ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400'} text-base">${valStr}</div>
                            `;
                        } else {
                            displayValue = `<span class="font-bold ${isGv ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400'}">${valStr}</span>`;
                        }
                    }
                        
                    const bgClass = isGv ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : '';
                    
                    html += `<td class="${bgClass} py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50">${displayValue}</td>`;
                });
                
                html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
                
                html += `</tr>`;
            });
        });
    });
    tbody.innerHTML = html;
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
    const lowerFilter = filterText.toLowerCase();
    
    let favOptions = [];
    let otherOptions = [];

    appMaterials.forEach((mat, index) => {
        if (mat.name.toLowerCase().includes(lowerFilter)) {
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
        el.tBody.innerHTML = '';
        toggleEmptyState(true);
    }
}

function formatDescription(matName, desc) {
    if (!desc) return 'Не вказано';
    const cleanMatName = matName.replace(" (Демо)", "").replace(" (Копія)", "").trim();
    if (desc.toLowerCase().startsWith(cleanMatName.toLowerCase())) {
        desc = desc.substring(cleanMatName.length).replace(/^[.,\-;\s]+/, '').trim();
        if (desc.length > 0) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }
    return desc || 'Не вказано';
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
            let preview = cleanDesc.length > 50 ? cleanDesc.substring(0, 50) + '...' : cleanDesc;
            label += ` (${preview})`;
        }
        
        option.textContent = label;
        el.kp.appendChild(option);
    });

    updateFavoriteIcon();
    updateAllViews();
}

function updateAllViews() {
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
    el.subtitle.textContent = `${grade.kp ? 'КП '+grade.kp : 'Не вказана'} | ${cleanDesc}`;

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

function updateChartTheme() {
    if(chartInstance) {
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? '#334155' : '#e2e8f0';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        chartInstance.options.plugins.legend.labels.color = textColor;
        chartInstance.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : 'rgba(255,255,255,0.9)';
        chartInstance.options.plugins.tooltip.titleColor = isDark ? '#f8fafc' : '#0f172a';
        chartInstance.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#334155';
        chartInstance.options.plugins.tooltip.borderColor = isDark ? '#334155' : '#e2e8f0';

        chartInstance.options.scales.x.title.color = textColor;
        chartInstance.options.scales.x.grid.color = gridColor;
        chartInstance.options.scales.x.ticks.color = textColor;

        chartInstance.options.scales.y.title.color = textColor;
        chartInstance.options.scales.y.grid.color = gridColor;
        chartInstance.options.scales.y.ticks.color = textColor;

        chartInstance.update();
    }
}

function renderChart() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    const data = appMaterials[matIndex].grades[kpIndex].data;
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    let rtmData = [];
    let rtpData = [];
    let validTemps = [];

    temperatures.forEach(t => {
        let m = data["RTm"]?.[t];
        let p = data["RTp"]?.[t];
        if (m !== '—' || p !== '—') {
            validTemps.push(t);
            rtmData.push(m !== '—' ? m : null);
            rtpData.push(p !== '—' ? p : null);
        }
    });
    
    const warningEl = document.getElementById('chart-warning');
    const canvasEl = document.getElementById('matChart');
    const noDataEl = document.getElementById('chart-no-data');

    if (validTemps.length === 0) {
        if (warningEl) warningEl.classList.add('hidden');
        if (canvasEl) canvasEl.classList.add('hidden');
        if (noDataEl) noDataEl.classList.remove('hidden');
        return;
    } else {
        if (canvasEl) canvasEl.classList.remove('hidden');
        if (noDataEl) noDataEl.classList.add('hidden');
        
        if (validTemps.length < 3) {
            if (warningEl) warningEl.classList.remove('hidden');
        } else {
            if (warningEl) warningEl.classList.add('hidden');
        }
    }

    if (chartInstance) {
        chartInstance.data.labels = validTemps;
        chartInstance.data.datasets[0].data = rtmData;
        chartInstance.data.datasets[1].data = rtpData;
        
        chartInstance.options.plugins.legend.labels.color = textColor;
        chartInstance.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : 'rgba(255,255,255,0.9)';
        chartInstance.options.plugins.tooltip.titleColor = isDark ? '#f8fafc' : '#0f172a';
        chartInstance.options.plugins.tooltip.bodyColor = isDark ? '#cbd5e1' : '#334155';
        chartInstance.options.plugins.tooltip.borderColor = isDark ? '#334155' : '#e2e8f0';

        chartInstance.options.scales.x.title.color = textColor;
        chartInstance.options.scales.x.grid.color = gridColor;
        chartInstance.options.scales.x.ticks.color = textColor;

        chartInstance.options.scales.y.title.color = textColor;
        chartInstance.options.scales.y.grid.color = gridColor;
        chartInstance.options.scales.y.ticks.color = textColor;

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
                        tension: 0.2,
                        spanGaps: true
                    },
                    {
                        label: 'Межа текучості (Rₚ₀,₂), МПа',
                        data: rtpData,
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.2,
                        spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', labels: { color: textColor, font: { family: 'Inter', weight: '600' } } },
                    tooltip: { backgroundColor: isDark ? '#1e293b' : 'rgba(255,255,255,0.9)', titleColor: isDark ? '#f8fafc' : '#0f172a', bodyColor: isDark ? '#cbd5e1' : '#334155', borderColor: isDark ? '#334155' : '#e2e8f0', borderWidth: 1 }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Температура, °C', color: textColor, font: { weight: 'bold' } },
                        grid: { color: gridColor }, ticks: { color: textColor }
                    },
                    y: {
                        title: { display: true, text: 'Напруження, МПа', color: textColor, font: { weight: 'bold' } },
                        grid: { color: gridColor }, ticks: { color: textColor },
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
    
    container.innerHTML = recentViews.map(name => `
        <button type="button" onclick="selectRecentMaterial('${name}')" class="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200/50 dark:border-slate-700/50 transition-all truncate max-w-[120px]" title="${name}">
            ${name}
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
            <div class="text-base leading-tight font-semibold">${valStr}</div>
        `;
    } else {
        el.innerHTML = `<span class="font-semibold">${valStr}</span>`;
    }
}

function updateCalculator() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    const data = appMaterials[matIndex].grades[kpIndex].data;
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

    let activeColTemp = getStepTemperature(targetT, temperatures, yRtp);
    highlightActiveColumn(activeColTemp);

    const nm = parseFloat(document.getElementById('calcNm').value) || 2.6;
    const nt = parseFloat(document.getElementById('calcNt').value) || 1.5;
    const ntBolt = parseFloat(document.getElementById('calcNtBolt').value) || 2.0;
    const gm = parseFloat(document.getElementById('calcGm').value) || 1.05;
    const gc = parseFloat(document.getElementById('calcGc').value) || 1.0;
    const gnNue = parseFloat(document.getElementById('calcGnNue').value) || 1.25;
    const gnPz = parseFloat(document.getElementById('calcGnPz').value) || 1.05;

    // Safety margin audits
    if (nm !== 2.6) warnings.push(`Запас nm (${nm}) відрізняється від 2,6`);
    if (nt !== 1.5) warnings.push(`Запас nt (${nt}) відрізняється від 1,5`);
    if (ntBolt !== 2.0) warnings.push(`Запас для кріплень ntBolt (${ntBolt}) відрізняється від 2,0`);
    if (gm !== 1.05) warnings.push(`Коефіцієнт gm (${gm}) відрізняється від 1,05`);

    // Temperature limits audits
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

    let sigma = null; let sigmaGv = null;
    if (stepRtm !== null && stepRtp !== null) {
        sigma = Math.min(stepRtm / nm, stepRtp / nt);
    }
    if (stepRtmGv !== null && stepRtpGv !== null) {
        sigmaGv = Math.min(stepRtmGv / nm, stepRtpGv / nt);
    }
    
    let sigmaW = null;
    if (stepRtp !== null) {
        sigmaW = stepRtp / ntBolt;
    }

    const devModeInfoBox = document.getElementById('devModeInfo');
    if (isDevMode && stepRtm !== null && stepRtp !== null) {
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
        renderCell('det_ts_pz', sigma * PNAE_COEFS.ts_pz, `[σ] &times; ${PNAE_COEFS.ts_pz}`);
        renderCell('det_ts_mrz', sigma * PNAE_COEFS.ts_mrz, `[σ] &times; ${PNAE_COEFS.ts_mrz}`);
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
        renderCell('bolt_ts_pz', sigmaW * PNAE_COEFS.bolt_ts_pz, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ts_pz}`);
        renderCell('bolt_ts_mrz', sigmaW * PNAE_COEFS.bolt_ts_mrz, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ts_mrz}`);
    } else {
        ['nue', 'pnue', 'as', 'pz', 'mrz'].forEach(col => {
            renderCell(`bolt_s1_${col}`, null, ""); renderCell(`bolt_s3w_${col}`, null, ""); renderCell(`bolt_s4w_${col}`, null, "");
            renderCell(`bolt_ssmw_${col}`, null, ""); renderCell(`bolt_ss4w_${col}`, null, ""); renderCell(`bolt_ts_${col}`, null, "");
        });
    }

    if (stepRtpGv !== null) {
        renderCell('bolt_s1_gv', stepRtpGv * PNAE_COEFS.bolt_gv_rtp_mult, `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; ${PNAE_COEFS.bolt_gv_rtp_mult}`);
    } else {
        renderCell('bolt_s1_gv', null, "");
    }
    renderCell('bolt_s3w_gv', null, ""); 
    renderCell('bolt_s4w_gv', null, ""); 
    renderCell('bolt_ssmw_gv', null, ""); 
    renderCell('bolt_ss4w_gv', null, ""); 
    renderCell('bolt_ts_gv', null, "");

    if (stepRtp !== null) {
        let Ry = stepRtp / gm;
        let rNue = (Ry * gc) / gnNue;
        let rPz = (Ry * gc) / gnPz;

        let fNue = `(R<sub>y</sub>&times;&gamma;<sub>c</sub>) / &gamma;<sub>n(НУЕ)</sub>`;
        let fPz = `(R<sub>y</sub>&times;&gamma;<sub>c</sub>) / &gamma;<sub>n(ПЗ)</sub>`;

        renderCell('op_R_nue', rNue, fNue);
        renderCell('op_R_pnue', rPz, fPz);
        renderCell('op_R_as', null, "");
        renderCell('op_R_pz', rPz, fPz);
        renderCell('op_R_mrz', rPz, fPz);
    } else {
        renderCell('op_R_nue', null, ""); renderCell('op_R_pnue', null, ""); 
        renderCell('op_R_as', null, "");
        renderCell('op_R_pz', null, ""); renderCell('op_R_mrz', null, "");
    }

    if (stepRtpGv !== null) {
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
            auditPanel.classList.add('hidden');
        }
    }
}

let addMatModalSnapshot = "";

function takeAddMatFormSnapshot() {
    const name = document.getElementById('newMatName').value.trim();
    const desc = document.getElementById('newMatDesc').value.trim();
    let values = [name, desc];
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

function initAddMaterialModal() {
    const addMatModal = document.getElementById('addMatModal');
    const closeAddMatModal = (force = false) => {
        if (!force && isAddMatFormChanged()) {
            if (!confirm("У вас є незбережені зміни. Ви впевнені, що хочете закрити вікно? Всі внесені дані буде втрачено.")) {
                return;
            }
        }
        addMatModal.classList.add('hidden');
        editingMatIndex = -1;
        editingGradeIndex = -1;
        buildMaterialFormEmpty();
    };
    
    document.getElementById('btnOpenAddMat').addEventListener('click', () => {
        editingMatIndex = -1;
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
        }
    });

    document.getElementById('btnSaveAddMat').addEventListener('click', () => {
        const matName = document.getElementById('newMatName').value.trim();
        const matDesc = document.getElementById('newMatDesc').value.trim();
        const matKp = "";
        
        if (!matName) {
            showToast('Будь ласка, введіть марку сталі/сплаву.', 'error');
            return;
        }

        let newGrade = { kp: matKp, description: matDesc, data: {} };
        
        propertiesList.forEach(prop => {
            newGrade.data[prop.key] = {};
            temperatures.forEach(t => {
                const input = document.querySelector(`#newMatTableBody input[data-prop="${prop.key}"][data-temp="${t}"]`);
                let val = input ? input.value.trim().replace(',', '.') : "";
                if (val === "" || val === "-" || val === "—") {
                    newGrade.data[prop.key][t] = "—";
                } else {
                    const num = parseFloat(val);
                    newGrade.data[prop.key][t] = isNaN(num) ? "—" : num;
                }
            });
        });

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

        if(editingMatIndex >= 0) {
            appMaterials[editingMatIndex].name = matName;
            appMaterials[editingMatIndex].grades[editingGradeIndex] = newGrade;
            
            const oldName = el.title.textContent;
            if(oldName !== matName) {
                const favIdx = favoriteMaterials.indexOf(oldName);
                if(favIdx > -1) favoriteMaterials[favIdx] = matName;
            }
            showToast('Матеріал успішно збережено', 'success');
        } else {
            let existingMat = appMaterials.find(m => m.name.toLowerCase() === matName.toLowerCase());
            if (existingMat) {
                existingMat.grades.push(newGrade);
                el.mat.value = appMaterials.indexOf(existingMat);
            } else {
                appMaterials.push({ name: matName, grades: [newGrade] });
                el.mat.value = appMaterials.length - 1;
            }
            showToast('Новий матеріал додано', 'success');
        }

        saveToLocalStorage();
        closeAddMatModal(true);
        
        const currentSearch = el.search.value;
        updateMaterialList(currentSearch);
        
        const allOptions = Array.from(el.mat.options);
        const targetOption = allOptions.find(opt => opt.textContent.replace('★ ', '').toLowerCase() === matName.toLowerCase());
        if(targetOption) el.mat.value = targetOption.value;
        
        updateKpList();
        el.kp.value = el.kp.options.length - 1;
        if(editingMatIndex >= 0) el.kp.value = editingGradeIndex;
        updateAllViews();
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
    document.getElementById('newMatDesc').value = '';
}

function openEditModal() {
    const matIndex = el.mat.value;
    const kpIndex = el.kp.value;
    if (matIndex === "" || kpIndex === "") return;

    const material = appMaterials[matIndex];
    const grade = material.grades[kpIndex];

    const isBaseMaterial = coreDB.find(m => m.name.toLowerCase() === material.name.toLowerCase());
    
    if (isBaseMaterial) {
        document.getElementById('addMatTitle').textContent = "Редагувати матеріал (Створення копії)";
        document.getElementById('newMatName').value = material.name + " (Копія)";
        editingMatIndex = -1; 
    } else {
        document.getElementById('addMatTitle').textContent = "Редагувати матеріал";
        document.getElementById('newMatName').value = material.name;
        editingMatIndex = matIndex;
    }

    editingGradeIndex = kpIndex;
    buildMaterialFormEmpty();
    
    document.getElementById('newMatDesc').value = grade.description;

    propertiesList.forEach(prop => {
        temperatures.forEach(t => {
            const input = document.querySelector(`#newMatTableBody input[data-prop="${prop.key}"][data-temp="${t}"]`);
            let val = grade.data[prop.key]?.[t];
            if (input && val !== "—" && val !== undefined) {
                // Забезпечуємо відображення 2 знаків після коми при відкритті форми редагування
                if (prop.key === "Ro" || prop.key === "Alpha" || prop.key === "Mu") {
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                        val = roundExcel(num, 2);
                    }
                }
                input.value = val;
            }
        });
    });

    document.getElementById('addMatModal').classList.remove('hidden');
    addMatModalSnapshot = takeAddMatFormSnapshot();
    validateNewMatGrid();
    
    if(isBaseMaterial) {
        showToast("Пряме редагування базового матеріалу заборонено. Буде створено локальну копію.", "warning");
    }
}

function exportToJS() {
    const jsCodeString = `const materialsDB = ${JSON.stringify(appMaterials, null, 4)};`;
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <title>MatBase | Код бази</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
                    .toolbar { position: sticky; top: 0; background: #1e293b; border-bottom: 1px solid #334155; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    h2 { margin: 0; font-size: 18px; color: #f8fafc; }
                    p { margin: 5px 0 0 0; font-size: 13px; color: #94a3b8; }
                    button { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: background 0.2s; display: flex; gap: 8px; align-items: center; }
                    button:hover { background: #4f46e5; }
                    button:active { transform: scale(0.98); }
                    .code-container { padding: 20px; }
                    pre { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; color: #a5b4fc; }
                </style>
            </head>
            <body>
                <div class="toolbar">
                    <div>
                        <h2>Код для файлу data.js</h2>
                        <p>Скопіюйте цей текст та вставте його у файл data.js на вашому мережевому диску.</p>
                    </div>
                    <button onclick="navigator.clipboard.writeText(document.querySelector('pre').innerText).then(() => { this.innerHTML = '✓ Скопійовано!'; setTimeout(() => this.innerHTML = 'Копіювати код', 2000); })">
                        Копіювати код
                    </button>
                </div>
                <div class="code-container">
                    <pre>${escapeHTML(jsCodeString)}</pre>
                </div>
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        console.log(jsCodeString);
        showToast('Спливаюче вікно заблоковано. Код виведено у консоль (F12)', 'warning');
    }
}

let isSelecting = false;
let startRowIndex = -1;
let startColIndex = -1;
let activeTable = null;
let activeGrid = [];

function clearCellSelection() {
    document.querySelectorAll('.cell-selected').forEach(el => el.classList.remove('cell-selected'));
}

function buildTableGrid(table) {
    let grid = [];
    const rows = table.querySelectorAll('tbody tr');
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

        e.preventDefault(); 
        clearCellSelection();
        document.querySelectorAll('.input-selected').forEach(el => el.classList.remove('input-selected'));

        let hoveredTable = null;
        const hoverElements = document.querySelectorAll(':hover');
        for (let i = hoverElements.length - 1; i >= 0; i--) {
            if (hoverElements[i].tagName === 'TABLE') {
                hoveredTable = hoverElements[i];
                break;
            }
        }

        if (hoveredTable && hoveredTable.closest('#addMatModal')) {
            document.querySelectorAll('#newMatTableBody input').forEach(inp => inp.classList.add('input-selected'));
            return;
        }

        let tablesToSelect = [];
        if (hoveredTable) {
            tablesToSelect = [hoveredTable];
        } else {
            const viewTable = document.getElementById('view-table');
            const viewCalc = document.getElementById('view-calc');
            const viewReport = document.getElementById('view-report');

            if (!viewTable.classList.contains('hidden')) {
                tablesToSelect.push(viewTable.querySelector('table'));
            } else if (!viewCalc.classList.contains('hidden')) {
                tablesToSelect = Array.from(viewCalc.querySelectorAll('table'));
            } else if (!viewReport.classList.contains('hidden')) {
                tablesToSelect = Array.from(viewReport.querySelectorAll('table'));
            }
        }

        tablesToSelect.forEach(table => {
            if (!table || table.offsetParent === null) return; 
            
            buildTableGrid(table); 
            
            const cells = table.querySelectorAll('tbody td:not(.sticky-col):not(.border-r)');
            cells.forEach(td => {
                if (td.innerText.trim() !== '' || td.querySelector('span') || td.id) {
                    td.classList.add('cell-selected');
                }
            });
        });
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
            }, 150);
        });
        return;
    }

    const selectedCells = document.querySelectorAll('.cell-selected');
    if (selectedCells.length === 0) return;

    let rows = new Map();
    selectedCells.forEach(td => {
        const r = td.dataset.vRow !== undefined ? parseInt(td.dataset.vRow) : Array.from(td.parentElement.parentElement.children).indexOf(td.parentElement);
        const c = td.dataset.vCol !== undefined ? parseInt(td.dataset.vCol) : Array.from(td.parentElement.children).indexOf(td);
        
        if (!rows.has(r)) rows.set(r, []);
        
        let val = td.innerText.trim();
        const lines = val.split(/\r?\n/);
        val = lines[lines.length - 1].trim(); 
        
        rows.get(r).push({ col: c, val: val });
    });

    const sortedRowKeys = Array.from(rows.keys()).sort((a, b) => a - b);
    let clipboardText = '';
    sortedRowKeys.forEach(key => {
        const rowData = rows.get(key).sort((a, b) => a.col - b.col).map(item => item.val);
        clipboardText += rowData.join('\t') + '\n';
    });

    e.clipboardData.setData('text/plain', clipboardText.trim());
    e.preventDefault();
    
    selectedCells.forEach(td => {
        td.classList.add('cell-copied');
        setTimeout(() => {
            td.classList.remove('cell-copied');
        }, 100); 
    });
});

window.switchReportSubTab = function(tab) {
    activeReportSubTab = tab;
    const btnGaskets = document.getElementById('btnReportSubTabGaskets');
    const btnEquip = document.getElementById('btnReportSubTabEquipment');
    const contentGaskets = document.getElementById('report-content-gaskets');
    const contentEquip = document.getElementById('report-content-equipment');
    const actionsGaskets = document.getElementById('reportActionsGaskets');
    const actionsEquipment = document.getElementById('reportActionsEquipment');
    const equipControls = document.getElementById('reportEquipControls');

    if (tab === 'gaskets') {
        btnGaskets.className = "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100";
        btnEquip.className = "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
        contentGaskets.classList.remove('hidden');
        contentEquip.classList.add('hidden');
        actionsGaskets.classList.remove('hidden');
        actionsEquipment.classList.add('hidden');
        if (equipControls) {
            equipControls.classList.add('hidden');
            equipControls.classList.remove('flex');
        }
    } else {
        btnEquip.className = "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100";
        btnGaskets.className = "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
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
    equipmentStressColumns.sort((a, b) => a.temp - b.temp);
    
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
        equipmentStressColumns.sort((a, b) => a.temp - b.temp);
        saveToLocalStorage();
        renderReportStressTableEquip();
    }
};

window.removeEquipmentStressColumn = function(index) {
    equipmentStressColumns.splice(index, 1);
    saveToLocalStorage();
    renderReportStressTableEquip();
};

function renderReportTableEquip() {
    const thead = document.getElementById('reportEquipTableHeader');
    const tbody = document.getElementById('reportEquipTableBody');
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
                    <button onclick="removeReportTemp(${index})" class="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity" title="Видалити стовпець">
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
                    ${index + 1}. ${item.matName}<br>
                    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words max-w-[200px] whitespace-normal">${item.kpName}</span>
                </td>`;
            }

            html += `<td class="py-2.5 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 w-[350px] min-w-[350px] max-w-[350px]">
                    ${prop.name} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                </td>`;

            const propData = data[prop.key];
            reportTemperatures.forEach((t) => {
                const value = getNearestHigherValue(propData, t);
                let safeValue = escapeHTML(String(value));
                if (safeValue !== '—') safeValue = safeValue.replace('.', ',');
                const displayValue = safeValue === '—' 
                    ? `<span class="text-slate-300 dark:text-slate-600">—</span>` 
                    : `<span class="font-semibold text-slate-700 dark:text-slate-200">${safeValue}</span>`;

                html += `<td class="py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50">${displayValue}</td>`;
            });

            html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
            html += `</tr>`;
        });
    });
    tbody.innerHTML = html;
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
            <th class="py-2 px-2 font-bold text-center border-b border-r border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider relative group ${bgStyleClass} align-middle">
                <div class="relative inline-block w-full min-w-[90px] px-3">
                    <select onchange="updateEquipmentStressColumnMode(${idx}, this.value)" class="text-center w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 focus:border-brand-500 outline-none transition-colors text-slate-700 dark:text-slate-200 cursor-pointer font-bold appearance-none" style="text-align-last: center;" title="Змінити режим">
                        ${modeSelectOptions}
                    </select>
                    <button onclick="removeEquipmentStressColumn(${idx})" class="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity" title="Видалити стовпець">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
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
    if (!tbody) return;

    if (reportMaterialsEquip.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${equipmentStressColumns.length + 3}" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте матеріали до списку обладнання, щоб сформувати таблицю</td></tr>`;
        return;
    }

    if (equipmentStressColumns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">Додайте стовпець (режим, температура) за допомогою панелі вище</td></tr>`;
        return;
    }

    const nm = parseFloat(document.getElementById('calcNm').value) || 2.6;
    const nt = parseFloat(document.getElementById('calcNt').value) || 1.5;
    const ntBolt = parseFloat(document.getElementById('calcNtBolt').value) || 2.0;
    const gm = parseFloat(document.getElementById('calcGm').value) || 1.05;
    const gc = parseFloat(document.getElementById('calcGc').value) || 1.0;
    const gnNue = parseFloat(document.getElementById('calcGnNue').value) || 1.25;
    const gnPz = parseFloat(document.getElementById('calcGnPz').value) || 1.05;
    
    const seismicCategory = document.getElementById('reportEquipSeismic')?.value || '1';
    const isReportDevMode = document.getElementById('reportDevModeToggle')?.checked || false;

    let html = '';

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

            el.props.forEach((prop, pIdx) => {
                const rowClass = pIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50';
                html += `<tr class="hover:bg-brand-50/50 dark:hover:bg-slate-700/50 transition-colors ${rowClass}">`;

                if (pIdx === 0) {
                    html += `<td rowspan="${el.props.length}" class="sticky-col bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 align-middle border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 w-[240px] min-w-[240px] max-w-[240px]">
                        ${matIdx + 1}. ${item.matName}<br>
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 block leading-tight break-words max-w-[200px] whitespace-normal">${item.kpName}</span>
                    </td>`;
                }

                html += `<td class="py-2.5 px-4 text-sm border-b border-slate-100 dark:border-slate-700 border-r border-slate-200 dark:border-slate-700 w-[350px] min-w-[350px] max-w-[350px]">
                    <span class="inline-block text-slate-400 dark:text-slate-500 font-normal bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap">${prop.symbol}, ${prop.units}</span>
                </td>`;

                equipmentStressColumns.forEach((col) => {
                    const rtm = getNearestHigherValue(data['RTm'], col.temp);
                    const rtp = getNearestHigherValue(data['RTp'], col.temp);

                    let val = "—";
                    let formula = "";

                    const hasRtmAndRtp = (rtm !== "—" && rtp !== "—");
                    const hasRtp = (rtp !== "—");

                    if (prop.key.startsWith("det_")) {
                        if (hasRtmAndRtp) {
                            const sigma = Math.min(rtm / nm, rtp / nt);
                            
                            if (prop.key === "det_s1") {
                                if (col.mode === "gv") { val = roundExcel(sigma * 1.35, 2); formula = `[σ]<sub>ГВ</sub> &times; 1,35`; }
                                else if (col.mode === "nue") { val = roundExcel(sigma * 1.0, 2); formula = `[σ]`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigma * 1.2, 2); formula = `[σ] &times; 1,2`; }
                                else if (col.mode === "as") { val = roundExcel(sigma * 1.4, 2); formula = `[σ] &times; 1,4`; }
                            } else if (prop.key === "det_s2") {
                                if (col.mode === "gv") { val = roundExcel(sigma * 1.7, 2); formula = `[σ]<sub>ГВ</sub> &times; 1,7`; }
                                else if (col.mode === "nue") { val = roundExcel(sigma * 1.3, 2); formula = `[σ] &times; 1,3`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigma * 1.6, 2); formula = `[σ] &times; 1,6`; }
                                else if (col.mode === "as") { val = roundExcel(sigma * 1.8, 2); formula = `[σ] &times; 1,8`; }
                            } else if (prop.key === "det_srv") {
                                if (col.mode === "nue" || col.mode === "pnue") {
                                    val = roundExcel(Math.min((2.5 - (rtp / rtm)) * rtp, 2 * rtp), 2);
                                    formula = `min((2,5-R<sup>T</sup><sub>p0,2</sub>/R<sup>T</sup><sub>m</sub>)R<sup>T</sup><sub>p0,2</sub>, 2R<sup>T</sup><sub>p0,2</sub>)`;
                                }
                            } else if (prop.key === "det_ss1") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * 1.2, 2); formula = `[σ] &times; 1,2`; }
                                    else { val = roundExcel(sigma * 1.5, 2); formula = `[σ] &times; 1,5`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * 1.4, 2); formula = `[σ] &times; 1,4`; }
                                }
                            } else if (prop.key === "det_ss2") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * 1.6, 2); formula = `[σ] &times; 1,6`; }
                                    else { val = roundExcel(sigma * 1.9, 2); formula = `[σ] &times; 1,9`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * 1.8, 2); formula = `[σ] &times; 1,8`; }
                                }
                            } else if (prop.key === "det_ts") {
                                if (col.mode === "pz") { val = roundExcel(sigma * 0.6, 2); formula = `[σ] &times; 0,6`; }
                                else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigma * 0.7, 2); formula = `[σ] &times; 0,7`; }
                                }
                            }
                        }
                    } 
                    else if (prop.key.startsWith("bolt_")) {
                        if (hasRtp) {
                            const sigmaW = rtp / ntBolt;

                            if (prop.key === "bolt_s1") {
                                if (col.mode === "gv") { val = roundExcel(rtp * 0.7, 2); formula = `R<sup>T</sup><sub>p0,2(ГВ)</sub> &times; 0,7`; }
                                else if (col.mode === "nue") { val = roundExcel(sigmaW * 1.0, 2); formula = `[σ]<sub>w</sub>`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigmaW * 1.2, 2); formula = `[σ]<sub>w</sub> &times; 1,2`; }
                                else if (col.mode === "as") { val = roundExcel(sigmaW * 1.4, 2); formula = `[σ]<sub>w</sub> &times; 1,4`; }
                            } else if (prop.key === "bolt_s3w") {
                                if (col.mode === "nue") { val = roundExcel(sigmaW * 1.3, 2); formula = `[σ]<sub>w</sub> &times; 1,3`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigmaW * 1.6, 2); formula = `[σ]<sub>w</sub> &times; 1,6`; }
                                else if (col.mode === "as") { val = roundExcel(sigmaW * 1.8, 2); formula = `[σ]<sub>w</sub> &times; 1,8`; }
                            } else if (prop.key === "bolt_s4w") {
                                if (col.mode === "nue") { val = roundExcel(sigmaW * 1.7, 2); formula = `[σ]<sub>w</sub> &times; 1,7`; }
                                else if (col.mode === "pnue") { val = roundExcel(sigmaW * 2.0, 2); formula = `[σ]<sub>w</sub> &times; 2,0`; }
                                else if (col.mode === "as") { val = roundExcel(sigmaW * 2.4, 2); formula = `[σ]<sub>w</sub> &times; 2,4`; }
                            } else if (prop.key === "bolt_ssmw") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * 1.2, 2); formula = `[σ]<sub>w</sub> &times; 1,2`; }
                                    else { val = roundExcel(sigmaW * 1.5, 2); formula = `[σ]<sub>w</sub> &times; 1,5`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * 1.4, 2); formula = `[σ]<sub>w</sub> &times; 1,4`; }
                                }
                            } else if (prop.key === "bolt_ss4w") {
                                if (col.mode === "pz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * 2.0, 2); formula = `[σ]<sub>w</sub> &times; 2,0`; }
                                    else { val = roundExcel(sigmaW * 2.3, 2); formula = `[σ]<sub>w</sub> &times; 2,3`; }
                                } else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * 2.2, 2); formula = `[σ]<sub>w</sub> &times; 2,2`; }
                                }
                            } else if (prop.key === "bolt_ts") {
                                if (col.mode === "pz") { val = roundExcel(sigmaW * 0.6, 2); formula = `[σ]<sub>w</sub> &times; 0,6`; }
                                else if (col.mode === "mrz") {
                                    if (seismicCategory === '1') { val = roundExcel(sigmaW * 0.7, 2); formula = `[σ]<sub>w</sub> &times; 0,7`; }
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
                            } else if (col.mode === "pnue" || col.mode === "pz") {
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

                    let displayValue = "";
                    if (val === "—") {
                        displayValue = `<span class="text-slate-300 dark:text-slate-600">—</span>`;
                    } else {
                        let valStr = String(val).replace('.', ',');
                        const isGvOrSeismic = col.mode === 'gv' || col.mode === 'pz' || col.mode === 'mrz';
                        if (isReportDevMode && formula !== "") {
                            const wrappedFormula = wrapFormulaVars(formula);
                            displayValue = `
                                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-1 leading-tight whitespace-nowrap tracking-tight font-medium" title="${formula}">${wrappedFormula}</div>
                                <div class="font-bold ${isGvOrSeismic ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400'} text-base">${valStr}</div>
                            `;
                        } else {
                            displayValue = `<span class="font-bold ${isGvOrSeismic ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400'}">${valStr}</span>`;
                        }
                    }

                    const isGvOrSeismic = col.mode === 'gv' || col.mode === 'pz' || col.mode === 'mrz';
                    const bgClass = isGvOrSeismic ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : '';

                    html += `<td class="${bgClass} py-2.5 px-4 text-center border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50">${displayValue}</td>`;
                });

                html += `<td class="py-2.5 px-4 border-b border-slate-100 dark:border-slate-700 border-l border-slate-100/50 dark:border-slate-700/50"></td>`;
                html += `</tr>`;
            });
        });
    });
    tbody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', init);
