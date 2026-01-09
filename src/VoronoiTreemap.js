/**
 * VoronoiTreemap
 *
 * Main class for creating voronoi treemap visualizations.
 * Renders hierarchical data as organic, pebble-like cells using
 * D3.js and voronoi treemap algorithms.
 *
 * Features:
 * - Hierarchical voronoi treemap layout
 * - Customizable colors, labels, and sizing
 * - Interactive click and hover events
 * - Pebble-style rounded outlines
 * - Label collision detection and adjustment
 * - Region position control for deterministic layouts
 */

import d3 from './utils/d3-bundle.js';
import { PebbleRenderer } from './PebbleRenderer.js';
import { LabelAdjuster } from './LabelAdjuster.js';
import { nestingForVoronoi } from './nestingForVoronoi.js';
import VoronoiTreemapHelpers from './VoronoiTreemapHelpers.js';

/**
 * Escape a string for use in CSS selectors
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for CSS selectors
 */
function escapeCSSSelector(str) {
  if (!str) return '';
  return str.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~\n\r\t]/g, '\\$&');
}

/**
 * VoronoiTreemap - Main visualization class
 *
 * @example
 * const treemap = new VoronoiTreemap();
 * const svg = treemap.render(data, {
 *   width: 800,
 *   height: 600,
 *   maptitle: 'My Treemap'
 * });
 * document.body.appendChild(svg);
 */
class VoronoiTreemap {
  constructor() {
    this.margin = { top: 50, right: 50, bottom: 50, left: 50 };
    this.svg = null;
    this.data = null;
    this.hierarchy = null;
    this.allNodes = null;
    this._pebbleRenderer = null;
    this._labelAdjuster = null;
  }

  // === Default Color Palette ===
  static get DEFAULT_COLORS() {
    return "#afc7dd,#ffe9a9,#f69f8f,#b4c8af,#e9e4d6,#bed1d8,#f8dba1,#fcbc8b,#d7e0c4,#c5b5a6,#b5ccc1,#e9bfb4,#e9f0f6,#fffefb,#fce0db,#e1e9df,#f1f5f7,#fef8ed,#feeada,#fbfcf9,#e5ded7,#e5edea,#fbf5f3,#96b6d3,#ffdf85,#f3836e,#a0b99a,#ddd4be,#a7c1cb,#f5cf80,#fba868,#c7d4ac,#b7a490,#a0bdb0,#e1a799,#d7e3ee,#fff7e1,#facbc3,#d3dfd0,#fdfcfa,#e1eaed,#fcefd5,#fddcc2,#f0f3e9,#dbd2c8,#d6e3dd,#f6e4df,#dee8f1,#fffaeb,#fbd4cc,#d9e3d6,#e7eef1,#fcf3df,#fee1cc,#f4f7ef,#dfd7ce,#dce7e2,#f8ebe7,#e5edf4,#fffdf5,#fcdcd6,#dfe7dc,#eef3f5,#fdf6e8,#fee7d6,#f9faf6,#e3dcd4,#e2ebe7,#faf1ef,#d0b7ba,#b8cec4,#d2b6b6,#b6bdd6,#d9b8b7,#ded5b6,#bac2d7,#c8d5be,#e3bfb7,#f9dfb3,#eac2b8,#c1d3da,#ddc7c1,#d9e2c7,#cfdad5,#eecdc1,#ccdddf,#c7d7e6,#ded6cf,#e7d1cb,#ced9e5,#eedbc8,#d7e3e2,#e3ead2,#ecdcd2,#d9e0e5,#efe1d2,#ebdad7,#eed6da,#e1e6de,#dde4e8,#eee1d8,#f5e8d7,#f1e6dd,#f5e8de,#f3e7e1,#f5eee1,#f5f2ec".split(
      ","
    );
  }

  // === Default Options ===
  static get DEFAULT_OPTIONS() {
    return {
      width: 500,
      height: 300,
      maptitle: "",
      caption: "",
      clickFunc: () => {},
      colorFunc: null,
      sizeLimit: 1000,
      ratioLimit: 0,
      pieSize: 1,
      colors: VoronoiTreemap.DEFAULT_COLORS,
      seedRandom: 10,
      showRegion: false,
      showPercent: false,
      underLabel: false,
      regionPositions: null,
      forceNodeFunc: null,
      debug: false,
      pebbleRound: 25,
      pebbleWidth: 3,
      regionColors: [],
      // Custom label renderer options
      regionLabelRenderer: null, // (datum, defaultHtml, context) => HTML string
      bigClusterLabelRenderer: null // (datum, defaultHtml, context) => HTML string
    };
  }

  // === Getter for post-processing modules ===
  get pebbleRenderer() {
    if (!this._pebbleRenderer) {
      this._pebbleRenderer = new PebbleRenderer(d3);
    }
    return this._pebbleRenderer;
  }

  get labelAdjuster() {
    if (!this._labelAdjuster) {
      this._labelAdjuster = new LabelAdjuster(d3);
    }
    return this._labelAdjuster;
  }

  // === Public Methods ===

  /**
   * Render chart - returns SVG element
   * @param {Object[]} data - Data array to visualize
   * @param {Object} [options] - Rendering options
   * @returns {SVGSVGElement} - Generated SVG element
   */
  render(data, options = {}) {
    this.params = { ...VoronoiTreemap.DEFAULT_OPTIONS, ...options };
    this.data = data;

    this._setupSVG();
    this._prepareData();
    this._setupGroups();
    this._drawTitleAndCaption();
    this._createRegionColorScale();
    this._computeLayout();
    this._drawCells();
    this._drawLabels();
    this._applyPostEffects();

    return this.svg.node();
  }

  /**
   * Update chart (data only)
   * @param {Object[]} newData - New data
   * @returns {SVGSVGElement}
   */
  update(newData) {
    return this.render(newData, this.params);
  }

  // === 1. Initial Setup Methods ===

  _setupSVG() {
    // Create independent SVG element (no container needed)
    this.svg = d3
      .create("svg")
      .attr("width", this.params.width + this.margin.left + this.margin.right)
      .attr(
        "height",
        this.params.height + this.margin.top + this.margin.bottom
      );

    this.svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("fill", "#fff");

    this.width = this.params.width * Math.sqrt(this.params.pieSize);
    this.height = this.width * (this.params.height / this.params.width);
  }

  _prepareData() {
    // Use external nestingForVoronoi function
    const nested = nestingForVoronoi(
      this.data,
      "bigClusterLabel",
      "clusterLabel"
    );

    this.hierarchy = d3.hierarchy(nested, (d) => d.values).sum((d) => d.budget);

    this.totalValue = this.hierarchy.value;
  }

  _setupGroups() {
    this.chartGroup = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.voronoiGroup = this.chartGroup.append("g").attr("class", "cell");
    this.labelsGroup = this.chartGroup.append("g").attr("class", "labels");
    this.popLabelsGroup = this.chartGroup.append("g").attr("class", "pop");
    this.bigLabelsGroup = this.chartGroup.append("g").attr("class", "label1");
    this.percentLabelsGroup = this.chartGroup
      .append("g")
      .attr("class", "percent");
    this.regionLabelsGroup = this.chartGroup
      .append("g")
      .attr("class", "region");
  }

  _drawTitleAndCaption() {
    this.svg
      .append("g")
      .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("font-size", "22")
      .attr("font-weight", "600")
      .attr(
        "transform",
        `translate(${this.margin.left + this.width / 2},${
          this.margin.top - 15
        })`
      )
      .html(this.params.maptitle);

    this.svg
      .append("g")
      .append("text")
      .attr("class", "caption")
      .attr("text-anchor", "middle")
      .attr("font-size", "15")
      .attr("font-weight", "400")
      .attr("fill", "#888")
      .attr(
        "transform",
        `translate(${this.margin.left + this.width / 2},${
          this.margin.top + this.height + 30
        })`
      )
      .html(this.params.caption);
  }

  _createRegionColorScale() {
    // Calculate total size (budget) per region
    const regionSizes = d3.rollup(
      this.data,
      (v) => d3.sum(v, (d) => d.budget),
      (d) => d.region
    );

    // Sort regions by size (descending - largest first)
    const sortedRegions = Array.from(regionSizes.entries())
      .sort((a, b) => b[1] - a[1]) // b[1] - a[1]: descending order
      .map((d) => d[0]); // Extract region names

    const { regionColors, colors: cellColors } = this.params;
    const regionColorKeys = regionColors.map((d) => d.key);
    const regionColorValues = regionColors.map((d) => d.color);

    let colorMapping = {};

    // Assign colors to sorted regions (largest region gets first color)
    sortedRegions.forEach((key, i) => {
      colorMapping[key] = cellColors[i % cellColors.length];
    });

    // Override with custom region colors if specified
    regionColorKeys.forEach((key, i) => {
      colorMapping[key] = regionColorValues[i];
    });

    this.regionColor = d3
      .scaleOrdinal()
      .domain(Object.keys(colorMapping))
      .range(Object.values(colorMapping));
  }

  // === 2. Layout Calculation Methods ===

  _computeLayout() {
    const ellipse = d3.range(100).map((i) => {
      let x = Math.cos((i / 50) * Math.PI);
      const max = 0.92;
      if (x > max) x = max + (x - max) * 0.5;
      if (x < -max) x = -max + (x + max) * 0.5;
      x = x / 0.94;
      const y = Math.sin((i / 25) * Math.PI);
      return [
        (this.width * (1 + 0.99 * x)) / 2,
        (this.height * (1 + 0.99 * y)) / 2
      ];
    });

    const seed = d3.seedrandom(this.params.seedRandom);

    let voronoiTreeMap = d3.voronoiTreemap().prng(seed).clip(ellipse);
    voronoiTreeMap(this.hierarchy);

    if (this.params.regionPositions && this.params.regionPositions !== 'auto') {
      const mergedPositions = this._normalizePositions(
        this.params.regionPositions
      );

      const modifiedVoronoiTreeMap =
        VoronoiTreemapHelpers.createCustomVoronoiAlgorithm(
          this,
          this.params.debug
        )
          .size([this.width, this.height])
          .clip(ellipse)
          .prng(seed)
          .initialPositions(mergedPositions);

      modifiedVoronoiTreeMap(this.hierarchy);
    }

    VoronoiTreemapHelpers.colorHierarchy(this, this.hierarchy);

    this.allNodes = this.hierarchy
      .descendants()
      .sort((a, b) => b.depth - a.depth)
      .map((d, i) => Object.assign({}, d, { id: i }));
  }

  _normalizePositions(regionPositions) {
    const result = [];
    const hierarchyNodes = this.hierarchy.descendants();

    // depth 1: Normalize based on overall extent
    const depth1 = regionPositions.filter((p) => p.depth === 1);
    if (depth1.length > 0) {
      const xExtent = d3.extent(depth1, (p) => p.x);
      const yExtent = d3.extent(depth1, (p) => p.y);

      const xScale =
        xExtent[0] === xExtent[1]
          ? () => 0.5
          : d3.scaleLinear().domain(xExtent).range([0.15, 0.85]);
      const yScale =
        yExtent[0] === yExtent[1]
          ? () => 0.5
          : d3.scaleLinear().domain(yExtent).range([0.15, 0.85]);

      depth1.forEach((pos) => {
        result.push({ ...pos, x: xScale(pos.x), y: yScale(pos.y) });
      });
    }

    // depth 2, 3: Find parent in hierarchy and normalize among siblings
    [2, 3].forEach((depth) => {
      const depthPositions = regionPositions.filter((p) => p.depth === depth);
      if (depthPositions.length === 0) return;

      // Find parent groups for nodes at this depth
      const nodesAtDepth = hierarchyNodes.filter((n) => n.depth === depth);
      const byParent = d3.group(nodesAtDepth, (n) => n.parent?.data?.key);

      byParent.forEach((siblings, parentKey) => {
        // Find regionPositions for these siblings
        const siblingKeys = new Set(siblings.map((s) => s.data.key));
        const siblingPositions = depthPositions.filter((p) =>
          siblingKeys.has(p.key)
        );

        if (siblingPositions.length === 0) return;

        const xExtent = d3.extent(siblingPositions, (p) => p.x);
        const yExtent = d3.extent(siblingPositions, (p) => p.y);

        const xScale =
          xExtent[0] === xExtent[1]
            ? () => 0.5
            : d3.scaleLinear().domain(xExtent).range([0.15, 0.85]);
        const yScale =
          yExtent[0] === yExtent[1]
            ? () => 0.5
            : d3.scaleLinear().domain(yExtent).range([0.15, 0.85]);

        siblingPositions.forEach((pos) => {
          result.push({ ...pos, x: xScale(pos.x), y: yScale(pos.y) });
        });
      });
    });

    return result;
  }

  // === 3. Visualization Element Drawing Methods ===

  _drawCells() {
    const { clickFunc } = this.params;
    const self = this;

    this.voronoiGroup
      .selectAll("path")
      .data(this.allNodes)
      .enter()
      .append("path")
      .attr("d", (d) => "M" + d.polygon.join("L") + "Z")
      .style("fill", (d) => d.color ?? d.parent.color)
      .attr("class", (d) => `regionArea${d.depth} area-${d.id}`)
      .style("fill-opacity", (d) => (d.depth === 3 ? 1 : 0))
      .attr("pointer-events", (d) => (d.depth === 3 ? "all" : "none"))
      .on("click", function (e, d) {
        let area = self.voronoiGroup.select(`.area-${d.id}`);
        const clicked = area.attr("class").match("clicked");
        self.voronoiGroup.select(`.clicked`).classed("clicked", false);
        area.classed("clicked", !clicked);
        clickFunc(clicked ? "" : { ...d.data, event: e, d, clickArea: area });
      })
      .on("mouseenter", function (e, d) {
        const label1 = self.bigLabelsGroup.select(
          `[data-bigCluster="${escapeCSSSelector(d.data.data.bigClusterLabel)}"]`
        );
        label1.attr("opacity", 1);

        const label = self.labelsGroup.select(
          `[data-cluster="${escapeCSSSelector(d.data.data.clusterLabel)}"]`
        );
        label.attr("opacity", 1);

        let area = self.voronoiGroup.select(`.area-${d.id}`);
        area.classed("highlite", true);
      })
      .on("mouseleave", function (e, d) {
        const label1 = self.bigLabelsGroup.select(
          `[data-bigCluster="${escapeCSSSelector(d.data.data.bigClusterLabel)}"]`
        );
        label1.attr("opacity", (d) =>
          label1.attr("data-ratio") >= self.params.ratioLimit ? 1 : 0
        );

        const label = self.labelsGroup.select(
          `[data-cluster="${escapeCSSSelector(d.data.data.clusterLabel)}"]`
        );
        label.attr("opacity", (d) =>
          label.attr("data-ratio") >= self.params.ratioLimit ? 1 : 0
        );

        let area = self.voronoiGroup.select(`.area-${d.id}`);
        area.classed("highlite", false);
      });
  }

  _drawLabels() {
    this._drawRegionLabels();
    this._drawBigClusterLabels();
    this._drawPercentLabels();
    this._drawSectorLabels();
    this._drawPopLabels();
  }

  _drawRegionLabels() {
    const { showRegion, regionLabelRenderer } = this.params;
    const self = this;

    const regionNodes = this.allNodes.filter((d) => d.depth === 1);

    // If custom renderer exists, use foreignObject
    if (regionLabelRenderer) {
      this.regionLabelsGroup
        .selectAll("foreignObject")
        .data(regionNodes)
        .enter()
        .append("foreignObject")
        .attr("class", "region-label-foreign")
        .attr("data-region", (d) => d.data.key)
        .attr("width", (d) => {
          const bounds = VoronoiTreemapHelpers.getPolygonBounds(d.polygon);
          const width = bounds.maxX - bounds.minX;
          return width * 0.6;
        })
        .attr("height", (d) =>
          VoronoiTreemapHelpers.estimateLabelHeight(this, d, 1.3)
        )
        .attr("x", (d) => {
          const bounds = VoronoiTreemapHelpers.getPolygonBounds(d.polygon);
          const width = bounds.maxX - bounds.minX;
          return d.polygon.site.x - (width * 0.6) / 2;
        })
        .attr(
          "y",
          (d) =>
            d.polygon.site.y -
            VoronoiTreemapHelpers.estimateLabelHeight(this, d, 1.3) * 0.4 +
            VoronoiTreemapHelpers.getLabelHeightOffset(this, d)
        )
        .style("opacity", showRegion ? 1 : 0)
        .style("pointer-events", "none")
        .style("overflow", "visible")
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .html((d) => {
          const defaultHtml = VoronoiTreemapHelpers.multiline(d.data.key);
          const context = VoronoiTreemapHelpers.createLabelContext(this, d, 1);
          return regionLabelRenderer(d, defaultHtml, context);
        });
    } else {
      // Default text rendering
      this.regionLabelsGroup
        .selectAll("text")
        .data(regionNodes)
        .enter()
        .append("text")
        .attr("class", "region")
        .attr("text-anchor", "start")
        .attr("ratio", (d) => d.value / d.parent.value)
        .style(
          "font-size",
          (d) =>
            VoronoiTreemapHelpers.fontScale(this.hierarchy, d) * 1.15 + "em"
        )
        .style("fill-opacity", showRegion ? 1 : 0)
        .style("stroke-opacity", showRegion ? 0.85 : 0)
        .style(
          "stroke",
          (d) => `${VoronoiTreemapHelpers.getHSLColor(d.color, 0, -0.05, -0.2)}`
        )
        .attr("paint-order", "stroke")
        .attr(
          "transform",
          (d) =>
            `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiTreemapHelpers.getLabelHeightOffset(this, d)
            ]})`
        )
        .html((d) => VoronoiTreemapHelpers.multiline(d.data.key));
    }
  }

  _drawBigClusterLabels() {
    const { ratioLimit, bigClusterLabelRenderer } = this.params;
    const self = this;

    const bigClusterNodes = this.allNodes.filter((d) => d.depth === 2);

    // If custom renderer exists, use foreignObject
    if (bigClusterLabelRenderer) {
      this.bigLabelsGroup
        .selectAll("foreignObject")
        .data(bigClusterNodes)
        .enter()
        .append("foreignObject")
        .attr("class", "bigcluster-label-foreign")
        .attr("data-bigCluster", (d) => d.data.key)
        .attr("data-value", (d) => d.value)
        .attr("data-ratio", (d) => d.value / this.totalValue)

        .attr("width", (d) => {
          const bounds = VoronoiTreemapHelpers.getPolygonBounds(d.polygon);
          const width = bounds.maxX - bounds.minX;
          return width * 0.6;
        })
        .attr("height", (d) =>
          VoronoiTreemapHelpers.estimateLabelHeight(this, d, 1.2)
        )
        .attr("x", (d) => {
          const bounds = VoronoiTreemapHelpers.getPolygonBounds(d.polygon);
          const width = bounds.maxX - bounds.minX;
          return d.polygon.site.x - (width * 0.6) / 2;
        })
        .attr(
          "y",
          (d) =>
            d.polygon.site.y -
            VoronoiTreemapHelpers.estimateLabelHeight(this, d, 1.2) * 0.45 +
            VoronoiTreemapHelpers.getLabelHeightOffset(this, d)
        )
        .attr("opacity", (d) =>
          d.value / this.totalValue >= ratioLimit ? 1 : 0
        )
        .style("pointer-events", "none")
        .style("overflow", "visible")
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .html((d) => {
          const defaultHtml = VoronoiTreemapHelpers.multiline(d.data.key);
          const context = VoronoiTreemapHelpers.createLabelContext(this, d, 2);
          return bigClusterLabelRenderer(d, defaultHtml, context);
        });
    } else {
      // Default text rendering
      this.bigLabelsGroup
        .selectAll("text")
        .data(bigClusterNodes)
        .enter()
        .append("text")
        .attr("class", "field")
        .attr("data-bigCluster", (d) => d.data.key)
        .attr("text-anchor", "start")
        .attr("data-value", (d) => d.value)
        .attr("data-ratio", (d) => d.value / this.totalValue)
        .style(
          "font-size",
          (d) => VoronoiTreemapHelpers.fontScale(this.hierarchy, d) + "em"
        )
        .attr("paint-order", "stroke")
        .style("fill", (d) =>
          VoronoiTreemapHelpers.colorVar2(d.parent.color, 0, 0.2, -0.2)
        )
        .attr(
          "transform",
          (d) =>
            `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiTreemapHelpers.getLabelHeightOffset(this, d)
            ]})`
        )
        .html((d) => VoronoiTreemapHelpers.multiline(d.data.key))
        .attr("opacity", (d) =>
          d.value / this.totalValue >= ratioLimit ? 1 : 0
        );
    }
  }

  _drawPercentLabels() {
    const { showPercent } = this.params;
    const percent_label_depth =
      this.allNodes.filter((d) => d.depth === 1).length > 1 ? 1 : 2;

    this.percentLabelsGroup
      .selectAll("text")
      .data(this.allNodes.filter((d) => d.depth === percent_label_depth))
      .enter()
      .append("text")
      .attr("class", (d) => `budget percent label-${d.id}`)
      .attr("text-anchor", "middle")
      .style(
        "font-size",
        (d) => VoronoiTreemapHelpers.fontScale(this.hierarchy, d) * 0.8 + "em"
      )
      .attr(
        "transform",
        (d) =>
          `translate(${[
            d.polygon.site.x,
            d.polygon.site.y +
              VoronoiTreemapHelpers.fontScale(this.hierarchy, d) *
                8 *
                (VoronoiTreemapHelpers.multiline(d.data.key, true)[1] + 2.2)
          ]})`
      )
      .text((d) => " " + d3.format(".0%")(d.value / this.totalValue))
      .attr("opacity", (d) =>
        showPercent
          ? Math.round((d.value / this.totalValue) * 100) > 0
            ? 1
            : 0
          : 0
      );
  }

  _drawSectorLabels() {
    const { underLabel, ratioLimit } = this.params;

    this.labelsGroup
      .selectAll("text")
      .data(this.allNodes.filter((d) => d.depth === 3))
      .enter()
      .append("text")
      .attr("class", (d) => `sector label-${d.id}`)
      .attr("data-cluster", (d) => d.data.key)
      .attr("data-value", (d) => d.value)
      .attr("data-ratio", (d) => d.value / this.totalValue)
      .attr("text-anchor", "start")
      .style(
        "font-size",
        (d) => VoronoiTreemapHelpers.fontScale2(this.hierarchy, d) + "em"
      )
      .style("fill", (d) =>
        VoronoiTreemapHelpers.getHSLColor(d.color, 0, -0.1, -0.3)
      )
      .attr("transform", (d) => {
        return underLabel
          ? `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiTreemapHelpers.fontScale1(
                  this.hierarchy,
                  d.data.data.bigClusterLabel,
                  d.parent.value
                ) *
                  8 *
                  (VoronoiTreemapHelpers.multiline(
                    d.data.data.bigClusterLabel,
                    true
                  )[1] +
                    0.5)
            ]})`
          : `translate(${VoronoiTreemapHelpers.getLabelPos(this, d)})`;
      })
      .html((d) => VoronoiTreemapHelpers.multiline(d.data.key))
      .attr("opacity", (d) => (d.value / this.totalValue > ratioLimit ? 1 : 0));
  }

  _drawPopLabels() {
    const { sizeLimit } = this.params;

    this.popLabelsGroup
      .selectAll("text")
      .data(this.allNodes.filter((d) => d.depth === 3))
      .enter()
      .append("text")
      .attr("class", (d) => `budget label-${d.id}`)
      .attr("text-anchor", "middle")
      .style(
        "font-size",
        (d) => VoronoiTreemapHelpers.fontScale2(this.hierarchy, d) * 0.8 + "em"
      )
      .attr(
        "data-pop",
        (d) => d.data.data.clusterLabel ?? d.data.data.bigClusterLabel
      )
      .attr(
        "transform",
        (d) =>
          `translate(${[
            d.polygon.site.x,
            d.polygon.site.y + VoronoiTreemapHelpers.varFontScale(this, d)
          ]})`
      )
      .text((d) => VoronoiTreemapHelpers.bigFormat(d.data.values[0].budget))
      .attr("opacity", (d) => (d.value > sizeLimit ? 1 : 0));
  }

  // === 4. Post-processing and Effects Methods ===

  _applyPostEffects() {
    const { showRegion, pebbleRound, pebbleWidth } = this.params;

    if (showRegion) {
      this.labelAdjuster.adjust(this.svg.node(), { verticalSpacing: 0 });
    }

    this.pebbleRenderer.render(
      this.svg.node(),
      pebbleRound,
      pebbleWidth,
      VoronoiTreemapHelpers.colorVar.bind(VoronoiTreemapHelpers)
    );
  }
}

export default VoronoiTreemap;
