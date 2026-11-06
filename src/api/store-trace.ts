/**
 * 门店猪只追溯码（V7 row40）的纯逻辑：页面状态判定 + 顶部统计数字。
 *
 * 不依赖 vue / axios，便于 node --test 直接覆盖。
 * 后端：GET /djs/public/trace/store/{storeKey}（@SaIgnore 无登录）
 *   - 门店不存在 → data=null；
 *   - 门店当天没有可追溯的猪 → data.pig=null（只带门店块）；
 *   - 否则 = 选中那头猪的猪肉追溯（父系 / 母系缺一方时 pedigree 已置 null）。
 */
import type { PublicTraceVo, TraceEventVo } from './types';

export type StoreTraceView = 'notFound' | 'empty' | 'ready';

/** 门店追溯页该显示哪种状态。 */
export function storeTraceView(data: PublicTraceVo | null | undefined): StoreTraceView {
  if (!data) return 'notFound';
  return data.pig ? 'ready' : 'empty';
}

/** 下钻子页（生长记录 / 养殖基地）用的追溯码：选中那头猪的码；没有返空串。 */
export function storeTraceCode(data: PublicTraceVo | null | undefined): string {
  return data?.product?.produceCode ?? '';
}

/** 后端时间串 `yyyy-MM-dd HH:mm:ss` 按上海时间解析成毫秒；解析不了返 undefined。 */
function parseShanghaiTime(value?: string): number | undefined {
  if (typeof value !== 'string') return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  if (!m) return undefined;
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 8, +m[5], m[6] ? +m[6] : 0);
  return Number.isFinite(ms) ? ms : undefined;
}

function nodeTime(timeline: readonly TraceEventVo[], content: string): number | undefined {
  const node = timeline.find((n) => n.traceContent === content);
  return parseShanghaiTime(node?.traceTime);
}

/**
 * 「屠宰到店」小时数 = 到店节点时间 − 屠宰完成节点时间，四舍五入到整小时。
 * 任一节点缺失、或到店早于屠宰（数据异常）→ undefined（前端不显示这一格）。
 */
export function slaughterToArrivalHours(timeline: readonly TraceEventVo[] | null | undefined): number | undefined {
  if (!timeline?.length) return undefined;
  const singe = nodeTime(timeline, 'singe');
  const arrival = nodeTime(timeline, 'arrival');
  if (singe === undefined || arrival === undefined || arrival < singe) return undefined;
  return Math.round((arrival - singe) / 3_600_000);
}
