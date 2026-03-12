/**
 * Bubble Compare Library
 *
 * 계층 분석된 clusterWithLabel 데이터에서 한 컬럼을 기준으로
 * Small Multiples (보로노이 트리맵) + Bump Chart를 그리는 라이브러리
 *
 * Dependencies (CDN):
 * - D3.js v7
 * - Observable Plot
 * - VoronoiTreemap (pxd-uxtech/voronoi-treemap-dist)
 */

const CLUSTER_COLORS = "#8fb1d0,#ffdd7b,#f27a65,#99ab8e,#b3998a,#fba25e,#d9d6b8,#98d5cc,#f3bd97,#bc989c,#9ab9ab,#bf9697,#95a0c4,#c79796,#cec193,#9aa6c4,#aec19f,#d59e92,#f5cb84,#dea091,#a1bcc7,#cba9a0,#c2d1a5,#b2c4bc,#e3ad99,#adc8cb,#a4bed6,#c9bcb1,#d7b2a8,#adbfd3".split(",");

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

// ============================================================
// 비교 컬럼 후보 자동 감지
// ============================================================
function guessCategoryKeys(cols, data, d3) {
  if (!cols || !cols.length) return [];

  // 분석 결과 컬럼 제외
  const excludeKeys = new Set([
    "text", "텍스트", "textid", "embed", "cluster", "label", "bigLabel",
    "bigCluster", "cluster_keywords", "x", "y", "cellPos",
    "size", "bubbleSize", "가중치"
  ]);

  return cols
    .filter(key => !excludeKeys.has(key))
    .map(key => ({
      key,
      uniqueCount: new Set(data.filter(d => d[key] != null && String(d[key]).trim()).map(d => d[key])).size
    }))
    .filter(d => d.uniqueCount >= 2 && d.uniqueCount <= 20)
    .sort((a, b) => a.uniqueCount - b.uniqueCount)
    .map(d => d.key);
}

// ============================================================
// makeStackedData: wide format -> bump chart format
// ============================================================
function makeStackedData(d3, wideData, keys, categoryKey) {
  const _sortFunc = sortFunc(d3);

  const grouped = wideData.map(d =>
    keys
      .map(key => ({
        ageGroup: d[categoryKey],
        artist: key,
        percent: parseFloat(d[key]) || 0.1
      }))
      .sort(_sortFunc("percent"))
      .map((d, i) => ({ ...d, order: i }))
  );

  const chartData = grouped
    .map((age, groupOrder) =>
      ["start", "end"].map(pos =>
        age.map((d, i, arr) => ({
          ...d,
          stack: d3.sum(arr.slice(0, i), t => t.percent),
          groupOrder,
          pos
        }))
      )
    )
    .flat()
    .flat();

  return chartData;
}

// ============================================================
// itemCompare: clusterWithLabel -> 카테고리별 bigLabel 비율 계산
// ============================================================
function computeItemCompare(d3, clusterWithLabel, selCategoryKey) {
  const bigLabels = [...new Set(clusterWithLabel.map(d => d.bigLabel))];
  const _sortFunc = sortFunc(d3);

  const items = d3
    .groups(clusterWithLabel, d => d[selCategoryKey])
    .filter(([item]) => item != null && String(item).trim())
    .sort((a, b) => d3.ascending(String(a[0]), String(b[0])))
    .map(([item, data]) => {
      const total = data.length;
      return bigLabels
        .map(bigLabel => ({
          item: String(item),
          bigLabel,
          count: data.filter(d => d.bigLabel === bigLabel).length,
          ratio: data.filter(d => d.bigLabel === bigLabel).length / total
        }))
        .sort(_sortFunc("ratio"))
        .map((d, i) => ({ order: i + 1, ...d }));
    });

  return items;
}

function computeItemWide(itemCompare) {
  return itemCompare.map(d => ({
    item: d[0].item,
    ...Object.fromEntries(d.map(({ bigLabel, ratio }) => [bigLabel, ratio * 100]))
  }));
}

// ============================================================
// Bump Chart + Ratio Chart 통합 렌더링 (Observable Plot 사용)
// ============================================================
function drawBumpChart(d3, Plot, chartData, options = {}) {
  const {
    width = 1100,
    height = 600,
    title = "",
    showPercent = true,
    colorRange = CLUSTER_COLORS,
    domain = [],
    ratioData = null  // [{category, count, ratio}]
  } = options;

  const max = d3.max(chartData, d => d.percent);
  const padding = max >= 20 ? 1 : 0.5;

  const groupLabel = chartData.filter(d => d.stack == 0 && d.pos === "start");

  const _sortFunc = sortFunc(d3);
  const used = d3
    .groups(chartData, d => d.artist)
    .map(([artist, data]) => ({
      artist,
      max: d3.max(data, d => d.percent),
      groupMin: d3.min(data.filter(d => d.percent > 0.1), d => d.groupOrder),
      groupMax: d3.max(data.filter(d => d.percent > 0.1), d => d.groupOrder)
    }))
    .filter(d => d.max >= 1);

  const usedMap = new Map(used.map(d => [d.artist, d]));

  const artistOrder = d3
    .groups(chartData, d => d.artist)
    .map(([artist, data]) => ({ artist, sum: d3.sum(data, t => t.percent) }))
    .sort(_sortFunc("sum"))
    .map(d => d.artist);

  const colorMap = (artist) => {
    const map = new Map(domain.map((d, i) => [d, colorRange[i] || "#eee"]));
    return map.get(artist) ?? "#eee";
  };

  const data = chartData
    .filter(d => used.map(u => u.artist).includes(d.artist))
    .filter(d =>
      (d.groupOrder >= (usedMap.get(d.artist)?.groupMin ?? 0) &&
        d.groupOrder <= (usedMap.get(d.artist)?.groupMax ?? 999)) ||
      d.percent > 0.2
    );

  const colWidth = 120;
  const fontScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.percent))
    .range([9, 25]);

  // Bump chart (main)
  const bumpPlot = Plot.plot({
    title,
    width,
    height,
    marginTop: 30,
    marginBottom: 5,
    insetLeft: 5,
    color: { scheme: "Tableau10", domain: artistOrder },
    y: { reverse: false, ticks: 5, label: "" },
    x: { ticks: [] },
    marks: [
      Plot.text(groupLabel, {
        x: d => d.groupOrder * colWidth * 1.3 + colWidth / 2,
        y: 0, dy: -15, fontSize: 15, fill: "#444",
        text: "ageGroup"
      }),
      Plot.areaY(data, {
        x: d => d.groupOrder * colWidth * 1.3 + (d.pos === "end" ? colWidth : 0),
        y: "stack",
        y2: d => d.stack + d.percent - (d.percent > 5 ? padding : d.percent < 1 ? 0.1 : padding),
        stroke: d => domain.length ? colorMap(d.artist) : d.artist,
        fill: d => domain.length ? colorMap(d.artist) : d.artist,
        z: "artist",
        fillOpacity: 0.4,
        curve: "monotone-x"
      }),
      Plot.text(data, {
        filter: d => d.pos === "start",
        x: d => d.groupOrder * colWidth * 1.3 + colWidth / 2,
        dy: -2,
        y: d => d.stack + d.percent / 2,
        text: "artist",
        fill: d => domain.length
          ? colorvariation(d3, colorMap(d.artist), 0, -0.2, -0.4)
          : "#444",
        fillOpacity: d => d.percent < 1 ? 0 : 1,
        strokeOpacity: d => d.percent < 1 ? 0 : 1,
        fontSize: d => fontScale(d.percent),
        stroke: "#fff8",
        tip: true,
        title: d => `${d.artist}\n${d.percent.toFixed(1)}%`
      }),
      Plot.text(data, {
        filter: d => showPercent && d.pos === "start" && d.percent >= 5,
        x: d => d.groupOrder * colWidth * 1.3 + colWidth / 2,
        dy: 2,
        y: d => d.stack + (d.percent * 2) / 3,
        text: d => d3.format(".0%")(d.percent / 100),
        fill: d => domain.length
          ? colorvariation(d3, colorMap(d.artist), 0, -0.1, -0.2)
          : "#666",
        fillOpacity: d => d.percent < 1 ? 0 : 1,
        fontSize: d => fontScale(d.percent) * 0.6
      })
    ]
  });

  // ratioData가 없으면 bump chart만 반환
  if (!ratioData || !ratioData.length) return bumpPlot;

  // Ratio chart (하단) - 범프차트 컬럼과 x 위치 정렬
  const ratioPlot = Plot.plot({
    width,
    height: 120,
    marginTop: 15,
    marginBottom: 30,
    marginLeft: bumpPlot.querySelector("svg")?.getAttribute("marginLeft") || 40,
    insetLeft: 5,
    y: { percent: true, nice: true, label: "", ticks: 3 },
    x: { ticks: [], label: null },
    marks: [
      Plot.barY(ratioData, {
        x: d => {
          const idx = ratioData.indexOf(d);
          return idx * colWidth * 1.3 + colWidth / 2;
        },
        y: "ratio",
        fill: "#8882", stroke: "#888a"
      }),
      Plot.text(ratioData, {
        x: (d, i) => i * colWidth * 1.3 + colWidth / 2,
        y: "ratio", dy: -10,
        text: d => d3.format(".0%")(d.ratio),
        fontSize: 14, fill: "#444"
      }),
      Plot.text(ratioData, {
        x: (d, i) => i * colWidth * 1.3 + colWidth / 2,
        y: "ratio", dy: -25,
        text: d => `${d.count}`,
        fontSize: 11, fill: "#4448"
      }),
      Plot.ruleY([0], { stroke: "#4444" })
    ]
  });

  // 두 차트를 하나의 컨테이너에 합치기
  const container = document.createElement("div");
  container.appendChild(bumpPlot);
  container.appendChild(ratioPlot);
  return container;
}

// ============================================================
// Ratio Chart: 카테고리별 건수/비율 바 차트
// ============================================================
function drawRatioChart(d3, Plot, clusterWithLabel, selCategoryKey) {
  const total = clusterWithLabel.length;
  const categories = [...new Set(
    clusterWithLabel
      .filter(d => d[selCategoryKey] != null && String(d[selCategoryKey]).trim())
      .map(d => d[selCategoryKey])
  )];

  const data = categories.map(category => ({
    category: String(category),
    count: clusterWithLabel.filter(d => d[selCategoryKey] === category).length,
    ratio: clusterWithLabel.filter(d => d[selCategoryKey] === category).length / total
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
        x: "category", y: "ratio",
        fill: "#8882", stroke: "#888a"
      }),
      Plot.text(data, {
        x: "category", y: "ratio", dy: -10,
        text: d => d3.format(".0%")(d.ratio),
        fontSize: 15, fill: "#444"
      }),
      Plot.text(data, {
        x: "category", y: "ratio", dy: -25,
        text: d => `${d.count}`,
        fontSize: 12, fill: "#4448"
      }),
      Plot.ruleY([0], { stroke: "#4444" })
    ]
  });
}

// ============================================================
// Small Multiples: VoronoiTreemap per category
// ============================================================
function renderSmallMultiples(d3, VoronoiTreemap, clusterWithLabel, selCategoryKey, options = {}) {
  const { width = 500, height = 380, colors, regionColors } = options;

  const categories = d3
    .groups(clusterWithLabel, d => d[selCategoryKey])
    .filter(([item]) => item != null && String(item).trim())
    .sort((a, b) => d3.ascending(String(a[0]), String(b[0])));

  const container = document.createElement("div");
  container.style.cssText = "display:flex;flex-wrap:wrap;gap:15px;";

  for (const [categoryValue, data] of categories) {
    const treemapData = data.map(d => ({
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
        ...(colors ? { colors } : {}),
        ...(regionColors ? { regionColors } : {})
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

// ============================================================
// CSS Styles
// ============================================================
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
  `;
}

// ============================================================
// Main: createBubbleCompare
// ============================================================

/**
 * 버블 비교 UI 생성
 *
 * @param {HTMLElement} container - 렌더링 대상 DOM 요소
 * @param {Array} clusterWithLabel - 분석된 데이터 (bigLabel, label, text, size 등 포함)
 * @param {Object} options
 * @param {Object} options.d3 - D3 라이브러리 인스턴스
 * @param {Object} options.Plot - Observable Plot 인스턴스
 * @param {Function} options.VoronoiTreemap - VoronoiTreemap 클래스
 * @param {Array} [options.colors] - 커스텀 색상 배열
 * @param {Array} [options.regionColors] - 리전별 색상 [{key, color}]
 * @param {string} [options.title] - 차트 제목
 * @param {number} [options.smallMultipleWidth=500] - 스몰 멀티플 개별 너비
 * @param {number} [options.smallMultipleHeight=380] - 스몰 멀티플 개별 높이
 * @param {number} [options.bumpChartWidth=1100] - 범프 차트 너비
 * @param {number} [options.bumpChartHeight=600] - 범프 차트 높이
 * @param {Function} [options.onChange] - 컬럼 선택 변경 콜백
 */
export function createBubbleCompare(container, clusterWithLabel, options = {}) {
  const {
    d3: d3Lib,
    Plot: PlotLib,
    VoronoiTreemap: VTClass,
    colors,
    regionColors,
    title = "",
    smallMultipleWidth = 500,
    smallMultipleHeight = 380,
    bumpChartWidth = 1100,
    bumpChartHeight = 600,
    onChange
  } = options;

  if (!d3Lib) throw new Error("d3 is required");
  if (!PlotLib) throw new Error("Plot is required");

  // 스타일 삽입
  if (!document.querySelector("#bubble-compare-styles")) {
    const style = document.createElement("style");
    style.id = "bubble-compare-styles";
    style.textContent = getCompareStyles();
    document.head.appendChild(style);
  }

  // 사용 가능한 컬럼 추출
  const allCols = Object.keys(clusterWithLabel[0] || {});
  const categoryKeys = guessCategoryKeys(allCols, clusterWithLabel, d3Lib);

  // 컨테이너 구성
  container.innerHTML = "";
  const root = document.createElement("div");
  root.className = "bubble-compare-container";

  // 컬럼 선택 UI
  const selectorDiv = document.createElement("div");
  selectorDiv.className = "bubble-compare-selector";

  const selectorLabel = document.createElement("label");
  selectorLabel.textContent = "비교 기준";

  const select = document.createElement("select");
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "선택하세요";
  select.appendChild(defaultOption);

  for (const key of categoryKeys) {
    const uniqueCount = new Set(clusterWithLabel.map(d => d[key]).filter(Boolean)).size;
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${key} (${uniqueCount})`;
    select.appendChild(opt);
  }

  selectorDiv.appendChild(selectorLabel);
  selectorDiv.appendChild(select);
  root.appendChild(selectorDiv);

  // 차트 영역
  const chartArea = document.createElement("div");
  root.appendChild(chartArea);
  container.appendChild(root);

  // 렌더링 함수
  function renderCharts(selKey) {
    chartArea.innerHTML = "";

    if (!selKey) {
      chartArea.innerHTML = `<div class="bubble-compare-empty">비교할 컬럼을 선택하세요</div>`;
      return;
    }

    const bigLabels = [...new Set(clusterWithLabel.map(d => d.bigLabel))];
    const cardColors = colors || CLUSTER_COLORS;

    // 1. Bump Chart + Ratio Chart (통합)
    const bumpSection = document.createElement("div");
    bumpSection.className = "bubble-compare-section";
    const bumpTitle = document.createElement("h3");
    bumpTitle.textContent = `${title ? title + " - " : ""}${selKey} 비교`;
    bumpSection.appendChild(bumpTitle);

    try {
      const itemCompare = computeItemCompare(d3Lib, clusterWithLabel, selKey);
      if (itemCompare.length > 0) {
        const itemWide = computeItemWide(itemCompare);
        const compareData = makeStackedData(
          d3Lib,
          itemWide,
          itemCompare[0].map(d => d.bigLabel),
          "item"
        );

        // Ratio 데이터 계산
        const total = clusterWithLabel.length;
        const categories = itemCompare.map(d => d[0].item);
        const ratioData = categories.map(category => ({
          category: String(category),
          count: clusterWithLabel.filter(d => String(d[selKey]) === String(category)).length,
          ratio: clusterWithLabel.filter(d => String(d[selKey]) === String(category)).length / total
        }));

        const bumpChart = drawBumpChart(d3Lib, PlotLib, compareData, {
          width: bumpChartWidth,
          height: bumpChartHeight,
          showPercent: true,
          colorRange: cardColors.map(c => colorvariation(d3Lib, c, 0, 0, -0.2)),
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

    // 3. Small Multiples (VoronoiTreemap)
    if (VTClass) {
      const smSection = document.createElement("div");
      smSection.className = "bubble-compare-section";
      const smTitle = document.createElement("h3");
      smTitle.textContent = `${selKey}별 Small Multiples`;
      smSection.appendChild(smTitle);

      try {
        const smChart = renderSmallMultiples(
          d3Lib, VTClass, clusterWithLabel, selKey,
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

  // 이벤트
  select.addEventListener("change", () => {
    const selKey = select.value;
    renderCharts(selKey);
    if (onChange) onChange(selKey);
  });

  // 첫 번째 후보가 있으면 자동 선택
  if (categoryKeys.length > 0) {
    select.value = categoryKeys[0];
    renderCharts(categoryKeys[0]);
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

export { guessCategoryKeys, makeStackedData, drawBumpChart, drawRatioChart, renderSmallMultiples, getCompareStyles };
