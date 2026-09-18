/**
 * fortune-core.js — 이름 + 생년월일로 운세를 만드는 순수 계산 모듈
 *
 * 설계 원칙
 *  1) 순수 함수. DOM·네트워크·파일 접근이 없어 브라우저/Node/RN 어디서든 씁니다.
 *  2) 결정론적. 같은 (이름, 생년월일, 조회날짜)는 항상 같은 결과를 냅니다.
 *     Math.random()을 쓰면 새로고침마다 운세가 바뀌어 신뢰를 잃습니다.
 *  3) 데이터 분리. 문구·표는 전부 data/*.json에 있고 여기엔 로직만 둡니다.
 *
 * 정확도에 관한 경고 (README의 '정확도' 절도 함께 보세요)
 *  - 월주(月柱)는 24절기 절입 시각으로 갈립니다. 여기서는 고정 근사일을 쓰므로
 *    절입일 ±1일에 태어난 사람은 월주가 틀릴 수 있습니다.
 *  - 정밀한 사주가 필요하면 lunar-javascript 같은 천문 계산 라이브러리로
 *    getMonthBranchIndex()만 교체하면 나머지는 그대로 씁니다.
 */

// ─────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────

export const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const STEM_ELEMENTS = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
export const BRANCH_ELEMENTS = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];
export const BRANCH_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

/** 절기 절입 근사일. b = 해당 절기부터 시작되는 월지 인덱스 */
const SOLAR_TERMS = [
  { m: 1, d: 6, b: 1 },   // 소한 → 축월
  { m: 2, d: 4, b: 2 },   // 입춘 → 인월 (사주에서 한 해의 시작)
  { m: 3, d: 6, b: 3 },   // 경칩 → 묘월
  { m: 4, d: 5, b: 4 },   // 청명 → 진월
  { m: 5, d: 6, b: 5 },   // 입하 → 사월
  { m: 6, d: 6, b: 6 },   // 망종 → 오월
  { m: 7, d: 7, b: 7 },   // 소서 → 미월
  { m: 8, d: 8, b: 8 },   // 입추 → 신월
  { m: 9, d: 8, b: 9 },   // 백로 → 유월
  { m: 10, d: 8, b: 10 }, // 한로 → 술월
  { m: 11, d: 7, b: 11 }, // 입동 → 해월
  { m: 12, d: 7, b: 0 },  // 대설 → 자월
];

// ─────────────────────────────────────────────────────────────
// 결정론적 난수
// ─────────────────────────────────────────────────────────────

/** FNV-1a 32bit 해시. 같은 문자열이면 언제나 같은 정수. */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG. seed가 같으면 동일한 수열을 냅니다. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 배열에서 seed 기반으로 하나 고르기 */
export function pickBy(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// ─────────────────────────────────────────────────────────────
// 띠 · 간지
// ─────────────────────────────────────────────────────────────

/**
 * 띠를 구합니다.
 * @param {number} year
 * @param {number} [month] 입춘 보정을 쓰려면 월·일도 넘기세요
 * @param {number} [day]
 * @param {'ipchun'|'jan1'} [boundary='ipchun'] 띠가 바뀌는 기준
 */
export function getZodiacAnimal(year, month, day, boundary = 'ipchun') {
  let y = year;
  if (boundary === 'ipchun' && month != null && day != null) {
    if (month < 2 || (month === 2 && day < 4)) y -= 1;
  }
  const idx = ((y - 4) % 12 + 12) % 12;
  return { index: idx, branch: BRANCHES[idx], animal: BRANCH_ANIMALS[idx] };
}

/** 연주(年柱) 간지 */
export function getYearPillar(year, month, day, boundary = 'ipchun') {
  let y = year;
  if (boundary === 'ipchun' && month != null && day != null) {
    if (month < 2 || (month === 2 && day < 4)) y -= 1;
  }
  const stem = ((y - 4) % 10 + 10) % 10;
  const branch = ((y - 4) % 12 + 12) % 12;
  return { stem, branch, text: STEMS[stem] + BRANCHES[branch] };
}

/** 월지 인덱스 (근사 절기 기준) */
export function getMonthBranchIndex(month, day) {
  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const t = SOLAR_TERMS[i];
    if (month > t.m || (month === t.m && day >= t.d)) return t.b;
  }
  return 0; // 1/6 이전은 전년 대설 구간 = 자월
}

/** 월주(月柱). 인월 천간은 연간에 따라 병·무·경·임·갑 순으로 시작합니다. */
export function getMonthPillar(yearStemIndex, month, day) {
  const branch = getMonthBranchIndex(month, day);
  const firstStem = [2, 4, 6, 8, 0][yearStemIndex % 5]; // 인월의 천간
  const offset = (branch - 2 + 12) % 12;
  const stem = (firstStem + offset) % 10;
  return { stem, branch, text: STEMS[stem] + BRANCHES[branch] };
}

/** 그레고리력 → 율리우스 적일(JDN) */
export function toJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  );
}

/**
 * 일주(日柱). JDN을 60갑자에 맞춥니다.
 * 검산: 2000-01-01 → 무오일. (JDN 2451545 + 49) % 60 = 54 → 무(4), 오(6)
 */
export function getDayPillar(year, month, day) {
  const idx = (toJDN(year, month, day) + 49) % 60;
  return { stem: idx % 10, branch: idx % 12, index: idx, text: STEMS[idx % 10] + BRANCHES[idx % 12] };
}

/** 시지 인덱스. 23~01시가 자시입니다. */
export function getHourBranchIndex(hour) {
  return Math.floor(((hour + 1) % 24) / 2);
}

/** 시주(時柱). 자시의 천간은 일간에 따라 갑·병·무·경·임 순으로 시작합니다. */
export function getHourPillar(dayStemIndex, hour) {
  const branch = getHourBranchIndex(hour);
  const stem = ((dayStemIndex % 5) * 2 + branch) % 10;
  return { stem, branch, text: STEMS[stem] + BRANCHES[branch] };
}

/**
 * 사주팔자 네 기둥을 모두 구합니다.
 * @param {object} input
 * @param {number} input.year
 * @param {number} input.month 1~12
 * @param {number} input.day
 * @param {number} [input.hour] 0~23. 모르면 시주를 생략합니다(실제 서비스에서 흔한 경우).
 * @param {number} [input.minute=0]
 * @param {boolean} [input.trueSolarTime=false] 진태양시 보정(한국 기준 약 -32분)
 * @param {number} [input.solarOffsetMinutes=-32]
 */
export function getFourPillars({
  year, month, day, hour = null, minute = 0,
  trueSolarTime = false, solarOffsetMinutes = -32,
}) {
  let y = year, mo = month, d = day, h = hour, mi = minute;

  // 진태양시 보정: 분 단위로 밀고 날짜 넘어가면 조정
  if (trueSolarTime && h != null) {
    const dt = new Date(Date.UTC(y, mo - 1, d, h, mi));
    dt.setUTCMinutes(dt.getUTCMinutes() + solarOffsetMinutes);
    y = dt.getUTCFullYear(); mo = dt.getUTCMonth() + 1; d = dt.getUTCDate();
    h = dt.getUTCHours(); mi = dt.getUTCMinutes();
  }

  // 야자시(23시 이후)는 다음 날로 넘겨 일주를 잡습니다.
  let dayY = y, dayM = mo, dayD = d;
  if (h != null && h >= 23) {
    const dt = new Date(Date.UTC(y, mo - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 1);
    dayY = dt.getUTCFullYear(); dayM = dt.getUTCMonth() + 1; dayD = dt.getUTCDate();
  }

  const yearP = getYearPillar(y, mo, d);
  const monthP = getMonthPillar(yearP.stem, mo, d);
  const dayP = getDayPillar(dayY, dayM, dayD);
  const hourP = h == null ? null : getHourPillar(dayP.stem, h);

  return {
    year: yearP, month: monthP, day: dayP, hour: hourP,
    dayMaster: { stem: dayP.stem, name: STEMS[dayP.stem], element: STEM_ELEMENTS[dayP.stem] },
    text: [yearP.text, monthP.text, dayP.text, hourP?.text].filter(Boolean).join(' '),
    approximate: true, // 절기 근사 사용 중임을 UI에서 밝히세요
  };
}

/** 사주의 오행 분포를 셉니다. 천간·지지 8자를 모두 반영. */
export function countElements(pillars) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const key of ['year', 'month', 'day', 'hour']) {
    const p = pillars[key];
    if (!p) continue;
    counts[STEM_ELEMENTS[p.stem]] += 1;
    counts[BRANCH_ELEMENTS[p.branch]] += 1;
  }
  const entries = Object.entries(counts);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
  const missing = entries.filter(([, v]) => v === 0).map(([k]) => k);
  return { counts, total, strongest, weakest, missing };
}

// ─────────────────────────────────────────────────────────────
// 서양 별자리 · 생명수
// ─────────────────────────────────────────────────────────────

/** western-zodiac.json의 signs 배열을 넘기면 해당 별자리를 찾아 줍니다. */
export function getWesternSign(signs, month, day) {
  const md = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return signs.find((s) => (s.from <= s.to ? md >= s.from && md <= s.to : md >= s.from || md <= s.to));
}

/** 생명수. 11, 22, 33은 마스터 수로 보고 멈춥니다. */
export function getLifePathNumber(year, month, day) {
  const reduce = (n) => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((s, c) => s + Number(c), 0);
    }
    return n;
  };
  const digits = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  return reduce(digits.split('').reduce((s, c) => s + Number(c), 0));
}

// ─────────────────────────────────────────────────────────────
// 한글 이름 획수 (성명학)
// ─────────────────────────────────────────────────────────────

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

/** 한글 음절 하나를 초/중/종성으로 분해합니다. 한글이 아니면 null. */
export function decomposeHangul(ch) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  return {
    cho: CHO[Math.floor(code / 588)],
    jung: JUNG[Math.floor((code % 588) / 28)],
    jong: JONG[code % 28],
  };
}

/**
 * 글자별 획수를 셉니다.
 * @param {string} name 한글 이름
 * @param {object} table data/name-strokes.json의 strokes 객체
 * @returns {{char:string, strokes:number}[]}
 */
export function getNameStrokes(name, table) {
  const { consonants, vowels, finalConsonants } = table;
  return [...name.trim()].map((ch) => {
    const parts = decomposeHangul(ch);
    if (!parts) return { char: ch, strokes: 0 };
    const c = consonants[parts.cho] ?? 0;
    const v = vowels[parts.jung] ?? 0;
    const f = parts.jong ? (finalConsonants[parts.jong] ?? consonants[parts.jong] ?? 0) : 0;
    return { char: ch, strokes: c + v + f };
  });
}

/** 두 글자 성(복성). 사격 계산에서 성을 몇 글자로 볼지 판단하는 데 씁니다. */
export const COMPOUND_SURNAMES = [
  '남궁', '독고', '동방', '황보', '제갈', '사공', '서문', '선우', '소봉', '어금', '망절',
];

/**
 * 사격(四格)을 계산합니다. 성 1자 + 이름 2자를 기본으로 하되,
 * 복성(남궁·황보 등)은 성 2자로 처리합니다.
 * 이름이 1자뿐이면 원격/이격을 만들 수 없어 형격과 정격만 채웁니다.
 *
 * 한계: 흔치 않은 복성이나 외자 성+외자 이름 조합은 유파에 따라 계산법이 갈립니다.
 * 필요하면 surnameLength를 직접 넘겨 강제하세요.
 *
 * @param {string} fullName 예: "김민수", "남궁민수"
 * @param {object} table name-strokes.json의 strokes 객체
 * @param {Array} su81 name-strokes.json의 su81 배열
 * @param {number} [surnameLength] 성의 글자 수를 직접 지정 (생략 시 자동 판별)
 */
export function getSagyeok(fullName, table, su81, surnameLength) {
  const chars = getNameStrokes(fullName, table);
  if (chars.length < 2) return null;

  const sLen = surnameLength
    ?? (COMPOUND_SURNAMES.includes(fullName.slice(0, 2)) && chars.length >= 3 ? 2 : 1);

  const surname = chars.slice(0, sLen).reduce((s, c) => s + c.strokes, 0);
  const given = chars.slice(sLen).map((c) => c.strokes);
  if (given.length === 0) return null;
  const norm = (n) => {
    let v = n;
    while (v > 81) v -= 80;
    return v < 1 ? 1 : v;
  };
  const lookup = (n) => {
    const row = su81.find((r) => r[0] === norm(n));
    return row ? { number: norm(n), fortune: row[1], name: row[2], meaning: row[3] } : null;
  };

  const total = surname + given.reduce((s, v) => s + v, 0);
  return {
    chars,
    원격: given.length >= 2 ? lookup(given[0] + given[1]) : lookup(given[0]),
    형격: lookup(surname + given[0]),
    이격: given.length >= 2 ? lookup(surname + given[1]) : lookup(surname + given[0]),
    정격: lookup(total),
    totalStrokes: total,
  };
}

// ─────────────────────────────────────────────────────────────
// 운세 조립
// ─────────────────────────────────────────────────────────────

const BANDS = [
  { key: 'great', min: 85, label: '대길' },
  { key: 'good', min: 65, label: '길' },
  { key: 'normal', min: 40, label: '평' },
  { key: 'caution', min: 0, label: '주의' },
];

function bandOf(score) {
  return BANDS.find((b) => score >= b.min);
}

/** 0~100 점수를 만들되 중간값이 잘 나오도록 두 번 뽑아 평균냅니다. */
function scoreFrom(seedStr) {
  const rng = mulberry32(hashSeed(seedStr));
  return Math.round(((rng() + rng()) / 2) * 100);
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
}

/**
 * 하루치 운세를 만듭니다.
 *
 * @param {object} input
 * @param {string} input.name        이름 (예: "김민수")
 * @param {string} input.birth       생년월일 "YYYY-MM-DD"
 * @param {number} [input.birthHour] 태어난 시각(0~23). 모르면 생략.
 * @param {string} [input.date]      조회 날짜 "YYYY-MM-DD". 기본값은 오늘.
 * @param {object} data              { templates, zodiac, western, numerology, nameStrokes, elements }
 * @returns {object} 화면에 그대로 뿌릴 수 있는 결과 객체
 */
export function buildFortune(input, data) {
  const { name, birth, birthHour = null } = input;
  const date = input.date ?? new Date().toISOString().slice(0, 10);
  const [by, bm, bd] = birth.split('-').map(Number);

  // ── 사주 / 띠 / 별자리 / 생명수
  const pillars = getFourPillars({ year: by, month: bm, day: bd, hour: birthHour ?? undefined });
  const elements = countElements(pillars);
  const zodiacInfo = getZodiacAnimal(by, bm, bd);
  const animal = data.zodiac.animals.find((a) => a.branch === zodiacInfo.branch);
  const sign = getWesternSign(data.western.signs, bm, bd);
  const lifePath = getLifePathNumber(by, bm, bd);
  const lifePathInfo = data.numerology.numbers.find((n) => n.n === lifePath);
  const nameFortune = data.nameStrokes
    ? getSagyeok(name, data.nameStrokes.strokes, data.nameStrokes.su81)
    : null;

  // ── 결정론적 시드 (이름 + 생일 + 조회일)
  const baseSeed = `${name}|${birth}|${date}`;
  const rng = mulberry32(hashSeed(baseSeed));

  // ── 행운 아이템: 부족한 오행을 보완하는 색을 우선 추천
  const t = data.templates;
  const needed = elements.missing[0] ?? elements.weakest;
  const colorPool = t.lucky.colors.filter((c) => c.element === needed);
  const color = pickBy(colorPool.length ? colorPool : t.lucky.colors, rng);
  const vars = {
    name,
    animal: animal?.name ?? zodiacInfo.animal,
    element: pillars.dayMaster.element,
    color: color.name,
    number: pickBy(t.lucky.numbers, rng),
  };

  // ── 카테고리별 점수와 문구
  const categories = t.categories.map((cat) => {
    const score = scoreFrom(`${baseSeed}|${cat.id}`);
    const band = bandOf(score);
    const catRng = mulberry32(hashSeed(`${baseSeed}|${cat.id}|text`));
    return {
      id: cat.id,
      label: cat.label,
      emoji: cat.emoji,
      score,
      band: band.key,
      bandLabel: band.label,
      message: fill(pickBy(cat.bands[band.key], catRng), vars),
    };
  });

  const totalScore = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);

  return {
    input: { name, birth, birthHour, date },
    profile: {
      zodiac: animal ?? zodiacInfo,
      westernSign: sign,
      lifePath: lifePathInfo ?? { n: lifePath },
      saju: { pillars, text: pillars.text, dayMaster: pillars.dayMaster, elements },
      nameFortune,
    },
    summary: {
      totalScore,
      band: bandOf(totalScore).key,
      bandLabel: bandOf(totalScore).label,
      opening: fill(pickBy(t.openings, rng), vars),
      closing: fill(pickBy(t.closings, rng), vars),
    },
    categories,
    lucky: {
      color,
      number: vars.number,
      direction: pickBy(t.lucky.directions, rng),
      item: pickBy(t.lucky.items, rng),
      food: pickBy(t.lucky.foods, rng),
      timeSlot: pickBy(t.lucky.timeSlots, rng),
    },
    advice: pickBy(t.advice, rng),
    warning: pickBy(t.warnings, rng),
    disclaimer: '이 결과는 전통 명리·민속 자료를 바탕으로 한 오락용 콘텐츠입니다.',
  };
}
