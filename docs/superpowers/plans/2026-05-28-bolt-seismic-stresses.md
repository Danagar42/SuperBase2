# Bolt Seismic Stresses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement seismic category-dependent stress calculations for studs/bolts (($(\sigma_s)_{mw}$ and $(\sigma_s)_{4w}$)) in the stresses calculation tab.

**Architecture:** Split stud/bolt seismic coefficients in `PNAE_COEFS` object by category, and update `updateCalculator()` function to dynamically choose coefficients based on selected seismic category (I or II).

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5.

---

### Task 1: Update Seismic Constants in `PNAE_COEFS`

**Files:**
- Modify: [app.js](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/app.js)

- [ ] **Step 1: Replace old static bolt coefficients with category-dependent coefficients**

Locate lines 12-13 in `app.js`:
```javascript
    bolt_ssmw_pz: 1.2, bolt_ssmw_mrz: 1.4,
    bolt_ss4w_pz: 2.0, bolt_ss4w_mrz: 2.2,
```

Replace them with:
```javascript
    bolt_ssmw_pz_cat1: 1.2, bolt_ssmw_mrz_cat1: 1.4,
    bolt_ss4w_pz_cat1: 2.0, bolt_ss4w_mrz_cat1: 2.2,
    bolt_ssmw_pz_cat2: 1.5,
    bolt_ss4w_pz_cat2: 2.3,
```

- [ ] **Step 2: Commit constants changes**

Run:
```bash
git add app.js
git commit -m "feat: split bolt seismic coefficients by category in PNAE_COEFS"
```

---

### Task 2: Implement Conditional Calculations in `updateCalculator()`

**Files:**
- Modify: [app.js](file:///d:/%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0/SuperBase-main/app.js)

- [ ] **Step 1: Replace static rendering logic with seismic category condition**

Locate lines 1655-1661 in `app.js`:
```javascript
        renderCell('bolt_ssmw_nue', null, ""); renderCell('bolt_ssmw_pnue', null, ""); 
        renderCell('bolt_ssmw_pz', sigmaW * PNAE_COEFS.bolt_ssmw_pz, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ssmw_pz}`);
        renderCell('bolt_ssmw_mrz', sigmaW * PNAE_COEFS.bolt_ssmw_mrz, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ssmw_mrz}`);

        renderCell('bolt_ss4w_nue', null, ""); renderCell('bolt_ss4w_pnue', null, ""); 
        renderCell('bolt_ss4w_pz', sigmaW * PNAE_COEFS.bolt_ss4w_pz, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ss4w_pz}`);
        renderCell('bolt_ss4w_mrz', sigmaW * PNAE_COEFS.bolt_ss4w_mrz, `[σ]<sub>w</sub> &times; ${PNAE_COEFS.bolt_ss4w_mrz}`);
```

Replace them with:
```javascript
        renderCell('bolt_ssmw_nue', null, ""); renderCell('bolt_ssmw_pnue', null, ""); 
        renderCell('bolt_ss4w_nue', null, ""); renderCell('bolt_ss4w_pnue', null, ""); 

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
```

- [ ] **Step 2: Commit calculation changes**

Run:
```bash
git add app.js
git commit -m "feat: implement seismic category conditional calculations for studs/bolts"
```
