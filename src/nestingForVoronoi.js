/**
 * Nesting For Voronoi Utility
 *
 * Transforms flat data into a nested hierarchical structure suitable
 * for d3.hierarchy() and voronoi treemap visualization.
 *
 * Creates a 3-level hierarchy: root -> region -> bigCluster -> cluster
 * Each leaf node contains budget values for sizing and references to original data.
 */

import d3 from './utils/d3-bundle.js';

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
 * const hierarchy = d3.hierarchy(nested, d => d.values).sum(d => d.budget);
 */
export function nestingForVoronoi(
  data,
  key1 = "bigClusterLabel",
  key2 = "clusterLabel"
) {
  // 1. Extract only necessary fields
  const simpleBudget = data.map((d) => ({
    [key1]: d[key1],
    [key2]: d[key2],
    region: d.region,
    budget: d.bubbleSize ?? 1
  }));

  // 2. 3-level grouping with d3.rollups: region -> key1 -> key2
  const nested = d3.rollups(
    simpleBudget,
    (d) => d3.sum(d.map((v) => v.budget)),
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
        budget: k[1] ? k[1] : 1
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

export default nestingForVoronoi;
