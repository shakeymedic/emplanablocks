import test from 'node:test';
import assert from 'node:assert/strict';
import { maxDose, doseCheck, trustBand, idealBodyWeight, lipidDoses } from '../js/dose.js';
import { LOCSSIPS } from '../js/checklists.js';

test('bupivacaine maximum is 2 mg/kg with a 150 mg cap', () => {
    assert.deepEqual(maxDose('bupi025', 50), { mg: 100, ml: 40, capped: false });
    assert.deepEqual(maxDose('bupi025', 90), { mg: 150, ml: 60, capped: true });
    assert.equal(maxDose('levo05', 60).ml, 24);
});

test('lidocaine maximum is 3 mg/kg with a 200 mg cap', () => {
    assert.equal(maxDose('lido1', 50).mg, 150);
    assert.equal(maxDose('lido1', 80).mg, 200);
});

test('no weight gives no maximum', () => {
    assert.equal(maxDose('bupi025', 0), null);
    assert.equal(maxDose('bupi025', NaN), null);
});

test('doses of different drugs add up as shares of each maximum', () => {
    // 40 kg: bupivacaine max 80 mg, lidocaine max 120 mg. 30 ml 0.25% = 75 mg (94%), 5 ml 1% = 50 mg (42%).
    const r = doseCheck(40, [{ drug: 'bupi025', ml: 30 }, { drug: 'lido1', ml: 5 }]);
    assert.equal(r.lines[0].mg, 75);
    assert.equal(r.lines[0].percent, 94);
    assert.equal(r.lines[1].percent, 42);
    assert.equal(r.totalPercent, 135);
    assert.equal(r.tone, 'red');
});

test('40 ml bupivacaine plus 5 ml lidocaine at 70 kg is close to the maximum', () => {
    const r = doseCheck(70, [{ drug: 'bupi025', ml: 40 }, { drug: 'lido1', ml: 5 }]);
    assert.equal(r.totalPercent, 96); // 100/140 + 50/200 = 0.714 + 0.25
    assert.equal(r.tone, 'amber');
});

test('empty volumes are ignored', () => {
    const r = doseCheck(70, [{ drug: 'bupi025', ml: '' }]);
    assert.equal(r.lines.length, 0);
    assert.equal(r.totalPercent, null);
});

test('UHB dose table bands, with 50 kg not covered', () => {
    const tbl = LOCSSIPS.find((l) => l.id === 'uhb-fib').doseTable;
    assert.equal(trustBand(tbl, 45).band.volume, 30);
    assert.equal(trustBand(tbl, 51).band.volume, 40);
    assert.deepEqual(trustBand(tbl, 50), { gap: true });
    assert.equal(trustBand(tbl, ''), null);
});

test('ideal body weight (Devine)', () => {
    assert.equal(idealBodyWeight('M', 175), 70.6);
    assert.equal(idealBodyWeight('F', 160), 52.4);
    assert.equal(idealBodyWeight('M', 140), null);
});

test('lipid emulsion doses for 70 kg match the QRH worked example', () => {
    const l = lipidDoses(70);
    assert.equal(l.bolusMl, 105);
    assert.equal(l.infusionMlPerHour, 1050);
    assert.equal(l.maxCumulativeMl, 840);
});
