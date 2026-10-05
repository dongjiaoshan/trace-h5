import type { PublicTraceVo } from './types';

// Kevin 2026-10-06 确认该猪生日录晚了 50 天；生产只读核查原值为 2025-11-20。
// 后台生日纠正后仍按正确生日展示耳号；后台耳号也纠正后可删除此适配。
const CORRECTION = {
  earNo: '01-01-2-251120-025',
  recordedBirthDate: '2025-11-20',
  birthDate: '2025-10-01'
} as const;

/** 使用业务日期的日历日计算，避免浏览器时区和夏令时影响日龄。 */
function calendarDay(date?: string): number | undefined {
  if (typeof date !== 'string') return undefined;
  const match = /^(\d{4}-\d{2}-\d{2})(?:$|[ T])/.exec(date);
  if (!match) return undefined;
  const time = Date.parse(`${match[1]}T00:00:00Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== match[1]) {
    return undefined;
  }
  return time / 86_400_000;
}

function correctedAge(date?: string): number | undefined {
  const eventDay = calendarDay(date);
  const birthDay = calendarDay(CORRECTION.birthDate)!;
  return eventDay !== undefined && eventDay >= birthDay ? eventDay - birthDay : undefined;
}

/** 仅校正该猪的 H5 展示副本，保留接口原值及所有追溯业务时间。 */
export function correctPigDisplay(trace: PublicTraceVo): PublicTraceVo {
  const pig = trace.pig;
  if (
    trace.codeType !== 'pork' ||
    pig?.earNo !== CORRECTION.earNo ||
    (pig.birthDate !== CORRECTION.recordedBirthDate && pig.birthDate !== CORRECTION.birthDate)
  ) {
    return trace;
  }

  const earParts = pig.earNo.split('-');
  earParts[earParts.length - 2] = CORRECTION.birthDate.replace(/-/g, '').slice(2);
  const corrected: PublicTraceVo = {
    ...trace,
    pig: {
      ...pig,
      earNo: earParts.join('-'),
      birthDate: CORRECTION.birthDate,
      ageDays: correctedAge(pig.marketDate)
    }
  };
  if (trace.growthRecords) {
    corrected.growthRecords = trace.growthRecords.map((row) => ({ ...row, ageDays: correctedAge(row.date) }));
  }
  if (trace.medications) {
    corrected.medications = trace.medications.map((row) => ({ ...row, ageDays: correctedAge(row.date) }));
  }
  return corrected;
}
