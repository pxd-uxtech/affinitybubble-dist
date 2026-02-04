/**
 * HierarchicalTable - 클러스터 데이터를 계층적 테이블로 시각화
 * 
 * @description
 * AffinityBubble의 클러스터 데이터를 상위/하위 클러스터 계층 구조로 표시하는 테이블 컴포넌트.
 * Observable mutable 의존성을 제거하고 콜백 패턴을 사용하여 범용 라이브러리로 사용 가능.
 * 
 * @example Observable 환경
 * ```javascript
 * import { createHierarchicalTable } from "./hierarchical-table.js";
 * 
 * viewof table = createHierarchicalTable(clusterWithLabel, bubbleData, {
 *   width: 1000,
 *   height: 400,
 *   title: "분석 결과",
 *   onLabelUpdate: (type, newValue, oldValue, context) => {
 *     if (type === "bigLabel") {
 *       mutable bigLabelClusters = mutable bigLabelClusters.map(d => ({
 *         ...d,
 *         bigLabel: d.bigLabel === oldValue ? newValue : d.bigLabel
 *       }));
 *     } else if (type === "label") {
 *       mutable tempLabels = mutable tempLabels.map(d => ({
 *         ...d,
 *         label: d.cluster === context.cluster ? newValue : d.label
 *       }));
 *     }
 *   }
 * });
 * ```
 * 
 * @example 일반 HTML 환경
 * ```javascript
 * const table = createHierarchicalTable(data, bubbleData, {
 *   width: 800,
 *   headers: ["Category", "Subcategory", "Text", "Count"],
 *   enableInlineEdit: false
 * });
 * document.getElementById("container").appendChild(table);
 * ```
 */

// ============================================================
// 색상 유틸리티 함수
// ============================================================

/**
 * HSL 색상 조정
 */
function getHSLColor(color, hShift = 0, sShift = 0, lShift = 0) {
  if (!color || color === "#fff" || color === "#ffffff") return color;
  
  // hex to rgb
  let r, g, b;
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    r = parseInt(hex.substr(0, 2), 16) / 255;
    g = parseInt(hex.substr(2, 2), 16) / 255;
    b = parseInt(hex.substr(4, 2), 16) / 255;
  } else if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (!match) return color;
    [r, g, b] = match.map(v => parseInt(v) / 255);
  } else {
    return color;
  }

  // rgb to hsl
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // apply shifts
  h = (h + hShift + 1) % 1;
  s = Math.max(0, Math.min(1, s + sShift));
  l = Math.max(0, Math.min(1, l + lShift));

  // hsl to rgb
  let r2, g2, b2;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1/3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1/3);
  }

  return `rgb(${Math.round(r2 * 255)}, ${Math.round(g2 * 255)}, ${Math.round(b2 * 255)})`;
}

/**
 * 색상 변형 (colorVar2 대체)
 */
function colorVar2(color, hShift = 0, sShift = 0, lShift = 0) {
  return getHSLColor(color, hShift, sShift, lShift);
}

// ============================================================
// 메인 함수
// ============================================================

/**
 * 계층적 테이블 생성
 *
 * @param {Array} data - 클러스터 데이터 배열 (bigLabel, label, chunk/text, cluster 필드 포함)
 * @param {Array} bubbleData - 버블 색상 데이터 (label/bigLabel로 매칭, color, bigColor 필드 포함)
 * @param {Object} options - 설정 옵션
 * @returns {HTMLElement} 테이블 컨테이너 엘리먼트
 */
export function createHierarchicalTable(data, bubbleData = [], options = {}) {
  const {
    // 레이아웃
    width = 980,
    height = 300,
    initialCompact = false,
    userColumns = [],

    // 헤더 커스터마이징
    headers = null,
    headerMode = "normal", // "normal" | "userGoal"

    // 필드 매핑 (기본값: chunk, 대체: text)
    chunkField = null, // 자동 감지: chunk > text

    // 콜백
    onLabelUpdate = null,

    // 메타데이터 (버튼 기능용)
    title = "untitled",
    dataSource = "",
    cellPosMap = new Map(),

    // 기능 토글
    enableCompare = false,
    enableInlineEdit = true,
    enableCopy = true,
    enableCSV = true
  } = options;

  // 텍스트 필드 자동 감지 (chunk 또는 text)
  const textFieldName = chunkField || (data[0]?.chunk !== undefined ? 'chunk' : 'text');

  // 텍스트 필드 getter
  const getChunk = (item) => item[textFieldName] || item.chunk || item.text || "";

  // bubbleData에서 색상 찾기 (label 또는 bigLabel로 매칭)
  const findBubbleByLabel = (label) => {
    return bubbleData.find((d) => d.label === label || d.bigLabel === label);
  };

  // 상태 변수
  let isCompact = initialCompact;
  let isReversed = false;
  let currentWidth = width;
  let currentHeight = height;
  let resizeDebounceTimer;
  let isManualResizing = false;

  // 헤더 텍스트 설정
  const headerTexts = {
    normal: ["상위 클러스터", "하위 클러스터", "텍스트", "Size", ...userColumns],
    userGoal: ["User Goal", "User Needs", "User Voice", "Size", ...userColumns]
  };
  
  const currentHeaders = headers || headerTexts[headerMode] || headerTexts.normal;

  // =========================================================
  // 인라인 에디팅 헬퍼
  // =========================================================
  function createEditableCell(text, type, contextData) {
    const span = document.createElement("span");
    span.className = "editable-text";
    span.textContent = text;
    
    if (!enableInlineEdit || !onLabelUpdate) {
      return span;
    }
    
    span.title = "클릭하여 수정";
    span.style.cursor = "pointer";
    span.style.textDecoration = "underline dotted #aaa";
    span.style.textUnderlineOffset = "3px";

    span.onclick = function (e) {
      e.stopPropagation();

      const input = document.createElement("input");
      input.type = "text";
      input.value = text;
      input.className = "edit-input";
      input.style.cssText = `
        width: 90%;
        min-width: 100px;
        border: 1px solid #333;
        border-radius: 2px;
        padding: 2px;
        font-size: inherit;
        color: #000;
        background: #fff;
      `;

      function commit(isEnter = false) {
        if (isEnter) input.onblur = null;
        const newValue = input.value.trim();
        
        if (newValue && newValue !== text) {
          onLabelUpdate(type, newValue, text, contextData);
          text = newValue;
        }
        
        span.textContent = text;
        input.replaceWith(span);
      }

      function restore() {
        input.replaceWith(span);
      }

      input.onblur = () => commit(false);
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          restore();
        }
      };

      span.replaceWith(input);
      input.focus();
      input.select();
    };

    return span;
  }

  // =========================================================
  // TSV/CSV 생성
  // =========================================================
  function generateTSV() {
    const rows = [];
    const displayHeaders = isReversed ? [...currentHeaders].reverse() : currentHeaders;
    rows.push([...displayHeaders, "cellPos"].join("\t"));

    let processedData = isCompact
      ? data.reduce((acc, curr) => {
          const existingItem = acc.find(
            (item) => item.bigLabel === curr.bigLabel && item.label === curr.label
          );

          if (!existingItem) {
            const matchingItems = data.filter(
              (d) => d.bigLabel === curr.bigLabel && d.label === curr.label
            );
            const chunks = matchingItems.map((d) =>
              (getChunk(d) || "").replace(/\t/g, " ")
            );
            const userColumnData = {};
            userColumns.forEach((col) => {
              userColumnData[col] = curr[col]
                ? curr[col].toString().replace(/\t/g, " ")
                : "";
            });
            acc.push({
              bigLabel: curr.bigLabel ? curr.bigLabel.toString().replace(/\t/g, " ") : "",
              label: curr.label ? curr.label.toString().replace(/\t/g, " ") : "",
              chunk: chunks.join(", "),
              size: matchingItems.length,
              ...userColumnData,
              cellPos: cellPosMap.get(chunks[0])?.cellPos,
              cluster: curr.cluster
            });
          }
          return acc;
        }, [])
      : data.map((item) => ({
          ...item,
          bigLabel: item.bigLabel ? item.bigLabel.toString().replace(/\t/g, " ") : "",
          label: item.label ? item.label.toString().replace(/\t/g, " ") : "",
          chunk: getChunk(item) ? getChunk(item).toString().replace(/\t/g, " ") : "",
          size: 1,
          ...Object.fromEntries(
            userColumns.map((col) => [
              col,
              item[col] ? item[col].toString().replace(/\t/g, " ") : ""
            ])
          ),
          cellPos: cellPosMap.get(item.chunk)?.cellPos
        }));

    processedData.forEach((item) => {
      const userColumnValues = userColumns.map((col) => item[col] || "");
      const row = isReversed
        ? [item.chunk.replace(/\n/g, " "), item.label, item.bigLabel, item.size, ...userColumnValues, item?.cellPos]
        : [item.bigLabel, item.label, item.chunk.replace(/\n/g, " "), item.size, ...userColumnValues, item?.cellPos];
      rows.push(row.join("\t"));
    });

    return rows.join("\n");
  }

  async function copyToClipboard() {
    const tsvContent = generateTSV();
    try {
      await navigator.clipboard.writeText(tsvContent);
      alert("테이블이 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
      alert("클립보드 복사에 실패했습니다.");
    }
  }

  async function compareChart() {
    const tsvContent = generateTSV();
    try {
      localStorage.setItem("sharedText", tsvContent);
      localStorage.setItem("dataSource", dataSource);
      localStorage.setItem("bubbleTitle", title);
      window.open("/bubble-compare", "_blank");
    } catch (err) {
      console.error("로컬 저장 실패:", err);
    }
  }

  function saveAsCSV() {
    const tsvContent = generateTSV();
    const lines = tsvContent.split("\n");
    const csvLines = lines.map(line => {
      const fields = line.split("\t");
      return fields.map(field => {
        if (field.includes(",") || field.includes('"') || field.includes("\n")) {
          return '"' + field.replace(/"/g, '""') + '"';
        }
        return field;
      }).join(",");
    });

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("CSV 파일이 다운로드되었습니다.");
  }

  // =========================================================
  // DOM 구조 생성
  // =========================================================
  const outerContainer = document.createElement("div");
  outerContainer.className = "hierarchical-table-container";
  outerContainer.style.cssText = `
    width: ${currentWidth}px;
    min-width: 1200px;
    position: relative;
    resize: both;
    overflow: hidden;
  `;

  const container = document.createElement("div");
  container.className = "hierarchical-table-inner";
  container.style.cssText = `
    height: ${currentHeight}px;
    width: 100%;
    min-height: 300px;
    padding: 0;
    position: relative;
  `;

  // 리사이즈 옵저버
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      const newWidth = outerContainer.clientWidth;
      const newHeight = outerContainer.clientHeight - buttonContainer.offsetHeight;

      if (newWidth !== currentWidth || newHeight !== currentHeight) {
        currentWidth = Math.max(1200, newWidth);
        currentHeight = Math.max(300, newHeight);
        container.style.height = `${currentHeight}px`;
        table.style.width = "100%";
      }
    }, 100);
  });
  resizeObserver.observe(outerContainer);

  // 테이블 생성
  const table = document.createElement("table");
  table.setAttribute("id", "dataTable");
  table.style.cssText = `
    margin-top: 0;
    border-collapse: collapse; 
    width: 100%;
  `;

  // =========================================================
  // 리사이즈 핸들
  // =========================================================
  let rightHandle, bottomHandle, cornerHandle;
  
  function addResizeHandles() {
    rightHandle = document.createElement("div");
    rightHandle.className = "resize-handle-right";
    rightHandle.style.cssText = `position: absolute; right: 0; top: 0; width: 10px; height: 100%; cursor: e-resize; background: transparent;`;

    bottomHandle = document.createElement("div");
    bottomHandle.className = "resize-handle-bottom";
    bottomHandle.style.cssText = `position: absolute; bottom: 0; left: 0; width: 100%; height: 10px; cursor: s-resize; background: transparent;`;

    cornerHandle = document.createElement("div");
    cornerHandle.className = "resize-handle-corner";
    cornerHandle.style.cssText = `position: absolute; right: 0; bottom: 0; width: 20px; height: 20px; cursor: se-resize; background: transparent;`;

    let startX, startY, startWidth, startHeight, startOuterWidth;

    function initDrag(e, direction) {
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(container).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(container).height, 10);
      startOuterWidth = parseInt(document.defaultView.getComputedStyle(outerContainer).width, 10);

      isManualResizing = true;
      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);

      function doDrag(e) {
        if (direction === "right" || direction === "corner") {
          currentWidth = Math.max(1200, startOuterWidth + e.clientX - startX);
          outerContainer.style.width = `${currentWidth}px`;
          table.style.width = "100%";
        }
        if (direction === "bottom" || direction === "corner") {
          currentHeight = Math.max(300, startHeight + e.clientY - startY);
          container.style.height = `${currentHeight}px`;
        }
        e.preventDefault();
        e.stopPropagation();
      }

      function stopDrag(e) {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
        outerContainer.style.width = `${currentWidth}px`;
        container.style.height = `${currentHeight}px`;
        setTimeout(() => { isManualResizing = false; }, 200);
        e.preventDefault();
        e.stopPropagation();
      }
    }

    rightHandle.addEventListener("mousedown", (e) => initDrag(e, "right"));
    bottomHandle.addEventListener("mousedown", (e) => initDrag(e, "bottom"));
    cornerHandle.addEventListener("mousedown", (e) => initDrag(e, "corner"));

    outerContainer.appendChild(rightHandle);
    outerContainer.appendChild(bottomHandle);
    outerContainer.appendChild(cornerHandle);
  }

  function removeResizeHandles() {
    [rightHandle, bottomHandle, cornerHandle].forEach(handle => {
      if (handle?.parentNode) handle.parentNode.removeChild(handle);
    });
    rightHandle = bottomHandle = cornerHandle = null;
  }

  // =========================================================
  // 테이블 렌더링
  // =========================================================
  function redrawTable() {
    const oldTbody = table.querySelector("tbody");
    if (oldTbody) {
      table.removeChild(oldTbody);
    }
    renderTableBody();
  }

  function renderTableBody() {
    // 빈 데이터 처리
    if (!data || data.length === 0 || !bubbleData || bubbleData.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.style.cssText = `
        background: #eee;
        height: 100%;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        font-size: 14px;
        border-radius: 8px;
      `;
      emptyState.textContent = "데이터가 없습니다";

      // 기존 내용 제거
      const oldTbody = table.querySelector("tbody");
      if (oldTbody) table.removeChild(oldTbody);

      // 테이블 숨기고 빈 상태 표시
      table.style.display = "none";

      // 기존 빈 상태 제거
      const existingEmpty = container.querySelector(".empty-state");
      if (existingEmpty) existingEmpty.remove();

      emptyState.className = "empty-state";
      container.appendChild(emptyState);
      return;
    }

    // 데이터가 있으면 빈 상태 제거하고 테이블 표시
    const existingEmpty = container.querySelector(".empty-state");
    if (existingEmpty) existingEmpty.remove();
    table.style.display = "";

    let processedData;
    if (isCompact) {
      processedData = data.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.bigLabel === curr.bigLabel && item.label === curr.label
        );

        if (!existingItem) {
          const matchingItems = data.filter(
            (d) => d.bigLabel === curr.bigLabel && d.label === curr.label
          );
          const chunks = matchingItems.map((d) => getChunk(d));
          const userColumnData = {};
          userColumns.forEach((col) => {
            userColumnData[col] = curr[col];
          });

          acc.push({
            bigLabel: curr.bigLabel ?? " ",
            label: curr.label,
            chunk: chunks.join(", ").replace(/\t/g, " "),
            size: matchingItems.length,
            cluster: curr.cluster,
            ...userColumnData
          });
        }
        return acc;
      }, []);
    } else {
      processedData = data.map((item) => ({ ...item, chunk: getChunk(item), size: 1 }));
    }

    const structuredData = processedData.reduce((acc, curr) => {
      if (!acc[curr.bigLabel]) acc[curr.bigLabel] = {};
      if (!acc[curr.bigLabel][curr.label]) acc[curr.bigLabel][curr.label] = [];
      acc[curr.bigLabel][curr.label].push({
        chunk: curr.chunk,
        size: curr.size,
        cluster: curr.cluster,
        userColumns: userColumns.reduce((obj, col) => {
          obj[col] = curr[col];
          return obj;
        }, {})
      });
      return acc;
    }, {});

    const tbody = document.createElement("tbody");
    
    Object.entries(structuredData).forEach(([bigLabel, labels]) => {
      let firstBigLabel = true;
      let bigLabelRowspan = Object.values(labels).reduce(
        (sum, chunks) => sum + chunks.length, 0
      );

      Object.entries(labels).forEach(([label, chunks]) => {
        let firstLabel = true;
        chunks.forEach((chunkData) => {
          const tr = document.createElement("tr");

          const tdBigLabel = document.createElement("td");
          const tdLabel = document.createElement("td");
          const tdChunk = document.createElement("td");
          const tdSize = document.createElement("td");
          tdSize.style.cssText = "border: 1px solid #eee; padding: 8px; text-align: center;";
          tdSize.textContent = chunkData.size;

          const userColumnCells = userColumns.map((col) => {
            const td = document.createElement("td");
            td.setAttribute("class", "userColumn");
            td.textContent = chunkData.userColumns[col] || "";
            return td;
          });

          // 상위 클러스터 (BigLabel)
          if (firstBigLabel) {
            const bubbleItem = findBubbleByLabel(label);
            const bubbleColor = bubbleItem?.bigColor ?? "#fff";
            const bubbleColorbg = bubbleColor === "#fff" ? "#fff" : getHSLColor(bubbleColor, 0, 0, -0.1);
            const borderColor = bubbleColor === "#fff" ? "#eee" : getHSLColor(bubbleColor, 0, -0.2, -0.2);
            
            tdBigLabel.appendChild(
              createEditableCell(bigLabel ?? "", "bigLabel", bigLabel)
            );
            
            tdBigLabel.rowSpan = bigLabelRowspan;
            tdBigLabel.className = "bigcluster-label";
            tdBigLabel.style.cssText = `border-right: 1px solid ${borderColor};border-bottom: 1px solid ${borderColor}; background:${bubbleColorbg};color:#fff;text-shadow:0 1px ${borderColor},0 -1px ${borderColor},1px 0 ${borderColor},-1px 0 ${borderColor};`;
            firstBigLabel = false;
          }

          // 하위 클러스터 (Label)
          if (firstLabel) {
            const bubbleItem = findBubbleByLabel(label);
            const bubbleColor = bubbleItem?.color ?? "#fff";
            const fontColor = colorVar2(bubbleColor, 0, -0.1, -0.3);
            const borderColor = getHSLColor(bubbleColor, 0, -0.2, -0.2);

            const labelContext = { cluster: chunkData.cluster, originalLabel: label };
            tdLabel.appendChild(
              createEditableCell(label ?? "", "label", labelContext)
            );
            
            tdLabel.rowSpan = chunks.length;
            tdLabel.className = "cluster-label";
            tdLabel.style.cssText = `border-right: 1px solid ${borderColor};border-bottom: 1px solid ${borderColor}; background:${bubbleColor};color:${fontColor}`;
            firstLabel = false;
          }

          // 텍스트 셀
          tdChunk.className = "chunk-text";
          tdChunk.dataset.fullText = chunkData.chunk;
          tdChunk.textContent = chunkData.chunk;
          tdChunk.dataset.expanded = "false";

          tdChunk.addEventListener("click", function () {
            const isExpanded = this.dataset.expanded === "true";
            this.style.whiteSpace = isExpanded ? "nowrap" : "normal";
            this.style.textOverflow = isExpanded ? "ellipsis" : "clip";
            this.dataset.expanded = (!isExpanded).toString();
          });

          // 셀 추가
          if (isReversed) {
            if (tdChunk.textContent) tr.appendChild(tdChunk);
            if (tdLabel.hasChildNodes()) tr.appendChild(tdLabel);
            if (tdBigLabel.hasChildNodes()) tr.appendChild(tdBigLabel);
            tr.appendChild(tdSize);
            userColumnCells.forEach((cell) => tr.appendChild(cell));
          } else {
            if (tdBigLabel.hasChildNodes()) tr.appendChild(tdBigLabel);
            if (tdLabel.hasChildNodes()) tr.appendChild(tdLabel);
            if (tdChunk.textContent) tr.appendChild(tdChunk);
            tr.appendChild(tdSize);
            userColumnCells.forEach((cell) => tr.appendChild(cell));
          }

          tbody.appendChild(tr);
        });
      });
    });

    table.appendChild(tbody);
  }

  // =========================================================
  // 버튼 생성
  // =========================================================
  function createButton(text, onClick, id = "") {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.className = "toggle-button";
    if (id) button.id = id;
    button.addEventListener("click", onClick);
    return button;
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "table-buttons";
  buttonContainer.style.cssText = `display: flex; align-items: center; justify-content: flex-end; gap: 4px; padding: 8px;`;

  const compactButton = createButton(
    isCompact
      ? '<i class="fi fi-br-arrow-up-right-and-arrow-down-left-from-center"></i> 펼침'
      : '<i class="fi fi-br-down-left-and-up-right-to-center"></i> 병합',
    () => {
      isCompact = !isCompact;
      compactButton.innerHTML = isCompact
        ? '<i class="fi fi-br-arrow-up-right-and-arrow-down-left-from-center"></i> 펼침'
        : '<i class="fi fi-br-down-left-and-up-right-to-center"></i> 병합';
      redrawTable();
    }
  );

  const orderButton = createButton(
    '<i class="fi fi-ss-exchange"></i> 정렬',
    () => {
      isReversed = !isReversed;
      updateHeaderRow();
      redrawTable();
    }
  );

  buttonContainer.appendChild(compactButton);
  buttonContainer.appendChild(orderButton);

  if (enableCopy) {
    const copyButton = createButton('<i class="fi fi-rr-copy-alt"></i> 테이블 복사', copyToClipboard);
    buttonContainer.appendChild(copyButton);
  }

  if (enableCSV) {
    const csvButton = createButton('<i class="fi fi-rr-download"></i> CSV 저장', saveAsCSV);
    buttonContainer.appendChild(csvButton);
  }

  if (enableCompare) {
    const compareButton = createButton(
      '메타데이터별 비교 <i class="fi fi-br-arrow-up-right-from-square"></i>',
      compareChart,
      "compareButton"
    );
    buttonContainer.appendChild(compareButton);
  }

  // =========================================================
  // 헤더 생성
  // =========================================================
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  function createHeaderCell(text, width) {
    const th = document.createElement("th");
    th.style.cssText = `width: ${width}px;`;
    th.textContent = text;
    return th;
  }

  const firstHeader = createHeaderCell(currentHeaders[0], 300);
  const secondHeader = createHeaderCell(currentHeaders[1], 300);
  const thirdHeader = createHeaderCell(currentHeaders[2], 400);
  const sizeHeader = createHeaderCell(currentHeaders[3], 80);
  const additionalHeaders = userColumns.map((column) => createHeaderCell(column, 80));

  function updateHeaderRow() {
    headerRow.innerHTML = "";
    if (isReversed) {
      headerRow.appendChild(thirdHeader);
      headerRow.appendChild(secondHeader);
      headerRow.appendChild(firstHeader);
      headerRow.appendChild(sizeHeader);
      additionalHeaders.forEach((header) => headerRow.appendChild(header));
    } else {
      headerRow.appendChild(firstHeader);
      headerRow.appendChild(secondHeader);
      headerRow.appendChild(thirdHeader);
      headerRow.appendChild(sizeHeader);
      additionalHeaders.forEach((header) => headerRow.appendChild(header));
    }
  }

  updateHeaderRow();
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // =========================================================
  // 조립 및 반환
  // =========================================================
  renderTableBody();

  const formContainer = document.createElement("form");
  formContainer.className = "form-table";
  formContainer.style.cssText = `margin: 0; padding: 0; width: 100%; height: 100%;`;
  formContainer.appendChild(table);
  container.appendChild(formContainer);
  
  outerContainer.appendChild(buttonContainer);
  outerContainer.appendChild(container);

  removeResizeHandles();
  addResizeHandles();

  window.addEventListener("resize", function () {
    if (!isManualResizing) {
      outerContainer.style.width = `${currentWidth}px`;
      container.style.height = `${currentHeight}px`;
    }
  });

  // 정리 메서드
  outerContainer.cleanup = function () {
    resizeObserver.disconnect();
    removeResizeHandles();
  };

  return outerContainer;
}

// 기본 export
export default { createHierarchicalTable };
