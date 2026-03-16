// timeline-cloud-library.js
var CLUSTER_COLORS = "#8fb1d0,#ffdd7b,#f27a65,#99ab8e,#b3998a,#fba25e,#d9d6b8,#98d5cc,#f3bd97,#bc989c,#9ab9ab,#bf9697,#95a0c4,#c79796,#cec193,#9aa6c4,#aec19f,#d59e92,#f5cb84,#dea091,#a1bcc7,#cba9a0,#c2d1a5,#b2c4bc,#e3ad99,#adc8cb,#a4bed6,#c9bcb1,#d7b2a8,#adbfd3".split(",");
function colorvariation(d3, color, h, s, l) {
  let c = d3.hsl(color);
  c.h += h;
  c.s += s;
  c.l += l;
  return c.formatHex();
}
function detectDateKey(data) {
  const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^\d{4}\/\d{2}\/\d{2}/, /^\d{4}\.\d{2}\.\d{2}/];
  const dateKeyNames = ["date", "\uB0A0\uC9DC", "\uC791\uC131\uC77C", "\uB4F1\uB85D\uC77C", "timestamp", "created", "created_at", "createdAt", "time", "datetime"];
  const keys = Object.keys(data[0] || {});
  for (const key of keys) {
    if (dateKeyNames.includes(key.toLowerCase())) {
      const samples = data.slice(0, 20).map((d) => d[key]).filter(Boolean);
      if (samples.length > 0 && parseDate(samples[0])) return key;
    }
  }
  for (const key of keys) {
    const samples = data.slice(0, 50).map((d) => d[key]).filter(Boolean);
    if (samples.length < 3) continue;
    if (samples.filter((v) => datePatterns.some((p) => p.test(String(v)))).length / samples.length >= 0.5)
      return key;
  }
  return null;
}
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const s = String(val).trim();
  if (/^\d{10,13}$/.test(s)) {
    const ts = s.length <= 10 ? +s * 1e3 : +s;
    const d2 = new Date(ts);
    return isNaN(d2.getTime()) ? null : d2;
  }
  if (/^\d{8}$/.test(s)) {
    const d2 = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
    return isNaN(d2.getTime()) ? null : d2;
  }
  const m = s.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (m) {
    const rest = s.slice(m[0].length).trim();
    const tm = rest.match(/^[T ]?(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const d2 = new Date(+m[1], +m[2] - 1, +m[3], tm ? +tm[1] : 0, tm ? +tm[2] : 0, tm && tm[3] ? +tm[3] : 0);
    return isNaN(d2.getTime()) ? null : d2;
  }
  const m2 = s.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})/);
  if (m2) {
    const d2 = new Date(+m2[3], +m2[1] - 1, +m2[2]);
    return isNaN(d2.getTime()) ? null : d2;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function expandHull(hull, padding) {
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
  return hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + dx / dist * padding, y + dy / dist * padding];
  });
}
function findDenseCenter(items, xKey, yKey) {
  if (items.length <= 3) {
    return {
      x: items.reduce((s, d) => s + d[xKey], 0) / items.length,
      y: items.reduce((s, d) => s + d[yKey], 0) / items.length
    };
  }
  const xs = items.map((d) => d[xKey]), ys = items.map((d) => d[yKey]);
  const xRange = Math.max(...xs) - Math.min(...xs);
  const yRange = Math.max(...ys) - Math.min(...ys);
  const spread = Math.sqrt(xRange * xRange + yRange * yRange);
  const radius = Math.max(spread * 0.25, 30);
  let best = items[0], bestCount = 0;
  for (const item of items) {
    let count = 0;
    for (const other of items) {
      const dx = item[xKey] - other[xKey], dy = item[yKey] - other[yKey];
      if (dx * dx + dy * dy < radius * radius) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = item;
    }
  }
  const nearby = items.filter((d) => {
    const dx = d[xKey] - best[xKey], dy = d[yKey] - best[yKey];
    return dx * dx + dy * dy < radius * radius;
  });
  return {
    x: nearby.reduce((s, d) => s + d[xKey], 0) / nearby.length,
    y: nearby.reduce((s, d) => s + d[yKey], 0) / nearby.length
  };
}
function createTimelineCloud(container, clusterWithLabel, options = {}) {
  const {
    d3: d3Lib,
    regionPos,
    // [{depth:1, key, x, y, size, ...}] - bigLabel 좌표
    labelPos,
    // [{depth:2, key, x, y, ...}] - label 좌표
    cellPos,
    // [{depth:3, key, x, y, ...}] or [{text, pos:{x,y}}] - 개별 좌표 (있으면 사용, 없어도 됨)
    dateKey: userDateKey,
    width = 1400,
    height = 1e3,
    colors,
    cellColors,
    // [{key, color}] - label별 색상
    regionColors,
    title = "",
    caption = "",
    showText = true,
    maxTextLength = 15,
    hullPadding = 18,
    densityHeight = 80,
    margin = { top: 20, right: 50, bottom: 20, left: 50 },
    clusterStrength = 0.15,
    // 클러스터 응집력 (0~1, 0이면 끔)
    clusterXRatio = 0.3,
    // x방향 클러스터 힘 비율 (0~1)
    onClick
  } = options;
  if (!d3Lib) throw new Error("d3 is required");
  const dateKey = userDateKey || (clusterWithLabel[0]?.date != null ? "date" : detectDateKey(clusterWithLabel));
  const cellPosMap = /* @__PURE__ */ new Map();
  if (cellPos && cellPos.length) {
    cellPos.forEach((cp) => {
      const key = cp.text || cp.key;
      const pos = cp.pos || (cp.x != null ? { x: cp.x, y: cp.y } : null);
      if (key && pos) cellPosMap.set(key, pos);
    });
  }
  const labelPosMap = /* @__PURE__ */ new Map();
  if (labelPos && labelPos.length) {
    labelPos.forEach((lp) => {
      const key = lp.label || lp.key;
      const pos = lp.pos || (lp.x != null ? { x: lp.x, y: lp.y } : null);
      if (key && pos) labelPosMap.set(key, pos);
    });
  }
  const regionPosMap = /* @__PURE__ */ new Map();
  if (regionPos && regionPos.length) {
    regionPos.forEach((rp) => {
      const key = rp.key || rp.bigLabel;
      const pos = rp.pos || (rp.x != null ? { x: rp.x, y: rp.y } : null);
      if (key && pos) regionPosMap.set(key, pos);
    });
  }
  const rng = (function(seed) {
    let s = seed | 0;
    return () => {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
  })(42);
  const data = clusterWithLabel.map((d, i) => {
    const textVal = d.text || d["\uD14D\uC2A4\uD2B8"] || "";
    const label = d.label;
    const bigLabel = d.bigLabel;
    let pos = cellPosMap.get(textVal) || (d.x != null && d.y != null ? { x: +d.x, y: +d.y } : null);
    if (!pos) {
      const labelCenter = labelPosMap.get(label);
      const regionCenter = regionPosMap.get(bigLabel);
      const center = labelCenter || regionCenter;
      if (center) {
        const spread = labelCenter ? 0.8 : 1.5;
        pos = {
          x: center.x + (rng() - 0.5) * spread,
          y: center.y + (rng() - 0.5) * spread
        };
      }
    }
    if (!pos) pos = { x: rng() * 10, y: rng() * 10 };
    return {
      ...d,
      _px: pos.x,
      _py: pos.y,
      _text: String(textVal).substring(0, maxTextLength),
      _date: dateKey && d[dateKey] ? parseDate(d[dateKey]) : null,
      _idx: i
    };
  });
  const hasDate = dateKey && data.some((d) => d._date && !isNaN(d._date.getTime()));
  const validDateData = hasDate ? data.filter((d) => d._date && !isNaN(d._date.getTime())) : [];
  const bigGroups = d3Lib.groups(data, (d) => d.bigLabel).map(([key, items]) => ({ key, count: items.length })).sort((a, b) => b.count - a.count);
  const bigLabelRank = new Map(bigGroups.map((d, i) => [d.key, i]));
  const labelColorMap = /* @__PURE__ */ new Map();
  const bigLabelColorMap = /* @__PURE__ */ new Map();
  data.forEach((d) => {
    if (d.color && d.label) labelColorMap.set(d.label, d.color);
    if (d.bigColor && d.bigLabel) bigLabelColorMap.set(d.bigLabel, d.bigColor);
  });
  if (cellColors && cellColors.length) {
    cellColors.forEach((cc) => {
      if (cc.key && cc.color) labelColorMap.set(cc.key, cc.color);
    });
  }
  const defaultColors = CLUSTER_COLORS;
  let getColorByLabel;
  if (regionColors && regionColors.length) {
    const rcMap = new Map(regionColors.map((rc) => [rc.key, rc.color]));
    getColorByLabel = (label, bigLabel) => labelColorMap.get(label) || rcMap.get(bigLabel) || bigLabelColorMap.get(bigLabel) || (colors || defaultColors)[bigLabelRank.get(bigLabel) || 0] || "#ccc";
  } else {
    getColorByLabel = (label, bigLabel) => labelColorMap.get(label) || bigLabelColorMap.get(bigLabel) || (colors || defaultColors)[bigLabelRank.get(bigLabel) || 0] || "#ccc";
  }
  const titleAreaH = title || caption ? 60 : 10;
  const cloudHeight = height - (hasDate ? densityHeight + 50 : 0) - titleAreaH;
  const cloudPadding = 60;
  const xRange = [margin.left + cloudPadding, width - margin.right - cloudPadding];
  let xScale;
  if (hasDate) {
    const timeExtentForX = d3Lib.extent(validDateData, (d) => d._date);
    xScale = d3Lib.scaleTime().domain(timeExtentForX).range(xRange);
  } else {
    const xExtent = d3Lib.extent(data, (d) => d._px);
    xScale = d3Lib.scaleLinear().domain(xExtent).range(xRange);
  }
  const n = data.length;
  const scaleFactor = Math.sqrt(500 / Math.max(n, 1));
  const dotRadius = Math.max(1.5, Math.min(4, 2.5 * scaleFactor));
  const hullPad = Math.max(8, hullPadding * scaleFactor);
  const labelScale = Math.max(0.6, Math.min(1.5, scaleFactor));
  const fontSize = 7;
  const floorY = cloudHeight - 10;
  const ceilingY = margin.top + 40;
  const availableH = floorY - ceilingY;
  const totalItems = data.length;
  const layerTargetY = /* @__PURE__ */ new Map();
  let cumRatio = 0;
  for (const { key, count } of bigGroups) {
    const ratio = count / totalItems;
    const centerY = floorY - cumRatio * availableH - ratio * availableH / 2;
    layerTargetY.set(key, { center: centerY, halfH: ratio * availableH / 2 });
    cumRatio += ratio;
  }
  const groupedByBig = d3Lib.groups(data, (d) => d.bigLabel);
  for (const [, items] of groupedByBig) {
    const layer = layerTargetY.get(items[0].bigLabel);
    if (!layer) continue;
    const yVals = items.map((d) => d._py);
    const yMin = d3Lib.min(yVals), yMax = d3Lib.max(yVals);
    const yRange = yMax - yMin || 1;
    for (const d of items) {
      const t = (d._py - yMin) / yRange;
      d._targetY = layer.center - layer.halfH * 0.7 + t * layer.halfH * 1.4;
    }
  }
  data.forEach((d) => {
    d._targetX = hasDate && d._date ? xScale(d._date) : xScale(d._px);
    d._radius = Math.max(5, d._text.length * fontSize * 0.28);
  });
  const labelGroups = d3Lib.groups(data, (d) => d.label);
  function forceCluster(strength) {
    return () => {
      for (const [, items] of labelGroups) {
        if (items.length < 2) continue;
        const cx = d3Lib.mean(items, (d) => d.x);
        const cy = d3Lib.mean(items, (d) => d.y);
        for (const d of items) {
          d.vx += (cx - d.x) * strength * clusterXRatio;
          d.vy += (cy - d.y) * strength;
        }
      }
    };
  }
  const simulation = d3Lib.forceSimulation(data).force("x", d3Lib.forceX((d) => d._targetX).strength(0.8)).force("y", d3Lib.forceY((d) => d._targetY).strength(0.3)).force("cluster", clusterStrength > 0 ? forceCluster(clusterStrength) : null).force("collide", d3Lib.forceCollide((d) => d._radius).strength(0.7).iterations(3)).force("bounds", () => {
    for (const d of data) {
      if (d.y > floorY) d.y = floorY;
      if (d.y < ceilingY) d.y = ceilingY;
      if (d.x < margin.left + 60) d.x = margin.left + 60;
      if (d.x > width - margin.right - 60) d.x = width - margin.right - 60;
    }
  }).stop();
  for (let i = 0; i < 300; i++) simulation.tick();
  data.forEach((d) => {
    d._sx = d.x;
    d._sy = d.y;
  });
  if (typeof container === "string") container = document.querySelector(container);
  container.innerHTML = "";
  const svg = d3Lib.create("svg").attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`).style("font-family", "'KoddiUD OnGothic', sans-serif");
  const subClusters = d3Lib.groups(data, (d) => d.label);
  const hullGroup = svg.append("g").attr("class", "hulls");
  for (const [label, items] of subClusters) {
    const bigLabel = items[0].bigLabel;
    const baseColor = getColorByLabel(label, bigLabel);
    const fillColor = colorvariation(d3Lib, baseColor, 0, 0, 0.15);
    const strokeColor = colorvariation(d3Lib, baseColor, 0, 0, -0.15);
    if (items.length < 3) {
      const cx = d3Lib.mean(items, (d) => d._sx);
      const cy = d3Lib.mean(items, (d) => d._sy);
      hullGroup.append("circle").attr("cx", cx).attr("cy", cy).attr("r", (12 + items.length * 4) * scaleFactor).attr("fill", fillColor).attr("stroke", strokeColor).attr("stroke-width", 0.5).attr("opacity", 0.5);
      continue;
    }
    const points = items.map((d) => [d._sx, d._sy]);
    const hull = d3Lib.polygonHull(points);
    if (!hull) continue;
    const expanded = expandHull(hull, hullPad);
    const path = d3Lib.line().curve(d3Lib.curveCatmullRomClosed.alpha(0.5))(expanded);
    hullGroup.append("path").attr("d", path).attr("fill", fillColor).attr("stroke", strokeColor).attr("stroke-width", 0.5).attr("opacity", 0.5);
  }
  const tooltip = d3Lib.select(container).append("div").style("position", "absolute").style("pointer-events", "none").style("background", "#fff").style("color", "#333").style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)").style("border", "1px solid #e0e0e0").style("padding", "6px 10px").style("border-radius", "4px").style("font-size", "12px").style("max-width", "300px").style("line-height", "1.4").style("white-space", "pre-wrap").style("display", "none").style("z-index", "1000");
  d3Lib.select(container).style("position", "relative");
  const dotGroup = svg.append("g").attr("class", "cloud-dots");
  dotGroup.selectAll("circle").data(data).join("circle").attr("cx", (d) => d._sx).attr("cy", (d) => d._sy).attr("r", dotRadius).attr("fill", (d) => colorvariation(d3Lib, d.color || getColorByLabel(d.label, d.bigLabel), 0, 0, 0.1)).attr("opacity", 0.4).attr("pointer-events", "all").attr("cursor", "pointer").on("mouseenter", (event, d) => {
    d3Lib.select(event.target).attr("r", dotRadius * 2).attr("opacity", 1);
    const text = d.text || d["\uD14D\uC2A4\uD2B8"] || "";
    const label = d.label || "";
    const dateStr = d._date ? d._date.toLocaleDateString("ko-KR") : "";
    tooltip.style("display", "block").html(`<strong>${label}</strong>${dateStr ? " \xB7 " + dateStr : ""}<br/>${text}`);
  }).on("mousemove", (event) => {
    const rect = container.getBoundingClientRect();
    tooltip.style("left", event.clientX - rect.left + 12 + "px").style("top", event.clientY - rect.top - 10 + "px");
  }).on("mouseleave", (event) => {
    d3Lib.select(event.target).attr("r", dotRadius).attr("opacity", 0.4);
    tooltip.style("display", "none");
  }).on("click", onClick ? (event, d) => onClick({ data: d, event }) : null);
  const _measureCanvas = document.createElement("canvas").getContext("2d");
  const measureText = (text, fontSize2, fontWeight = "normal") => {
    _measureCanvas.font = `${fontWeight} ${fontSize2}px 'KoddiUD OnGothic', sans-serif`;
    const m = _measureCanvas.measureText(text);
    return { w: m.width, h: fontSize2 * 1.2 };
  };
  const allLabels = [];
  for (const [label, items] of subClusters) {
    if (items.length < 2) continue;
    const bigLabel = items[0].bigLabel;
    const baseColor = getColorByLabel(label, bigLabel);
    const center = {
      x: d3Lib.mean(items, (d) => d._sx),
      y: d3Lib.mean(items, (d) => d._sy)
    };
    const fs = Math.max(11, Math.min(32, Math.sqrt(items.length) * 4 * labelScale));
    const measured = measureText(label, fs, "bold");
    allLabels.push({
      type: "label",
      key: label,
      x: center.x,
      y: center.y,
      w: measured.w + fs * 0.5,
      h: measured.h + 4,
      color: colorvariation(d3Lib, baseColor, 0, 0.2, -0.4),
      fs,
      bigLabel
    });
  }
  const bigClusters = d3Lib.groups(data, (d) => d.bigLabel);
  const pillFs = Math.max(12, 16 * labelScale);
  for (const [bigLabel, items] of bigClusters) {
    if (items.length < 3) continue;
    const baseColor = getColorByLabel(null, bigLabel);
    const denseCenter = findDenseCenter(items, "_sx", "_sy");
    const measured = measureText(bigLabel, pillFs, "bold");
    const pillW = measured.w + pillFs * 4;
    const pillH = pillFs + 16;
    allLabels.push({
      type: "bigLabel",
      key: bigLabel,
      x: denseCenter.x,
      y: denseCenter.y,
      w: pillW,
      h: pillH,
      color: colorvariation(d3Lib, baseColor, 0, 0.1, -0.15),
      fs: pillFs,
      bigLabel
    });
  }
  allLabels.forEach((lb) => {
    lb._ox = lb.x;
    lb._oy = lb.y;
  });
  for (let iter = 0; iter < 200; iter++) {
    let anyOverlap = false;
    for (let i = 0; i < allLabels.length; i++) {
      for (let j = i + 1; j < allLabels.length; j++) {
        const a = allLabels[i], b = allLabels[j];
        const padX = 8, padY = 6;
        const ox = (a.w + b.w) / 2 + padX - Math.abs(a.x - b.x);
        const oy = (a.h + b.h) / 2 + padY - Math.abs(a.y - b.y);
        if (ox > 0 && oy > 0) {
          anyOverlap = true;
          const aMove = a.type === "bigLabel" ? 0.1 : 0.9;
          const bMove = b.type === "bigLabel" ? 0.1 : 0.9;
          const total = aMove + bMove;
          if (oy <= ox) {
            const push = oy / 2 + 1;
            const sign = a.y <= b.y ? 1 : -1;
            a.y -= sign * push * bMove / total;
            b.y += sign * push * aMove / total;
          } else {
            const push = ox / 2 + 1;
            const sign = a.x <= b.x ? 1 : -1;
            a.x -= sign * push * bMove / total;
            b.x += sign * push * aMove / total;
          }
        }
      }
    }
    for (const lb of allLabels) {
      const str = lb.type === "bigLabel" ? 0.05 : 0.02;
      lb.x += (lb._ox - lb.x) * str;
      lb.y += (lb._oy - lb.y) * str;
    }
    if (!anyOverlap) break;
  }
  for (const lb of allLabels) {
    if (lb.y - lb.h / 2 < ceilingY) lb.y = ceilingY + lb.h / 2;
    if (lb.y + lb.h / 2 > floorY) lb.y = floorY - lb.h / 2;
    if (lb.x - lb.w / 2 < margin.left) lb.x = margin.left + lb.w / 2;
    if (lb.x + lb.w / 2 > width - margin.right) lb.x = width - margin.right - lb.w / 2;
  }
  const labelGroup = svg.append("g").attr("class", "cluster-labels");
  for (const lb of allLabels.filter((l) => l.type === "label")) {
    labelGroup.append("text").attr("x", lb.x).attr("y", lb.y).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("font-size", lb.fs).attr("font-weight", "bold").attr("fill", lb.color).attr("stroke", "#ffffffcc").attr("stroke-width", Math.max(3, lb.fs / 4)).attr("paint-order", "stroke").attr("pointer-events", "none").text(lb.key);
  }
  const bigLabelGroup = svg.append("g").attr("class", "big-labels");
  for (const lb of allLabels.filter((l) => l.type === "bigLabel")) {
    bigLabelGroup.append("rect").attr("x", lb.x - lb.w / 2).attr("y", lb.y - lb.h / 2).attr("width", lb.w).attr("height", lb.h).attr("rx", lb.h / 2).attr("ry", lb.h / 2).attr("fill", lb.color).attr("opacity", 0.85);
    bigLabelGroup.append("text").attr("x", lb.x).attr("y", lb.y).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("font-size", lb.fs).attr("font-weight", "700").attr("fill", "#fff").attr("pointer-events", "none").text(lb.key);
  }
  if (hasDate && validDateData.length > 0) {
    const tlTop = cloudHeight + 30;
    const tlBottom = cloudHeight + densityHeight - 5;
    const timeExtent = d3Lib.extent(validDateData, (d) => d._date);
    const timeScale = d3Lib.scaleTime().domain(timeExtent).range([margin.left, width - margin.right]);
    const daySpan = (timeExtent[1] - timeExtent[0]) / (1e3 * 60 * 60 * 24);
    const thresholdCount = Math.max(10, Math.min(60, Math.round(daySpan / 7)));
    const bins = d3Lib.bin().value((d) => d._date.getTime()).domain([timeExtent[0].getTime(), timeExtent[1].getTime()]).thresholds(thresholdCount);
    const binned = bins(validDateData);
    const yTl = d3Lib.scaleLinear().domain([0, d3Lib.max(binned, (d) => d.length)]).range([tlBottom, tlTop]);
    const area = d3Lib.area().x((d) => timeScale(new Date((d.x0 + d.x1) / 2))).y0(tlBottom).y1((d) => yTl(d.length)).curve(d3Lib.curveBasis);
    svg.append("path").attr("d", area(binned)).attr("fill", "#d0d0d088").attr("stroke", "#aaa").attr("stroke-width", 0.5);
    svg.append("g").attr("transform", `translate(0, ${tlBottom})`).call(
      d3Lib.axisBottom(timeScale).ticks(d3Lib.timeMonth.every(daySpan > 365 ? 2 : 1)).tickFormat(d3Lib.timeFormat("%b\n%Y"))
    ).call((g) => g.select(".domain").attr("stroke", "#999")).call((g) => g.selectAll(".tick line").attr("stroke", "#ccc")).call((g) => g.selectAll(".tick text").attr("fill", "#666").attr("font-size", 11));
  }
  if (title || caption) {
    const titleY = height - titleAreaH + 15;
    if (title) {
      svg.append("text").attr("x", width / 2).attr("y", titleY).attr("text-anchor", "middle").attr("font-size", 16).attr("font-weight", "bold").attr("fill", "#333").text(title);
    }
    if (caption) {
      svg.append("text").attr("x", width / 2).attr("y", titleY + 22).attr("text-anchor", "middle").attr("font-size", 13).attr("fill", "#666").text(caption);
    }
  }
  container.appendChild(svg.node());
  return svg.node();
}
export {
  CLUSTER_COLORS,
  colorvariation,
  createTimelineCloud,
  detectDateKey
};
