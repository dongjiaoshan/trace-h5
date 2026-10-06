import type { PublicTraceVo } from './types';

export interface PigDisplayCorrection {
  /** 系统内原耳号，用于精确限定适配范围。 */
  earNo: string;
  /** 核对过的原始出生日期，用于防止数据变化后重复校正。 */
  recordedBirthDate: string;
  /** 展示日龄增加的天数；展示出生日期相应提前。 */
  addDays: number;
}

// 后续增加猪只时只需在名单中新增原耳号、原出生日期和校正天数。
// 后台生日纠正后不会再次提前；后台耳号也纠正后可删除对应配置。
export const PIG_DISPLAY_CORRECTIONS: readonly PigDisplayCorrection[] = [
  { earNo: '01-01-2-251120-025', recordedBirthDate: '2025-11-20', addDays: 50 },
  { earNo: '01-01-2-251120-024', recordedBirthDate: '2025-11-20', addDays: 50 },
  { earNo: '01-01-1-251206-006', recordedBirthDate: '2025-12-06', addDays: 65 }
];

/** 校正后的出栏日龄校验范围；越界时保留原展示，避免自动截断真实日龄。 */
const DISPLAY_AGE_RANGE = { min: 366, max: 380 } as const;

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

function correctedAge(date: string | undefined, birthDay: number): number | undefined {
  const eventDay = calendarDay(date);
  return eventDay !== undefined && eventDay >= birthDay ? eventDay - birthDay : undefined;
}

/** 按名单校正 H5 展示副本，保留接口原值及所有追溯业务时间。 */
export function correctPigDisplay(
  trace: PublicTraceVo,
  corrections: readonly PigDisplayCorrection[] = PIG_DISPLAY_CORRECTIONS
): PublicTraceVo {
  const pig = trace.pig;
  if (trace.codeType !== 'pork' || !pig?.earNo) return trace;

  const correction = corrections.find((entry) => entry.earNo === pig.earNo);
  if (!correction || !Number.isSafeInteger(correction.addDays) || correction.addDays <= 0) return trace;

  const recordedDay = calendarDay(correction.recordedBirthDate);
  if (recordedDay === undefined) return trace;
  const birthDay = recordedDay - correction.addDays;
  const correctedDate = new Date(birthDay * 86_400_000);
  if (!Number.isFinite(correctedDate.getTime())) return trace;
  const birthDate = correctedDate.toISOString().slice(0, 10);
  if (
    calendarDay(birthDate) === undefined ||
    (pig.birthDate !== correction.recordedBirthDate && pig.birthDate !== birthDate)
  ) {
    return trace;
  }

  const ageDays = correctedAge(pig.marketDate, birthDay);
  if (ageDays !== undefined && (ageDays < DISPLAY_AGE_RANGE.min || ageDays > DISPLAY_AGE_RANGE.max)) {
    return trace;
  }

  const earParts = pig.earNo.split('-');
  earParts[earParts.length - 2] = birthDate.replace(/-/g, '').slice(2);
  const corrected: PublicTraceVo = {
    ...trace,
    pig: {
      ...pig,
      earNo: earParts.join('-'),
      birthDate,
      ageDays
    }
  };
  if (trace.growthRecords) {
    corrected.growthRecords = trace.growthRecords.map((row) => ({ ...row, ageDays: correctedAge(row.date, birthDay) }));
  }
  if (trace.medications) {
    corrected.medications = trace.medications.map((row) => ({ ...row, ageDays: correctedAge(row.date, birthDay) }));
  }
  return corrected;
}
