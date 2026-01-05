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

```javascript
// Cell 1: Import dependencies
d3 = require("d3@7")
d3WeightedVoronoi = require("d3-weighted-voronoi@1")
d3VoronoiMap = require("d3-voronoi-map@2")
d3VoronoiTreemap = require("d3-voronoi-treemap@1")
seedrandom = require("seedrandom@3")
```

```javascript
// Cell 2: Import library from CDN
VoronoiTreemap = import("https://cdn.jsdelivr.net/gh/pxd-uxtech/affinitybubble-dist@1.0.0/dist/voronoi-treemap.esm.js")
```

```javascript
// Cell 3: Create visualization
chart = {
  const data = [
    { region: "A", bigClusterLabel: "Item 1", bubbleSize: "100" },
    { region: "A", bigClusterLabel: "Item 2", bubbleSize: "80" },
    { region: "B", bigClusterLabel: "Item 3", bubbleSize: "120" }
  ];

  const treemap = new VoronoiTreemap.VoronoiTreemap();

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
    pebbleWidth: 2
  });
}
```

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
  clickFunc: function(d) { // Click handler
    console.log('Clicked:', d);
  }
}
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

- `dist/voronoi-treemap.esm.js` - ES Module bundle (68KB)
- `dist/voronoi-treemap.umd.js` - UMD bundle (74KB)
- `dist/voronoi-treemap.min.js` - Minified UMD bundle (26KB)
- Source maps included for all bundles

## Dependencies

Peer dependencies (must be loaded separately):
- d3 (^7.0.0)
- d3-weighted-voronoi (^1.0.0)
- d3-voronoi-map (^2.0.0)
- d3-voronoi-treemap (^1.0.0)
- seedrandom (^3.0.0)

## Version History

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
