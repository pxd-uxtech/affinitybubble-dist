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

// Main class
import VoronoiTreemap from './VoronoiTreemap.js';

// Helper utilities
import nestingForVoronoi from './nestingForVoronoi.js';
import VoronoiTreemapHelpers from './VoronoiTreemapHelpers.js';
import LabelAdjuster from './LabelAdjuster.js';
import PebbleRenderer from './PebbleRenderer.js';

// Popup helpers
import {
  showVoronoiPopup as showVoronoiPopupHelper,
  createDOMPopup,
  getPopupStyles,
  getBubbleStyles
} from './PopupHelpers.js';

// Utility popup function (newer implementation)
import showVoronoiPopup from './utils/showVoronoiPopup.js';

// Default export - the main VoronoiTreemap class
export default VoronoiTreemap;

// Named exports for helper utilities
export {
  VoronoiTreemap,
  nestingForVoronoi,
  VoronoiTreemapHelpers,
  LabelAdjuster,
  PebbleRenderer,
  showVoronoiPopup,        // Primary popup function (from utils)
  showVoronoiPopupHelper,  // Legacy popup function (from PopupHelpers)
  createDOMPopup,
  getPopupStyles,
  getBubbleStyles
};
