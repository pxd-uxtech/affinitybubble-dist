// src/hierarchical-table.js
function getHSLColor(color, hShift = 0, sShift = 0, lShift = 0) {
  if (!color || color === "#fff" || color === "#ffffff") return color;
  let r, g, b;
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    r = parseInt(hex.substr(0, 2), 16) / 255;
    g = parseInt(hex.substr(2, 2), 16) / 255;
    b = parseInt(hex.substr(4, 2), 16) / 255;
  } else if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (!match) return color;
    [r, g, b] = match.map((v) => parseInt(v) / 255);
  } else {
    return color;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  h = (h + hShift + 1) % 1;
  s = Math.max(0, Math.min(1, s + sShift));
  l = Math.max(0, Math.min(1, l + lShift));
  let r2, g2, b2;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p2, q2, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2) return q2;
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }
  return `rgb(${Math.round(r2 * 255)}, ${Math.round(g2 * 255)}, ${Math.round(b2 * 255)})`;
}
function colorVar2(color, hShift = 0, sShift = 0, lShift = 0) {
  return getHSLColor(color, hShift, sShift, lShift);
}
function createHierarchicalTable(data, bubbleData = [], options = {}) {
  const {
    // 레이아웃
    width = 980,
    height = 300,
    initialCompact = false,
    userColumns = [],
    // 헤더 커스터마이징
    headers = null,
    headerMode = "normal",
    // "normal" | "userGoal"
    // 필드 매핑 (기본값: chunk, 대체: text)
    chunkField = null,
    // 자동 감지: chunk > text
    // 콜백
    onLabelUpdate = null,
    // 메타데이터 (버튼 기능용)
    title = "untitled",
    dataSource = "",
    cellPosMap = /* @__PURE__ */ new Map(),
    // 기능 토글
    enableCompare = false,
    enableInlineEdit = true,
    enableCopy = true,
    enableCSV = true
  } = options;
  const textFieldName = chunkField || (data[0]?.chunk !== void 0 ? "chunk" : "text");
  const getChunk = (item) => item[textFieldName] || item.chunk || item.text || "";
  const bubbleLabelMap = /* @__PURE__ */ new Map();
  const bubbleBigLabelMap = /* @__PURE__ */ new Map();
  bubbleData.forEach((d) => {
    if (d.label && !bubbleLabelMap.has(d.label)) bubbleLabelMap.set(d.label, d);
    if (d.bigLabel && !bubbleBigLabelMap.has(d.bigLabel)) bubbleBigLabelMap.set(d.bigLabel, d);
  });
  function rebuildBubbleMaps() {
    bubbleLabelMap.clear();
    bubbleBigLabelMap.clear();
    bubbleData.forEach((d) => {
      if (d.label && !bubbleLabelMap.has(d.label)) bubbleLabelMap.set(d.label, d);
      if (d.bigLabel && !bubbleBigLabelMap.has(d.bigLabel)) bubbleBigLabelMap.set(d.bigLabel, d);
    });
  }
  const findBubbleByLabel = (label) => {
    return bubbleLabelMap.get(label) || bubbleBigLabelMap.get(label);
  };
  let isCompact = initialCompact;
  let isReversed = false;
  let currentWidth = width;
  let currentHeight = height;
  let resizeDebounceTimer;
  let isManualResizing = false;
  const headerTexts = {
    normal: ["\uC0C1\uC704 \uD074\uB7EC\uC2A4\uD130", "\uD558\uC704 \uD074\uB7EC\uC2A4\uD130", "\uD14D\uC2A4\uD2B8", "Size", ...userColumns],
    userGoal: ["User Goal", "User Needs", "User Voice", "Size", ...userColumns]
  };
  const currentHeaders = headers || headerTexts[headerMode] || headerTexts.normal;
  function createEditableCell(text, type, contextData) {
    const span = document.createElement("span");
    span.className = "editable-text";
    span.textContent = text;
    if (!enableInlineEdit || !onLabelUpdate) {
      return span;
    }
    span.title = "\uD074\uB9AD\uD558\uC5EC \uC218\uC815";
    span.style.cursor = "pointer";
    span.style.textDecoration = "underline dotted #aaa";
    span.style.textUnderlineOffset = "3px";
    span.onclick = function(e) {
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
      input.onkeydown = (e2) => {
        if (e2.key === "Enter") {
          e2.preventDefault();
          commit(true);
        } else if (e2.key === "Escape") {
          e2.preventDefault();
          restore();
        }
      };
      span.replaceWith(input);
      input.focus();
      input.select();
    };
    return span;
  }
  function closeMovePopup() {
    const existing = outerContainer?.querySelector(".move-popup");
    if (existing) existing.remove();
    document.removeEventListener("mousedown", handleOutsideClick);
  }
  function handleOutsideClick(e) {
    const popup = outerContainer?.querySelector(".move-popup");
    if (popup && !popup.contains(e.target)) {
      closeMovePopup();
    }
  }
  function moveSubCluster(label, cluster, oldBigLabel, newBigLabel) {
    if (oldBigLabel === newBigLabel) return;
    data.forEach((item) => {
      if (item.label === label) {
        item.bigLabel = newBigLabel;
      }
    });
    const newBigBubble = bubbleData.find((d) => d.bigLabel === newBigLabel);
    bubbleData.forEach((item) => {
      if (item.label === label) {
        item.bigLabel = newBigLabel;
        if (newBigBubble) {
          item.bigColor = newBigBubble.bigColor;
        }
      }
    });
    rebuildBubbleMaps();
    if (onLabelUpdate) {
      onLabelUpdate("moveCluster", newBigLabel, oldBigLabel, { cluster, label });
    }
    closeMovePopup();
    redrawTable();
  }
  function showMovePopup(anchorEl, label, cluster, currentBigLabel) {
    closeMovePopup();
    const bigLabels = [...new Set(bubbleData.map((d) => d.bigLabel))];
    const popup = document.createElement("div");
    popup.className = "move-popup";
    popup.style.cssText = `
      position: absolute;
      z-index: 1000;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 160px;
      max-height: 240px;
      overflow-y: auto;
      padding: 4px 0;
      font-size: 13px;
    `;
    bigLabels.forEach((bl) => {
      const bubbleItem = bubbleData.find((d) => d.bigLabel === bl);
      const bigColor = bubbleItem?.bigColor ?? "#ccc";
      const isCurrent = bl === currentBigLabel;
      const item = document.createElement("div");
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        cursor: ${isCurrent ? "default" : "pointer"};
        opacity: ${isCurrent ? "0.6" : "1"};
        background: ${isCurrent ? "#f5f5f5" : "transparent"};
      `;
      if (!isCurrent) {
        item.addEventListener("mouseenter", () => {
          item.style.background = "#f0f0f0";
        });
        item.addEventListener("mouseleave", () => {
          item.style.background = "transparent";
        });
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          moveSubCluster(label, cluster, currentBigLabel, bl);
        });
      }
      const chip = document.createElement("span");
      chip.style.cssText = `
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${bigColor};
        flex-shrink: 0;
        border: 1px solid ${getHSLColor(bigColor, 0, -0.2, -0.2)};
      `;
      const text = document.createElement("span");
      text.style.cssText = `flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #333;`;
      text.textContent = bl;
      const check = document.createElement("span");
      check.style.cssText = `font-size: 11px; color: #888; flex-shrink: 0;`;
      check.textContent = isCurrent ? "\u2713" : "";
      item.appendChild(chip);
      item.appendChild(text);
      item.appendChild(check);
      popup.appendChild(item);
    });
    const rect = anchorEl.getBoundingClientRect();
    const containerRect = outerContainer.getBoundingClientRect();
    popup.style.top = `${rect.bottom - containerRect.top + 2}px`;
    popup.style.left = `${rect.left - containerRect.left}px`;
    outerContainer.appendChild(popup);
    setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 0);
  }
  function createMoveButton(label, cluster, currentBigLabel) {
    const btn = document.createElement("span");
    btn.className = "move-cluster-btn";
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    btn.title = "\uC0C1\uC704 \uD074\uB7EC\uC2A4\uD130 \uBCC0\uACBD";
    btn.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s;
      background: rgba(255,255,255,0.8);
      border-radius: 3px;
      color: #666;
      pointer-events: auto;
    `;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      showMovePopup(btn, label, cluster, currentBigLabel);
    });
    return btn;
  }
  function generateTSV() {
    const rows = [];
    const displayHeaders = isReversed ? [...currentHeaders].reverse() : currentHeaders;
    rows.push([...displayHeaders, "cellPos"].join("	"));
    let processedData;
    if (isCompact) {
      const groupMap = /* @__PURE__ */ new Map();
      data.forEach((curr) => {
        const key = `${curr.bigLabel}\0${curr.label}`;
        let group = groupMap.get(key);
        if (!group) {
          const userColumnData = {};
          userColumns.forEach((col) => {
            userColumnData[col] = curr[col] ? curr[col].toString().replace(/\t/g, " ") : "";
          });
          group = {
            bigLabel: curr.bigLabel ? curr.bigLabel.toString().replace(/\t/g, " ") : "",
            label: curr.label ? curr.label.toString().replace(/\t/g, " ") : "",
            chunks: [],
            size: 0,
            ...userColumnData,
            cluster: curr.cluster
          };
          groupMap.set(key, group);
        }
        group.chunks.push((getChunk(curr) || "").replace(/\t/g, " "));
        group.size += curr.size || 1;
      });
      processedData = [...groupMap.values()].map((g) => ({
        ...g,
        chunk: g.chunks.join(", "),
        cellPos: cellPosMap.get(g.chunks[0])?.cellPos
      }));
    } else {
      processedData = data.map((item) => ({
        ...item,
        bigLabel: item.bigLabel ? item.bigLabel.toString().replace(/\t/g, " ") : "",
        label: item.label ? item.label.toString().replace(/\t/g, " ") : "",
        chunk: getChunk(item) ? getChunk(item).toString().replace(/\t/g, " ") : "",
        size: item.size || 1,
        ...Object.fromEntries(
          userColumns.map((col) => [
            col,
            item[col] ? item[col].toString().replace(/\t/g, " ") : ""
          ])
        ),
        cellPos: cellPosMap.get(item.chunk)?.cellPos
      }));
    }
    processedData.forEach((item) => {
      const userColumnValues = userColumns.map((col) => item[col] || "");
      const row = isReversed ? [item.chunk.replace(/\n/g, " "), item.label, item.bigLabel, item.size, ...userColumnValues, item?.cellPos] : [item.bigLabel, item.label, item.chunk.replace(/\n/g, " "), item.size, ...userColumnValues, item?.cellPos];
      rows.push(row.join("	"));
    });
    return rows.join("\n");
  }
  async function copyToClipboard() {
    const tsvContent = generateTSV();
    try {
      await navigator.clipboard.writeText(tsvContent);
      alert("\uD14C\uC774\uBE14\uC774 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (err) {
      console.error("\uD074\uB9BD\uBCF4\uB4DC \uBCF5\uC0AC \uC2E4\uD328:", err);
      alert("\uD074\uB9BD\uBCF4\uB4DC \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
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
      console.error("\uB85C\uCEEC \uC800\uC7A5 \uC2E4\uD328:", err);
    }
  }
  function saveAsCSV() {
    const tsvContent = generateTSV();
    const lines = tsvContent.split("\n");
    const csvLines = lines.map((line) => {
      const fields = line.split("	");
      return fields.map((field) => {
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
    alert("CSV \uD30C\uC77C\uC774 \uB2E4\uC6B4\uB85C\uB4DC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  }
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
  const table = document.createElement("table");
  table.setAttribute("id", "dataTable");
  table.style.cssText = `
    margin-top: 0;
    border-collapse: collapse; 
    width: 100%;
  `;
  let bottomHandle, cornerHandle;
  function addResizeHandles() {
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
      function doDrag(e2) {
        if (direction === "corner") {
          currentWidth = Math.max(1200, startOuterWidth + e2.clientX - startX);
          outerContainer.style.width = `${currentWidth}px`;
          table.style.width = "100%";
        }
        if (direction === "bottom" || direction === "corner") {
          currentHeight = Math.max(300, startHeight + e2.clientY - startY);
          container.style.height = `${currentHeight}px`;
        }
        e2.preventDefault();
        e2.stopPropagation();
      }
      function stopDrag(e2) {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
        outerContainer.style.width = `${currentWidth}px`;
        container.style.height = `${currentHeight}px`;
        setTimeout(() => {
          isManualResizing = false;
        }, 200);
        e2.preventDefault();
        e2.stopPropagation();
      }
    }
    bottomHandle.addEventListener("mousedown", (e) => initDrag(e, "bottom"));
    cornerHandle.addEventListener("mousedown", (e) => initDrag(e, "corner"));
    outerContainer.appendChild(bottomHandle);
    outerContainer.appendChild(cornerHandle);
  }
  function removeResizeHandles() {
    [bottomHandle, cornerHandle].forEach((handle) => {
      if (handle?.parentNode) handle.parentNode.removeChild(handle);
    });
    bottomHandle = cornerHandle = null;
  }
  function redrawTable() {
    const oldTbody = table.querySelector("tbody");
    if (oldTbody) {
      table.removeChild(oldTbody);
    }
    renderTableBody();
  }
  function renderTableBody() {
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
      emptyState.textContent = "\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4";
      const oldTbody = table.querySelector("tbody");
      if (oldTbody) table.removeChild(oldTbody);
      table.style.display = "none";
      const existingEmpty2 = container.querySelector(".empty-state");
      if (existingEmpty2) existingEmpty2.remove();
      emptyState.className = "empty-state";
      container.appendChild(emptyState);
      return;
    }
    const existingEmpty = container.querySelector(".empty-state");
    if (existingEmpty) existingEmpty.remove();
    table.style.display = "";
    let processedData;
    if (isCompact) {
      const groupMap = /* @__PURE__ */ new Map();
      data.forEach((curr) => {
        const key = `${curr.bigLabel}\0${curr.label}`;
        let group = groupMap.get(key);
        if (!group) {
          const userColumnData = {};
          userColumns.forEach((col) => {
            userColumnData[col] = curr[col];
          });
          group = {
            bigLabel: curr.bigLabel ?? " ",
            label: curr.label,
            chunks: [],
            size: 0,
            cluster: curr.cluster,
            ...userColumnData
          };
          groupMap.set(key, group);
        }
        group.chunks.push(getChunk(curr));
        group.size += curr.size || 1;
      });
      processedData = [...groupMap.values()].map((g) => ({
        ...g,
        chunk: g.chunks.join(", ").replace(/\t/g, " ")
      }));
    } else {
      processedData = data.map((item) => ({ ...item, chunk: getChunk(item), size: item.size || 1 }));
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
    const bigLabelOrder = [...new Set(bubbleData.map((d) => d.bigLabel))];
    const sortedEntries = Object.entries(structuredData).sort(([a], [b]) => {
      const ia = bigLabelOrder.indexOf(a);
      const ib = bigLabelOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
    const tbody = document.createElement("tbody");
    sortedEntries.forEach(([bigLabel, labels]) => {
      let firstBigLabel = true;
      let bigLabelRowspan = Object.values(labels).reduce(
        (sum, chunks) => sum + chunks.length,
        0
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
          if (firstLabel) {
            const bubbleItem = findBubbleByLabel(label);
            const bubbleColor = bubbleItem?.color ?? "#fff";
            const fontColor = colorVar2(bubbleColor, 0, -0.15, -0.45);
            const borderColor = getHSLColor(bubbleColor, 0, -0.2, -0.2);
            const labelContext = { cluster: chunkData.cluster, originalLabel: label };
            tdLabel.appendChild(
              createEditableCell(label ?? "", "label", labelContext)
            );
            const moveBtn = createMoveButton(label, chunkData.cluster, bigLabel);
            tdLabel.appendChild(moveBtn);
            tdLabel.addEventListener("mouseenter", () => {
              moveBtn.style.opacity = "1";
            });
            tdLabel.addEventListener("mouseleave", () => {
              if (!outerContainer.querySelector(".move-popup")) {
                moveBtn.style.opacity = "0";
              }
            });
            tdLabel.rowSpan = chunks.length;
            tdLabel.className = "cluster-label";
            tdLabel.style.cssText = `position: relative; border-right: 1px solid ${borderColor};border-bottom: 1px solid ${borderColor}; background:${bubbleColor};color:${fontColor}`;
            firstLabel = false;
          }
          tdChunk.className = "chunk-text";
          tdChunk.dataset.fullText = chunkData.chunk;
          tdChunk.textContent = chunkData.chunk;
          tdChunk.dataset.expanded = "false";
          tdChunk.addEventListener("click", function() {
            const isExpanded = this.dataset.expanded === "true";
            this.style.whiteSpace = isExpanded ? "nowrap" : "normal";
            this.style.textOverflow = isExpanded ? "ellipsis" : "clip";
            this.dataset.expanded = (!isExpanded).toString();
          });
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
    isCompact ? '<i class="fi fi-br-arrow-up-right-and-arrow-down-left-from-center"></i> \uD3BC\uCE68' : '<i class="fi fi-br-down-left-and-up-right-to-center"></i> \uBCD1\uD569',
    () => {
      isCompact = !isCompact;
      compactButton.innerHTML = isCompact ? '<i class="fi fi-br-arrow-up-right-and-arrow-down-left-from-center"></i> \uD3BC\uCE68' : '<i class="fi fi-br-down-left-and-up-right-to-center"></i> \uBCD1\uD569';
      redrawTable();
    }
  );
  const orderButton = createButton(
    '<i class="fi fi-ss-exchange"></i> \uC815\uB82C',
    () => {
      isReversed = !isReversed;
      updateHeaderRow();
      redrawTable();
    }
  );
  buttonContainer.appendChild(compactButton);
  buttonContainer.appendChild(orderButton);
  if (enableCopy) {
    const copyButton = createButton('<i class="fi fi-rr-copy-alt"></i> \uD14C\uC774\uBE14 \uBCF5\uC0AC', copyToClipboard);
    buttonContainer.appendChild(copyButton);
  }
  if (enableCSV) {
    const csvButton = createButton('<i class="fi fi-rr-download"></i> CSV \uC800\uC7A5', saveAsCSV);
    buttonContainer.appendChild(csvButton);
  }
  if (enableCompare) {
    const compareButton = createButton(
      '\uBA54\uD0C0\uB370\uC774\uD130\uBCC4 \uBE44\uAD50 <i class="fi fi-br-arrow-up-right-from-square"></i>',
      compareChart,
      "compareButton"
    );
    buttonContainer.appendChild(compareButton);
  }
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  function createHeaderCell(text, width2) {
    const th = document.createElement("th");
    th.style.cssText = `width: ${width2}px;`;
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
  window.addEventListener("resize", function() {
    if (!isManualResizing) {
      outerContainer.style.width = `${currentWidth}px`;
      container.style.height = `${currentHeight}px`;
    }
  });
  outerContainer.cleanup = function() {
    resizeObserver.disconnect();
    removeResizeHandles();
  };
  return outerContainer;
}
var hierarchical_table_default = { createHierarchicalTable };
export {
  createHierarchicalTable,
  hierarchical_table_default as default
};
