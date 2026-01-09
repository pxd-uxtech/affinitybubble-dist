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

import d3 from './utils/d3-bundle.js';

/**
 * LabelAdjuster - Label collision detection and adjustment
 *
 * This class provides methods to automatically adjust label positions
 * in voronoi treemaps to prevent overlapping text elements.
 */
export class LabelAdjuster {
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

export default LabelAdjuster;
