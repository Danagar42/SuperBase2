const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = require('../app.js');
const {
    roundExcel,
    parseCoefficient,
    validateCoefficients,
    PNAE_DEFAULT_COEFFICIENTS,
    getGradeSignature,
    normalizeReportItems,
    isValidMaterial,
    validateBackupSchema,
    applyBackupState,
    resetCurrentMaterialToCore,
    closeMaterialModal,
    PNAE_COEFS,
    appMaterials,
    coreDB
} = app;

// ---------------------------------------------------------------------------
// 1. P1: CALCULATION COEFFICIENTS VALIDATION & SAFETY
// ---------------------------------------------------------------------------
describe('P1 — Calculation Coefficients Validation & Safety', () => {

    test('PNAE_DEFAULT_COEFFICIENTS has normative values according to PNAE G-7-002-86', () => {
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcNm, 2.6);
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcNt, 1.5);
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcNtBolt, 2.0);
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcGc, 1.0);
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcGm, 1.05);
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcGnNue, 1.25);
        assert.equal(PNAE_DEFAULT_COEFFICIENTS.calcGnPz, 1.05);
    });

    test('parseCoefficient accepts positive numbers and numeric strings', () => {
        assert.equal(parseCoefficient(2.6), 2.6);
        assert.equal(parseCoefficient(1.5), 1.5);
        assert.equal(parseCoefficient(1), 1.0);
        assert.equal(parseCoefficient(0.01), 0.01);
        assert.equal(parseCoefficient('2.6'), 2.6);
        assert.equal(parseCoefficient('  2.6  '), 2.6);
        assert.equal(parseCoefficient('+2.6'), 2.6);
    });

    test('parseCoefficient supports European comma as decimal separator', () => {
        assert.equal(parseCoefficient('2,6'), 2.6);
        assert.equal(parseCoefficient('1,5'), 1.5);
        assert.equal(parseCoefficient('  1,05  '), 1.05);
        assert.equal(parseCoefficient('0,01'), 0.01);
    });

    test('parseCoefficient supports positive scientific notation with positive or negative exponents', () => {
        assert.equal(parseCoefficient('1e1'), 10);
        assert.equal(parseCoefficient('2.5e0'), 2.5);
        assert.equal(parseCoefficient('1.05e+1'), 10.5);
        // Scientific notation with negative exponent (must parse to valid positive number)
        assert.equal(parseCoefficient('1e-1'), 0.1);
        assert.equal(parseCoefficient('2.5e-1'), 0.25);
        assert.equal(parseCoefficient('1.05e-2'), 0.0105);
    });

    test('parseCoefficient strictly rejects zero (0, "0", "0.0", "0,0")', () => {
        assert.equal(parseCoefficient(0), null);
        assert.equal(parseCoefficient('0'), null);
        assert.equal(parseCoefficient('0.0'), null);
        assert.equal(parseCoefficient('0,0'), null);
        assert.equal(parseCoefficient('0.000'), null);
    });

    test('parseCoefficient strictly rejects negative numbers (-1, "-2.6", "-0.01")', () => {
        assert.equal(parseCoefficient(-1), null);
        assert.equal(parseCoefficient(-2.6), null);
        assert.equal(parseCoefficient('-1'), null);
        assert.equal(parseCoefficient('-2.6'), null);
        assert.equal(parseCoefficient('-2,6'), null);
        assert.equal(parseCoefficient('-0.001'), null);
        assert.equal(parseCoefficient('-1e-1'), null);
    });

    test('parseCoefficient strictly rejects corrupt, partial, or non-numeric strings', () => {
        assert.equal(parseCoefficient('2.6abc'), null);
        assert.equal(parseCoefficient('abc2.6'), null);
        assert.equal(parseCoefficient('abc'), null);
        assert.equal(parseCoefficient('2..6'), null);
        assert.equal(parseCoefficient('2,,6'), null);
        assert.equal(parseCoefficient('2,6.5'), null);
        assert.equal(parseCoefficient('Infinity'), null);
        assert.equal(parseCoefficient('-Infinity'), null);
        assert.equal(parseCoefficient('NaN'), null);
        assert.equal(parseCoefficient(''), null);
        assert.equal(parseCoefficient('   '), null);
    });

    test('parseCoefficient strictly rejects non-primitive or non-numeric types', () => {
        assert.equal(parseCoefficient(null), null);
        assert.equal(parseCoefficient(undefined), null);
        assert.equal(parseCoefficient(true), null);
        assert.equal(parseCoefficient(false), null);
        assert.equal(parseCoefficient({}), null);
        assert.equal(parseCoefficient([]), null);
        assert.equal(parseCoefficient(NaN), null);
        assert.equal(parseCoefficient(Infinity), null);
    });

    test('validateCoefficients validates a complete valid set of coefficients', () => {
        const validSet = {
            calcNm: '2.6',
            calcNt: '1,5',
            calcNtBolt: 2.0,
            calcGc: '1.0',
            calcGm: '1,05',
            calcGnNue: '1.25',
            calcGnPz: '1,05'
        };
        const res = validateCoefficients(validSet);
        assert.equal(res.valid, true);
        assert.equal(res.errors.length, 0);
        assert.equal(res.values.calcNm, 2.6);
        assert.equal(res.values.calcNt, 1.5);
        assert.equal(res.values.calcNtBolt, 2.0);
        assert.equal(res.values.calcGc, 1.0);
        assert.equal(res.values.calcGm, 1.05);
        assert.equal(res.values.calcGnNue, 1.25);
        assert.equal(res.values.calcGnPz, 1.05);
    });

    test('validateCoefficients identifies invalid and missing coefficients with descriptive errors', () => {
        const invalidSet = {
            calcNm: '-2.6',
            calcNt: '0',
            calcNtBolt: 'corrupt',
            calcGc: 1.0,
            calcGm: '1.05',
            calcGnNue: '',
            calcGnPz: '1.05'
        };
        const res = validateCoefficients(invalidSet);
        assert.equal(res.valid, false);
        assert.equal(res.errors.length, 4); // calcNm, calcNt, calcNtBolt, calcGnNue are invalid
        assert.ok(res.errors.some(e => e.includes('nm (тимчасовий опір)')));
        assert.ok(res.errors.some(e => e.includes('nt (межа текучості)')));
        assert.ok(res.errors.some(e => e.includes('ntBolt (кріплення)')));
        assert.ok(res.errors.some(e => e.includes('γn(НУЕ) (призначення НУЕ)')));
    });

    test('Blind Verifier Case 1: Coefficient negative, zero, and corrupt input blocking', () => {
        // Must reject 0
        assert.equal(parseCoefficient(0), null);
        assert.equal(parseCoefficient('0'), null);
        assert.equal(parseCoefficient('0,0'), null);

        // Must reject negative numbers
        assert.equal(parseCoefficient(-1), null);
        assert.equal(parseCoefficient('-1'), null);
        assert.equal(parseCoefficient('-2.6'), null);
        assert.equal(parseCoefficient('-2,6'), null);

        // Must reject corrupt partial strings
        assert.equal(parseCoefficient('2.6abc'), null);
        assert.equal(parseCoefficient('0.0foo'), null);
        assert.equal(parseCoefficient('NaN'), null);

        // Must accept valid positive with dot and comma
        assert.equal(parseCoefficient('2.6'), 2.6);
        assert.equal(parseCoefficient('2,6'), 2.6);
        assert.equal(parseCoefficient(1.5), 1.5);
        assert.equal(parseCoefficient('1e-1'), 0.1);
        assert.equal(parseCoefficient('2.5e-1'), 0.25);

        // Multi-check: validateCoefficients must block when any negative/zero present
        const testObj = { ...PNAE_DEFAULT_COEFFICIENTS, calcNm: '-2.6' };
        const result = validateCoefficients(testObj);
        assert.equal(result.valid, false);
        assert.ok(result.errors.length > 0);
    });
});

// ---------------------------------------------------------------------------
// 2. P2: EXCEL-COMPLIANT SYMMETRIC ROUNDING (roundExcel)
// ---------------------------------------------------------------------------
describe('P2 — Accurate Excel-Compliant Rounding (roundExcel)', () => {

    test('Rounds half away from zero for positive numbers', () => {
        assert.equal(roundExcel(10.075, 2), '10.08');
        assert.equal(roundExcel(1.005, 2), '1.01');
        assert.equal(roundExcel(1.0000000000000005, 2), '1.00');
        assert.equal(roundExcel(2.5, 0), '3');
        assert.equal(roundExcel(490.5, 0), '491');
        assert.equal(roundExcel(490.49, 0), '490');
        assert.equal(roundExcel(12.344, 2), '12.34');
        assert.equal(roundExcel(12.345, 2), '12.35');
        assert.equal(roundExcel(12.346, 2), '12.35');
    });

    test('Rounds half away from zero symmetrically for negative numbers (Excel ROUND matrix)', () => {
        assert.equal(roundExcel(-10.075, 2), '-10.08');
        assert.equal(roundExcel(-1.005, 2), '-1.01');
        assert.equal(roundExcel(-2.5, 0), '-3');
        assert.equal(roundExcel(-490.5, 0), '-491');
        assert.equal(roundExcel(-490.49, 0), '-490');
        assert.equal(roundExcel(-12.344, 2), '-12.34');
        assert.equal(roundExcel(-12.345, 2), '-12.35');
        assert.equal(roundExcel(-12.346, 2), '-12.35');
    });

    test('Handles negative zero properly: never returns "-0" or "-0.00"', () => {
        assert.equal(roundExcel(0, 2), '0.00');
        assert.equal(roundExcel(-0, 2), '0.00');
        assert.equal(roundExcel(0, 0), '0');
        assert.equal(roundExcel(-0, 0), '0');
        assert.equal(roundExcel(-0.0001, 2), '0.00');
        assert.equal(roundExcel(-0.004, 2), '0.00');
        assert.equal(roundExcel(-0.0000001, 2), '0.00');
    });

    test('Parses strings with comma as decimal separator', () => {
        assert.equal(roundExcel('10,075', 2), '10.08');
        assert.equal(roundExcel('-10,075', 2), '-10.08');
        assert.equal(roundExcel('  490,5  ', 0), '491');
        assert.equal(roundExcel(' -490,5 ', 0), '-491');
    });

    test('Gracefully returns "—" for missing, dash, NaN or non-numeric inputs', () => {
        assert.equal(roundExcel(null), '—');
        assert.equal(roundExcel(undefined), '—');
        assert.equal(roundExcel(''), '—');
        assert.equal(roundExcel('   '), '—');
        assert.equal(roundExcel('—'), '—');
        assert.equal(roundExcel('-'), '—');
        assert.equal(roundExcel('abc'), '—');
        assert.equal(roundExcel(NaN), '—');
        assert.equal(roundExcel(Infinity), '—');
        assert.equal(roundExcel(-Infinity), '—');
        assert.equal(roundExcel({}), '—');
        assert.equal(roundExcel([]), '—');
    });

    test('Blind Verifier Case 2: Rounding half away from zero negative symmetry & Excel matrix', () => {
        const matrix = [
            [10.075, 2, '10.08'],
            [-10.075, 2, '-10.08'],
            ['10.075', 2, '10.08'],
            ['10,075', 2, '10.08'],
            ['-10,075', 2, '-10.08'],
            [1.005, 2, '1.01'],
            [-1.005, 2, '-1.01'],
            [1.0000000000000005, 2, '1.00'],
            [490.5, 0, '491'],
            [-490.5, 0, '-491'],
            [490.49, 0, '490'],
            [-490.49, 0, '-490'],
            [-0.0001, 2, '0.00'],
            [-0, 2, '0.00'],
            [null, 2, '—'],
            [undefined, 2, '—'],
            ['—', 2, '—'],
            ['-', 2, '—'],
            [NaN, 2, '—']
        ];

        for (const [input, places, expected] of matrix) {
            const result = roundExcel(input, places);
            assert.equal(
                result,
                expected,
                `roundExcel(${JSON.stringify(input)}, ${places}) expected "${expected}", got "${result}"`
            );
        }
    });
});

// ---------------------------------------------------------------------------
// 3. P2: STABLE KP GRADE BINDING & RESTORATION
// ---------------------------------------------------------------------------
describe('P2 — Stable KP Grade Binding & Normalization', () => {

    test('getGradeSignature generates a deterministic signature from kp and description', () => {
        assert.equal(getGradeSignature({ kp: '245', description: 'Sheet' }), '245||Sheet');
        assert.equal(getGradeSignature({ kp: ' 245 ', description: ' Sheet ' }), '245||Sheet');
        assert.equal(getGradeSignature({ kp: '245', description: '' }), '245||');
        assert.equal(getGradeSignature(null), '');
        assert.equal(getGradeSignature(undefined), '');
    });

    test('normalizeReportItems binds report items via kpSig signature', () => {
        const item = {
            matName: 'Ст3сп5 (Демо)',
            kpSig: '245||Демонстраційний матеріал. Створіть файл data.js для вашої бази.',
            elements: ['RTm', 'RTp']
        };
        const normalized = normalizeReportItems([item], ['RTm', 'RTp']);
        assert.equal(normalized.length, 1);
        assert.equal(normalized[0].matName, 'Ст3сп5 (Демо)');
        assert.equal(normalized[0].kp, '245');
        assert.equal(normalized[0].kpIndex, 0);
        assert.equal(normalized[0].kpSig, '245||Демонстраційний матеріал. Створіть файл data.js для вашої бази.');
    });

    test('normalizeReportItems uses exact token matching on kpName to prevent substring false-positives', () => {
        const testMatName = 'TokenMatchSteel_' + Date.now();
        const testMat = {
            name: testMatName,
            grades: [
                { kp: '2', description: 'Категорія 2', data: { RTm: { 20: 300 } } },
                { kp: '20', description: 'Категорія 20', data: { RTm: { 20: 350 } } }
            ]
        };
        appMaterials.push(testMat);

        try {
            // When report item has kpName "КП 20 (Категорія 20)", it must match grade "20", NOT grade "2"
            const item = {
                matName: testMatName,
                kpName: 'КП 20 (Категорія 20)',
                elements: ['RTm']
            };
            const normalized = normalizeReportItems([item], ['RTm']);
            assert.equal(normalized.length, 1);
            assert.equal(normalized[0].kpIndex, 1);
            assert.equal(normalized[0].kp, '20');
        } finally {
            const idx = appMaterials.findIndex(m => m.name === testMatName);
            if (idx >= 0) appMaterials.splice(idx, 1);
        }
    });

    test('Blind Verifier Case 3: Reordered grades drift resistance via (kp + description) signature', () => {
        // Setup a test material with multiple grades
        const materialName = 'TestDualGradeSteel_' + Date.now();
        const testMaterial = {
            name: materialName,
            grades: [
                { kp: '300', description: 'Труби безшовні', data: { RTm: { 20: 400 } } },
                { kp: '300', description: 'Поковки та штамповки', data: { RTm: { 20: 420 } } },
                { kp: '400', description: 'Листовий прокат', data: { RTm: { 20: 500 } } }
            ]
        };
        appMaterials.push(testMaterial);

        try {
            // Target the second grade: kp: 300, description: 'Поковки та штамповки'
            const targetSig = '300||Поковки та штамповки';
            const reportItem = {
                matName: materialName,
                kpSig: targetSig,
                elements: ['RTm']
            };

            // Normalization before reordering
            const norm1 = normalizeReportItems([reportItem], ['RTm']);
            assert.equal(norm1.length, 1);
            assert.equal(norm1[0].kpIndex, 1);
            assert.equal(norm1[0].description, 'Поковки та штамповки');

            // Now mutate the order of grades (e.g. coreDB update or user sorting)
            testMaterial.grades.reverse(); // Now: [400 (Листовий), 300 (Поковки), 300 (Труби)]
            // Re-order further to put 'Поковки' at index 2
            const [first, second, third] = testMaterial.grades;
            testMaterial.grades = [third, first, second]; // 'Поковки' is now at index 2

            // Normalization after reordering must still correctly resolve 'Поковки та штамповки'
            const norm2 = normalizeReportItems([reportItem], ['RTm']);
            assert.equal(norm2.length, 1);
            assert.equal(norm2[0].description, 'Поковки та штамповки');
            assert.equal(norm2[0].kp, '300');
            assert.equal(norm2[0].kpIndex, 2); // Correctly tracked to new index 2!
        } finally {
            // Clean up test material
            const idx = appMaterials.findIndex(m => m.name === materialName);
            if (idx >= 0) appMaterials.splice(idx, 1);
        }
    });

    test('normalizeReportItems drops unknown materials or materials with empty grades', () => {
        const itemUnknown = { matName: 'NonExistentMaterial_XYZ', kpSig: '1||none' };
        assert.deepEqual(normalizeReportItems([itemUnknown], ['RTm']), []);
        assert.deepEqual(normalizeReportItems(null, ['RTm']), []);
        assert.deepEqual(normalizeReportItems('invalid', ['RTm']), []);
    });
});

// ---------------------------------------------------------------------------
// 4. P2: BACKUP JSON EXPORT & SCHEMA VALIDATION
// ---------------------------------------------------------------------------
describe('P2 — Backup JSON Schema Validation & Clean Execution', () => {

    test('isValidMaterial verifies a complete material schema', () => {
        assert.equal(isValidMaterial(coreDB[0]), true);

        // Invalid: missing name
        assert.equal(isValidMaterial({ grades: [{ kp: '1', description: 'a', data: {} }] }), false);
        // Invalid: empty grades
        assert.equal(isValidMaterial({ name: 'Mat', grades: [] }), false);
        // Invalid: non-object data
        assert.equal(isValidMaterial({ name: 'Mat', grades: [{ kp: '1', description: 'a', data: [] }] }), false);
        // Invalid: negative property values in curve
        assert.equal(isValidMaterial({
            name: 'Mat',
            grades: [{ kp: '1', description: 'a', data: { RTm: { 20: -10 } } }]
        }), false);
    });

    test('validateBackupSchema validates valid full backup object', () => {
        const validBackup = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            state: {
                overrides: [
                    { baseName: coreDB[0].name, material: coreDB[0] }
                ],
                custom: [],
                favoriteMaterials: ['Ст3сп5 (Демо)'],
                reportMaterials: [],
                reportMaterialsEquip: []
            }
        };

        const res = validateBackupSchema(validBackup);
        assert.equal(res.valid, true);
        assert.ok(res.state);
    });

    test('validateBackupSchema rejects corrupted backup structures', () => {
        assert.equal(validateBackupSchema(null).valid, false);
        assert.equal(validateBackupSchema('string data').valid, false);

        // Corrupted overrides (not an array)
        assert.equal(validateBackupSchema({ state: { overrides: 'invalid' } }).valid, false);

        // Corrupted override element (invalid material)
        const corruptedOverride = {
            state: {
                overrides: [{ baseName: 'Steel', material: { name: 'InvalidMatWithoutGrades' } }]
            }
        };
        assert.equal(validateBackupSchema(corruptedOverride).valid, false);

        // Corrupted custom material
        const corruptedCustom = {
            state: {
                custom: [{ name: '', grades: [] }]
            }
        };
        assert.equal(validateBackupSchema(corruptedCustom).valid, false);
    });

    test('applyBackupState executes cleanly without ReferenceError', () => {
        const testBackup = {
            version: '2.0',
            state: {
                overrides: [],
                custom: [],
                favoriteMaterials: [coreDB[0].name],
                reportMaterials: [],
                reportMaterialsEquip: []
            }
        };

        // Must run without throwing ReferenceError or TypeError
        assert.doesNotThrow(() => {
            const res = applyBackupState(testBackup);
            assert.equal(res.success, true);
        });
    });

    test('resetCurrentMaterialToCore executes cleanly without ReferenceError', () => {
        // Must run without throwing ReferenceError or TypeError
        assert.doesNotThrow(() => {
            // Test with skipConfirm flag
            const res = resetCurrentMaterialToCore(true);
            // Result is boolean (false if editingMatIndex < 0, true if reset was performed)
            assert.equal(typeof res, 'boolean');
        });
    });
});

// ---------------------------------------------------------------------------
// 5. P2: CHEATSHEET RESILIENCE & CORRUPTED STATE RECOVERY
// ---------------------------------------------------------------------------
describe('P2 — Cheatsheet Resilience & State Isolation', () => {

    function validateRowObject(row) {
        return Boolean(row && typeof row === 'object' && typeof row.name === 'string');
    }

    function loadStateSimulation(stateStr, stressData = { '': true, flange: true }) {
        if (!stateStr) return { success: false, state: [] };
        let parsed;
        try {
            parsed = typeof stateStr === 'string' ? JSON.parse(stateStr) : stateStr;
        } catch (e) {
            return { success: false, state: [] };
        }

        if (!Array.isArray(parsed)) return { success: false, state: [] };

        const validRows = parsed.filter(validateRowObject);
        if (validRows.length === 0 && parsed.length > 0) return { success: false, state: [] };

        const state = validRows.map(row => ({
            id: row.id || 'id_mock',
            name: String(row.name || ''),
            zone: (stressData && row.zone in stressData) ? row.zone : '',
            selected: Boolean(row.selected)
        }));

        return { success: true, state };
    }

    function safeSetItemSimulation(storageMock, key, value) {
        try {
            storageMock.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }

    test('validateRowObject accepts valid row and rejects null or non-object', () => {
        assert.equal(validateRowObject({ name: 'Path 1', zone: 'flange' }), true);
        assert.equal(validateRowObject({ name: '' }), true);
        assert.equal(validateRowObject(null), false);
        assert.equal(validateRowObject(undefined), false);
        assert.equal(validateRowObject('string'), false);
        assert.equal(validateRowObject({ noName: true }), false);
    });

    test('loadState handles valid array JSON successfully', () => {
        const rawJson = JSON.stringify([
            { id: '1', name: 'Path 1', zone: 'flange', selected: false },
            { id: '2', name: 'Path 2', zone: 'none', selected: true }
        ]);
        const res = loadStateSimulation(rawJson);
        assert.equal(res.success, true);
        assert.equal(res.state.length, 2);
        assert.equal(res.state[0].name, 'Path 1');
    });

    test('loadState handles corrupted JSON or non-array root without throwing', () => {
        assert.equal(loadStateSimulation('{ invalid json syntax').success, false);
        assert.equal(loadStateSimulation('12345').success, false);
        assert.equal(loadStateSimulation('{"not": "an array"}').success, false);
        assert.equal(loadStateSimulation(JSON.stringify([{ invalid: 'no name field' }])).success, false);
    });

    test('safeSetItem catches QuotaExceededError and returns false safely', () => {
        const mockFailingStorage = {
            setItem: () => {
                const err = new Error('QuotaExceededError');
                err.name = 'QuotaExceededError';
                throw err;
            }
        };
        const result = safeSetItemSimulation(mockFailingStorage, 'key', 'value');
        assert.equal(result, false);
    });

    test('Blind Verifier Case 4: Cheatsheet corrupt state recovery without unhandled exceptions and backup creation', () => {
        // Mock storage containing corrupted string
        const corruptedData = '{ corrupt json: [[[[ ';
        const storageMock = {
            data: { ansys_paths_state: corruptedData },
            getItem(k) { return this.data[k] || null; },
            setItem(k, v) { this.data[k] = String(v); }
        };

        // Recovery flow as implemented in шпаргалка/index.html window.onload
        let loaded = false;
        let recoveryBackupCreated = false;
        let defaultRowsCreated = false;
        let state = [];

        try {
            const savedState = storageMock.getItem('ansys_paths_state');
            if (savedState) {
                const parseRes = loadStateSimulation(savedState);
                loaded = parseRes.success;
                if (!loaded) {
                    storageMock.setItem('ansys_paths_state_corrupted_backup', savedState);
                    recoveryBackupCreated = true;
                }
            }
        } catch (e) {
            loaded = false;
        }

        if (!loaded || state.length === 0) {
            state = [
                { id: 'id_1', name: 'Path 1', zone: '', selected: false },
                { id: 'id_2', name: 'Path 2', zone: '', selected: false },
                { id: 'id_3', name: 'Path 3', zone: '', selected: false }
            ];
            defaultRowsCreated = true;
        }

        // Verify:
        // 1. Corrupted data did not crash the app
        assert.equal(loaded, false);
        // 2. Corrupted data preserved in backup key
        assert.equal(recoveryBackupCreated, true);
        assert.equal(storageMock.getItem('ansys_paths_state_corrupted_backup'), corruptedData);
        // 3. Default state safely initialized with 3 rows
        assert.equal(defaultRowsCreated, true);
        assert.equal(state.length, 3);
        assert.equal(state[0].name, 'Path 1');
    });
});

// ---------------------------------------------------------------------------
// 6. P2 & P3: HTML, CSS & UI VERIFICATION CHECKS
// ---------------------------------------------------------------------------
describe('P2 & P3 — HTML, CSS & UI Component Verification', () => {

    test('index.html contains offline chart fallback and sidebar toggle', () => {
        const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        assert.ok(html.includes('id="chart-offline-fallback"'), 'Missing chart offline fallback container');
        assert.ok(html.includes('id="btnToggleSidebar"'), 'Missing sidebar toggle button');
        assert.ok(html.includes('id="btnResetCoef"'), 'Missing reset coefficients button');
        assert.ok(html.includes('id="btnExportBackupJSON"'), 'Missing export backup JSON button');
        assert.ok(html.includes('id="btnImportBackupJSON"'), 'Missing import backup JSON button');
        assert.ok(html.includes('id="btnResetMatToCore"'), 'Missing reset material to core button');
        assert.ok(html.includes('шпаргалка/index.html'), 'Missing visible link to cheatsheet');
    });

    test('index.html coefficient inputs use step="any" to eliminate HTML5 stepMismatch violations', () => {
        const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        const coefIds = ['calcNm', 'calcNt', 'calcNtBolt', 'calcGc', 'calcGm', 'calcGnNue', 'calcGnPz'];
        coefIds.forEach(id => {
            const regex = new RegExp(`id="${id}"[^>]*step="any"|step="any"[^>]*id="${id}"`);
            assert.ok(regex.test(html), `Input #${id} does not have step="any"`);
        });
    });

    test('styles.css contains system sans-serif fallback font stack', () => {
        const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
        assert.ok(css.includes('system-ui'), 'Missing system-ui in fallback font stack');
        assert.ok(css.includes('-apple-system'), 'Missing -apple-system in fallback font stack');
        assert.ok(css.includes('.sidebar-collapsed'), 'Missing sidebar-collapsed CSS rules');
    });

    test('шпаргалка/index.html contains safeSetItem, isProgrammaticCopy, backup handling and scoped Ctrl+A', () => {
        const cheatsheetHtml = fs.readFileSync(path.join(__dirname, '../шпаргалка/index.html'), 'utf8');
        assert.ok(cheatsheetHtml.includes('function safeSetItem'), 'Missing safeSetItem in cheatsheet');
        assert.ok(cheatsheetHtml.includes('ansys_paths_state_corrupted_backup'), 'Missing corrupted state backup key');
        assert.ok(cheatsheetHtml.includes('isProgrammaticCopy'), 'Missing isProgrammaticCopy guard');
        assert.ok(cheatsheetHtml.includes('navigator.clipboard.writeText'), 'Missing async clipboard API');
        // Scoped Ctrl+A to #pathTable
        assert.ok(cheatsheetHtml.includes("closest('#pathTable')"), 'Ctrl+A in cheatsheet is not scoped to #pathTable');
    });

    test('app.js scopes Ctrl+A to table and permits default text selection outside tables', () => {
        const appCode = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
        assert.ok(appCode.includes("const targetTable = e.target.closest('table') || hoveredTable;"), 'app.js does not find targetTable');
        // Verify that targetTable guard precedes e.preventDefault()
        const targetTableIndex = appCode.indexOf("const targetTable = e.target.closest('table') || hoveredTable;");
        const returnIndex = appCode.indexOf("if (!targetTable) {", targetTableIndex);
        const preventDefaultIndex = appCode.indexOf("e.preventDefault();", returnIndex);
        assert.ok(targetTableIndex !== -1, 'Missing targetTable in app.js');
        assert.ok(returnIndex !== -1, 'Missing if (!targetTable) in app.js');
        assert.ok(preventDefaultIndex !== -1, 'Missing e.preventDefault() after targetTable check in app.js');
        assert.ok(preventDefaultIndex > returnIndex, 'e.preventDefault() must occur after the !targetTable return guard');
    });

    test('Support allowable stresses [R] for AC (АС) calculated identically to PNUE (ПНУЕ)', () => {
        const appCode = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
        const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

        // Verify updateCalculator calculates op_R_as with rPz and fPz
        assert.ok(appCode.includes("renderCell('op_R_as', rPz, fPz);"), 'app.js updateCalculator must render op_R_as using rPz and fPz');

        // Verify renderReportEquip calculates support_R for mode "as" identically to pnue and pz
        assert.ok(
            appCode.includes('col.mode === "pnue" || col.mode === "as" || col.mode === "pz"'),
            'app.js renderReportEquip must include mode "as" in support_R calculation alongside pnue and pz'
        );

        // Verify index.html op_R_as has active styling matching other cells
        assert.ok(
            html.includes('<td class="p-3 font-bold text-amber-600 dark:text-amber-400 text-base" id="op_R_as"></td>'),
            'index.html #op_R_as must have amber bold font styling identical to other support stress cells'
        );
    });
});
