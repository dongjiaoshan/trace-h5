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
import { correctPigDisplay } from './pig-display-correction';

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
    return { data: correctPigDisplay(data), errorKey: '' };
  } catch {
    return { data: null, errorKey: 'loadFailed' };
  }
}

export interface StoreTraceLoadResult {
  /** 门店不存在为 null；门店当天没有可追溯的猪时 data.pig 为空（页面显示空态） */
  data: PublicTraceVo | null;
  errorKey: '' | 'missingStore' | 'storeNotFound' | 'loadFailed';
}

/**
 * 按门店标识拉门店猪只追溯（V7 row40，GET /djs/public/trace/store/{storeKey}）。
 * 门店编码原样传值（encodeURIComponent 防特殊字符打断路径）。
 */
export async function loadStoreTrace(storeKey: string): Promise<StoreTraceLoadResult> {
  if (!storeKey) {
    return { data: null, errorKey: 'missingStore' };
  }
  try {
    const res = await http.get<ApiResult<PublicTraceVo>>(`/djs/public/trace/store/${encodeURIComponent(storeKey)}`);
    const data = res.data?.data ?? null;
    if (!data) {
      return { data: null, errorKey: 'storeNotFound' };
    }
    return { data: data.pig ? correctPigDisplay(data) : data, errorKey: '' };
  } catch {
    return { data: null, errorKey: 'loadFailed' };
  }
}
