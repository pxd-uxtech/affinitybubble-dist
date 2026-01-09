/**
 * Voronoi Treemap Helpers
 *
 * Static utility methods for voronoi treemap visualization including:
 * - Font scaling functions for label sizing
 * - Color manipulation and hierarchy coloring
 * - Text layout and multiline label rendering
 * - Polygon bounds and position calculations
 * - Number formatting utilities
 * - Custom voronoi algorithm creation
 */

import d3 from './utils/d3-bundle.js';

/**
 * VoronoiTreemapHelpers - Collection of static helper methods
 *
 * These methods support the main VoronoiTreemap class with calculations
 * for sizing, positioning, coloring, and layout of treemap cells and labels.
 */
const VoronoiTreemapHelpers = {
  // === Font Scale Functions ===

  /**
   * Calculate font scale based on node value ratio in hierarchy
   * @param {Object} hierarchy - D3 hierarchy root node
   * @param {Object} d - Current node
   * @returns {number} Font scale value (0.3 to 1.5)
   */
  fontScale: function (hierarchy, d) {
    let ratio = (d.value / hierarchy.value) * 100;
    if (ratio > 30) ratio = 30;
    if (ratio < 0.2) ratio = 0.2;
    return d3.scaleLog().domain([0.1, 20]).range([0.3, 1.5])(ratio);
  },

  /**
   * Calculate font scale for a specific value (not node-based)
   * @param {Object} hierarchy - D3 hierarchy root node
   * @param {string} string - Text string (unused but kept for API compatibility)
   * @param {number} value - Value to calculate scale for
   * @returns {number} Font scale value (0.3 to 1.5)
   */
  fontScale1: function (hierarchy, string, value) {
    let ratio = (value / hierarchy.value) * 100;
    if (ratio > 30) ratio = 30;
    if (ratio < 0.2) ratio = 0.2;
    return d3.scaleLog().domain([0.1, 20]).range([0.3, 1.5])(ratio);
  },

  /**
   * Calculate secondary font scale (smaller range for sub-labels)
   * @param {Object} hierarchy - D3 hierarchy root node
   * @param {Object} d - Current node
   * @returns {number} Font scale value (0.5 to 0.8)
   */
  fontScale2: function (hierarchy, d) {
    let ratio = (d.value / hierarchy.value) * 100;
    if (ratio > 5) ratio = 5;
    if (ratio < 0.1) ratio = 0.1;
    return d3.scaleLog().domain([0.1, 8]).range([0.5, 0.8])(ratio);
  },

  /**
   * Calculate variable font scale for label positioning
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} d - Current node
   * @returns {number} Calculated offset value
   */
  varFontScale: function (self, d) {
    const text = d.data.data.clusterLabel ?? d.data.data.bigClusterLabel;
    const [cols, rows] = this.multiline(text, true);
    return d.data.data.clusterLabel
      ? (this.fontScale2(self.hierarchy, d) * 6 * rows) / 2 + 20
      : (this.fontScale(self.hierarchy, d) * 30 * rows) / 2 + 8;
  },

  // === Color Functions ===

  /**
   * Get HSL color with adjustments
   * @param {string} color - Base color
   * @param {number} [h=0] - Hue adjustment
   * @param {number} [s=0] - Saturation adjustment
   * @param {number} [l=0] - Lightness adjustment
   * @returns {string} Hex color string
   */
  getHSLColor: function (color, h, s, l) {
    h = h || 0;
    s = s || 0;
    l = l || 0;
    const hslColor = d3.hsl(color);
    const lighterColor = hslColor.copy({
      h: hslColor.h + h,
      s: hslColor.s + s,
      l: hslColor.l + l
    });
    return lighterColor.formatHex();
  },

  /**
   * Color variation with HSL adjustments (alternate parameter order)
   * @param {string} color - Base color
   * @param {number} [h=0] - Hue adjustment
   * @param {number} [l=0] - Lightness adjustment
   * @param {number} [s=0] - Saturation adjustment
   * @returns {string} Hex color string
   */
  colorVar: function (color, h, l, s) {
    h = h || 0;
    l = l || 0;
    s = s || 0;
    let c = d3.hsl(color);
    c.h += h;
    c.l += l;
    c.s += s;
    if (c.l > 0.95) c.l = 0.95;
    return c.formatHex();
  },

  /**
   * Color variation for secondary elements (darker, less saturated)
   * @param {string} color - Base color
   * @returns {string} Hex color string
   */
  colorVar2: function (color) {
    let c = d3.hsl(color);
    c.l = c.l * 0.3;
    c.s = 0.25;
    if (c.l > 0.95) c.l = 0.95;
    if (c.l < 0.1) c.l = 0.1;
    return c.formatHex();
  },

  /**
   * Color variation based on value within domain
   * @param {string} color - Base color
   * @param {number[]} vdomain - Value domain array for extent calculation
   * @param {number} value - Current value
   * @param {string} desc - Description (unused but kept for API compatibility)
   * @returns {string} Hex color string
   */
  colorvariation: function (color, vdomain, value, desc) {
    const domain = d3.extent(vdomain);
    let vScale = d3.scaleLinear().domain(domain).range([0.3, 1]);
    let c = d3.hsl(color);
    if (c.l > 0.8) c.l = 0.8;
    c.l += (0.5 - vScale(value)) * 0.1;
    if (c.l > 0.9) c.l = 0.9;
    return c.formatHex();
  },

  /**
   * Recursively assign colors to hierarchy nodes based on depth
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} hierarchy - D3 hierarchy node to color
   */
  colorHierarchy: function (self, hierarchy) {
    if (hierarchy.depth === 0) {
      hierarchy.color = "#ddd";
    } else if (hierarchy.depth === 1) {
      hierarchy.color = self.regionColor(hierarchy.data.key);
    } else if (hierarchy.depth === 2) {
      hierarchy.color = this.colorvariation(
        hierarchy.parent.color,
        hierarchy.parent.children.map((d) => d.value),
        hierarchy.value,
        hierarchy.depth + hierarchy.data.key
      );
    } else if (hierarchy.depth === 3) {
      hierarchy.color = this.colorvariation(
        hierarchy.parent.color,
        hierarchy.parent.parent.children.map((d) => d.value),
        hierarchy.value,
        hierarchy.depth + hierarchy.data.key
      );
      if (self.params.colorFunc) {
        const originalData = self.data.filter(
          (d) =>
            d.clusterLabel === hierarchy.data.key &&
            d.bigClusterLabel === hierarchy.parent.data.key
        );
        hierarchy.color = self.params.colorFunc(
          originalData,
          hierarchy.data.data,
          hierarchy.color,
          {
            parentColor: hierarchy.parent.color,
            siblings: hierarchy.parent.parent.children.map((d) => d.value),
            value: hierarchy.value,
            depth: hierarchy.depth,
            region: hierarchy.parent.parent
          }
        );
      }
    }
    if (hierarchy.children) {
      hierarchy.children.forEach((child) => this.colorHierarchy(self, child));
    }
  },

  // === Text & Label Functions ===

  /**
   * Convert text to multiline SVG tspan format
   * @param {string} text - Input text
   * @param {boolean} [getBoxInfo=false] - If true, return [maxWidth, lineCount] instead of HTML
   * @returns {string|number[]} HTML string for tspans, or [maxWidth, lineCount] if getBoxInfo is true
   */
  multiline: function (text, getBoxInfo) {
    const inputText = text ? String(text) : "";
    const isLatinText = !/[^A-Za-z0-9\s\-.,!?:;@]/.test(inputText);
    const forcedLineBreaks = inputText.split("\n");
    let allLines = [];

    forcedLineBreaks.forEach((line) => {
      const words = line.split(/[ ,]/);
      let currentLines = [];
      let count = 0;
      let lineCount = 0;
      currentLines[0] = "";

      words.forEach((word) => {
        if (word.length + count > (isLatinText ? 9 : 7)) {
          lineCount += 1;
          count = 0;
          currentLines[lineCount] = "";
        }
        currentLines[lineCount] = currentLines[lineCount] + word.trim() + " ";
        count += word.length;
      });
      const filteredLines = currentLines.filter((d) => d.trim());
      allLines = allLines.concat(filteredLines);
    });

    const charWidths = {
      i: 0.4,
      j: 0.4,
      l: 0.4,
      t: 0.5,
      f: 0.5,
      r: 0.6,
      I: 0.3,
      1: 0.6,
      "!": 0.3,
      "|": 0.3,
      ".": 0.3,
      ",": 0.3,
      ":": 0.3,
      ";": 0.4,
      w: 1.4,
      W: 1.6,
      m: 1.3,
      M: 1.5,
      "@": 1.4,
      a: 0.9,
      e: 0.9,
      o: 0.9,
      u: 0.9,
      n: 0.9,
      s: 0.8,
      A: 1.1,
      E: 1.0,
      O: 1.2,
      U: 1.1,
      N: 1.1,
      S: 1.0
    };

    function calculateTextWidth(text) {
      return Array.from(text).reduce(
        (width, char) => width + (charWidths[char] || 1.0),
        0
      );
    }

    const lineWidths = allLines.map((line) => {
      const trimmedLine = line.trim();
      const isLatinText = !/[^A-Za-z0-9\s\-.,!?:;@]/.test(trimmedLine);
      return isLatinText
        ? calculateTextWidth(trimmedLine)
        : trimmedLine.length;
    });
    let maxLength = Math.max(...lineWidths);

    if (getBoxInfo) return [maxLength, allLines.length];

    const html = allLines
      .map(
        (d, i) => `<tspan x=${-maxLength / 3}em dy=${1}em>${d.trim()}</tspan>`
      )
      .join("");
    return `<tspan x=${0}em y=${-allLines.length / 2}em>${html}</tspan>`;
  },

  /**
   * Calculate label height offset based on font size and line count
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} d - Current node
   * @returns {number} Height offset value
   */
  getLabelHeightOffset: function (self, d) {
    const fontSize = this.fontScale(self.hierarchy, d);
    const [width, lineRows] = this.multiline(d.data.key, true);
    const boxHeight = fontSize * 8 * (lineRows - 2);
    return boxHeight;
  },

  /**
   * Calculate optimal label position within parent polygon
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} d - Current node
   * @returns {number[]|undefined} [x, y] position or undefined for depth 1 nodes
   */
  getLabelPos: function (self, d) {
    if (d.depth === 1) return;
    const parentCenter = d.parent.polygon.site;
    const currentCenter = d.polygon.site;
    if (d.parent.children.length > 1)
      return [currentCenter.x, currentCenter.y];

    const diffX = currentCenter.x - parentCenter.x;
    const diffY = currentCenter.y - parentCenter.y;
    let offY = 0,
      offX = 0;

    const fontSize = this.fontScale2(self.hierarchy, d);
    const [meanWidth, lineRows] = this.multiline(d.data.key, true);
    const boxHeight = fontSize * 6 * lineRows;
    const boxWidth = fontSize * 6 * meanWidth;
    const minOffset = Math.max(18, boxHeight / 2);

    if (Math.abs(diffY) < minOffset) {
      offY = diffY >= 0 ? minOffset : -minOffset;
      if (Math.abs(diffX) < boxWidth) {
        offX = diffX >= 0 ? boxWidth / 2 : -boxWidth / 2;
      }
    }

    const parentBounds = this.getPolygonBounds(d.parent.polygon);
    const proposedX = currentCenter.x + offX;
    const proposedY = currentCenter.y + offY;

    if (proposedX < parentBounds.minX + boxWidth / 2) {
      offX = parentBounds.minX + boxWidth / 2 - currentCenter.x;
    } else if (proposedX > parentBounds.maxX - boxWidth / 2) {
      offX = parentBounds.maxX - boxWidth / 2 - currentCenter.x;
    }
    if (proposedY < parentBounds.minY + boxHeight / 2) {
      offY = parentBounds.minY + boxHeight / 2 - currentCenter.y;
    } else if (proposedY > parentBounds.maxY - boxHeight / 2) {
      offY = parentBounds.maxY - boxHeight / 2 - currentCenter.y;
    }

    return [currentCenter.x + offX, currentCenter.y + offY];
  },

  /**
   * Get bounding box of a polygon
   * @param {number[][]} polygon - Array of [x, y] coordinate pairs
   * @returns {Object} { minX, maxX, minY, maxY }
   */
  getPolygonBounds: function (polygon) {
    const xs = polygon.map((point) => point[0]);
    const ys = polygon.map((point) => point[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  },

  /**
   * Estimate polygon radius from area
   * @param {Object} d - Node with polygon data
   * @returns {number} Estimated radius
   */
  estimatePolygonRadius: function (d) {
    const area = d.polygon.site.originalObject.polygon.area();
    return Math.sqrt(area / Math.PI);
  },

  /**
   * Estimate label width based on font size and text length
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} d - Current node
   * @param {number} [fontMultiplier=1] - Font size multiplier
   * @returns {number} Estimated width (minimum 60)
   */
  estimateLabelWidth: function (self, d, fontMultiplier) {
    fontMultiplier = fontMultiplier || 1;
    const fontSize = this.fontScale(self.hierarchy, d) * fontMultiplier;
    const [maxWidth, lineCount] = this.multiline(d.data.key, true);
    return Math.max(fontSize * 16 * maxWidth * 0.8, 60);
  },

  /**
   * Estimate label height based on font size and line count
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} d - Current node
   * @param {number} [fontMultiplier=1] - Font size multiplier
   * @returns {number} Estimated height (minimum 40)
   */
  estimateLabelHeight: function (self, d, fontMultiplier) {
    fontMultiplier = fontMultiplier || 1;
    const fontSize = this.fontScale(self.hierarchy, d) * fontMultiplier;
    const [maxWidth, lineCount] = this.multiline(d.data.key, true);
    return Math.max(fontSize * 16 * lineCount * 1.5, 40);
  },

  /**
   * Create context object for custom label renderers
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object} d - Current node
   * @param {number} depth - Depth level (1 or 2)
   * @returns {Object} Context object with label rendering information
   */
  createLabelContext: function (self, d, depth) {
    return {
      key: d.data.key,
      value: d.value,
      depth: d.depth,
      data: d.data.values[0]?.data,
      ratio: d.value / self.totalValue,
      percentText: d3.format(".0%")(d.value / self.totalValue),
      color: d.color,
      parentColor: d.parent?.color,
      darkerColor: this.getHSLColor(d.color, 0, -0.1, -0.2),
      lighterColor: this.getHSLColor(d.color, 0, 0.1, 0.1),
      fontSize:
        depth === 1
          ? this.fontScale(self.hierarchy, d) * 1.15
          : this.fontScale(self.hierarchy, d),
      centerX: d.polygon.site.x,
      centerY: d.polygon.site.y,
      polygon: d.polygon,
      parent: d.parent
        ? {
            key: d.parent.data.key,
            value: d.parent.value,
            color: d.parent.color
          }
        : null,
      children: d.children
        ? d.children.map((c) => ({
            key: c.data.key,
            value: c.value,
            color: c.color
          }))
        : null,
      totalValue: self.totalValue,
      formatNumber: (n) => this.bigFormat(n),
      formatPercent: (n) => d3.format(".1%")(n)
    };
  },

  // === Number Format Functions ===

  /**
   * Format large numbers with Korean units (조, 억, 만)
   * @param {number} n - Number to format
   * @returns {string} Formatted string with Korean number units
   */
  bigFormat: function (n) {
    const 조 = n > 10 ** 12 ? Math.floor(n / 10 ** 12) % 10 ** 4 : 0;
    const 억 = n > 10 ** 8 ? Math.round(n / 10 ** 8) % 10 ** 4 : 0;
    const 만 = parseInt(n / 10 ** 4) % 10 ** 4;

    return (
      (조 >= 1 ? d3.format(",.0f")(조) + "조 " : " ") +
      (억 >= 1 ? d3.format(",.0f")(억) + "억 " : " ") +
      (n < 10 ** 10 && 만 >= 1 ? d3.format(",.0f")(만) + "만 " : " ") +
      (n < 10 ** 4 ? d3.format(",.0f")(Math.round(n)) : " ")
    );
  },

  // === Custom Voronoi Algorithm ===

  /**
   * Create a custom voronoi treemap algorithm with initial position support
   * @param {Object} self - VoronoiTreemap instance
   * @param {boolean} [debug=false] - Enable debug mode
   * @returns {Function} Voronoi treemap algorithm function
   */
  createCustomVoronoiAlgorithm: function (self, debug) {
    debug = debug || false;
    const DEFAULT_CONVERGENCE_RATIO = 0.01;
    const DEFAULT_MAX_ITERATION_COUNT = 50;
    const DEFAULT_MIN_WEIGHT_RATIO = 0.01;
    const DEFAULT_PRNG = Math.random;

    var clip = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0]
    ];
    var extent = [
      [0, 0],
      [1, 1]
    ];
    var size = [1, 1];
    var convergenceRatio = DEFAULT_CONVERGENCE_RATIO;
    var maxIterationCount = DEFAULT_MAX_ITERATION_COUNT;
    var minWeightRatio = DEFAULT_MIN_WEIGHT_RATIO;
    var prng = DEFAULT_PRNG;
    var initialPositions = {};

    var unrelevantButNeedeData = [{ weight: 1 }, { weight: 1 }];
    var _convenientReusableVoronoiMapSimulation = d3
      .voronoiMapSimulation(unrelevantButNeedeData)
      .stop();

    const helpers = this;

    const _voronoiTreemap = function (rootNode) {
      recurse(clip, rootNode);
    };

    _voronoiTreemap.convergenceRatio = function (_) {
      return arguments.length
        ? ((convergenceRatio = _), _voronoiTreemap)
        : convergenceRatio;
    };
    _voronoiTreemap.maxIterationCount = function (_) {
      return arguments.length
        ? ((maxIterationCount = _), _voronoiTreemap)
        : maxIterationCount;
    };
    _voronoiTreemap.minWeightRatio = function (_) {
      return arguments.length
        ? ((minWeightRatio = _), _voronoiTreemap)
        : minWeightRatio;
    };
    _voronoiTreemap.clip = function (_) {
      if (!arguments.length) return clip;
      _convenientReusableVoronoiMapSimulation.clip(_);
      clip = _convenientReusableVoronoiMapSimulation.clip();
      extent = _convenientReusableVoronoiMapSimulation.extent();
      size = _convenientReusableVoronoiMapSimulation.size();
      return _voronoiTreemap;
    };
    _voronoiTreemap.extent = function (_) {
      if (!arguments.length) return extent;
      _convenientReusableVoronoiMapSimulation.extent(_);
      clip = _convenientReusableVoronoiMapSimulation.clip();
      extent = _convenientReusableVoronoiMapSimulation.extent();
      size = _convenientReusableVoronoiMapSimulation.size();
      return _voronoiTreemap;
    };
    _voronoiTreemap.size = function (_) {
      if (!arguments.length) return size;
      _convenientReusableVoronoiMapSimulation.size(_);
      clip = _convenientReusableVoronoiMapSimulation.clip();
      extent = _convenientReusableVoronoiMapSimulation.extent();
      size = _convenientReusableVoronoiMapSimulation.size();
      return _voronoiTreemap;
    };
    _voronoiTreemap.prng = function (_) {
      return arguments.length ? ((prng = _), _voronoiTreemap) : prng;
    };
    _voronoiTreemap.initialPositions = function (_) {
      return arguments.length
        ? ((initialPositions = _), _voronoiTreemap)
        : initialPositions;
    };

    const recurse = function (clippingPolygon, node) {
      var simulation;
      node.polygon = clippingPolygon;

      if (node.height != 0) {
        simulation = d3
          .voronoiMapSimulation(node.children)
          .clip(clippingPolygon)
          .weight((d) => d.value)
          .convergenceRatio(convergenceRatio)
          .maxIterationCount(maxIterationCount)
          .minWeightRatio(minWeightRatio)
          .prng(prng)
          .initialPosition(
            helpers.createInitialPositioner(self, initialPositions, debug)
          )
          .stop();

        var state = simulation.state();
        while (!state.ended) {
          simulation.tick();
          state = simulation.state();
        }

        state.polygons.forEach(function (cp) {
          recurse(cp, cp.site.originalObject.data.originalData);
        });
      }
    };

    return _voronoiTreemap;
  },

  /**
   * Create initial position function for voronoi simulation
   * @param {Object} self - VoronoiTreemap instance
   * @param {Object[]} initialPositions - Array of initial position objects
   * @param {boolean} [debug=false] - Enable debug mode
   * @returns {Function} Position function for voronoi simulation
   */
  createInitialPositioner: function (self, initialPositions, debug) {
    debug = debug || false;
    var clippingPolygon, extent, minX, maxX, minY, maxY, dx, dy;

    function updateInternals() {
      minX = extent[0][0];
      maxX = extent[1][0];
      minY = extent[0][1];
      maxY = extent[1][1];
      dx = maxX - minX;
      dy = maxY - minY;
    }

    function findNodeInitialPosition(node, initialPositions) {
      return initialPositions.find(
        (pos) => pos.depth === node.depth && pos.key === node.data.key
      );
    }

    function getSiblingInitialPositions(siblings, initialPositions) {
      return siblings
        .map((sibling) => findNodeInitialPosition(sibling, initialPositions))
        .filter((pos) => pos !== undefined);
    }

    function getPolygonAngles(clippingPolygon) {
      const polygonXExtent = d3.extent(clippingPolygon, (d) => d[0]);
      const polygonYExtent = d3.extent(clippingPolygon, (d) => d[1]);

      return clippingPolygon
        .map((point) => {
          const x = d3.scaleLinear().domain(polygonXExtent).range([-1, 1])(
            point[0]
          );
          const y = d3.scaleLinear().domain(polygonYExtent).range([-1, 1])(
            point[1]
          );
          const angle = Math.atan2(y, x);
          return {
            angle: angle < 0 ? angle + 2 * Math.PI : angle,
            point: point,
            x: x,
            y: y
          };
        })
        .sort((a, b) => a.angle - b.angle);
    }

    function mapPointToPolygon(x, y, polygonAngles, clippingPolygon) {
      const angle = Math.atan2(y, x);
      const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

      let startAngle, endAngle, startPoint, endPoint;
      for (let i = 0; i < polygonAngles.length; i++) {
        if (normalizedAngle <= polygonAngles[i].angle) {
          startAngle =
            i === 0
              ? polygonAngles[polygonAngles.length - 1].angle
              : polygonAngles[i - 1].angle;
          endAngle = polygonAngles[i].angle;
          startPoint =
            i === 0
              ? polygonAngles[polygonAngles.length - 1]
              : polygonAngles[i - 1];
          endPoint = polygonAngles[i];
          break;
        }
      }

      if (startAngle === undefined) {
        startAngle = polygonAngles[polygonAngles.length - 1].angle;
        endAngle = polygonAngles[0].angle + 2 * Math.PI;
        startPoint = polygonAngles[polygonAngles.length - 1];
        endPoint = polygonAngles[0];
      }

      const t = (normalizedAngle - startAngle) / (endAngle - startAngle);
      const edgeX = startPoint.x + t * (endPoint.x - startPoint.x);
      const edgeY = startPoint.y + t * (endPoint.y - startPoint.y);

      const distanceToPoint = Math.sqrt(x * x + y * y);
      const maxDistance = Math.sqrt(2);
      const ratio = (distanceToPoint / maxDistance) * 0.9;

      const mappedX = ratio * edgeX;
      const mappedY = ratio * edgeY;

      const polygonXExtent = d3.extent(clippingPolygon, (d) => d[0]);
      const polygonYExtent = d3.extent(clippingPolygon, (d) => d[1]);

      const finalX = d3.scaleLinear().domain([-1, 1]).range(polygonXExtent)(
        mappedX
      );
      const finalY = d3.scaleLinear().domain([-1, 1]).range(polygonYExtent)(
        mappedY
      );

      return [finalX, finalY, normalizedAngle, ratio, [x, y]];
    }

    const _random = function (d, i, arr, voronoiMapSimulation) {
      var shouldUpdateInternals = false;
      if (clippingPolygon !== voronoiMapSimulation.clip()) {
        clippingPolygon = voronoiMapSimulation.clip();
        extent = voronoiMapSimulation.extent();
        shouldUpdateInternals = true;
      }
      if (shouldUpdateInternals) {
        updateInternals();
      }

      if (d.depth === 0) {
        return [(minX + maxX) / 2, (minY + maxY) / 2];
      }

      const parent = d.parent || arr[0].parent;
      const siblings = parent ? parent.children : arr;
      const siblingInitialPositions = getSiblingInitialPositions(
        siblings,
        initialPositions
      );

      if (siblingInitialPositions.length > 0) {
        const siblingXExtent = d3.extent(siblingInitialPositions, (d) => d.x);
        const siblingYExtent = d3.extent(siblingInitialPositions, (d) => d.y);
        const nodeInitialPosition = findNodeInitialPosition(
          d,
          initialPositions
        );

        if (nodeInitialPosition) {
          const x = nodeInitialPosition.x * self.width;
          const y = nodeInitialPosition.y * self.height;

          if (d3.polygonContains(clippingPolygon, [x, y])) {
            return [x, y];
          }

          const [mappedX, mappedY] = mapPointToPolygon(
            d3.scaleLinear().domain(siblingXExtent).range([-1, 1])(
              nodeInitialPosition.x
            ),
            d3.scaleLinear().domain(siblingYExtent).range([-1, 1])(
              nodeInitialPosition.y
            ),
            getPolygonAngles(clippingPolygon),
            clippingPolygon
          );

          return [mappedX, mappedY];
        }
      }

      // Fallback: random position
      let x, y;
      do {
        x = minX + dx * voronoiMapSimulation.prng()();
        y = minY + dy * voronoiMapSimulation.prng()();
      } while (!d3.polygonContains(clippingPolygon, [x, y]));

      return [x, y];
    };

    return _random;
  }
};

export { VoronoiTreemapHelpers };
export default VoronoiTreemapHelpers;
