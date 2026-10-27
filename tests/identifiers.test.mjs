import test from 'node:test';
import assert from 'node:assert/strict';
import { findIdentifiers } from '../js/identifiers.js';
import { freeText } from '../js/note.js';

test('flags likely identifiers', () => {
    assert.ok(findIdentifiers('NHS 943 476 5919').length);
    assert.ok(findIdentifiers('born 03/04/1941').length);
    assert.ok(findIdentifiers('Mrs Smith').length);
    assert.ok(findIdentifiers('MRN 12345').length);
    assert.deepEqual(findIdentifiers('Left NOF, 40 ml given'), []);
});

test('staff name fields are not checked', () => {
    const t = freeText({ answers: { 'pre.consultant': 'Mr Jones', 'signout.equipProblems.details': 'Mrs Smith' }, procedure: {}, after: {} });
    assert.ok(!t.includes('Mr Jones'));
    assert.ok(t.includes('Mrs Smith'));
});
