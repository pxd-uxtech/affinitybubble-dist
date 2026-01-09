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

import * as d3Core from 'd3';
import * as d3WeightedVoronoi from 'd3-weighted-voronoi';
import * as d3VoronoiMap from 'd3-voronoi-map';
import * as d3VoronoiTreemap from 'd3-voronoi-treemap';
import * as seedrandomModule from 'seedrandom';

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

export default d3;
