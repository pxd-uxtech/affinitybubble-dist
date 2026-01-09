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
export default function showVoronoiPopup(clicked, options = {}) {
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

  // === Calculate position relative to container ===
  const container = svgElement.parentElement || document.body;
  const containerRect = container.getBoundingClientRect();

  // Get the path's bounding box in SVG coordinate space
  const pathBBox = clickedPath.getBBox();

  // Calculate cell center in SVG coordinates
  const svgCenterX = pathBBox.x + pathBBox.width / 2;
  const svgCenterY = pathBBox.y + pathBBox.height / 2;

  // Convert SVG coordinates to screen coordinates
  const svgPoint = svgElement.createSVGPoint();
  svgPoint.x = svgCenterX;
  svgPoint.y = svgCenterY;
  const screenPoint = svgPoint.matrixTransform(svgElement.getScreenCTM());

  // Convert screen coordinates to container-relative coordinates
  const x = screenPoint.x - containerRect.left;
  const y = screenPoint.y - containerRect.top;

  // Determine popup direction based on available space
  // Use container-relative position for better mobile support
  const spaceAbove = y;
  const spaceBelow = containerRect.height - y;
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

  // Ensure container has relative positioning
  if (window.getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }
  container.appendChild(popup);

  // Measure size using offsetWidth/offsetHeight (synchronous)
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  // Calculate horizontal position with boundary check
  let finalX = x - popupWidth / 2;
  const padding = 10; // Minimum padding from edges

  // Keep popup within container bounds (horizontal)
  if (finalX < padding) {
    finalX = padding;
  } else if (finalX + popupWidth > containerRect.width - padding) {
    finalX = containerRect.width - popupWidth - padding;
  }

  // Calculate vertical position
  const finalY = placeBelow ? y + 5 : y - 5 - popupHeight;

  // Set final position
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
