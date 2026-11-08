import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Import the dependency-free browser module without changing the app's package type.
const source = await fs.readFile(new URL('../src/lib/portal-knowledge.js', import.meta.url), 'utf8');
const {categories, getDiagnostic, classifyIssue, buildHandoff} = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('recognises concrete requests and distinguishes existing-site issues from new work', () => {
  const cases = [
    ['Mein WLAN fällt im Nebenraum aus.', 'internet-wlan'],
    ['Das Internet funktioniert auf keinem Gerät.', 'internet-wlan'],
    ['Drucker druckt nicht über WLAN.', 'drucker'],
    ['Der Scanner zeigt einen Fehler.', 'drucker'],
    ['Das Programm startet nicht mehr unter Windows.', 'computer-software'],
    ['Unsere vorhandene Website zeigt Fehler 500.', 'website'],
    ['Wir brauchen eine neue Website für die Praxis.', 'projekt'],
    ['Eine Webanwendung entwickeln.', 'projekt'],
    ['Ich möchte Excel-Angaben automatisch übertragen.', 'automatisierung'],
  ];
  for (const [description, expected] of cases) assert.equal(classifyIssue(description), expected, description);
});

test('does not pretend to classify unknown or conflicting concerns', () => {
  for (const value of ['', null, undefined, 'Hallo und guten Tag', 'Ich brauche Hilfe', 'Website und Drucker funktionieren nicht.', 'WLAN und Drucker funktionieren ebenfalls nicht.', 'Internet und Drucker funktionieren nicht.', 'Drucker und Internet funktionieren nicht.']) {
    assert.equal(classifyIssue(value), null, String(value));
  }
  assert.equal(classifyIssue('Kein Druckerproblem. Das WLAN fällt aus.'), 'internet-wlan');
});

test('every guided path provides verifiable observations and an explicit escalation condition', () => {
  assert.equal(categories.length, 6);
  assert.equal(new Set(categories.map((category) => category.id)).size, categories.length);
  for (const category of categories) {
    assert.equal(getDiagnostic(category.id), category);
    assert.ok(category.title && category.description);
    assert.ok(category.steps.length >= 3);
    assert.equal(new Set(category.steps.map((step) => step.id)).size, category.steps.length);
    for (const step of category.steps) {
      for (const field of ['title', 'instruction', 'verify', 'escalateWhen']) assert.ok(step[field]?.trim(), category.id + ':' + step.id + ':' + field);
      // Steps may explicitly prohibit a risky action but must not direct it.
      assert.doesNotMatch(step.instruction, /(?:setzen|stellen) sie .{0,45}(?:zuruck|zurück)|(?:starten sie|fuhren sie|führen sie).{0,35}(?:neustart|reset)|geben sie .{0,30}(?:passwort|kennwort).{0,15}ein|loschen sie|löschen sie/i);
    }
  }
  assert.equal(getDiagnostic('missing'), null);
});

test('handoff includes only supplied details and does not mark checks as passed', () => {
  const text = buildHandoff({category:'drucker',description:'Seit Montag offline.',device:'Bürodrucker',attempts:['Status abgelesen: offline', 'Warteschlange nicht geprüft']});
  assert.match(text, /Bereich: Drucker & Scannen/);
  assert.match(text, /Seit Montag offline\./);
  assert.match(text, /Warteschlange nicht geprüft/);
  assert.doesNotMatch(text, /bestanden|freigegeben|genehmigt/i);
  assert.doesNotMatch(buildHandoff(), /undefined|null/);
  assert.match(buildHandoff({category:'missing',description:'Mein Anliegen'}), /Mein Anliegen/);
  assert.ok(!buildHandoff({description:'Test\u0000Text'}).includes('\u0000'));
});
