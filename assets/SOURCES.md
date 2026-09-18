# 외부 에셋 · 라이브러리 출처

라이선스는 2026년 9월 기준으로 정리했습니다. **상용 배포 전에는 각 사이트에서 현재 조건을 다시 확인하세요.**
특히 폰트와 일러스트는 조건이 바뀌는 일이 잦습니다.

---

## 1. 폰트 (전부 Google Fonts, SIL OFL — 상업적 사용·임베딩 무료)

운세 앱은 "고전적인데 촌스럽지 않은" 느낌이 관건입니다. 본문은 가독성 좋은 고딕,
제목과 운세 문구만 명조로 쓰면 분위기가 살면서도 읽기 편합니다.

| 용도 | 폰트 | 비고 |
|---|---|---|
| 제목·운세 문구 | **Gowun Batang** | 붓끝이 살아 있는 명조. 운세 앱에 가장 잘 맞습니다 |
| 본문 | **Gowun Dodum** | 같은 계열 고딕이라 섞어 써도 통일감이 있습니다 |
| 제목 대안 | **Song Myung** | 더 고전적이고 무거운 명조 |
| 제목 대안 | **Nanum Myeongjo** | 무난하고 안전한 선택 |
| 본문 대안 | **Noto Sans KR** | 굵기 9종. 시스템 폰트처럼 깔끔합니다 |
| 손글씨 느낌 | **Gaegu**, **Nanum Pen Script** | 캐주얼한 톤의 앱에 |
| 라틴/숫자 강조 | **Cinzel**, **Cormorant Garamond** | 타로·별자리 느낌의 세리프 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap" rel="stylesheet">
```

한글 폰트는 용량이 큽니다. 웹이라면 `font-display: swap`은 기본이고,
가능하면 서브셋(`unicode-range`)을 쓰거나 [fontsource](https://fontsource.org)로 self-host 하세요.

---

## 2. 아이콘

| 이름 | 라이선스 | 특징 |
|---|---|---|
| [Lucide](https://lucide.dev) | ISC | 선이 얇고 단정합니다. 기본 UI에 추천 |
| [Phosphor Icons](https://phosphoricons.com) | MIT | 6가지 굵기. 별·달·불꽃 등 신비 계열 아이콘이 많습니다 |
| [Tabler Icons](https://tabler.io/icons) | MIT | 5,000개 이상. 없는 게 거의 없습니다 |
| [Remix Icon](https://remixicon.com) | Apache 2.0 | 채움(fill) 스타일이 예쁩니다 |
| [Noto Emoji](https://github.com/googlefonts/noto-emoji) | OFL | 띠·별자리 이모지를 플랫폼 상관없이 똑같이 보여주고 싶을 때 |

> 띠·별자리는 **이모지만으로도 충분합니다.** data/*.json에 이미 `emoji`, `symbol` 필드를
> 넣어 뒀으니 초기 버전은 이걸로 시작하고, 나중에 일러스트로 교체하세요.

---

## 3. 일러스트 · 이미지

| 이름 | 라이선스 | 비고 |
|---|---|---|
| [unDraw](https://undraw.co) | 오픈(출처 표기 불필요) | 색상 1개를 브랜드 컬러로 바꿔 받을 수 있습니다 |
| [Storyset](https://storyset.com) | 무료 + 출처 표기 필요 | 애니메이션 버전 제공 |
| [Wikimedia Commons — RWS 타로](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck) | 퍼블릭 도메인(미국, 1909) | 아래 주의사항 참고 |
| [Hero Patterns](https://heropatterns.com) | CC BY 4.0 | SVG 배경 패턴. 색·투명도 조절 가능 |
| [Haikei](https://haikei.app) | 생성물 자유 사용 | 그라데이션·블롭 배경 SVG 생성기 |
| [Pixabay](https://pixabay.com), [Unsplash](https://unsplash.com) | 각 사이트 라이선스 | 밤하늘·별·한지 질감 사진 |

**타로 이미지 주의사항**: 라이더-웨이트-스미스 덱(1909)은 미국에서 퍼블릭 도메인이지만,
화가 Pamela Colman Smith의 사후 70년 규정을 적용하는 국가에서는 2022년에야 보호가 끝났습니다.
지금은 대부분의 국가에서 자유롭게 쓸 수 있지만, 특정 출판사의 **리마스터 버전**은 별도 권리가
있을 수 있으니 Wikimedia Commons의 원본 스캔을 쓰세요.

---

## 4. 색 팔레트 제안

운세 앱에서 자주 쓰는 세 가지 방향입니다. 그대로 CSS 변수로 넣어 쓰세요.

### A. 밤하늘 (가장 무난, demo/index.html에서 사용)
```css
--bg:#12101a; --panel:#1c1930; --line:#332d55;
--text:#ece9f5; --muted:#9d97be; --gold:#d7b56d; --accent:#8e7cd8;
```

### B. 한지·전통 (밝은 톤)
```css
--bg:#f6f1e7; --panel:#fffdf8; --line:#e0d6c3;
--text:#2b2620; --muted:#8a7f6d; --accent:#9b2c2c; --gold:#b08d57;
```

### C. 오방색 (포인트용 — 오행 시각화에)
```css
--청:#2E8B57; --적:#D64545; --황:#C9A227; --백:#E8E8E8; --흑:#2C3E50;
```

점수 구간 색은 `data/fortune-templates.json`의 band와 맞춰 두면 편합니다.
대길 `#6bcf9e` / 길 `#7fb3d5` / 평 `#d7b56d` / 주의 `#e08a7a`

---

## 5. 라이브러리

### 음력 변환 · 정밀 사주 (정확도를 올릴 때 반드시 필요)

| 이름 | 언어 | 라이선스 | 비고 |
|---|---|---|---|
| [lunar-javascript](https://github.com/6tail/lunar-javascript) | JS | MIT | **가장 추천.** 음력, 24절기, 사주팔자, 십신까지 계산해 줍니다. 의존성 없음 |
| [lunar-python](https://github.com/6tail/lunar-python) | Python | MIT | 위와 같은 구현의 파이썬판 |
| [korean-lunar-calendar](https://github.com/usingsky/korean-lunar-calendar_js) | JS/Python | MIT | 한국천문연구원 데이터 기반 양·음력 변환 (1391~2050) |
| [sxtwl](https://github.com/yuangu/sxtwl_cpp) | C++/Python | MIT | 수서천문력. 절기 시각이 매우 정확합니다 |
| [한국천문연구원 음양력 API](https://www.data.go.kr) | REST | 공공누리 | 공식 데이터. 호출량 제한이 있으니 서버에서 캐싱하세요 |

`src/fortune-core.js`의 `getMonthBranchIndex()` 하나만 lunar-javascript로 교체하면
월주 정확도 문제가 해결됩니다.

### 기타

| 용도 | 라이브러리 | 라이선스 |
|---|---|---|
| 날짜 처리 | [date-fns](https://date-fns.org) / [Luxon](https://moment.github.io/luxon/) | MIT |
| 카드 뒤집기·등장 애니메이션 | [Motion](https://motion.dev) (구 Framer Motion) | MIT |
| 축하 효과 | [canvas-confetti](https://github.com/catdad/canvas-confetti) | ISC |
| Lottie 애니메이션 | [lottie-web](https://github.com/airbnb/lottie-web) + [LottieFiles](https://lottiefiles.com) 무료 에셋 | MIT / 각 에셋별 |
| 결과 이미지 저장·공유 | [html-to-image](https://github.com/bubkoo/html-to-image) | MIT |
| 차트(오행 분포 레이더) | [Chart.js](https://www.chartjs.org) | MIT |

> **공유 기능은 초기부터 넣으세요.** 운세 앱의 유입은 대부분 결과 이미지 공유에서 나옵니다.
> `html-to-image`로 결과 카드를 PNG로 만들어 Web Share API에 넘기면 됩니다.

---

## 6. 효과음 (선택)

| 출처 | 라이선스 |
|---|---|
| [Freesound](https://freesound.org) | CC0 / CC BY (파일별로 다름 — 반드시 확인) |
| [Pixabay Audio](https://pixabay.com/sound-effects/) | Pixabay 라이선스 |
| [Zapsplat](https://zapsplat.com) | 무료 + 출처 표기 |

카드 넘기는 소리, 종소리, 잔잔한 배경음 정도면 충분합니다. **자동 재생은 하지 마세요.**

---

## 7. 참고할 만한 국내 서비스 (기능 벤치마킹용)

직접 써 보고 정보 구조와 결과 화면 구성을 참고하세요. 문구나 이미지를 가져오면 안 됩니다.

- 점신, 헬로우봇, 포스텔러 — 입력 단계를 최소화하고 결과를 카드로 쪼개는 방식
- 만세력 앱들 — 사주 원국을 표로 보여주는 UI 관례 (천간 위 / 지지 아래, 년월일시 순서)
