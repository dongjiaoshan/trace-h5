/**
 * 码值 → 中文 label 映射（C 端展示，单语中文，无 i18n 基建）。
 *
 * 后端 traceContent / medications.type / plotRecords.workType / pig.breed / pig.sex 返原码值，
 * 前端做中文展示。未知码兜底返原码值，避免空白。
 */

/** 时间轴节点类型码 → 中文。 */
const TRACE_CONTENT_LABELS: Record<string, string> = {
  marketing: '营销出栏',
  singe: '屠宰完成',
  white_bar_in: '白条入库',
  white_bar_pick: '白条出库(领用)',
  slaughter: '屠宰',
  acid: '排酸',
  in_stock: '入库',
  ship: '发货',
  arrival: '到店',
  sowing: '播种',
  harvest: '采摘',
  veg_handle: '毛菜处理',
  pack: '打包'
};

/** 用药类型码 → 中文。 */
const MEDICATION_TYPE_LABELS: Record<string, string> = {
  health: '保健',
  treatment: '治疗',
  vaccine: '疫苗'
};

/** 农事类型码 → 中文（对齐后端 djs_farm_work_type 12 类）。 */
const FARM_WORK_TYPE_LABELS: Record<string, string> = {
  tillage_break: '翻耕',
  tillage_prepare: '整地',
  fertilize: '施肥',
  transplant: '移栽',
  water_fertilize: '水肥',
  irrigation: '浇灌',
  weed: '除草',
  pest_control: '病虫防治',
  pruning: '整枝绑蔓',
  rotation: '退茬',
  disaster: '灾害损失',
  harvest_activity: '采摘活动'
};

/** 猪只性别码 → 中文（F=母 M=公）。 */
const PIG_SEX_LABELS: Record<string, string> = {
  F: '母',
  M: '公'
};

/** 猪只品种码 → 中文（V1 已知 black=黑猪；未知码兜底返原值）。 */
const PIG_BREED_LABELS: Record<string, string> = {
  black: '黑猪'
};

/** traceContent 码 → 中文 label（未知码返原码值）。 */
export function traceContentLabel(code?: string): string {
  if (!code) return '';
  return TRACE_CONTENT_LABELS[code] ?? code;
}

/** medications.type 码 → 中文 label（未知码返原码值）。 */
export function medicationTypeLabel(code?: string): string {
  if (!code) return '';
  return MEDICATION_TYPE_LABELS[code] ?? code;
}

/** plotRecords.workType 码 → 中文 label（未知码返原码值）。 */
export function farmWorkTypeLabel(code?: string): string {
  if (!code) return '';
  return FARM_WORK_TYPE_LABELS[code] ?? code;
}

/** pig.sex 码 → 中文 label（未知码返原码值）。 */
export function pigSexLabel(code?: string): string {
  if (!code) return '';
  return PIG_SEX_LABELS[code] ?? code;
}

/** pig.breed 码 → 中文 label（未知码返原码值）。 */
export function pigBreedLabel(code?: string): string {
  if (!code) return '';
  return PIG_BREED_LABELS[code] ?? code;
}
