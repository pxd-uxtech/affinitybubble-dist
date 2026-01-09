import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

// External dependencies - these are peer dependencies that consumers must provide
const external = [
  'd3',
  'd3-weighted-voronoi',
  'd3-voronoi-map',
  'd3-voronoi-treemap',
  'seedrandom'
];

// Global variable names for UMD bundle
const globals = {
  'd3': 'd3',
  'd3-weighted-voronoi': 'd3',
  'd3-voronoi-map': 'd3',
  'd3-voronoi-treemap': 'd3',
  'seedrandom': 'seedrandom'
};

// Shared output options
const banner = `/**
 * @taekie/voronoi-treemap-class
 * A reusable Voronoi treemap visualization library
 * @license MIT
 */`;

export default [
  // ESM build (with external dependencies)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/voronoi-treemap.esm.js',
      format: 'esm',
      banner,
      sourcemap: true
    },
    external,
    plugins: [
      resolve()
    ]
  },
  // Standalone ESM build (all dependencies bundled - for Observable)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/voronoi-treemap.standalone.js',
      format: 'esm',
      banner,
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  // UMD build (unminified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/voronoi-treemap.umd.js',
      format: 'umd',
      name: 'VoronoiTreemap',
      banner,
      sourcemap: true,
      globals,
      exports: 'named'
    },
    external,
    plugins: [
      resolve()
    ]
  },
  // UMD build (minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/voronoi-treemap.min.js',
      format: 'umd',
      name: 'VoronoiTreemap',
      banner,
      sourcemap: true,
      globals,
      exports: 'named'
    },
    external,
    plugins: [
      resolve(),
      terser({
        format: {
          comments: /^!/  // Preserve banner comment
        }
      })
    ]
  }
];
