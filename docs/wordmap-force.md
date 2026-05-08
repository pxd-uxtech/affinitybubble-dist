# wordmap-force-library

계층형 플랫 데이터(소분류 c1, 대분류 c2, 단어, 빈도)를 force-directed 워드맵으로 그려 주는 D3 v7 기반 ESM 라이브러리. 어피니티버블 voronoi-treemap의 라벨 계층/색상 규칙을 따르되 force sim으로 단어를 자유 배치한다.

- 같은 c2 자녀 c1들이 c2 주변 disc로 모임 (`clusterDiscFactor`)
- c1 라벨은 hull 중심, c2 pill은 cluster 상단 (`c2Position`)
- 단어가 길면 multi-line wrap + ellipsis, 줌인 시 폰트 줄어들고 글자 더 많이 (`zoom counter-scale`)
- c1/c2 폰트 = cluster 비율 log scale (어피니티버블 voronoi-treemap과 같은 방식)
- hull은 word + c1 라벨 모두 감싸 라벨이 hull 밖으로 안 삐져나감
- 첫 렌더 시 fit-to-content 자동 줌 + drag 시 hull 동적 갱신

## 설치 / 로드

D3 v7가 필요합니다. ESM 모듈로 import해서 옵션에 `d3`를 주입합니다.

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script type="module">
  import { createWordmapForce } from
    "https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@bdc25ba/dist/wordmap-force.bundle.js";

  const data = [
    { text: '한강', size: 127, c1: '한강 인프라',     c2: '🌳 서울 상징 경관' },
    { text: '수도', size: 123, c1: '수도권의 역동성', c2: '🎭 문화 트렌드 중심' },
    { text: '도시', size:  74, c1: '복잡한 삭막함',   c2: '🧊 정서적 차가움' },
    // ... 행을 그대로 넣어도 됩니다 (autoAggregate)
  ];

  const chart = createWordmapForce(document.getElementById('map'), data, {
    d3,
    // 옵션 (선택)
  });
</script>
```

> **권장**: 운영 사용 시 `@<commit-hash>`를 고정해서 쓰세요. `@main`은 jsdelivr 캐시(최대 12시간)로 갱신이 늦습니다.

이모지를 Google Color Emoji로 그리려면 외부 폰트가 필요한데, 라이브러리가 자동으로 head에 link를 주입합니다.

## 빠른 시작

```html
<div id="map" style="width:100vw; height:90vh;"></div>
<script type="module">
  import { createWordmapForce } from "...";
  const chart = createWordmapForce('#map', data, { d3 });
</script>
```

## 데이터 형식

각 행은 단어와 그 단어가 속한 c1·c2 카테고리를 가집니다.

```ts
type WordmapRow = {
  text: string;     // 화면에 표시할 단어
  size?: number;    // 빈도(폰트 크기 결정). 생략 시 1, autoAggregate가 합산
  c1: string;       // 소분류 라벨 (hull 단위)
  c2: string;       // 대분류 라벨 (색·pill 단위)
};
```

선택적으로 hierarchical layout용 좌표(UMAP 등)를 `extras.positions`로 줄 수 있습니다.

## API

### `createWordmapForce(container, data, options) → controller`

| 인자 | 타입 | 설명 |
|---|---|---|
| `container` | `Element \| string` | DOM 노드 또는 셀렉터 |
| `data` | `WordmapRow[]` | 데이터 배열 |
| `options` | `object` | 아래 옵션 표 (`d3` 필수) |

**Returns**: `{ render(data, extras), resetZoom(), destroy(), fitToContent(padding?), state }` 형태의 controller.

### `controller.render(data, extras?)`

| `extras.positions` | `{ c1?: Record<string,{x,y}>, c2?: Record<string,{x,y}> }` | UMAP 좌표 |
| `extras.c1Order` / `extras.c2Order` | `string[]` | 라벨 순서 고정 |
| `extras.scores` | `{ c1?: Record<string,number>, c2?: Record<string,number> }` | 긍부정 점수 (sentiment 모드) |
| `extras.colors` | `{ c1?: Map\|Fn, c2?: Map\|Fn }` | cluster별 커스텀 색 (sentiment·팔레트보다 우선) |

### `controller.resetZoom()` / `controller.destroy()` / `controller.fitToContent()`

## 옵션

### 일반

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `d3` | — | **필수**. d3 v7 인스턴스 |
| `width`, `height` | `1600`, `1000` | viewBox 크기 |
| `palette` | 22색 파스텔 | c2 색상 팔레트 (sentiment 모드 OFF일 때만 사용) |
| `sentiment` | `null` | sentiment 색상 모드 (아래 참조) |
| `fontFamilyKo` | KoddiUD OnGothic + 시스템 fallback | 한글 폰트 |
| `fontFamilyEmoji` | Noto Color Emoji + KoddiUD | 이모지 폰트 |
| `zoomable` / `draggable` | `true` | 줌·팬, 드래그 토글 |
| `zoomExtent` | `[0.4, 6]` | 휠 줌 배율 |
| `autoAggregate` | `true` | 같은 (c1, text) 행 size 합산 |
| `fitToContent` | `true` | 첫 렌더 후 자동 fit-to-content |

### 단어 (multi-line wrap + 줌)

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `wordFontRange` | `[9, 44]` | 단어 폰트 크기 범위 (sqrt of size) |
| `wordCharsPerLine` | `null` | null이면 폰트 기반 자동 (≈ fs*0.32+2 글자, floor 5) |
| `wordMaxLines` | `2` | 기본 표시 라인 수 |
| `wordMaxExtraLines` | `2` | 줌인 시 추가 라인 수 cap |
| `wordZoomFullThreshold` | `2.0` | 이 zoom k에서 wordMaxExtraLines 도달 |
| `wordZoomVisualGrowth` | `0.5` | counter-scale: 1.0=폰트 그대로, 0.5=k=2x에서 visual 1.5x, 0=폰트 절대고정 |
| `wordZoomRewrapEpsilon` | `0.15` | 줌 변화량이 이보다 작으면 wrap 재계산 skip |
| `wordOverflowMode` | `'break'` | 토큰이 줄 폭 넘을 때: `'break'`(글자단위) `'truncate'` |
| `wordEllipsis` | `'…'` | 잘림 표시 |
| `wordTextLightness` | `45` | hull 색에서 chroma 1.4× + 이 lightness로 word 색 변환 |

### c1 라벨 (hull 중심)

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `c1FontSize` | `null` | 명시 시 강제, null이면 자동 |
| `c1FontBase` | `28` | 자동 모드 base 폰트 (px) |
| `c1FontScaleRange` | `[0.7, 1.3]` | log scale 출력 범위 — 좁힐수록 분산 작음 |
| `c1FontMaxFloorMul` | `1.0` | 위계 보장: c1 ≥ max wordFs × 이 배수 |
| `c1FontMin` / `c1FontMax` | `14` / `null` | 폰트 cap |
| `c1CharsPerLine` | `null` | 한 줄 글자수 자동 |
| `c1MaxLines` | `2` | 최대 라인 수 |

### c2 pill (cluster 상단)

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `c2FontBase` | `24` | 자동 base 폰트 (px) |
| `c2OverC1Mul` | `1.0` | c2 fs = base × scale × 이 배수 |
| `c2FontFloorMul` | `1.0` | c2 ≥ max(c1 fs in this c2) × 이 배수 |
| `c2FontRange` | `[24, 50]` | (areaScore 기반 fontScale legacy — 자동모드에선 미사용) |
| `c2Position` | `'top'` | `'top'`(cluster 상단) `'center'`(centroid) |
| `c2PillOpacity` | `0.85` | pill rect 투명도 |
| `c2MaxLines` | `2` | c2 multi-line wrap |
| `c2CharsPerLine` | `null` | 한 줄 글자수 자동 |
| `c2EmojiScale` | `0.9` | pill 내 emoji가 한글 텍스트보다 작게 |

### Cluster 배치

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `clusterPad` | `{x: 220, y: 180}` | c2 매핑 영역 padding (0~1이면 W/H 비율로 해석) |
| `clusterLocalScale` | `38` | (clusterDiscFactor=0일 때만) UMAP 직접 곱 |
| `clusterDiscFactor` | `1.0` | c1 anchor를 c2 주변 disc로 정규화 (0=옛 방식, 1.0+=disc 펼침) |
| `clusterSemantic` | `0.16` | anchor로 끌어당기는 힘 |
| `clusterCohesion` | `0.08` | c2 절대중심으로 추가 모음 |
| `forceWordAttract` | `0.16` | 단어가 sunflower target으로 끌리는 강도 |
| `forceLabelAttract` | `0.5` | c1 라벨이 anchor로 끌리는 강도 |
| `forceC2Attract` | `0.5` | c2 pill 끌림 강도 |
| `collidePadding` | `2` | rect collide padding |
| `preTicks` | `600` | 초기 시뮬레이션 tick 수 (3-phase: 50%/30%/20%) |

### Hull

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `hullInnerPad` | `4` | 노드 박스에 더할 inner padding |
| `hullInflate` | `10` | 외곽 inflate (centroid에서 방향) |
| `hullMinR` | `48` | centroid에서 최소 반지름 (1~2개 노드 cluster용) |

### 커스텀 색상 (`extras.colors`)

cluster의 의미와 무관하게 외부에서 색을 직접 지정하고 싶을 때 사용합니다. **sentiment·팔레트보다 우선**하므로 동시에 줘도 colors가 이깁니다.

```js
chart.render(data, {
  colors: {
    // 객체: 라벨 → 색
    c1: {
      '한강 인프라':   '#3b82f6',
      '복잡한 삭막함': '#ef4444',
    },
    // 또는 함수: (label, idx) => color  (값이 null이면 다음 우선순위로 fallback)
    c2: (label, cj) => myBrand[label] ?? null,
  },
});
```

색 결정 우선순위 (cluster별 base color):
1. `extras.colors.c1[label]` (또는 함수 결과)
2. `extras.colors.c2[c2Label]` (c1에 c1 색이 없으면 c2 색을 빌려옴)
3. `opts.sentiment` + `extras.scores` 매핑
4. `opts.palette` (c2 인덱스 기반)

word·hull·c1 라벨 색은 c1 base color에서 자동 파생됩니다 (`wordTextLightness` 등).
c2 pill만 c2 base color에서 별도 파생됩니다.

### Sentiment(긍부정) 색상 모드

cluster의 긍부정 점수에 따라 색을 매핑하고 싶을 때 사용합니다. `opts.sentiment` 와 `extras.scores`를 같이 전달하면 활성화되며, 둘 중 하나라도 비면 기존 팔레트 동작이 유지됩니다.

```js
const chart = createWordmapForce(el, data, {
  d3,
  sentiment: {
    // d3.scaleLinear(domain, range)로 매핑. 기본 어피니티버블 컨벤션:
    domain: [1, 3, 5],
    range: ['#f69f8f', '#ffe9a9', '#88CD8B'],
    scoreFallback: 3, // 점수 없는 cluster 색 (생략 시 팔레트로 fallback)
  },
});

chart.render(data, {
  scores: {
    // 소분류(c1) 라벨별 점수 — hull / word / c1 라벨 색에 영향
    c1: { '한강 인프라': 4.6, '복잡한 삭막함': 1.7, /* ... */ },
    // 대분류(c2) 라벨별 점수 — c2 pill 색 + c1 점수 없을 때 fallback
    c2: { '🌳 서울 상징 경관': 4.2, '🧊 정서적 차가움': 1.9 },
  },
});
```

- 색상 우선순위: **c1 점수 → 그 c1의 c2 점수 → `scoreFallback` → 기본 팔레트**
- `domain`/`range` 길이를 늘리면 다단계(예: 1·2·3·4·5) 선형 보간 가능
- word 텍스트 색은 c1 색의 chroma↑·lightness=`wordTextLightness`(기본 45)로 자동 파생되므로 별도 지정 불필요

## 동작 원리

### 1. 데이터 정규화 + 카테고리 추출
- `(c1, text)` 키로 합산 (autoAggregate)
- c1, c2 unique 집합 + `c1→c2` 매핑

### 2. c2 절대 위치 결정
- positions 있으면 UMAP 좌표를 캔버스에 매핑 (`sx`, `sy` 독립 scale)
- 없으면 grid layout fallback

### 3. c1 anchor (시작 위치)
- `clusterDiscFactor > 0` (default): c2P 주변 disc 안에 정규화 — UMAP 방향성만 사용, 거리는 자식 c1 radius 합 기반
- `= 0`: c2P + (UMAP 상대좌표) × `clusterLocalScale` (옛 방식)

### 4. Cluster sim (c1 사이 충돌 방지)
- forceX/Y로 anchor에 끌림 + collide(c1 radius)

### 5. 단어 sunflower seed
- 정착된 c1 cluster 중심 주변에 golden-angle 좌표
- 큰 단어가 안쪽

### 6. 다단계 main sim
```
Phase 1 (50%, alpha=1)
  word + 라벨/pill 모두 collide → 자리 잡음
        ↓ updateAnchors() : 라벨/pill anchor를 word centroid로
Phase 2 (30%, alpha=0.6 가열)
  라벨이 새 anchor 향해 끌림, word들 자연스럽게 비킴
        ↓ updateAnchors() 다시
Phase 3 (20%, alpha=0.3)
  미세 조정
```

### 7. 라벨 폰트 (어피니티버블식)
```
ratio = (cluster value / total) × 100  ∈ [0.2, 30] clamp
labelScale(ratio) = log scale [0.1, 20] → c1FontScaleRange (default [0.7, 1.3])

c1 fs = c1FontBase × labelScale(c1 ratio)
       ∪ floor: max wordFs × c1FontMaxFloorMul
c2 fs = c2FontBase × labelScale(c2 ratio) × c2OverC1Mul
       ∪ floor: max(자식 c1 fs) × c2FontFloorMul
```
range 좁힐수록 cluster 간 폰트 분산 작음.

### 8. Hull
- word + c1 라벨을 모두 포함하는 점들로 polygon hull
- centroid 기준 minR (small cluster 보호) + inflate (외곽 padding)
- catmull-rom 곡선

### 9. fit-to-content 자동 줌
- 모든 노드 bbox 계산 → padding(default `max(60, min(W,H)×0.06)`) + hullExtra 추가
- viewBox에 fit하는 zoom transform 자동 적용
- 컨텐츠가 viewBox보다 크면 zoomExtent 하한 자동 완화

### 10. Drag
- c1/c2 라벨에 d3.drag — 핀(`fx,fy`) + alphaTarget 가열
- word들 collide로 비킴
- alpha > 0.05일 때 hull 동적 갱신 (drag 중 hull도 word 따라 변형)
- 떼면 핀 해제, anchor가 word centroid로 되돌아감 → 자동 복귀

## 의존성

- [D3 v7](https://d3js.org/) (글로벌 또는 import)
- 외부 웹폰트 (자동 로드): Noto Color Emoji
- 권장 폰트: KoddiUD OnGothic (시스템 폰트 fallback OK)

## 라이센스

MIT.
