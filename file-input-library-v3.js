/**
 * File Input Library V3 for Observable
 *
 * 입력 3안: 기본화면에서 입력창이 바로 표시되고, 확인 버튼 클릭 시 팝업에서 컬럼 선택
 * 최종 출력: chunkData 배열 [{ textid, chunk, text, size?, date?, ...원본컬럼 }]
 *
 * Observable 사용법:
 * viewof fileInput = InputLib3.createFileInputUIv3(Papa, {
 *   maxSize: 1000,
 *   sampleButtons: [
 *     { label: "샘플1", content: "text\n첫번째 텍스트\n두번째 텍스트" }
 *   ]
 * })
 */

/**
 * 파일 포맷 감지 (CSV, TSV, Text)
 */
function detectFormat(Papa, input) {
  if (typeof input !== "string") return "text";

  const lines = input.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return "text";

  const sampleLines = lines.slice(0, 20);

  if (isLikelyDelimited(Papa, sampleLines, "\t")) {
    const tsv = Papa.parse(sampleLines.join("\n"), {
      delimiter: "\t",
      skipEmptyLines: true
    });
    if (tsv.errors.length === 0 && tsv.data[0]?.length > 1) {
      return "tsv";
    }
  }

  if (isLikelyDelimited(Papa, sampleLines, ",")) {
    const csv = Papa.parse(sampleLines.join("\n"), {
      delimiter: ",",
      skipEmptyLines: true
    });
    if (csv.errors.length === 0 && csv.data[0]?.length > 1) {
      return "csv";
    }
  }

  return "text";
}

function isLikelyDelimited(Papa, lines, delimiter) {
  if (lines.length < 2) return false;

  const columnCounts = lines.map((line) => {
    const parsed = Papa.parse(line, { delimiter });
    return parsed.data[0]?.length || 0;
  });

  if (columnCounts[0] < 2) return false;

  const headerCount = columnCounts[0];
  const matchingRows = columnCounts.filter((c) => c === headerCount).length;
  const consistencyRatio = matchingRows / columnCounts.length;

  if (consistencyRatio < 0.8) return false;
  if (delimiter === "," && headerCount > 30) return false;

  return true;
}

function guessTextKey(rawCols, rawText) {
  if (rawCols?.includes("text")) return "text";
  if (rawCols?.includes("텍스트")) return "텍스트";
  if (!rawCols?.length) return "";

  const sampleRows = rawText?.slice(0, 50) ?? [];

  const cols = rawCols.map((key) => {
    let len = 0;
    for (const d of sampleRows) {
      const s = String(d?.[key] ?? "").replace(/\d/g, "");
      len += s.length;
      if (len > 20000) break;
    }
    return { key, textLen: len };
  });

  cols.sort((a, b) => b.textLen - a.textLen);
  return cols[0]?.textLen ? cols[0].key : rawCols[0] ?? "";
}

function findSizeKeyCandidates(rawCols, rawText) {
  return rawCols.filter((key) => {
    const notNumberCount = rawText
      .slice(0, 50)
      .filter((d) => isNaN(Number(String(d[key]).trim())));
    return notNumberCount.length === 0;
  });
}

/**
 * 날짜 컬럼 후보 찾기 (moment.js로 유효한 날짜인지 확인)
 */
function findDateKeyCandidates(moment, rawCols, rawText) {
  if (!moment) return []; // moment가 없으면 빈 배열 반환
  return rawCols.filter((key) => {
    const sampleValues = rawText.slice(0, 20).map(d => String(d[key] || '').trim()).filter(v => v);
    if (sampleValues.length === 0) return false;

    const validDateCount = sampleValues.filter(v => {
      const parsed = moment(v, [
        'YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY.MM.DD',
        'MM-DD-YYYY', 'MM/DD/YYYY', 'MM.DD.YYYY',
        'DD-MM-YYYY', 'DD/MM/YYYY', 'DD.MM.YYYY',
        'YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss',
        moment.ISO_8601
      ], true);
      return parsed.isValid();
    }).length;

    // 80% 이상이 유효한 날짜면 날짜 컬럼으로 판단
    return validDateCount / sampleValues.length >= 0.8;
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

/**
 * 입력 3안 메인 라이브러리 함수
 * @param {Object} Papa - PapaParse 라이브러리
 * @param {Object} options - 옵션
 * @param {number} options.maxSize - 최대 데이터 수 (기본값: 1000)
 * @param {number} options.width - 컴포넌트 너비 (기본값: 800)
 * @param {boolean} options.showPreview - 미리보기 표시 여부 (기본값: true)
 * @param {Array} options.sampleButtons - 샘플 버튼 배열 [{label, content}]
 * @param {Object} options.moment - moment.js 라이브러리 (선택, 날짜 컬럼 감지용)
 */
function createFileInputUIv3(Papa, options = {}) {
  const {
    maxSize = 1000,
    width = 800,
    showPreview = true,
    sampleButtons = [],
    moment = null
  } = options;

  // 상태 관리
  let rawText = [];
  let rawCols = [];
  let columnMapping = { text: "", size: "없음" };
  let chunks = [];
  let inputContent = "";

  // 메인 컨테이너 생성
  const container = document.createElement("div");
  container.className = "file-input-v3";
  container.style.cssText = `width: ${width}px; font-family: var(--sans-serif, system-ui);`;

  // 스타일 추가
  const style = document.createElement("style");
  style.textContent = `
    .file-input-v3 {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .file-input-v3 .main-title {
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .file-input-v3 .input-area {
      position: relative;
      background: #f8f9fa;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 16px;
      min-height: 120px;
    }
    .file-input-v3 .input-area.dragover {
      background: #e8f7f5;
      border-color: #2dd4bf;
    }
    .file-input-v3 .input-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #888;
      margin-bottom: 12px;
    }
    .file-input-v3 .input-hint.hidden {
      display: none;
    }
    .file-input-v3 .input-hint svg {
      width: 16px;
      height: 16px;
      color: #aaa;
    }
    .file-input-v3 textarea {
      width: 100%;
      height: 120px;
      resize: none;
      border: none;
      border-radius: 8px;
      padding: 0;
      font-size: 14px;
      line-height: 1.6;
      box-sizing: border-box;
      background: transparent;
    }
    .file-input-v3 textarea:focus {
      outline: none;
    }
    .file-input-v3 textarea::placeholder {
      color: #bbb;
    }
    .file-input-v3 textarea.hidden {
      display: none;
    }
    .file-input-v3 .file-preview {
      display: none;
    }
    .file-input-v3 .file-preview.visible {
      display: block;
    }
    .file-input-v3 .file-item {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
      position: relative;
      margin-bottom: 12px;
    }
    .file-input-v3 .file-name {
      font-size: 13px;
      font-weight: 600;
      color: #4b9de5;
      margin-bottom: 8px;
    }
    .file-input-v3 .file-content-preview {
      font-size: 12px;
      color: #666;
      max-height: 80px;
      overflow: hidden;
      white-space: pre-wrap;
      line-height: 1.5;
      background: #f8f9fa;
      padding: 8px;
      border-radius: 4px;
    }
    .file-input-v3 .delete-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 22px;
      height: 22px;
      background: #cacaca;
      color: #fff;
      border: none;
      border-radius: 50%;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 1;
    }
    .file-input-v3 .delete-btn:hover {
      background: #999;
    }
    .file-input-v3 .confirm-btn {
      display: none;
      background: #2dd4bf;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 12px;
      float: right;
    }
    .file-input-v3 .confirm-btn.visible {
      display: inline-block;
    }
    .file-input-v3 .confirm-btn:hover {
      background: #14b8a6;
    }
    .file-input-v3 .action-buttons {
      display: flex;
      gap: 12px;
    }
    .file-input-v3 .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 12px 20px;
      font-size: 14px;
      color: #444;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v3 .action-btn:hover {
      background: #f8f9fa;
      border-color: #ddd;
    }
    .file-input-v3 .action-btn svg {
      width: 18px;
      height: 18px;
    }
    .file-input-v3 .guide-section {
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      overflow: hidden;
    }
    .file-input-v3 .guide-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: #fff;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .file-input-v3 .guide-header svg {
      width: 18px;
      height: 18px;
      color: #666;
    }
    .file-input-v3 .guide-tabs {
      display: flex;
      border-bottom: 1px solid #e5e5e5;
      background: #fff;
      padding: 0 20px;
    }
    .file-input-v3 .guide-tab {
      padding: 12px 16px;
      font-size: 13px;
      color: #888;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: all 0.2s;
    }
    .file-input-v3 .guide-tab:hover {
      color: #555;
    }
    .file-input-v3 .guide-tab.active {
      color: #2dd4bf;
      border-bottom-color: #2dd4bf;
      font-weight: 600;
    }
    .file-input-v3 .guide-content {
      padding: 20px;
      background: #fafafa;
    }
    .file-input-v3 .guide-item {
      display: none;
      font-size: 13px;
      color: #555;
      line-height: 1.8;
    }
    .file-input-v3 .guide-item.active {
      display: block;
    }
    .file-input-v3 .guide-item .highlight {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #e8f7f5;
      color: #0d9488;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .file-input-v3 .guide-item .optional {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #fff3cd;
      color: #856404;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .file-input-v3 .guide-image {
      margin-top: 16px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }
    .file-input-v3 .guide-image img {
      width: 100%;
      display: block;
    }

    /* 팝업 스타일 */
    .file-input-v3-popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .file-input-v3-popup {
      background: #fff;
      border-radius: 16px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .file-input-v3-popup-header {
      padding: 24px;
      border-bottom: 1px solid #eee;
    }
    .file-input-v3-popup-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 20px 0;
    }
    .file-input-v3-popup-selectors {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .file-input-v3-popup-selector-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
    .file-input-v3-popup-selector-row .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #f0f0f0;
      border-radius: 6px;
      color: #666;
    }
    .file-input-v3-popup-selector-row .label {
      color: #333;
    }
    .file-input-v3-popup-selector-row .label a {
      color: #2dd4bf;
      text-decoration: underline;
      cursor: pointer;
    }
    .file-input-v3-popup-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e0f7f7;
      color: #0d9488;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    .file-input-v3-popup-tag .remove {
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }
    .file-input-v3-popup-body {
      flex: 1;
      overflow: auto;
      padding: 0;
    }
    .file-input-v3-popup-table {
      width: max-content;
      min-width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      table-layout: fixed;
    }
    .file-input-v3-popup-table th {
      background: #f8f9fa;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      white-space: nowrap;
      max-width: 180px;
      min-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .file-input-v3-popup-table th:hover {
      background: #eee;
    }
    .file-input-v3-popup-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #333;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-input-v3-popup-table tr:hover td {
      background: #fafafa;
    }
    .file-input-v3-popup-table th.highlight-text {
      background: #e0f7f7;
    }
    .file-input-v3-popup-table td.highlight-text {
      background: #e0f7f7;
    }
    .file-input-v3-popup-table th.highlight-size {
      background: #fff3cd;
    }
    .file-input-v3-popup-table td.highlight-size {
      background: #fff3cd;
    }
    .file-input-v3-popup-table th.highlight-text:hover {
      background: #c6f0f0;
    }
    .file-input-v3-popup-table th.highlight-size:hover {
      background: #ffe9a0;
    }
    .file-input-v3-popup-table tr:hover td.highlight-text {
      background: #c6f0f0;
    }
    .file-input-v3-popup-table tr:hover td.highlight-size {
      background: #ffe9a0;
    }
    .file-input-v3-popup-footer {
      padding: 16px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .file-input-v3-popup-footer .cancel-btn {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px 24px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
    }
    .file-input-v3-popup-footer .cancel-btn:hover {
      background: #f5f5f5;
    }
    .file-input-v3-popup-footer .complete-btn {
      background: #2dd4bf;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .file-input-v3-popup-footer .complete-btn:hover {
      background: #14b8a6;
    }

    /* 드롭다운 선택 */
    .file-input-v3-dropdown {
      position: relative;
      display: inline-block;
    }
    .file-input-v3-dropdown select {
      appearance: none;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 6px 28px 6px 12px;
      font-size: 13px;
      cursor: pointer;
    }
    .file-input-v3-dropdown::after {
      content: '▼';
      font-size: 10px;
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #888;
    }

    /* 미리보기 화면 */
    .file-input-v3 .preview-section {
      display: none;
    }
    .file-input-v3 .preview-section.active {
      display: block;
    }
    .file-input-v3 .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .file-input-v3 .preview-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .file-input-v3 .preview-edit-btn {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      color: #666;
      cursor: pointer;
    }
    .file-input-v3 .preview-edit-btn:hover {
      background: #f5f5f5;
    }
    .file-input-v3 .preview-table-wrapper {
      max-height: 300px;
      overflow: auto;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    .file-input-v3 .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .file-input-v3 .preview-table th {
      background: #f8f9fa;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      position: sticky;
      top: 0;
      border-bottom: 1px solid #eee;
    }
    .file-input-v3 .preview-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .file-input-v3 .preview-table td.chunk {
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-input-v3 .data-count {
      margin-top: 12px;
      font-size: 13px;
      color: #666;
    }
    .file-input-v3 .data-count .count {
      font-weight: 600;
      color: #333;
    }
    .file-input-v3 .data-count .over {
      color: #e53e3e;
    }
  `;
  container.appendChild(style);

  // HTML 구조 생성
  container.innerHTML += `
    <div class="main-title">분석할 데이터를 입력하세요.</div>

    <div class="input-area">
      <div class="input-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        텍스트를 붙여넣거나 CSV 파일을 드롭하세요. (아래 데이터 입력 가이드를 참고해보세요.)
      </div>
      <textarea placeholder=""></textarea>
      <div class="file-preview"></div>
      <input type="file" accept=".csv,.tsv,.txt" style="display:none;">
      <button class="confirm-btn">확인</button>
    </div>

    <div class="action-buttons">
      <button class="action-btn app-review-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12" y2="18"/>
        </svg>
        앱 리뷰 불러오기
      </button>
      <button class="action-btn youtube-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
        유튜브 댓글 불러오기
      </button>
    </div>

    <div class="guide-section">
      <div class="guide-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12" y2="8"/>
        </svg>
        데이터 입력 가이드
      </div>
      <div class="guide-tabs">
        <div class="guide-tab active" data-tab="text">텍스트 데이터</div>
        <div class="guide-tab" data-tab="spreadsheet">스프레드 시트</div>
        <div class="guide-tab" data-tab="csv">CSV 파일</div>
        <div class="guide-tab" data-tab="sample">샘플 데이터</div>
      </div>
      <div class="guide-content">
        <div class="guide-item active" data-tab="text">
          어피니티버블로 분석할 스프레드 시트 데이터를 복사해서 붙여넣기 하세요.<br><br>
          <span class="highlight">📝 텍스트 컬럼</span> (필수) 분석할 텍스트 데이터가 있는 컬럼입니다.<br>
          <span class="optional">🔢 숫자 컬럼</span> (선택) 별점, 좋아요 등 데이터의 가중치로 적용되는 컬럼입니다.
        </div>
        <div class="guide-item" data-tab="spreadsheet">
          어피니티버블로 분석할 스프레드 시트 데이터를 복사해서 붙여넣기 하세요.<br><br>
          <span class="highlight">📝 텍스트 컬럼</span> (필수) 분석할 텍스트 데이터가 있는 컬럼입니다.<br>
          <span class="optional">🔢 숫자 컬럼</span> (선택) 별점, 좋아요 등 데이터의 가중치로 적용되는 컬럼입니다.
        </div>
        <div class="guide-item" data-tab="csv">
          CSV 또는 TSV 파일을 드래그 앤 드롭하거나 직접 선택해서 업로드하세요.<br><br>
          <span class="highlight">📝 텍스트 컬럼</span> (필수) 분석할 텍스트 데이터가 있는 컬럼입니다.<br>
          <span class="optional">🔢 숫자 컬럼</span> (선택) 별점, 좋아요 등 데이터의 가중치로 적용되는 컬럼입니다.
        </div>
        <div class="guide-item" data-tab="sample">
          샘플 데이터를 로드하여 어피니티버블의 기능을 체험해보세요.
          <div class="sample-buttons-container" style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
          </div>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <span class="preview-title">미리보기</span>
        <button class="preview-edit-btn">수정하기</button>
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

  // DOM 요소 참조
  const textarea = container.querySelector("textarea");
  const filePreview = container.querySelector(".file-preview");
  const fileInput = container.querySelector("input[type=file]");
  const inputArea = container.querySelector(".input-area");
  const inputHint = container.querySelector(".input-hint");
  const confirmBtn = container.querySelector(".confirm-btn");
  const guideTabs = container.querySelectorAll(".guide-tab");
  const guideItems = container.querySelectorAll(".guide-item");
  const previewSection = container.querySelector(".preview-section");
  const previewTable = container.querySelector(".preview-table");
  const dataCountDiv = container.querySelector(".data-count");
  const editBtn = container.querySelector(".preview-edit-btn");
  const sampleButtonsContainer = container.querySelector(".sample-buttons-container");

  // 첨부 파일 상태
  let attachedFile = null;

  // 값 갱신 및 이벤트 발생
  function updateValue() {
    container.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }

  // 입력 상태 업데이트
  function updateInputState() {
    const hasContent = attachedFile !== null;
    inputHint.classList.toggle("hidden", hasContent);
    confirmBtn.classList.toggle("visible", hasContent);
    textarea.classList.toggle("hidden", hasContent);
    filePreview.classList.toggle("visible", hasContent);
  }

  // 파일 프리뷰 업데이트
  function updateFilePreview() {
    if (!attachedFile) {
      filePreview.innerHTML = "";
      return;
    }

    const previewLines = attachedFile.content.split("\n").slice(0, 5).join("\n");
    filePreview.innerHTML = `
      <div class="file-item">
        <button class="delete-btn">×</button>
        <div class="file-name">${attachedFile.name}</div>
        <div class="file-content-preview">${previewLines}</div>
      </div>
    `;

    filePreview.querySelector(".delete-btn").addEventListener("click", () => {
      attachedFile = null;
      inputContent = "";
      textarea.value = "";
      updateFilePreview();
      updateInputState();
    });
  }

  // 텍스트 붙여넣기 감지
  textarea.addEventListener("paste", (e) => {
    setTimeout(() => {
      const text = textarea.value.trim();
      if (text) {
        attachedFile = { name: "Pasted Data", content: text };
        inputContent = text;
        updateFilePreview();
        updateInputState();
      }
    }, 0);
  });

  // 텍스트 직접 입력 (Enter 후 blur 시)
  textarea.addEventListener("blur", () => {
    const text = textarea.value.trim();
    if (text && !attachedFile) {
      attachedFile = { name: "Pasted Data", content: text };
      inputContent = text;
      updateFilePreview();
      updateInputState();
    }
  });

  // 파일 드롭 처리
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

  // 파일 읽기
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

  // 입력 영역 클릭 시 파일 선택
  inputArea.addEventListener("click", (e) => {
    if (e.target === inputArea || e.target.classList.contains("input-hint")) {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      readFile(e.target.files[0]);
      fileInput.value = "";
    }
  });

  // 가이드 탭 전환
  guideTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      guideTabs.forEach(t => t.classList.remove("active"));
      guideItems.forEach(item => item.classList.remove("active"));
      tab.classList.add("active");
      container.querySelector(`.guide-item[data-tab="${tabName}"]`).classList.add("active");
    });
  });

  // 샘플 데이터 버튼 생성
  if (sampleButtons && sampleButtons.length > 0) {
    sampleButtons.forEach((sample, idx) => {
      const btn = document.createElement("button");
      btn.className = "action-btn";
      btn.style.display = "inline-flex";
      btn.textContent = sample.label || `샘플 ${idx + 1}`;
      btn.addEventListener("click", () => {
        attachedFile = { name: sample.label || `Sample ${idx + 1}`, content: sample.content };
        inputContent = sample.content;
        updateFilePreview();
        updateInputState();
      });
      sampleButtonsContainer.appendChild(btn);
    });
  } else {
    // 기본 샘플 버튼
    const defaultBtn = document.createElement("button");
    defaultBtn.className = "action-btn";
    defaultBtn.style.display = "inline-flex";
    defaultBtn.textContent = "샘플 데이터 불러오기";
    defaultBtn.addEventListener("click", () => {
      const sampleData = `유저\t세탁기 사용 경험을 알려주세요.\tSize
User 1\t세제가 많이 들어갔을 때는 빨래가 뻣뻣해진 못한 느낌이 들어서 통돌이 세탁기를 살걸 그랬나 후회하기도 했다...\t1
User 1\t여러번빨지않고한번빨고바로말리니까건사간의세탁이필요없는것같다. 잘 쓰고 있으면 짧게 돌린다.\t1
User 1\t세탁물 별로 물온도를 계속 신경 쓰는 편이다.\t1
User 1\t세탁양보다 세제가 많이 들어가면 도어에 거품이 보인다.\t1
User 1\t시간도 길고 세탁이란 게 그때그때 빨래 종류, 양도 다 다르기 때문에 고정된 한 두 개의 코스로 사용할 수가 없다.\t1
User 1\t청소를 하다 보면 수건, 먼지 등이 나오는 경우가 많은데 세탁 돌린 시간이 얼마 안 지났으면 추가를 한다. '아이구 늦었네~' 그날은 그랬다.\t1`;
      attachedFile = { name: "Sample Data", content: sampleData };
      inputContent = sampleData;
      updateFilePreview();
      updateInputState();
    });
    sampleButtonsContainer.appendChild(defaultBtn);
  }

  // 확인 버튼 클릭 - 팝업 표시
  confirmBtn.addEventListener("click", () => {
    if (!inputContent) return;
    processDataAndShowPopup();
  });

  // 데이터 파싱 및 팝업 표시
  function processDataAndShowPopup() {
    const format = detectFormat(Papa, inputContent);

    const parsed = Papa.parse(
      format === "text" ? "text\n" + inputContent : inputContent,
      {
        header: true,
        skipEmptyLines: true,
        delimiter: format === "tsv" ? "\t" : ",",
        quoteChar: '"',
        transformHeader: (h) => h.trim().replace(/^["']|["']$/g, '')
      }
    );

    rawText = parsed.data.filter(d => Object.values(d).some(v => v && String(v).trim()));

    if (rawText.length === 0) {
      alert("유효한 데이터가 없습니다.");
      return;
    }

    rawCols = parsed.meta.fields.filter(d => d && !d.startsWith("_"));
    const guessedText = guessTextKey(rawCols, rawText);
    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    const dateCandidates = findDateKeyCandidates(moment, rawCols, rawText);

    columnMapping.text = guessedText;
    columnMapping.size = sizeCandidates.length > 0 ? sizeCandidates[0] : "없음";

    showPopup(sizeCandidates, dateCandidates);
  }

  // 팝업 생성 및 표시
  function showPopup(sizeCandidates, dateCandidates) {
    const overlay = document.createElement("div");
    overlay.className = "file-input-v3-popup-overlay";

    const popup = document.createElement("div");
    popup.className = "file-input-v3-popup";

    const hasSizeOptions = sizeCandidates.length > 0;

    popup.innerHTML = `
      <div class="file-input-v3-popup-header">
        <h2 class="file-input-v3-popup-title">분석 데이터 선택 및 다듬기</h2>
        <div class="file-input-v3-popup-selectors">
          <div class="file-input-v3-popup-selector-row">
            <span class="icon">📝</span>
            <span class="label">분석할 <a class="text-column-link">텍스트 컬럼</a>을 선택하세요.</span>
            <span class="file-input-v3-popup-tag text-tag">
              ${columnMapping.text}
              <span class="remove">×</span>
            </span>
            <div class="file-input-v3-dropdown" style="display:none;">
              <select class="text-column-select">
                ${rawCols.map(col => `<option value="${col}" ${col === columnMapping.text ? 'selected' : ''}>${col}</option>`).join('')}
              </select>
            </div>
          </div>
          ${hasSizeOptions ? `
          <div class="file-input-v3-popup-selector-row">
            <span class="icon">🔢</span>
            <span class="label">가중치로 설정할 <a class="size-column-link">숫자 컬럼</a>을 선택하세요.</span>
            <span class="file-input-v3-popup-tag size-tag" ${columnMapping.size === '없음' ? 'style="display:none;"' : ''}>
              ${columnMapping.size}
              <span class="remove">×</span>
            </span>
            <div class="file-input-v3-dropdown" ${columnMapping.size !== '없음' ? 'style="display:none;"' : ''}>
              <select class="size-column-select">
                <option value="없음">없음</option>
                ${sizeCandidates.map(col => `<option value="${col}" ${col === columnMapping.size ? 'selected' : ''}>${col}</option>`).join('')}
              </select>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="file-input-v3-popup-body">
        <table class="file-input-v3-popup-table">
          <thead>
            <tr>
              ${rawCols.map(col => {
                const isText = col === columnMapping.text;
                const isSize = col === columnMapping.size;
                const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : '');
                return `<th class="${highlightClass}" data-col="${col}" title="${col}">${col}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${rawText.slice(0, 50).map((row) => `
              <tr>
                ${rawCols.map(col => {
                  const isText = col === columnMapping.text;
                  const isSize = col === columnMapping.size;
                  const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : '');
                  const cellClass = isText ? `text-cell ${highlightClass}` : highlightClass;
                  const value = String(row[col] || '').slice(0, 200);
                  return `<td class="${cellClass}" data-col="${col}">${value}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="file-input-v3-popup-footer">
        <button class="cancel-btn">취소</button>
        <button class="complete-btn">완료</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // 팝업 이벤트 핸들러
    const textColumnLink = popup.querySelector(".text-column-link");
    const textTag = popup.querySelector(".text-tag");
    const textDropdown = popup.querySelector(".file-input-v3-dropdown");
    const textSelect = popup.querySelector(".text-column-select");

    textColumnLink?.addEventListener("click", () => {
      textTag.style.display = "none";
      textDropdown.style.display = "inline-block";
    });

    textTag?.querySelector(".remove")?.addEventListener("click", () => {
      textTag.style.display = "none";
      textDropdown.style.display = "inline-block";
    });

    // 텍스트 태그 업데이트 함수
    function updateTextTagUI() {
      textTag.innerHTML = columnMapping.text + '<span class="remove">×</span>';
      textTag.style.display = "inline-flex";
      textDropdown.style.display = "none";
      textSelect.value = columnMapping.text;

      textTag.querySelector(".remove")?.addEventListener("click", () => {
        textTag.style.display = "none";
        textDropdown.style.display = "inline-block";
      });
    }

    textSelect?.addEventListener("change", () => {
      columnMapping.text = textSelect.value;
      updateTextTagUI();
      updatePopupTable(popup, sizeCandidates);
      setupHeaderClickHandlers();
    });

    // 사이즈 컬럼 관련 요소 (hasSizeOptions 체크 전에 선언)
    const sizeColumnLink = hasSizeOptions ? popup.querySelector(".size-column-link") : null;
    const sizeTag = hasSizeOptions ? popup.querySelector(".size-tag") : null;
    const sizeDropdown = hasSizeOptions ? popup.querySelectorAll(".file-input-v3-dropdown")[1] : null;
    const sizeSelect = hasSizeOptions ? popup.querySelector(".size-column-select") : null;

    // 사이즈 태그 업데이트 함수
    function updateSizeTagUI() {
      if (!hasSizeOptions || !sizeTag) return;
      if (columnMapping.size === "없음") {
        sizeTag.style.display = "none";
        if (sizeDropdown) sizeDropdown.style.display = "inline-block";
        if (sizeSelect) sizeSelect.value = "없음";
      } else {
        sizeTag.innerHTML = columnMapping.size + '<span class="remove">×</span>';
        sizeTag.style.display = "inline-flex";
        if (sizeDropdown) sizeDropdown.style.display = "none";
        if (sizeSelect) sizeSelect.value = columnMapping.size;

        sizeTag.querySelector(".remove")?.addEventListener("click", () => {
          columnMapping.size = "없음";
          updateSizeTagUI();
          updatePopupTable(popup, sizeCandidates);
          setupHeaderClickHandlers();
        });
      }
    }

    if (hasSizeOptions) {
      sizeColumnLink?.addEventListener("click", () => {
        if (sizeTag) sizeTag.style.display = "none";
        if (sizeDropdown) sizeDropdown.style.display = "inline-block";
      });

      sizeTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.size = "없음";
        updateSizeTagUI();
        updatePopupTable(popup, sizeCandidates);
        setupHeaderClickHandlers();
      });

      sizeSelect?.addEventListener("change", () => {
        columnMapping.size = sizeSelect.value;
        updateSizeTagUI();
        updatePopupTable(popup, sizeCandidates);
        setupHeaderClickHandlers();
      });
    }

    // 헤더 클릭으로 컬럼 선택 (타입에 따라 다르게)
    function setupHeaderClickHandlers() {
      const headers = popup.querySelectorAll(".file-input-v3-popup-table th");
      headers.forEach(th => {
        // 기존 리스너 제거를 위해 클론
        const newTh = th.cloneNode(true);
        th.parentNode.replaceChild(newTh, th);

        newTh.addEventListener("click", () => {
          const col = newTh.dataset.col;
          if (!col) return;

          const isSize = sizeCandidates.includes(col);
          const isDate = dateCandidates.includes(col);

          if (isSize) {
            // 숫자 컬럼 → 가중치 컬럼으로 선택
            columnMapping.size = col;
            updateSizeTagUI();
          } else if (isDate) {
            // 날짜 컬럼 → 현재는 무시 (추후 날짜 UI 추가 시 구현)
            // 일단 텍스트로 선택 가능하게
            columnMapping.text = col;
            updateTextTagUI();
          } else {
            // 일반 텍스트 컬럼 → 텍스트 컬럼으로 선택
            columnMapping.text = col;
            updateTextTagUI();
          }

          updatePopupTable(popup, sizeCandidates);
          setupHeaderClickHandlers();
        });
      });
    }
    setupHeaderClickHandlers();

    // 취소 버튼
    popup.querySelector(".cancel-btn").addEventListener("click", () => {
      overlay.remove();
    });

    // 완료 버튼
    popup.querySelector(".complete-btn").addEventListener("click", () => {
      overlay.remove();
      finalizeData();
    });

    // 오버레이 클릭 시 닫기
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  // 팝업 테이블 업데이트
  function updatePopupTable(popup, sizeCandidates) {
    const thead = popup.querySelector("thead");
    const tbody = popup.querySelector("tbody");

    thead.innerHTML = `
      <tr>
        ${rawCols.map(col => {
          const isText = col === columnMapping.text;
          const isSize = col === columnMapping.size;
          const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : '');
          return `<th class="${highlightClass}" data-col="${col}" title="${col}">${col}</th>`;
        }).join('')}
      </tr>
    `;

    tbody.innerHTML = rawText.slice(0, 50).map((row) => `
      <tr>
        ${rawCols.map(col => {
          const isText = col === columnMapping.text;
          const isSize = col === columnMapping.size;
          const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : '');
          const cellClass = isText ? `text-cell ${highlightClass}` : highlightClass;
          const value = String(row[col] || '').slice(0, 200);
          return `<td class="${cellClass}" data-col="${col}">${value}</td>`;
        }).join('')}
      </tr>
    `).join('');
  }

  // 데이터 최종화 및 미리보기 표시
  function finalizeData() {
    const textKey = columnMapping.text;
    const sizeKey = columnMapping.size === "없음" ? null : columnMapping.size;

    const filtered = rawText.filter(d => {
      const v = d?.[textKey];
      return typeof v === "string" && v.replace(/\\n/g, "\n").trim().length > 0;
    });

    const sampled = reservoirSample(filtered, maxSize)[0];

    chunks = sampled.map((d, i) => ({
      ...d,
      textid: i + 1,
      text: String(d[textKey] || "").replace(/\\n/g, "\n"),
      chunk: String(d[textKey] || "").replace(/\\n/g, "\n"),
      size: sizeKey ? +d[sizeKey] || 1 : 1
    }));

    // 입력 영역 숨기기, 미리보기 표시
    inputArea.style.display = "none";
    container.querySelector(".action-buttons").style.display = "none";
    container.querySelector(".guide-section").style.display = "none";

    updatePreview();
    updateValue();
  }

  // 미리보기 업데이트
  function updatePreview() {
    if (!showPreview || chunks.length === 0) {
      previewSection.classList.remove("active");
      return;
    }

    previewSection.classList.add("active");

    const rows = chunks.slice(0, 100);
    const hasSizeCol = columnMapping.size !== "없음";

    const thead = previewTable.querySelector("thead");
    const tbody = previewTable.querySelector("tbody");

    thead.innerHTML = `
      <tr>
        <th style="width:40px;">#</th>
        <th>분석할 텍스트</th>
        ${hasSizeCol ? '<th style="width:60px;">가중치</th>' : ''}
      </tr>
    `;

    tbody.innerHTML = rows.map(d => `
      <tr>
        <td>${d.textid}</td>
        <td class="chunk" title="${d.chunk}">${d.chunk.slice(0, 200)}</td>
        ${hasSizeCol ? `<td>${d.size}</td>` : ''}
      </tr>
    `).join("");

    const isOver = rawText.length > maxSize;
    dataCountDiv.innerHTML = `
      <span class="count ${isOver ? 'over' : ''}">${chunks.length}</span>
      <span style="opacity:0.5;"> / ${maxSize}</span>
      ${isOver ? `<span style="margin-left:10px;color:#666;font-size:12px;">(${rawText.length}개 중 랜덤 샘플링됨)</span>` : ''}
    `;
  }

  // 수정하기 버튼
  editBtn.addEventListener("click", () => {
    // 미리보기 숨기고 입력 영역 다시 표시
    previewSection.classList.remove("active");
    inputArea.style.display = "";
    container.querySelector(".action-buttons").style.display = "";
    container.querySelector(".guide-section").style.display = "";

    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    const dateCandidates = findDateKeyCandidates(moment, rawCols, rawText);
    showPopup(sizeCandidates, dateCandidates);
  });

  // value 프로퍼티 정의
  Object.defineProperty(container, "value", {
    get: () => chunks,
    set: (v) => {
      chunks = v || [];
      updatePreview();
    }
  });

  return container;
}

// Named export for Observable usage
export { createFileInputUIv3 };

// Default export
export default { createFileInputUIv3 };
