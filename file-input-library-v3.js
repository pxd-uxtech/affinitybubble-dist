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
 * @param {string} options.user_subscript - 사용자 구독 유형 (demo, free, basic, standard 등)
 */
function createFileInputUIv3(Papa, options = {}) {
  const {
    maxSize = 1000,
    width = 800,
    showPreview = true,
    moment = null,
    guideContainerId = null,  // 외부 가이드 컨테이너 DOM ID (사용자가 직접 구현)
    user_subscript = "free"   // 사용자 구독 유형
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
      min-height: 160px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
      height: 100px;
      resize: none;
      border: none;
      padding: 0;
      font-size: 15px;
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

    /* 팝업 스타일 */
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
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 80px rgba(0,0,0,0.25);
    }
    .file-input-v3-popup-header {
      padding: 28px 32px 24px;
      background: #fff;
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
      cursor: help;
    }
    .file-input-v3-popup-info .info-trigger svg {
      width: 20px;
      height: 20px;
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
      cursor: help;
    }
    .file-input-v3-popup-selector-row .label .info-wrapper .info-icon svg {
      width: 16px;
      height: 16px;
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
    .file-input-v3-transpose-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
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
      background: #ddd;
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
      flex: 1;
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
    .file-input-v3-popup-footer {
      padding: 20px 32px;
      background: #fff;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
      gap: 16px;
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

    /* 드롭다운 선택 */
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
      content: '▼';
      font-size: 9px;
      position: absolute;
      right: 12px;
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
      padding: 20px;
      background: #f9fafc;
      border-radius: 8px;
    }
    /* 미리보기 활성화 시 메인 타이틀 숨김 */
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
      font-size: 14px;
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

  // HTML 구조 생성
  container.innerHTML += `
    <div class="main-title">
      <h2>분석할 데이터를 입력하세요.</h2>
    </div>

    <div class="input-area">
      <textarea placeholder="텍스트를 붙여넣거나 CSV 파일을 드롭하세요."></textarea>
      <div class="file-preview"></div>
      <input type="file" accept=".csv,.tsv,.txt" style="display:none;">
      <div class="input-bottom-bar">
        <button class="attach-btn" title="파일 첨부">+</button>
        <button class="confirm-btn">확인</button>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <span class="preview-title">입력한 데이터</span>
        <button class="preview-edit-btn">수정 ✎</button>
        <span style="flex:1;"></span>
        <button class="preview-delete-btn" title="삭제">×</button>
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
  const attachBtn = container.querySelector(".attach-btn");
  const confirmBtn = container.querySelector(".confirm-btn");
  const previewSection = container.querySelector(".preview-section");
  const previewTable = container.querySelector(".preview-table");
  const dataCountDiv = container.querySelector(".data-count");
  const editBtn = container.querySelector(".preview-edit-btn");
  const deleteBtn = container.querySelector(".preview-delete-btn");
  const mainTitle = container.querySelector(".main-title");

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
    const hasFile = attachedFile !== null;
    const hasText = textarea.value.trim().length > 0;
    const hasContent = hasFile || hasText;

    confirmBtn.classList.toggle("visible", hasContent);
    textarea.classList.toggle("hidden", hasFile);
    filePreview.classList.toggle("visible", hasFile);
  }

  // 파일 프리뷰 업데이트
  function updateFilePreview() {
    if (!attachedFile) {
      filePreview.innerHTML = "";
      return;
    }

    const previewLines = attachedFile.content.split("\n").slice(0, 6).join("\n");
    filePreview.innerHTML = `
      <div class="file-item">
        <div class="file-content-box">
          <button class="delete-btn">×</button>
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

  // HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 텍스트 입력 감지 (실시간)
  textarea.addEventListener("input", () => {
    updateInputState();
  });

  // 텍스트 붙여넣기 감지
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

  // 클립 아이콘 클릭 시 파일 선택
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

  // 확인 버튼 클릭 - 팝업 표시
  confirmBtn.addEventListener("click", () => {
    // 텍스트 직접 입력한 경우 처리
    if (!inputContent && textarea.value.trim()) {
      inputContent = textarea.value.trim();
      attachedFile = { name: "Pasted Data", content: inputContent };
    }
    if (!inputContent) return;
    processDataAndShowPopup();
  });

  // 데이터 파싱 및 팝업 표시
  function processDataAndShowPopup() {
    // 뒷부분 빈 라인 제거
    inputContent = inputContent.trimEnd();

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
  function showPopup(sizeCandidates, dateCandidates, fromEdit = false) {
    // 취소 시 복원을 위한 컬럼 매핑 백업
    const savedMapping = { ...columnMapping };

    const overlay = document.createElement("div");
    overlay.className = "file-input-v3-popup-overlay";

    const popup = document.createElement("div");
    popup.className = "file-input-v3-popup";

    const hasSizeOptions = sizeCandidates.length > 0;
    const hasDateOptions = dateCandidates.length > 0;

    // 제외된 행 인덱스 관리
    let excludedRows = new Set();

    // transpose 가능 여부 (행이 50개 이하일 때만 - transpose 후 열이 됨)
    const canTranspose = rawText.length <= 50;

    // transpose 아이콘 SVG (요청된 아이콘)
    const transposeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="4" height="10" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="8" width="4" height="10" rx="1" transform="rotate(-90 10 8)" stroke="currentColor" stroke-width="2"/>
      <path d="M20 12V15C20 17.2091 18.2091 19 16 19H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    // info 아이콘 SVG (icons/info.svg 기반)
    const infoIconSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 12H12V16H14M12 8H12.01M13.5628 20.8633C14.7268 20.658 15.8389 20.2256 16.8357 19.5905C17.8325 18.9555 18.6945 18.1303 19.3724 17.1622C20.0503 16.194 20.5309 15.1018 20.7867 13.948C21.0425 12.7941 21.0685 11.6011 20.8633 10.4372C20.658 9.27322 20.2256 8.1611 19.5905 7.1643C18.9555 6.1675 18.1303 5.30554 17.1622 4.62763C16.194 3.94972 15.1018 3.46914 13.948 3.21334C12.7941 2.95753 11.6011 2.9315 10.4372 3.13673C9.27322 3.34196 8.1611 3.77444 7.1643 4.40948C6.1675 5.04451 5.30554 5.86966 4.62763 6.83781C3.94972 7.80597 3.46914 8.89816 3.21334 10.052C2.95753 11.2059 2.9315 12.3989 3.13673 13.5628C3.34197 14.7268 3.77445 15.8389 4.40948 16.8357C5.04451 17.8325 5.86966 18.6945 6.83781 19.3724C7.80597 20.0503 8.89816 20.5309 10.052 20.7867C11.2059 21.0425 12.3989 21.0685 13.5628 20.8633Z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const infoIcon = `<span style="display:inline-flex;width:20px;height:20px;">${infoIconSvg}</span>`;
    const infoIconSmall = `<span style="display:inline-flex;width:16px;height:16px;">${infoIconSvg}</span>`;

    popup.innerHTML = `
      <div class="file-input-v3-popup-header">
        <div class="file-input-v3-popup-title-row">
          <h2 class="file-input-v3-popup-title">분석 데이터 선택 및 다듬기</h2>
          <div class="file-input-v3-popup-actions">
            <div class="file-input-v3-popup-info">
              <span class="info-trigger">${infoIcon}</span>
              <div class="info-tooltip">
                분석할 주데이터는 반드시 하나의 컬럼에 있어야 합니다.<br>
                필요 시 테이블의 헤더 위치를 변환하세요.
              </div>
            </div>
            <button class="file-input-v3-transpose-btn" ${!canTranspose ? 'disabled title="행이 50개를 초과하여 사용할 수 없습니다"' : ''}>
              ${transposeIcon}
              테이블 행열 바꾸기
            </button>
          </div>
        </div>
        <div class="file-input-v3-popup-selectors">
          <div class="file-input-v3-popup-selector-row">
            <span class="label required">분석할 텍스트 컬럼</span>
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
            <span class="label">가중치 컬럼 <span class="info-wrapper"><span class="info-icon">${infoIconSmall}</span><div class="weight-tooltip">가중치에 따라 중요한 버블 크기를 크게 표시합니다.<br><br><strong>예시:</strong><br>• 클릭수: 50, 120, 35 → 120이 가장 큰 버블<br>• 좋아요: 10, 25, 5 → log 스케일로 변환하여 반영</div></span></span>
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
          ${hasDateOptions ? `
          <div class="file-input-v3-popup-selector-row">
            <span class="label">날짜 컬럼</span>
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
        </div>
      </div>
      <div class="file-input-v3-popup-body">
        <table class="file-input-v3-popup-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="file-input-v3-popup-footer">
        <button class="cancel-btn">취소</button>
        <button class="complete-btn">완료</button>
      </div>
    `;

    // 테이블 렌더링 함수
    function renderTable() {
      const thead = popup.querySelector("thead");
      const tbody = popup.querySelector("tbody");

      // 체크 아이콘
      const checkIcon = `<span class="check-icon">✓</span>`;

      // 전체 선택 여부 계산
      const displayedRows = rawText.slice(0, 100);
      const allChecked = displayedRows.every((_, idx) => !excludedRows.has(idx));

      thead.innerHTML = `
        <tr>
          <th class="row-num">
            <input type="checkbox" class="select-all-checkbox" ${allChecked ? 'checked' : ''}>
          </th>
          ${rawCols.map(col => {
            const isText = col === columnMapping.text;
            const isSize = col === columnMapping.size;
            const isDate = col === columnMapping.date;
            let selectedClass = '';
            if (isText) selectedClass = 'selected';
            else if (isSize) selectedClass = 'selected-size';
            else if (isDate) selectedClass = 'selected-date';
            const isSelected = isText || isSize || isDate;
            return `<th class="${selectedClass}" data-col="${col}" title="${col}">
              <span class="col-header">${isSelected ? checkIcon : ''}${col}</span>
            </th>`;
          }).join('')}
        </tr>
      `;

      tbody.innerHTML = displayedRows.map((row, idx) => {
        const isExcluded = excludedRows.has(idx);
        return `
          <tr data-row-idx="${idx}" style="${isExcluded ? 'opacity:0.4;' : ''}">
            <td class="row-num">
              <input type="checkbox" class="row-checkbox" data-idx="${idx}" ${isExcluded ? '' : 'checked'}>
            </td>
            ${rawCols.map(col => {
              const isText = col === columnMapping.text;
              const isSize = col === columnMapping.size;
              const isDate = col === columnMapping.date;
              let selectedClass = '';
              if (isText) selectedClass = 'selected';
              else if (isSize) selectedClass = 'selected-size';
              else if (isDate) selectedClass = 'selected-date';
              const value = String(row[col] || '').slice(0, 200);
              return `<td class="${selectedClass}" data-col="${col}">${value}</td>`;
            }).join('')}
          </tr>
        `;
      }).join('');

      // 체크박스 이벤트 설정
      setupCheckboxHandlers();
    }

    // 체크박스 핸들러
    function setupCheckboxHandlers() {
      const checkboxes = popup.querySelectorAll(".row-checkbox");
      const selectAllCheckbox = popup.querySelector(".select-all-checkbox");
      const displayedRows = rawText.slice(0, 100);

      // 전체 선택 체크박스
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

      // 개별 체크박스
      checkboxes.forEach(cb => {
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
          // 전체 선택 체크박스 상태 업데이트
          if (selectAllCheckbox) {
            const allChecked = displayedRows.every((_, i) => !excludedRows.has(i));
            selectAllCheckbox.checked = allChecked;
          }
        });
      });
    }

    // 초기 테이블 렌더링
    renderTable();

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Transpose 버튼 이벤트
    const transposeBtn = popup.querySelector(".file-input-v3-transpose-btn");
    if (transposeBtn && canTranspose) {
      transposeBtn.addEventListener("click", () => {
        // 원본 저장 (토글용)
        if (!popup._originalData) {
          popup._originalData = { cols: [...rawCols], data: [...rawText] };
        }

        // 이미 transpose 상태면 원복
        if (popup._isTransposed) {
          rawCols = popup._originalData.cols;
          rawText = popup._originalData.data;
          popup._isTransposed = false;
        } else {
          // 원본 inputContent에서 다시 파싱 (header: false로)
          const format = detectFormat(Papa, inputContent);
          const reparsed = Papa.parse(
            format === "text" ? inputContent : inputContent,
            {
              header: false,  // 헤더 없이 파싱
              skipEmptyLines: true,
              delimiter: format === "tsv" ? "\t" : (format === "csv" ? "," : undefined),
              quoteChar: '"'
            }
          );

          const matrix = reparsed.data.filter(row => row.some(cell => cell && String(cell).trim()));

          if (matrix.length > 0 && matrix[0].length > 0) {
            // 첫 번째 열을 헤더로, 나머지 열들을 데이터로
            const newCols = matrix.map(row => String(row[0] || '').trim() || 'Row');
            const colCount = Math.max(...matrix.map(row => row.length));

            const newData = [];
            for (let c = 1; c < colCount; c++) {
              const obj = {};
              matrix.forEach((row, r) => {
                obj[newCols[r]] = row[c] || '';
              });
              newData.push(obj);
            }

            rawCols = newCols;
            rawText = newData;
          }
          popup._isTransposed = true;
        }

        // 컬럼 매핑 초기화
        columnMapping.text = rawCols[0] || "";
        columnMapping.size = "없음";
        columnMapping.date = "없음";
        excludedRows.clear();

        // UI 업데이트
        updateAllTagsUI();
        renderTable();
        setupHeaderClickHandlers();
      });
    }

    // 모든 태그 UI 업데이트
    function updateAllTagsUI() {
      updateTextTagUI();
      if (hasSizeOptions) updateSizeTagUI();
      if (hasDateOptions) updateDateTagUI();
    }

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

      // select 옵션 업데이트 (transpose 후 변경될 수 있음)
      textSelect.innerHTML = rawCols.map(col =>
        `<option value="${col}" ${col === columnMapping.text ? 'selected' : ''}>${col}</option>`
      ).join('');

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
          renderTable();
          setupHeaderClickHandlers();
        });
      }
    }

    if (hasDateOptions) {
      dateTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.date = "없음";
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
          renderTable();
          setupHeaderClickHandlers();
        });
      }
    }

    if (hasSizeOptions) {
      sizeTag?.querySelector(".remove")?.addEventListener("click", () => {
        columnMapping.size = "없음";
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

    // 헤더 클릭으로 컬럼 선택 (타입에 따라 다르게, 날짜/가중치는 토글)
    function setupHeaderClickHandlers() {
      const headers = popup.querySelectorAll(".file-input-v3-popup-table th:not(.row-num)");
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

          renderTable();
          setupHeaderClickHandlers();
        });
      });
    }
    setupHeaderClickHandlers();

    // 취소 버튼
    popup.querySelector(".cancel-btn").addEventListener("click", () => {
      // 컬럼 매핑 복원
      columnMapping.text = savedMapping.text;
      columnMapping.size = savedMapping.size;
      columnMapping.date = savedMapping.date;
      overlay.remove();
      if (fromEdit) {
        updatePreview();
      }
    });

    // 완료 버튼
    popup.querySelector(".complete-btn").addEventListener("click", () => {
      // 제외된 행 필터링
      rawText = rawText.filter((_, idx) => !excludedRows.has(idx));
      overlay.remove();
      finalizeData();
    });

    // 오버레이 클릭 시 닫기
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        // 컬럼 매핑 복원
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
    if (mainTitle) mainTitle.style.display = "none";

    updatePreview();
    updateValue();
  }

  // 미리보기 업데이트
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
    const hasSizeCol = columnMapping.size !== "없음";
    const hasDateCol = columnMapping.date !== "없음";

    const thead = previewTable.querySelector("thead");
    const tbody = previewTable.querySelector("tbody");

    thead.innerHTML = `
      <tr>
        <th style="width:40px;">#</th>
        <th>${columnMapping.text}</th>
        ${hasDateCol ? '<th style="width:100px;">날짜</th>' : ''}
        ${hasSizeCol ? '<th class="size-col" style="width:80px;">Size</th>' : ''}
      </tr>
    `;

    tbody.innerHTML = rows.map(d => `
      <tr>
        <td>${d.textid}</td>
        <td class="chunk" title="${escapeHtml(d.chunk)}">${escapeHtml(d.chunk.slice(0, 200))}</td>
        ${hasDateCol ? `<td>${d.date || ''}</td>` : ''}
        ${hasSizeCol ? `<td class="size-col">${d.size}</td>` : ''}
      </tr>
    `).join("");

    // 하단 메시지 영역
    const isOver = rawText.length > maxSize;
    const showNotice = isOver || chunks.length > 1500;

    let noticeContent = '';
    if (user_subscript.match(/demo/i) && isOver) {
      noticeContent = `<span class="bodyTitle">처음 ${maxSize}개의 데이터를 분석합니다.</span><br>
<span class="bodytext">Standard 사용자는 1,000개까지 분석할 수 있습니다.</span>`;
    } else if (user_subscript.match(/free|basic/i) && isOver) {
      noticeContent = `<span class="bodyTitle">처음 ${maxSize}개의 데이터를 분석합니다.</span><br>
<span class="bodytext">Standard 사용자는 1,000개까지 분석할 수 있습니다.</span>`;
    } else if (!user_subscript.match(/free|basic|demo/i) && isOver) {
      noticeContent = `${maxSize}개를 무작위 표본 추출합니다. 전체를 대표하는 내용이라고 볼 수 있습니다.`;
    }

    if (chunks.length > 1500) {
      noticeContent += `${noticeContent ? '<br><br>' : ''}<span style="color:#e53e3e;">주의 : 데이터셋 크기가 크면 컴퓨터 사양에 따라 반응이 느려질 수 있습니다.<br>목적에 따라 적당한 샘플 크기를 사용하는 걸 권장합니다.</span>`;
    }

    let actionButton = '';
    if (user_subscript.match(/demo/i) && isOver) {
      actionButton = `<a href="/welcome" target="_blank">무료 회원 가입 ↗</a>`;
    } else if (user_subscript.match(/free|basic/i) && isOver) {
      actionButton = `<a href="/plan" target="_blank">업그레이드하기 ↗</a>`;
    }

    // 숫자 표시 + 메시지
    const textLength = `
      <div class="textLength">
        <span style="font-weight:bold;" class="${isOver ? 'over' : ''}">${chunks.length}</span>
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
    ` : '';

    dataCountDiv.innerHTML = textLength + notice;
  }

  // 삭제 버튼
  deleteBtn.addEventListener("click", () => {
    if (confirm("입력한 데이터와 분석 결과가 모두 삭제됩니다.\n계속하시겠습니까?")) {
      container.clear();
    }
  });

  // 수정하기 버튼
  editBtn.addEventListener("click", () => {
    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    const dateCandidates = findDateKeyCandidates(moment, rawCols, rawText);
    showPopup(sizeCandidates, dateCandidates, true);
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
    document.body.classList.remove("data-attached");
    document.body.classList.add("no-data");
    inputArea.style.display = "";
    if (guideContainer) guideContainer.style.display = "";
    if (mainTitle) mainTitle.style.display = "";
  };

  // 초기 상태: no-data 클래스 추가
  document.body.classList.add("no-data");

  return container;
}

// Named export for Observable usage
export { createFileInputUIv3 };

// Default export
export default { createFileInputUIv3 };
