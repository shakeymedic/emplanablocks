# Regional Anaesthesia Guide (emplanablocks)

Educational aid for emergency department nerve blocks, live at https://emplanablocks.netlify.app and listed on emevidence.org.

- **Do the block:** step through the Trust's LocSSIP (or a clearly labelled generic checklist), check local anaesthetic doses and build a plain-text note to copy into the record.
- **Learn:** technique, probe placement and a simulated ultrasound view for each block.
- **Safety:** maximum dose calculator and LAST management with lipid emulsion doses.

Static vanilla JavaScript PWA, no build step and no framework. Nothing the user enters is stored or sent. Only the theme, the chosen Trust and (if the user ticks it) their own name and designation are kept in local storage.

## Adding a Trust LocSSIP

1. Add the Trust to `TRUSTS` in `js/checklists.js` if it is new.
2. Add an entry to `LOCSSIPS` with the document reference, last updated date and review date.
3. Copy item text exactly from the Trust's document into `label`. Put anything the app adds in `appNote`.
4. Never ask for patient identifiers. Items that need them are `kind: 'paper'`.
5. Add the key phrases to `tests/checklists.test.mjs`, and keep a copy of the source PDF outside the repository.
6. Get the Trust's agreement before its text is published.

## Tests

- `npm test`: smoke test (precached files exist, versions match) and unit tests (doses, notes, checklists, identifier warning).
- `node tests/e2e.mjs [screenshotDir]`: Playwright in Chromium at 360, 320 and 1280 px, served with the live CSP header.

Bump `VERSION` in `js/app.js` and `SW_VERSION` in `sw.js` together.
