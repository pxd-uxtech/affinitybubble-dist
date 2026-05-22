// src/input/index.js
function detectFormat(content) {
  if (typeof content !== "string") return "text";
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return "text";
  const sampleLines = lines.slice(0, 20);
  if (isLikelyDelimited(sampleLines, "	")) {
    return "tsv";
  }
  if (isLikelyDelimited(sampleLines, ",")) {
    return "csv";
  }
  return "text";
}
function isLikelyDelimited(lines, delimiter) {
  if (!Array.isArray(lines)) {
    lines = lines.split(/\r?\n/).filter((line) => line.trim());
  }
  const counts = lines.map((line) => (line.match(new RegExp(delimiter, "g")) || []).length);
  const mode = (arr) => {
    const freq = {};
    let maxCount = 0, modeVal = 0;
    for (const v of arr) {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > maxCount) {
        maxCount = freq[v];
        modeVal = v;
      }
    }
    return modeVal;
  };
  const modeCount = mode(counts);
  const consistent = counts.filter((c) => c === modeCount).length;
  return modeCount >= 1 && consistent >= lines.length * 0.8;
}
function parseContent(content, format, Papa) {
  const textPrefix = format === "text" ? "text\n" : "";
  return Papa.parse(textPrefix + content, {
    header: true,
    skipEmptyLines: true,
    delimiter: format === "tsv" ? "	" : ",",
    quoteChar: '"',
    // 따옴표로 감싼 필드 처리
    transformHeader: (h) => h.trim().replace(/^["']|["']$/g, "")
    // 헤더의 앞뒤 따옴표 제거
  });
}
function guessColumns(rawData, cols) {
  return {
    textColumn: guessTextColumn(cols, rawData),
    dateColumn: guessDateColumn(cols, rawData),
    sizeColumn: guessSizeColumn(cols)
  };
}
function guessTextColumn(cols, rawData) {
  if (cols.includes("text")) return "text";
  if (cols.includes("\uD14D\uC2A4\uD2B8")) return "\uD14D\uC2A4\uD2B8";
  if (!cols.length) return "";
  const colScores = cols.map((key) => ({
    key,
    textLen: rawData.slice(0, 50).map((d) => (d[key] || "").replace(/\d/g, "")).join("").length
  }));
  colScores.sort((a, b) => b.textLen - a.textLen);
  return colScores[0].key;
}
function guessDateColumn(cols, rawData) {
  const sampleData = rawData.slice(0, 50);
  const datePatterns = [
    /^\d{8}$/,
    // YYYYMMDD
    /^\d{4}[-\/]\d{2}[-\/]\d{2}/
    // YYYY-MM-DD, YYYY/MM/DD
  ];
  const isDateLike2 = (str) => {
    const clean = String(str).trim().split(" ")[0];
    if (!datePatterns.some((p) => p.test(clean))) return false;
    const nums = clean.replace(/\D/g, "");
    const year = parseInt(nums.slice(0, 4));
    return year > 1900 && year < 2100;
  };
  const dateCols = cols.filter((key) => {
    const validCount = sampleData.filter((d) => isDateLike2(d[key])).length;
    return validCount > sampleData.length * 0.9;
  });
  if (dateCols.includes("date")) return "date";
  return dateCols[0] || null;
}
function guessSizeColumn(cols) {
  return cols.find((d) => d.match(/size|clicks|가중치/i)) || null;
}
function createChunkData(rawData, columnMapping, options = {}) {
  const { maxSize = 1e3, reservoirSample: reservoirSample2 = null, userSubscript = "FREE" } = options;
  const filtered = rawData.filter(
    (d) => d[columnMapping.text]?.replace(/\\n/g, "\n")
  );
  let samples;
  if (userSubscript.match(/free|basic/i) || !reservoirSample2) {
    samples = filtered.slice(0, maxSize);
  } else {
    samples = reservoirSample2(filtered, maxSize)[0];
  }
  return samples.map((d, i) => ({
    ...d,
    textid: i + 1,
    text: d[columnMapping.text].replace(/\\n/g, "\n"),
    size: +d[columnMapping.size] ? +d[columnMapping.size] : 1,
    ...columnMapping.date && columnMapping.date !== "\uC5C6\uC74C" ? { date: d[columnMapping.date] } : {}
  })).filter((d) => d.text);
}
var DataInput = class {
  constructor(options = {}) {
    this.options = {
      maxSize: 1e3,
      ...options
    };
    this.Papa = options.Papa || null;
  }
  /**
   * PapaParse 라이브러리 설정
   */
  setPapa(Papa) {
    this.Papa = Papa;
    return this;
  }
  /**
   * 전체 입력 처리
   * @param {Object} file - { name, content }
   * @param {Object} columnMapping - { text, date, size } (없으면 자동 추측)
   * @returns {Object} { format, parsed, columns, chunkData, guessedColumns }
   */
  process(file, columnMapping = null) {
    if (!file?.content) {
      throw new Error("\uD30C\uC77C \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
    }
    if (!this.Papa) {
      throw new Error("PapaParse \uB77C\uC774\uBE0C\uB7EC\uB9AC\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4");
    }
    const format = detectFormat(file.content);
    const parsed = parseContent(file.content, format, this.Papa);
    const rawData = parsed.data;
    const columns = parsed.meta.fields || [];
    const guessedColumns = guessColumns(rawData, columns);
    const mapping = columnMapping || {
      text: guessedColumns.textColumn,
      date: guessedColumns.dateColumn,
      size: guessedColumns.sizeColumn
    };
    const chunkData = createChunkData(rawData, mapping, this.options);
    return {
      format,
      parsed,
      columns,
      guessedColumns,
      columnMapping: mapping,
      rawData,
      chunkData
    };
  }
  /**
   * 컬럼 매핑만 변경하여 chunkData 재생성
   */
  reprocess(rawData, columnMapping) {
    return createChunkData(rawData, columnMapping, this.options);
  }
};

// src/input/ui.js
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
    const samples = rawText.slice(0, 50);
    const validCount = samples.filter((d) => {
      const val = String(d[key] ?? "").trim();
      return val !== "" && !isNaN(Number(val)) && isFinite(Number(val));
    }).length;
    return validCount >= samples.length * 0.9;
  });
}
function isDateLike(value) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(v)) return true;
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(v)) return true;
  if (/^\d{8}$/.test(v)) return true;
  if (/\d{4}년\s*\d{1,2}월/.test(v)) return true;
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return true;
  return false;
}
function findDateKeyCandidates(rawCols, rawText) {
  return rawCols.filter((key) => {
    const samples = rawText.slice(0, 20);
    const dateCount = samples.filter((d) => isDateLike(d[key])).length;
    return dateCount >= samples.length * 0.5;
  });
}
function guessDateKey(rawCols, rawText) {
  const candidates = findDateKeyCandidates(rawCols, rawText);
  const dateKeywords = ["date", "\uB0A0\uC9DC", "created", "updated", "time", "\uC77C\uC790", "\uC77C\uC2DC"];
  for (const keyword of dateKeywords) {
    const found = candidates.find((col) => col.toLowerCase().includes(keyword));
    if (found) return found;
  }
  return candidates[0] || null;
}
function guessSizeKey(rawCols, rawText) {
  const candidates = findSizeKeyCandidates(rawCols, rawText);
  const sizeKeywords = ["\uAC00\uC911\uCE58", "weight", "size", "count", "score", "like", "vote"];
  for (const keyword of sizeKeywords) {
    const found = candidates.find((col) => col.toLowerCase().includes(keyword.toLowerCase()));
    if (found) return found;
  }
  return candidates[0] || null;
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
function createFileInputUI(Papa, options = {}) {
  const {
    maxSize = 1e3,
    width = 800,
    showPreview = true,
    label = "\uB370\uC774\uD130 \uC785\uB825"
  } = options;
  let attachedFiles = [];
  let rawText = [];
  let columnMapping = { text: "", size: "\uC5C6\uC74C", date: "\uC5C6\uC74C" };
  let chunks = [];
  const container = document.createElement("div");
  container.className = "file-input-processor";
  container.style.cssText = `width: ${width}px; font-family: var(--sans-serif, system-ui);`;
  const style = document.createElement("style");
  style.textContent = `
    .file-input-processor {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .file-input-processor .input-section {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 8px;
      align-items: start;
    }
    .file-input-processor label {
      font-weight: 500;
      padding-top: 8px;
    }
    .file-input-processor .text-input-container {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 10px;
      background: #fff;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .file-input-processor .text-input-container.dragover {
      background: #0B99FF22;
      border: 2px solid #0b99ff;
    }
    .file-input-processor .text-input-container.has-file {
      padding: 20px;
    }
    .file-input-processor .text-input-container.has-file textarea,
    .file-input-processor .text-input-container.has-file .drop-icon {
      display: none;
    }
    .file-input-processor textarea {
      width: 100%;
      height: 150px;
      resize: none;
      border: none;
      border-radius: 10px;
      padding: 1em;
      padding-left: 55px;
      font-size: 1em;
      box-sizing: border-box;
      background: transparent;
    }
    .file-input-processor textarea:focus {
      outline: none;
    }
    .file-input-processor .drop-icon {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 8px;
      font-size: 18px;
      color: #797979;
    }
    .file-input-processor .drop-icon:hover {
      background: #eee;
    }
    .file-input-processor .file-preview-inside {
      display: none;
      flex-direction: column;
      align-items: center;
      position: relative;
      max-width: 80%;
    }
    .file-input-processor .text-input-container.has-file .file-preview-inside {
      display: flex;
    }
    .file-input-processor .file-preview-inside .close-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 24px;
      height: 24px;
      background: #888;
      color: #fff;
      border: none;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .file-input-processor .file-preview-inside .close-btn:hover {
      background: #666;
    }
    .file-input-processor .file-preview-inside .content-box {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      max-width: 400px;
      max-height: 120px;
      overflow: hidden;
      font-size: 12px;
      color: #555;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .file-input-processor .file-preview-inside .file-name {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #4b9de5;
      text-decoration: underline;
    }
    .file-input-processor .column-mapping {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .file-input-processor .column-mapping select {
      min-width: 150px;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      height: 36px;
    }
    .file-input-processor .preview-table {
      max-height: 300px;
      overflow: auto;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    .file-input-processor table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .file-input-processor th, .file-input-processor td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .file-input-processor th {
      background: #f8f8f8;
      font-weight: 600;
      position: sticky;
      top: 0;
    }
    .file-input-processor td.chunk {
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-input-processor .data-count {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    .file-input-processor .data-count .count {
      font-weight: bold;
      color: #333;
    }
    .file-input-processor .data-count .over {
      color: #e53e3e;
    }
  `;
  container.appendChild(style);
  const inputSection = document.createElement("div");
  inputSection.className = "input-section";
  inputSection.innerHTML = `
    <label>${label}</label>
    <div class="text-input-wrapper">
      <div class="text-input-container">
        <div class="drop-icon" title="\uD30C\uC77C \uCCA8\uBD80">\u{1F4CE}</div>
        <textarea placeholder="\uBD84\uC11D\uD560 \uD14D\uC2A4\uD2B8\uB098 \uB370\uC774\uD130 \uC2DC\uD2B8\uB97C \uBD99\uC5EC \uB123\uC73C\uC138\uC694. \uB610\uB294 CSV \uD30C\uC77C\uC744 \uCCA8\uBD80\uD558\uC138\uC694."></textarea>
        <input type="file" accept=".csv,.tsv,.txt" style="display:none;">
        <div class="file-preview-inside">
          <button class="close-btn" title="\uB2EB\uAE30">\xD7</button>
          <div class="content-box"></div>
          <div class="file-name"></div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(inputSection);
  const mappingSection = document.createElement("div");
  mappingSection.className = "input-section column-mapping-section";
  mappingSection.style.display = "none";
  mappingSection.innerHTML = `
    <label>\uBD84\uC11D \uC124\uC815</label>
    <div class="column-mapping">
      <div>
        <label style="font-size:12px;padding:0;">\uBD84\uC11D\uD560 \uCEEC\uB7FC</label>
        <select name="textColumn"></select>
      </div>
      <div class="date-column-wrapper" style="display:none;">
        <label style="font-size:12px;padding:0;">\uB0A0\uC9DC \uCEEC\uB7FC</label>
        <select name="dateColumn"><option value="\uC5C6\uC74C">\uC5C6\uC74C</option></select>
      </div>
      <div class="size-column-wrapper" style="display:none;">
        <label style="font-size:12px;padding:0;">\uAC00\uC911\uCE58 \uCEEC\uB7FC</label>
        <select name="sizeColumn"><option value="\uC5C6\uC74C">\uC5C6\uC74C</option></select>
      </div>
    </div>
  `;
  container.appendChild(mappingSection);
  const previewSection = document.createElement("div");
  previewSection.className = "input-section preview-section";
  previewSection.style.display = "none";
  previewSection.innerHTML = `
    <label>\uBBF8\uB9AC\uBCF4\uAE30</label>
    <div>
      <div class="preview-table"></div>
      <div class="data-count"></div>
    </div>
  `;
  container.appendChild(previewSection);
  const textarea = inputSection.querySelector("textarea");
  const fileInput = inputSection.querySelector("input[type=file]");
  const dropIcon = inputSection.querySelector(".drop-icon");
  const textInputContainer = inputSection.querySelector(".text-input-container");
  const filePreviewInside = inputSection.querySelector(".file-preview-inside");
  const fileCloseBtn = inputSection.querySelector(".close-btn");
  const contentBox = inputSection.querySelector(".content-box");
  const fileNameLabel = inputSection.querySelector(".file-name");
  const textColumnSelect = mappingSection.querySelector('select[name="textColumn"]');
  const dateColumnSelect = mappingSection.querySelector('select[name="dateColumn"]');
  const dateColumnWrapper = mappingSection.querySelector(".date-column-wrapper");
  const sizeColumnSelect = mappingSection.querySelector('select[name="sizeColumn"]');
  const sizeColumnWrapper = mappingSection.querySelector(".size-column-wrapper");
  const previewTable = previewSection.querySelector(".preview-table");
  const dataCountDiv = previewSection.querySelector(".data-count");
  function updateValue() {
    container.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }
  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      attachedFiles = [{ name: file.name, content: e.target.result }];
      updateFilePreview();
      processData();
    };
    reader.readAsText(file);
  }
  function addTextAsFile() {
    const text = textarea.value.trim();
    if (text) {
      attachedFiles = [{ name: "Pasted", content: text }];
      textarea.value = "";
      updateFilePreview();
      processData();
    }
  }
  function updateFilePreview() {
    if (attachedFiles.length > 0) {
      const file = attachedFiles[0];
      const lines = file.content.split("\n").slice(0, 5);
      contentBox.textContent = lines.join("\n");
      fileNameLabel.textContent = file.name;
      textInputContainer.classList.add("has-file");
    } else {
      textInputContainer.classList.remove("has-file");
      contentBox.textContent = "";
      fileNameLabel.textContent = "";
    }
  }
  function clearFile() {
    attachedFiles = [];
    rawText = [];
    chunks = [];
    columnMapping = { text: "", size: "\uC5C6\uC74C", date: "\uC5C6\uC74C" };
    updateFilePreview();
    mappingSection.style.display = "none";
    previewSection.style.display = "none";
    updateValue();
  }
  function processData() {
    if (attachedFiles.length === 0) {
      rawText = [];
      chunks = [];
      mappingSection.style.display = "none";
      previewSection.style.display = "none";
      updateValue();
      return;
    }
    const content = attachedFiles[0].content;
    const format = detectFormat(content);
    const parsed = Papa.parse(
      format === "text" ? "text\n" + content : content,
      {
        header: true,
        skipEmptyLines: true,
        delimiter: format === "tsv" ? "	" : ",",
        quoteChar: '"',
        transformHeader: (h) => h.trim().replace(/^["']|["']$/g, "")
      }
    );
    rawText = parsed.data.filter((d) => Object.values(d).some((v) => v && String(v).trim()));
    if (rawText.length === 0) {
      chunks = [];
      updateValue();
      return;
    }
    const rawCols = parsed.meta.fields.filter((d) => d && !d.startsWith("_"));
    const guessedText = guessTextKey(rawCols, rawText);
    const dateCandidates = findDateKeyCandidates(rawCols, rawText);
    const guessedDate = guessDateKey(rawCols, rawText);
    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    textColumnSelect.innerHTML = rawCols.map(
      (col) => `<option value="${col}" ${col === guessedText ? "selected" : ""}>${col}</option>`
    ).join("");
    dateColumnSelect.innerHTML = '<option value="\uC5C6\uC74C">\uC5C6\uC74C</option>' + dateCandidates.map((col) => `<option value="${col}" ${col === guessedDate ? "selected" : ""}>${col}</option>`).join("");
    sizeColumnSelect.innerHTML = '<option value="\uC5C6\uC74C">\uC5C6\uC74C</option>' + sizeCandidates.map((col) => `<option value="${col}">${col}</option>`).join("");
    dateColumnWrapper.style.display = dateCandidates.length > 0 ? "block" : "none";
    sizeColumnWrapper.style.display = sizeCandidates.length > 0 ? "block" : "none";
    mappingSection.style.display = rawCols.length >= 2 ? "grid" : "none";
    previewSection.style.display = showPreview ? "grid" : "none";
    columnMapping.text = guessedText;
    columnMapping.date = guessedDate || "\uC5C6\uC74C";
    columnMapping.size = "\uC5C6\uC74C";
    updateChunks();
  }
  function updateChunks() {
    const textKey = columnMapping.text;
    const dateKey = columnMapping.date === "\uC5C6\uC74C" ? null : columnMapping.date;
    const sizeKey = columnMapping.size === "\uC5C6\uC74C" ? null : columnMapping.size;
    const filtered = rawText.filter((d) => {
      const v = d?.[textKey];
      return typeof v === "string" && v.replace(/\\n/g, "\n").trim().length > 0;
    });
    const sampled = reservoirSample(filtered, maxSize)[0];
    chunks = sampled.map((d, i) => ({
      ...d,
      textid: i + 1,
      text: String(d[textKey] || "").replace(/\\n/g, "\n"),
      size: sizeKey ? +d[sizeKey] || 1 : 1,
      ...dateKey ? { date: d[dateKey] } : {}
    }));
    updatePreview();
    updateValue();
  }
  function updatePreview() {
    if (!showPreview || chunks.length === 0) {
      previewTable.innerHTML = "";
      dataCountDiv.innerHTML = "";
      return;
    }
    const rows = chunks.slice(0, 100);
    const hasDateCol = columnMapping.date !== "\uC5C6\uC74C";
    const hasSizeCol = columnMapping.size !== "\uC5C6\uC74C";
    previewTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>\uBD84\uC11D\uD560 \uD14D\uC2A4\uD2B8</th>
            ${hasDateCol ? '<th style="width:100px;">\uB0A0\uC9DC</th>' : ""}
            ${hasSizeCol ? '<th style="width:60px;">\uAC00\uC911\uCE58</th>' : ""}
          </tr>
        </thead>
        <tbody>
          ${rows.map((d) => `
            <tr>
              <td>${d.textid}</td>
              <td class="chunk" title="${d.text}">${d.text.slice(0, 200)}</td>
              ${hasDateCol ? `<td>${d.date || ""}</td>` : ""}
              ${hasSizeCol ? `<td>${d.size}</td>` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    const isOver = rawText.length > maxSize;
    dataCountDiv.innerHTML = `
      <span class="count ${isOver ? "over" : ""}">${chunks.length}</span>
      <span style="opacity:0.5;"> / ${maxSize}</span>
      ${isOver ? `<span style="margin-left:10px;color:#666;font-size:12px;">(${rawText.length}\uAC1C \uC911 \uB79C\uB364 \uC0D8\uD50C\uB9C1\uB428)</span>` : ""}
    `;
  }
  fileCloseBtn.onclick = () => clearFile();
  dropIcon.onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    if (e.target.files.length > 0) {
      readFile(e.target.files[0]);
      fileInput.value = "";
    }
  };
  textarea.onpaste = () => setTimeout(addTextAsFile, 0);
  textarea.onblur = () => {
    if (textarea.value.trim()) addTextAsFile();
  };
  textInputContainer.ondragover = (e) => {
    e.preventDefault();
    textInputContainer.classList.add("dragover");
  };
  textInputContainer.ondragleave = () => {
    textInputContainer.classList.remove("dragover");
  };
  textInputContainer.ondrop = (e) => {
    e.preventDefault();
    textInputContainer.classList.remove("dragover");
    if (e.dataTransfer.files?.length > 0) {
      readFile(e.dataTransfer.files[0]);
    } else {
      const text = e.dataTransfer.getData("text");
      if (text) {
        textarea.value = text;
        setTimeout(addTextAsFile, 0);
      }
    }
  };
  textColumnSelect.onchange = () => {
    columnMapping.text = textColumnSelect.value;
    updateChunks();
  };
  dateColumnSelect.onchange = () => {
    columnMapping.date = dateColumnSelect.value;
    updateChunks();
  };
  sizeColumnSelect.onchange = () => {
    columnMapping.size = sizeColumnSelect.value;
    updateChunks();
  };
  Object.defineProperty(container, "value", {
    get: () => chunks,
    set: (v) => {
      chunks = v || [];
      updatePreview();
    }
  });
  container.addSampleData = function(fileData) {
    if (!fileData || !fileData.content) return;
    attachedFiles = [{
      name: fileData.name || "Sample Data",
      content: fileData.content
    }];
    updateFilePreview();
    processData();
  };
  container.clear = function() {
    clearFile();
  };
  Object.defineProperty(container, "columnMapping", {
    get: () => ({ ...columnMapping })
  });
  Object.defineProperty(container, "rawData", {
    get: () => rawText
  });
  Object.defineProperty(container, "fileInfo", {
    get: () => attachedFiles.length > 0 ? { ...attachedFiles[0] } : null
  });
  return container;
}
function createFileInputUIv2(Papa, options = {}) {
  const {
    maxSize = 1e3,
    width = 900,
    label = "\uB370\uC774\uD130 \uC785\uB825",
    tabs = [
      { id: "text", label: "\uD14D\uC2A4\uD2B8 \uBD99\uC5EC\uB123\uAE30", icon: "T", description: "\uC5B4\uD53C\uB2C8\uD2F0\uBC84\uBE14\uB85C \uBD84\uC11D\uD560 \uC904\uAE00 \uD14D\uC2A4\uD2B8\uB97C \uBCF5\uC0AC\uD574\uC11C \uBD99\uC5EC\uB123\uAE30 \uD558\uC138\uC694." },
      { id: "excel", label: "\uC5D1\uC140 \uBD99\uC5EC\uB123\uAE30", icon: "\u229E", description: "\uC5D1\uC140\uC5D0\uC11C \uB370\uC774\uD130\uB97C \uBCF5\uC0AC\uD558\uC5EC \uBD99\uC5EC\uB123\uAE30 \uD558\uC138\uC694. \uCCAB \uD589\uC740 \uD5E4\uB354\uB85C \uC778\uC2DD\uB429\uB2C8\uB2E4." },
      { id: "csv", label: "CSV \uC5C5\uB85C\uB4DC", icon: "\u2191", description: "CSV \uD30C\uC77C\uC744 \uC5C5\uB85C\uB4DC\uD55C \uD6C4 \uBD84\uC11D\uD560 \uD14D\uC2A4\uD2B8 \uCEEC\uB7FC\uACFC \uAC00\uC911\uCE58\uB85C \uC124\uC815\uD560 \uCEEC\uB7FC\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694." }
    ],
    sampleButtons = []
  } = options;
  let attachedFiles = [];
  let rawText = [];
  let rawCols = [];
  let columnMapping = { text: "", size: "\uC5C6\uC74C", date: "\uC5C6\uC74C" };
  let chunks = [];
  let currentTab = tabs[0]?.id || "text";
  let isModalOpen = false;
  let step = "input";
  const COL_TYPES = {
    text: { label: "\uBD84\uC11D \uD14D\uC2A4\uD2B8", color: "#10b981", bgColor: "#d1fae5" },
    date: { label: "\uB0A0\uC9DC", color: "#8b5cf6", bgColor: "#ede9fe" },
    size: { label: "\uAC00\uC911\uCE58", color: "#f59e0b", bgColor: "#fef3c7" }
  };
  const container = document.createElement("div");
  container.className = "file-input-v2";
  container.style.cssText = `width: ${width}px; font-family: var(--sans-serif, system-ui); position: relative;`;
  const style = document.createElement("style");
  style.textContent = `
    .file-input-v2 {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
    }
    .file-input-v2 .step-label {
      display: inline-block;
      background: #a7f3d0;
      color: #065f46;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .file-input-v2 .title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .file-input-v2 .subtitle {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .file-input-v2 .input-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .file-input-v2 .input-btn {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v2 .input-btn:hover {
      border-color: #94a3b8;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .file-input-v2 .input-btn .icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 2px solid #333;
      border-radius: 8px;
    }
    .file-input-v2 .input-btn .text {
      font-size: 15px;
      font-weight: 500;
    }
    .file-input-v2 .sample-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #fff;
      border-radius: 12px;
    }
    .file-input-v2 .sample-section .label {
      color: #64748b;
      font-size: 14px;
    }
    .file-input-v2 .sample-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v2 .sample-btn:hover {
      background: #f1f5f9;
    }

    /* \uBAA8\uB2EC - \uCEE8\uD14C\uC774\uB108 \uC704\uC5D0 \uC624\uBC84\uB808\uC774 */
    .file-input-v2 .modal-overlay {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.95);
      z-index: 100;
      align-items: flex-start;
      justify-content: center;
      padding-top: 20px;
      border-radius: 12px;
    }
    .file-input-v2 .modal-overlay.open {
      display: flex;
    }
    .file-input-v2 .modal {
      background: #fff;
      border-radius: 16px;
      width: 100%;
      max-width: 100%;
      max-height: calc(100% - 40px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0;
    }
    .file-input-v2 .modal-header {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
    }
    .file-input-v2 .modal-tab {
      flex: 1;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .file-input-v2 .modal-tab:hover {
      background: #f8fafc;
    }
    .file-input-v2 .modal-tab.active {
      border-bottom-color: #10b981;
      color: #10b981;
      font-weight: 600;
    }
    .file-input-v2 .modal-tab .tab-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid currentColor;
      border-radius: 4px;
      font-size: 12px;
    }
    .file-input-v2 .modal-body {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    .file-input-v2 .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
    }
    .file-input-v2 .btn {
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .file-input-v2 .btn-cancel {
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }
    .file-input-v2 .btn-cancel:hover {
      background: #f8fafc;
    }
    .file-input-v2 .btn-primary {
      background: #10b981;
      border: none;
      color: #fff;
    }
    .file-input-v2 .btn-primary:hover {
      background: #059669;
    }
    .file-input-v2 .btn-primary:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    /* \uC785\uB825 \uC601\uC5ED */
    .file-input-v2 .input-area {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      min-height: 200px;
      position: relative;
    }
    .file-input-v2 .input-area textarea {
      width: 100%;
      height: 200px;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-size: 14px;
      resize: none;
      box-sizing: border-box;
    }
    .file-input-v2 .input-area textarea:focus {
      outline: none;
    }
    .file-input-v2 .input-area.dragover {
      border-color: #10b981;
      background: #f0fdf4;
    }
    .file-input-v2 .guide-box {
      margin-top: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .file-input-v2 .guide-box .guide-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .file-input-v2 .guide-box .guide-desc {
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }

    /* \uBBF8\uB9AC\uBCF4\uAE30 \uD14C\uC774\uBE14 */
    .file-input-v2 .preview-table-wrapper {
      max-height: 350px;
      overflow: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .file-input-v2 .preview-table {
      width: 100%;
      min-width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      table-layout: auto;
    }
    .file-input-v2 .preview-table th {
      position: sticky;
      top: 0;
      background: #f8fafc;
      padding: 12px 8px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      z-index: 1;
    }
    .file-input-v2 .preview-table th:hover {
      background: #f1f5f9;
    }
    .file-input-v2 .preview-table th.col-text {
      background: ${COL_TYPES.text.bgColor};
      color: ${COL_TYPES.text.color};
    }
    .file-input-v2 .preview-table th.col-date {
      background: ${COL_TYPES.date.bgColor};
      color: ${COL_TYPES.date.color};
    }
    .file-input-v2 .preview-table th.col-size {
      background: ${COL_TYPES.size.bgColor};
      color: ${COL_TYPES.size.color};
    }
    .file-input-v2 .preview-table th .th-content {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .file-input-v2 .preview-table th .col-name {
      flex-shrink: 0;
    }
    .file-input-v2 .preview-table th .col-badge {
      display: inline-block;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .file-input-v2 .preview-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #f1f5f9;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* \uC644\uB8CC \uD654\uBA74 */
    .file-input-v2 .done-view {
      padding: 20px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .file-input-v2 .done-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .file-input-v2 .done-info {
      font-size: 14px;
      color: #64748b;
    }
    .file-input-v2 .done-info strong {
      color: #10b981;
    }
    .file-input-v2 .done-reset-btn {
      padding: 8px 16px;
      background: #f1f5f9;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .file-input-v2 .done-reset-btn:hover {
      background: #e2e8f0;
    }
  `;
  container.appendChild(style);
  const mainView = document.createElement("div");
  mainView.className = "main-view";
  mainView.innerHTML = `
    <div class="step-label">STEP 1</div>
    <div class="title">${label}</div>
    <div class="subtitle">\uBD84\uC11D\uD560 \uB370\uC774\uD130\uB97C \uBD99\uC5EC \uB123\uAC70\uB098 CSV \uD30C\uC77C\uC744 \uC5C5\uB85C\uB4DC\uD558\uC138\uC694.</div>
    <div class="input-buttons">
      ${tabs.map((tab) => `
        <button class="input-btn" data-tab="${tab.id}">
          <span class="icon">${tab.icon}</span>
          <span class="text">${tab.label}</span>
        </button>
      `).join("")}
    </div>
    ${sampleButtons.length > 0 ? `
      <div class="sample-section">
        <span class="label">\uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30</span>
        ${sampleButtons.map((btn, i) => `
          <button class="sample-btn" data-sample="${i}">\u2197 ${btn.label}</button>
        `).join("")}
      </div>
    ` : ""}
  `;
  container.appendChild(mainView);
  const doneView = document.createElement("div");
  doneView.className = "done-view";
  doneView.style.display = "none";
  container.appendChild(doneView);
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        ${tabs.map((tab) => `
          <div class="modal-tab ${tab.id === currentTab ? "active" : ""}" data-tab="${tab.id}">
            <span class="tab-icon">${tab.icon}</span>
            <span>${tab.label}</span>
          </div>
        `).join("")}
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer">
        <button class="btn btn-cancel">\uCDE8\uC18C</button>
        <button class="btn btn-primary" disabled>\uC644\uB8CC</button>
      </div>
    </div>
  `;
  container.appendChild(modalOverlay);
  const modal = modalOverlay.querySelector(".modal");
  const modalBody = modal.querySelector(".modal-body");
  const modalTabs = modal.querySelectorAll(".modal-tab");
  const btnCancel = modal.querySelector(".btn-cancel");
  const btnPrimary = modal.querySelector(".btn-primary");
  function updateValue() {
    container.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }
  function openModal(tabId) {
    currentTab = tabId || tabs[0]?.id;
    step = "input";
    isModalOpen = true;
    modalOverlay.classList.add("open");
    updateModalTabs();
    renderModalContent();
  }
  function closeModal() {
    isModalOpen = false;
    modalOverlay.classList.remove("open");
  }
  function updateModalTabs() {
    modalTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === currentTab);
    });
  }
  function getTabDescription() {
    const tab = tabs.find((t) => t.id === currentTab);
    return tab?.description || "";
  }
  function renderModalContent() {
    if (step === "input") {
      renderInputStep();
    } else if (step === "preview") {
      renderPreviewStep();
    }
    btnPrimary.disabled = step === "input" && rawText.length === 0;
    btnPrimary.textContent = step === "preview" ? "\uC644\uB8CC" : "\uB2E4\uC74C";
  }
  function renderInputStep() {
    const desc = getTabDescription();
    modalBody.innerHTML = `
      <div class="input-area" id="inputArea">
        <textarea placeholder="${currentTab === "text" ? "\uC904\uAE00 \uD14D\uC2A4\uD2B8\uB97C \uBD99\uC5EC\uB123\uC73C\uC138\uC694." : currentTab === "excel" ? "\uC5D1\uC140\uC5D0\uC11C \uBCF5\uC0AC\uD55C \uB370\uC774\uD130\uB97C \uBD99\uC5EC\uB123\uC73C\uC138\uC694." : "CSV \uD30C\uC77C\uC744 \uB4DC\uB798\uADF8\uD558\uAC70\uB098 \uBD99\uC5EC\uB123\uC73C\uC138\uC694."}" id="modalTextarea"></textarea>
        <input type="file" accept=".csv,.tsv,.txt" style="display:none;" id="modalFileInput">
      </div>
      <div class="guide-box">
        <div class="guide-title">\u24D8 ${tabs.find((t) => t.id === currentTab)?.label || ""} \uAC00\uC774\uB4DC</div>
        <div class="guide-desc">${desc}</div>
      </div>
    `;
    const inputArea = modalBody.querySelector("#inputArea");
    const textarea = modalBody.querySelector("#modalTextarea");
    const fileInput = modalBody.querySelector("#modalFileInput");
    textarea.onpaste = (e) => {
      setTimeout(() => {
        const text = textarea.value.trim();
        if (text) {
          processContent(text, "Pasted");
        }
      }, 0);
    };
    textarea.onblur = () => {
      const text = textarea.value.trim();
      if (text) {
        processContent(text, "Pasted");
      }
    };
    inputArea.ondragover = (e) => {
      e.preventDefault();
      inputArea.classList.add("dragover");
    };
    inputArea.ondragleave = () => inputArea.classList.remove("dragover");
    inputArea.ondrop = (e) => {
      e.preventDefault();
      inputArea.classList.remove("dragover");
      if (e.dataTransfer.files?.length > 0) {
        readFileContent(e.dataTransfer.files[0]);
      }
    };
    if (currentTab === "csv") {
      inputArea.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        if (e.target.files.length > 0) {
          readFileContent(e.target.files[0]);
        }
      };
    }
  }
  function readFileContent(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      processContent(e.target.result, file.name);
    };
    reader.readAsText(file);
  }
  function processContent(content, fileName) {
    attachedFiles = [{ name: fileName, content }];
    const format = detectFormat(content);
    const parsed = Papa.parse(
      format === "text" ? "text\n" + content : content,
      {
        header: true,
        skipEmptyLines: true,
        delimiter: format === "tsv" ? "	" : ",",
        quoteChar: '"',
        transformHeader: (h) => h.trim().replace(/^["']|["']$/g, "")
      }
    );
    rawText = parsed.data.filter((d) => Object.values(d).some((v) => v && String(v).trim()));
    rawCols = parsed.meta.fields.filter((d) => d && !d.startsWith("_"));
    if (rawText.length > 0) {
      const guessedText = guessTextKey(rawCols, rawText);
      const guessedDate = guessDateKey(rawCols, rawText);
      const guessedSize = guessSizeKey(rawCols, rawText);
      columnMapping.text = guessedText;
      columnMapping.date = guessedDate || "\uC5C6\uC74C";
      columnMapping.size = guessedSize || "\uC5C6\uC74C";
      step = "preview";
      renderModalContent();
    }
  }
  function renderPreviewStep() {
    const dateCandidates = findDateKeyCandidates(rawCols, rawText);
    const sizeCandidates = findSizeKeyCandidates(rawCols, rawText);
    function getColType(col) {
      if (col === columnMapping.text) return "text";
      if (col === columnMapping.date && columnMapping.date !== "\uC5C6\uC74C") return "date";
      if (col === columnMapping.size && columnMapping.size !== "\uC5C6\uC74C") return "size";
      return null;
    }
    function getColClass(col) {
      const type = getColType(col);
      return type ? `col-${type}` : "";
    }
    function getBadge(col) {
      const type = getColType(col);
      if (!type) return "";
      const info = COL_TYPES[type];
      return `<span class="col-badge" style="background:${info.color};color:#fff;">\u2713 ${info.label}</span>`;
    }
    const rows = rawText.slice(0, 50);
    modalBody.innerHTML = `
      <div class="preview-table-wrapper">
        <table class="preview-table">
          <thead>
            <tr>
              ${rawCols.map((col) => `
                <th class="${getColClass(col)}" data-col="${col}" title="\uD074\uB9AD\uD558\uC5EC \uB9E4\uD551 \uBCC0\uACBD">
                  <span class="th-content"><span class="col-name">${col}</span>${getBadge(col)}</span>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                ${rawCols.map((col) => `<td title="${row[col] || ""}">${String(row[col] || "").slice(0, 100)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="guide-box">
        <div class="guide-title">\u24D8 \uCEEC\uB7FC \uB9E4\uD551 \uAC00\uC774\uB4DC</div>
        <div class="guide-desc">\uD5E4\uB354\uB97C \uD074\uB9AD\uD558\uBA74 \uB9E4\uD551\uC744 \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
          <span style="color:${COL_TYPES.text.color};font-weight:600;">\uBD84\uC11D \uD14D\uC2A4\uD2B8</span>,
          <span style="color:${COL_TYPES.date.color};font-weight:600;">\uB0A0\uC9DC</span>,
          <span style="color:${COL_TYPES.size.color};font-weight:600;">\uAC00\uC911\uCE58</span>\uB97C \uC21C\uC11C\uB300\uB85C \uD074\uB9AD\uD558\uC138\uC694.
        </div>
      </div>
    `;
    const headers = modalBody.querySelectorAll("th[data-col]");
    headers.forEach((th) => {
      th.onclick = () => {
        const col = th.dataset.col;
        cycleColumnMapping(col, dateCandidates, sizeCandidates);
        renderPreviewStep();
      };
    });
    btnPrimary.disabled = !columnMapping.text;
  }
  function cycleColumnMapping(col, dateCandidates, sizeCandidates) {
    const currentType = col === columnMapping.text ? "text" : col === columnMapping.date ? "date" : col === columnMapping.size ? "size" : null;
    const isSizeCandidate = sizeCandidates.includes(col);
    const isDateCandidate = dateCandidates.includes(col);
    if (!currentType) {
      if (isSizeCandidate) {
        columnMapping.size = col;
      } else if (isDateCandidate) {
        columnMapping.date = col;
      } else {
        columnMapping.text = col;
      }
    } else if (currentType === "text") {
      columnMapping.text = "";
    } else if (currentType === "date") {
      columnMapping.date = "\uC5C6\uC74C";
    } else if (currentType === "size") {
      columnMapping.size = "\uC5C6\uC74C";
    }
  }
  function finalize() {
    const textKey = columnMapping.text;
    const dateKey = columnMapping.date === "\uC5C6\uC74C" ? null : columnMapping.date;
    const sizeKey = columnMapping.size === "\uC5C6\uC74C" ? null : columnMapping.size;
    const filtered = rawText.filter((d) => {
      const v = d?.[textKey];
      return typeof v === "string" && v.replace(/\\n/g, "\n").trim().length > 0;
    });
    const sampled = reservoirSample(filtered, maxSize)[0];
    chunks = sampled.map((d, i) => ({
      ...d,
      textid: i + 1,
      text: String(d[textKey] || "").replace(/\\n/g, "\n"),
      size: sizeKey ? +d[sizeKey] || 1 : 1,
      ...dateKey ? { date: d[dateKey] } : {}
    }));
    step = "done";
    closeModal();
    renderDoneView();
    updateValue();
  }
  function renderDoneView() {
    mainView.style.display = "none";
    doneView.style.display = "block";
    const hasDateCol = columnMapping.date !== "\uC5C6\uC74C";
    const hasSizeCol = columnMapping.size !== "\uC5C6\uC74C";
    const rows = chunks.slice(0, 100);
    doneView.innerHTML = `
      <div class="done-header">
        <div class="done-info">
          <strong>${chunks.length}\uAC74</strong>\uC758 \uB370\uC774\uD130\uAC00 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.
          (\uBD84\uC11D \uCEEC\uB7FC: ${columnMapping.text}${hasDateCol ? `, \uB0A0\uC9DC: ${columnMapping.date}` : ""}${hasSizeCol ? `, \uAC00\uC911\uCE58: ${columnMapping.size}` : ""})
        </div>
        <button class="done-reset-btn">\uB2E4\uC2DC \uC785\uB825</button>
      </div>
      <div class="preview-table-wrapper" style="max-height:300px;">
        <table class="preview-table">
          <thead>
            <tr>
              <th style="width:50px;">#</th>
              <th>\uBD84\uC11D\uD560 \uD14D\uC2A4\uD2B8</th>
              ${hasDateCol ? '<th style="width:100px;">\uB0A0\uC9DC</th>' : ""}
              ${hasSizeCol ? '<th style="width:80px;">\uAC00\uC911\uCE58</th>' : ""}
            </tr>
          </thead>
          <tbody>
            ${rows.map((d) => `
              <tr>
                <td>${d.textid}</td>
                <td title="${d.text}">${d.text.slice(0, 150)}</td>
                ${hasDateCol ? `<td>${d.date || ""}</td>` : ""}
                ${hasSizeCol ? `<td>${d.size}</td>` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    doneView.querySelector(".done-reset-btn").onclick = reset;
  }
  function reset() {
    attachedFiles = [];
    rawText = [];
    rawCols = [];
    chunks = [];
    columnMapping = { text: "", size: "\uC5C6\uC74C", date: "\uC5C6\uC74C" };
    step = "input";
    mainView.style.display = "block";
    doneView.style.display = "none";
    updateValue();
  }
  mainView.querySelectorAll(".input-btn").forEach((btn) => {
    btn.onclick = () => openModal(btn.dataset.tab);
  });
  mainView.querySelectorAll(".sample-btn").forEach((btn) => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.sample);
      const sample = sampleButtons[idx];
      if (sample?.content) {
        processContent(sample.content, sample.name || "Sample");
        openModal(currentTab);
      } else if (sample?.onClick) {
        sample.onClick();
      }
    };
  });
  modalTabs.forEach((tab) => {
    tab.onclick = () => {
      if (step === "input") {
        currentTab = tab.dataset.tab;
        updateModalTabs();
        renderModalContent();
      }
    };
  });
  btnCancel.onclick = () => {
    if (step === "preview") {
      step = "input";
      renderModalContent();
    } else {
      closeModal();
    }
  };
  btnPrimary.onclick = () => {
    if (step === "preview") {
      finalize();
    }
  };
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeModal();
  };
  Object.defineProperty(container, "value", {
    get: () => chunks,
    set: (v) => {
      chunks = v || [];
      if (chunks.length > 0) {
        step = "done";
        renderDoneView();
      }
    }
  });
  container.addSampleData = function(fileData) {
    if (!fileData?.content) return;
    processContent(fileData.content, fileData.name || "Sample");
    if (rawText.length > 0) {
      openModal(currentTab);
    }
  };
  container.clear = reset;
  Object.defineProperty(container, "columnMapping", {
    get: () => ({ ...columnMapping })
  });
  Object.defineProperty(container, "rawData", {
    get: () => rawText
  });
  Object.defineProperty(container, "fileInfo", {
    get: () => attachedFiles.length > 0 ? { ...attachedFiles[0] } : null
  });
  return container;
}
export {
  DataInput,
  createChunkData,
  createFileInputUI,
  createFileInputUIv2,
  detectFormat,
  guessColumns,
  isLikelyDelimited
};
