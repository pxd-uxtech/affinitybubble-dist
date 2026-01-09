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
export function showVoronoiPopup(clickedData) {
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
export function createDOMPopup(clickedData) {
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
export function getPopupStyles() {
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
export function getBubbleStyles() {
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

export default {
  showVoronoiPopup,
  createDOMPopup,
  getPopupStyles,
  getBubbleStyles
};
