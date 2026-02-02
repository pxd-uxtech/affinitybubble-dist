/**
 * @taekie/voronoi-treemap-class
 * A reusable Voronoi treemap visualization library
 * @license MIT
 */
import * as d3Core from 'd3';
import * as d3WeightedVoronoi from 'd3-weighted-voronoi';
import * as d3VoronoiMap from 'd3-voronoi-map';
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';
import * as seedrandomModule from 'seedrandom';

/**
 * D3 Bundle Utility
 *
 * This module aggregates D3 core with voronoi extension libraries:
 * - d3 (core D3 library)
 * - d3-weighted-voronoi
 * - d3-voronoi-map
 * - d3-voronoi-treemap
 * - seedrandom
 *
 * The bundled d3 object is used throughout the library to ensure
 * all voronoi treemap methods are available on a single namespace.
 *
 * Original Observable require pattern:
 *   require("d3", "d3-weighted-voronoi", "d3-voronoi-map", "d3-voronoi-treemap", "seedrandom@2.4.3/seedrandom.min.js")
 */


/**
 * Merged D3 namespace with all voronoi treemap extensions
 * This replicates the Observable require behavior:
 *   require("d3", "d3-weighted-voronoi", "d3-voronoi-map", "d3-voronoi-treemap", "seedrandom")
 * which merges all modules into a single namespace.
 */
const d3 = Object.assign(
  {},
  d3Core,
  d3WeightedVoronoi,
  d3VoronoiMap,
  d3VoronoiTreemap
);

// Attach seedrandom for reproducible random number generation
// This allows usage like: d3.seedrandom('myseed')
d3.seedrandom = seedrandomModule.default || seedrandomModule;

/**
 * PebbleRenderer
 *
 * Renders smooth "pebble-like" outlines around voronoi treemap cells.
 * Creates rounded corner effects for depth-1 (region) and depth-2
 * (cluster) boundaries to give the treemap a polished, organic appearance.
 *
 * Features:
 * - Smooth path generation with configurable corner radius
 * - Color variation for depth-2 outlines
 * - Point simplification for cleaner paths
 */


/**
 * PebbleRenderer - Smooth outline renderer for voronoi treemaps
 *
 * This class provides methods to render smooth, rounded outlines
 * around voronoi treemap cells at different depth levels.
 */
class PebbleRenderer {
  /**
   * Create a PebbleRenderer instance
   * @param {Object} [d3Instance] - Optional D3 instance (defaults to global d3)
   */
  constructor(d3Instance) {
    this.d3 = d3Instance || d3;
  }

  /**
   * Render pebble-style outlines for a treemap SVG
   * @param {SVGElement} treemap - The SVG element containing the treemap
   * @param {number} [round=10] - Corner radius for smoothing
   * @param {number} [width=3] - Stroke width for depth-1 outlines
   * @param {Function} [colorVarFunc] - Optional color variation function
   */
  render(treemap, round = 10, width = 3, colorVarFunc) {
    const container = this.d3.select(treemap);
    const cell = container.select('g.cell');

    if (cell.empty()) {
      return;
    }

    const chartGroup = this.d3.select(cell.node().parentNode);

    chartGroup.select('.cell-outline').remove();
    chartGroup.select('.cell-outline2').remove();

    const outlineGroup = chartGroup
      .insert('g', 'g.cell + *')
      .attr('class', 'cell-outline');

    const outlineGroup2 = chartGroup
      .insert('g', 'g.cell + *')
      .attr('class', 'cell-outline')
      .attr('id', 'outline2');

    this._renderDepth2Outlines(cell, outlineGroup2, colorVarFunc);
    this._renderDepth1Outlines(cell, outlineGroup, round, width);
  }

  /**
   * Render outlines for depth-2 cells (cluster level)
   * @param {Object} cell - D3 selection of cell group
   * @param {Object} outlineGroup - D3 selection of outline group
   * @param {Function} [colorVarFunc] - Optional color variation function
   * @private
   */
  _renderDepth2Outlines(cell, outlineGroup, colorVarFunc) {
    const self = this;

    cell.selectAll('.regionArea2').each(function (datum) {
      const path = self.d3.select(this);
      const polygon = datum.polygon;

      const cellColor = colorVarFunc
        ? colorVarFunc(datum.parent.color, 0, -0.2, -0.15)
        : self._defaultColorVar(datum.parent.color, 0, -0.2, -0.15);

      path.style('stroke', cellColor);

      if (polygon && polygon.length > 0) {
        const originalPath =
          'M' + polygon.map((p) => `${p[0]},${p[1]}`).join('L') + 'Z';
        const smoothedPath = self.smoothPath(originalPath, 8, 2);

        outlineGroup
          .append('path')
          .attr('d', `${originalPath} ${smoothedPath}`)
          .attr('fill', cellColor)
          .attr('stroke', cellColor)
          .attr('stroke-width', 0)
          .style('fill-rule', 'evenodd');
      }
    });
  }

  /**
   * Render outlines for depth-1 cells (region level)
   * @param {Object} cell - D3 selection of cell group
   * @param {Object} outlineGroup - D3 selection of outline group
   * @param {number} round - Corner radius for smoothing
   * @param {number} width - Stroke width
   * @private
   */
  _renderDepth1Outlines(cell, outlineGroup, round, width) {
    const self = this;

    cell.selectAll('.regionArea1').each(function (datum) {
      const polygon = datum.polygon;

      if (polygon && polygon.length > 0) {
        const originalPath =
          'M' + polygon.map((p) => `${p[0]},${p[1]}`).join('L') + 'Z';
        const smoothedPath = self.smoothPath(originalPath, round);

        outlineGroup
          .append('path')
          .attr('d', `${originalPath} ${smoothedPath}`)
          .attr('fill', '#555')
          .attr('stroke', '#555')
          .attr('stroke-width', width)
          .style('fill-rule', 'evenodd');
      }
    });
  }

  /**
   * Generate a smoothed SVG path with rounded corners
   * @param {string} pathData - Original SVG path data (M...L...Z format)
   * @param {number} [cornerRadius=10] - Radius for corner rounding
   * @param {number} [minDistanceThreshold=0] - Minimum distance between points
   * @returns {string} Smoothed SVG path data
   */
  smoothPath(pathData, cornerRadius = 10, minDistanceThreshold = 0) {
    const rawPoints = pathData
      .replace(/[MZ]/gi, '')
      .split('L')
      .map((d) => d.trim().split(',').map(Number))
      .filter(([x, y]) => !isNaN(x) && !isNaN(y));

    if (rawPoints.length < 3) return pathData;

    let simplifiedPoints = this._simplifyPoints(rawPoints, minDistanceThreshold);

    if (simplifiedPoints.length < 3) return pathData;

    const n = simplifiedPoints.length;
    let newPath = '';

    for (let i = 0; i < n; i++) {
      const p0 = simplifiedPoints[(i - 1 + n) % n];
      const p1 = simplifiedPoints[i];
      const p2 = simplifiedPoints[(i + 1) % n];

      const vIn = { x: p0[0] - p1[0], y: p0[1] - p1[1] };
      const vOut = { x: p2[0] - p1[0], y: p2[1] - p1[1] };
      const lenIn = Math.hypot(vIn.x, vIn.y);
      const lenOut = Math.hypot(vOut.x, vOut.y);

      if (lenIn < 1e-7 || lenOut < 1e-7) continue;

      const inNorm = { x: vIn.x / lenIn, y: vIn.y / lenIn };
      const outNorm = { x: vOut.x / lenOut, y: vOut.y / lenOut };

      const dot = inNorm.x * outNorm.x + inNorm.y * outNorm.y;
      let angle = Math.acos(Math.max(-1, Math.min(1, dot)));

      const adjustedRadius =
        angle < Math.PI / 4.5 ? cornerRadius / 2 : cornerRadius;
      const halfAngle = angle / 2;
      const maxRadiusByLength = Math.min(lenIn, lenOut) / 2.1;
      const d = Math.min(
        lenIn,
        lenOut,
        adjustedRadius / Math.tan(halfAngle),
        maxRadiusByLength / Math.tan(halfAngle)
      );

      const pStart = [p1[0] + inNorm.x * d, p1[1] + inNorm.y * d];
      const pEnd = [p1[0] + outNorm.x * d, p1[1] + outNorm.y * d];

      newPath +=
        i === 0
          ? `M${pStart[0]},${pStart[1]}`
          : ` L${pStart[0]},${pStart[1]}`;
      newPath += ` Q${p1[0]},${p1[1]} ${pEnd[0]},${pEnd[1]}`;
    }

    newPath += 'Z';
    return newPath;
  }

  /**
   * Simplify polygon points by removing those too close together
   * @param {Array} rawPoints - Array of [x, y] coordinate pairs
   * @param {number} minDistanceThreshold - Minimum distance between points
   * @returns {Array} Simplified array of points
   * @private
   */
  _simplifyPoints(rawPoints, minDistanceThreshold) {
    if (minDistanceThreshold <= 0 || rawPoints.length <= 3) {
      return rawPoints;
    }

    const tempPoints = [rawPoints[0]];
    let lastPoint = rawPoints[0];

    for (let i = 1; i < rawPoints.length; i++) {
      const currentPoint = rawPoints[i];
      const dist = Math.hypot(
        currentPoint[0] - lastPoint[0],
        currentPoint[1] - lastPoint[1]
      );

      if (dist >= minDistanceThreshold) {
        tempPoints.push(currentPoint);
        lastPoint = currentPoint;
      }
    }

    const firstPoint = tempPoints[0];
    const lastAddedPoint = tempPoints[tempPoints.length - 1];
    if (lastAddedPoint !== firstPoint) {
      const dist = Math.hypot(
        firstPoint[0] - lastAddedPoint[0],
        firstPoint[1] - lastAddedPoint[1]
      );
      if (dist < minDistanceThreshold) {
        tempPoints.pop();
      }
    }

    return tempPoints.length >= 3 ? tempPoints : rawPoints;
  }

  /**
   * Generate a color variation using HSL adjustments
   * @param {string} color - Base color (any CSS color format)
   * @param {number} [h=0] - Hue adjustment
   * @param {number} [l=0] - Lightness adjustment
   * @param {number} [s=0] - Saturation adjustment
   * @returns {string} Adjusted color in hex format
   * @private
   */
  _defaultColorVar(color, h = 0, l = 0, s = 0) {
    let c = this.d3.hsl(color);
    c.h += h;
    c.l += l;
    c.s += s;
    if (c.l > 0.95) c.l = 0.95;
    return c.formatHex();
  }
}

/**
 * LabelAdjuster
 *
 * Handles automatic label collision detection and position adjustment
 * for voronoi treemap visualizations. Adjusts label positions to prevent
 * overlapping between:
 * - Field labels and region labels
 * - Sector labels and field labels
 *
 * Uses setTimeout-based deferred processing to ensure DOM elements
 * are fully rendered before measuring and adjusting positions.
 */


/**
 * LabelAdjuster - Label collision detection and adjustment
 *
 * This class provides methods to automatically adjust label positions
 * in voronoi treemaps to prevent overlapping text elements.
 */
class LabelAdjuster {
  /**
   * Create a LabelAdjuster instance
   * @param {Object} [d3Instance] - Optional D3 instance (defaults to global d3)
   */
  constructor(d3Instance) {
    this.d3 = d3Instance || d3;
  }

  /**
   * Adjust label positions in a treemap SVG to prevent overlapping
   * @param {SVGElement} treemap - The SVG element containing the treemap
   * @param {Object} [options={}] - Adjustment options
   * @param {number} [options.verticalSpacing=0] - Additional vertical spacing between labels
   * @param {number} [options.delay=100] - Delay in ms before adjustment (for DOM rendering)
   */
  adjust(treemap, options = {}) {
    const { verticalSpacing = 0, delay = 100 } = options;
    const d3 = this.d3;

    setTimeout(() => {
      const svg = d3.select(treemap);

      svg.selectAll(".field").each(function () {
        adjustFieldLabel(d3.select(this));
      });

      svg.selectAll(".sector").each(function () {
        adjustSectorLabel(d3.select(this));
      });
    }, delay);

    /**
     * Parse SVG transform attribute to extract x, y translation
     * @param {string} transform - Transform attribute string
     * @returns {Object} { x, y } translation values
     */
    function parseTransform(transform) {
      if (!transform) return { x: 0, y: 0 };
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (!match) return { x: 0, y: 0 };
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }

    /**
     * Check if two bounding boxes overlap
     * @param {Object} box1 - First bounding box
     * @param {Object} box2 - Second bounding box
     * @returns {boolean} True if boxes overlap
     */
    function checkOverlap(box1, box2) {
      const margin = verticalSpacing / 2;
      const marginx = -3;
      return !(
        box1.x + box1.width / 2 + marginx < box2.x - box2.width / 2 ||
        box1.x - box1.width / 2 - marginx > box2.x + box2.width / 2 ||
        box1.y + box1.height / 2 + margin < box2.y - box2.height / 2 ||
        box1.y - box1.height / 2 - margin > box2.y + box2.height / 2
      );
    }

    /**
     * Calculate required vertical move distance to resolve overlap
     * @param {Object} box1 - First bounding box
     * @param {Object} box2 - Second bounding box
     * @returns {number} Required move distance
     */
    function getRequiredMoveDistance(box1, box2) {
      const margin = verticalSpacing / 2;
      const box1Top = box1.y - box1.height / 2 - margin;
      const box1Bottom = box1.y + box1.height / 2 + margin;
      const box2Top = box2.y - box2.height / 2 - margin;
      const box2Bottom = box2.y + box2.height / 2 + margin;

      if (box1Bottom <= box2Top || box1Top >= box2Bottom) return 0;
      if (box1.y < box2.y) return box1Bottom - box2Top;
      return box2Bottom - box1Top;
    }

    /**
     * Get bounding box information for a label element
     * @param {Object} element - D3 selection of label element
     * @returns {Object|null} Bounding box info or null if element invalid
     */
    function getLabelBox(element) {
      const node = element.node();
      if (!node) return null;

      const bbox = node.getBBox();
      let { width, height } = bbox;
      const tspanCount = element.selectAll("tspan tspan").size() || 1;
      const transform = parseTransform(element.attr("transform"));

      return {
        originalX: transform.x,
        originalY: transform.y,
        x: transform.x + width / 2,
        y: transform.y + height / 2,
        width,
        height,
        tspanCount
      };
    }

    /**
     * Get cell polygon bounds from node data
     * @param {Object} data - Node data with polygon
     * @returns {Object|null} { minX, maxX, minY, maxY } or null
     */
    function getCellBounds(data) {
      if (!data || !data.polygon) return null;
      const xs = data.polygon.map((p) => p[0]);
      const ys = data.polygon.map((p) => p[1]);
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
      };
    }

    /**
     * Calculate minimum move position to avoid overlap
     * @param {Object} labelBox - Label bounding box
     * @param {Object} parentBox - Parent label bounding box
     * @param {Object} cellBounds - Cell polygon bounds
     * @returns {Object} { x, y } new position
     */
    function findMinimumMove(labelBox, parentBox, cellBounds) {
      if (
        labelBox.x + labelBox.width / 2 < parentBox.x - parentBox.width / 2 ||
        labelBox.x - labelBox.width / 2 > parentBox.x + parentBox.width / 2
      ) {
        return { x: labelBox.originalX, y: labelBox.originalY };
      }

      const moveDistance = getRequiredMoveDistance(labelBox, parentBox);
      if (moveDistance === 0) {
        return { x: labelBox.originalX, y: labelBox.originalY };
      }

      const originallyAbove = labelBox.y < parentBox.y;
      let newY = labelBox.y;

      if (originallyAbove) {
        const proposedY =
          parentBox.originalY -
          labelBox.height +
          (labelBox.tspanCount > 1
            ? labelBox.height / (labelBox.tspanCount - 1) / 4
            : 0);
        if (proposedY >= cellBounds.minY) newY = proposedY;
      } else {
        const proposedY =
          parentBox.originalY +
          parentBox.height +
          (labelBox.tspanCount > 1
            ? labelBox.height / (labelBox.tspanCount - 1) / 4
            : 0);
        if (proposedY + labelBox.height <= cellBounds.maxY) newY = proposedY;
      }

      return { x: labelBox.originalX, y: newY };
    }

    /**
     * Adjust sector label position if overlapping with parent field label
     * @param {Object} sectorLabel - D3 selection of sector label
     */
    function adjustSectorLabel(sectorLabel) {
      const data = sectorLabel.datum();
      if (!data || !data.parent) return;

      const parentFieldElement = d3
        .select(treemap)
        .selectAll(".field")
        .filter((d) => d?.data?.key === data.parent?.data?.key)
        .nodes()[0];

      if (!parentFieldElement) return;

      const fieldLabel = d3.select(parentFieldElement);
      const sectorBox = getLabelBox(sectorLabel);
      const fieldBox = getLabelBox(fieldLabel);
      const cellBounds = getCellBounds(data);

      if (
        !cellBounds ||
        !sectorBox ||
        !fieldBox ||
        sectorBox.width === 0 ||
        sectorBox.height === 0 ||
        fieldBox.width === 0 ||
        fieldBox.height === 0
      ) {
        return;
      }

      if (checkOverlap(sectorBox, fieldBox)) {
        const newPos = findMinimumMove(sectorBox, fieldBox, cellBounds);
        sectorLabel.attr("transform", `translate(${newPos.x},${newPos.y})`);
      }
    }

    /**
     * Adjust field label position if overlapping with parent region label
     * @param {Object} fieldLabel - D3 selection of field label
     */
    function adjustFieldLabel(fieldLabel) {
      const data = fieldLabel.datum();
      if (!data || !data.parent) return;

      const parentRegionElement = d3
        .select(treemap)
        .selectAll(".region")
        .filter((d) => d?.data?.key === data.parent?.data?.key)
        .nodes()[0];

      if (!parentRegionElement) return;

      const regionLabel = d3.select(parentRegionElement);
      const fieldBox = getLabelBox(fieldLabel);
      const regionBox = getLabelBox(regionLabel);
      const cellBounds = getCellBounds(data);

      if (
        !cellBounds ||
        !fieldBox ||
        !regionBox ||
        fieldBox.width === 0 ||
        fieldBox.height === 0 ||
        regionBox.width === 0 ||
        regionBox.height === 0
      ) {
        return;
      }

      const regionKey = regionLabel.datum()?.data?.key;
      if (
        regionKey &&
        String(regionKey).match(/[^ ]/) &&
        checkOverlap(fieldBox, regionBox)
      ) {
        const newPos = findMinimumMove(fieldBox, regionBox, cellBounds);
        fieldLabel.attr("transform", `translate(${newPos.x},${newPos.y})`);
      }
    }
  }
}

/**
 * Nesting For Voronoi Utility
 *
 * Transforms flat data into a nested hierarchical structure suitable
 * for d3.hierarchy() and voronoi treemap visualization.
 *
 * Creates a 3-level hierarchy: root -> region -> bigCluster -> cluster
 * Each leaf node contains size values for sizing and references to original data.
 */


/**
 * Convert flat data array into nested hierarchy structure for voronoi treemap
 *
 * @param {Object[]} data - Array of data objects with region, bigClusterLabel, clusterLabel, and bubbleSize fields
 * @param {string} [key1='bigClusterLabel'] - Field name for first level grouping (big cluster)
 * @param {string} [key2='clusterLabel'] - Field name for second level grouping (cluster)
 * @returns {Object} Nested hierarchy object with key/values structure for d3.hierarchy
 *
 * @example
 * const data = [
 *   { region: 'A', bigClusterLabel: 'Group1', clusterLabel: 'Item1', bubbleSize: 10 },
 *   { region: 'A', bigClusterLabel: 'Group1', clusterLabel: 'Item2', bubbleSize: 20 }
 * ];
 * const nested = nestingForVoronoi(data);
 * const hierarchy = d3.hierarchy(nested, d => d.values).sum(d => d.size);
 */
function nestingForVoronoi(
  data,
  key1 = "bigClusterLabel",
  key2 = "clusterLabel"
) {
  // 1. Extract only necessary fields
  const simpleData = data.map((d) => ({
    [key1]: d[key1],
    [key2]: d[key2],
    region: d.region,
    size: d.bubbleSize ?? 1
  }));

  // 2. 3-level grouping with d3.rollups: region -> key1 -> key2
  const nested = d3.rollups(
    simpleData,
    (d) => d3.sum(d.map((v) => v.size)),
    (d) => d.region,
    (d) => d[key1],
    (d) => d[key2]
  );

  // 3. Helper to convert to dictionary format
  const makeDictionary = (bc, bcData, region) => {
    return bcData.map((k) => {
      const item = {
        [key1]: bc,
        [key2]: k[0],
        size: k[1] ? k[1] : 1
      };

      const originalData = data.filter(
        (c) =>
          c.region === region &&
          c[key1] === item[key1] &&
          c[key2] === item[key2]
      );

      return {
        key: k[0],
        values: [item],
        data: originalData[0],
        raw: originalData
      };
    });
  };

  // 4. Generate final hierarchical structure
  const kv = nested.map(([region, regionData]) => ({
    key: region,
    values: regionData.map(([bc, bcData]) => ({
      key: bc,
      values: makeDictionary(bc, bcData, region)
    }))
  }));

  return {
    key: "root_nest",
    values: kv.filter((d) => d.key)
  };
}

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
    if (d.depth === 1) return [0, 0];
    if (!d.parent?.polygon?.site || !d.polygon?.site) return [0, 0];
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
    if (!d.polygon?.site?.originalObject?.polygon) return 0;
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
      centerX: d.polygon?.site?.x ?? 0,
      centerY: d.polygon?.site?.y ?? 0,
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
          if (cp.site?.originalObject?.data?.originalData) {
            recurse(cp, cp.site.originalObject.data.originalData);
          }
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
      getCellColors: null, // (cellColors) => void - Callback to receive actual cell colors
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

    this.hierarchy = d3.hierarchy(nested, (d) => d.values).sum((d) => d.size);

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
    // Calculate total size (bubbleSize) per region
    const regionSizes = d3.rollup(
      this.data,
      (v) => d3.sum(v, (d) => parseFloat(d.bubbleSize) || 1),
      (d) => d.region
    );

    // Sort regions by size (descending - largest first)
    const sortedRegions = Array.from(regionSizes.entries())
      .sort((a, b) => b[1] - a[1]) // b[1] - a[1]: descending order
      .map((d) => d[0]); // Extract region names

    const { regionColors, colors: paletteColors } = this.params;
    const customColorMap = new Map(regionColors.map((d) => [d.key, d.color]));

    let colorMapping = {};

    // Assign colors to sorted regions (largest region gets first color)
    sortedRegions.forEach((key, i) => {
      colorMapping[key] = paletteColors[i % paletteColors.length];
    });

    // Override with custom region colors if specified
    customColorMap.forEach((color, key) => {
      colorMapping[key] = color;
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

    // Extract and provide cell colors if callback is provided
    if (this.params.getCellColors) {
      const cellColors = this._extractCellColors();
      this.params.getCellColors(cellColors);
    }
  }

  /**
   * Extract cell colors from hierarchy nodes
   * @returns {Array} Array of {depth, key, color} objects
   * @private
   */
  _extractCellColors() {
    const cellColors = [];

    this.hierarchy.descendants().forEach(node => {
      if (node.depth > 0) { // Skip root node (depth 0)
        cellColors.push({
          depth: node.depth,
          key: node.data.key,
          color: node.color
        });
      }
    });

    return cellColors;
  }

  _normalizePositions(regionPositions) {
    const result = [];
    const hierarchyNodes = this.hierarchy.descendants();

    // Helper: Add jitter to duplicate positions to prevent voronoi algorithm failure
    const addJitterForDuplicates = (positions, jitterAmount = 0.02) => {
      const positionMap = new Map(); // key: "x,y" -> count

      positions.forEach((pos) => {
        const key = `${pos.x.toFixed(6)},${pos.y.toFixed(6)}`;
        const count = positionMap.get(key) || 0;

        if (count > 0) {
          // Add jitter for duplicate positions (spread in a circle)
          const angle = (count * 2.4) % (2 * Math.PI); // Golden angle for even distribution
          const jitter = jitterAmount * Math.sqrt(count);
          pos.x = Math.max(0.05, Math.min(0.95, pos.x + jitter * Math.cos(angle)));
          pos.y = Math.max(0.05, Math.min(0.95, pos.y + jitter * Math.sin(angle)));
        }

        positionMap.set(key, count + 1);
      });

      return positions;
    };

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

      const depth1Normalized = depth1.map((pos) => ({
        ...pos,
        x: xScale(pos.x),
        y: yScale(pos.y)
      }));

      // Add jitter for any duplicate positions
      addJitterForDuplicates(depth1Normalized);
      result.push(...depth1Normalized);
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

        const siblingNormalized = siblingPositions.map((pos) => ({
          ...pos,
          x: xScale(pos.x),
          y: yScale(pos.y)
        }));

        // Add jitter for any duplicate positions within siblings
        addJitterForDuplicates(siblingNormalized);
        result.push(...siblingNormalized);
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
          if (!d.polygon?.site) return 0;
          const bounds = VoronoiTreemapHelpers.getPolygonBounds(d.polygon);
          const width = bounds.maxX - bounds.minX;
          return d.polygon.site.x - (width * 0.6) / 2;
        })
        .attr(
          "y",
          (d) => {
            if (!d.polygon?.site) return 0;
            return d.polygon.site.y -
              VoronoiTreemapHelpers.estimateLabelHeight(this, d, 1.3) * 0.4 +
              VoronoiTreemapHelpers.getLabelHeightOffset(this, d);
          }
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
          (d) => {
            if (!d.polygon?.site) return `translate(0,0)`;
            return `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiTreemapHelpers.getLabelHeightOffset(this, d)
            ]})`;
          }
        )
        .html((d) => VoronoiTreemapHelpers.multiline(d.data.key));
    }
  }

  _drawBigClusterLabels() {
    const { ratioLimit, bigClusterLabelRenderer } = this.params;

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
          if (!d.polygon?.site) return 0;
          const bounds = VoronoiTreemapHelpers.getPolygonBounds(d.polygon);
          const width = bounds.maxX - bounds.minX;
          return d.polygon.site.x - (width * 0.6) / 2;
        })
        .attr(
          "y",
          (d) => {
            if (!d.polygon?.site) return 0;
            return d.polygon.site.y -
              VoronoiTreemapHelpers.estimateLabelHeight(this, d, 1.2) * 0.45 +
              VoronoiTreemapHelpers.getLabelHeightOffset(this, d);
          }
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
          (d) => {
            if (!d.polygon?.site) return `translate(0,0)`;
            return `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiTreemapHelpers.getLabelHeightOffset(this, d)
            ]})`;
          }
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
        (d) => {
          if (!d.polygon?.site) return `translate(0,0)`;
          return `translate(${[
            d.polygon.site.x,
            d.polygon.site.y +
              VoronoiTreemapHelpers.fontScale(this.hierarchy, d) *
                8 *
                (VoronoiTreemapHelpers.multiline(d.data.key, true)[1] + 2.2)
          ]})`;
        }
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
        if (!d.polygon?.site) return `translate(0,0)`;
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
        (d) => {
          if (!d.polygon?.site) return `translate(0,0)`;
          return `translate(${[
            d.polygon.site.x,
            d.polygon.site.y + VoronoiTreemapHelpers.varFontScale(this, d)
          ]})`;
        }
      )
      .text((d) => VoronoiTreemapHelpers.bigFormat(d.data.values[0].size))
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

/**
 * PopupHelpers
 *
 * Helper functions for creating popup displays when cells are clicked.
 * These are optional utilities that can be used with the clickFunc option.
 */

/**
 * Default popup function for Observable notebooks
 * Returns an HTML element that displays information about the clicked cell
 *
 * @param {Object} clickedData - The data object passed from the click event
 * @param {Object} clickedData.data - The data associated with the clicked cell
 * @param {Event} clickedData.event - The original click event
 * @returns {HTMLElement|null} HTML element for Observable to display, or null if no data
 *
 * @example
 * // In Observable notebook
 * import { VoronoiTreemap, showVoronoiPopup } from "..."
 *
 * chart = {
 *   const treemap = new VoronoiTreemap();
 *   return treemap.render(data, {
 *     clickFunc: showVoronoiPopup
 *   });
 * }
 */
function showVoronoiPopup$1(clickedData) {
  if (!clickedData) return null;

  const data = clickedData.data || {};

  // This uses Observable's html template literal
  // For non-Observable environments, use createDOMPopup instead
  if (typeof html !== 'undefined') {
    return html`<div style="
      background: #fffe;
      border: 2px solid #555;
      border-radius: 15px;
      padding: 15px;
      max-width: 350px;
      min-width: 200px;
    ">
      <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em;">
        ${data.bigClusterLabel || 'N/A'}
      </div>
      <div style="margin-bottom: 0.3em;">
        <strong>Region:</strong> ${data.region || 'N/A'}
      </div>
      <div>
        <strong>Size:</strong> ${data.bubbleSize || 'N/A'}
      </div>
    </div>`;
  }

  // Fallback for non-Observable environments
  return createDOMPopup(clickedData);
}

/**
 * Create a DOM-based popup for standard web pages (non-Observable)
 * This creates an absolutely positioned popup at the click location
 *
 * @param {Object} clickedData - The data object passed from the click event
 * @param {Object} clickedData.data - The data associated with the clicked cell
 * @param {Event} clickedData.event - The original click event
 * @returns {HTMLElement|null} DOM element to be appended to the page
 *
 * @example
 * // In standard HTML/JavaScript
 * const treemap = new VoronoiTreemap();
 * const svg = treemap.render(data, {
 *   clickFunc: createDOMPopup
 * });
 */
function createDOMPopup(clickedData) {
  // Remove existing popup
  const existingPopup = document.querySelector('.voronoi-popup-content');
  if (existingPopup) existingPopup.remove();

  if (!clickedData) {
    return null;
  }

  const event = clickedData.event;
  const data = clickedData.data || {};

  // Create popup
  const popup = document.createElement('div');
  popup.className = 'voronoi-popup-content';

  // Position at click location
  const x = event.pageX;
  const y = event.pageY;
  popup.style.left = x + 'px';
  popup.style.top = y + 'px';

  // Create popup content
  const content = document.createElement('div');
  content.className = 'voronoi-popup-message';
  content.innerHTML = `
    <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em;">
      ${data.bigClusterLabel || 'N/A'}
    </div>
    <div style="margin-bottom: 0.3em;">
      <strong>Region:</strong> ${data.region || 'N/A'}
    </div>
    <div>
      <strong>Size:</strong> ${data.bubbleSize || 'N/A'}
    </div>
  `;

  popup.appendChild(content);
  document.body.appendChild(popup);

  // Close on click outside
  setTimeout(() => {
    const closeHandler = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 0);

  return popup;
}

/**
 * Get the recommended CSS styles for popups
 * Returns a string of CSS that can be added to your page
 *
 * @returns {string} CSS string for popup styles
 *
 * @example
 * // In Observable
 * html`<style>${getPopupStyles()}</style>`
 *
 * @example
 * // In standard HTML
 * const style = document.createElement('style');
 * style.textContent = getPopupStyles();
 * document.head.appendChild(style);
 */
function getPopupStyles() {
  return `
.voronoi-popup-content {
  position: absolute;
  background: #fffe;
  border: 2px solid #555;
  border-radius: 30px;
  padding: 10px;
  z-index: 1000000;
  transform: translateX(-50%) translateY(-100%);
  min-width: 100px;
}

.voronoi-popup-content::before {
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -10px;
  border-width: 10px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.voronoi-popup-content::after {
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -8px;
  border-width: 8px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

.voronoi-popup-message {
  max-width: 350px;
  min-width: 200px;
  padding: 1em;
  line-height: 1.5;
  color: #444;
  text-align: left;
  max-height: 400px;
  overflow-y: scroll;
  overflow-x: clip;
}
`;
}

/**
 * Get comprehensive CSS styles for bubble/voronoi visualizations
 * Returns a string of CSS including fonts, regions, areas, labels, and popups
 *
 * @returns {string} CSS string for all bubble styles
 *
 * @example
 * // In Observable
 * html`<style>${getBubbleStyles()}</style>`
 *
 * @example
 * // In standard HTML
 * const style = document.createElement('style');
 * style.textContent = getBubbleStyles();
 * document.head.appendChild(style);
 */
function getBubbleStyles() {
  return `
@font-face {
    font-family: 'KoddiUD OnGothic';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/KoddiUDOnGothic-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'KoddiUDOnGothic-Bold';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/KoddiUDOnGothic-Bold.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

body {
    font-family: "KoddiUD OnGothic", sans-serif;
}

.caption {
    color: #888;
}

.region {
    font-family: "KoddiUDOnGothic-Bold", "KoddiUD OnGothic", sans-serif;
    fill: #fff;
    fill-opacity: 1;
    font-weight: 700;
    stroke-width: 3px;
    pointer-events: none;
}

.area1 {
    stroke: #464749aa;
    stroke-width: 2;
}

.area2 {
    stroke: #ffffffb0;
    stroke-width: 0.5;
}

.area2.highlite {
    filter: hue-rotate(-5deg) brightness(0.95);
}

.area2.clicked {
    stroke: #000;
    stroke-width: 3px;
    filter: brightness(0.9);
}

.regionArea1 {
    stroke: #464749aa;
    stroke-width: 1.5;
}

.regionArea2 {
    stroke: #46474955;
    stroke-width: 0.7;
}

.regionArea3 {
    stroke: #ffffffb0;
    stroke-width: 0.5;
    cursor: pointer;
}

.regionArea3.clicked {
    stroke-width: 1px;
    filter: hue-rotate(-5deg) brightness(0.9);
}

.regionArea3.highlite {
    filter: hue-rotate(-5deg) brightness(0.95);
}

.field {
    font-size: 1.2em;
    font-weight: 600;
    fill: #000d;
    pointer-events: none;
}

.sector {
    font-size: 0.8em;
    font-weight: 400;
    fill: #a95b5bdd;
    cursor: default;
    pointer-events: none;
}

.budget {
    fill: #c25a50;
    font-size: 12px;
    cursor: default;
    pointer-events: none;
}

.percent .budget {
    fill: #fff;
}

.bubblepopup {
    max-width: 350px;
    min-width: 200px;
    padding: 1em;
    line-height: 1.5;
    color: #444;
    text-align: left;
    max-height: 400px;
    overflow: scroll;
}

.voronoi-popup-content {
    position: absolute;
    background: #fffe;
    border: 2px solid #555;
    border-radius: 30px;
    padding: 10px;
    z-index: 1000000;
    transform: translateX(-50%) translateY(-100%);
    min-width: 100px;
}

.voronoi-popup-content::before {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
}

.voronoi-popup-content::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: #fff transparent transparent transparent;
}

.voronoi-popup-message {
    max-width: 350px;
    min-width: 200px;
    padding: 1em;
    line-height: 1.5;
    color: #444;
    text-align: left;
    max-height: 400px;
    overflow-y: scroll;
    overflow-x: clip;
}
`;
}

/**
 * Voronoi Popup Utility
 *
 * Displays a popup/tooltip for clicked voronoi cells.
 * Handles positioning, template formatting, and cleanup.
 */

/**
 * Show a popup for a clicked voronoi cell
 *
 * @param {Object} clicked - The clicked cell data object
 * @param {Object} clicked.clickArea - D3 selection of the clicked path
 * @param {string} clicked.key - The key/label of the clicked cell
 * @param {Object} [clicked.data] - Additional data associated with the cell
 * @param {Object} [options] - Popup configuration options
 * @param {string} [options.format="{text}"] - Template string for popup content (e.g., "{key}: {value}")
 * @param {string} [options.popupId="voronoi-popup"] - DOM ID for the popup element
 * @param {string} [options.className="voronoi-popup-container"] - CSS class for the popup
 * @param {Function} [options.onClose] - Callback function when popup is closed
 * @returns {HTMLElement|undefined} The created popup element, or undefined if no popup was created
 */
function showVoronoiPopup(clicked, options = {}) {
  const {
    format = "{text}",
    popupId = "voronoi-popup",
    className = "voronoi-popup-container",
    onClose = null
  } = options;

  // Remove existing popup
  const existingPopup = document.getElementById(popupId);
  if (existingPopup) existingPopup.remove();

  // Exit if no clicked data
  if (!clicked || !clicked.clickArea) {
    if (onClose) onClose();
    return;
  }

  const clickedPath = clicked.clickArea.node();
  const svgElement = clickedPath.ownerSVGElement;
  if (!svgElement) return;

  // === Calculate position in page coordinates (unaffected by container zoom) ===
  // Get the path's bounding box in SVG coordinate space
  const pathBBox = clickedPath.getBBox();

  // Calculate cell center in SVG coordinates
  const svgCenterX = pathBBox.x + pathBBox.width / 2;
  const svgCenterY = pathBBox.y + pathBBox.height / 2;

  // Convert SVG coordinates to screen (page) coordinates
  // This handles all transformations including zoom, scale, translate
  const svgPoint = svgElement.createSVGPoint();
  svgPoint.x = svgCenterX;
  svgPoint.y = svgCenterY;
  const screenPoint = svgPoint.matrixTransform(svgElement.getScreenCTM());

  // Use screen coordinates directly (relative to viewport)
  const x = screenPoint.x + window.scrollX;
  const y = screenPoint.y + window.scrollY;

  // Determine popup direction based on available space
  const spaceAbove = screenPoint.y;
  const spaceBelow = window.innerHeight - screenPoint.y;
  const placeBelow = spaceAbove < 150 || spaceBelow > spaceAbove;

  // === Template substitution ===
  const data = {
    key: clicked.key,
    ...(clicked.data || {}),
    ...(clicked.data?.data || {}),
    ...(clicked.d?.data?.data || {})
  };

  let content = format
    .replace(/\{(\w+)\}/g, (match, field) => {
      const val = data[field];
      return val !== undefined && val !== null ? String(val) : match;
    })
    .replace(/\\n/g, "<br>")
    .replace(/\n/g, "<br>");

  // === Create popup ===
  const popup = document.createElement("div");
  popup.id = popupId;
  popup.className = className;

  Object.assign(popup.style, {
    position: "absolute",
    left: "-9999px", // Render off-screen for size measurement
    top: "0px",
    zIndex: "1000"
  });
  popup.classList.add(placeBelow ? "popup-below" : "popup-above");

  popup.innerHTML = `<div class="voronoi-popup-content">
    <div class="voronoi-popup-message">${content}</div>
  </div>`;

  // Append to body (not container) to avoid zoom/transform effects
  document.body.appendChild(popup);

  // Measure size using offsetWidth/offsetHeight (synchronous)
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  // Calculate horizontal position with boundary check
  let finalX = x - popupWidth / 2;
  const padding = 10; // Minimum padding from edges

  // Keep popup within viewport bounds (horizontal)
  if (finalX < padding) {
    finalX = padding;
  } else if (finalX + popupWidth > window.innerWidth - padding) {
    finalX = window.innerWidth - popupWidth - padding;
  }

  // Calculate vertical position
  const finalY = placeBelow ? y + 5 : y - 5 - popupHeight;

  // Set final position (fixed to page, not container)
  popup.style.left = `${finalX}px`;
  popup.style.top = `${finalY}px`;

  // === Outside click/touch handler (mobile-friendly) ===
  const handler = (e) => {
    if (!popup.contains(e.target) && !svgElement.contains(e.target)) {
      popup.remove();
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      const clickedCell = svgElement.querySelector("path.clicked");
      if (clickedCell) clickedCell.classList.remove("clicked");
      if (onClose) onClose();
    }
  };
  setTimeout(() => {
    document.addEventListener("click", handler);
    document.addEventListener("touchstart", handler); // Mobile support
  }, 10);

  return popup;
}

/**
 * Voronoi Treemap Library
 * Main entry point - exports VoronoiTreemap as default and helpers as named exports
 *
 * This module will be the public API surface for the library.
 * Consumers can import like:
 *   import VoronoiTreemap from '@taekie/voronoi-treemap-class';
 *   import { VoronoiTreemap, nestingForVoronoi, VoronoiTreemapHelpers } from '@taekie/voronoi-treemap-class';
 *   import { showVoronoiPopup, createDOMPopup } from '@taekie/voronoi-treemap-class';
 */

export { LabelAdjuster, PebbleRenderer, VoronoiTreemap, VoronoiTreemapHelpers, createDOMPopup, VoronoiTreemap as default, getBubbleStyles, getPopupStyles, nestingForVoronoi, showVoronoiPopup, showVoronoiPopup$1 as showVoronoiPopupLegacy };
//# sourceMappingURL=voronoi-treemap.esm.js.map
