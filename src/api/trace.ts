/**
 * 公开追溯取数（@SaIgnore 无登录）。
 *
 * 后端：GET /djs/public/trace/{traceCode}
 *   - 码不存在返 code=200 + data=null（友好响应，前端空判提示）。
 *   - Redis ~10min 缓存。
 * traceCode = produce_code 业务码 string（禁 Number()，原样传值防截断）。
 */
import http from './http';
import type { ApiResult, PublicTraceVo } from './types';

export interface TraceLoadResult {
  data: PublicTraceVo | null;
  /** 错误状态键（state 文案）；无错为空串 */
  errorKey: '' | 'missingCode' | 'notFound' | 'loadFailed';
}

/** 按 produce_code 拉公开追溯聚合。 */
export async function loadTrace(code: string): Promise<TraceLoadResult> {
  if (!code) {
    return { data: null, errorKey: 'missingCode' };
  }
  try {
    const res = await http.get<ApiResult<PublicTraceVo>>(`/djs/public/trace/${code}`);
    const data = res.data?.data ?? null;
    if (!data) {
      return { data: null, errorKey: 'notFound' };
    }
    return { data, errorKey: '' };
  } catch {
    return { data: null, errorKey: 'loadFailed' };
  }
}
