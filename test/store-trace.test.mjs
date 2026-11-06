import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// 与 pig-display-correction.test.mjs 同法：用项目自带 TypeScript 转译后按 data URL 导入（store-trace.ts 只有 type import）。
const source = readFileSync(new URL('../src/api/store-trace.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
});
const { storeTraceView, storeTraceCode, slaughterToArrivalHours } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

const timeline = [
  { traceContent: 'arrival', traceTime: '2026-10-30 06:45:35' },
  { traceContent: 'ship', traceTime: '2026-10-30 04:24:00' },
  { traceContent: 'singe', traceTime: '2026-10-30 00:45:00' },
  { traceContent: 'marketing', traceTime: '2026-10-29 10:26:17' }
];

test('门店不存在 → notFound；当天没有猪（pig=null）→ 空态；有猪 → ready', () => {
  assert.equal(storeTraceView(null), 'notFound');
  assert.equal(storeTraceView(undefined), 'notFound');
  assert.equal(storeTraceView({ codeType: 'pork', pig: null, store: { name: 'A店' } }), 'empty');
  assert.equal(storeTraceView({ codeType: 'pork', pig: { earNo: 'E1' } }), 'ready');
});

test('下钻子页用选中那头猪的追溯码；没有码返空串', () => {
  assert.equal(storeTraceCode({ product: { produceCode: 'T20261106PG000001' } }), 'T20261106PG000001');
  assert.equal(storeTraceCode({ product: null }), '');
  assert.equal(storeTraceCode(null), '');
});

test('屠宰到店小时 = 到店 − 屠宰完成，四舍五入整小时', () => {
  assert.equal(slaughterToArrivalHours(timeline), 6);
  assert.equal(
    slaughterToArrivalHours([
      { traceContent: 'singe', traceTime: '2026-10-29 23:10:00' },
      { traceContent: 'arrival', traceTime: '2026-10-30 01:00:00' }
    ]),
    2,
    '跨天也按实际间隔算'
  );
});

test('缺屠宰或到店节点 / 时间异常 → 不显示（undefined）', () => {
  assert.equal(slaughterToArrivalHours([]), undefined);
  assert.equal(slaughterToArrivalHours(null), undefined);
  assert.equal(slaughterToArrivalHours(timeline.filter((n) => n.traceContent !== 'arrival')), undefined);
  assert.equal(slaughterToArrivalHours(timeline.filter((n) => n.traceContent !== 'singe')), undefined);
  assert.equal(
    slaughterToArrivalHours([
      { traceContent: 'singe', traceTime: '2026-10-30 08:00:00' },
      { traceContent: 'arrival', traceTime: '2026-10-30 06:00:00' }
    ]),
    undefined
  );
  assert.equal(slaughterToArrivalHours([{ traceContent: 'singe', traceTime: 'bad' }, { traceContent: 'arrival', traceTime: '2026-10-30 06:00:00' }]), undefined);
});
