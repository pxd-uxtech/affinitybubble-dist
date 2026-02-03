// src/insight/makeCompactText.js
function reservoirSample(arr, k) {
  const reservoir = [];
  let n = 0;
  for (const item of arr) {
    n++;
    if (reservoir.length < k) {
      reservoir.push(item);
    } else {
      const j = Math.floor(Math.random() * n);
      if (j < k) {
        reservoir[j] = item;
      }
    }
  }
  return [reservoir, n];
}
function groupBy(data, keyFn) {
  const groups = /* @__PURE__ */ new Map();
  for (const item of data) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  return Array.from(groups.entries());
}
function makeCompactText(clusterWithLabel, options = {}) {
  const {
    totalSampleSize = 100,
    pipelineResult = null,
    forTopics = false,
    sortFunc = null
  } = options;
  if (!clusterWithLabel || clusterWithLabel.length === 0) {
    return [];
  }
  const total = clusterWithLabel.length;
  const result = [];
  const defaultSortFunc = (key) => (a, b) => b[key] - a[key];
  const sorter = sortFunc || defaultSortFunc;
  const groups = groupBy(clusterWithLabel, (d) => d.cluster);
  const processedGroups = groups.map(([cluster, data]) => {
    const sampleSize = Math.round(data.length * totalSampleSize / total);
    return {
      cluster,
      label: data[0].label,
      description: pipelineResult?.level1?.labels?.find(
        (t) => t.label === data[0].label
      )?.description,
      size: data.length,
      sample: reservoirSample(
        data,
        Math.min(sampleSize, forTopics ? 3 : 5)
      )[0],
      data
    };
  }).sort(sorter("size")).filter((d) => forTopics || d.sample.length);
  processedGroups.forEach((d) => {
    result.push("## " + d.label);
    if (d.description) result.push("- " + d.description);
    d.sample.forEach((t) => {
      result.push("- " + (t.text || t.chunk || "").slice(0, 140));
    });
  });
  return result;
}
function makeCompactData(clusterWithLabel, options = {}) {
  const {
    totalSampleSize = 100,
    pipelineResult = null,
    forTopics = false,
    sortFunc = null
  } = options;
  if (!clusterWithLabel || clusterWithLabel.length === 0) {
    return [];
  }
  const total = clusterWithLabel.length;
  const defaultSortFunc = (key) => (a, b) => b[key] - a[key];
  const sorter = sortFunc || defaultSortFunc;
  const groups = groupBy(clusterWithLabel, (d) => d.cluster);
  return groups.map(([cluster, data]) => {
    const sampleSize = Math.round(data.length * totalSampleSize / total);
    return {
      cluster,
      label: data[0].label,
      bigLabel: data[0].bigLabel,
      description: pipelineResult?.level1?.labels?.find(
        (t) => t.label === data[0].label
      )?.description,
      size: data.length,
      sample: reservoirSample(
        data,
        Math.min(sampleSize, forTopics ? 3 : 5)
      )[0]
    };
  }).sort(sorter("size")).filter((d) => forTopics || d.sample.length);
}

// src/insight/getInsightStream.js
var REPORT_TYPES = {
  SUMMARY: "get_insight",
  // 요약 정리
  PERSONA: "get_user_segment",
  // 퍼소나
  REVIEW: "get_review_insight",
  // 리뷰 분석
  THEMATIC: "get_thematic",
  // 사용자 분석
  UNEXPECTED: "get_unexpected",
  // 의외의 발견
  ALTERNATIVE: "get_alternative_lenses",
  // 관점 제시
  HMW: "get_hmw",
  // HMW 도출
  CUSTOM: "custom_report"
  // 사용자 정의
};
async function getInsightStream(api, textList, options = {}) {
  const {
    type = REPORT_TYPES.SUMMARY,
    requirements = "",
    language = "Korean",
    textId = "",
    userId = "",
    onProgress = () => {
    },
    onComplete = () => {
    },
    onError = () => {
    }
  } = options;
  onProgress("\uB9AC\uD3EC\uD2B8 \uC791\uC131 \uC0DD\uAC01 \uC815\uB9AC \uC911...");
  const system = "you are a text analysis expert.";
  const userInputs = {
    service_type: type,
    text_id: textId,
    content: textList.join("\n"),
    system,
    requirements,
    language
  };
  let buffer = "";
  try {
    const promptId = userInputs.service_type;
    const configId = "Insight";
    const generator = api.prompt(userInputs, promptId, configId);
    let response = null;
    for await (const chunk of generator) {
      try {
        response = chunk;
        buffer = response?.markdown || buffer + (chunk?.text || "");
        onProgress(buffer);
      } catch (e) {
        console.error("Chunk processing error:", e);
      }
    }
    const title = buffer.split("\n")[0].replace(/#/g, "").trim();
    const historyItem = { title, body: buffer, timestamp: Date.now() };
    onComplete(buffer, historyItem);
    return buffer;
  } catch (error) {
    console.error("getInsightStream error:", error);
    onError(error);
    throw error;
  }
}
async function generateReport(api, options = {}) {
  const {
    data,
    type = REPORT_TYPES.SUMMARY,
    requirements = "",
    language = "Korean",
    sampleSize = 150,
    pipelineResult = null,
    onProgress = () => {
    },
    onComplete = () => {
    }
  } = options;
  if (!data || data.length === 0) {
    throw new Error("\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const compactText = makeCompactText(data, {
    totalSampleSize: sampleSize,
    pipelineResult
  });
  return getInsightStream(api, compactText, {
    type,
    requirements,
    language,
    onProgress,
    onComplete
  });
}
function getReportTypeOptions() {
  return [
    { name: "\uC694\uC57D \uC815\uB9AC", func: REPORT_TYPES.SUMMARY },
    { name: "\uD37C\uC18C\uB098", func: REPORT_TYPES.PERSONA },
    // { name: "리뷰 분석", func: REPORT_TYPES.REVIEW },
    // { name: "사용자 분석", func: REPORT_TYPES.THEMATIC },
    // { name: "의외의 발견", func: REPORT_TYPES.UNEXPECTED },
    // { name: "관점 제시", func: REPORT_TYPES.ALTERNATIVE },
    // { name: "HMW 도출", func: REPORT_TYPES.HMW },
    { name: "\uC0AC\uC6A9\uC790 \uC815\uC758", func: REPORT_TYPES.CUSTOM }
  ];
}

// src/insight/insightRenderer.js
function simpleMarkdownParse(text) {
  if (!text) return "";
  return text.replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>").replace(/^/, "<p>").replace(/$/, "</p>");
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}
async function saveAsImage(element, filename = "insight-report.png") {
  if (typeof html2canvas === "undefined") {
    try {
      await import("https://html2canvas.hertzen.com/dist/html2canvas.min.js");
    } catch (e) {
      alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5\uC744 \uC704\uD574 html2canvas \uB77C\uC774\uBE0C\uB7EC\uB9AC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.");
      return;
    }
  }
  const canvas = await html2canvas(element);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
}
function renderInsight(insights, options = {}) {
  const {
    editMode = false,
    markdownParser = null,
    onCopy = null,
    onSave = null,
    onEditToggle = null,
    containerId = null,
    // null이면 항상 새 엘리먼트 생성
    createNew = !options.containerId
    // containerId 없으면 새로 생성
  } = options;
  const parser = markdownParser || simpleMarkdownParse;
  const parsedContent = parser(insights || "");
  const content = editMode ? `<div id="mdEditor" contentEditable="true" style="width:100%; line-height:1.5; font-size:1.2em; min-height:400px; white-space: pre-wrap; border:1px solid #ddd; padding:10px; border-radius:4px;">${insights || ""}</div>` : `<div class="parsed-content">${parsedContent.replace(/&quot;\n&quot;/g, '"<br>"')}</div>`;
  const buttons = `
    <button id="copyBtn" class="insight-btn"><i class="fi fi-br-duplicate"></i> \uD14D\uC2A4\uD2B8 \uBCF5\uC0AC</button>
    <button id="saveBtn" class="insight-btn"><i class="fi fi-br-download"></i> \uC774\uBBF8\uC9C0 \uC800\uC7A5</button>
    <button id="editBtn" class="insight-btn ${editMode ? "edit" : "richtext"}" data-action="toggle-edit">
      ${editMode ? '<i class="fi fi-br-check"></i> \uC644\uB8CC' : '<i class="fi fi-br-pencil"></i> \uD3B8\uC9D1'}
    </button>
  `;
  let container;
  if (createNew || !containerId) {
    container = document.createElement("div");
    if (containerId) container.id = containerId;
    container.innerHTML = `
      <div class="sub-buttons" id="insightButtons" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:10px;">${buttons}</div>
      <div class="report" id="insightReport">${content}</div>
    `;
  } else {
    container = document.getElementById(containerId);
    if (container) {
      const buttonsDiv = container.querySelector("#insightButtons") || container.querySelector(".sub-buttons");
      const reportDiv = container.querySelector("#insightReport") || container.querySelector(".report");
      if (buttonsDiv) buttonsDiv.innerHTML = buttons;
      if (reportDiv) reportDiv.innerHTML = content;
    } else {
      container = document.createElement("div");
      container.id = containerId;
      container.innerHTML = `
        <div class="sub-buttons" id="insightButtons" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:10px;">${buttons}</div>
        <div class="report" id="insightReport">${content}</div>
      `;
    }
  }
  const copyBtn = container.querySelector("#copyBtn");
  const saveBtn = container.querySelector("#saveBtn");
  const editBtn = container.querySelector("#editBtn");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      if (onCopy) {
        onCopy(insights);
      } else {
        await copyToClipboard(insights);
        alert("\uD14D\uC2A4\uD2B8\uAC00 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      }
    };
  }
  if (saveBtn) {
    saveBtn.onclick = async () => {
      if (onSave) {
        onSave(container.querySelector("#insightReport"));
      } else {
        const reportEl = container.querySelector("#insightReport");
        await saveAsImage(reportEl, "insight-report.png");
      }
    };
  }
  if (editBtn && onEditToggle) {
    editBtn.onclick = () => {
      if (editMode) {
        const editor = container.querySelector("#mdEditor");
        const newContent = editor ? editor.textContent : insights;
        onEditToggle(false, newContent);
      } else {
        onEditToggle(true, insights);
      }
    };
  }
  return container;
}
function toggleInsightVisibility(containerId = "insightDiv", show = true) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = show ? "block" : "none";
  }
}
function getInsightStyles() {
  return `
    #insightDiv {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    #insightDiv .insight-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    #insightDiv .insight-btn:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }

    #insightDiv h1 { font-size: 1.8em; margin: 0.5em 0; }
    #insightDiv h2 { font-size: 1.4em; margin: 0.5em 0; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    #insightDiv h3 { font-size: 1.2em; margin: 0.5em 0; }

    #insightDiv ul { margin: 0.5em 0; padding-left: 1.5em; }
    #insightDiv li { margin: 0.3em 0; }

    #insightDiv .report {
      line-height: 1.6;
      font-size: 1.1em;
    }

    #insightDiv tr th:first-child { background: #f5f5f5; }
    #insightDiv th { background: #fafafa; padding: 8px; text-align: left; }
    #insightDiv td { padding: 8px; border-bottom: 1px solid #eee; }
  `;
}

// src/insight/index.js
var index_default = {
  // 요약
  makeCompactText,
  makeCompactData,
  // 리포트
  getInsightStream,
  generateReport,
  getReportTypeOptions,
  REPORT_TYPES,
  // 렌더링
  renderInsight,
  toggleInsightVisibility,
  getInsightStyles
};
export {
  REPORT_TYPES,
  index_default as default,
  generateReport,
  getInsightStream,
  getInsightStyles,
  getReportTypeOptions,
  makeCompactData,
  makeCompactText,
  renderInsight,
  reservoirSample,
  toggleInsightVisibility
};
