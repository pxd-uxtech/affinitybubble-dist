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

import d3 from './utils/d3-bundle.js';

/**
 * PebbleRenderer - Smooth outline renderer for voronoi treemaps
 *
 * This class provides methods to render smooth, rounded outlines
 * around voronoi treemap cells at different depth levels.
 */
export class PebbleRenderer {
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

export default PebbleRenderer;
