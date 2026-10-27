// dose.js - local anaesthetic dose arithmetic. Pure functions, unit tested.
//
// Maximum doses (plain solutions, single injection, adults):
//   bupivacaine and levobupivacaine 2 mg/kg, and no more than 150 mg (bupivacaine SmPC, medicines.org.uk)
//   lidocaine plain 3 mg/kg, up to 200 mg; with adrenaline 7 mg/kg, up to 500 mg (BNF)
// Toxicity of different local anaesthetics is treated as additive: each drug's share of its own
// maximum is added up, and the total should stay under 100%.

export const DRUGS = {
    levo025: { label: 'Levobupivacaine 0.25%', mgPerMl: 2.5, maxMgKg: 2, capMg: 150, family: 'bupivacaine' },
    levo05: { label: 'Levobupivacaine 0.5%', mgPerMl: 5, maxMgKg: 2, capMg: 150, family: 'bupivacaine' },
    bupi025: { label: 'Bupivacaine 0.25%', mgPerMl: 2.5, maxMgKg: 2, capMg: 150, family: 'bupivacaine' },
    bupi05: { label: 'Bupivacaine 0.5%', mgPerMl: 5, maxMgKg: 2, capMg: 150, family: 'bupivacaine' },
    lido1: { label: 'Lidocaine 1% (plain)', mgPerMl: 10, maxMgKg: 3, capMg: 200, family: 'lidocaine' },
    lido2: { label: 'Lidocaine 2% (plain)', mgPerMl: 20, maxMgKg: 3, capMg: 200, family: 'lidocaine' }
};

export const BLOCK_DRUGS = ['levo025', 'levo05', 'bupi025', 'bupi05'];
export const SKIN_DRUGS = ['lido1', 'lido2'];

const round1 = (n) => Math.round(n * 10) / 10;

// Maximum dose in mg and ml for one drug at a given weight.
export function maxDose(drugKey, weightKg) {
    const d = DRUGS[drugKey];
    if (!d || !(weightKg > 0)) return null;
    const byWeight = d.maxMgKg * weightKg;
    const mg = Math.min(byWeight, d.capMg);
    return { mg: round1(mg), ml: round1(mg / d.mgPerMl), capped: byWeight > d.capMg };
}

// Devine ideal body weight. Height in cm. Returns null if height is missing or too short.
export function idealBodyWeight(sex, heightCm) {
    if (!(heightCm >= 152.4 && heightCm <= 250)) return null;
    return round1((sex === 'F' ? 45.5 : 50) + 0.91 * (heightCm - 152.4));
}

// Adds up a list of { drug, ml } entries and compares with the maximum for this weight.
export function doseCheck(weightKg, entries) {
    const lines = [];
    let fraction = 0;
    for (const e of entries) {
        const d = DRUGS[e.drug];
        const ml = Number(e.ml);
        if (!d || !(ml > 0)) continue;
        const mg = ml * d.mgPerMl;
        const max = maxDose(e.drug, weightKg);
        const share = max ? mg / max.mg : null;
        if (share !== null) fraction += share;
        lines.push({
            drug: e.drug, label: d.label, ml: round1(ml), mg: round1(mg),
            mgPerKg: weightKg > 0 ? Math.round((mg / weightKg) * 100) / 100 : null,
            maxMg: max ? max.mg : null,
            percent: share !== null ? Math.round(share * 100) : null
        });
    }
    const totalPercent = weightKg > 0 && lines.length ? Math.round(fraction * 100) : null;
    let tone = 'neutral';
    if (totalPercent !== null) tone = totalPercent > 100 ? 'red' : totalPercent >= 80 ? 'amber' : 'green';
    return { lines, totalPercent, tone };
}

// The Trust table band for a weight, or a gap/none result.
export function trustBand(table, weightKg) {
    if (!table || !(weightKg > 0)) return null;
    const band = table.bands.find((b) => b.test(weightKg));
    return band ? { band } : { gap: true };
}

// Lipid emulsion 20% doses (Association of Anaesthetists QRH 3-10, v2 June 2023). Actual weight.
export function lipidDoses(weightKg) {
    if (!(weightKg > 0)) return null;
    return {
        bolusMl: Math.round(1.5 * weightKg),
        infusionMlPerHour: Math.round(15 * weightKg),
        doubledMlPerHour: Math.round(30 * weightKg),
        maxCumulativeMl: Math.round(12 * weightKg)
    };
}
