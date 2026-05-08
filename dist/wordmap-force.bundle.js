// ../../../../../Works/vibecoding/affinitybubble-library/wordmap-force-library.js
var d3;
var DEFAULT_PALETTE = [
  "#afc7dd",
  "#ffe9a9",
  "#f69f8f",
  "#b4c8af",
  "#e9e4d6",
  "#bed1d8",
  "#f8dba1",
  "#fcbc8b",
  "#d7e0c4",
  "#c5b5a6",
  "#b5ccc1",
  "#e9bfb4",
  "#e9f0f6",
  "#fffefb",
  "#fce0db",
  "#e1e9df",
  "#f1f5f7",
  "#fef8ed",
  "#feeada",
  "#fbfcf9",
  "#e5ded7",
  "#e5edea"
];
var DEFAULTS = {
  width: 1600,
  height: 1e3,
  margin: { top: 50, right: 60, bottom: 50, left: 60 },
  palette: DEFAULT_PALETTE,
  fontFamilyKo: "'KoddiUD OnGothic', -apple-system, sans-serif",
  fontFamilyEmoji: "'Noto Color Emoji', 'KoddiUD OnGothic', -apple-system, sans-serif",
  wordFontRange: [9, 44],
  // ★ 어피니티버블 voronoi-treemap 방식: cluster 비율(value/total)을 log scale로 폰트에 매핑
  c1FontSize: null,
  // null → 자동 (어피니티버블식)
  c1FontBase: 28,
  // 자동 모드 base 폰트 (px)
  c1FontScaleRange: [0.7, 1.3],
  // log scale 출력 범위 — 좁을수록 c1 폰트 분산 작음 (어피니티버블 원본 [0.3, 1.5])
  c1FontMaxFloorMul: 1,
  // 위계 보장: c1 ≥ max wordFs × 이 배수
  c1FontMin: 14,
  // 최소 폰트
  c1FontMax: null,
  // 상한 (null=제한 없음)
  c2FontRange: [24, 50],
  c2EmojiScale: 0.9,
  c2HorizPadMult: 1.4,
  c2HeightMult: 1.4,
  c2GapMult: 0.25,
  hullInnerPad: 4,
  hullInflate: 10,
  hullMinR: 48,
  forceWordAttract: 0.16,
  forceLabelAttract: 0.5,
  // hull 중심 가까이 유지 + word 과도하게 밀지 않게 균형 (원본 0.3, 강제 0.9 사이)
  forceC2Attract: 0.5,
  collidePadding: 2,
  collideIterations: 2,
  preTicks: 600,
  alphaDecay: 0.012,
  clusterPad: { x: 220, y: 180 },
  clusterLocalScale: 38,
  // (clusterDiscFactor=0일 때만 사용) UMAP 좌표 직접 곱 — 옛 동작
  clusterDiscFactor: 1,
  // ★ c1 anchor를 c2 주변 disc로 정규화 (0=옛 방식, 1.0=자식 radius 합 기반 disc, >1=더 펼침)
  clusterSemantic: 0.16,
  // anchor로 끌어당기는 힘
  clusterCohesion: 0.08,
  // c2 절대중심으로 추가로 모으는 힘
  clusterCollidePad: 6,
  clusterPreTicks: 420,
  fitToContent: true,
  // render 후 컨텐츠가 viewBox에 맞게 자동 줌
  zoomable: true,
  draggable: true,
  zoomExtent: [0.4, 6],
  autoAggregate: true,
  // ---- multi-line word wrapping + zoom-aware truncation ----
  wordCharsPerLine: null,
  // null → 폰트크기 기반 자동 (≈ fs*0.32+2 글자, floor 5)
  wordMaxLines: 2,
  // 기본 표시 라인 수
  wordMaxExtraLines: 2,
  // 줌인 시 base에 추가될 최대 라인 수 (k=1→+0, k=zoomFullThreshold→+maxExtra)
  // ★ zoom counter-scale: k=2x에서 visual fs = 1.5x, 그 차이만큼 박스에 더 많은 글자
  // visual fs multiplier = 1 + (k - 1) * wordZoomVisualGrowth
  //   1.0 = 폰트 그대로 따라 커짐 (counter-scale 없음)
  //   0.5 = 줌 2x에서 visual 1.5x, 글자수도 1/0.75 ≈ 1.33배
  //   0.0 = 폰트 절대 크기 고정, 글자수만 줌에 비례 증가
  wordZoomVisualGrowth: 0.5,
  // word 텍스트 색상: hull(c2) 색에서 chroma 1.4배 + 이 lightness로 변환 (낮을수록 어두움, 높을수록 hull과 비슷한 톤)
  wordTextLightness: 45,
  // c1 라벨 wrap (정적 — 줌 무관)
  c1CharsPerLine: null,
  // null → c1FontSize 기반 자동
  c1MaxLines: 2,
  // c2 라벨 wrap (정적 — 줌 무관)
  c2CharsPerLine: null,
  // null → c2 폰트 기반 자동
  c2MaxLines: 2,
  c2FontBase: 24,
  // 자동 모드 base 폰트 (px)
  c2OverC1Mul: 1,
  // 어피니티버블식: c2 fs = base × fontScale × 이 배수
  c2FontFloorMul: 1,
  // c2 floor = max(c1 fs in this c2) × 이 배수 (위계 보장)
  c2PillOpacity: 0.85,
  // c2 pill rect 투명도 — 1.0=불투명, 0.7=word 비침
  c2Position: "top",
  // c2 pill 위치 — 'top'(cluster 상단) | 'center'(centroid)
  wordEllipsis: "\u2026",
  wordZoomFullThreshold: 2,
  // 줌 k가 이 값에 도달하면 wordMaxExtraLines 까지 라인 늘어남
  wordZoomRewrapEpsilon: 0.15,
  // 줌 k 변화량이 이보다 작으면 wrap 재계산 skip
  wordOverflowMode: "break"
  // 'break' | 'truncate'
};
var STYLE_ID = "wordmap-force-style";
var EMOJI_FONT_LINK_ID = "wordmap-force-emoji-font";
function ensureStyle() {
  if (typeof document === "undefined") return;
  if (!document.getElementById(EMOJI_FONT_LINK_ID)) {
    const link = document.createElement("link");
    link.id = EMOJI_FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap";
    document.head.appendChild(link);
  }
  if (document.getElementById(STYLE_ID)) return;
  const css = `
.wf-host { position: relative; width: 100%; height: 100%; overflow: hidden; }
.wf-host svg { display: block; width: 100%; height: 100%; cursor: grab; background: transparent; }
.wf-host svg:active { cursor: grabbing; }
.wf-word { font-weight: 500; pointer-events: none; }
.wf-c1-label-g { cursor: grab; user-select: none; }
.wf-c1-label-g:active { cursor: grabbing; }
.wf-c1-label {
  font-weight: 700;
  paint-order: stroke;
  stroke: rgba(255,255,255,0.9);
  stroke-width: 3px;
  stroke-linejoin: round;
  pointer-events: none;
}
.wf-hull {
  fill-opacity: 0.32;
  stroke-opacity: 0.7;
  stroke-width: 1;
}
.wf-c2-pill { cursor: grab; user-select: none; }
.wf-c2-pill:active { cursor: grabbing; }
.wf-c2-pill rect { stroke: rgba(0,0,0,0.05); stroke-width: 0.5; }
.wf-c2-pill text {
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: -0.02em;
  pointer-events: none;
}
`;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var EMOJI_RE = /^([\p{Extended_Pictographic}‍️]+)\s*/u;
function splitEmoji(s) {
  const m = s.match(EMOJI_RE);
  return m ? { emoji: m[1], rest: s.slice(m[0].length) } : { emoji: "", rest: s };
}
var _measureCtx = (() => {
  if (typeof document === "undefined") return null;
  return document.createElement("canvas").getContext("2d");
})();
function measure(text, fs, weight, family) {
  if (!_measureCtx) return text.length * fs * 0.6;
  _measureCtx.font = `${weight} ${fs}px ${family}`;
  return _measureCtx.measureText(text).width;
}
function wrapAndTruncate(text, maxChars, maxLines, ellipsis, overflowMode) {
  if (!text) return [""];
  const t = String(text);
  if (t.length <= maxChars) return [t];
  const tokens = t.split(/(\s+)/).filter((s) => s.length > 0);
  const lines = [];
  let cur = "";
  const flush = () => {
    if (cur.length) {
      lines.push(cur);
      cur = "";
    }
  };
  for (let i = 0; i < tokens.length && lines.length < maxLines; i++) {
    const tok = tokens[i];
    if ((cur + tok).length <= maxChars) {
      cur += tok;
    } else if (tok.length > maxChars && overflowMode === "break") {
      let rest = tok;
      if (cur.length) {
        const room = maxChars - cur.length;
        if (room > 0) cur += rest.slice(0, room);
        rest = rest.slice(room > 0 ? room : 0);
        flush();
      }
      while (rest.length > 0 && lines.length < maxLines) {
        if (rest.length <= maxChars) {
          cur = rest;
          rest = "";
          break;
        }
        if (lines.length < maxLines - 1) {
          lines.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        } else {
          cur = rest.slice(0, maxChars);
          rest = rest.slice(maxChars);
          break;
        }
      }
    } else {
      flush();
      if (/^\s+$/.test(tok)) continue;
      if (tok.length <= maxChars) cur = tok;
      else cur = tok.slice(0, maxChars);
    }
  }
  flush();
  const consumed = lines.join("").replace(/\s+/g, "").length;
  const total = t.replace(/\s+/g, "").length;
  if (consumed < total && lines.length > 0) {
    const last = lines[lines.length - 1];
    const cap = Math.max(1, maxChars - ellipsis.length);
    lines[lines.length - 1] = (last.length > cap ? last.slice(0, cap) : last) + ellipsis;
  }
  if (lines.length === 0) {
    lines.push(t.slice(0, Math.max(1, maxChars - ellipsis.length)) + ellipsis);
  }
  return lines;
}
function computeWordDisplay(d, k, opts) {
  const baseFs = d.fs;
  const baseChars = d.maxCharsPerLine;
  const baseLines = d.maxLines;
  const boxH = baseLines * baseFs * 1.2;
  if (k <= 1) {
    return {
      fs: baseFs,
      lines: wrapAndTruncate(d.text, baseChars, baseLines, opts.wordEllipsis, opts.wordOverflowMode)
    };
  }
  const visualGrowth = opts.wordZoomVisualGrowth != null ? opts.wordZoomVisualGrowth : 0.5;
  const targetVisualMul = Math.max(0.1, 1 + (k - 1) * visualGrowth);
  const displayFs = baseFs * targetVisualMul / k;
  const charsRatio = baseFs / displayFs;
  const mc = Math.max(baseChars, Math.round(baseChars * charsRatio));
  const fitLines = Math.floor(boxH / (displayFs * 1.2));
  const cap = baseLines + (opts.wordMaxExtraLines | 0);
  const ml = Math.max(baseLines, Math.min(cap, fitLines));
  return {
    fs: displayFs,
    lines: wrapAndTruncate(d.text, mc, ml, opts.wordEllipsis, opts.wordOverflowMode)
  };
}
function rectCollide(padding, iterations) {
  let nodes;
  function force() {
    for (let it = 0; it < iterations; it++) {
      const tree = d3.quadtree(nodes, (d) => d.x, (d) => d.y);
      for (const a of nodes) {
        if (a.fx != null) continue;
        const ar = Math.max(a.w, a.h) / 2 + padding + 60;
        tree.visit((node, x0, y0, x1, y1) => {
          if (!node.length) {
            do {
              const b = node.data;
              if (b !== a) {
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const minX = (a.w + b.w) / 2 + padding;
                const minY = (a.h + b.h) / 2 + padding;
                const ax = Math.abs(dx);
                const ay = Math.abs(dy);
                if (ax < minX && ay < minY) {
                  const ox = minX - ax;
                  const oy = minY - ay;
                  if (ox < oy) {
                    const sx = dx === 0 ? Math.random() - 0.5 : dx < 0 ? -1 : 1;
                    const shift = ox * 0.5;
                    if (b.fx == null) b.x += shift * sx;
                    a.x -= shift * sx;
                  } else {
                    const sy = dy === 0 ? Math.random() - 0.5 : dy < 0 ? -1 : 1;
                    const shift = oy * 0.5;
                    if (b.fy == null) b.y += shift * sy;
                    a.y -= shift * sy;
                  }
                }
              }
            } while (node = node.next);
          }
          return x0 > a.x + ar || x1 < a.x - ar || y0 > a.y + ar || y1 < a.y - ar;
        });
      }
    }
  }
  force.initialize = (n) => nodes = n;
  return force;
}
function buildHullPath(items, opts) {
  const innerPad = opts.innerPad;
  const inflate = opts.inflate;
  const minR = opts.minR;
  const pts = [];
  for (const it of items) {
    const halfW = it.w / 2 + innerPad;
    const halfH = it.h / 2 + innerPad;
    pts.push([it.x - halfW, it.y - halfH]);
    pts.push([it.x + halfW, it.y - halfH]);
    pts.push([it.x + halfW, it.y + halfH]);
    pts.push([it.x - halfW, it.y + halfH]);
  }
  const cx = d3.mean(pts, (d) => d[0]);
  const cy = d3.mean(pts, (d) => d[1]);
  let hull = pts.length >= 3 ? d3.polygonHull(pts) : null;
  if (!hull) {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = d3.min(xs), maxX = d3.max(xs);
    const minY = d3.min(ys), maxY = d3.max(ys);
    hull = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]];
  }
  hull = hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < minR) {
      const nx = dx === 0 && dy === 0 ? 1 : dx / (dist || 1);
      const ny = dx === 0 && dy === 0 ? 0 : dy / (dist || 1);
      return [cx + nx * minR, cy + ny * minR];
    }
    return [x, y];
  });
  hull = hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    return [x + dx / dist * inflate, y + dy / dist * inflate];
  });
  const lineGen = d3.line().curve(d3.curveCatmullRomClosed.alpha(0.7));
  return { d: lineGen(hull), centroid: [cx, cy] };
}
function mergeOptions(defaults, overrides) {
  const out = Object.assign({}, defaults);
  for (const k in overrides) {
    const v = overrides[k];
    if (v && typeof v === "object" && !Array.isArray(v) && defaults[k] && typeof defaults[k] === "object") {
      out[k] = Object.assign({}, defaults[k], v);
    } else if (v !== void 0) {
      out[k] = v;
    }
  }
  return out;
}
var WordmapForce = class {
  constructor(container, options = {}) {
    if (!d3) throw new Error("WordmapForce: d3 instance not available. Pass options.d3.");
    ensureStyle();
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) throw new Error("WordmapForce: container element not found");
    el.classList.add("wf-host");
    this.container = el;
    this.opts = mergeOptions(DEFAULTS, options);
    this._lastZoomK = 1;
    this._buildDOM();
  }
  _buildDOM() {
    const { width, height, zoomable, zoomExtent } = this.opts;
    const svg = d3.select(this.container).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
    this.svg = svg;
    this.root = svg.append("g").attr("class", "wf-root");
    this.gHull = this.root.append("g").attr("class", "wf-hulls");
    this.gContent = this.root.append("g").attr("class", "wf-content");
    this.gC2 = this.root.append("g").attr("class", "wf-c2-labels");
    if (zoomable) {
      this.zoomBehavior = d3.zoom().scaleExtent(zoomExtent).on("zoom", (e) => {
        this.root.attr("transform", e.transform);
        this._onZoom(e.transform.k);
      });
      svg.call(this.zoomBehavior);
    }
  }
  _onZoom(k) {
    if (Math.abs(k - this._lastZoomK) < this.opts.wordZoomRewrapEpsilon) return;
    this._lastZoomK = k;
    if (this._wordSel) this._rerenderWordLines(k);
  }
  _rerenderWordLines(k) {
    const opts = this.opts;
    const FONT_KO = opts.fontFamilyKo;
    const c2Text = this._c2Text;
    this._wordSel.each(function(d) {
      const display = computeWordDisplay(d, k, opts);
      d.lines = display.lines;
      d._displayFs = display.fs;
      const g = d3.select(this);
      g.selectAll("text").remove();
      const lineH = display.fs * 1.2;
      const totalH = (d.lines.length - 1) * lineH;
      d.lines.forEach((line, i) => {
        g.append("text").attr("class", "wf-word").attr("x", 0).attr("y", i * lineH - totalH / 2).attr("font-family", FONT_KO).attr("font-size", display.fs).attr("fill", c2Text[d.c2 % c2Text.length]).attr("text-anchor", "middle").attr("dominant-baseline", "central").text(line);
      });
    });
  }
  render(data, extras = {}) {
    const opts = this.opts;
    const FONT_KO = opts.fontFamilyKo;
    const FONT_EMOJI = opts.fontFamilyEmoji;
    let rows = data || [];
    if (opts.autoAggregate) {
      const agg = /* @__PURE__ */ new Map();
      for (const d of rows) {
        const k = d.c1 + "" + d.text;
        const e = agg.get(k);
        if (e) e.size += d.size || 1;
        else agg.set(k, { text: d.text, size: d.size || 1, c1: d.c1, c2: d.c2 });
      }
      rows = [...agg.values()];
    }
    const c2Set = extras.c2Order ? extras.c2Order.slice() : Array.from(new Set(rows.map((r) => r.c2)));
    const c2Index = new Map(c2Set.map((k, i) => [k, i]));
    const c1Set = extras.c1Order ? extras.c1Order.slice() : Array.from(new Set(rows.map((r) => r.c1)));
    const c1Index = new Map(c1Set.map((k, i) => [k, i]));
    const c1ToC2 = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const ci = c1Index.get(r.c1);
      if (!c1ToC2.has(ci)) c1ToC2.set(ci, c2Index.get(r.c2));
    }
    const c1Anchor = this._computeAnchors(c1Set, c2Set, c1ToC2, extras.positions);
    const baseColors = opts.palette;
    const c2Fill = baseColors;
    const c2Text = baseColors.map((c) => {
      const hcl = d3.hcl(c);
      hcl.c = Math.max(hcl.c, 30) * 1.4;
      hcl.l = opts.wordTextLightness != null ? opts.wordTextLightness : 45;
      return hcl.formatHex();
    });
    const c1LabelColor = baseColors.map((c) => {
      const hcl = d3.hcl(c);
      return d3.hcl(hcl.h, 32, 22).formatHex();
    });
    const c2Pill = baseColors.map((c, i) => d3.interpolateRgb(c, c2Text[i])(0.22));
    this._c2Text = c2Text;
    const sizeExt = d3.extent(rows, (d) => d.size || 1);
    const fontScale = d3.scaleSqrt().domain(sizeExt[0] === sizeExt[1] ? [1, sizeExt[1] || 2] : sizeExt).range(opts.wordFontRange);
    const c1Area = /* @__PURE__ */ new Map();
    for (const d of rows) {
      const fs = fontScale(d.size || 1);
      const mcp = opts.wordCharsPerLine || Math.max(5, Math.round(fs * 0.32 + 2));
      const ml = opts.wordMaxLines;
      const baseLines = wrapAndTruncate(d.text, mcp, ml, opts.wordEllipsis, opts.wordOverflowMode);
      const lineWidths = baseLines.map((l) => measure(l, fs, 500, FONT_KO));
      const w = Math.max(...lineWidths) + 4;
      const h = baseLines.length * fs * 1.2;
      const ci = c1Index.get(d.c1);
      c1Area.set(ci, (c1Area.get(ci) || 0) + w * h);
    }
    const c1Radius = /* @__PURE__ */ new Map();
    c1Area.forEach((a, ci) => c1Radius.set(ci, Math.sqrt(a / (Math.PI * 0.55)) + 8));
    const discFactor = opts.clusterDiscFactor || 0;
    if (discFactor > 0) {
      const childByC2 = /* @__PURE__ */ new Map();
      c1Anchor.c1Pos.forEach((p, ci) => {
        const cj = c1ToC2.get(ci);
        const c2P = c1Anchor.c2Abs.get(cj);
        if (!c2P) return;
        if (!childByC2.has(cj)) childByC2.set(cj, []);
        childByC2.get(cj).push({ ci, dx: p.x - c2P.x, dy: p.y - c2P.y });
      });
      childByC2.forEach((list, cj) => {
        const c2P = c1Anchor.c2Abs.get(cj);
        if (!c2P) return;
        const sumR = list.reduce((a, d) => a + (c1Radius.get(d.ci) || 30), 0);
        const N = list.length;
        const discR = Math.max(sumR * 0.55, Math.sqrt(N) * 30) * discFactor;
        const maxDist = Math.max(1e-4, ...list.map((d) => Math.hypot(d.dx, d.dy)));
        list.forEach((d) => {
          const ratio = Math.hypot(d.dx, d.dy) / maxDist;
          const newDx = d.dx / maxDist * discR * ratio + d.dx / maxDist * discR * (1 - ratio) * 0.6;
          const newDy = d.dy / maxDist * discR * ratio + d.dy / maxDist * discR * (1 - ratio) * 0.6;
          c1Anchor.c1Pos.set(d.ci, { x: c2P.x + newDx, y: c2P.y + newDy });
        });
      });
    }
    const c2AbsX = /* @__PURE__ */ new Map();
    const c2AbsY = /* @__PURE__ */ new Map();
    c1Anchor.c2Abs.forEach((p, ci) => {
      c2AbsX.set(ci, p.x);
      c2AbsY.set(ci, p.y);
    });
    const clusterNodes = [];
    c1Anchor.c1Pos.forEach((p, ci) => {
      clusterNodes.push({
        c1: ci,
        c2: c1ToC2.get(ci),
        x: p.x,
        y: p.y,
        tx: p.x,
        ty: p.y,
        r: c1Radius.get(ci) || 30
      });
    });
    const clusterSim = d3.forceSimulation(clusterNodes).force("semantic", d3.forceX((d) => d.tx).strength(opts.clusterSemantic)).force("semanticY", d3.forceY((d) => d.ty).strength(opts.clusterSemantic)).force("cohesion", d3.forceX((d) => c2AbsX.get(d.c2) ?? d.tx).strength(opts.clusterCohesion)).force("cohesionY", d3.forceY((d) => c2AbsY.get(d.c2) ?? d.ty).strength(opts.clusterCohesion)).force("collide", d3.forceCollide((d) => d.r + opts.clusterCollidePad).iterations(4)).stop();
    for (let i = 0; i < opts.clusterPreTicks; i++) clusterSim.tick();
    const c1Center = /* @__PURE__ */ new Map();
    for (const n of clusterNodes) c1Center.set(n.c1, { x: n.x, y: n.y, r: n.r });
    const wordNodes = rows.map((d) => {
      const ci = c1Index.get(d.c1);
      const fs = fontScale(d.size || 1);
      const mcp = opts.wordCharsPerLine || Math.max(5, Math.round(fs * 0.32 + 2));
      const ml = opts.wordMaxLines;
      const baseLines = wrapAndTruncate(d.text, mcp, ml, opts.wordEllipsis, opts.wordOverflowMode);
      const lineWidths = baseLines.map((l) => measure(l, fs, 500, FONT_KO));
      const w = Math.max(...lineWidths) + 4;
      const h = ml * fs * 1.2;
      const c = c1Center.get(ci) || { x: opts.width / 2, y: opts.height / 2, r: 50 };
      return {
        type: "word",
        text: d.text,
        size: d.size || 1,
        c1: ci,
        c2: c2Index.get(d.c2),
        fs,
        w,
        h,
        maxCharsPerLine: mcp,
        maxLines: ml,
        lines: baseLines,
        x: c.x,
        y: c.y,
        cx: c.x,
        cy: c.y
      };
    });
    const c1Count = d3.rollup(wordNodes, (v) => v.length, (d) => d.c1);
    const wordsByC1 = d3.group(wordNodes, (d) => d.c1);
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    wordsByC1.forEach((items, ci) => {
      const c = c1Center.get(ci);
      if (!c) return;
      items.sort((a, b) => b.size - a.size);
      const N = items.length;
      items.forEach((n, i) => {
        const ang = i * GOLDEN;
        const rad = Math.sqrt((i + 0.5) / N) * c.r * 0.92;
        n.cx = c.x + Math.cos(ang) * rad;
        n.cy = c.y + Math.sin(ang) * rad;
        n.x = n.cx;
        n.y = n.cy;
      });
    });
    const labelScale = d3.scaleLog().domain([0.1, 20]).range(opts.c1FontScaleRange || [0.7, 1.3]).clamp(true);
    const c1Value = /* @__PURE__ */ new Map();
    let totalValue = 0;
    wordsByC1.forEach((words, ci) => {
      const v = words.reduce((s, w) => s + (w.size || 1), 0);
      c1Value.set(ci, v);
      totalValue += v;
    });
    if (totalValue <= 0) totalValue = 1;
    const c1FsByCi = /* @__PURE__ */ new Map();
    const labelNodes = [];
    c1Center.forEach((c, ci) => {
      const text = c1Set[ci];
      let fs;
      if (opts.c1FontSize != null) {
        fs = opts.c1FontSize;
      } else {
        const wordsInC1 = wordsByC1.get(ci) || [];
        const value = c1Value.get(ci) || 0;
        const ratio = Math.max(0.2, Math.min(30, value / totalValue * 100));
        const byRatio = Math.round((opts.c1FontBase || 30) * labelScale(ratio));
        const maxFs = wordsInC1.length ? Math.max(...wordsInC1.map((w2) => w2.fs)) : 0;
        const byMax = Math.round(maxFs * (opts.c1FontMaxFloorMul || 1.05));
        const auto = Math.max(byRatio, byMax);
        const min = opts.c1FontMin || 14;
        const cap = opts.c1FontMax != null ? opts.c1FontMax : Infinity;
        fs = Math.min(cap, Math.max(min, auto));
      }
      c1FsByCi.set(ci, fs);
      const mcp = opts.c1CharsPerLine || Math.max(5, Math.round(fs * 0.32 + 2));
      const ml = opts.c1MaxLines;
      const lines = wrapAndTruncate(text, mcp, ml, opts.wordEllipsis, opts.wordOverflowMode);
      const lineWidths = lines.map((l) => measure(l, fs, 700, FONT_KO));
      const w = Math.max(...lineWidths) + 16;
      const h = lines.length * fs * 1.2 + 4;
      labelNodes.push({
        type: "label",
        text,
        c1: ci,
        c2: c1ToC2.get(ci),
        fs,
        w,
        h,
        lines,
        x: c.x,
        y: c.y,
        cx: c.x,
        cy: c.y
      });
    });
    const c2WordCount = d3.rollup(wordNodes, (v) => v.length, (d) => d.c2);
    const c2Meta = /* @__PURE__ */ new Map();
    const HORIZ = opts.c2HorizPadMult;
    const HMULT = opts.c2HeightMult;
    const GMULT = opts.c2GapMult;
    const ESCALE = opts.c2EmojiScale;
    c2WordCount.forEach((cnt, ci) => {
      const text = c2Set[ci];
      const { emoji, rest } = splitEmoji(text);
      const eW1 = emoji ? measure(emoji, ESCALE, 800, FONT_EMOJI) : 0;
      const gap1 = emoji ? GMULT : 0;
      const rW1 = measure(rest, 1, 800, FONT_EMOJI);
      const widthUnit = eW1 + gap1 + rW1 + HORIZ;
      c2Meta.set(ci, { text, emoji, rest, cnt, widthUnit, areaScore: cnt / widthUnit });
    });
    const areaScores = [...c2Meta.values()].map((m) => m.areaScore);
    const c2FontScale = d3.scaleSqrt().domain(areaScores.length > 1 ? d3.extent(areaScores) : [areaScores[0] || 1, areaScores[0] || 2]).range(opts.c2FontRange);
    const c1ByC2 = d3.group([...c1Center.entries()].map(([ci, c]) => ({ c1: ci, c })), (d) => c1ToC2.get(d.c1));
    const c2Nodes = [];
    c1ByC2.forEach((children, ci) => {
      let sx = 0, sy = 0, sw = 0;
      for (const ch of children) {
        const cnt = c1Count.get(ch.c1) || 1;
        sx += ch.c.x * cnt;
        sy += ch.c.y * cnt;
        sw += cnt;
      }
      if (sw === 0) return;
      const meta = c2Meta.get(ci);
      if (!meta) return;
      const c2value = children.reduce((a, ch) => a + (c1Value.get(ch.c1) || 0), 0);
      const c2ratio = Math.max(0.2, Math.min(30, c2value / totalValue * 100));
      let fs = Math.round((opts.c2FontBase || 35) * labelScale(c2ratio) * (opts.c2OverC1Mul || 1.15));
      const childC1Fs = children.map((ch) => c1FsByCi.get(ch.c1) || 0);
      const maxC1Fs = childC1Fs.length ? Math.max(...childC1Fs) : 0;
      if (maxC1Fs > 0) fs = Math.max(fs, Math.round(maxC1Fs * (opts.c2FontFloorMul || 1.1)));
      const mcp = opts.c2CharsPerLine || Math.max(5, Math.round(fs * 0.32 + 2));
      const ml = opts.c2MaxLines;
      const lines = wrapAndTruncate(meta.rest, mcp, ml, opts.wordEllipsis, opts.wordOverflowMode);
      const lineWidths = lines.map((line, i) => {
        const lw = measure(line, fs, 800, FONT_EMOJI);
        if (i === 0 && meta.emoji) {
          const eW = measure(meta.emoji, fs * ESCALE, 800, FONT_EMOJI);
          return eW + fs * GMULT + lw;
        }
        return lw;
      });
      const innerW = Math.max(...lineWidths);
      const w = innerW + fs * HORIZ;
      const lineH = fs * 1.1;
      const h = lines.length * lineH + fs * (HMULT - 1);
      const ax = sx / sw, ay = sy / sw;
      c2Nodes.push({
        type: "c2",
        text: meta.text,
        emoji: meta.emoji,
        rest: meta.rest,
        c2: ci,
        fs,
        emojiFs: fs * ESCALE,
        w,
        h,
        lines,
        lineH,
        x: ax,
        y: ay,
        cx: ax,
        cy: ay
      });
    });
    const allNodes = [...wordNodes, ...labelNodes, ...c2Nodes];
    const ATTRACT = {
      word: opts.forceWordAttract,
      label: opts.forceLabelAttract,
      c2: opts.forceC2Attract
    };
    const labelByCi = new Map(labelNodes.map((n) => [n.c1, n]));
    const c2NodeByCj = new Map(c2Nodes.map((n) => [n.c2, n]));
    const wordsByC2 = /* @__PURE__ */ new Map();
    for (const [ci, words] of wordsByC1.entries()) {
      const cj = c1ToC2.get(ci);
      if (cj == null) continue;
      if (!wordsByC2.has(cj)) wordsByC2.set(cj, []);
      const arr = wordsByC2.get(cj);
      for (const w of words) arr.push(w);
    }
    const updateAnchors = () => {
      for (const [ci, words] of wordsByC1.entries()) {
        if (!words.length) continue;
        const label = labelByCi.get(ci);
        if (!label || label.fx != null) continue;
        let sx = 0, sy = 0;
        for (const w of words) {
          sx += w.x;
          sy += w.y;
        }
        label.cx = sx / words.length;
        label.cy = sy / words.length;
      }
      const c2Pos = opts.c2Position || "top";
      for (const [cj, words] of wordsByC2.entries()) {
        if (!words.length) continue;
        const c2node = c2NodeByCj.get(cj);
        if (!c2node || c2node.fx != null) continue;
        let sx = 0, sy = 0, minY = Infinity;
        for (const w of words) {
          sx += w.x;
          sy += w.y;
          const wy = w.y - (w.h || 0) / 2;
          if (wy < minY) minY = wy;
        }
        c2node.cx = sx / words.length;
        if (c2Pos === "top") {
          c2node.cy = minY + c2node.h * 0.2;
        } else {
          c2node.cy = sy / words.length;
        }
      }
    };
    const sim = d3.forceSimulation(allNodes).force("x", d3.forceX((d) => d.cx).strength((d) => ATTRACT[d.type] ?? 0.1)).force("y", d3.forceY((d) => d.cy).strength((d) => ATTRACT[d.type] ?? 0.1)).force("collide", rectCollide(opts.collidePadding, opts.collideIterations)).alpha(1).alphaDecay(opts.alphaDecay).stop();
    const preTicks = opts.preTicks;
    const phase1 = Math.floor(preTicks * 0.5);
    const phase2 = Math.floor(preTicks * 0.3);
    const phase3 = preTicks - phase1 - phase2;
    for (let i = 0; i < phase1; i++) sim.tick();
    updateAnchors();
    sim.alpha(0.6);
    for (let i = 0; i < phase2; i++) sim.tick();
    updateAnchors();
    sim.alpha(0.3);
    for (let i = 0; i < phase3; i++) sim.tick();
    const drawHulls = () => {
      const hullData = [];
      for (const [ci, items] of wordsByC1.entries()) {
        const cj = c1ToC2.get(ci);
        const all = items.slice();
        const lbl = labelByCi.get(ci);
        if (lbl) all.push(lbl);
        hullData.push({
          c1: ci,
          c2: cj,
          fill: c2Fill[cj % c2Fill.length],
          ...buildHullPath(all, { innerPad: opts.hullInnerPad, inflate: opts.hullInflate, minR: opts.hullMinR }),
          count: items.length
        });
      }
      this.gHull.selectAll("path").data(hullData, (d) => d.c1).join("path").attr("class", "wf-hull").attr("d", (d) => d.d).attr("fill", (d) => d.fill).attr("stroke", (d) => d.fill);
    };
    drawHulls();
    this._drawHulls = drawHulls;
    const wordSel = this.gContent.selectAll("g.wf-word-g").data(wordNodes).join("g").attr("class", "wf-word-g").attr("transform", (d) => `translate(${d.x},${d.y})`);
    this._wordSel = wordSel;
    this._rerenderWordLines(this._lastZoomK || 1);
    const c1Sel = this.gContent.selectAll("g.wf-c1-label-g").data(labelNodes, (d) => d.c1).join("g").attr("class", "wf-c1-label-g").attr("transform", (d) => `translate(${d.x},${d.y})`);
    c1Sel.each(function(d) {
      const g = d3.select(this);
      g.selectAll("text").remove();
      const lineH = d.fs * 1.2;
      const totalH = (d.lines.length - 1) * lineH;
      const fill = c1LabelColor[d.c2 % c1LabelColor.length];
      d.lines.forEach((line, i) => {
        g.append("text").attr("class", "wf-c1-label").attr("x", 0).attr("y", i * lineH - totalH / 2).attr("font-family", FONT_EMOJI).attr("font-size", d.fs).attr("fill", fill).attr("text-anchor", "middle").attr("dominant-baseline", "central").text(line);
      });
    });
    const c2Sel = this.gC2.selectAll("g.wf-c2-pill").data(c2Nodes, (d) => d.c2).join((enter) => {
      const g = enter.append("g").attr("class", "wf-c2-pill");
      g.append("rect").attr("x", (d) => -d.w / 2).attr("y", (d) => -d.h / 2).attr("width", (d) => d.w).attr("height", (d) => d.h).attr("rx", (d) => Math.min(d.h / 2, 28)).attr("ry", (d) => Math.min(d.h / 2, 28)).attr("fill", (d) => c2Pill[d.c2 % c2Pill.length]).attr("fill-opacity", opts.c2PillOpacity != null ? opts.c2PillOpacity : 0.85);
      return g;
    }).attr("transform", (d) => `translate(${d.x},${d.y})`);
    c2Sel.each(function(d) {
      const g = d3.select(this);
      g.selectAll("text").remove();
      const N = d.lines.length;
      const totalH = (N - 1) * d.lineH;
      d.lines.forEach((line, i) => {
        const y = i * d.lineH - totalH / 2 + 1;
        const t = g.append("text").attr("y", y).attr("font-family", FONT_EMOJI).attr("text-anchor", "middle").attr("dominant-baseline", "central");
        if (i === 0 && d.emoji) {
          const eW = measure(d.emoji, d.emojiFs, 800, FONT_EMOJI);
          const gap = d.fs * 0.25;
          const rW = measure(line, d.fs, 800, FONT_EMOJI);
          const startX = -(eW + gap + rW) / 2;
          t.append("tspan").attr("x", startX + eW / 2).attr("font-size", d.emojiFs).text(d.emoji);
          t.append("tspan").attr("x", startX + eW + gap + rW / 2).attr("font-size", d.fs).text(line);
        } else {
          t.append("tspan").attr("x", 0).attr("font-size", d.fs).text(line);
        }
      });
    });
    this._sim = sim;
    this._c1Sel = c1Sel;
    this._c2Sel = c2Sel;
    const ticked = () => {
      updateAnchors();
      wordSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      c1Sel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      c2Sel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      if (sim.alpha() > 0.05) drawHulls();
    };
    sim.on("tick", ticked);
    sim.alpha(0).restart();
    if (opts.draggable) {
      const drag = d3.drag().on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.4).restart();
        d.fx = d.x;
        d.fy = d.y;
      }).on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      }).on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
      c1Sel.call(drag);
      c2Sel.call(drag);
    }
    this.state = {
      rows,
      c1Set,
      c2Set,
      c1ToC2,
      c1Center,
      wordNodes,
      labelNodes,
      c2Nodes
    };
    if (opts.fitToContent) this.fitToContent();
    return this;
  }
  fitToContent(padding) {
    if (!this.zoomBehavior || !this.svg || !this.state) return;
    const { wordNodes, labelNodes, c2Nodes } = this.state;
    const all = [...wordNodes || [], ...labelNodes || [], ...c2Nodes || []];
    if (!all.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of all) {
      const halfW = (n.w || 0) / 2;
      const halfH = (n.h || 0) / 2;
      if (n.x - halfW < minX) minX = n.x - halfW;
      if (n.y - halfH < minY) minY = n.y - halfH;
      if (n.x + halfW > maxX) maxX = n.x + halfW;
      if (n.y + halfH > maxY) maxY = n.y + halfH;
    }
    const W = this.opts.width, H = this.opts.height;
    if (padding == null) padding = Math.max(60, Math.min(W, H) * 0.06);
    const hullExtra = (this.opts.hullInflate || 0) + (this.opts.hullInnerPad || 0);
    const totalPad = padding + hullExtra;
    minX -= totalPad;
    minY -= totalPad;
    maxX += totalPad;
    maxY += totalPad;
    const bw = maxX - minX, bh = maxY - minY;
    if (bw <= 0 || bh <= 0) return;
    const fit = Math.min(W / bw, H / bh);
    const [zMin, zMax] = this.opts.zoomExtent;
    if (fit < zMin) {
      this.zoomBehavior.scaleExtent([Math.min(zMin, fit), zMax]);
    }
    const k = Math.min(fit, zMax);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const tx = W / 2 - cx * k;
    const ty = H / 2 - cy * k;
    const t = d3.zoomIdentity.translate(tx, ty).scale(k);
    this.svg.call(this.zoomBehavior.transform, t);
    this._lastZoomK = k;
  }
  _computeAnchors(c1Set, c2Set, c1ToC2, positions) {
    const opts = this.opts;
    const { width: W, height: H, margin: M, clusterLocalScale } = opts;
    const rawPad = opts.clusterPad || { x: 0, y: 0 };
    const PAD = {
      x: rawPad.x > 0 && rawPad.x < 1 ? rawPad.x * W : rawPad.x,
      y: rawPad.y > 0 && rawPad.y < 1 ? rawPad.y * H : rawPad.y
    };
    const c2Pos = /* @__PURE__ */ new Map();
    const c1Pos = /* @__PURE__ */ new Map();
    if (positions) {
      if (positions.c2) {
        for (const [name, p] of Object.entries(positions.c2)) {
          const i = c2Set.indexOf(name);
          if (i >= 0) c2Pos.set(i, p);
        }
      }
      if (positions.c1) {
        for (const [name, p] of Object.entries(positions.c1)) {
          const i = c1Set.indexOf(name);
          if (i >= 0) c1Pos.set(i, p);
        }
      }
    }
    const c2Abs = /* @__PURE__ */ new Map();
    if (c2Pos.size === c2Set.length) {
      const xs = [...c2Pos.values()].map((p) => p.x);
      const ys = [...c2Pos.values()].map((p) => p.y);
      const sx = d3.scaleLinear().domain(d3.extent(xs)).range([M.left + PAD.x, W - M.right - PAD.x]);
      const sy = d3.scaleLinear().domain(d3.extent(ys)).range([M.top + PAD.y, H - M.bottom - PAD.y]);
      c2Pos.forEach((p, i) => c2Abs.set(i, { x: sx(p.x), y: sy(p.y) }));
    } else {
      const N = c2Set.length;
      const cols = Math.ceil(Math.sqrt(N * (W / H)));
      const rows = Math.ceil(N / cols);
      const cw = (W - M.left - M.right) / cols;
      const ch = (H - M.top - M.bottom) / rows;
      c2Set.forEach((_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        c2Abs.set(i, { x: M.left + cw * (c + 0.5), y: M.top + ch * (r + 0.5) });
      });
    }
    const c1AnchorMap = /* @__PURE__ */ new Map();
    if (c1Pos.size > 0) {
      const childByC2 = /* @__PURE__ */ new Map();
      c1Pos.forEach((p, ci) => {
        const cj = c1ToC2.get(ci);
        if (!childByC2.has(cj)) childByC2.set(cj, []);
        childByC2.get(cj).push({ ci, p });
      });
      const c2Centroid = /* @__PURE__ */ new Map();
      childByC2.forEach((list, cj) => {
        c2Centroid.set(cj, {
          x: d3.mean(list, (d) => d.p.x),
          y: d3.mean(list, (d) => d.p.y)
        });
      });
      c1Pos.forEach((p, ci) => {
        const cj = c1ToC2.get(ci);
        const c2P = c2Abs.get(cj);
        const c2C = c2Centroid.get(cj);
        if (!c2P || !c2C) {
          c1AnchorMap.set(ci, { x: W / 2, y: H / 2 });
          return;
        }
        c1AnchorMap.set(ci, {
          x: c2P.x + (p.x - c2C.x) * clusterLocalScale,
          y: c2P.y + (p.y - c2C.y) * clusterLocalScale
        });
      });
    } else {
      const c2ChildCount = /* @__PURE__ */ new Map();
      c1ToC2.forEach((cj) => c2ChildCount.set(cj, (c2ChildCount.get(cj) || 0) + 1));
      const c2ChildIdx = /* @__PURE__ */ new Map();
      c1Set.forEach((_, ci) => {
        const cj = c1ToC2.get(ci);
        const N = c2ChildCount.get(cj);
        const idx = c2ChildIdx.get(cj) || 0;
        c2ChildIdx.set(cj, idx + 1);
        const ang = idx / N * Math.PI * 2;
        const rad = 80;
        const c2P = c2Abs.get(cj) || { x: W / 2, y: H / 2 };
        c1AnchorMap.set(ci, {
          x: c2P.x + Math.cos(ang) * rad,
          y: c2P.y + Math.sin(ang) * rad
        });
      });
    }
    return { c1Pos: c1AnchorMap, c2Abs };
  }
  resetZoom() {
    if (this.zoomBehavior) {
      this.svg.transition().duration(400).call(this.zoomBehavior.transform, d3.zoomIdentity);
    }
    return this;
  }
  destroy() {
    if (this._sim) this._sim.stop();
    if (this.svg) this.svg.remove();
    this.container.classList.remove("wf-host");
    this.state = null;
  }
};
function createWordmapForce(container, data, options = {}) {
  d3 = options.d3 || typeof globalThis !== "undefined" && globalThis.d3 || typeof window !== "undefined" && window.d3;
  if (!d3) throw new Error("createWordmapForce: d3 v7 instance required (pass options.d3).");
  const chart = new WordmapForce(container, options);
  if (data) chart.render(data, options.extras || {});
  return chart;
}
var wordmap_force_library_default = createWordmapForce;
export {
  WordmapForce,
  createWordmapForce,
  wordmap_force_library_default as default
};
