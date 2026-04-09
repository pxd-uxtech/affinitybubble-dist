// bubble-compare-library.js
var CLUSTER_COLORS = "#8fb1d0,#ffdd7b,#f27a65,#99ab8e,#b3998a,#fba25e,#d9d6b8,#98d5cc,#f3bd97,#bc989c,#9ab9ab,#bf9697,#95a0c4,#c79796,#cec193,#9aa6c4,#aec19f,#d59e92,#f5cb84,#dea091,#a1bcc7,#cba9a0,#c2d1a5,#b2c4bc,#e3ad99,#adc8cb,#a4bed6,#c9bcb1,#d7b2a8,#adbfd3".split(",");
function colorvariation(d3, color, hue, saturation, light) {
  let c = d3.hsl(color);
  c.h += hue;
  c.s += saturation;
  c.l += light;
  return c.formatHex();
}
function sortFunc(d3) {
  return (key, reverse) => (a, b) => {
    const orderFunc = reverse ? d3.ascending : d3.descending;
    if (!key) return orderFunc(a[1].length, b[1].length);
    return orderFunc(a[key], b[key]);
  };
}
function guessCategoryKeys(cols, data, d3) {
  if (!cols || !cols.length) return [];
  if (!data || !data.length) return [];
  const excludeKeys = /* @__PURE__ */ new Set([
    "text",
    "\uD14D\uC2A4\uD2B8",
    "textid",
    "embed",
    "cluster",
    "label",
    "bigLabel",
    "bigCluster",
    "bigClusterOrder",
    "cluster_keywords",
    "x",
    "y",
    "cellPos",
    "size",
    "bubbleSize",
    "\uAC00\uC911\uCE58"
  ]);
  return cols.filter((key) => !excludeKeys.has(key)).map((key) => ({
    key,
    uniqueCount: new Set(data.filter((d) => d[key] != null && String(d[key]).trim()).map((d) => d[key])).size
  })).filter((d) => d.uniqueCount >= 2 && d.uniqueCount <= 20).sort((a, b) => a.uniqueCount - b.uniqueCount).map((d) => d.key);
}
function detectDateColumns(cols, data) {
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    // 2025-03-12
    /^\d{4}\/\d{2}\/\d{2}/,
    // 2025/03/12
    /^\d{4}\.\d{2}\.\d{2}/,
    // 2025.03.12
    /^\d{4}-\d{2}-\d{2}T/
    // ISO format
  ];
  return cols.filter((key) => {
    const samples = data.slice(0, 50).map((d) => d[key]).filter(Boolean);
    if (samples.length < 5) return false;
    const matchCount = samples.filter(
      (v) => datePatterns.some((p) => p.test(String(v)))
    ).length;
    return matchCount / samples.length >= 0.7;
  });
}
function parseDateValue(val) {
  if (!val) return null;
  const str = String(val);
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
function getWeekLabel(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 864e5 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
function getMonthLabel(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function computeDateGroupInfo(data, dateCol) {
  const dates = data.map((d) => parseDateValue(d[dateCol])).filter(Boolean);
  if (dates.length === 0) return { months: 0, weeks: 0 };
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const diffDays = (maxDate - minDate) / (1e3 * 60 * 60 * 24);
  const weeks = Math.ceil(diffDays / 7);
  const months = new Set(dates.map((d) => getMonthLabel(d))).size;
  return { months, weeks };
}
function addDateGroupColumn(data, dateCol, mode) {
  return data.map((d) => {
    const date = parseDateValue(d[dateCol]);
    const groupValue = date ? mode === "weekly" ? getWeekLabel(date) : getMonthLabel(date) : null;
    return { ...d, [`${dateCol}_${mode === "weekly" ? "\uC8FC\uBCC4" : "\uC6D4\uBCC4"}`]: groupValue };
  });
}
function makeStackedData(d3, wideData, keys, categoryKey) {
  const _sortFunc = sortFunc(d3);
  const grouped = wideData.map(
    (d) => keys.map((key) => ({
      ageGroup: d[categoryKey],
      artist: key,
      percent: parseFloat(d[key]) || 0.1
    })).sort(_sortFunc("percent")).map((d2, i) => ({ ...d2, order: i }))
  );
  const chartData = grouped.map(
    (age, groupOrder) => ["start", "end"].map(
      (pos) => age.map((d, i, arr) => ({
        ...d,
        stack: d3.sum(arr.slice(0, i), (t) => t.percent),
        groupOrder,
        pos
      }))
    )
  ).flat().flat();
  return chartData;
}
function computeItemCompare(d3, clusterWithLabel, selCategoryKey) {
  const bigLabels = [...new Set(clusterWithLabel.map((d) => d.bigLabel))];
  const _sortFunc = sortFunc(d3);
  const items = d3.groups(clusterWithLabel, (d) => d[selCategoryKey]).filter(([item]) => item != null && String(item).trim()).sort((a, b) => d3.ascending(String(a[0]), String(b[0]))).map(([item, data]) => {
    const total = data.length;
    return bigLabels.map((bigLabel) => ({
      item: String(item),
      bigLabel,
      count: data.filter((d) => d.bigLabel === bigLabel).length,
      ratio: data.filter((d) => d.bigLabel === bigLabel).length / total
    })).sort(_sortFunc("ratio")).map((d, i) => ({ order: i + 1, ...d }));
  });
  return items;
}
function computeItemWide(itemCompare) {
  return itemCompare.map((d) => ({
    item: d[0].item,
    ...Object.fromEntries(d.map(({ bigLabel, ratio }) => [bigLabel, ratio * 100]))
  }));
}
function drawBumpChart(d3, Plot, chartData, options = {}) {
  const {
    width = 1100,
    height = 600,
    title = "",
    showPercent = true,
    colorRange = CLUSTER_COLORS,
    domain = [],
    ratioData = null
    // [{category, count, ratio}]
  } = options;
  const max = d3.max(chartData, (d) => d.percent);
  const padding = max >= 20 ? 1 : 0.5;
  const groupLabel = chartData.filter((d) => d.stack == 0 && d.pos === "start");
  const _sortFunc = sortFunc(d3);
  const used = d3.groups(chartData, (d) => d.artist).map(([artist, data2]) => ({
    artist,
    max: d3.max(data2, (d) => d.percent),
    groupMin: d3.min(data2.filter((d) => d.percent > 0.1), (d) => d.groupOrder),
    groupMax: d3.max(data2.filter((d) => d.percent > 0.1), (d) => d.groupOrder)
  })).filter((d) => d.max >= 1);
  const usedMap = new Map(used.map((d) => [d.artist, d]));
  const artistOrder = d3.groups(chartData, (d) => d.artist).map(([artist, data2]) => ({ artist, sum: d3.sum(data2, (t) => t.percent) })).sort(_sortFunc("sum")).map((d) => d.artist);
  const colorMap = (artist) => {
    const map = new Map(domain.map((d, i) => [d, colorRange[i] || "#eee"]));
    return map.get(artist) ?? "#eee";
  };
  const data = chartData.filter((d) => used.map((u) => u.artist).includes(d.artist)).filter(
    (d) => d.groupOrder >= (usedMap.get(d.artist)?.groupMin ?? 0) && d.groupOrder <= (usedMap.get(d.artist)?.groupMax ?? 999) || d.percent > 0.2
  );
  const colWidth = 120;
  const fontScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.percent)).range([9, 25]);
  const marginLeft = 40;
  const marginRight = 20;
  const nGroups = ratioData ? ratioData.length : d3.max(data, (d) => d.groupOrder) + 1;
  const xDomain = [0, (nGroups - 1) * colWidth * 1.3 + colWidth];
  const bumpPlot = Plot.plot({
    title,
    width,
    height,
    marginTop: 30,
    marginBottom: 5,
    marginLeft,
    marginRight,
    insetLeft: 5,
    color: { scheme: "Tableau10", domain: artistOrder },
    y: { reverse: true, ticks: 5, label: "" },
    x: { ticks: [], domain: xDomain },
    marks: [
      Plot.areaY(data, {
        x: (d) => d.groupOrder * colWidth * 1.3 + (d.pos === "end" ? colWidth : 0),
        y: "stack",
        y2: (d) => d.stack + d.percent - (d.percent > 5 ? padding : d.percent < 1 ? 0.1 : padding),
        stroke: (d) => domain.length ? colorMap(d.artist) : d.artist,
        fill: (d) => domain.length ? colorMap(d.artist) : d.artist,
        z: "artist",
        fillOpacity: 0.4,
        curve: "monotone-x"
      }),
      Plot.text(data, {
        filter: (d) => d.pos === "start",
        x: (d) => d.groupOrder * colWidth * 1.3 + colWidth / 2,
        dy: -2,
        y: (d) => d.stack + d.percent / 2,
        text: "artist",
        fill: (d) => domain.length ? colorvariation(d3, colorMap(d.artist), 0, -0.2, -0.4) : "#444",
        fillOpacity: (d) => d.percent < 1 ? 0 : 1,
        strokeOpacity: (d) => d.percent < 1 ? 0 : 1,
        fontSize: (d) => fontScale(d.percent),
        stroke: "#fff8",
        tip: true,
        title: (d) => `${d.artist}
${d.percent.toFixed(1)}%`
      }),
      Plot.text(data, {
        filter: (d) => showPercent && d.pos === "start" && d.percent >= 5,
        x: (d) => d.groupOrder * colWidth * 1.3 + colWidth / 2,
        dy: 2,
        y: (d) => d.stack + d.percent * 2 / 3,
        text: (d) => d3.format(".0%")(d.percent / 100),
        fill: (d) => domain.length ? colorvariation(d3, colorMap(d.artist), 0, -0.1, -0.2) : "#666",
        fillOpacity: (d) => d.percent < 1 ? 0 : 1,
        fontSize: (d) => fontScale(d.percent) * 0.6
      })
    ]
  });
  if (!ratioData || !ratioData.length) return bumpPlot;
  const bumpXScale = bumpPlot.scale("x");
  const svgEl = bumpPlot.querySelector("svg");
  const origH = +svgEl.getAttribute("height");
  const ratioAreaH = 160;
  const newH = origH + ratioAreaH;
  svgEl.setAttribute("height", newH);
  svgEl.setAttribute("viewBox", `0 0 ${width} ${newH}`);
  const ratioG = d3.select(svgEl).append("g").attr("transform", `translate(0, ${origH + 25})`);
  const barAreaH = ratioAreaH - 65;
  const maxRatio = d3.max(ratioData, (d) => d.ratio);
  const yScale = d3.scaleLinear().domain([0, maxRatio * 1.2]).nice().range([barAreaH, 0]);
  const xLeft = bumpXScale.apply(0);
  const xRight = bumpXScale.apply(xDomain[1]);
  ratioG.append("line").attr("x1", xLeft).attr("x2", xRight).attr("y1", barAreaH).attr("y2", barAreaH).attr("stroke", "#ccc");
  ratioData.forEach((d, i) => {
    const x1 = bumpXScale.apply(i * colWidth * 1.3);
    const x2 = bumpXScale.apply(i * colWidth * 1.3 + colWidth);
    const barH = barAreaH - yScale(d.ratio);
    const y = yScale(d.ratio);
    const cx = (x1 + x2) / 2;
    ratioG.append("rect").attr("x", x1).attr("y", y).attr("width", x2 - x1).attr("height", barH).attr("fill", "#8882").attr("stroke", "#888a");
    ratioG.append("text").attr("x", cx).attr("y", y - 4).attr("text-anchor", "middle").attr("font-size", 14).attr("fill", "#444").text(Math.round(d.ratio * 100) + "%");
    ratioG.append("text").attr("x", cx).attr("y", y - 20).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", "#4448").text(d.count);
    ratioG.append("text").attr("x", cx).attr("y", barAreaH + 22).attr("text-anchor", "middle").attr("font-size", 17).attr("font-weight", "500").attr("fill", "#444").text(d.category);
  });
  return bumpPlot;
}
function drawRatioChart(d3, Plot, clusterWithLabel, selCategoryKey) {
  const total = clusterWithLabel.length;
  const categories = [...new Set(
    clusterWithLabel.filter((d) => d[selCategoryKey] != null && String(d[selCategoryKey]).trim()).map((d) => d[selCategoryKey])
  )];
  const data = categories.map((category) => ({
    category: String(category),
    count: clusterWithLabel.filter((d) => d[selCategoryKey] === category).length,
    ratio: clusterWithLabel.filter((d) => d[selCategoryKey] === category).length / total
  }));
  return Plot.plot({
    y: { percent: true, nice: true, label: "" },
    height: 150,
    width: 1100,
    marginTop: 30,
    marginLeft: 80,
    x: { label: null, type: "band" },
    marks: [
      Plot.barY(data, {
        x: "category",
        y: "ratio",
        fill: "#8882",
        stroke: "#888a"
      }),
      Plot.text(data, {
        x: "category",
        y: "ratio",
        dy: -10,
        text: (d) => d3.format(".0%")(d.ratio),
        fontSize: 15,
        fill: "#444"
      }),
      Plot.text(data, {
        x: "category",
        y: "ratio",
        dy: -25,
        text: (d) => `${d.count}`,
        fontSize: 12,
        fill: "#4448"
      }),
      Plot.ruleY([0], { stroke: "#4444" })
    ]
  });
}
function renderSmallMultiples(d3, VoronoiTreemap, clusterWithLabel, selCategoryKey, options = {}) {
  const { width = 500, height = 380, colors, regionColors } = options;
  const categories = d3.groups(clusterWithLabel, (d) => d[selCategoryKey]).filter(([item]) => item != null && String(item).trim()).sort((a, b) => d3.ascending(String(a[0]), String(b[0])));
  const container = document.createElement("div");
  container.style.cssText = "display:flex;flex-wrap:wrap;gap:15px;";
  for (const [categoryValue, data] of categories) {
    const treemapData = data.map((d) => ({
      region: d.bigLabel ?? String(d.bigCluster ?? d.cluster),
      bigClusterLabel: d.label ?? String(d.cluster),
      clusterLabel: (d.text || "").replace(/\n/g, " ").slice(0, 20),
      bubbleSize: d.size || 1,
      data: d
    }));
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display:flex;flex-direction:column;align-items:center;";
    const label = document.createElement("div");
    label.textContent = String(categoryValue);
    label.style.cssText = "font-weight:700;font-size:14px;color:#444;margin-bottom:4px;font-family:'KoddiUD OnGothic',sans-serif;";
    wrapper.appendChild(label);
    const countLabel = document.createElement("div");
    countLabel.textContent = `${data.length}`;
    countLabel.style.cssText = "font-size:12px;color:#888;margin-bottom:8px;";
    wrapper.appendChild(countLabel);
    try {
      const treemap = new VoronoiTreemap();
      const svg = treemap.render(treemapData, {
        width,
        height,
        showRegion: true,
        showLabel: true,
        showPercent: true,
        pebble: true,
        pebbleRound: 5,
        pebbleWidth: 2,
        regionPositions: "auto",
        ...colors ? { colors } : {},
        ...regionColors ? { regionColors } : {}
      });
      wrapper.appendChild(svg);
    } catch (e) {
      const errDiv = document.createElement("div");
      errDiv.textContent = `Rendering error: ${e.message}`;
      errDiv.style.cssText = "color:#e53e3e;font-size:12px;padding:20px;";
      wrapper.appendChild(errDiv);
    }
    container.appendChild(wrapper);
  }
  return container;
}
function getCompareStyles() {
  return `
    .bubble-compare-container {
      font-family: 'KoddiUD OnGothic', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 1200px;
    }
    .bubble-compare-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px 20px;
      background: #f8f8f6;
      border-radius: 10px;
    }
    .bubble-compare-selector label {
      font-size: 14px;
      font-weight: 700;
      color: #444;
    }
    .bubble-compare-selector select {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      background: #fff;
      cursor: pointer;
    }
    .bubble-compare-section {
      margin: 24px 0;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 10px;
      padding: 20px;
    }
    .bubble-compare-section h3 {
      font-size: 16px;
      font-weight: 700;
      color: #444;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .bubble-compare-empty {
      padding: 40px;
      text-align: center;
      color: #888;
      font-size: 14px;
    }
    .bubble-compare-date-radio {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }
    .bubble-compare-date-radio[hidden] {
      display: none;
    }
    .bubble-compare-date-radio__item {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #444;
    }
  `;
}
function createBubbleCompare(container, clusterWithLabel, options = {}) {
  const {
    d3: d3Lib,
    Plot: PlotLib,
    VoronoiTreemap: VTClass,
    colors,
    regionColors,
    smallMultipleWidth = 500,
    smallMultipleHeight = 380,
    bumpChartWidth = 1100,
    bumpChartHeight = 600,
    onChange,
    onSelectorCreated,
    onDateRadioCreated
  } = options;
  if (!d3Lib) throw new Error("d3 is required");
  if (!PlotLib) throw new Error("Plot is required");
  if (!document.querySelector("#bubble-compare-styles")) {
    const style = document.createElement("style");
    style.id = "bubble-compare-styles";
    style.textContent = getCompareStyles();
    document.head.appendChild(style);
  }
  const allCols = Object.keys(clusterWithLabel[0] || {});
  const categoryKeys = guessCategoryKeys(allCols, clusterWithLabel, d3Lib);
  const dateColumns = detectDateColumns(allCols, clusterWithLabel);
  const dateColumnInfo = {};
  for (const dc of dateColumns) {
    dateColumnInfo[dc] = computeDateGroupInfo(clusterWithLabel, dc);
  }
  const dateColNameSet = new Set(dateColumns.map((dc) => dc.toLowerCase()));
  dateColNameSet.add("date");
  const filteredCategoryKeys = dateColumns.length > 0 ? categoryKeys.filter((k) => !dateColNameSet.has(k.toLowerCase())) : categoryKeys;
  let activeData = clusterWithLabel;
  container.innerHTML = "";
  const root = document.createElement("div");
  root.className = "bubble-compare-container";
  const selectorDiv = document.createElement("div");
  selectorDiv.className = "bubble-compare-selector";
  const selectorLabel = document.createElement("label");
  selectorLabel.textContent = "\uBE44\uAD50 \uBC94\uC8FC \uC120\uD0DD";
  const select = document.createElement("select");
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "\uC120\uD0DD\uD558\uC138\uC694";
  select.appendChild(defaultOption);
  for (const key of filteredCategoryKeys) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    select.appendChild(opt);
  }
  for (const dc of dateColumns) {
    const opt = document.createElement("option");
    opt.value = `__date__${dc}`;
    opt.textContent = `${dc} (\uB0A0\uC9DC)`;
    select.appendChild(opt);
  }
  selectorDiv.appendChild(selectorLabel);
  selectorDiv.appendChild(select);
  const dateRadioDiv = document.createElement("div");
  dateRadioDiv.className = "bubble-compare-date-radio";
  dateRadioDiv.hidden = true;
  selectorDiv.appendChild(dateRadioDiv);
  if (typeof onSelectorCreated === "function") {
    try {
      onSelectorCreated(selectorDiv);
    } catch (e) {
      console.warn("onSelectorCreated:", e);
    }
  }
  if (typeof onDateRadioCreated === "function") {
    try {
      onDateRadioCreated(dateRadioDiv);
    } catch (e) {
      console.warn("onDateRadioCreated:", e);
    }
  }
  root.appendChild(selectorDiv);
  const chartArea = document.createElement("div");
  root.appendChild(chartArea);
  container.appendChild(root);
  function setupDateRadio(dateCol) {
    dateRadioDiv.innerHTML = "";
    const info = dateColumnInfo[dateCol];
    if (!info) {
      dateRadioDiv.hidden = true;
      return;
    }
    const hasWeekly = info.weeks <= 20;
    if (!hasWeekly) {
      dateRadioDiv.hidden = true;
      return;
    }
    const headerLabel = document.createElement("label");
    headerLabel.className = "bubble-compare-date-radio__header";
    headerLabel.textContent = "\uB2E8\uC704\uAE30\uAC04 :";
    dateRadioDiv.appendChild(headerLabel);
    const modes = [
      { value: "monthly", label: "\uC6D4\uBCC4" },
      { value: "weekly", label: "\uC8FC\uBCC4" }
    ];
    for (const mode of modes) {
      const label = document.createElement("label");
      label.className = "bubble-compare-date-radio__item";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "bubble-compare-date-mode";
      radio.value = mode.value;
      if (mode.value === "monthly") radio.checked = true;
      radio.addEventListener("change", () => {
        const groupKey = applyDateGroup(dateCol, mode.value);
        renderCharts(groupKey);
        if (onChange) onChange(groupKey);
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(mode.label));
      dateRadioDiv.appendChild(label);
    }
    dateRadioDiv.hidden = false;
  }
  function applyDateGroup(dateCol, mode) {
    activeData = addDateGroupColumn(clusterWithLabel, dateCol, mode);
    const groupKey = `${dateCol}_${mode === "weekly" ? "\uC8FC\uBCC4" : "\uC6D4\uBCC4"}`;
    return groupKey;
  }
  function renderCharts(selKey) {
    chartArea.innerHTML = "";
    if (!selKey) {
      chartArea.innerHTML = `<div class="bubble-compare-empty">\uBE44\uAD50\uD560 \uCEEC\uB7FC\uC744 \uC120\uD0DD\uD558\uC138\uC694</div>`;
      return;
    }
    const dataToUse = activeData;
    const bigLabels = [...new Set(dataToUse.map((d) => d.bigLabel))];
    const cardColors = colors || CLUSTER_COLORS;
    const bumpSection = document.createElement("div");
    bumpSection.className = "bubble-compare-section";
    const bumpTitle = document.createElement("h3");
    bumpTitle.textContent = `\uC774\uC288 x [${selKey}] \uAD50\uCC28 \uBD84\uC11D`;
    bumpSection.appendChild(bumpTitle);
    try {
      const itemCompare = computeItemCompare(d3Lib, dataToUse, selKey);
      if (itemCompare.length > 0) {
        const itemWide = computeItemWide(itemCompare);
        const compareData = makeStackedData(
          d3Lib,
          itemWide,
          itemCompare[0].map((d) => d.bigLabel),
          "item"
        );
        const total = dataToUse.length;
        const categories = itemCompare.map((d) => d[0].item);
        const ratioData = categories.map((category) => ({
          category: String(category),
          count: dataToUse.filter((d) => String(d[selKey]) === String(category)).length,
          ratio: dataToUse.filter((d) => String(d[selKey]) === String(category)).length / total
        }));
        let bumpColorRange = cardColors.map((c) => colorvariation(d3Lib, c, 0, 0, -0.2));
        if (regionColors && regionColors.length) {
          const rcMap = new Map(regionColors.map((rc) => [rc.key, rc.color]));
          bumpColorRange = bigLabels.map(
            (bl, i) => rcMap.get(bl) || cardColors[i] || CLUSTER_COLORS[i]
          );
        }
        const bumpChart = drawBumpChart(d3Lib, PlotLib, compareData, {
          width: bumpChartWidth,
          height: bumpChartHeight,
          showPercent: true,
          colorRange: bumpColorRange,
          domain: bigLabels,
          title: "",
          ratioData
        });
        bumpSection.appendChild(bumpChart);
      }
    } catch (e) {
      bumpSection.innerHTML += `<div style="color:#e53e3e">Bump chart error: ${e.message}</div>`;
    }
    chartArea.appendChild(bumpSection);
    if (VTClass) {
      const smSection = document.createElement("div");
      smSection.className = "bubble-compare-section";
      const smTitle = document.createElement("h3");
      smTitle.textContent = `\uC774\uC288 x [${selKey}] Small Multiples`;
      smSection.appendChild(smTitle);
      try {
        const smChart = renderSmallMultiples(
          d3Lib,
          VTClass,
          dataToUse,
          selKey,
          {
            width: smallMultipleWidth,
            height: smallMultipleHeight,
            colors: cardColors,
            regionColors
          }
        );
        smSection.appendChild(smChart);
      } catch (e) {
        smSection.innerHTML += `<div style="color:#e53e3e">Small multiples error: ${e.message}</div>`;
      }
      chartArea.appendChild(smSection);
    }
  }
  select.addEventListener("change", () => {
    const val = select.value;
    if (val.startsWith("__date__")) {
      const dateCol = val.replace("__date__", "");
      setupDateRadio(dateCol);
      const groupKey = applyDateGroup(dateCol, "monthly");
      renderCharts(groupKey);
      if (onChange) onChange(groupKey);
    } else {
      dateRadioDiv.hidden = true;
      dateRadioDiv.innerHTML = "";
      activeData = clusterWithLabel;
      renderCharts(val);
      if (onChange) onChange(val);
    }
  });
  if (dateColumns.length > 0) {
    select.value = `__date__${dateColumns[0]}`;
    setupDateRadio(dateColumns[0]);
    const groupKey = applyDateGroup(dateColumns[0], "monthly");
    renderCharts(groupKey);
  } else if (filteredCategoryKeys.length > 0) {
    select.value = filteredCategoryKeys[0];
    renderCharts(filteredCategoryKeys[0]);
  }
  return {
    select,
    setColumn(key) {
      select.value = key;
      renderCharts(key);
    },
    refresh() {
      renderCharts(select.value);
    },
    getCategoryKeys() {
      return categoryKeys;
    }
  };
}
function getCompareColumns(clusterWithLabel) {
  if (!clusterWithLabel || !clusterWithLabel.length) {
    return { categoryKeys: [], dateColumns: [] };
  }
  const allCols = Object.keys(clusterWithLabel[0] || {});
  const categoryKeys = guessCategoryKeys(allCols, clusterWithLabel);
  const dateCols = detectDateColumns(allCols, clusterWithLabel);
  const dateColumns = dateCols.map((key) => {
    const info = computeDateGroupInfo(clusterWithLabel, key);
    return { key, monthSpan: info.months, weekSpan: info.weeks };
  });
  const dateColNameSet = new Set(dateCols.map((dc) => dc.toLowerCase()));
  dateColNameSet.add("date");
  const filtered = dateColumns.length > 0 ? categoryKeys.filter((k) => !dateColNameSet.has(k.toLowerCase())) : categoryKeys;
  return { categoryKeys: filtered, dateColumns };
}
export {
  createBubbleCompare,
  drawBumpChart,
  drawRatioChart,
  getCompareColumns,
  getCompareStyles,
  guessCategoryKeys,
  makeStackedData,
  renderSmallMultiples
};
