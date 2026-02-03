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
        onProgress(buffer + "\u25CF");
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

// src/insight/index.js
var index_default = {
  // 요약
  makeCompactText,
  makeCompactData,
  // 리포트
  getInsightStream,
  generateReport,
  getReportTypeOptions,
  REPORT_TYPES
};
export {
  REPORT_TYPES,
  index_default as default,
  generateReport,
  getInsightStream,
  getReportTypeOptions,
  makeCompactData,
  makeCompactText,
  reservoirSample
};
