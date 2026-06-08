/**
 * ParallelSets - 설문 응답을 평행 좌표(Parallel Sets) 다이어그램으로 시각화
 *
 * @description
 * 설문 데이터를 받아 각 문항을 축으로 하고 응답 흐름을 띠(밴드)로 표현한다.
 * - 문항 레이블 드래그로 축 순서 변경
 * - 선택지 박스 클릭으로 필터링 (여러 문항 동시 필터 가능, AND)
 * - 배경 클릭 또는 ESC 키로 필터 초기화
 *
 * @example
 * ```html
 * <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
 * <div id="chart"></div>
 * <script type="module">
 *   import { createParallelSets } from "https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@HASH/parallel-sets.js";
 *
 *   const surveyData = [
 *     {
 *       name: "Q1",
 *       simple: "성별",
 *       type: "선택형",
 *       choices: { "1": "남자", "2": "여자" },
 *       values: { values: [1, 2, 1, 2, ...] }
 *     },
 *     // ...
 *   ];
 *
 *   const node = createParallelSets(surveyData, {
 *     d3: window.d3,
 *     onFilterChange: (userIds) => console.log("filtered:", userIds)
 *   });
 *   document.getElementById("chart").appendChild(node);
 * </script>
 * ```
 *
 * @param {Array<Object>} surveyData 문항 배열. 각 항목:
 *   - name {string}: 원본 컬럼명
 *   - simple {string}: 표시명(축 레이블)
 *   - type {"평가형"|"선택형"}: 평가형이면 RdBu 그라디언트, 선택형이면 카테고리 팔레트
 *   - choices {Object<string,string>}: { 값: 레이블 }
 *   - values {{ values: Array }}: 응답자 순서대로 정렬된 값 배열
 * @param {Object} [options]
 * @param {Object} [options.d3] d3 v7 인스턴스. 미지정 시 window.d3 사용
 * @param {number} [options.height=600] 전체 높이 (px)
 * @param {number} [options.axisGap=250] 축 간 간격 (px)
 * @param {{top:number,right:number,bottom:number,left:number}} [options.margin]
 * @param {"flat"|"toEnd"} [options.linkGradient="flat"] 링크 색상 모드
 * @param {number} [options.linkGradientSplit=0.8] toEnd 모드 색 전환 지점(0~1)
 * @param {(filteredUserIds:number[]) => void} [options.onFilterChange] 필터 결과 콜백
 * @returns {HTMLElement} 차트 컨테이너 DIV
 */
export function createParallelSets(surveyData, options = {}) {
  const {
    d3 = (typeof window !== "undefined" ? window.d3 : undefined),
    height: HEIGHT = 600,
    axisGap: AXIS_GAP = 250,
    margin: MARGIN = { top: 60, right: 150, bottom: 20, left: 50 },
    linkGradient: LINK_GRADIENT = "flat",
    linkGradientSplit: LINK_GRADIENT_SPLIT = 0.8,
    onFilterChange = () => {}
  } = options;

  if (!d3) {
    throw new Error("[parallel-sets] d3 v7 인스턴스가 필요합니다. options.d3 또는 window.d3를 제공하세요.");
  }

  // 빈 데이터: 빈 div 반환
  if (!Array.isArray(surveyData) || surveyData.length === 0) {
    return document.createElement("div");
  }

  try {
    // 현재 순서(드래그로 갱신됨)
    let questionOrder = d3.range(surveyData.length);

    // 필터 상태: key=question.simple, value=String(value)
    const activeFilters = new Map();

    // 응답자 총원(처음 한 번 계산)
    const TOTAL_RESPONDENTS = surveyData?.[0]?.values?.values?.length ?? 0;

    // === 컨테이너 ===
    const container = d3
      .create("div")
      .style("width", "100%")
      .style("overflow-x", "auto")
      .style("overflow-y", "hidden");

    // 요약바
    const summaryDiv = container
      .append("div")
      .attr("class", "parallel-sets-summary")
      .style("margin", "0 0 6px 0");

    const svg = container.append("svg").style("display", "block");

    // === 유틸 ===
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const formatChoiceLabel = (q, v) =>
      q?.type === "평가형" ? `${q?.choices?.[v] ?? v}` : q?.choices?.[v] ?? v;

    const desaturate = (c) => {
      const hsl = d3.hsl(c);
      hsl.s = 0;
      return d3.rgb(hsl);
    };

    const getFilterLabel = (qSimple, val) => {
      const q = surveyData.find((d) => d.simple === qSimple);
      return q?.choices?.[val] ?? val;
    };

    function getHSLColor(input, dh = 0, ds = 0, dl = 0) {
      const hsl = d3.hsl(input);
      if (Number.isFinite(dh)) hsl.h = (hsl.h + dh) % 360;
      if (Number.isFinite(ds)) hsl.s = clamp(hsl.s + ds, 0, 1);
      if (Number.isFinite(dl)) hsl.l = clamp(hsl.l + dl, 0, 1);
      return hsl.toString();
    }

    // 전처리 (order 적용 + 필터)
    function processData(data, order, filters) {
      const orderedQuestions = order.map((i) => data[i]);
      const responseCount = orderedQuestions?.[0]?.values?.values?.length ?? 0;

      const flows = [];
      const filteredUserIds = []; // 인덱스 저장

      for (let i = 0; i < responseCount; i++) {
        const response = [];
        let ok = true;

        for (const q of orderedQuestions) {
          const value = q?.values?.values?.[i];
          if (value === "" || value === null || value === undefined) {
            ok = false;
            break;
          }
          response.push({
            question: q.simple,
            value: String(value),
            label: q?.choices?.[value] ?? `선택 ${value}`
          });
        }

        if (!ok) continue;

        if (filters?.size) {
          const pass = Array.from(filters.entries()).every(([qs, v]) => {
            const r = response.find((x) => x.question === qs);
            return r && r.value === String(v);
          });
          if (!pass) continue;
        }

        flows.push(response);
        filteredUserIds.push(i); // 원본 surveyData에서의 인덱스
      }

      onFilterChange(filteredUserIds);
      return { flows, questions: orderedQuestions };
    }

    // === 렌더 ===
    function render() {
      const { flows, questions } = processData(
        surveyData,
        questionOrder,
        activeFilters
      );
      const filteredCount = flows.length;
      const pct =
        TOTAL_RESPONDENTS > 0
          ? ((filteredCount / TOTAL_RESPONDENTS) * 100).toFixed(1)
          : "0.0";

      // 요약바 업데이트
      if (activeFilters.size) {
        const cond = Array.from(activeFilters.entries())
          .map(([q, v]) => `${q} = ${getFilterLabel(q, v)}`)
          .join(" x ");
        summaryDiv.html(
          `<strong>필터링 : ${filteredCount}명 (${pct}%)</strong> ${cond}`
        );
      } else {
        summaryDiv.html(
          `<strong>전체 : ${TOTAL_RESPONDENTS}명 (100%)</strong>`
        );
      }

      // ---- SVG 초기화 ----
      const chartW = AXIS_GAP * Math.max(0, questions.length - 1);
      const svgW = chartW + MARGIN.left + MARGIN.right;
      const chartH = Math.max(0, HEIGHT - MARGIN.top - MARGIN.bottom);

      svg.attr("width", svgW).attr("height", HEIGHT).selectAll("*").remove();

      // defs (그라디언트 저장소)
      const defs = svg.append("defs");

      // 배경 클릭 → 필터 초기화
      svg
        .append("rect")
        .attr("width", svgW)
        .attr("height", HEIGHT)
        .style("fill", "transparent")
        .on("click", () => {
          if (activeFilters.size) {
            activeFilters.clear();
            render();
          }
        });

      const g = svg
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)
        .on("click", (e) => e.stopPropagation());

      // ---- 집계 ----
      const questionPos = questions.map((_, i) => AXIS_GAP * i);

      // 선택지 집계 (choices가 없거나 비면 빈 entries)
      const questionStats = questions.map((q) => {
        const hasChoices =
          q && q.choices && Object.keys(q.choices).length > 0 ? true : false;

        if (!hasChoices) {
          return { question: q.simple, entries: [] };
        }

        const entries = Object.entries(q.choices).map(([v, label]) => ({
          value: String(v),
          label,
          count: 0
        }));
        const idx = new Map(entries.map((d, i) => [d.value, i]));
        flows.forEach((flow) => {
          const r = flow.find((x) => x.question === q.simple);
          if (!r) return;
          if (idx.has(r.value)) {
            entries[idx.get(r.value)].count += 1;
          }
        });
        return { question: q.simple, entries };
      });

      const totals = questionStats.map((s) =>
        s.entries && s.entries.length
          ? s.entries.reduce((p, c) => p + c.count, 0)
          : 0
      );

      // Y 스택 (entries 없는 경우 빈 배열 반환)
      const yScales = questionStats.map((stat, qi) => {
        if (!stat.entries || stat.entries.length === 0) return [];
        const total = Math.max(1, totals[qi]);
        let y = 0;
        return stat.entries.map((e) => {
          const h = (e.count / total) * chartH;
          const out = {
            ...e,
            y,
            height: h,
            perc: total ? ((e.count / total) * 100).toFixed(0) : 0,
            labelDisplay: formatChoiceLabel(questions[qi], e.value)
          };
          y += h;
          return out;
        });
      });

      // 색상 스케일
      const makePalette = (n) =>
        n <= 10
          ? d3.schemeTableau10.slice(0, n)
          : d3.quantize((t) => d3.interpolateRainbow(t * 0.85), n);

      const ratingScales = questions.map((q, qi) => {
        if (q?.type === "평가형" && questionStats?.[qi]?.entries?.length) {
          const keys = Object.keys(q.choices).sort((a, b) => +a - +b);
          return {
            keys,
            scale: d3
              .scaleSequential(d3.interpolateRdBu)
              .domain([0, keys.length - 1])
          };
        }
        return null;
      });

      const categoricalMaps = questions.map((q, qi) => {
        if (q?.type !== "평가형" && questionStats?.[qi]?.entries?.length) {
          const domain = questionStats[qi].entries
            .slice()
            .sort((a, b) => b.count - a.count)
            .map((d) => d.value);
          const palette = makePalette(domain.length);
          return new Map(domain.map((v, i) => [v, palette[i]]));
        }
        return null;
      });

      const getColor = (qi, v) => {
        if (ratingScales[qi]) {
          const { keys, scale } = ratingScales[qi];
          const idx = Math.max(0, keys.indexOf(String(v)));
          const c = d3.hsl(scale(idx));
          if (c.h >= 0 && c.h <= 60) c.s = Math.min(1, c.s * 1.3);
          if (c.l > 0.8) c.l = c.l * 0.8;
          return c.toString();
        }
        return categoricalMaps[qi]?.get(String(v)) ?? "#ccc";
      };

      // 빠른 조회 (entries 없으면 빈 Map)
      const yMap = yScales.map((arr) => new Map(arr.map((d) => [d.value, d])));

      // ---- 질문 레이블 (드래그) ----
      g.selectAll(".question-label")
        .data(questions)
        .enter()
        .append("text")
        .attr("x", (_, i) => questionPos[i])
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("cursor", "grab")
        .style("user-select", "none")
        .style("fill", (d) =>
          activeFilters.has(d.simple) ? "#d14d41" : "#444"
        )
        .text((d) => (activeFilters.has(d.simple) ? `● ${d.simple}` : d.simple))
        .call(
          d3
            .drag()
            .on("start", function () {
              d3.select(this).style("cursor", "grabbing");
              g.append("line")
                .attr("id", "guide")
                .attr("y1", -MARGIN.top)
                .attr("y2", chartH + 20)
                .attr("stroke", "#aaa")
                .attr("stroke-dasharray", "4 4");
            })
            .on("drag", function (ev) {
              const [px] = d3.pointer(ev, g.node());
              d3.select(this).attr("x", clamp(px, 0, chartW));

              autoScrollWhileDragging(ev);

              const slot = clamp(
                Math.round(px / AXIS_GAP),
                0,
                Math.max(0, questions.length - 1)
              );
              g.select("#guide")
                .attr("x1", slot * AXIS_GAP)
                .attr("x2", slot * AXIS_GAP);
            })
            .on("end", function (ev, d) {
              g.select("#guide").remove();
              d3.select(this).style("cursor", "grab");
              const [px] = d3.pointer(ev, g.node());
              const oldI = questions.indexOf(d);
              const newI = clamp(
                Math.round(px / AXIS_GAP),
                0,
                Math.max(0, questions.length - 1)
              );
              if (newI !== oldI) {
                const move = questionOrder[oldI];
                questionOrder.splice(oldI, 1);
                questionOrder.splice(newI, 0, move);
              }
              render();
            })
        );

      // 드래그 자동 스크롤
      function autoScrollWhileDragging(ev) {
        const el = container.node(); // div 스크롤 컨테이너
        const rect = el.getBoundingClientRect();
        const clientX = ev.sourceEvent?.clientX ?? 0;
        const margin = 80; // 가장자리 감지 폭
        const maxSpeed = 25; // 프레임당 스크롤 픽셀

        if (clientX < rect.left + margin) {
          const t = 1 - (clientX - rect.left) / margin;
          el.scrollLeft -= Math.round(maxSpeed * t);
        } else if (clientX > rect.right - margin) {
          const t = 1 - (rect.right - clientX) / margin;
          el.scrollLeft += Math.round(maxSpeed * t);
        }
      }

      // ---- 링크 그라디언트 유틸 (하드 컷 전환) ----
      const idSafe = (s) => String(s).replace(/[^\w\-]+/g, "_");
      function ensureLinkGradient({
        id,
        x1,
        x2,
        c1,
        c2,
        split = LINK_GRADIENT_SPLIT
      }) {
        const grad = defs
          .append("linearGradient")
          .attr("id", id)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", x1)
          .attr("y1", 0)
          .attr("x2", x2)
          .attr("y2", 0);

        const s = clamp(split, 0, 1) * 100;
        const lo = Math.max(0, s - 10);
        const hi = Math.min(100, s + 10);

        // 하드 전환: 같은 offset에 두 색을 연속 배치(10% 폭으로 안전)
        grad.append("stop").attr("offset", "0%").attr("stop-color", c1);
        grad.append("stop").attr("offset", `${lo}%`).attr("stop-color", c1);
        grad.append("stop").attr("offset", `${hi}%`).attr("stop-color", c2);
        grad.append("stop").attr("offset", "100%").attr("stop-color", c2);

        return `url(#${id})`;
      }

      // ---- 링크 집계 ----
      const edges = [];
      flows.forEach((flow) => {
        for (let i = 0; i < flow.length - 1; i++) {
          const key = `${i}||${flow[i].value}||${i + 1}||${flow[i + 1].value}`;
          let e = edges.find((x) => x.key === key);
          if (!e) {
            e = {
              key,
              leftIndex: i,
              rightIndex: i + 1,
              leftValue: flow[i].value,
              rightValue: flow[i + 1].value,
              count: 0
            };
            edges.push(e);
          }
          e.count += 1;
        }
      });

      // ---- 링크 위치 계산 & 그리기 ----
      for (let i = 0; i < Math.max(0, questions.length - 1); i++) {
        const lx = questionPos[i];
        const rx = questionPos[i + 1];
        const lc = yMap[i] ?? new Map();
        const rc = yMap[i + 1] ?? new Map();

        // 현 구간의 edge만
        const pair = edges.filter((e) => e.leftIndex === i);

        // 좌측 정렬
        d3.group(pair, (d) => d.leftValue).forEach((list, lv) => {
          list.sort(
            (a, b) =>
              (rc.get(a.rightValue)?.y ?? 0) - (rc.get(b.rightValue)?.y ?? 0)
          );
          let off = lc.get(lv)?.y ?? 0;
          const tot = lc.get(lv) ?? { count: 0, height: 0 };
          list.forEach((e) => {
            const h = tot.count ? (e.count / tot.count) * tot.height : 0;
            e.l0 = off;
            e.l1 = off + h;
            off += h;
          });
        });

        // 우측 정렬
        d3.group(pair, (d) => d.rightValue).forEach((list, rv) => {
          list.sort(
            (a, b) =>
              (lc.get(a.leftValue)?.y ?? 0) - (lc.get(b.leftValue)?.y ?? 0)
          );
          let off = rc.get(rv)?.y ?? 0;
          const tot = rc.get(rv) ?? { count: 0, height: 0 };
          list.forEach((e) => {
            const h = tot.count ? (e.count / tot.count) * tot.height : 0;
            e.r0 = off;
            e.r1 = off + h;
            off += h;
          });
        });

        const cx = lx * 0.6 + rx * 0.4;

        pair.forEach((e) => {
          const leftColor = getColor(i, e.leftValue);
          const rightColor = getColor(i + 1, e.rightValue);

          let fillPaint = leftColor; // 기본 flat
          if (LINK_GRADIENT === "toEnd") {
            const gid = `grad-${i}-${idSafe(e.leftValue)}-${idSafe(
              e.rightValue
            )}`;
            fillPaint = ensureLinkGradient({
              id: gid,
              x1: lx + 15,
              x2: rx - 15,
              c1: leftColor,
              c2: rightColor
            });
          }

          const l0 = e.l0 ?? 0,
            l1 = e.l1 ?? 0,
            r0 = e.r0 ?? 0,
            r1 = e.r1 ?? 0;

          // height가 0이면 그리지 않음(미세 patch)
          if (Math.abs(l1 - l0) < 0.1 && Math.abs(r1 - r0) < 0.1) return;

          g.append("path")
            .attr(
              "d",
              `
            M ${lx + 15} ${l0}
            C ${cx} ${l0}, ${cx} ${r0}, ${rx - 15} ${r0}
            L ${rx - 15} ${r1}
            C ${cx} ${r1}, ${cx} ${l1}, ${lx + 15} ${l1}
            Z`
            )
            .attr("fill", fillPaint)
            .attr("fill-opacity", 0.6)
            .attr("stroke-width", 0.5);
        });
      }

      // ---- 선택지 박스 + 레이블/비율 ----
      questions.forEach((q, qi) => {
        const x = questionPos[qi];
        const selV = activeFilters.get(q.simple);
        const choices = yScales[qi];

        if (!choices || choices.length === 0) return; // entries 없으면 건너뜀

        const choiceG = g
          .selectAll(`.c-${qi}`)
          .data(choices, (d) => d.value)
          .enter()
          .append("g")
          .attr("class", `c-${qi}`)
          .style("cursor", "pointer")
          .on("click", function (_, d) {
            if (selV === String(d.value)) activeFilters.delete(q.simple);
            else activeFilters.set(q.simple, String(d.value));
            render();
          });

        choiceG
          .append("rect")
          .attr("x", x - 15)
          .attr("y", (d) => d.y)
          .attr("width", 30)
          .attr("height", (d) => d.height)
          .attr("fill", (d) => {
            const base = getColor(qi, d.value);
            return selV && String(d.value) !== selV ? desaturate(base) : base;
          })
          .attr("fill-opacity", (d) =>
            selV && String(d.value) !== selV ? 0.2 : 0.8
          )
          .attr("stroke-width", 1);

        // 가운데 % 표시 (높이 너무 작으면 생략)
        choiceG
          .append("text")
          .attr("x", x)
          .attr("y", (d) => d.y + d.height / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "10px")
          .style("pointer-events", "none")
          .style("fill", (d) =>
            getHSLColor(getColor(qi, d.value), 0, -0.1, -0.2)
          )
          .text((d) => (d.height > 4 ? `${d.perc}%` : ""));

        // 우측 레이블 (높이 너무 작으면 생략)
        choiceG
          .append("text")
          .attr("x", x + 20)
          .attr("y", (d) => d.y + d.height / 2)
          .attr("text-anchor", "start")
          .attr("dominant-baseline", "middle")
          .style("font-size", "11px")
          .style("font-weight", "normal")
          .style("fill", (d) =>
            selV && String(d.value) !== selV
              ? "#999"
              : getHSLColor(getColor(qi, d.value), 0, -0.1, -0.2)
          )
          .style("opacity", (d) => (selV && String(d.value) !== selV ? 0.8 : 1))
          .text((d) => (d.height > 1 ? `${d.labelDisplay} (${d.count})` : ``))
          .append("title")
          .text((d) => `${d.labelDisplay} (${d.count})`);
      });

      // 필터 결과 없는 경우 안내
      if (!flows.length) {
        g.append("text")
          .attr("x", chartW / 2)
          .attr("y", chartH / 2)
          .attr("text-anchor", "middle")
          .style("fill", "#666")
          .style("font-size", "12px")
          .text("선택한 필터에 해당하는 응답이 없습니다 (배경 클릭으로 해제).");
      }
    }

    // ESC 초기화 (전역 keydown — 차트 노드가 제거되면 같이 정리되도록 namespace 지정)
    const escNs = `keydown.parallelSets-${Math.random().toString(36).slice(2, 8)}`;
    d3.select(window).on(escNs, (e) => {
      // 노드가 DOM에서 떨어지면 핸들러 해제
      if (!document.body.contains(container.node())) {
        d3.select(window).on(escNs, null);
        return;
      }
      if (e.key === "Escape") {
        activeFilters.clear();
        render();
      }
    });

    render();
    return container.node();
  } catch (e) {
    console.error("[parallel-sets] render error:", e);
    const errDiv = document.createElement("div");
    errDiv.style.color = "#c00";
    errDiv.textContent = `parallel-sets error: ${e.message}`;
    return errDiv;
  }
}

export default { createParallelSets };
