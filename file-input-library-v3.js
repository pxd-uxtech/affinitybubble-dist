/**
 * File Input Library V3 for Observable
 *
 * 입력 3안: 기본화면에서 입력창이 바로 표시되고, 확인 버튼 클릭 시 팝업에서 컬럼 선택
 * 최종 출력: chunkData 배열 [{ textid, chunk, text, size?, date?, ...원본컬럼 }]
 *
 * ⚠️ 배포 주의사항:
 * - affinitybubble-library 레포는 PRIVATE → 외부에서 import 불가
 * - 반드시 affinitybubble-dist (PUBLIC) 레포에 배포해야 함
 * - 배포: cp file-input-library-v3.js → affinitybubble-dist 레포에 push
 *
 * Observable 사용법:
 * InputLib3 = {
 *   const { createFileInputUIv3 } = await import(
 *     "https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@main/file-input-library-v3.js"
 *   );
 *   return { createFileInputUIv3 };
 * }
 *
 * viewof fileInput = InputLib3.createFileInputUIv3(Papa, {
 *   maxSize: 1000,
 *   guideContainerId: "my-guide-container"  // 외부 가이드 DOM ID (선택)
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
 * 날짜 형식인지 확인 (정규표현식 기반, moment 불필요)
 */
function isDateLike(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(v)) return true;
  // DD-MM-YYYY, DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(v)) return true;
  // YYYYMMDD
  if (/^\d{8}$/.test(v)) return true;
  // 한국어 날짜: 2024년 1월 1일
  if (/\d{4}년\s*\d{1,2}월/.test(v)) return true;
  // ISO datetime
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return true;
  return false;
}

/**
 * 날짜 컬럼 후보 찾기 (정규표현식 기반, moment는 선택적)
 */
function findDateKeyCandidates(moment, rawCols, rawText) {
  return rawCols.filter((key) => {
    const samples = rawText.slice(0, 20);
    const dateCount = samples.filter((d) => {
      const value = String(d[key] || '').trim();
      if (!value) return false;

      // moment가 있으면 moment로 검증
      if (moment) {
        const parsed = moment(value, [
          'YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY.MM.DD',
          'MM-DD-YYYY', 'MM/DD/YYYY', 'MM.DD.YYYY',
          'DD-MM-YYYY', 'DD/MM/YYYY', 'DD.MM.YYYY',
          'YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss',
          moment.ISO_8601
        ], true);
        return parsed.isValid();
      }

      // moment가 없으면 정규표현식으로 검증
      return isDateLike(value);
    }).length;

    // 50% 이상이 날짜 형식이면 후보로 인정
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

/**
 * 입력 3안 메인 라이브러리 함수
 * @param {Object} Papa - PapaParse 라이브러리
 * @param {Object} options - 옵션
 * @param {number} options.maxSize - 최대 데이터 수 (기본값: 1000)
 * @param {number} options.width - 컴포넌트 너비 (기본값: 800)
 * @param {boolean} options.showPreview - 미리보기 표시 여부 (기본값: true)
 * @param {string} options.guideContainerId - 외부 가이드 컨테이너 DOM ID (선택, 데이터 입력 시 자동 숨김)
 * @param {Object} options.moment - moment.js 라이브러리 (선택, 날짜 컬럼 감지용)
 */
function createFileInputUIv3(Papa, options = {}) {
  const {
    maxSize = 1000,
    width = 800,
    showPreview = true,
    moment = null,
    guideContainerId = null  // 외부 가이드 컨테이너 DOM ID (사용자가 직접 구현)
  } = options;

  // 외부 가이드 컨테이너 참조
  let guideContainer = null;

  // 상태 관리
  let rawText = [];
  let rawCols = [];
  let columnMapping = { text: "", size: "없음", date: "없음" };
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
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    .file-input-v3-popup-tag.text-tag {
      background: #afc7dd;
      color: #1e3a5f;
    }
    .file-input-v3-popup-tag.date-tag {
      background: #ffe9a9;
      color: #7a5c00;
    }
    .file-input-v3-popup-tag.size-tag {
      background: #f69f8f;
      color: #7a1f0f;
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
      background: #afc7dd;
    }
    .file-input-v3-popup-table td.highlight-text {
      background: #afc7dd;
    }
    .file-input-v3-popup-table th.highlight-size {
      background: #f69f8f;
    }
    .file-input-v3-popup-table td.highlight-size {
      background: #f69f8f;
    }
    .file-input-v3-popup-table th.highlight-text:hover {
      background: #95b3cc;
    }
    .file-input-v3-popup-table th.highlight-size:hover {
      background: #e88878;
    }
    .file-input-v3-popup-table tr:hover td.highlight-text {
      background: #95b3cc;
    }
    .file-input-v3-popup-table tr:hover td.highlight-size {
      background: #e88878;
    }
    .file-input-v3-popup-table th.highlight-date {
      background: #ffe9a9;
    }
    .file-input-v3-popup-table td.highlight-date {
      background: #ffe9a9;
    }
    .file-input-v3-popup-table th.highlight-date:hover {
      background: #f5d989;
    }
    .file-input-v3-popup-table tr:hover td.highlight-date {
      background: #f5d989;
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
  const previewSection = container.querySelector(".preview-section");
  const previewTable = container.querySelector(".preview-table");
  const dataCountDiv = container.querySelector(".data-count");
  const editBtn = container.querySelector(".preview-edit-btn");

  // 외부 가이드 컨테이너 초기화
  if (guideContainerId) {
    guideContainer = document.getElementById(guideContainerId);
  }

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
    // 가중치 컬럼은 이름이 "가중치"인 경우에만 자동 선택
    columnMapping.size = sizeCandidates.includes("가중치") ? "가중치" : "없음";
    // 날짜 컬럼은 후보가 있으면 첫번째를 자동 선택
    columnMapping.date = dateCandidates.length > 0 ? dateCandidates[0] : "없음";

    showPopup(sizeCandidates, dateCandidates);
  }

  // 팝업 생성 및 표시
  function showPopup(sizeCandidates, dateCandidates) {
    const overlay = document.createElement("div");
    overlay.className = "file-input-v3-popup-overlay";

    const popup = document.createElement("div");
    popup.className = "file-input-v3-popup";

    const hasSizeOptions = sizeCandidates.length > 0;
    const hasDateOptions = dateCandidates.length > 0;

    popup.innerHTML = `
      <div class="file-input-v3-popup-header">
        <h2 class="file-input-v3-popup-title">분석 데이터 선택 및 다듬기</h2>
        <div class="file-input-v3-popup-selectors">
          <div class="file-input-v3-popup-selector-row">
            <span class="label">분석할 <b>텍스트 컬럼</b>을 선택하세요.</span>
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
          ${hasDateOptions ? `
          <div class="file-input-v3-popup-selector-row">
            <span class="label">시간순 정렬에 사용할 <b>날짜 컬럼</b>을 선택하세요.</span>
            <span class="file-input-v3-popup-tag date-tag" ${columnMapping.date === '없음' ? 'style="display:none;"' : ''}>
              ${columnMapping.date}
              <span class="remove">×</span>
            </span>
            <div class="file-input-v3-dropdown" ${columnMapping.date !== '없음' ? 'style="display:none;"' : ''}>
              <select class="date-column-select">
                <option value="없음">없음</option>
                ${dateCandidates.map(col => `<option value="${col}" ${col === columnMapping.date ? 'selected' : ''}>${col}</option>`).join('')}
              </select>
            </div>
          </div>
          ` : ''}
          ${hasSizeOptions ? `
          <div class="file-input-v3-popup-selector-row">
            <span class="label">가중치로 설정할 <b>숫자 컬럼</b>을 선택하세요.</span>
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
                const isDate = col === columnMapping.date;
                const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : (isDate ? 'highlight-date' : ''));
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
                  const isDate = col === columnMapping.date;
                  const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : (isDate ? 'highlight-date' : ''));
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
    const textTag = popup.querySelector(".text-tag");
    const textDropdown = popup.querySelector(".file-input-v3-dropdown");
    const textSelect = popup.querySelector(".text-column-select");

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
      updatePopupTable(popup, sizeCandidates, dateCandidates);
      setupHeaderClickHandlers();
    });

    // 날짜 컬럼 관련 요소
    const dateTag = hasDateOptions ? popup.querySelector(".date-tag") : null;
    const dateDropdown = hasDateOptions ? popup.querySelector(".date-column-select")?.parentElement : null;
    const dateSelect = hasDateOptions ? popup.querySelector(".date-column-select") : null;

    // 날짜 태그 업데이트 함수
    function updateDateTagUI() {
      if (!hasDateOptions || !dateTag) return;
      if (columnMapping.date === "없음") {
        dateTag.style.display = "none";
        if (dateDropdown) dateDropdown.style.display = "inline-block";
        if (dateSelect) dateSelect.value = "없음";
      } else {
        dateTag.innerHTML = columnMapping.date + '<span class="remove">×</span>';
        dateTag.style.display = "inline-flex";
        if (dateDropdown) dateDropdown.style.display = "none";
        if (dateSelect) dateSelect.value = columnMapping.date;

        dateTag.querySelector(".remove")?.addEventListener("click", () => {
          columnMapping.date = "없음";
          updateDateTagUI();
          updatePopupTable(popup, sizeCandidates, dateCandidates);
          setupHeaderClickHandlers();
        });
      }
    }

    if (hasDateOptions) {
      dateTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.date = "없음";
        updateDateTagUI();
        updatePopupTable(popup, sizeCandidates, dateCandidates);
        setupHeaderClickHandlers();
      });

      dateSelect?.addEventListener("change", () => {
        columnMapping.date = dateSelect.value;
        updateDateTagUI();
        updatePopupTable(popup, sizeCandidates, dateCandidates);
        setupHeaderClickHandlers();
      });
    }

    // 사이즈 컬럼 관련 요소
    const sizeTag = hasSizeOptions ? popup.querySelector(".size-tag") : null;
    const sizeDropdown = hasSizeOptions ? popup.querySelector(".size-column-select")?.parentElement : null;
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
          updatePopupTable(popup, sizeCandidates, dateCandidates);
          setupHeaderClickHandlers();
        });
      }
    }

    if (hasSizeOptions) {
      sizeTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.size = "없음";
        updateSizeTagUI();
        updatePopupTable(popup, sizeCandidates, dateCandidates);
        setupHeaderClickHandlers();
      });

      sizeSelect?.addEventListener("change", () => {
        columnMapping.size = sizeSelect.value;
        updateSizeTagUI();
        updatePopupTable(popup, sizeCandidates, dateCandidates);
        setupHeaderClickHandlers();
      });
    }

    // 헤더 클릭으로 컬럼 선택 (타입에 따라 다르게, 날짜/가중치는 토글)
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
            // 숫자 컬럼 → 토글 (이미 선택되어 있으면 해제)
            if (columnMapping.size === col) {
              columnMapping.size = "없음";
            } else {
              columnMapping.size = col;
            }
            updateSizeTagUI();
          } else if (isDate) {
            // 날짜 컬럼 → 토글 (이미 선택되어 있으면 해제)
            if (columnMapping.date === col) {
              columnMapping.date = "없음";
            } else {
              columnMapping.date = col;
            }
            updateDateTagUI();
          } else {
            // 일반 텍스트 컬럼 → 텍스트 컬럼으로 선택 (토글 없음, 필수 컬럼)
            columnMapping.text = col;
            updateTextTagUI();
          }

          updatePopupTable(popup, sizeCandidates, dateCandidates);
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
  function updatePopupTable(popup, sizeCandidates, dateCandidates) {
    const thead = popup.querySelector("thead");
    const tbody = popup.querySelector("tbody");

    thead.innerHTML = `
      <tr>
        ${rawCols.map(col => {
          const isText = col === columnMapping.text;
          const isSize = col === columnMapping.size;
          const isDate = col === columnMapping.date;
          const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : (isDate ? 'highlight-date' : ''));
          return `<th class="${highlightClass}" data-col="${col}" title="${col}">${col}</th>`;
        }).join('')}
      </tr>
    `;

    tbody.innerHTML = rawText.slice(0, 50).map((row) => `
      <tr>
        ${rawCols.map(col => {
          const isText = col === columnMapping.text;
          const isSize = col === columnMapping.size;
          const isDate = col === columnMapping.date;
          const highlightClass = isText ? 'highlight-text' : (isSize ? 'highlight-size' : (isDate ? 'highlight-date' : ''));
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
    const dateKey = columnMapping.date === "없음" ? null : columnMapping.date;

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
      size: sizeKey ? +d[sizeKey] || 1 : 1,
      ...(dateKey ? { date: d[dateKey] } : {})
    }));

    // 입력 영역 숨기기, 미리보기 표시
    inputArea.style.display = "none";
    if (guideContainer) guideContainer.style.display = "none";

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
    const hasDateCol = columnMapping.date !== "없음";

    const thead = previewTable.querySelector("thead");
    const tbody = previewTable.querySelector("tbody");

    thead.innerHTML = `
      <tr>
        <th style="width:40px;">#</th>
        <th>분석할 텍스트</th>
        ${hasDateCol ? '<th style="width:100px;">날짜</th>' : ''}
        ${hasSizeCol ? '<th style="width:60px;">가중치</th>' : ''}
      </tr>
    `;

    tbody.innerHTML = rows.map(d => `
      <tr>
        <td>${d.textid}</td>
        <td class="chunk" title="${d.chunk}">${d.chunk.slice(0, 200)}</td>
        ${hasDateCol ? `<td>${d.date || ''}</td>` : ''}
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
    if (guideContainer) guideContainer.style.display = "";

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

  // columnMapping 프로퍼티
  Object.defineProperty(container, "columnMapping", {
    get: () => ({ ...columnMapping })
  });

  // rawData 프로퍼티
  Object.defineProperty(container, "rawData", {
    get: () => rawText
  });

  // fileInfo 프로퍼티
  Object.defineProperty(container, "fileInfo", {
    get: () => attachedFile ? { ...attachedFile } : null
  });

  // 외부에서 샘플 데이터 추가
  container.addSampleData = function(fileData) {
    if (!fileData?.content) return;
    attachedFile = {
      name: fileData.name || "Sample Data",
      content: fileData.content
    };
    inputContent = fileData.content;
    updateFilePreview();
    updateInputState();
    // 자동으로 팝업 열기
    processDataAndShowPopup();
  };

  // 초기화
  container.clear = function() {
    attachedFile = null;
    inputContent = "";
    rawText = [];
    rawCols = [];
    columnMapping = { text: "", size: "없음", date: "없음" };
    chunks = [];
    textarea.value = "";
    updateFilePreview();
    updateInputState();
    previewSection.classList.remove("active");
    inputArea.style.display = "";
    if (guideContainer) guideContainer.style.display = "";
  };

  return container;
}

// Named export for Observable usage
export { createFileInputUIv3 };

// Default export
export default { createFileInputUIv3 };
