// file-input-library-v3.js
function detectFormat(Papa, input) {
  if (typeof input !== "string") return "text";
  const tsvResult = Papa.parse(input, {
    delimiter: "	",
    quoteChar: "\0",
    skipEmptyLines: true,
    preview: 20
  });
  if (tsvResult.data.length >= 2 && tsvResult.data[0]?.length > 1) {
    const headerCount = tsvResult.data[0].length;
    const matchingRows = tsvResult.data.filter((r) => r.length >= headerCount - 1 && r.length <= headerCount + 1).length;
    if (matchingRows / tsvResult.data.length >= 0.8) {
      return "tsv";
    }
  }
  for (const quoteChar of ['"', "\0"]) {
    const csvResult = Papa.parse(input, {
      delimiter: ",",
      quoteChar,
      skipEmptyLines: true,
      preview: 20
    });
    if (csvResult.data.length >= 2 && csvResult.data[0]?.length > 1) {
      const headerCount = csvResult.data[0].length;
      const matchingRows = csvResult.data.filter((r) => r.length >= headerCount - 1 && r.length <= headerCount + 1).length;
      if (matchingRows / csvResult.data.length >= 0.8 && headerCount <= 30) {
        return "csv";
      }
    }
  }
  return "text";
}
function _mergeTsvQuotedNewlines(text) {
  const lines = text.split("\n");
  const headerTabCount = (lines[0]?.match(/\t/g) || []).length;
  if (headerTabCount === 0) return text;
  const merged = [];
  let accumulator = null;
  for (const line of lines) {
    if (accumulator !== null) {
      accumulator += " " + line;
      const tabCount = (accumulator.match(/\t/g) || []).length;
      if (tabCount >= headerTabCount) {
        merged.push(accumulator);
        accumulator = null;
      }
    } else {
      const tabCount = (line.match(/\t/g) || []).length;
      if (tabCount < headerTabCount) {
        if (merged.length > 0) {
          accumulator = merged.pop() + " " + line;
          const newTabCount = (accumulator.match(/\t/g) || []).length;
          if (newTabCount >= headerTabCount) {
            merged.push(accumulator);
            accumulator = null;
          }
        } else {
          merged.push(line);
        }
      } else {
        merged.push(line);
      }
    }
  }
  if (accumulator !== null) merged.push(accumulator);
  return merged.join("\n");
}
function guessTextKey(rawCols, rawText) {
  if (rawCols?.includes("text")) return "text";
  if (rawCols?.includes("\uD14D\uC2A4\uD2B8")) return "\uD14D\uC2A4\uD2B8";
  if (!rawCols?.length) return "";
  const sampleRows = rawText?.slice(0, 50) ?? [];
  const cols = rawCols.map((key) => {
    let len = 0;
    for (const d of sampleRows) {
      const s = String(d?.[key] ?? "").replace(/\d/g, "");
      len += s.length;
      if (len > 2e4) break;
    }
    return { key, textLen: len };
  });
  cols.sort((a, b) => b.textLen - a.textLen);
  return cols[0]?.textLen ? cols[0].key : rawCols[0] ?? "";
}
function findSizeKeyCandidates(rawCols, rawText) {
  return rawCols.filter((key) => {
    const notNumberCount = rawText.slice(0, 50).filter((d) => isNaN(Number(String(d[key]).trim())));
    return notNumberCount.length === 0;
  });
}
function isDateLike(value) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(v)) return true;
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(v)) return true;
  if (/^\d{8}$/.test(v)) return true;
  if (/\d{4}년\s*\d{1,2}월/.test(v)) return true;
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return true;
  return false;
}
function findDateKeyCandidates(moment, rawCols, rawText) {
  return rawCols.filter((key) => {
    const samples = rawText.slice(0, 20);
    const dateCount = samples.filter((d) => {
      const value = String(d[key] || "").trim();
      if (!value) return false;
      if (moment) {
        const parsed = moment(value, [
          "YYYY-MM-DD",
          "YYYY/MM/DD",
          "YYYY.MM.DD",
          "MM-DD-YYYY",
          "MM/DD/YYYY",
          "MM.DD.YYYY",
          "DD-MM-YYYY",
          "DD/MM/YYYY",
          "DD.MM.YYYY",
          "YYYY-MM-DD HH:mm:ss",
          "YYYY/MM/DD HH:mm:ss",
          moment.ISO_8601
        ], true);
        return parsed.isValid();
      }
      return isDateLike(value);
    }).length;
    return dateCount >= samples.length * 0.5;
  });
}
function reservoirSample(arr, k) {
  const n = arr.length;
  if (n <= k) return [arr.slice(), []];
  const sample = arr.slice(0, k);
  const rest = [];
  for (let i = k; i < n; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) {
      rest.push(sample[j]);
      sample[j] = arr[i];
    } else {
      rest.push(arr[i]);
    }
  }
  return [sample, rest];
}
function createFileInputUIv3(Papa, options = {}) {
  const {
    maxSize = 1e3,
    width = 800,
    showPreview = true,
    moment = null,
    guideContainerId = null,
    // 외부 가이드 컨테이너 DOM ID (사용자가 직접 구현)
    user_subscript = "free",
    // 사용자 구독 유형
    isEduUser = false,
    // EDU 사용자 여부
    hateSpeechFilter = null
    // 혐오발언 필터. getPromptResult 함수를 그대로 전달. service_type: 'filter_hate_speech' 자동 사용
  } = options;
  let guideContainer = null;
  let rawText = [];
  let rawCols = [];
  let columnMapping = { text: "", size: "\uC5C6\uC74C", date: "\uC5C6\uC74C" };
  let chunks = [];
  let inputContent = "";
  let excludedRows = /* @__PURE__ */ new Set();
  let filterExcludedRows = /* @__PURE__ */ new Set();
  const container = document.createElement("div");
  container.className = "file-input-v3";
  container.style.cssText = `width: ${width}px; font-family: var(--sans-serif, system-ui);`;
  const style = document.createElement("style");
  style.textContent = `
    .file-input-v3 {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .file-input-v3 .main-title {
      text-align: center;
      margin-bottom: 24px;
    }
    .file-input-v3 .main-title h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }
    .file-input-v3 .input-area {
      position: relative;
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      /* \uC708\uB3C4\uC6B0 \uB192\uC774\uC5D0 \uB530\uB77C \uAC00\uBCC0 \u2014 \uCD5C\uC18C 160px, \uAE30\uBCF8 40vh, \uCD5C\uB300 60vh */
      min-height: clamp(160px, 40vh, 60vh);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
    }
    .file-input-v3 .input-area.dragover {
      background: #e8f7f5;
      box-shadow: 0 2px 12px rgba(45,212,191,0.2);
    }
    .file-input-v3 .input-bottom-bar {
      position: absolute;
      bottom: 16px;
      left: 20px;
      right: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .file-input-v3 .attach-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 50%;
      cursor: pointer;
      color: #666;
      transition: all 0.2s;
      font-size: 20px;
      font-weight: 300;
    }
    .file-input-v3 .attach-btn:hover {
      background: #f5f5f5;
      border-color: #ccc;
      color: #333;
    }
    .file-input-v3 textarea {
      width: 100%;
      /* input-area\uC5D0 \uB9DE\uCDB0 \uB298\uC5B4\uB0A8, \uD558\uB2E8 bar(60px)\uB9CC\uD07C \uC81C\uC678 */
      flex: 1;
      min-height: 100px;
      resize: none;
      border: none;
      padding: 0 0 60px 0;
      font-size: 16px;
      line-height: 1.6;
      box-sizing: border-box;
      background: transparent;
      color: #333;
    }
    .file-input-v3 textarea:focus {
      outline: none;
    }
    .file-input-v3 textarea::placeholder {
      color: #999;
    }
    .file-input-v3 textarea.hidden {
      display: none;
    }
    .file-input-v3 .file-preview {
      display: none;
    }
    .file-input-v3 .file-preview.visible {
      display: block;
      padding: 0 0 60px 0;
    }
    .file-input-v3 .file-item {
      position: relative;
      margin-bottom: 8px;
      width: 250px;
    }
    .file-input-v3 .file-content-box {
      background: #f6f8f9;
      border: 1px solid #e0e5e9;
      border-radius: 8px;
      padding: 12px;
      position: relative;
    }
    .file-input-v3 .file-content-preview {
      font-size: 12px;
      color: #555;
      overflow: hidden;
      white-space: pre-wrap;
      line-height: 1.6;
      font-family: monospace;
      height: 120px;
    }
    .file-input-v3 .file-name {
      font-size: 13px;
      font-weight: 600;
      color: #2dd4bf;
      margin-top: 8px;
      text-align: center;
    }
    .file-input-v3 .delete-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 22px;
      height: 22px;
      background: #666;
      color: #fff;
      border: 0;
      border-radius: 50%;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 1;
    }
    .file-input-v3 .delete-btn:hover {
      background: #444;
    }
    .file-input-v3 .confirm-btn {
      background: #2dd4bf;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px 32px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      opacity: 0;
      pointer-events: none;
    }
    .file-input-v3 .confirm-btn.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .file-input-v3 .confirm-btn:hover {
      background: #14b8a6;
    }

    /* \uD31D\uC5C5 \uC2A4\uD0C0\uC77C */
    .file-input-v3-popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .file-input-v3-popup {
      background: #f8f8f8;
      border-radius: 20px;
      width: 90%;
      max-width: 1000px;
      /* dvh\uB294 \uBAA8\uBC14\uC77C \uBE0C\uB77C\uC6B0\uC800 \uD234\uBC14 \uD3EC\uD568\uD574\uC11C \uC2E4\uC81C \uBDF0\uD3EC\uD2B8 \uAE30\uC900, \uBBF8\uC9C0\uC6D0 \uC2DC vh \uD3F4\uBC31 */
      max-height: 90vh;
      max-height: 90dvh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 80px rgba(0,0,0,0.25);
    }
    .file-input-v3-popup-header {
      padding: 28px 32px 24px;
      background: #fff;
      flex-shrink: 0;
    }
    .file-input-v3-popup-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .file-input-v3-popup-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }
    /* Info icon with hover tooltip */
    .file-input-v3-popup-info {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .file-input-v3-popup-info .info-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      cursor: default;
    }
    .file-input-v3-popup-info .info-tooltip {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: #555;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      width: 280px;
      white-space: normal;
      word-break: keep-all;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      z-index: 100;
    }
    .file-input-v3-popup-info:hover .info-tooltip {
      opacity: 1;
      visibility: visible;
    }
    /* Weight column info tooltip */
    .file-input-v3-popup-selector-row .label .info-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-left: 4px;
    }
    .file-input-v3-popup-selector-row .label .info-wrapper .info-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }
    .file-input-v3-popup-selector-row .label .info-wrapper .weight-tooltip {
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
      background: #555;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.6;
      width: 280px;
      white-space: normal;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      z-index: 100;
    }
    .file-input-v3-popup-selector-row .label .info-wrapper:hover .weight-tooltip {
      opacity: 1;
      visibility: visible;
    }
    .file-input-v3-popup-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .file-input-v3-transpose-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v3-transpose-btn:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #ccc;
    }
    .file-input-v3-transpose-btn svg {
      width: 18px;
      height: 18px;
    }
    .file-input-v3-popup-selectors {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .file-input-v3-popup-selector-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
    .file-input-v3-popup-selector-row .label {
      color: #666;
      min-width: 120px;
    }
    .file-input-v3-popup-selector-row .label.required::after {
      content: ' *';
      color: #e53e3e;
    }
    .file-input-v3-popup-selector-row .label .info-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      font-size: 11px;
      color: #666;
      margin-left: 4px;
      cursor: help;
    }
    .file-input-v3-popup-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      background: #e0f7f4;
      color: #0d7680;
    }
    /* Size/Weight tag (light blue) */
    .file-input-v3-popup-tag.size-tag {
      background: #e8f4fc;
      color: #0369a1;
    }
    /* Date tag (light purple) */
    .file-input-v3-popup-tag.date-tag {
      background: #f3e8ff;
      color: #7c3aed;
    }
    .file-input-v3-popup-tag .remove {
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      opacity: 0.7;
    }
    .file-input-v3-popup-tag .remove:hover {
      opacity: 1;
    }
    .file-input-v3-popup-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      padding: 0;
      background: #fff;
    }
    .file-input-v3-popup-table {
      width: max-content;
      min-width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .file-input-v3-popup-table th {
      background: #f8f9fa;
      padding: 14px 16px;
      text-align: left;
      font-weight: 500;
      color: #666;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      white-space: nowrap;
      max-width: 200px;
      min-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s;
    }
    .file-input-v3-popup-table th .col-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .file-input-v3-popup-table th .check-icon {
      font-size: 14px;
      font-weight: bold;
    }
    /* Text column check icon (teal - darker) */
    .file-input-v3-popup-table th.selected .check-icon {
      color: #0d9488;
    }
    /* Size column check icon (blue - darker) */
    .file-input-v3-popup-table th.selected-size .check-icon {
      color: #0369a1;
    }
    /* Date column check icon (purple - darker) */
    .file-input-v3-popup-table th.selected-date .check-icon {
      color: #7c3aed;
    }
    .file-input-v3-popup-table th:hover {
      background: #f0f0f0;
    }
    .file-input-v3-popup-table th.row-num {
      background: #f0f0f0;
      color: #999;
      font-weight: 400;
      min-width: 50px;
      max-width: 50px;
      text-align: center;
      cursor: default;
    }
    .file-input-v3-popup-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #333;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-input-v3-popup-table td.row-num {
      background: #f8f9fa;
      color: #999;
      text-align: center;
      font-size: 12px;
    }
    .file-input-v3-popup-table tr:hover td:not(.row-num) {
      background: #fafafa;
    }
    .file-input-v3-popup-table th.selected {
      background: #e0f7f4;
      color: #0d7680;
      font-weight: 600;
    }
    .file-input-v3-popup-table td.selected {
      background: #e0f7f4;
    }
    .file-input-v3-popup-table th.selected:hover {
      background: #c8f0eb;
    }
    .file-input-v3-popup-table tr:hover td.selected {
      background: #c8f0eb;
    }
    /* Weight column highlight (light blue) */
    .file-input-v3-popup-table th.selected-size {
      background: #F5FBFF;
      color: #0d7680;
      font-weight: 600;
    }
    .file-input-v3-popup-table td.selected-size {
      background: #F5FBFF;
    }
    .file-input-v3-popup-table th.selected-size:hover {
      background: #e8f4fc;
    }
    .file-input-v3-popup-table tr:hover td.selected-size {
      background: #e8f4fc;
    }
    /* Date column highlight (light purple) */
    .file-input-v3-popup-table th.selected-date {
      background: #FBF5FF;
      color: #7c3aed;
      font-weight: 600;
    }
    .file-input-v3-popup-table td.selected-date {
      background: #FBF5FF;
    }
    .file-input-v3-popup-table th.selected-date:hover {
      background: #f3e8ff;
    }
    .file-input-v3-popup-table tr:hover td.selected-date {
      background: #f3e8ff;
    }
    .file-input-v3-filter-bar {
      padding: 12px 32px;
      background: #fafafa;
      border-top: 1px solid #eee;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .file-input-v3-filter-bar .filter-btn {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 7px 16px;
      font-size: 13px;
      color: #555;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .file-input-v3-filter-bar .filter-btn:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #bbb;
    }
    .file-input-v3-filter-bar .filter-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .file-input-v3-filter-bar .filter-progress {
      font-size: 13px;
      color: #888;
    }
    .file-input-v3-filter-bar .filter-result {
      font-size: 13px;
      color: #e53e3e;
    }
    .file-input-v3-popup-footer {
      padding: 20px 32px;
      background: #fff;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .file-input-v3-popup-footer .cancel-btn {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 25px;
      padding: 14px 40px;
      font-size: 15px;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v3-popup-footer .cancel-btn:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }
    .file-input-v3-popup-footer .complete-btn {
      background: #2dd4bf;
      color: #fff;
      border: none;
      border-radius: 25px;
      padding: 14px 40px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v3-popup-footer .complete-btn:hover {
      background: #14b8a6;
    }

    /* \uB4DC\uB86D\uB2E4\uC6B4 \uC120\uD0DD */
    .file-input-v3-dropdown {
      position: relative;
      display: inline-block;
    }
    .file-input-v3-dropdown select {
      appearance: none;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 32px 8px 14px;
      font-size: 13px;
      cursor: pointer;
    }
    .file-input-v3-dropdown::after {
      content: '\u25BC';
      font-size: 9px;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #888;
    }

    /* \uBBF8\uB9AC\uBCF4\uAE30 \uD654\uBA74 */
    .file-input-v3 .preview-section {
    width: 880px;
      display: none;
    }
    .file-input-v3 .preview-section.active {
      display: block;
      padding: 20px;
      background: #f9fafc;
      border-radius: 8px;
    }
    /* \uBBF8\uB9AC\uBCF4\uAE30 \uD65C\uC131\uD654 \uC2DC \uBA54\uC778 \uD0C0\uC774\uD2C0 \uC228\uAE40 */
    .file-input-v3 .preview-section.active ~ .main-title,
    .file-input-v3:has(.preview-section.active) .main-title {
      display: none;
    }
    .file-input-v3 .preview-header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .file-input-v3 .preview-title {
      font-size: 16px;
      font-weight: 700;
      color: #333;
    }
    .file-input-v3 .preview-edit-btn {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      color: #666;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .file-input-v3 .preview-edit-btn:hover {
      background: #f5f5f5;
    }
    .file-input-v3 .preview-copy-btn {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      color: #666;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .file-input-v3 .preview-copy-btn:hover {
      background: #f5f5f5;
    }
    .file-input-v3 .copy-toast {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .file-input-v3 .copy-toast.show {
      opacity: 1;
    }
    .file-input-v3 .preview-delete-btn {
      background: none;
      border: 1px solid #ddd;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 16px;
      color: #999;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .file-input-v3 .preview-delete-btn:hover {
      background: #fee;
      border-color: #e53e3e;
      color: #e53e3e;
    }
    .file-input-v3 .preview-table-wrapper {
      max-height: 350px;
      overflow: auto;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
    }
    .file-input-v3 .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 16px;
    }
    .file-input-v3 .preview-table th {
      background: #fff;
      padding: 14px 16px;
      text-align: left;
      font-weight: 600;
      color: #2dd4bf;
      position: sticky;
      top: 0;
      border-bottom: 1px solid #e8e8e8;
    }
    .file-input-v3 .preview-table th.size-col {
      text-align: right;
    }
    .file-input-v3 .preview-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #444;
    }
    .file-input-v3 .preview-table td.size-col {
      text-align: right;
      color: #666;
    }
    .file-input-v3 .preview-table td.chunk {
      max-width: 500px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-input-v3 .preview-table tr:last-child td {
      border-bottom: none;
    }
    .file-input-v3 .data-count {
      margin-top: 20px;
      padding: 16px 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }
    .file-input-v3 .data-count .textLength {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .file-input-v3 .data-count .textLength .over {
      color: #e53e3e;
    }
    .file-input-v3 .data-count .notice {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }
    .file-input-v3 .data-count .notice .bodyTitle {
      font-weight: 600;
      color: #333;
    }
    .file-input-v3 .data-count .notice .bodytext {
      color: #888;
    }
    .file-input-v3 .data-count .notice a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 10px 20px;
      background: #fff;
      border: 1px solid #2dd4bf;
      border-radius: 24px;
      color: #2dd4bf;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    .file-input-v3 .data-count .notice a:hover {
      background: #2dd4bf;
      color: #fff;
    }
  `;
  container.appendChild(style);
  container.innerHTML += `
    <div class="main-title">
      <h2>\uBD84\uC11D\uD560 \uB370\uC774\uD130\uB97C \uC785\uB825\uD558\uC138\uC694.</h2>
    </div>

    <div class="input-area">
      <textarea placeholder="\uD14D\uC2A4\uD2B8\uB97C \uBD99\uC5EC\uB123\uAC70\uB098 CSV \uD30C\uC77C\uC744 \uB4DC\uB86D\uD558\uC138\uC694."></textarea>
      <div class="file-preview"></div>
      <input type="file" accept=".csv,.tsv,.txt" style="display:none;">
      <div class="input-bottom-bar">
        <button class="attach-btn" title="\uD30C\uC77C \uCCA8\uBD80">+</button>
        <button class="confirm-btn">\uD655\uC778</button>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <span class="preview-title">\uC785\uB825\uD55C \uB370\uC774\uD130</span>
        <button class="preview-edit-btn">\uC218\uC815</button>
        <button class="preview-copy-btn">\uBCF5\uC0AC</button>
        <span style="flex:1;"></span>
        <button class="preview-delete-btn" title="\uC0AD\uC81C">\xD7</button>
      </div>
      <div class="preview-table-wrapper">
        <table class="preview-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="data-count"></div>
    </div>
  `;
  const textarea = container.querySelector("textarea");
  const filePreview = container.querySelector(".file-preview");
  const fileInput = container.querySelector("input[type=file]");
  const inputArea = container.querySelector(".input-area");
  const attachBtn = container.querySelector(".attach-btn");
  const confirmBtn = container.querySelector(".confirm-btn");
  const previewSection = container.querySelector(".preview-section");
  const previewTable = container.querySelector(".preview-table");
  const dataCountDiv = container.querySelector(".data-count");
  const editBtn = container.querySelector(".preview-edit-btn");
  const copyBtn = container.querySelector(".preview-copy-btn");
  const deleteBtn = container.querySelector(".preview-delete-btn");
  const mainTitle = container.querySelector(".main-title");
  if (guideContainerId) {
    guideContainer = document.getElementById(guideContainerId);
  }
  let attachedFile = null;
  function updateValue() {
    container.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }
  function updateInputState() {
    const hasFile = attachedFile !== null;
    const hasText = textarea.value.trim().length > 0;
    const hasContent = hasFile || hasText;
    confirmBtn.classList.toggle("visible", hasContent);
    textarea.classList.toggle("hidden", hasFile);
    filePreview.classList.toggle("visible", hasFile);
  }
  function updateFilePreview() {
    if (!attachedFile) {
      filePreview.innerHTML = "";
      return;
    }
    const previewLines = attachedFile.content.split("\n").slice(0, 6).join("\n");
    filePreview.innerHTML = `
      <div class="file-item">
        <div class="file-content-box">
          <button class="delete-btn">\xD7</button>
          <div class="file-content-preview">${escapeHtml(previewLines)}</div>
        </div>
        <div class="file-name">${escapeHtml(attachedFile.name)}</div>
      </div>
    `;
    filePreview.querySelector(".delete-btn").addEventListener("click", () => {
      attachedFile = null;
      inputContent = "";
      textarea.value = "";
      chunks = [];
      updateFilePreview();
      updateInputState();
      updateValue();
    });
  }
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  textarea.addEventListener("input", () => {
    updateInputState();
  });
  textarea.addEventListener("paste", (e) => {
    setTimeout(() => {
      const text = textarea.value.trim();
      if (text) {
        attachedFile = { name: "Pasted Data", content: text };
        inputContent = text;
        updateFilePreview();
      }
      updateInputState();
    }, 0);
  });
  inputArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    inputArea.classList.add("dragover");
  });
  inputArea.addEventListener("dragleave", () => {
    inputArea.classList.remove("dragover");
  });
  inputArea.addEventListener("drop", (e) => {
    e.preventDefault();
    inputArea.classList.remove("dragover");
    if (e.dataTransfer.files?.length > 0) {
      readFile(e.dataTransfer.files[0]);
    } else {
      const text = e.dataTransfer.getData("text");
      if (text) {
        attachedFile = { name: "Pasted Data", content: text };
        inputContent = text;
        updateFilePreview();
        updateInputState();
      }
    }
  });
  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      attachedFile = { name: file.name, content: e.target.result };
      inputContent = e.target.result;
      updateFilePreview();
      updateInputState();
    };
    reader.readAsText(file);
  }
  attachBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      readFile(e.target.files[0]);
      fileInput.value = "";
    }
  });
  confirmBtn.addEventListener("click", () => {
    if (!inputContent && textarea.value.trim()) {
      inputContent = textarea.value.trim();
      attachedFile = { name: "Pasted Data", content: inputContent };
    }
    if (!inputContent) return;
    processDataAndShowPopup();
  });
  function processDataAndShowPopup() {
    inputContent = inputContent.trimEnd();
    const format = detectFormat(Papa, inputContent);
    const parseOptions = {
      header: true,
      skipEmptyLines: true,
      delimiter: format === "tsv" ? "	" : ",",
      transformHeader: (h) => h.trim().replace(/^["']|["']$/g, "")
    };
    if (format === "csv") {
      parseOptions.quoteChar = '"';
    } else if (format === "tsv") {
      parseOptions.quoteChar = "\0";
    }
    let contentToParse = format === "text" ? "text\n" + inputContent : inputContent;
    if (format === "tsv") {
      contentToParse = _mergeTsvQuotedNewlines(inputContent);
    }
    const parsed = Papa.parse(contentToParse, parseOptions);
    rawText = parsed.data.filter((d) => Object.values(d).some((v) => v && String(v).trim()));
    if (rawText.length === 0) {
      alert("\uC720\uD6A8\uD55C \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
      return;
    }
    rawCols = parsed.meta.fields.filter((d) => d && !d.startsWith("_"));
    const guessedText = guessTextKey(rawCols, rawText);
    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    const dateCandidates = findDateKeyCandidates(moment, rawCols, rawText);
    columnMapping.text = guessedText;
    columnMapping.size = sizeCandidates.includes("\uAC00\uC911\uCE58") ? "\uAC00\uC911\uCE58" : "\uC5C6\uC74C";
    columnMapping.date = dateCandidates.length > 0 ? dateCandidates[0] : "\uC5C6\uC74C";
    showPopup(sizeCandidates, dateCandidates);
  }
  function parseFilterResponse(raw, batchLen) {
    if (!raw || raw.trim() === "\uC5C6\uC74C") return [];
    return raw.split(/[,，\s]+/).map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n >= 1 && n <= batchLen);
  }
  function showPopup(sizeCandidates, dateCandidates, fromEdit = false) {
    const savedMapping = { ...columnMapping };
    const overlay = document.createElement("div");
    overlay.className = "file-input-v3-popup-overlay";
    const popup = document.createElement("div");
    popup.className = "file-input-v3-popup";
    const hasSizeOptions = sizeCandidates.length > 0;
    const hasDateOptions = dateCandidates.length > 0;
    if (!fromEdit) {
      excludedRows = /* @__PURE__ */ new Set();
      filterExcludedRows = /* @__PURE__ */ new Set();
    }
    const transposeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="4" height="10" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="8" width="4" height="10" rx="1" transform="rotate(-90 10 8)" stroke="currentColor" stroke-width="2"/>
      <path d="M20 12V15C20 17.2091 18.2091 19 16 19H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const infoIcon = `<i class="fi fi-ss-info" style="font-size:14px;color:#666;"></i>`;
    const infoIconSmall = `<i class="fi fi-ss-info" style="font-size:14px;color:#666;"></i>`;
    popup.innerHTML = `
      <div class="file-input-v3-popup-header">
        <div class="file-input-v3-popup-title-row">
          <h2 class="file-input-v3-popup-title">\uBD84\uC11D \uB370\uC774\uD130 \uC120\uD0DD \uBC0F \uB2E4\uB4EC\uAE30</h2>
          <div class="file-input-v3-popup-actions">
            <div class="file-input-v3-popup-info">
              <span class="info-trigger">${infoIcon}</span>
              <div class="info-tooltip">
                \uBD84\uC11D\uD560 \uC8FC\uB370\uC774\uD130\uB294 \uBC18\uB4DC\uC2DC \uD558\uB098\uC758 \uCEEC\uB7FC\uC5D0 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4.<br>
                \uD544\uC694 \uC2DC \uD14C\uC774\uBE14\uC758 \uD5E4\uB354 \uC704\uCE58\uB97C \uBCC0\uD658\uD558\uC138\uC694.
              </div>
            </div>
            <button class="file-input-v3-transpose-btn">
              ${transposeIcon}
              \uD14C\uC774\uBE14 \uD589\uC5F4 \uBC14\uAFB8\uAE30
            </button>
          </div>
        </div>
        <div class="file-input-v3-popup-selectors">
          <div class="file-input-v3-popup-selector-row">
            <span class="label required">\uBD84\uC11D\uD560 \uD14D\uC2A4\uD2B8 \uCEEC\uB7FC</span>
            <span class="file-input-v3-popup-tag text-tag">
              ${columnMapping.text}
              <span class="remove">\xD7</span>
            </span>
            <div class="file-input-v3-dropdown" style="display:none;">
              <select class="text-column-select">
                ${rawCols.map((col) => `<option value="${col}" ${col === columnMapping.text ? "selected" : ""}>${col}</option>`).join("")}
              </select>
            </div>
          </div>
          ${hasSizeOptions ? `
          <div class="file-input-v3-popup-selector-row">
            <span class="label">\uAC00\uC911\uCE58 \uCEEC\uB7FC <span class="info-wrapper"><span class="info-icon">${infoIconSmall}</span><div class="weight-tooltip">\uAC00\uC911\uCE58\uC5D0 \uB530\uB77C \uC911\uC694\uD55C \uBC84\uBE14 \uD06C\uAE30\uB97C \uD06C\uAC8C \uD45C\uC2DC\uD569\uB2C8\uB2E4. \uC5C6\uC74C\uC73C\uB85C \uD558\uBA74 \uB3D9\uC77C\uD55C \uAC00\uC911\uCE58\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. <br><br><strong>\uC608\uC2DC:</strong><br>\u2022 \uD074\uB9AD\uC218: 50, 120, 35 \u2192 120\uC774 \uAC00\uC7A5 \uD070 \uBC84\uBE14<br>\u2022 \uC88B\uC544\uC694: \uB4F1\uC740 log\uB098 \uC81C\uACF1\uADFC \uC2A4\uCF00\uC77C\uB85C \uBCC0\uD658\uD558\uC5EC \uBC18\uC601\uD558\uB294 \uAC83\uC774 \uC88B\uC2B5\uB2C8\uB2E4.</div></span></span>
            <span class="file-input-v3-popup-tag size-tag" ${columnMapping.size === "\uC5C6\uC74C" ? 'style="display:none;"' : ""}>
              ${columnMapping.size}
              <span class="remove">\xD7</span>
            </span>
            <div class="file-input-v3-dropdown" ${columnMapping.size !== "\uC5C6\uC74C" ? 'style="display:none;"' : ""}>
              <select class="size-column-select">
                <option value="\uC5C6\uC74C">\uC5C6\uC74C</option>
                ${sizeCandidates.map((col) => `<option value="${col}" ${col === columnMapping.size ? "selected" : ""}>${col}</option>`).join("")}
              </select>
            </div>
          </div>
          ` : ""}
          ${hasDateOptions ? `
          <div class="file-input-v3-popup-selector-row">
            <span class="label">\uB0A0\uC9DC \uCEEC\uB7FC</span>
            <span class="file-input-v3-popup-tag date-tag" ${columnMapping.date === "\uC5C6\uC74C" ? 'style="display:none;"' : ""}>
              ${columnMapping.date}
              <span class="remove">\xD7</span>
            </span>
            <div class="file-input-v3-dropdown" ${columnMapping.date !== "\uC5C6\uC74C" ? 'style="display:none;"' : ""}>
              <select class="date-column-select">
                <option value="\uC5C6\uC74C">\uC5C6\uC74C</option>
                ${dateCandidates.map((col) => `<option value="${col}" ${col === columnMapping.date ? "selected" : ""}>${col}</option>`).join("")}
              </select>
            </div>
          </div>
          ` : ""}
        </div>
      </div>
      <div class="file-input-v3-popup-body">
        <table class="file-input-v3-popup-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
      ${hateSpeechFilter ? `
      <div class="file-input-v3-filter-bar">
        <button class="filter-btn">
          <i class="fi fi-rr-shield-exclamation"></i>
          \uC695\uC124\xB7\uD610\uC624 \uC81C\uAC70
        </button>
        <span class="filter-progress" style="display:none;">\uCC98\uB9AC \uC911... <span class="fp-current">0</span> / <span class="fp-total">0</span></span>
        <span class="filter-result" style="display:none;"><span class="fp-removed">0</span>\uAC74 \uC81C\uAC70\uB428</span>
      </div>
      ` : ""}
      <div class="file-input-v3-popup-footer">
        <button class="cancel-btn">\uCDE8\uC18C</button>
        <button class="complete-btn">\uC644\uB8CC</button>
      </div>
    `;
    function renderTable() {
      const thead = popup.querySelector("thead");
      const tbody = popup.querySelector("tbody");
      const checkIcon = `<span class="check-icon">\u2713</span>`;
      const displayedRows = rawText.slice(0, maxSize);
      const allChecked = displayedRows.every((_, idx) => !excludedRows.has(idx));
      thead.innerHTML = `
        <tr>
          <th class="row-num">
            <input type="checkbox" class="select-all-checkbox" ${allChecked ? "checked" : ""}>
          </th>
          ${rawCols.map((col) => {
        const isText = col === columnMapping.text;
        const isSize = col === columnMapping.size;
        const isDate = col === columnMapping.date;
        let selectedClass = "";
        if (isText) selectedClass = "selected";
        else if (isSize) selectedClass = "selected-size";
        else if (isDate) selectedClass = "selected-date";
        const isSelected = isText || isSize || isDate;
        return `<th class="${selectedClass}" data-col="${col}" title="${col}">
              <span class="col-header">${isSelected ? checkIcon : ""}${col}</span>
            </th>`;
      }).join("")}
        </tr>
      `;
      tbody.innerHTML = displayedRows.map((row, idx) => {
        const isExcluded = excludedRows.has(idx);
        return `
          <tr data-row-idx="${idx}" style="${isExcluded ? "opacity:0.4;" : ""}">
            <td class="row-num">
              <input type="checkbox" class="row-checkbox" data-idx="${idx}" ${isExcluded ? "" : "checked"}>
            </td>
            ${rawCols.map((col) => {
          const isText = col === columnMapping.text;
          const isSize = col === columnMapping.size;
          const isDate = col === columnMapping.date;
          let selectedClass = "";
          if (isText) selectedClass = "selected";
          else if (isSize) selectedClass = "selected-size";
          else if (isDate) selectedClass = "selected-date";
          const value = String(row[col] || "").slice(0, 200);
          return `<td class="${selectedClass}" data-col="${col}">${value}</td>`;
        }).join("")}
          </tr>
        `;
      }).join("");
      setupCheckboxHandlers();
    }
    function setupCheckboxHandlers() {
      const checkboxes = popup.querySelectorAll(".row-checkbox");
      const selectAllCheckbox = popup.querySelector(".select-all-checkbox");
      const displayedRows = rawText.slice(0, maxSize);
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", (e) => {
          const isChecked = e.target.checked;
          displayedRows.forEach((_, idx) => {
            const row = popup.querySelector(`tr[data-row-idx="${idx}"]`);
            const cb = popup.querySelector(`.row-checkbox[data-idx="${idx}"]`);
            if (isChecked) {
              excludedRows.delete(idx);
              if (row) row.style.opacity = "1";
              if (cb) cb.checked = true;
            } else {
              excludedRows.add(idx);
              if (row) row.style.opacity = "0.4";
              if (cb) cb.checked = false;
            }
          });
        });
      }
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
          const idx = parseInt(e.target.dataset.idx);
          const row = popup.querySelector(`tr[data-row-idx="${idx}"]`);
          if (e.target.checked) {
            excludedRows.delete(idx);
            row.style.opacity = "1";
          } else {
            excludedRows.add(idx);
            row.style.opacity = "0.4";
          }
          if (selectAllCheckbox) {
            const allChecked = displayedRows.every((_, i) => !excludedRows.has(i));
            selectAllCheckbox.checked = allChecked;
          }
        });
      });
    }
    renderTable();
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    const transposeBtn = popup.querySelector(".file-input-v3-transpose-btn");
    if (transposeBtn) {
      transposeBtn.addEventListener("click", () => {
        if (!popup._originalData) {
          popup._originalData = { cols: [...rawCols], data: [...rawText] };
        }
        if (popup._isTransposed) {
          rawCols = popup._originalData.cols;
          rawText = popup._originalData.data;
          popup._isTransposed = false;
        } else {
          const format = detectFormat(Papa, inputContent);
          const reparsed = Papa.parse(
            format === "text" ? inputContent : inputContent,
            {
              header: false,
              // 헤더 없이 파싱
              skipEmptyLines: true,
              delimiter: format === "tsv" ? "	" : format === "csv" ? "," : void 0,
              quoteChar: format === "tsv" ? "\0" : '"'
            }
          );
          const matrix = reparsed.data.filter((row) => row.some((cell) => cell && String(cell).trim()));
          if (matrix.length > 0 && matrix[0].length > 0) {
            const newCols = matrix.map((row) => String(row[0] || "").trim() || "Row");
            const colCount = Math.max(...matrix.map((row) => row.length));
            const newData = [];
            for (let c = 1; c < colCount; c++) {
              const obj = {};
              matrix.forEach((row, r) => {
                obj[newCols[r]] = row[c] || "";
              });
              newData.push(obj);
            }
            rawCols = newCols;
            rawText = newData;
          }
          popup._isTransposed = true;
        }
        columnMapping.text = rawCols[0] || "";
        columnMapping.size = "\uC5C6\uC74C";
        columnMapping.date = "\uC5C6\uC74C";
        excludedRows.clear();
        updateAllTagsUI();
        renderTable();
        setupHeaderClickHandlers();
      });
    }
    function updateAllTagsUI() {
      updateTextTagUI();
      if (hasSizeOptions) updateSizeTagUI();
      if (hasDateOptions) updateDateTagUI();
    }
    const textTag = popup.querySelector(".text-tag");
    const textDropdown = popup.querySelector(".file-input-v3-dropdown");
    const textSelect = popup.querySelector(".text-column-select");
    textTag?.querySelector(".remove")?.addEventListener("click", () => {
      textTag.style.display = "none";
      textDropdown.style.display = "inline-block";
    });
    function updateTextTagUI() {
      textTag.innerHTML = columnMapping.text + '<span class="remove">\xD7</span>';
      textTag.style.display = "inline-flex";
      textDropdown.style.display = "none";
      textSelect.innerHTML = rawCols.map(
        (col) => `<option value="${col}" ${col === columnMapping.text ? "selected" : ""}>${col}</option>`
      ).join("");
      textTag.querySelector(".remove")?.addEventListener("click", () => {
        textTag.style.display = "none";
        textDropdown.style.display = "inline-block";
      });
    }
    textSelect?.addEventListener("change", () => {
      columnMapping.text = textSelect.value;
      updateTextTagUI();
      renderTable();
      setupHeaderClickHandlers();
    });
    const dateTag = hasDateOptions ? popup.querySelector(".date-tag") : null;
    const dateDropdown = hasDateOptions ? popup.querySelector(".date-column-select")?.parentElement : null;
    const dateSelect = hasDateOptions ? popup.querySelector(".date-column-select") : null;
    function updateDateTagUI() {
      if (!hasDateOptions || !dateTag) return;
      if (columnMapping.date === "\uC5C6\uC74C") {
        dateTag.style.display = "none";
        if (dateDropdown) dateDropdown.style.display = "inline-block";
        if (dateSelect) dateSelect.value = "\uC5C6\uC74C";
      } else {
        dateTag.innerHTML = columnMapping.date + '<span class="remove">\xD7</span>';
        dateTag.style.display = "inline-flex";
        if (dateDropdown) dateDropdown.style.display = "none";
        if (dateSelect) dateSelect.value = columnMapping.date;
        dateTag.querySelector(".remove")?.addEventListener("click", () => {
          columnMapping.date = "\uC5C6\uC74C";
          updateDateTagUI();
          renderTable();
          setupHeaderClickHandlers();
        });
      }
    }
    if (hasDateOptions) {
      dateTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.date = "\uC5C6\uC74C";
        updateDateTagUI();
        renderTable();
        setupHeaderClickHandlers();
      });
      dateSelect?.addEventListener("change", () => {
        columnMapping.date = dateSelect.value;
        updateDateTagUI();
        renderTable();
        setupHeaderClickHandlers();
      });
    }
    const sizeTag = hasSizeOptions ? popup.querySelector(".size-tag") : null;
    const sizeDropdown = hasSizeOptions ? popup.querySelector(".size-column-select")?.parentElement : null;
    const sizeSelect = hasSizeOptions ? popup.querySelector(".size-column-select") : null;
    function updateSizeTagUI() {
      if (!hasSizeOptions || !sizeTag) return;
      if (columnMapping.size === "\uC5C6\uC74C") {
        sizeTag.style.display = "none";
        if (sizeDropdown) sizeDropdown.style.display = "inline-block";
        if (sizeSelect) sizeSelect.value = "\uC5C6\uC74C";
      } else {
        sizeTag.innerHTML = columnMapping.size + '<span class="remove">\xD7</span>';
        sizeTag.style.display = "inline-flex";
        if (sizeDropdown) sizeDropdown.style.display = "none";
        if (sizeSelect) sizeSelect.value = columnMapping.size;
        sizeTag.querySelector(".remove")?.addEventListener("click", () => {
          columnMapping.size = "\uC5C6\uC74C";
          updateSizeTagUI();
          renderTable();
          setupHeaderClickHandlers();
        });
      }
    }
    if (hasSizeOptions) {
      sizeTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.size = "\uC5C6\uC74C";
        updateSizeTagUI();
        renderTable();
        setupHeaderClickHandlers();
      });
      sizeSelect?.addEventListener("change", () => {
        columnMapping.size = sizeSelect.value;
        updateSizeTagUI();
        renderTable();
        setupHeaderClickHandlers();
      });
    }
    function setupHeaderClickHandlers() {
      const headers = popup.querySelectorAll(".file-input-v3-popup-table th:not(.row-num)");
      headers.forEach((th) => {
        const newTh = th.cloneNode(true);
        th.parentNode.replaceChild(newTh, th);
        newTh.addEventListener("click", () => {
          const col = newTh.dataset.col;
          if (!col) return;
          const isSize = sizeCandidates.includes(col);
          const isDate = dateCandidates.includes(col);
          if (isSize) {
            if (columnMapping.size === col) {
              columnMapping.size = "\uC5C6\uC74C";
            } else {
              columnMapping.size = col;
            }
            updateSizeTagUI();
          } else if (isDate) {
            if (columnMapping.date === col) {
              columnMapping.date = "\uC5C6\uC74C";
            } else {
              columnMapping.date = col;
            }
            updateDateTagUI();
          } else {
            columnMapping.text = col;
            updateTextTagUI();
          }
          renderTable();
          setupHeaderClickHandlers();
        });
      });
    }
    setupHeaderClickHandlers();
    if (hateSpeechFilter) {
      const filterBtn = popup.querySelector(".filter-btn");
      const completeBtn = popup.querySelector(".complete-btn");
      const filterProgress = popup.querySelector(".filter-progress");
      const filterResult = popup.querySelector(".filter-result");
      const fpCurrent = popup.querySelector(".fp-current");
      const fpTotal = popup.querySelector(".fp-total");
      const fpRemoved = popup.querySelector(".fp-removed");
      if (filterExcludedRows.size > 0) {
        filterResult.style.display = "";
        fpRemoved.textContent = filterExcludedRows.size;
      }
      filterBtn.addEventListener("click", async () => {
        const textKey = columnMapping.text;
        if (!textKey) return;
        const totalRows = rawText.length;
        filterExcludedRows.forEach((idx) => excludedRows.delete(idx));
        filterExcludedRows = /* @__PURE__ */ new Set();
        filterBtn.disabled = true;
        completeBtn.disabled = true;
        filterResult.style.display = "none";
        filterProgress.style.display = "";
        fpTotal.textContent = totalRows;
        fpCurrent.textContent = 0;
        const batchSize = 50;
        let processed = 0;
        let removedCount = 0;
        const filterFn = async (texts) => {
          const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join("\n");
          const resp = await hateSpeechFilter(
            { service_type: "filter_hate_speech", texts: numbered },
            null
          );
          const raw = Array.isArray(resp?.result) ? resp.result[0] : resp?.result;
          return parseFilterResponse(String(raw || "\uC5C6\uC74C"), texts.length);
        };
        for (let i = 0; i < totalRows; i += batchSize) {
          const batchRows = rawText.slice(i, i + batchSize);
          const texts = batchRows.map(
            (row) => String(row[textKey] || "").replace(/\n/g, " ").trim()
          );
          try {
            const flagged = await filterFn(texts);
            flagged.forEach((n) => {
              const globalIdx = i + (n - 1);
              if (globalIdx >= 0 && globalIdx < totalRows) {
                excludedRows.add(globalIdx);
                filterExcludedRows.add(globalIdx);
                removedCount++;
              }
            });
          } catch (e) {
            console.warn("Filter batch error (skipped):", e);
          }
          processed += batchRows.length;
          fpCurrent.textContent = processed;
          renderTable();
          setupCheckboxHandlers();
        }
        filterBtn.disabled = false;
        completeBtn.disabled = false;
        filterProgress.style.display = "none";
        filterResult.style.display = "";
        fpRemoved.textContent = removedCount;
      });
    }
    popup.querySelector(".cancel-btn").addEventListener("click", () => {
      columnMapping.text = savedMapping.text;
      columnMapping.size = savedMapping.size;
      columnMapping.date = savedMapping.date;
      overlay.remove();
      if (fromEdit) {
        updatePreview();
      }
    });
    popup.querySelector(".complete-btn").addEventListener("click", () => {
      overlay.remove();
      finalizeData();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        columnMapping.text = savedMapping.text;
        columnMapping.size = savedMapping.size;
        columnMapping.date = savedMapping.date;
        overlay.remove();
        if (fromEdit) {
          updatePreview();
        }
      }
    });
  }
  function finalizeData() {
    const textKey = columnMapping.text;
    const sizeKey = columnMapping.size === "\uC5C6\uC74C" ? null : columnMapping.size;
    const dateKey = columnMapping.date === "\uC5C6\uC74C" ? null : columnMapping.date;
    const activeData = rawText.filter((_, idx) => !excludedRows.has(idx));
    const filtered = activeData.filter((d) => {
      const v = d?.[textKey];
      return typeof v === "string" && v.replace(/\\n/g, "\n").trim().length > 0;
    });
    const sampled = reservoirSample(filtered, maxSize)[0];
    chunks = sampled.map((d, i) => ({
      ...d,
      textid: i + 1,
      text: String(d[textKey] || "").replace(/\\n/g, "\n"),
      chunk: String(d[textKey] || "").replace(/\\n/g, "\n"),
      size: sizeKey ? +d[sizeKey] || 1 : 1,
      ...dateKey ? { date: d[dateKey] } : {}
    }));
    inputArea.style.display = "none";
    if (guideContainer) guideContainer.style.display = "none";
    if (mainTitle) mainTitle.style.display = "none";
    updatePreview();
    updateValue();
  }
  function updatePreview() {
    if (!showPreview || chunks.length === 0) {
      previewSection.classList.remove("active");
      document.body.classList.remove("data-attached");
      document.body.classList.add("no-data");
      return;
    }
    previewSection.classList.add("active");
    document.body.classList.add("data-attached");
    document.body.classList.remove("no-data");
    const rows = chunks.slice(0, 100);
    const hasSizeCol = columnMapping.size !== "\uC5C6\uC74C";
    const hasDateCol = columnMapping.date !== "\uC5C6\uC74C";
    const thead = previewTable.querySelector("thead");
    const tbody = previewTable.querySelector("tbody");
    thead.innerHTML = `
      <tr>
        <th style="width:40px;">#</th>
        <th>${columnMapping.text}</th>
        ${hasDateCol ? '<th style="width:100px;">\uB0A0\uC9DC</th>' : ""}
        ${hasSizeCol ? '<th class="size-col" style="width:80px;">Size</th>' : ""}
      </tr>
    `;
    tbody.innerHTML = rows.map((d) => `
      <tr>
        <td>${d.textid}</td>
        <td class="chunk" title="${escapeHtml(d.chunk)}">${escapeHtml(d.chunk.slice(0, 200))}</td>
        ${hasDateCol ? `<td>${d.date || ""}</td>` : ""}
        ${hasSizeCol ? `<td class="size-col">${d.size}</td>` : ""}
      </tr>
    `).join("");
    const activeCount = rawText.filter((_, idx) => !excludedRows.has(idx)).length;
    const isOver = activeCount > maxSize;
    const showNotice = isOver || chunks.length > 1500;
    let noticeContent = "";
    if (user_subscript.match(/demo/i) && isOver) {
      noticeContent = `<span class="bodyTitle">\uB370\uBAA8\uC6A9\uC73C\uB85C \uD55C \uBC88\uC5D0 ${maxSize}\uAC1C\uAE4C\uC9C0\uB9CC \uBD84\uC11D\uD569\uB2C8\uB2E4.</span><br>
<span class="bodytext">\uD68C\uC6D0 \uAC00\uC785 \uC2DC 100\uAC1C\uAE4C\uC9C0 \uBD84\uC11D \uBC0F \uBAA8\uB4E0 \uAE30\uB2A5 \uC0AC\uC6A9\uAC00\uB2A5\uD558\uBA70,<br> \uC720\uB8CC \uAD6C\uB3C5 \uC2DC 1,000\uAC1C~3,000\uAC1C\uAE4C\uC9C0 \uAC00\uB2A5\uD569\uB2C8\uB2E4.</span>`;
    } else if (user_subscript.match(/free|basic/i) && isOver && isEduUser) {
      noticeContent = `EDU \uC0AC\uC6A9\uC790\uB294 ${activeCount}\uAC1C\uC911 \uCC98\uC74C ${maxSize}\uAC1C\uAE4C\uC9C0 \uBD84\uC11D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
    } else if (user_subscript.match(/free|basic/i) && isOver) {
      noticeContent = `${activeCount}\uAC1C\uC911 \uCC98\uC74C ${maxSize}\uAC1C\uAE4C\uC9C0 \uBD84\uC11D\uD569\uB2C8\uB2E4.<br>
<span class="bodytext">\uC720\uB8CC \uAD6C\uB3C5\uC2DC \uC0AC\uC6A9 \uC2DC 1,000\uAC1C\uAE4C\uC9C0 \uAC00\uB2A5\uD569\uB2C8\uB2E4.</span>`;
    } else if (isOver) {
      noticeContent = `${activeCount}\uAC1C\uC911 ${maxSize}\uAC1C\uB97C \uBB34\uC791\uC704 \uD45C\uBCF8 \uCD94\uCD9C\uD569\uB2C8\uB2E4. \uC804\uCCB4\uB97C \uB300\uD45C\uD558\uB294 \uB0B4\uC6A9\uC774\uB77C\uACE0 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
    }
    if (chunks.length > 1500) {
      noticeContent += `${noticeContent ? "<br><br>" : ""}<span style="color:#e53e3e;">\uC8FC\uC758 : \uB370\uC774\uD130\uC14B \uD06C\uAE30\uAC00 \uD06C\uBA74 \uCEF4\uD4E8\uD130 \uC0AC\uC591\uC5D0 \uB530\uB77C \uBC18\uC751\uC774 \uB290\uB824\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.<br>\uBAA9\uC801\uC5D0 \uB530\uB77C \uC801\uB2F9\uD55C \uC0D8\uD50C \uD06C\uAE30\uB97C \uC0AC\uC6A9\uD558\uB294 \uAC78 \uAD8C\uC7A5\uD569\uB2C8\uB2E4.</span>`;
    }
    let actionButton = "";
    if (user_subscript.match(/demo/i) && isOver) {
      actionButton = `<a href="/welcome" target="_blank">\uBB34\uB8CC \uD68C\uC6D0 \uAC00\uC785 \u2197</a>`;
    } else if (user_subscript.match(/free|basic/i) && isOver && !isEduUser) {
      actionButton = `<a href="/plan" target="_blank">\uC5C5\uADF8\uB808\uC774\uB4DC\uD558\uAE30 \u2197</a>`;
    }
    const textLength = `
      <div class="textLength">
        <span style="font-weight:bold;" class="${isOver ? "over" : ""}">${chunks.length}</span>
        <span style="opacity:0.5;"><span style="padding:0 5px;">/</span>${maxSize}</span>
      </div>
    `;
    const notice = showNotice ? `
      <div class="notice">
        <div style="display:grid; grid-template-columns:1fr auto; gap:16px; align-items:center;">
          <div class="_left">${noticeContent}</div>
          <div style="display:flex; justify-content:flex-end; align-items:center;">${actionButton}</div>
        </div>
      </div>
    ` : "";
    dataCountDiv.innerHTML = textLength + notice;
  }
  deleteBtn.addEventListener("click", () => {
    if (confirm("\uC785\uB825\uD55C \uB370\uC774\uD130\uC640 \uBD84\uC11D \uACB0\uACFC\uAC00 \uBAA8\uB450 \uC0AD\uC81C\uB429\uB2C8\uB2E4.\n\uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) {
      container.clear();
    }
  });
  editBtn.addEventListener("click", () => {
    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    const dateCandidates = findDateKeyCandidates(moment, rawCols, rawText);
    showPopup(sizeCandidates, dateCandidates, true);
  });
  copyBtn.addEventListener("click", async () => {
    if (!inputContent) return;
    try {
      await navigator.clipboard.writeText(inputContent);
      const toast = document.createElement("div");
      toast.className = "copy-toast show";
      toast.textContent = "\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4";
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  });
  Object.defineProperty(container, "value", {
    get: () => chunks,
    set: (v) => {
      chunks = v || [];
      updatePreview();
    }
  });
  Object.defineProperty(container, "columnMapping", {
    get: () => ({ ...columnMapping })
  });
  Object.defineProperty(container, "rawData", {
    get: () => rawText
  });
  Object.defineProperty(container, "fileInfo", {
    get: () => attachedFile ? { ...attachedFile } : null
  });
  container.addSampleData = function(fileData) {
    if (!fileData?.content) return;
    attachedFile = {
      name: fileData.name || "Sample Data",
      content: fileData.content
    };
    inputContent = fileData.content;
    updateFilePreview();
    updateInputState();
  };
  container.clear = function() {
    attachedFile = null;
    inputContent = "";
    rawText = [];
    rawCols = [];
    columnMapping = { text: "", size: "\uC5C6\uC74C", date: "\uC5C6\uC74C" };
    chunks = [];
    excludedRows = /* @__PURE__ */ new Set();
    textarea.value = "";
    updateFilePreview();
    updateInputState();
    previewSection.classList.remove("active");
    document.body.classList.remove("data-attached");
    document.body.classList.add("no-data");
    inputArea.style.display = "";
    if (guideContainer) guideContainer.style.display = "";
    if (mainTitle) mainTitle.style.display = "";
  };
  document.body.classList.add("no-data");
  return container;
}
var file_input_library_v3_default = { createFileInputUIv3 };
export {
  createFileInputUIv3,
  file_input_library_v3_default as default
};
