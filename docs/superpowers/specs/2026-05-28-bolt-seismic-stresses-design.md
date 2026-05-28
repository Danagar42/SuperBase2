# Специфікація: Залежність допустимих сейсмічних напружень для шпильок/болтів від категорії сейсмостійкості

## Опис завдання
У вкладці "Напруження" для таблиці "Всі деталі (крім шпильок)" реалізовано залежність коефіцієнтів допустимих напружень від обраної категорії сейсмостійкості (I або II категорія). Необхідно впровадити аналогічну поведінку для таблиці "Шпильки / Болти" для параметрів $(\sigma_s)_{mw}$ та $(\sigma_s)_{4w}$.

## Вимоги до коефіцієнтів

### I категорія сейсмостійкості
*   **$(\sigma_s)_{mw}$**
    *   НУЕ+ПЗ, ПНУЕ+ПЗ: $[\sigma]_w \times 1.2$
    *   НУЕ+МРЗ, ПНУЕ+МРЗ: $[\sigma]_w \times 1.4$
*   **$(\sigma_s)_{4w}$**
    *   НУЕ+ПЗ, ПНУЕ+ПЗ: $[\sigma]_w \times 2.0$
    *   НУЕ+МРЗ, ПНУЕ+МРЗ: $[\sigma]_w \times 2.2$

### II категорія сейсмостійкості
*   **$(\sigma_s)_{mw}$**
    *   НУЕ+ПЗ, ПНУЕ+ПЗ: $[\sigma]_w \times 1.5$
    *   НУЕ+МРЗ, ПНУЕ+МРЗ: `-` (не обраховується)
*   **$(\sigma_s)_{4w}$**
    *   НУЕ+ПЗ, ПНУЕ+ПЗ: $[\sigma]_w \times 2.3$
    *   НУЕ+МРЗ, ПНУЕ+МРЗ: `-` (не обраховується)

## Пропоновані зміни

### 1. Файл `app.js`

#### Оновлення об'єкта `PNAE_COEFS`
Замінити старі статичні коефіцієнти для болтів новими, розділеними за категоріями сейсмостійкості:

```javascript
const PNAE_COEFS = {
    // ... інші коефіцієнти ...
    bolt_ssmw_pz_cat1: 1.2, bolt_ssmw_mrz_cat1: 1.4,
    bolt_ss4w_pz_cat1: 2.0, bolt_ss4w_mrz_cat1: 2.2,
    bolt_ssmw_pz_cat2: 1.5,
    bolt_ss4w_pz_cat2: 2.3,
    // ... інші коефіцієнти ...
};
```

#### Зміни у функції `updateCalculator()`
Модифікувати блок розрахунку допустимих напружень для шпильок/болтів, додавши логіку перевірки обраної сейсмостійкості `seismicCategory`:

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

## План верифікації
1. Відкрити сторінку додатку в браузері.
2. Обрати будь-яку марку сталі/сплаву та перейти на вкладку **"Напруження"**.
3. Увімкнути режим відображення формул ("Показати формули").
4. Перевірити розрахунок при обраній **I категорії**:
   *   Переконатися, що у рядку $(\sigma_s)_{mw}$ стовпець "НУЕ+ПЗ" містить формулу `[σ]w * 1.2` та коректне значення.
   *   Стовпець "НУЕ+МРЗ" містить формулу `[σ]w * 1.4` та значення.
   *   Аналогічно для $(\sigma_s)_{4w}$ з коефіцієнтами `2.0` та `2.2`.
5. Перемкнути сейсмостійкість на **II категорію**:
   *   Переконатися, що у рядку $(\sigma_s)_{mw}$ стовпець "НУЕ+ПЗ" містить формулу `[σ]w * 1.5`, а стовпець "НУЕ+МРЗ" став порожнім (`—`).
   *   Переконатися, що у рядку $(\sigma_s)_{4w}$ стовпець "НУЕ+ПЗ" містить формулу `[σ]w * 2.3`, а стовпець "НУЕ+МРЗ" став порожнім (`—`).
