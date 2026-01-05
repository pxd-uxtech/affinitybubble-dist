# Voronoi Treemap Library - Distribution Files

Interactive Voronoi treemap visualization library converted from Observable notebook.

## CDN Usage (jsdelivr)

### ES Module (Recommended)

```javascript
import VoronoiTreemap from 'https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@1.0.0/dist/voronoi-treemap.esm.js';

const treemap = new VoronoiTreemap();
const svg = treemap.render(data, options);
```

### UMD Bundle

```html
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-weighted-voronoi@1"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-voronoi-map@2"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-voronoi-treemap@1"></script>
<script src="https://cdn.jsdelivr.net/npm/seedrandom@3"></script>
<script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@1.0.0/dist/voronoi-treemap.umd.js"></script>

<script>
  const treemap = new VoronoiTreemap.VoronoiTreemap();
  const svg = treemap.render(data, options);
</script>
```

### Minified Version

```html
<script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@1.0.0/dist/voronoi-treemap.min.js"></script>
```

## Observable Usage

### Recommended: Standalone Bundle - 760KB

For Observable notebooks, use the standalone bundle that includes all dependencies. While larger in file size, it's the simplest and most reliable option for Observable's module system.

```javascript
// Cell 1: Import library with popup helpers
{
  const module = await import("https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@1.0.3/dist/voronoi-treemap.standalone.js");
  VoronoiTreemap = module.VoronoiTreemap;
  showVoronoiPopup = module.showVoronoiPopup;  // Import popup helper from library
  return module;
}
```

```javascript
// Cell 2: Create visualization with popup
chart = {
  const data = [
    { region: "A", bigClusterLabel: "Item 1", bubbleSize: "100" },
    { region: "A", bigClusterLabel: "Item 2", bubbleSize: "80" },
    { region: "B", bigClusterLabel: "Item 3", bubbleSize: "120" }
  ];

  const treemap = new VoronoiTreemap();

  return treemap.render(data, {
    width: 900,
    height: 600,
    maptitle: 'My Treemap',
    regionPositions: 'auto',
    showRegion: true,
    showLabel: true,
    showPercent: true,
    pebble: true,
    pebbleRound: 5,
    pebbleWidth: 2,
    clickFunc: showVoronoiPopup  // Use the imported popup helper
  });
}
```

**Note**: The standalone bundle (760KB) includes all D3 dependencies bundled together. Observable caches imported modules efficiently, so the file is only loaded once per notebook session.

## Data Format

```javascript
[
  {
    region: "Region Name",           // Top-level grouping
    bigClusterLabel: "Cluster Name", // Label for this item
    bubbleSize: "100"                // Size value (string or number)
  }
]
```

## Configuration Options

```javascript
{
  width: 900,              // Canvas width
  height: 600,             // Canvas height
  maptitle: 'Title',       // Main title
  mapcaption: 'Caption',   // Subtitle
  regionPositions: 'auto', // Region positioning
  showRegion: true,        // Show region labels
  showLabel: true,         // Show cluster labels
  showPercent: true,       // Show percentage labels
  pebble: true,            // Enable pebble rendering
  pebbleRound: 5,          // Corner rounding
  pebbleWidth: 2,          // Pebble stroke width
  clickFunc: function(d) { // Click handler (receives {data, event})
    console.log('Clicked:', d);
  }
}
```

## Popup Helper Functions

The library includes built-in popup helper functions that you can use with `clickFunc`:

### `showVoronoiPopup(clickedData)`

Default popup function for Observable notebooks. Returns an HTML element using Observable's `html` template literal.

```javascript
// Observable usage
import { VoronoiTreemap, showVoronoiPopup } from "..."

const treemap = new VoronoiTreemap();
treemap.render(data, {
  clickFunc: showVoronoiPopup
});
```

### `createDOMPopup(clickedData)`

DOM-based popup for standard web pages. Creates an absolutely positioned popup at the click location.

```javascript
// Standard HTML/JavaScript usage
import { VoronoiTreemap, createDOMPopup } from "..."

const treemap = new VoronoiTreemap();
treemap.render(data, {
  clickFunc: createDOMPopup
});
```

### `getPopupStyles()`

Returns CSS styles for the popup elements as a string.

```javascript
// Observable
html`<style>${getPopupStyles()}</style>`

// Standard HTML
const style = document.createElement('style');
style.textContent = getPopupStyles();
document.head.appendChild(style);
```

## Recommended CSS

```css
@font-face {
  font-family: 'KoddiUD OnGothic';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/KoddiUDOnGothic-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.region {
  font-family: "KoddiUD OnGothic", sans-serif;
  fill: #fff;
  fill-opacity: 1;
  font-weight: 700;
}

.area2.highlite {
  filter: hue-rotate(-5deg) brightness(0.95);
}

.area2.clicked {
  stroke: #000;
  stroke-width: 3px;
  filter: brightness(0.9);
}
```

## Files

- `dist/voronoi-treemap.standalone.js` - Standalone ESM bundle with all dependencies (760KB) - **Use this for Observable**
- `dist/voronoi-treemap.esm.js` - ES Module bundle with external dependencies (68KB) - For npm/build tools
- `dist/voronoi-treemap.umd.js` - UMD bundle with external dependencies (74KB) - For browsers with script tags
- `dist/voronoi-treemap.min.js` - Minified UMD bundle (26KB) - For production
- Source maps included for all bundles

## Dependencies

The ESM and UMD bundles have peer dependencies (must be loaded separately):
- d3 (^7.0.0)
- d3-weighted-voronoi (^1.0.0)
- d3-voronoi-map (^2.0.0)
- d3-voronoi-treemap (^1.0.0)
- seedrandom (^3.0.0)

The standalone bundle includes all dependencies pre-bundled.

## Version History

### 1.0.3 (2026-01-06)
- Added built-in popup helper functions
- `showVoronoiPopup()` - Observable-compatible popup
- `createDOMPopup()` - Standard DOM popup
- `getPopupStyles()` - Get popup CSS styles
- Export popup helpers from main module

### 1.0.2 (2026-01-06)
- Fixed CommonJS module compatibility for standalone bundle
- Improved seedrandom module handling

### 1.0.1 (2026-01-06)
- Added standalone bundle with all dependencies
- Fixed Observable module compatibility

### 1.0.0 (2026-01-06)
- Initial release
- Converted from Observable notebook to standalone ES module
- Includes ESM, UMD, and minified bundles
- Full TypeScript-style JSDoc documentation
- CSS selector escaping for special characters
- Interactive click and hover events

## Original Source

Original Observable notebook: [@taekie/voronoi-treemap-class](https://observablehq.com/@taekie/voronoi-treemap-class@338)

## License

ISC
