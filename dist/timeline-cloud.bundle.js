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
  const keys = Object.keys(data[0] || {});
  for (const key of keys) {
    const samples = data.slice(0, 50).map((d) => d[key]).filter(Boolean);
    if (samples.length < 5) continue;
    if (samples.filter((v) => datePatterns.some((p) => p.test(String(v)))).length / samples.length >= 0.7)
      return key;
  }
  return null;
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
  const radius = 50;
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
    regionColors,
    title = "",
    caption = "",
    showText = true,
    maxTextLength = 15,
    hullPadding = 18,
    densityHeight = 80,
    margin = { top: 20, right: 50, bottom: 20, left: 50 },
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
    if (!pos) return null;
    return {
      ...d,
      _px: pos.x,
      _py: pos.y,
      _text: String(textVal).substring(0, maxTextLength),
      _date: dateKey && d[dateKey] ? new Date(String(d[dateKey])) : null,
      _idx: i
    };
  }).filter(Boolean);
  if (data.length === 0) throw new Error("\uC88C\uD45C \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. regionPos \uB610\uB294 labelPos\uB97C \uC804\uB2EC\uD574\uC8FC\uC138\uC694");
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
  const defaultColors = CLUSTER_COLORS;
  let getColorByLabel;
  if (regionColors && regionColors.length) {
    const rcMap = new Map(regionColors.map((rc) => [rc.key, rc.color]));
    getColorByLabel = (label, bigLabel) => labelColorMap.get(label) || rcMap.get(bigLabel) || bigLabelColorMap.get(bigLabel) || (colors || defaultColors)[bigLabelRank.get(bigLabel) || 0] || "#ccc";
  } else {
    getColorByLabel = (label, bigLabel) => labelColorMap.get(label) || bigLabelColorMap.get(bigLabel) || (colors || defaultColors)[bigLabelRank.get(bigLabel) || 0] || "#ccc";
  }
  const titleAreaH = title || caption ? 60 : 10;
  const cloudHeight = height - (hasDate ? densityHeight + 30 : 0) - titleAreaH;
  const xExtent = d3Lib.extent(data, (d) => d._px);
  const xScale = d3Lib.scaleLinear().domain(xExtent).range([margin.left + 40, width - margin.right - 40]);
  const fontSize = 7;
  data.forEach((d) => {
    d._targetX = xScale(d._px);
    d._radius = Math.max(8, d._text.length * fontSize * 0.35);
  });
  const floorY = cloudHeight - 10;
  const simulation = d3Lib.forceSimulation(data).force("x", d3Lib.forceX((d) => d._targetX).strength(0.8)).force("y", d3Lib.forceY(floorY).strength(0.05)).force("collide", d3Lib.forceCollide((d) => d._radius).strength(0.7).iterations(3)).force("floor", () => {
    for (const d of data) {
      if (d.y > floorY) d.y = floorY;
      if (d.y < margin.top + 10) d.y = margin.top + 10;
      if (d.x < margin.left + 10) d.x = margin.left + 10;
      if (d.x > width - margin.right - 10) d.x = width - margin.right - 10;
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
    const fillColor = colorvariation(d3Lib, baseColor, 0, -0.15, 0.2);
    const strokeColor = colorvariation(d3Lib, baseColor, 0, 0, -0.1);
    if (items.length < 3) {
      const cx = d3Lib.mean(items, (d) => d._sx);
      const cy = d3Lib.mean(items, (d) => d._sy);
      hullGroup.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 12 + items.length * 4).attr("fill", fillColor).attr("stroke", strokeColor).attr("stroke-width", 0.5).attr("opacity", 0.5);
      continue;
    }
    const points = items.map((d) => [d._sx, d._sy]);
    const hull = d3Lib.polygonHull(points);
    if (!hull) continue;
    const expanded = expandHull(hull, hullPadding);
    const path = d3Lib.line().curve(d3Lib.curveCatmullRomClosed.alpha(0.5))(expanded);
    hullGroup.append("path").attr("d", path).attr("fill", fillColor).attr("stroke", strokeColor).attr("stroke-width", 0.5).attr("opacity", 0.5);
  }
  if (showText) {
    const textGroup = svg.append("g").attr("class", "cloud-items");
    textGroup.selectAll("text").data(data).join("text").attr("x", (d) => d._sx).attr("y", (d) => d._sy).attr("font-size", 7).attr("fill", (d) => colorvariation(d3Lib, getColorByLabel(d.label, d.bigLabel), 0, 0.1, -0.35)).attr("text-anchor", "start").attr("dominant-baseline", "middle").attr("pointer-events", onClick ? "all" : "none").attr("cursor", onClick ? "pointer" : "default").text((d) => d._text).on("click", onClick ? (event, d) => onClick({ data: d, event }) : null);
  }
  const labelGroup = svg.append("g").attr("class", "cluster-labels");
  for (const [label, items] of subClusters) {
    if (items.length < 2) continue;
    const bigLabel = items[0].bigLabel;
    const baseColor = getColorByLabel(label, bigLabel);
    const center = findDenseCenter(items, "_sx", "_sy");
    const fontSize2 = Math.max(9, Math.min(24, Math.sqrt(items.length) * 3));
    labelGroup.append("text").attr("x", center.x).attr("y", center.y).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("font-size", fontSize2).attr("font-weight", "bold").attr("fill", colorvariation(d3Lib, baseColor, 0, 0.2, -0.4)).attr("stroke", "#ffffffcc").attr("stroke-width", Math.max(2, fontSize2 / 5)).attr("paint-order", "stroke").attr("pointer-events", "none").text(label);
  }
  if (hasDate && validDateData.length > 0) {
    const tlTop = cloudHeight + 15;
    const tlBottom = cloudHeight + densityHeight - 5;
    const timeExtent = d3Lib.extent(validDateData, (d) => d._date);
    const timeScale = d3Lib.scaleTime().domain(timeExtent).range([margin.left, width - margin.right]);
    const daySpan = (timeExtent[1] - timeExtent[0]) / (1e3 * 60 * 60 * 24);
    const thresholdCount = Math.max(10, Math.min(60, Math.round(daySpan / 7)));
    const bins = d3Lib.bin().value((d) => d._date.getTime()).domain([timeExtent[0].getTime(), timeExtent[1].getTime()]).thresholds(thresholdCount);
    const binned = bins(validDateData);
    const yTl = d3Lib.scaleLinear().domain([0, d3Lib.max(binned, (d) => d.length)]).range([tlBottom, tlTop]);
    const area = d3Lib.area().x((d) => timeScale(new Date((d.x0 + d.x1) / 2))).y0(tlBottom).y1((d) => yTl(d.length)).curve(d3Lib.curveBasis);
    svg.append("path").attr("d", area(binned)).attr("fill", "#d0d0d0").attr("stroke", "#aaa").attr("stroke-width", 0.5);
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
