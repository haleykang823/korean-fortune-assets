/**
 * load-data.js — data/*.json 묶음을 한 번에 불러옵니다.
 *
 * 브라우저/번들러용(fetch). Node에서 쓰려면 아래 주석의 fs 버전을 쓰세요.
 * Vite/Next 같은 번들러라면 그냥 `import zodiac from '../data/zodiac-animals.json'`
 * 하는 편이 더 간단하고 빠릅니다.
 */

const FILES = {
  zodiac: 'zodiac-animals.json',
  stems: 'heavenly-stems.json',
  elements: 'five-elements.json',
  western: 'western-zodiac.json',
  numerology: 'numerology.json',
  nameStrokes: 'name-strokes.json',
  tarot: 'tarot-major.json',
  templates: 'fortune-templates.json',
};

/**
 * @param {string} [baseUrl='../data'] data 폴더 경로
 * @returns {Promise<Record<string, any>>}
 */
export async function loadFortuneData(baseUrl = '../data') {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([key, file]) => {
      const res = await fetch(`${baseUrl}/${file}`);
      if (!res.ok) throw new Error(`${file} 로드 실패: ${res.status}`);
      return [key, await res.json()];
    })
  );
  return Object.fromEntries(entries);
}

/* Node 18+ 버전
 *
 * import { readFile } from 'node:fs/promises';
 * import { fileURLToPath } from 'node:url';
 * import path from 'node:path';
 *
 * export async function loadFortuneDataNode() {
 *   const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
 *   const entries = await Promise.all(
 *     Object.entries(FILES).map(async ([key, file]) => [
 *       key,
 *       JSON.parse(await readFile(path.join(dir, file), 'utf8')),
 *     ])
 *   );
 *   return Object.fromEntries(entries);
 * }
 */
