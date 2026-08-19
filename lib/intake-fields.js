// Shared Book an AI Assessment field lists for the website chatbot.
// Keep these in sync with the <select>/<checkbox> values in index.html.

export const SEGMENTS = [
  'Mobile / MNO/MVNO',
  'Broadband / Fixed',
  'Subsea / Backbone',
  'Data Center / Infrastructure',
  'Other',
];

export const SIZES = [
  'Startup / Pilot',
  'Small (regional, single market)',
  'Medium (multi-market, national)',
  'Large (national / multinational carrier)',
];

export const ISSUES = [
  'No clear AI roadmap',
  'Alarm noise / NOC overload',
  'Slow / manual service delivery',
  'Data quality',
  'System integration issues',
  'Order-to-activation delays',
  'Other',
];

export const INTERESTS = [
  'AI Readiness Assessment',
  'Telecom Digital Transformation',
  'Service Delivery Optimization',
  'Network Operations Automation',
  'Data Readiness for AI',
  'AI Strategy & Advisory',
];

export const REQUIRED_KEYS = ['name', 'email', 'company', 'segment', 'size', 'interests'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function phoneOk(val) {
  const raw = String(val || '').trim();
  if (!raw) return true;
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^[+()[\]\d.\-\s]+$/.test(raw);
}

function clip(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function fold(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function pickAllowed(value, allowed, aliases) {
  const raw = clip(value, 160);
  if (!raw) return '';
  if (allowed.includes(raw)) return raw;
  const key = fold(raw);
  if (aliases[key]) return aliases[key];
  const hit = allowed.find((option) => {
    const f = fold(option);
    return f === key || f.includes(key) || key.includes(f);
  });
  return hit || '';
}

const SEGMENT_ALIASES = {
  mobile: 'Mobile / MNO/MVNO',
  mno: 'Mobile / MNO/MVNO',
  mvno: 'Mobile / MNO/MVNO',
  'mobile mno mvno': 'Mobile / MNO/MVNO',
  movil: 'Mobile / MNO/MVNO',
  celular: 'Mobile / MNO/MVNO',
  broadband: 'Broadband / Fixed',
  fixed: 'Broadband / Fixed',
  fibra: 'Broadband / Fixed',
  fiber: 'Broadband / Fixed',
  isp: 'Broadband / Fixed',
  'banda ancha': 'Broadband / Fixed',
  fija: 'Broadband / Fixed',
  subsea: 'Subsea / Backbone',
  backbone: 'Subsea / Backbone',
  wholesale: 'Subsea / Backbone',
  'data center': 'Data Center / Infrastructure',
  datacenter: 'Data Center / Infrastructure',
  dc: 'Data Center / Infrastructure',
  infraestructura: 'Data Center / Infrastructure',
  other: 'Other',
  otro: 'Other',
  outra: 'Other',
};

const SIZE_ALIASES = {
  startup: 'Startup / Pilot',
  pilot: 'Startup / Pilot',
  piloto: 'Startup / Pilot',
  small: 'Small (regional, single market)',
  pequena: 'Small (regional, single market)',
  regional: 'Small (regional, single market)',
  medium: 'Medium (multi-market, national)',
  mediana: 'Medium (multi-market, national)',
  'multi market': 'Medium (multi-market, national)',
  large: 'Large (national / multinational carrier)',
  grande: 'Large (national / multinational carrier)',
  carrier: 'Large (national / multinational carrier)',
  multinacional: 'Large (national / multinational carrier)',
};

const ISSUE_ALIASES = {
  roadmap: 'No clear AI roadmap',
  noc: 'Alarm noise / NOC overload',
  alarm: 'Alarm noise / NOC overload',
  alarmas: 'Alarm noise / NOC overload',
  manual: 'Slow / manual service delivery',
  delivery: 'Slow / manual service delivery',
  data: 'Data quality',
  datos: 'Data quality',
  integration: 'System integration issues',
  integracion: 'System integration issues',
  activation: 'Order-to-activation delays',
  activacion: 'Order-to-activation delays',
  other: 'Other',
  otro: 'Other',
};

const INTEREST_ALIASES = {
  assessment: 'AI Readiness Assessment',
  readiness: 'AI Readiness Assessment',
  transformation: 'Telecom Digital Transformation',
  digital: 'Telecom Digital Transformation',
  'service delivery': 'Service Delivery Optimization',
  delivery: 'Service Delivery Optimization',
  automation: 'Network Operations Automation',
  noc: 'Network Operations Automation',
  'network operations': 'Network Operations Automation',
  data: 'Data Readiness for AI',
  strategy: 'AI Strategy & Advisory',
  advisory: 'AI Strategy & Advisory',
};

function normalizeInterests(value) {
  const list = Array.isArray(value)
    ? value
    : String(value || '').split(/[,;|/]+/);
  const out = [];
  for (const item of list) {
    const mapped = pickAllowed(item, INTERESTS, INTEREST_ALIASES);
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out;
}

export function sanitizeIntake(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = {};

  const name = clip(src.name, 80);
  if (name) out.name = name;

  const email = clip(src.email, 120).toLowerCase();
  if (email && EMAIL_RE.test(email)) out.email = email;

  const phone = clip(src.phone, 24);
  if (phone && phoneOk(phone)) out.phone = phone;

  const company = clip(src.company, 120);
  if (company) out.company = company;

  const segment = pickAllowed(src.segment, SEGMENTS, SEGMENT_ALIASES);
  if (segment) out.segment = segment;

  const segmentOther = clip(src.segment_other, 120);
  if (segment === 'Other' && segmentOther) out.segment_other = segmentOther;

  const size = pickAllowed(src.size, SIZES, SIZE_ALIASES);
  if (size) out.size = size;

  const issue = pickAllowed(src.issue, ISSUES, ISSUE_ALIASES);
  if (issue) out.issue = issue;

  const issueOther = clip(src.issue_other, 200);
  if (issue === 'Other' && issueOther) out.issue_other = issueOther;

  const interests = normalizeInterests(src.interests);
  if (interests.length) out.interests = interests;

  const notes = clip(src.notes, 500);
  if (notes) out.notes = notes;

  if (src.ready_to_submit === true) out.ready_to_submit = true;

  return out;
}

export function mergeIntake(base, patch) {
  const merged = { ...sanitizeIntake(base), ...sanitizeIntake(patch) };
  if (Array.isArray(patch?.interests) || typeof patch?.interests === 'string') {
    const next = sanitizeIntake({ interests: patch.interests }).interests;
    if (next) merged.interests = next;
  }
  if (merged.segment !== 'Other') delete merged.segment_other;
  if (merged.issue !== 'Other') delete merged.issue_other;
  return merged;
}

export function missingRequired(intake) {
  const data = sanitizeIntake(intake);
  const missing = [];
  if (!data.name) missing.push('name');
  if (!data.email) missing.push('email');
  if (!data.company) missing.push('company');
  if (!data.segment) missing.push('segment');
  if (data.segment === 'Other' && !data.segment_other) missing.push('segment_other');
  if (!data.size) missing.push('size');
  if (data.issue === 'Other' && !data.issue_other) missing.push('issue_other');
  if (!data.interests || !data.interests.length) missing.push('interests');
  return missing;
}

export function isIntakeComplete(intake) {
  return missingRequired(intake).length === 0;
}

export const RECORD_INTAKE_TOOL = {
  name: 'record_intake',
  description:
    'Save or update Book an AI Assessment fields as soon as the visitor provides them. Call this on every turn that includes any intake value. Do not wait until the form is complete. Set ready_to_submit true only after required fields are saved and the visitor confirmed they want to send the request.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Visitor first and last name' },
      email: { type: 'string', description: 'Work email address' },
      phone: { type: 'string', description: 'Optional phone number' },
      company: { type: 'string', description: 'Company or operator name' },
      segment: { type: 'string', enum: SEGMENTS, description: 'Type of operation' },
      segment_other: { type: 'string', description: 'Required when segment is Other' },
      size: { type: 'string', enum: SIZES, description: 'Company size' },
      issue: { type: 'string', enum: ISSUES, description: 'Biggest operational issue; omit if skipped' },
      issue_other: { type: 'string', description: 'Required when issue is Other' },
      interests: {
        type: 'array',
        items: { type: 'string', enum: INTERESTS },
        description: 'Connect services they want to explore; one or more',
      },
      notes: { type: 'string', description: 'Optional extra context they volunteered; never required' },
      ready_to_submit: {
        type: 'boolean',
        description: 'True only after a brief summary and an explicit visitor confirmation to send',
      },
    },
  },
};
