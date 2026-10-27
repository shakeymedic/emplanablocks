// identifiers.js - possible patient identifiers in free text. A prompt only: it cannot catch everything.

const ID_PATTERNS = [
    { kind: 'an NHS-number-like number', re: /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/ },
    { kind: 'a phone number', re: /\b(?:\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}\b/ },
    { kind: 'an email address', re: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i },
    { kind: 'a postcode', re: /\b[A-Z]{1,2}\d[A-Z\d]?\s+\d[A-Z]{2}\b/ },
    { kind: 'a name with a title', re: /\b(?:Mr|Mrs|Ms|Miss|Mx|Master)\.?\s+[A-Z][a-z]+/ },
    { kind: 'a date of birth', re: /\b(?:DOB|D\.O\.B|date of birth)\b/i },
    { kind: 'a date', re: /\b\d{1,2}[/.-]\d{1,2}[/.-](?:19|20)\d{2}\b/ },
    { kind: 'a hospital number', re: /\b(?:MRN|PID|hospital (?:no|number)|unit (?:no|number))\b/i }
];

export function findIdentifiers(text) {
    if (!text) return [];
    return ID_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.kind);
}
