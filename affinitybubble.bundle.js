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
  const isDateLike = (str) => {
    const clean = String(str).trim().split(" ")[0];
    if (!datePatterns.some((p) => p.test(clean))) return false;
    const nums = clean.replace(/\D/g, "");
    const year = parseInt(nums.slice(0, 4));
    return year > 1900 && year < 2100;
  };
  const dateCols = cols.filter((key) => {
    const validCount = sampleData.filter((d) => isDateLike(d[key])).length;
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

// src/pipeline/level1.js
var Level1Pipeline = class {
  constructor(api, options = {}) {
    this.api = api;
    this.options = {
      maxSet: 1200,
      sampleSize: 1e3,
      assignThreshold: 0.82,
      clusterSimValue: 45,
      ...options
    };
  }
  /**
   * 1차 파이프라인 전체 실행
   * @param {Array} chunkData - 분석할 텍스트 데이터
   * @param {Function} onProgress - 진행률 콜백 (stage, progress, partialResult)
   * @returns {Promise<{embeds, wordClusters}>}
   */
  async run(chunkData, onProgress = () => {
  }) {
    onProgress({ stage: "embedding", progress: 0, message: "\uC784\uBCA0\uB529 \uC2DC\uC791..." });
    const embedResult = await this.doEmbedding(chunkData, (p) => {
      onProgress({ stage: "embedding", progress: p.progress, partialResult: p.embeds, message: p.message });
    });
    let interimClusters;
    if (embedResult.interimClusters) {
      interimClusters = embedResult.interimClusters;
      onProgress({ stage: "clustering", progress: 100, partialResult: interimClusters });
    } else {
      onProgress({ stage: "clustering", progress: 0, message: "\uD074\uB7EC\uC2A4\uD130\uB9C1..." });
      const clusterResult = await this.doClustering(embedResult.embeds, (p) => {
        onProgress({ stage: "clustering", progress: p.progress, partialResult: p.clusters });
      });
      interimClusters = clusterResult.interimClusters;
    }
    return {
      embeds: embedResult.embeds,
      interimClusters
    };
  }
  /**
   * 임베딩 단계
   */
  async doEmbedding(chunkData, onProgress = () => {
  }) {
    const useSampling = chunkData.length > this.options.maxSet;
    if (!useSampling) {
      return await this._embedAll(chunkData, onProgress);
    } else {
      return await this._embedWithSampling(chunkData, onProgress);
    }
  }
  /**
   * 전체 임베딩 (소규모 데이터)
   */
  async _embedAll(chunkData, onProgress) {
    const embeddings = [];
    const stream = this.api.streamEmbeddings(
      chunkData.map((d) => this._stripEmoji(d.text))
    );
    for await (const embedding of stream) {
      embeddings.push(embedding);
      onProgress({
        progress: Math.round(embeddings.length / chunkData.length * 100),
        embeds: embeddings,
        message: `\uC784\uBCA0\uB529 \uC911... (${Math.round(embeddings.length / chunkData.length * 100)}%)`
      });
    }
    const embeds = chunkData.map((d, i) => ({ ...d, embed: embeddings[i] }));
    return { embeds };
  }
  /**
   * 샘플링 기반 임베딩 (대규모 데이터)
   * 1) 샘플 임베딩 (0-30%)
   * 2) 샘플 클러스터링 (30-40%)
   * 3) 나머지 임베딩 + 센트로이드 할당 (40-100%)
   */
  async _embedWithSampling(chunkData, onProgress) {
    const { sampleSize, assignThreshold } = this.options;
    const sampleIdxs = this._randomSample(chunkData.length, sampleSize);
    const sampleSet = new Set(sampleIdxs);
    const sample = sampleIdxs.map((i) => chunkData[i]);
    const rest = chunkData.filter((_, i) => !sampleSet.has(i));
    const sampleEmbeds = [];
    const sampleStream = this.api.streamEmbeddings(sample.map((d) => d.text));
    for await (const e of sampleStream) {
      sampleEmbeds.push(e);
      onProgress({
        progress: Math.round(sampleEmbeds.length / sample.length * 30),
        embeds: sampleEmbeds,
        message: `\uC784\uBCA0\uB529 \uC911... (${Math.round(sampleEmbeds.length / sample.length * 30)}%)`
      });
    }
    let sampleWithEmbeds = sample.map((d, i) => ({ ...d, embed: sampleEmbeds[i] }));
    onProgress({ progress: 30, embeds: sampleWithEmbeds, message: "\uC0D8\uD50C \uD074\uB7EC\uC2A4\uD130\uB9C1..." });
    const sampleClusterResult = await this.doClustering(sampleWithEmbeds);
    const clusterMap = /* @__PURE__ */ new Map();
    for (const group of sampleClusterResult.interimClusters) {
      for (const item of group.cellDatas) {
        clusterMap.set(item.textid, item.cluster);
      }
    }
    sampleWithEmbeds = sampleWithEmbeds.map((d) => ({
      ...d,
      cluster: clusterMap.get(d.textid) ?? 999
    }));
    onProgress({ progress: 40, embeds: sampleWithEmbeds, message: "\uC784\uBCA0\uB529 \uC911... (40%)" });
    const centroids = this._computeCentroids(sampleWithEmbeds);
    const restResult = await this._embedAndAssignRest(
      rest,
      centroids,
      assignThreshold,
      (p) => onProgress({ progress: 40 + p.progress * 60, embeds: p.allEmbeds, message: p.message })
    );
    const mergedClusters = this._mergeClusters(
      sampleClusterResult.interimClusters,
      restResult.allEmbeds
    );
    return {
      embeds: [...sampleWithEmbeds, ...restResult.allEmbeds],
      interimClusters: mergedClusters
    };
  }
  /**
   * 나머지 데이터 임베딩 및 센트로이드 기반 클러스터 배정
   * @param {Array} rest - 나머지 데이터
   * @param {Array} centroids - 센트로이드 배열 [{cluster, mean, n}]
   * @param {number} threshold - 배정 임계값 (코사인 유사도)
   * @param {Function} onProgress - 진행률 콜백
   */
  async _embedAndAssignRest(rest, centroids, threshold, onProgress) {
    const batchSize = 300;
    const allEmbeds = [];
    for (let i = 0; i < rest.length; i += batchSize) {
      const batch = rest.slice(i, Math.min(i + batchSize, rest.length));
      const stream = this.api.streamEmbeddings(batch.map((d) => d.text));
      const batchEmbeds = [];
      for await (const e of stream) batchEmbeds.push(e);
      for (let j = 0; j < batch.length; j++) {
        const embed = batchEmbeds[j];
        const best = this._findNearestCentroid(embed, centroids);
        const withEmbed = {
          ...batch[j],
          embed,
          cluster: best.similarity >= threshold ? best.cluster : 999
        };
        allEmbeds.push(withEmbed);
      }
      onProgress({
        progress: (i + batch.length) / rest.length,
        allEmbeds,
        message: `\uC784\uBCA0\uB529 \uC911... (${Math.round(40 + (i + batch.length) / rest.length * 60)}%)`
      });
    }
    return { allEmbeds };
  }
  /**
   * 클러스터링 단계
   */
  async doClustering(embeds, onProgress = () => {
  }) {
    const { clusterSimValue } = this.options;
    const threshold = embeds.length >= 300 ? 45 : clusterSimValue / 100;
    if (!this.makeCluster) {
      throw new Error("makeCluster function not provided");
    }
    const clusterRaw = await this.makeCluster(embeds, threshold);
    const clusters = clusterRaw.map(
      (c) => c.data.map((d) => ({ ...d, region: c.data[0].chunk }))
    );
    const flatClusters = this._sortAndNumberClusters(clusters);
    const interimClusters = this._groupByCluster(flatClusters);
    onProgress({ progress: 100, clusters: interimClusters });
    return { interimClusters };
  }
  /**
   * 클러스터 ID별 그룹화
   */
  _groupByCluster(flatItems) {
    const groups = /* @__PURE__ */ new Map();
    flatItems.forEach((item) => {
      if (!groups.has(item.cluster)) {
        groups.set(item.cluster, {
          cluster: item.cluster,
          cellDatas: []
        });
      }
      groups.get(item.cluster).cellDatas.push(item);
    });
    return Array.from(groups.values()).sort((a, b) => a.cluster - b.cluster);
  }
  /**
   * 클러스터 정렬 및 번호 부여
   */
  _sortAndNumberClusters(clusters) {
    const sorted = clusters.map((c) => ({
      size: c.reduce((sum, d) => sum + (d.size ?? 1), 0),
      data: c
    })).sort((a, b) => b.size - a.size);
    return sorted.flatMap(
      (group, idx) => group.data.map((item) => ({ ...item, cluster: idx + 1 }))
    );
  }
  /**
   * 중심점 계산
   */
  _computeCentroids(embeds) {
    const byCluster = /* @__PURE__ */ new Map();
    for (const item of embeds) {
      if (!byCluster.has(item.cluster)) {
        byCluster.set(item.cluster, []);
      }
      byCluster.get(item.cluster).push(item.embed);
    }
    const centroids = [];
    for (const [cluster, vecs] of byCluster) {
      const dim = vecs[0].length;
      const mean = new Array(dim).fill(0);
      for (const v of vecs) {
        for (let i = 0; i < dim; i++) mean[i] += v[i];
      }
      for (let i = 0; i < dim; i++) mean[i] /= vecs.length;
      centroids.push({ cluster, mean, n: vecs.length });
    }
    return centroids;
  }
  /**
   * 코사인 유사도 계산
   */
  _cossim(a, b) {
    let p = 0, ma = 0, mb = 0;
    for (let i = 0; i < a.length; i++) {
      p += a[i] * b[i];
      ma += a[i] * a[i];
      mb += b[i] * b[i];
    }
    if (ma === 0 && mb === 0) return 1;
    if (ma * mb === 0) return 0;
    return p / (ma ** 0.5 * mb ** 0.5);
  }
  /**
   * 가장 가까운 센트로이드 찾기
   * @returns {{ cluster, similarity }}
   */
  _findNearestCentroid(embed, centroids) {
    let bestCluster = 999;
    let bestSim = -1;
    for (const c of centroids) {
      const sim = this._cossim(embed, c.mean);
      if (sim > bestSim) {
        bestSim = sim;
        bestCluster = c.cluster;
      }
    }
    return { cluster: bestCluster, similarity: bestSim };
  }
  /**
   * 나머지 데이터를 기존 interimClusters에 병합
   */
  _mergeClusters(interimClusters, restEmbeds) {
    const groups = /* @__PURE__ */ new Map();
    for (const group of interimClusters) {
      groups.set(group.cluster, {
        cluster: group.cluster,
        cellDatas: [...group.cellDatas]
      });
    }
    for (const item of restEmbeds) {
      const cid = item.cluster;
      if (!groups.has(cid)) {
        groups.set(cid, { cluster: cid, cellDatas: [] });
      }
      groups.get(cid).cellDatas.push(item);
    }
    return Array.from(groups.values()).sort((a, b) => a.cluster - b.cluster);
  }
  /**
   * 랜덤 샘플링
   */
  _randomSample(total, k) {
    const idxs = Array.from({ length: total }, (_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs.slice(0, Math.min(k, total));
  }
  /**
   * 이모지 제거
   */
  _stripEmoji(text) {
    return text;
  }
  /**
   * 외부 의존성 주입
   */
  setMakeCluster(fn) {
    this.makeCluster = fn;
    return this;
  }
};

// src/pipeline/level2.js
var Level2Pipeline = class {
  constructor(api, options = {}) {
    this.api = api;
    this.options = {
      language: "Korean",
      ...options
    };
  }
  /**
   * 2차 파이프라인 전체 실행
   * @param {Array} level1Labels - 1차 레이블 배열 [{cluster, label, embed, ...}]
   * @param {Object} context - 추가 컨텍스트 (selUsecase, bigLabelOption 등)
   * @param {Function} onProgress - 진행률 콜백
   * @returns {Promise<{bigLabels, bigLabelEmbeds, bigLabelClusters}>}
   */
  async run(labelClusters, context = {}, onProgress = () => {
  }) {
    const { selUsecase, bigLabelOption } = context;
    onProgress({ stage: "topic_extraction", progress: 0, message: "\uC0C1\uC704 \uD1A0\uD53D \uCD94\uCD9C..." });
    const bigLabels = await this.extractTopics(labelClusters, context);
    onProgress({
      stage: "topic_extraction",
      progress: 50,
      partialResult: { bigLabels }
    });
    onProgress({ stage: "topic_embedding", progress: 0, message: "\uD1A0\uD53D \uC784\uBCA0\uB529..." });
    const bigLabelEmbeds = await this.embedTopics(bigLabels);
    onProgress({
      stage: "topic_embedding",
      progress: 100,
      partialResult: { bigLabels, bigLabelEmbeds }
    });
    onProgress({ stage: "classification", progress: 0, message: "\uBD84\uB958 \uC9C4\uD589..." });
    const classificationResult = await this.classify(
      labelClusters,
      bigLabels,
      (p) => {
        const partialClusters = this._groupBigLabels(p.result, bigLabels, bigLabelEmbeds);
        onProgress({
          stage: "classification",
          progress: p.progress,
          message: p.message,
          partialResult: { bigLabelClusters: partialClusters }
        });
      }
    );
    const bigLabelClusters = this._groupBigLabels(classificationResult, bigLabels, bigLabelEmbeds);
    return {
      bigLabels,
      bigLabelClusters,
      interimClusters: classificationResult
    };
  }
  /**
   * 상위 토픽 추출
   */
  async extractTopics(level1Labels, context = {}) {
    const { selUsecase, bigLabelOption, selLabelLanguage } = context;
    if (!this.getPromptResult) {
      throw new Error("getPromptResult function not provided");
    }
    let userbigLabelOption = bigLabelOption && bigLabelOption.length > 1 ? bigLabelOption : "\uB370\uC774\uD130\uC758 \uC218\uC5D0 \uB530\uB77C 5-9\uAC1C \uC815\uB3C4\uC758 \uC801\uC808\uD55C \uAC2F\uC218\uAC00 \uB418\uB3C4\uB85D \uD574\uC918.";
    if (selUsecase?.category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C") {
      userbigLabelOption += " ~\uC6D0\uD568.~\uC2F6\uB2E4.~\uD558\uAE30.~\uD544\uC694 \uB4F1 \uC0AC\uC6A9\uC790 \uD575\uC2EC \uBAA9\uD45C\uB97C \uB098\uD0C0\uB0B4\uB294 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C.";
    } else if (selUsecase?.category === "\uB3C4\uBA54\uC778") {
      userbigLabelOption += " 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C.";
    }
    const textsForTopic = level1Labels.map((d) => d.label);
    const userInput = {
      service_type: this._getServiceType(selUsecase),
      texts: textsForTopic.join("\n"),
      language: selLabelLanguage || this.options.language,
      labelOption: userbigLabelOption + " \uAD04\uD638\uB098 \uCF5C\uB860 \uC0AC\uC6A9\uD55C \uCD94\uAC00 \uC124\uBA85 \uAE08\uC9C0"
    };
    const response = await this.getPromptResult(userInput);
    return (response.result || []).map(
      (d) => d.replace(/\*/g, "").replace(/: .+$/, "").replace(/- .+$/, "").replace(/\([^\(]+\)$/, "").trim()
    );
  }
  /**
   * 상위 토픽 임베딩
   */
  async embedTopics(bigLabels) {
    if (!this.api.getEmbeddings) return [];
    const embeddings = await this.api.getEmbeddings(bigLabels);
    return bigLabels.map((label, i) => ({
      bigLabel: label,
      embed: embeddings[i]
    }));
  }
  /**
   * 1차 레이블 → 2차 토픽 분류
   */
  async classify(labelClusters, bigLabels, onProgress = () => {
  }) {
    if (!this.classifyWithIdThreads) {
      throw new Error("classifyWithIdThreads function not provided");
    }
    const mapItem = (item) => {
      let id = item.id;
      if (id === void 0 && item.text) {
        const idMatch = item.text.match(/^(\d+)\s*:/);
        if (idMatch) id = idMatch[1];
      }
      const labelCluster = labelClusters.find((n) => String(n.cluster) === String(id));
      if (!labelCluster) return null;
      let bigLabel = "\uAE30\uD0C0";
      if (item.category) {
        const trimmedCat = item.category.trim();
        const found = bigLabels.find(
          (bl) => bl === item.category || bl.trim() === trimmedCat || bl.trim().replace(/[.]/g, "") === trimmedCat.replace(/[.]/g, "")
        );
        if (found) bigLabel = found;
      }
      const bigClusterIdx = bigLabels.indexOf(bigLabel);
      const bigCluster = bigClusterIdx >= 0 ? bigClusterIdx + 1 : 999;
      return { ...labelCluster, bigLabel, bigCluster };
    };
    let accumulated = [];
    const result = await this.classifyWithIdThreads(
      bigLabels,
      labelClusters.map((d) => `${d.cluster} : ${d.label} ${d.description || ""}`),
      10,
      3,
      (progress, chunk) => {
        accumulated = [...accumulated, ...chunk];
        const mappedPartial = accumulated.map(mapItem).filter(Boolean);
        onProgress({
          progress,
          message: `\uBD84\uB958 \uC9C4\uD589 \uC911... (${Math.round(progress * 100)}%)`,
          result: mappedPartial
        });
      }
    );
    return result.map(mapItem).filter(Boolean);
  }
  /**
   * bigLabelClusters 그룹화
   * @param {Array} flatClassifiedLabels - Result from classify
   * @param {Array} bigLabels - List of topic strings
   * @param {Array} bigLabelEmbeds - List of {bigLabel, embed}
   */
  _groupBigLabels(flatClassifiedLabels, bigLabels, bigLabelEmbeds) {
    const groups = /* @__PURE__ */ new Map();
    const embedMap = new Map((bigLabelEmbeds || []).map((d) => [d.bigLabel, d.embed]));
    bigLabels.forEach((label, idx) => {
      const id = idx + 1;
      groups.set(id, {
        bigCluster: id,
        bigLabel: label,
        embed: embedMap.get(label) || [],
        clusters: []
        // Renamed from labels to clusters as requested
      });
    });
    if (!groups.has(999)) {
      groups.set(999, { bigCluster: 999, bigLabel: "\uAE30\uD0C0", embed: [], clusters: [] });
    }
    flatClassifiedLabels.forEach((item) => {
      const targetId = groups.has(item.bigCluster) ? item.bigCluster : 999;
      if (groups.has(targetId)) {
        groups.get(targetId).clusters.push(item);
      }
    });
    return Array.from(groups.values()).filter((g) => g.clusters.length > 0 || g.bigCluster !== 999).sort((a, b) => a.bigCluster - b.bigCluster);
  }
  /**
   * usecase에 따른 서비스 타입 결정
   */
  _getServiceType(selUsecase) {
    const category = selUsecase?.category;
    if (category === "\uD37C\uC18C\uB098") return "extract_persona";
    if (category === "\uB3C4\uBA54\uC778") return "extract_domain";
    if (category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C") return "extract_user_goal";
    return "extract_topics2";
  }
  /**
   * 외부 의존성 주입
   */
  setGetPromptResult(fn) {
    this.getPromptResult = fn;
    return this;
  }
  setClassifyWithIdThreads(fn) {
    this.classifyWithIdThreads = fn;
    return this;
  }
};

// src/pipeline/combine.js
function combineAll(wordClusters, labelClusters, bigLabelClusters) {
  let allWords = [];
  if (wordClusters && wordClusters.length > 0) {
    if (wordClusters[0].cellDatas) {
      allWords = wordClusters.flatMap((c) => c.cellDatas);
    } else {
      allWords = wordClusters;
    }
  }
  if (!allWords.length) return [];
  const labelMap = /* @__PURE__ */ new Map();
  if (labelClusters) {
    labelClusters.forEach((lc) => {
      labelMap.set(String(lc.cluster), {
        label: lc.label
      });
    });
  }
  const bigLabelMap = /* @__PURE__ */ new Map();
  if (bigLabelClusters) {
    bigLabelClusters.forEach((bg) => {
      const clusters = bg.clusters || bg.labels;
      if (clusters) {
        clusters.forEach((l) => {
          if (l.cluster !== void 0) {
            bigLabelMap.set(String(l.cluster), {
              bigCluster: bg.bigCluster,
              bigLabel: bg.bigLabel
            });
          }
        });
      }
    });
  }
  const enriched = allWords.map((word) => {
    const clusterId = word.cluster;
    const clusterKey = String(clusterId);
    const labelInfo = labelMap.get(clusterKey);
    const label = labelInfo?.label || word.cluster_keywords || `Cluster ${clusterId}`;
    const bigInfo = bigLabelMap.get(clusterKey);
    const bigCluster = bigInfo ? bigInfo.bigCluster : clusterId;
    const bigLabel = bigInfo ? bigInfo.bigLabel : "";
    return {
      ...word,
      label,
      bigCluster,
      bigLabel
    };
  });
  const grouped = groupBy(enriched, (w) => w.bigLabel || `Cluster ${w.bigCluster}`);
  const sorted = Object.entries(grouped).map(([key, words]) => ({
    cluster: key,
    // This is technically the group key
    size: words.reduce((sum, w) => sum + (w.size || 1), 0),
    // Use the bigCluster of the first word as the representative ID if possible
    bigCluster: words[0].bigCluster,
    bigLabel: words[0].bigLabel,
    data: words
  })).sort((a, b) => b.size - a.size);
  return sorted.flatMap(
    (group, idx) => group.data.map((word) => ({
      ...word,
      bigClusterOrder: idx
    }))
  );
}
async function createClusterWithLabel(tick, labelClusters, bigLabelClusters, wordClusters, d32, sortFunc) {
  await tick();
  try {
    return combineAll(wordClusters, labelClusters, bigLabelClusters);
  } catch (error) {
    console.error("clusterWithLabel \uCC98\uB9AC \uC911 \uC624\uB958:", error);
    return wordClusters;
  }
}
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// src/state/index.js
var PipelineState = class {
  constructor() {
    this.reset();
  }
  /**
   * 상태 초기화
   */
  reset() {
    this.cellData = {
      embeds: []
      // wordClusters 제거 (level1.interimClusters로 대체)
    };
    this.level1 = {
      interimClusters: [],
      // [{cluster:1, cellDatas:[..]}] - 초기 클러스터링
      labels: [],
      // Generated labels
      labelClusters: []
      // [{cluster:1, label:"..", cellDatas:[..]}] - Outlier 재배치 후 최종 클러스터
    };
    this.level2 = {
      interimClusters: [],
      // label의 embed를 이용한 클러스터링
      bigLabels: [],
      // bigLabelEmbeds removed (merged into bigLabelClusters)
      bigLabelClusters: []
      // [{bigCluster:1, bigLabel:"..", embed:[], clusters:[]}]
    };
    this.progress = {
      stage: "idle",
      percent: 0,
      message: ""
    };
    this.cellPos = [];
    this.labelPos = [];
    this.bigLabelPos = [];
    this.isComplete = false;
    return this;
  }
  /**
   * CellData 결과 설정 (Embeds)
   */
  setCellData(embeds) {
    this.cellData.embeds = embeds;
    return this;
  }
  /**
   * Level 1 결과 설정
   */
  setLevel1(interimClusters, labels, labelClusters) {
    if (interimClusters) this.level1.interimClusters = interimClusters;
    if (labels) this.level1.labels = labels;
    if (labelClusters) this.level1.labelClusters = labelClusters;
    return this;
  }
  /**
   * Level 1 레이블 추가/업데이트 (점진적 업데이트용)
   */
  addLabels(newLabels) {
    const existing = new Map(this.level1.labels.map((l) => [l.cluster, l]));
    for (const l of newLabels) {
      existing.set(l.cluster, l);
    }
    this.level1.labels = Array.from(existing.values());
    return this;
  }
  /**
   * Level 2 결과 설정
   */
  setLevel2(interimClusters, bigLabels, bigLabelClusters) {
    if (interimClusters) this.level2.interimClusters = interimClusters;
    if (bigLabels) this.level2.bigLabels = bigLabels;
    if (bigLabelClusters) this.level2.bigLabelClusters = bigLabelClusters;
    return this;
  }
  /**
   * 위치 정보 설정
   */
  setCellPos(cellPos) {
    this.cellPos = cellPos;
    return this;
  }
  setLabelPos(labelPos) {
    this.labelPos = labelPos;
    return this;
  }
  setBigLabelPos(bigLabelPos) {
    this.bigLabelPos = bigLabelPos;
    return this;
  }
  /**
   * 진행 상태 업데이트
   */
  setProgress(stage, percent, message = "") {
    this.progress = { stage, percent, message };
    return this;
  }
  /**
   * 완료 표시
   */
  complete() {
    this.isComplete = true;
    this.progress = { stage: "complete", percent: 100, message: "\uC644\uB8CC" };
    return this;
  }
  getCombined() {
    const activeLevel1Clusters = this.level1.labelClusters.length > 0 ? this.level1.labelClusters : this.level1.interimClusters;
    if (!activeLevel1Clusters || !activeLevel1Clusters.length) return [];
    const labelLookup = new Map(this.level1.labels.map((l) => [String(l.cluster), l.label]));
    const bigLabelMap = /* @__PURE__ */ new Map();
    if (this.level2.bigLabelClusters) {
      this.level2.bigLabelClusters.forEach((bg) => {
        const childClusters = bg.clusters || bg.labels;
        if (childClusters) {
          childClusters.forEach((l) => {
            if (l.cluster !== void 0) {
              bigLabelMap.set(String(l.cluster), { bigCluster: bg.bigCluster, bigLabel: bg.bigLabel });
            }
          });
        }
      });
    }
    const flattened = [];
    activeLevel1Clusters.forEach((clusterObj) => {
      const cluster = clusterObj.cluster;
      const bigInfo = bigLabelMap.get(String(cluster));
      let label = clusterObj.label;
      if (!label || label.startsWith("Cluster")) {
        label = labelLookup.get(String(cluster)) || label || `Cluster ${cluster}`;
      }
      if (clusterObj.cellDatas) {
        clusterObj.cellDatas.forEach((cell) => {
          flattened.push({
            ...cell,
            cluster,
            label,
            bigCluster: bigInfo?.bigCluster ?? cluster,
            bigLabel: bigInfo?.bigLabel || ""
          });
        });
      }
    });
    return flattened;
  }
  /**
   * 현재 상태 스냅샷
   */
  snapshot() {
    return {
      cellData: { ...this.cellData },
      level1: { ...this.level1 },
      level2: { ...this.level2 },
      combined: this.getCombined(),
      cellPos: [...this.cellPos],
      labelPos: [...this.labelPos],
      bigLabelPos: [...this.bigLabelPos],
      progress: { ...this.progress },
      isComplete: this.isComplete
    };
  }
  /**
   * 스냅샷에서 복원
   */
  restore(snapshot) {
    if (snapshot.cellData) this.cellData = { ...snapshot.cellData };
    if (snapshot.level1) this.level1 = { ...snapshot.level1 };
    if (snapshot.level2) this.level2 = { ...snapshot.level2 };
    if (snapshot.cellPos) this.cellPos = [...snapshot.cellPos];
    if (snapshot.labelPos) this.labelPos = [...snapshot.labelPos];
    if (snapshot.bigLabelPos) this.bigLabelPos = [...snapshot.bigLabelPos];
    this.isComplete = snapshot.isComplete ?? true;
    return this;
  }
  /**
   * 통계 정보
   */
  getStats() {
    const combined = this.getCombined();
    return {
      totalTexts: combined.length,
      clusterCount: new Set(combined.map((d) => d.cluster)).size,
      bigLabelCount: new Set(combined.map((d) => d.bigLabel).filter(Boolean)).size,
      labelsCount: this.level1.labels.length
    };
  }
};

// src/state/history.js
var HistoryManager = class {
  constructor(options = {}) {
    this.options = {
      maxSnapshots: 10,
      // 최대 저장 개수
      storageKey: "affinitybubble_history",
      ...options
    };
    this.snapshots = [];
    this.currentIndex = -1;
    this.compareTarget = null;
  }
  /**
   * 스냅샷 저장
   * @param {Object} options - 사용된 옵션 (labelOption, bigLabelOption 등)
   * @param {Object} results - 결과 데이터 (level1, level1Labels, level2)
   * @returns {Object} 저장된 스냅샷
   */
  save(options, results) {
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      options: { ...options },
      results: this._cloneResults(results),
      stats: this._calculateStats(results)
    };
    this.snapshots = [snapshot, ...this.snapshots.slice(0, this.options.maxSnapshots - 1)];
    this.currentIndex = -1;
    this._persistToStorage();
    return snapshot;
  }
  /**
   * 스냅샷 복원
   * @param {string} snapshotId - 복원할 스냅샷 ID
   * @returns {Object|null} 복원된 결과 데이터
   */
  restore(snapshotId) {
    const idx = this.snapshots.findIndex((s) => s.id === snapshotId);
    if (idx === -1) return null;
    this.currentIndex = idx;
    return this.snapshots[idx].results;
  }
  /**
   * 현재 스냅샷 가져오기
   */
  getCurrent() {
    if (this.currentIndex === -1) {
      return this.snapshots[0] || null;
    }
    return this.snapshots[this.currentIndex] || null;
  }
  /**
   * 스냅샷 목록 가져오기
   */
  getList() {
    return this.snapshots.map((s, idx) => ({
      id: s.id,
      timestamp: s.timestamp,
      options: s.options,
      stats: s.stats,
      isCurrent: this.currentIndex === -1 ? idx === 0 : idx === this.currentIndex
    }));
  }
  /**
   * 두 스냅샷 비교
   * @param {string} snapshotId1 
   * @param {string} snapshotId2 
   * @returns {Object} 비교 결과
   */
  compare(snapshotId1, snapshotId2) {
    const s1 = this.snapshots.find((s) => s.id === snapshotId1);
    const s2 = this.snapshots.find((s) => s.id === snapshotId2);
    if (!s1 || !s2) return null;
    return {
      optionsDiff: this._diffObjects(s1.options, s2.options),
      statsDiff: {
        clusterDelta: s2.stats.clusterCount - s1.stats.clusterCount,
        topicDelta: s2.stats.bigLabelCount - s1.stats.bigLabelCount,
        textDelta: s2.stats.totalTexts - s1.stats.totalTexts
      },
      labelChanges: this._findLabelChanges(s1, s2),
      snapshot1: s1,
      snapshot2: s2
    };
  }
  /**
   * 비교 모드 설정
   */
  setCompareTarget(snapshotId) {
    this.compareTarget = snapshotId;
    return this;
  }
  /**
   * 비교 모드 해제
   */
  clearCompare() {
    this.compareTarget = null;
    return this;
  }
  /**
   * 스냅샷 삭제
   */
  delete(snapshotId) {
    const idx = this.snapshots.findIndex((s) => s.id === snapshotId);
    if (idx !== -1) {
      this.snapshots.splice(idx, 1);
      if (this.currentIndex >= idx) {
        this.currentIndex = Math.max(-1, this.currentIndex - 1);
      }
      this._persistToStorage();
    }
    return this;
  }
  /**
   * 전체 삭제
   */
  clear() {
    this.snapshots = [];
    this.currentIndex = -1;
    this.compareTarget = null;
    this._persistToStorage();
    return this;
  }
  /**
   * 통계 계산
   */
  _calculateStats(results) {
    const combined = results.combined || [];
    const bigLabels = new Set(combined.map((d) => d.bigLabel).filter(Boolean));
    const clusters = new Set(combined.map((d) => d.cluster).filter(Boolean));
    const clusterSizes = {};
    for (const item of combined) {
      const label = item.label || `Cluster ${item.cluster}`;
      clusterSizes[label] = (clusterSizes[label] || 0) + (item.size || 1);
    }
    const topClusters = Object.entries(clusterSizes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, size]) => ({ label, size }));
    return {
      totalTexts: combined.length,
      clusterCount: clusters.size,
      bigLabelCount: bigLabels.size,
      topClusters
    };
  }
  /**
   * 결과 깊은 복사 (참조 끊기)
   */
  _cloneResults(results) {
    const clone = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map((item) => {
          if (typeof item === "object" && item !== null) {
            const { embed, ...rest } = item;
            return rest;
          }
          return item;
        });
      }
      return obj;
    };
    return {
      level1: {
        wordClusters: clone(results.level1?.wordClusters || [])
      },
      level1Labels: {
        labels: clone(results.level1Labels?.labels || []),
        labelClusters: clone(results.level1Labels?.labelClusters || [])
      },
      level2: {
        bigLabels: [...results.level2?.bigLabels || []],
        bigLabelClusters: clone(results.level2?.bigLabelClusters || [])
      },
      combined: clone(results.combined || [])
    };
  }
  /**
   * 객체 차이점 찾기
   */
  _diffObjects(obj1, obj2) {
    const diffs = [];
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    for (const key of allKeys) {
      const v1 = obj1?.[key];
      const v2 = obj2?.[key];
      if (JSON.stringify(v1) !== JSON.stringify(v2)) {
        diffs.push({ key, before: v1, after: v2 });
      }
    }
    return diffs;
  }
  /**
   * 레이블 변경점 찾기
   */
  _findLabelChanges(snapshot1, snapshot2) {
    const labels1 = new Set(
      (snapshot1.results.level1Labels?.labels || []).map((d) => d.label)
    );
    const labels2 = new Set(
      (snapshot2.results.level1Labels?.labels || []).map((d) => d.label)
    );
    const added = [...labels2].filter((l) => !labels1.has(l));
    const removed = [...labels1].filter((l) => !labels2.has(l));
    const common = [...labels1].filter((l) => labels2.has(l));
    return { added, removed, common, changed: added.length + removed.length };
  }
  /**
   * 로컬 스토리지 저장
   */
  _persistToStorage() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(
          this.options.storageKey,
          JSON.stringify(this.snapshots)
        );
      } catch (e) {
        console.warn("History \uC800\uC7A5 \uC2E4\uD328:", e);
      }
    }
  }
  /**
   * 로컬 스토리지에서 복원
   */
  loadFromStorage() {
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(this.options.storageKey);
        if (stored) {
          this.snapshots = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("History \uBCF5\uC6D0 \uC2E4\uD328:", e);
      }
    }
    return this;
  }
};

// src/utils/index.js
import { UMAP } from "umap-js";
import seedrandom from "seedrandom";
import * as d3 from "d3";
function cossim(a, b, w) {
  const len = a.length;
  let p = 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < len; i++) {
    p += a[i] * b[i] * (w ? w[i] : 1);
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  if (ma === 0 && mb === 0) return 1;
  if (ma * mb === 0) return 0;
  return p / (ma ** 0.5 * mb ** 0.5);
}
function euclidean(p, q) {
  function squaredEuclidean(p2, q2) {
    let d = 0;
    for (let i = 0; i < p2.length; i++) {
      d += (p2[i] - q2[i]) * (p2[i] - q2[i]);
    }
    return d;
  }
  return Math.sqrt(squaredEuclidean(p, q));
}
function countLeaves(node) {
  if (node.isLeaf) return 1;
  return countLeaves(node.children[0]) + countLeaves(node.children[1]);
}
function makeCluster_breakBig_optimized(arrayWithEmbed, nCluster = 0.8, distFunc = "cossim", hclust) {
  if (arrayWithEmbed.length === 0) return [];
  if (!hclust) throw new Error("hclust (ml-hclust) is required for clustering");
  const tree = hclust.agnes(
    arrayWithEmbed.map((e) => e.embed),
    {
      method: "complete",
      distanceFunction: distFunc === "cossim" ? (a, b) => 1 - cossim(a, b) : (a, b) => euclidean(a, b)
    }
  );
  const subtrees = nCluster < 1 ? tree.cut(nCluster) : tree.group(nCluster).children;
  const totalItems = arrayWithEmbed.length;
  const threshold = totalItems * 0.2;
  const finalClusters = [];
  let nextClusterId = 0;
  subtrees.forEach((subtree) => {
    const leafCount = countLeaves(subtree);
    if (nCluster < 1 && leafCount > threshold && leafCount >= 8) {
      const numSubClusters = Math.ceil(leafCount / threshold);
      subtree.group(numSubClusters).children.forEach((sub) => {
        const data = [];
        sub.traverse((n) => {
          if (n.isLeaf)
            data.push({ ...arrayWithEmbed[n.index], cluster: nextClusterId });
        });
        if (data.length) finalClusters.push({ cid: nextClusterId++, data });
      });
    } else {
      const data = [];
      subtree.traverse((n) => {
        if (n.isLeaf)
          data.push({ ...arrayWithEmbed[n.index], cluster: nextClusterId });
      });
      if (data.length) finalClusters.push({ cid: nextClusterId++, data });
    }
  });
  return finalClusters.sort((a, b) => b.data.length - a.data.length).map((d, i) => ({
    cid: i + 1,
    data: d.data.map((t) => ({ ...t, cluster: i + 1 }))
  }));
}
function makeCluster(arrayWithEmbed, nCluster = 0.8, distFunc = "cossim", hclust) {
  return makeCluster_breakBig_optimized(arrayWithEmbed, nCluster, distFunc, hclust);
}
async function processInParallel(processingFunc, data, {
  chunk_size = 20,
  max_threads = 4,
  delay_between_batches = 0,
  feedbackFunc = (d) => console.log(`\uC9C4\uD589\uB960: ${(d * 100).toFixed(1)}%`),
  context = null
} = {}) {
  const start = /* @__PURE__ */ new Date();
  console.log(
    `\uBCD1\uB82C \uCC98\uB9AC \uC2DC\uC791: ${data.length}\uAC1C \uD56D\uBAA9, \uCCAD\uD06C \uD06C\uAE30 ${chunk_size}, \uCD5C\uB300 ${max_threads} \uC2A4\uB808\uB4DC`
  );
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
  const dataChunks = chunkArray(data, chunk_size);
  const totalItems = data.length;
  const results = [];
  const pendingPromises = /* @__PURE__ */ new Set();
  let chunkIndex = 0;
  let completedItems = 0;
  feedbackFunc(0, []);
  while (chunkIndex < dataChunks.length) {
    while (pendingPromises.size < max_threads && chunkIndex < dataChunks.length) {
      const currentChunk = dataChunks[chunkIndex];
      const currentChunkIndex = chunkIndex;
      chunkIndex++;
      const promise = (async () => {
        if (delay_between_batches > 0 && currentChunkIndex > 0) {
          await new Promise(
            (resolve) => setTimeout(resolve, delay_between_batches)
          );
        }
        return processingFunc(currentChunk, context);
      })().then((result) => {
        const flatResult = Array.isArray(result) ? result : [result];
        results.push(...flatResult);
        pendingPromises.delete(promise);
        completedItems += currentChunk.length;
        feedbackFunc(
          totalItems > 0 ? Math.min(completedItems / totalItems, 1) : 1,
          flatResult
        );
        return result;
      }).catch((error) => {
        console.error(`\uCCAD\uD06C ${currentChunkIndex} \uCC98\uB9AC \uC911 \uC624\uB958:`, error);
        pendingPromises.delete(promise);
        return [];
      });
      pendingPromises.add(promise);
    }
    if (pendingPromises.size > 0) {
      await Promise.race(Array.from(pendingPromises));
    }
  }
  if (pendingPromises.size > 0) {
    await Promise.all(Array.from(pendingPromises));
  }
  const end = /* @__PURE__ */ new Date();
  return results;
}
async function getPromptResult(api, userInput, promptId, configId = "Production", tick = async () => {
}, onPartial = null) {
  if (!promptId) promptId = userInput.service_type;
  const generator = api.prompt(
    userInput,
    promptId ?? userInput.service_type,
    configId
  );
  let response = null;
  await tick();
  for await (const chunk of generator) {
    try {
      response = chunk;
      if (onPartial && chunk?.result) {
        onPartial(chunk.result);
      }
    } catch (e) {
      console.log(e);
    }
  }
  return response;
}
async function getLabels(clusters, language, { datasetInfo, text_id, labelOption, api, tick, reportPartial } = {}) {
  const cluster_data = clusters.map(
    (cluster) => `
Cluster ${cluster.clusterId}:
${cluster.sentences.slice(0, 20).map((d, i) => `${cluster.textids[i]}: ${d.slice(0, 256)}`).join("\n")}
`
  ).join("\n");
  const option = datasetInfo?.data_type?.match(/키워드/) ? " \uBD80\uC815 \uC758\uBBF8\uC778 \uACBD\uC6B0 \uC774\uC720\uB97C \uC124\uBA85\uD558\uB294 \uD0A4\uC6CC\uB4DC\uB3C4 \uCD94\uAC00\uD574\uC918." : " \uBD80\uC815 \uC758\uBBF8\uC778 \uACBD\uC6B0 \uC774\uC720\uB97C \uC124\uBA85\uD558\uB294 \uD0A4\uC6CC\uB4DC\uB3C4 \uCD94\uAC00\uD574\uC918. \uC758\uBBF8\uB97C \uAD6C\uCCB4\uC801\uC73C\uB85C \uB4DC\uB7EC\uB0B4\uB294 \uC9E7\uC740 \uBB38\uC7A5\uC73C\uB85C.";
  const userInput = {
    service_type: datasetInfo?.data_type?.match(/사용자 목표/) ? "get_label_voice" : "get_label_outlier_sentiment",
    text_id,
    clusters: cluster_data,
    language,
    option: option + " " + (labelOption || "")
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
async function getLabels_threads(getLabelsFn, clusters, language = "Korean", chunkSize = 20, maxConcurrent = 3, progressFunc = null, contextParams = {}) {
  const processingFunc = async (clusterChunk, context2) => {
    return await getLabelsFn(clusterChunk, context2.language, context2);
  };
  const context = {
    language,
    ...contextParams
  };
  const results = await processInParallel(processingFunc, clusters, {
    chunk_size: chunkSize,
    max_threads: maxConcurrent,
    feedbackFunc: progressFunc,
    context
  });
  return results.sort((a, b) => {
    const clusterA = clusters.findIndex((c) => c.clusterId === a.cluster);
    const clusterB = clusters.findIndex((c) => c.clusterId === b.cluster);
    return clusterA - clusterB;
  });
}
async function getClassified(categories, sentences, { text_id, api, tick } = {}) {
  const userInput = {
    service_type: "classification",
    categories,
    texts: sentences,
    text_id
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
async function getClassifiedWithId(categories, sentences, { text_id, api, tick } = {}) {
  const userInput = {
    service_type: "classification_with_id",
    categories,
    texts: sentences,
    text_id
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
async function classifyWithId_threads(getClassifiedWithIdFn, categories, sentences, chunkSize = 20, maxConcurrent = 3, progressFunc = null, contextParams = {}) {
  const processingFunc = async (clusterChunk, context) => {
    return await getClassifiedWithIdFn(categories, clusterChunk, context);
  };
  const results = await processInParallel(processingFunc, sentences, {
    chunk_size: chunkSize,
    max_threads: maxConcurrent,
    feedbackFunc: progressFunc,
    context: contextParams
  });
  return results;
}
async function getTopics(texts, { language, bigLabelOption, selUsecase, text_id, api, tick, selTopicGenMethod, compactText } = {}) {
  let userbigLabelOption = String(bigLabelOption).length > 1 ? bigLabelOption : "\uB370\uC774\uD130\uC758 \uC218\uC5D0 \uB530\uB77C \uCCAD\uD06C \uB369\uC5B4\uB9AC\uAC00 \uB9E4\uC9C1\uB118\uBC84 5-9\uAC1C \uC815\uB3C4\uC758 \uC801\uC808\uD55C \uAC2F\uC218\uAC00 \uB418\uB3C4\uB85D \uD574\uC918.";
  if (selUsecase?.category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C")
    userbigLabelOption += " ~\uC6D0\uD568.~\uC2F6\uB2E4.~\uD558\uAE30.~\uD544\uC694 \uB4F1 \uC0AC\uC6A9\uC790 \uD575\uC2EC \uBAA9\uD45C\uB97C \uB098\uD0C0\uB0B4\uB294 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C \uC801\uC5B4\uC918.";
  if (selUsecase?.category === "\uB3C4\uBA54\uC778")
    userbigLabelOption += " 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C \uC801\uC5B4\uC918.";
  const userInput = {
    service_type: selUsecase?.category === "\uD37C\uC18C\uB098" ? "extract_persona" : selUsecase?.category === "\uB3C4\uBA54\uC778" ? "extract_domain" : selUsecase?.category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C" ? "extract_user_goal" : "extract_topics2",
    text_id,
    texts: selTopicGenMethod === "\uB808\uC774\uBE14\uB9CC" ? texts.join("\n") : (compactText || []).join("\n").replace(/## /g, ""),
    language,
    labelOption: userbigLabelOption + " \uAD04\uD638\uB098 \uCF5C\uB860 \uC0AC\uC6A9\uD55C \uCD94\uAC00 \uC124\uBA85 \uAE08\uC9C0"
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
function makeEmbedPos(embList, minDist = 0.1, nNeighbors = 10, seedValue = 1) {
  if (!embList || embList.length === 0) return [];
  if (embList.length === 1) {
    return [{ ...embList[0], pos: { x: 0, y: 0 } }];
  }
  const seed = seedrandom(seedValue);
  const wordPos = new UMAP({
    nComponents: 2,
    minDist,
    nNeighbors: Math.min(embList.length - 1, nNeighbors),
    random: seed
  }).fit(embList.map((d) => d.embed));
  return embList.map((d, i) => {
    const [x, y] = wordPos[i];
    return { ...d, pos: { x, y } };
  });
}

// src/pipeline/full.js
var AffinityBubblePipeline = class {
  constructor(api, dependencies = {}) {
    this.api = api;
    this.deps = {
      hclust: dependencies.hclust || null,
      ...dependencies
    };
    const rawMakeCluster = dependencies.makeCluster || makeCluster;
    this.deps.makeCluster = (data, threshold) => rawMakeCluster(data, threshold, "cossim", this.deps.hclust);
    const rawGetPromptResult = dependencies.getPromptResult || getPromptResult;
    this.deps.getPromptResult = (userInput, promptId, configId, tick) => rawGetPromptResult(this.api, userInput, promptId, configId, tick);
    const rawClassifyWithIdThreads = dependencies.classifyWithIdThreads || classifyWithId_threads;
    this.deps.classifyWithIdThreads = (categories, sentences, chunkSize, maxConcurrent, progressFunc) => rawClassifyWithIdThreads(getClassifiedWithId, categories, sentences, chunkSize, maxConcurrent, progressFunc, { api: this.api });
    const rawGetLabelsThreads = dependencies.getLabelsThreads || getLabels_threads;
    this.deps.getLabelsThreads = (getLabelsFn, clusters, language, chunkSize, maxConcurrent, progressFunc, context) => rawGetLabelsThreads(getLabelsFn, clusters, language, chunkSize, maxConcurrent, progressFunc, { api: this.api, ...context });
    this.level1 = new Level1Pipeline(api);
    this.level2 = new Level2Pipeline(api);
    this.state = new PipelineState();
    this.history = new HistoryManager();
    this.prevOptions = null;
    this.prevChunkDataHash = null;
    this.prevLevel1Result = null;
    this.prevLabels = null;
    this.prevLabelClusters = null;
    this.level1.setMakeCluster(this.deps.makeCluster);
    this.level2.setGetPromptResult(this.deps.getPromptResult);
    this.level2.setClassifyWithIdThreads(this.deps.classifyWithIdThreads);
  }
  /**
   * 전체 파이프라인 실행
   * @param {Array} chunkData - 입력 데이터
   * @param {Object} options - 옵션 (labelOption, bigLabelOption, selUsecase 등)
   * @param {Function} onProgress - 진행률 콜백
   * @returns {Promise<Object>} 최종 결과
   */
  async run(chunkData, options = {}, onProgress = () => {
  }) {
    const {
      labelOption,
      bigLabelOption,
      selUsecase,
      selLabelLanguage,
      clusterSimValue,
      clusterSimValue2
    } = options;
    const startStage = this._determineStartStage(chunkData, options);
    console.log(`[Pipeline] Starting from stage: ${startStage}`);
    this.state.reset();
    try {
      let level1Result;
      let labels;
      let labelClusters;
      if (startStage === "embedding") {
        const initialClusters = chunkData.map((d) => ({
          ...d,
          cluster: 0,
          cluster_keywords: "\uBD84\uC11D \uB300\uAE30 \uC911..."
        }));
        this.state.setCellData([], initialClusters);
        this.state.setProgress("level1", 0, "\uC784\uBCA0\uB529 \uC2DC\uC791...");
        onProgress(this.state.progress, this.state.snapshot());
        this.level1.options.clusterSimValue = clusterSimValue;
        level1Result = await this.level1.run(chunkData, (p) => {
          this.state.setProgress("level1", p.progress * 0.3, p.message);
          if (p.stage === "embedding" && p.partialResult) {
            this.state.setCellData(p.partialResult);
          }
          onProgress(this.state.progress, this.state.snapshot());
        });
      } else if (startStage === "clustering") {
        console.log("[Pipeline] Reusing embeddings, re-clustering...");
        this.state.setProgress("level1", 10, "\uD074\uB7EC\uC2A4\uD130\uB9C1 \uC7AC\uC2E4\uD589 (\uC784\uBCA0\uB529 \uC7AC\uC0AC\uC6A9)...");
        onProgress(this.state.progress, this.state.snapshot());
        const prevEmbeds = this.prevLevel1Result.embeds;
        this.level1.options.clusterSimValue = clusterSimValue;
        const clusterResult = await this.level1.doClustering(prevEmbeds, (p) => {
          this.state.setProgress("level1", 10 + p.progress * 0.2, "\uD074\uB7EC\uC2A4\uD130\uB9C1 \uC911...");
          onProgress(this.state.progress, this.state.snapshot());
        });
        level1Result = {
          embeds: prevEmbeds,
          interimClusters: clusterResult.interimClusters
        };
      } else {
        console.log("[Pipeline] Reusing level1 results...");
        level1Result = this.prevLevel1Result;
        this.state.setCellData(level1Result.embeds);
      }
      this.state.setCellData(level1Result.embeds);
      this.state.setLevel1(level1Result.interimClusters, [], []);
      onProgress(this.state.progress, this.state.snapshot());
      if (startStage === "embedding" || startStage === "clustering") {
        this.state.setProgress("positioning_cells", 30, "\uAC1C\uBCC4 \uB370\uC774\uD130 \uC88C\uD45C \uACC4\uC0B0 \uC911...");
        onProgress(this.state.progress, this.state.snapshot());
        if (level1Result.embeds.length > 0 && level1Result.interimClusters) {
          const flatCells = level1Result.interimClusters.flatMap((c) => c.cellDatas);
          const cellPos = makeEmbedPos(flatCells.map((d) => ({
            embed: d.embed,
            text: d.text,
            cluster: d.cluster
          })));
          this.state.setCellPos(cellPos);
        }
        onProgress(this.state.progress, this.state.snapshot());
      }
      if (startStage === "embedding" || startStage === "clustering" || startStage === "labeling") {
        this.state.setProgress("labeling", 30, "\uB808\uC774\uBE14 \uC0DD\uC131...");
        onProgress(this.state.progress, this.state.snapshot());
        const clustersForLabeling = level1Result.interimClusters.map((c) => ({
          clusterId: c.cluster,
          sentences: c.cellDatas.map((d) => d.text),
          textids: c.cellDatas.map((d) => d.textid)
        }));
        labels = await this._doLabeling(
          clustersForLabeling,
          { labelOption, selLabelLanguage },
          (progress, data) => {
            if (data && data.length > 0) {
              this.state.addLabels(data);
            }
            this.state.setProgress("labeling", 30 + progress * 20, `\uB808\uC774\uBE14 \uC0DD\uC131 \uC911... (${Math.round(progress * 100)}%)`);
            onProgress(this.state.progress, this.state.snapshot());
          }
        );
        this.state.setProgress("labeling", 60, "Outlier \uC7AC\uBC30\uCE58 \uBC0F \uCD5C\uC885 \uADF8\uB8F9\uD654...");
        labelClusters = await this._rearrangeOutliers(
          labels,
          level1Result.interimClusters,
          options
        );
      } else {
        console.log("[Pipeline] Reusing labels and labelClusters...");
        labels = this.prevLabels;
        labelClusters = this.prevLabelClusters;
      }
      this.state.setLevel1(level1Result.interimClusters, labels, labelClusters);
      onProgress(this.state.progress, this.state.snapshot());
      this.state.setProgress("level2", 50, "\uC0C1\uC704 \uD1A0\uD53D \uCD94\uCD9C...");
      onProgress(this.state.progress, this.state.snapshot());
      const level2Result = await this.level2.run(
        labelClusters,
        { selUsecase, bigLabelOption, selLabelLanguage, clusterSimValue2 },
        (p) => {
          this.state.setProgress("level2", 50 + p.progress * 0.4, p.message);
          if (p.partialResult) {
            this.state.setLevel2(
              null,
              p.partialResult.bigLabels || null,
              p.partialResult.bigLabelClusters || null
            );
          }
          onProgress(this.state.progress, this.state.snapshot());
        }
      );
      this.state.setLevel2(
        level2Result.interimClusters,
        level2Result.bigLabels,
        level2Result.bigLabelClusters
      );
      onProgress(this.state.progress, this.state.snapshot());
      this.state.setProgress("positioning", 85, "2\uCC28\uC6D0 \uC88C\uD45C \uACC4\uC0B0 \uC911...");
      onProgress(this.state.progress, this.state.snapshot());
      if (labels.length > 0) {
        const labelPos = makeEmbedPos(labels);
        this.state.setLabelPos(labelPos);
      }
      if (level2Result.bigLabelClusters && level2Result.bigLabelClusters.length > 0) {
        const bigLabelEmbeds = level2Result.bigLabelClusters.filter((c) => c.embed && c.embed.length > 0).map((c) => ({
          embed: c.embed,
          bigCluster: c.bigCluster,
          bigLabel: c.bigLabel
        }));
        if (bigLabelEmbeds.length > 0) {
          const bigLabelPos = makeEmbedPos(bigLabelEmbeds);
          this.state.setBigLabelPos(bigLabelPos);
        }
      }
      onProgress(this.state.progress, this.state.snapshot());
      this.state.setProgress("combining", 95, "\uB370\uC774\uD130 \uACB0\uD569...");
      onProgress(this.state.progress, this.state.snapshot());
      const combined = combineAll(
        this.state.level1.interimClusters,
        this.state.level1.labelClusters,
        this.state.level2.bigLabelClusters
      );
      this.state.complete();
      onProgress(this.state.progress, { combined });
      this._saveCurrentState(chunkData, options, level1Result, labels, labelClusters);
      const snapshot = this.history.save(options, this.state.snapshot());
      return {
        ...this.state.snapshot(),
        snapshotId: snapshot.id
      };
    } catch (error) {
      console.error("Pipeline \uC2E4\uD589 \uC624\uB958:", error);
      this.state.setProgress("error", 0, error.message);
      throw error;
    }
  }
  /**
   * 1차 레이블링 (getLabels_threads 호출)
   */
  async _doLabeling(clusterGroups, options, onProgress) {
    const { labelOption, selLabelLanguage } = options;
    if (!this.deps.getLabelsThreads) {
      console.warn("getLabelsThreads not provided, using placeholder");
      return [];
    }
    const labels = await this.deps.getLabelsThreads(
      getLabels,
      // 기본 getLabels 함수 전달
      clusterGroups,
      selLabelLanguage || "Korean",
      8,
      // chunkSize 유지 (사용자 요청)
      3,
      // maxConcurrent
      (progress, data) => {
        const validProgress = isNaN(progress) ? 0 : progress;
        onProgress(validProgress, data);
      },
      {
        datasetInfo: options.datasetInfo,
        text_id: options.text_id,
        labelOption: options.labelOption,
        api: this.api,
        tick: options.tick || (async () => {
        })
      }
    );
    if (labels.length && this.api.getEmbeddings) {
      const embeddings = await this.api.getEmbeddings(labels.map((d) => d.label));
      return labels.map((d, i) => ({ ...d, embed: embeddings[i] }));
    }
    return labels;
  }
  /**
   * 시작 단계 결정 (Stage별 선택적 재실행)
   *
   * Case 1: chunkData 변경 → 전체 재실행 (embedding부터)
   * Case 2: clusterSimValue 변경 → 클러스터링부터 (임베딩 재사용)
   * Case 3: labelOption 변경 → 레이블링부터
   * Case 4: bigLabelOption/selUsecase/clusterSimValue2 변경 → Level2부터
   * Case 5: 모든 옵션 동일 (재분석) → Level2만 재실행 (기본 동작)
   */
  _determineStartStage(chunkData, options) {
    const currentHash = this._computeChunkDataHash(chunkData);
    if (!this.prevOptions || !this.prevChunkDataHash || this.prevChunkDataHash !== currentHash) {
      console.log("[Pipeline] Stage: embedding (chunkData changed or first run)");
      return "embedding";
    }
    if (this.prevOptions.clusterSimValue !== options.clusterSimValue) {
      console.log("[Pipeline] Stage: clustering (clusterSimValue changed)");
      return "clustering";
    }
    if (this.prevOptions.labelOption !== options.labelOption || this.prevOptions.selLabelLanguage !== options.selLabelLanguage) {
      console.log("[Pipeline] Stage: labeling (labelOption changed)");
      return "labeling";
    }
    console.log("[Pipeline] Stage: level2 (bigLabel options changed or re-analyze)");
    return "level2";
  }
  /**
   * chunkData의 해시값 계산 (변경 감지용)
   * 간단한 해시: 데이터 길이 + 첫/마지막 텍스트의 일부 조합
   */
  _computeChunkDataHash(chunkData) {
    if (!chunkData || chunkData.length === 0) return null;
    const length = chunkData.length;
    const firstText = chunkData[0]?.text || chunkData[0]?.chunk || "";
    const lastText = chunkData[length - 1]?.text || chunkData[length - 1]?.chunk || "";
    const hashStr = `${length}:${firstText.substring(0, 50)}:${lastText.substring(0, 50)}`;
    let hash = 5381;
    for (let i = 0; i < hashStr.length; i++) {
      hash = (hash << 5) + hash + hashStr.charCodeAt(i);
    }
    return hash.toString(16);
  }
  /**
   * 현재 상태 저장 (다음 실행 시 비교용)
   */
  _saveCurrentState(chunkData, options, level1Result, labels, labelClusters) {
    this.prevChunkDataHash = this._computeChunkDataHash(chunkData);
    this.prevOptions = { ...options };
    this.prevLevel1Result = level1Result;
    this.prevLabels = labels;
    this.prevLabelClusters = labelClusters;
  }
  /**
   * Outlier 재배치 (Rearrange)
   */
  /**
   * Outlier 재배치 및 최종 레이블 그룹화
   * @returns {Promise<Array>} labelClusters [{cluster, label, cellDatas}]
   */
  async _rearrangeOutliers(labels, interimClusters, options) {
    const allCells = interimClusters.flatMap((c) => c.cellDatas);
    const wordClusterMap = new Map(allCells.map((d) => [d.textid, d]));
    const labelMap = new Map(labels.map((d) => [d.label, d.cluster]));
    const clusterToLabelMap = new Map(labels.map((d) => [d.cluster, d]));
    const finalGrouping = /* @__PURE__ */ new Map();
    labels.forEach((l) => {
      finalGrouping.set(l.cluster, {
        cluster: l.cluster,
        label: l.label,
        embed: l.embed,
        // Propagate embed
        description: l.description,
        // Propagate description
        cellDatas: [],
        original_cluster: l.cluster
      });
    });
    if (!finalGrouping.has(999)) {
      finalGrouping.set(999, {
        cluster: 999,
        label: "\uAE30\uD0C0",
        embed: null,
        description: "",
        cellDatas: [],
        original_cluster: 999
      });
    }
    if (!this.deps.classifyWithIdThreads) {
      console.warn("classifyWithIdThreads dependency missing. Skipping rearrange.");
      allCells.forEach((cell) => {
        const targetCluster = finalGrouping.has(cell.cluster) ? cell.cluster : 999;
        finalGrouping.get(targetCluster).cellDatas.push(cell);
      });
      return Array.from(finalGrouping.values());
    }
    const etcCells = allCells.filter((d) => d.cluster === 999);
    let outliers = labels.flatMap((d) => {
      if (!d.outliers) return [];
      return d.outliers.map((outlier) => {
        const idMatch = outlier.match(/^\d+:/);
        const textid = idMatch ? +idMatch[0].replace(":", "") : null;
        let reasonMatch = outlier.match(
          /#sentiment mismatch|#semantic divergence|#topic difference|#\S+/
        );
        const reason = reasonMatch ? reasonMatch[0] : "";
        if (!textid) return null;
        return {
          textid,
          label: d.label,
          text: outlier.replace(/^\d+:/, "").replace(" " + reason, "").trim(),
          reason,
          cluster: d.cluster,
          // current cluster
          item: wordClusterMap.get(textid)
        };
      });
    }).filter((d) => d && d.item);
    outliers = [...outliers, ...etcCells.map((c) => ({
      textid: c.textid,
      text: c.text,
      cluster: 999,
      item: c
    }))];
    const remappingMap = /* @__PURE__ */ new Map();
    if (outliers.length > 0) {
      console.log(`Re-classifying ${outliers.length} outliers...`);
      const allLabelTexts = labels.map((d) => d.label);
      try {
        const result = await this.deps.classifyWithIdThreads(
          allLabelTexts,
          outliers.map((d) => `${d.textid} : ${d.text}`),
          25,
          3,
          (p) => console.log(`Rearrange progress: ${(p * 100).toFixed(0)}%`)
        );
        if (result && result.length > 0) {
          const outlierMap = new Map(outliers.map((d) => [d.textid, d]));
          result.forEach((d) => {
            const originalId = d.id;
            const match = outlierMap.get(originalId);
            if (match && d.category) {
              const newClusterId = labelMap.get(d.category);
              if (newClusterId !== void 0) {
                remappingMap.set(originalId, newClusterId);
              }
            }
          });
        }
      } catch (e) {
        console.error("Error during _rearrangeOutliers:", e);
      }
    }
    allCells.forEach((cell) => {
      let targetClusterId = cell.cluster;
      if (remappingMap.has(cell.textid)) {
        targetClusterId = remappingMap.get(cell.textid);
      }
      if (!finalGrouping.has(targetClusterId)) {
        targetClusterId = 999;
      }
      const group = finalGrouping.get(targetClusterId);
      group.cellDatas.push({
        ...cell,
        cluster: targetClusterId
      });
    });
    return Array.from(finalGrouping.values()).filter((g) => g.cellDatas.length > 0 || g.cluster !== 999).sort((a, b) => a.cluster - b.cluster);
  }
  /**
   * 클러스터별 그룹화
   */
  _groupByCluster(wordClusters) {
    const groups = /* @__PURE__ */ new Map();
    for (const item of wordClusters) {
      if (!groups.has(item.cluster)) {
        groups.set(item.cluster, { clusterId: item.cluster, sentences: [], textids: [] });
      }
      const g = groups.get(item.cluster);
      g.sentences.push(item.text);
      g.textids.push(item.textid);
    }
    return [...groups.values()];
  }
  /**
   * 히스토리에서 복원
   */
  restoreFromHistory(snapshotId) {
    const results = this.history.restore(snapshotId);
    if (results) {
      this.state.restore(results);
    }
    return this.state.snapshot();
  }
  /**
   * 히스토리 목록
   */
  getHistoryList() {
    return this.history.getList();
  }
  /**
   * 두 히스토리 비교
   */
  compareHistory(id1, id2) {
    return this.history.compare(id1, id2);
  }
  /**
   * 현재 상태 가져오기
   */
  getState() {
    return this.state.snapshot();
  }
  /**
   * 의존성 설정
   */
  setDependencies(deps) {
    Object.assign(this.deps, deps);
    if (deps.makeCluster) this.level1.setMakeCluster(deps.makeCluster);
    if (deps.getPromptResult) this.level2.setGetPromptResult(deps.getPromptResult);
    if (deps.classifyWithIdThreads) this.level2.setClassifyWithIdThreads(deps.classifyWithIdThreads);
    return this;
  }
};

// src/working-status.js
function showWorkingStatus(target, totalSteps, currentStep, message) {
  let containerId, buttonId, targetElement, insertMode;
  if (typeof target === "string") {
    buttonId = target;
    targetElement = document.getElementById(buttonId);
    insertMode = "afterButton";
  } else if (typeof target === "object") {
    containerId = target.containerId;
    buttonId = target.buttonId;
    if (containerId) {
      targetElement = document.getElementById(containerId);
      insertMode = "inContainer";
    } else if (buttonId) {
      targetElement = document.getElementById(buttonId);
      insertMode = "afterButton";
    }
  }
  if (!targetElement) {
    console.error(`\uD0C0\uAC9F \uC694\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4:`, target);
    return null;
  }
  const statusId = containerId ? `${containerId}-inner` : `${buttonId}-status`;
  if (insertMode === "inContainer") {
    targetElement.style.display = "block";
  }
  let statusContainer = document.querySelector(`#${statusId}`);
  if (statusContainer) {
    const steps = statusContainer.querySelector(".steps");
    const icons = steps.querySelectorAll("i");
    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      const isIcon = i % 2 === 0;
      const stepNum = Math.floor(i / 2) + 1;
      if (isIcon) {
        if (stepNum < currentStep) {
          icon.className = "fi fi-ss-check-circle";
          icon.style.opacity = "1";
        } else {
          icon.className = "fi fi-br-circle";
          icon.style.opacity = "1";
          if (stepNum > currentStep) {
            icon.style.opacity = "0.1";
          }
        }
      } else {
        const lineStepNum = Math.floor(i / 2) + 1;
        icon.style.opacity = lineStepNum >= currentStep ? "0.1" : "1";
      }
    }
    const stepText2 = statusContainer.querySelector(".current_step");
    stepText2.textContent = ` ${currentStep}/${totalSteps}`;
    const messageRow2 = statusContainer.querySelectorAll("div")[1];
    messageRow2.textContent = message;
    return statusContainer;
  }
  function createIcon(type) {
    const icon = document.createElement("i");
    if (type === "check") {
      icon.className = "fi fi-ss-check-circle";
    } else if (type === "empty") {
      icon.className = "fi fi-br-circle";
    } else if (type === "line") {
      icon.className = "fi fi-br-horizontal-rule";
    }
    return icon;
  }
  statusContainer = document.createElement("div");
  statusContainer.id = statusId;
  statusContainer.className = "working_status";
  const stepsRow = document.createElement("div");
  stepsRow.style.display = "flex";
  stepsRow.style.alignItems = "center";
  stepsRow.style.marginBottom = "8px";
  const stepsContainer = document.createElement("span");
  stepsContainer.className = "steps";
  stepsContainer.style.display = "flex";
  stepsContainer.style.alignItems = "center";
  for (let i = 1; i <= totalSteps; i++) {
    if (i < currentStep) {
      stepsContainer.appendChild(createIcon("check"));
    } else {
      const emptyIcon = createIcon("empty");
      if (i > currentStep) {
        emptyIcon.style.opacity = "0.1";
      }
      stepsContainer.appendChild(emptyIcon);
    }
    if (i < totalSteps) {
      const line = createIcon("line");
      if (i >= currentStep) {
        line.style.opacity = "0.1";
      }
      stepsContainer.appendChild(line);
    }
  }
  const stepText = document.createElement("span");
  stepText.className = "current_step";
  stepText.textContent = ` ${currentStep}/${totalSteps}`;
  stepText.style.marginLeft = "10px";
  stepText.style.fontWeight = "bold";
  stepsRow.appendChild(stepsContainer);
  stepsRow.appendChild(stepText);
  const messageRow = document.createElement("div");
  messageRow.textContent = message;
  messageRow.style.marginTop = "4px";
  statusContainer.appendChild(stepsRow);
  statusContainer.appendChild(messageRow);
  if (insertMode === "inContainer") {
    targetElement.innerHTML = "";
    targetElement.appendChild(statusContainer);
  } else {
    targetElement.insertAdjacentElement("afterend", statusContainer);
  }
  return statusContainer;
}
function completeWorkingStatus(target, message = "\uC5B4\uD53C\uB2C8\uD2F0\uBC84\uBE14 \uC644\uC131.", delay = 1e3) {
  let containerId, buttonId, statusId;
  if (typeof target === "string") {
    const containerInner = document.querySelector(`#${target}-inner`);
    const buttonStatus = document.querySelector(`#${target}-status`);
    if (containerInner) {
      containerId = target;
      statusId = `${target}-inner`;
    } else if (buttonStatus) {
      buttonId = target;
      statusId = `${target}-status`;
    } else {
      return null;
    }
  } else if (typeof target === "object") {
    containerId = target.containerId;
    buttonId = target.buttonId;
    statusId = containerId ? `${containerId}-inner` : `${buttonId}-status`;
  }
  const statusContainer = document.querySelector(`#${statusId}`);
  if (!statusContainer) {
    return null;
  }
  function doHide() {
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.display = "none";
        container.innerHTML = "";
      }
    } else {
      statusContainer.remove();
    }
  }
  const steps = statusContainer.querySelector(".steps");
  const icons = steps.querySelectorAll("i");
  const totalSteps = Math.ceil(icons.length / 2);
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const isIcon = i % 2 === 0;
    if (isIcon) {
      icon.className = "fi fi-ss-check-circle";
      icon.style.opacity = "1";
    } else {
      icon.style.opacity = "1";
    }
  }
  const stepText = statusContainer.querySelector(".current_step");
  stepText.textContent = ` ${totalSteps}/${totalSteps}`;
  const messageRow = statusContainer.querySelectorAll("div")[1];
  messageRow.textContent = message;
  setTimeout(() => {
    doHide();
  }, delay);
  return statusContainer;
}
function hideWorkingStatus(target) {
  let containerId, buttonId, statusId;
  if (typeof target === "string") {
    const containerInner = document.querySelector(`#${target}-inner`);
    const buttonStatus = document.querySelector(`#${target}-status`);
    if (containerInner) {
      containerId = target;
      statusId = `${target}-inner`;
    } else if (buttonStatus) {
      buttonId = target;
      statusId = `${target}-status`;
    } else {
      const container = document.getElementById(target);
      if (container) {
        container.style.display = "none";
        container.innerHTML = "";
      }
      return;
    }
  } else if (typeof target === "object") {
    containerId = target.containerId;
    buttonId = target.buttonId;
    statusId = containerId ? `${containerId}-inner` : `${buttonId}-status`;
  }
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = "none";
      container.innerHTML = "";
    }
  } else {
    const statusContainer = document.querySelector(`#${statusId}`);
    if (statusContainer) {
      statusContainer.remove();
    }
  }
}
function updatePipelineStatus(target, progressState) {
  const { stage, progress, message } = progressState;
  const stageMap = {
    "level1": 1,
    "embedding": 1,
    "clustering": 2,
    "positioning_cells": 2,
    "labeling": 3,
    "level2": 4,
    "positioning": 4,
    "combining": 5,
    "complete": 5,
    "error": 0
  };
  const totalSteps = 5;
  const currentStep = stageMap[stage] || 1;
  const normalizedTarget = typeof target === "string" ? { containerId: target } : target;
  if (stage === "complete") {
    return completeWorkingStatus(normalizedTarget, message || "\uC5B4\uD53C\uB2C8\uD2F0\uBC84\uBE14 \uC644\uC131.", 1500);
  }
  if (stage === "error") {
    return completeWorkingStatus(normalizedTarget, `\uC624\uB958: ${message}`, 3e3);
  }
  return showWorkingStatus(normalizedTarget, totalSteps, currentStep, message);
}

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
function groupBy2(data, keyFn) {
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
  const groups = groupBy2(clusterWithLabel, (d) => d.cluster);
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
  const groups = groupBy2(clusterWithLabel, (d) => d.cluster);
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
export {
  AffinityBubblePipeline,
  DataInput,
  HistoryManager,
  Level1Pipeline,
  Level2Pipeline,
  PipelineState,
  REPORT_TYPES,
  classifyWithId_threads,
  combineAll,
  completeWorkingStatus,
  cossim,
  createChunkData,
  createClusterWithLabel,
  detectFormat,
  euclidean,
  generateReport,
  getClassified,
  getClassifiedWithId,
  getInsightStream,
  getInsightStyles,
  getLabels,
  getLabels_threads,
  getPromptResult,
  getReportTypeOptions,
  getTopics,
  guessColumns,
  hideWorkingStatus,
  makeCluster,
  makeCluster_breakBig_optimized,
  makeCompactData,
  makeCompactText,
  makeEmbedPos,
  processInParallel,
  renderInsight,
  showWorkingStatus,
  toggleInsightVisibility,
  updatePipelineStatus
};
