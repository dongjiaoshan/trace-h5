import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// 使用项目已有 TypeScript 编译器，测试可在项目要求的 Node 20 上运行。
const source = readFileSync(new URL('../src/api/pig-display-correction.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
});
const { correctPigDisplay } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const originalEarNo = '01-01-2-251120-025';
const correctedEarNo = '01-01-2-251001-025';

function traceFixture() {
  return {
    codeType: 'pork',
    pig: {
      earNo: originalEarNo,
      birthDate: '2025-11-20',
      marketDate: '2026-10-04 19:48:36',
      ageDays: 318,
      marketWeight: '139'
    },
    growthRecords: [{ date: '2026-03-01', ageDays: 101, weight: '42' }],
    medications: [{ date: '2026-02-01', ageDays: 73, name: '疫苗' }],
    pedigree: { sireEarNo: '01-01-1-240101-001', sireAgeDays: 900 },
    product: { produceCode: 'T20261006PG005014', weight: '53000' },
    timeline: [{ traceContent: 'marketing', traceTime: '2026-10-04 19:48:36' }]
  };
}

test('corrects birth date and ear date segment; uses marketing day instead of today for age', () => {
  const source = traceFixture();
  const before = structuredClone(source);
  const result = correctPigDisplay(source);
  assert.equal(result.pig.birthDate, '2025-10-01');
  assert.equal(result.pig.earNo, correctedEarNo);
  assert.equal(result.pig.ageDays, 368);
  assert.equal(result.growthRecords[0].ageDays, 151);
  assert.equal(result.medications[0].ageDays, 123);
  assert.deepEqual(result.timeline, before.timeline);
  assert.deepEqual(result.product, before.product);
  assert.deepEqual(result.pedigree, before.pedigree);
  assert.equal(result.pig.marketWeight, '139');
  assert.deepEqual(source, before, 'keeps the original API response unchanged');
});

test('does not apply the correction again to adapted data', () => {
  const first = correctPigDisplay(traceFixture());
  assert.deepEqual(correctPigDisplay(first), first);
});

test('already corrected backend birthday is not moved a further 50 days', () => {
  const source = traceFixture();
  source.pig.birthDate = '2025-10-01';
  source.pig.ageDays = 368;
  source.growthRecords[0].ageDays = 151;
  source.medications[0].ageDays = 123;
  const result = correctPigDisplay(source);
  assert.equal(result.pig.birthDate, '2025-10-01');
  assert.equal(result.pig.earNo, correctedEarNo);
  assert.equal(result.pig.ageDays, 368);
  assert.equal(result.growthRecords[0].ageDays, 151);
});

test('leaves other pigs, other birthdays and non-pork records unchanged', () => {
  for (const change of [
    { earNo: '01-01-2-251120-023' },
    { birthDate: '2025-11-19' },
    { birthDate: null },
    { birthDate: undefined }
  ]) {
    const source = traceFixture();
    Object.assign(source.pig, change);
    assert.deepEqual(correctPigDisplay(source), source);
  }
  for (const codeType of ['veg', 'gift']) {
    const source = { ...traceFixture(), codeType };
    assert.deepEqual(correctPigDisplay(source), source);
  }
  assert.deepEqual(correctPigDisplay({ codeType: 'pork' }), { codeType: 'pork' });
});

test('missing, invalid and pre-birth event dates do not create an age', () => {
  const source = traceFixture();
  source.pig.marketDate = undefined;
  source.growthRecords = [
    { date: '2026-02-30', ageDays: 102 },
    { date: '2025-09-30', ageDays: 0 },
    { ageDays: 12 },
    { date: '2025-10-01', ageDays: null },
    { date: '2026-03-01T08:00:00+08:00', ageDays: null }
  ];
  source.medications = [{ date: null, ageDays: 4 }];
  const result = correctPigDisplay(source);
  assert.equal(result.pig.ageDays, undefined);
  assert.deepEqual(result.growthRecords.map((row) => row.ageDays), [undefined, undefined, undefined, 0, 151]);
  assert.equal(result.medications[0].ageDays, undefined);
});

test('absent growth and medication sections remain absent', () => {
  const source = traceFixture();
  delete source.growthRecords;
  delete source.medications;
  const result = correctPigDisplay(source);
  assert.equal(result.growthRecords, undefined);
  assert.equal(result.medications, undefined);
});

test('applies the two added corrections with their own date, ear segment and ages', () => {
  for (const entry of [
    {
      earNo: '01-01-2-251120-024', birthDate: '2025-11-20', marketDate: '2026-10-04 19:48:36', ageDays: 318,
      correctedEarNo: '01-01-2-251001-024', correctedBirthDate: '2025-10-01', correctedAge: 368,
      growthAge: 151, medicationAge: 123
    },
    {
      earNo: '01-01-1-251206-006', birthDate: '2025-12-06', marketDate: '2026-10-04 19:47:36', ageDays: 302,
      correctedEarNo: '01-01-1-251002-006', correctedBirthDate: '2025-10-02', correctedAge: 367,
      growthAge: 150, medicationAge: 122
    }
  ]) {
    const source = traceFixture();
    Object.assign(source.pig, { earNo: entry.earNo, birthDate: entry.birthDate, marketDate: entry.marketDate, ageDays: entry.ageDays });
    const original = structuredClone(source);
    const corrected = correctPigDisplay(source);
    assert.equal(corrected.pig.earNo, entry.correctedEarNo);
    assert.equal(corrected.pig.birthDate, entry.correctedBirthDate);
    assert.equal(corrected.pig.ageDays, entry.correctedAge);
    assert.ok(corrected.pig.ageDays > 365);
    assert.equal(corrected.growthRecords[0].ageDays, entry.growthAge);
    assert.equal(corrected.medications[0].ageDays, entry.medicationAge);
    assert.deepEqual(source, original);
    assert.deepEqual(corrected.timeline, source.timeline);
    assert.deepEqual(correctPigDisplay(corrected), corrected);

    const backendCorrected = structuredClone(source);
    backendCorrected.pig.birthDate = entry.correctedBirthDate;
    backendCorrected.pig.ageDays = entry.correctedAge;
    assert.deepEqual(correctPigDisplay(backendCorrected), corrected);

    const changedBirthday = structuredClone(source);
    changedBirthday.pig.birthDate = '2025-11-19';
    assert.deepEqual(correctPigDisplay(changedBirthday), changedBirthday);
  }
});

test('the female pig with the same birthday and sequence as the configured male is unchanged', () => {
  const source = traceFixture();
  Object.assign(source.pig, { earNo: '01-01-2-251206-006', birthDate: '2025-12-06', ageDays: 302 });
  assert.deepEqual(correctPigDisplay(source), source);
});

test('accepts an explicit future correction list and shifts leap days and year boundaries correctly', () => {
  const source = traceFixture();
  Object.assign(source.pig, { earNo: '01-01-1-240301-009', birthDate: '2024-03-01', marketDate: '2025-03-01 10:00:00', ageDays: 365 });
  const correction = { earNo: source.pig.earNo, recordedBirthDate: source.pig.birthDate, addDays: 1 };
  assert.deepEqual(correctPigDisplay(source), source);
  const corrected = correctPigDisplay(source, [correction]);
  assert.equal(corrected.pig.birthDate, '2024-02-29');
  assert.equal(corrected.pig.earNo, '01-01-1-240229-009');
  assert.equal(corrected.pig.ageDays, 366);

  Object.assign(source.pig, { earNo: '01-01-1-250101-009', birthDate: '2025-01-01', marketDate: '2026-01-01 10:00:00' });
  const acrossYear = correctPigDisplay(source, [{ earNo: source.pig.earNo, recordedBirthDate: source.pig.birthDate, addDays: 1 }]);
  assert.equal(acrossYear.pig.birthDate, '2024-12-31');
  assert.equal(acrossYear.pig.earNo, '01-01-1-241231-009');
  assert.equal(acrossYear.pig.ageDays, 366);
});

test('invalid correction settings cannot change the response', () => {
  const source = traceFixture();
  for (const addDays of [-1, 0, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    const result = correctPigDisplay(source, [{ earNo: originalEarNo, recordedBirthDate: '2025-11-20', addDays }]);
    assert.deepEqual(result, source);
  }
  const invalidDateSource = structuredClone(source);
  invalidDateSource.pig.birthDate = '2025-02-30';
  assert.deepEqual(correctPigDisplay(invalidDateSource, [{ earNo: originalEarNo, recordedBirthDate: '2025-02-30', addDays: 50 }]), invalidDateSource);
});

test('only accepts corrected marketing ages in the inclusive range 366 to 380', () => {
  for (const entry of [
    { marketDate: '2026-10-01 10:00:00', ageDays: 315, correctedAge: 365, accepted: false },
    { marketDate: '2026-10-02 10:00:00', ageDays: 316, correctedAge: 366, accepted: true },
    { marketDate: '2026-10-16 10:00:00', ageDays: 330, correctedAge: 380, accepted: true },
    { marketDate: '2026-10-17 10:00:00', ageDays: 331, correctedAge: 381, accepted: false }
  ]) {
    const source = traceFixture();
    Object.assign(source.pig, { marketDate: entry.marketDate, ageDays: entry.ageDays });
    const corrected = correctPigDisplay(source);
    if (entry.accepted) {
      assert.equal(corrected.pig.ageDays, entry.correctedAge);
      assert.equal(corrected.pig.birthDate, '2025-10-01');
    } else {
      assert.deepEqual(corrected, source, 'an out-of-range correction must not fabricate a birthday or clamp an age');
    }
  }
});
