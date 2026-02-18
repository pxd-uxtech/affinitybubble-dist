var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/umap-js/dist/utils.js
var require_utils = __commonJS({
  "node_modules/umap-js/dist/utils.js"(exports) {
    "use strict";
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function() {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reshape2d = exports.rejectionSample = exports.max2d = exports.max = exports.mean = exports.sum = exports.linear = exports.ones = exports.zeros = exports.filled = exports.range = exports.empty = exports.norm = exports.tauRand = exports.tauRandInt = void 0;
    function tauRandInt(n, random) {
      return Math.floor(random() * n);
    }
    exports.tauRandInt = tauRandInt;
    function tauRand(random) {
      return random();
    }
    exports.tauRand = tauRand;
    function norm(vec) {
      var e_1, _a;
      var result = 0;
      try {
        for (var vec_1 = __values(vec), vec_1_1 = vec_1.next(); !vec_1_1.done; vec_1_1 = vec_1.next()) {
          var item = vec_1_1.value;
          result += Math.pow(item, 2);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (vec_1_1 && !vec_1_1.done && (_a = vec_1.return)) _a.call(vec_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      return Math.sqrt(result);
    }
    exports.norm = norm;
    function empty2(n) {
      var output = [];
      for (var i = 0; i < n; i++) {
        output.push(void 0);
      }
      return output;
    }
    exports.empty = empty2;
    function range(n) {
      return empty2(n).map(function(_, i) {
        return i;
      });
    }
    exports.range = range;
    function filled(n, v) {
      return empty2(n).map(function() {
        return v;
      });
    }
    exports.filled = filled;
    function zeros(n) {
      return filled(n, 0);
    }
    exports.zeros = zeros;
    function ones(n) {
      return filled(n, 1);
    }
    exports.ones = ones;
    function linear2(a, b, len) {
      return empty2(len).map(function(_, i) {
        return a + i * ((b - a) / (len - 1));
      });
    }
    exports.linear = linear2;
    function sum(input) {
      return input.reduce(function(sum2, val) {
        return sum2 + val;
      });
    }
    exports.sum = sum;
    function mean(input) {
      return sum(input) / input.length;
    }
    exports.mean = mean;
    function max2(input) {
      var max3 = 0;
      for (var i = 0; i < input.length; i++) {
        max3 = input[i] > max3 ? input[i] : max3;
      }
      return max3;
    }
    exports.max = max2;
    function max2d(input) {
      var max3 = 0;
      for (var i = 0; i < input.length; i++) {
        for (var j = 0; j < input[i].length; j++) {
          max3 = input[i][j] > max3 ? input[i][j] : max3;
        }
      }
      return max3;
    }
    exports.max2d = max2d;
    function rejectionSample(nSamples, poolSize, random) {
      var result = zeros(nSamples);
      for (var i = 0; i < nSamples; i++) {
        var rejectSample = true;
        while (rejectSample) {
          var j = tauRandInt(poolSize, random);
          var broken = false;
          for (var k = 0; k < i; k++) {
            if (j === result[k]) {
              broken = true;
              break;
            }
          }
          if (!broken) {
            rejectSample = false;
          }
          result[i] = j;
        }
      }
      return result;
    }
    exports.rejectionSample = rejectionSample;
    function reshape2d(x, a, b) {
      var rows = [];
      var count = 0;
      var index = 0;
      if (x.length !== a * b) {
        throw new Error("Array dimensions must match input length.");
      }
      for (var i = 0; i < a; i++) {
        var col = [];
        for (var j = 0; j < b; j++) {
          col.push(x[index]);
          index += 1;
        }
        rows.push(col);
        count += 1;
      }
      return rows;
    }
    exports.reshape2d = reshape2d;
  }
});

// node_modules/umap-js/dist/heap.js
var require_heap = __commonJS({
  "node_modules/umap-js/dist/heap.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.smallestFlagged = exports.deheapSort = exports.buildCandidates = exports.uncheckedHeapPush = exports.heapPush = exports.rejectionSample = exports.makeHeap = void 0;
    var utils = __importStar(require_utils());
    function makeHeap(nPoints, size) {
      var makeArrays = function(fillValue) {
        return utils.empty(nPoints).map(function() {
          return utils.filled(size, fillValue);
        });
      };
      var heap = [];
      heap.push(makeArrays(-1));
      heap.push(makeArrays(Infinity));
      heap.push(makeArrays(0));
      return heap;
    }
    exports.makeHeap = makeHeap;
    function rejectionSample(nSamples, poolSize, random) {
      var result = utils.zeros(nSamples);
      for (var i = 0; i < nSamples; i++) {
        var rejectSample = true;
        var j = 0;
        while (rejectSample) {
          j = utils.tauRandInt(poolSize, random);
          var broken = false;
          for (var k = 0; k < i; k++) {
            if (j === result[k]) {
              broken = true;
              break;
            }
          }
          if (!broken)
            rejectSample = false;
        }
        result[i] = j;
      }
      return result;
    }
    exports.rejectionSample = rejectionSample;
    function heapPush(heap, row, weight, index, flag) {
      row = Math.floor(row);
      var indices = heap[0][row];
      var weights = heap[1][row];
      var isNew = heap[2][row];
      if (weight >= weights[0]) {
        return 0;
      }
      for (var i = 0; i < indices.length; i++) {
        if (index === indices[i]) {
          return 0;
        }
      }
      return uncheckedHeapPush(heap, row, weight, index, flag);
    }
    exports.heapPush = heapPush;
    function uncheckedHeapPush(heap, row, weight, index, flag) {
      var indices = heap[0][row];
      var weights = heap[1][row];
      var isNew = heap[2][row];
      if (weight >= weights[0]) {
        return 0;
      }
      weights[0] = weight;
      indices[0] = index;
      isNew[0] = flag;
      var i = 0;
      var iSwap = 0;
      while (true) {
        var ic1 = 2 * i + 1;
        var ic2 = ic1 + 1;
        var heapShape2 = heap[0][0].length;
        if (ic1 >= heapShape2) {
          break;
        } else if (ic2 >= heapShape2) {
          if (weights[ic1] > weight) {
            iSwap = ic1;
          } else {
            break;
          }
        } else if (weights[ic1] >= weights[ic2]) {
          if (weight < weights[ic1]) {
            iSwap = ic1;
          } else {
            break;
          }
        } else {
          if (weight < weights[ic2]) {
            iSwap = ic2;
          } else {
            break;
          }
        }
        weights[i] = weights[iSwap];
        indices[i] = indices[iSwap];
        isNew[i] = isNew[iSwap];
        i = iSwap;
      }
      weights[i] = weight;
      indices[i] = index;
      isNew[i] = flag;
      return 1;
    }
    exports.uncheckedHeapPush = uncheckedHeapPush;
    function buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random) {
      var candidateNeighbors = makeHeap(nVertices, maxCandidates);
      for (var i = 0; i < nVertices; i++) {
        for (var j = 0; j < nNeighbors; j++) {
          if (currentGraph[0][i][j] < 0) {
            continue;
          }
          var idx = currentGraph[0][i][j];
          var isn = currentGraph[2][i][j];
          var d = utils.tauRand(random);
          heapPush(candidateNeighbors, i, d, idx, isn);
          heapPush(candidateNeighbors, idx, d, i, isn);
          currentGraph[2][i][j] = 0;
        }
      }
      return candidateNeighbors;
    }
    exports.buildCandidates = buildCandidates;
    function deheapSort(heap) {
      var indices = heap[0];
      var weights = heap[1];
      for (var i = 0; i < indices.length; i++) {
        var indHeap = indices[i];
        var distHeap = weights[i];
        for (var j = 0; j < indHeap.length - 1; j++) {
          var indHeapIndex = indHeap.length - j - 1;
          var distHeapIndex = distHeap.length - j - 1;
          var temp1 = indHeap[0];
          indHeap[0] = indHeap[indHeapIndex];
          indHeap[indHeapIndex] = temp1;
          var temp2 = distHeap[0];
          distHeap[0] = distHeap[distHeapIndex];
          distHeap[distHeapIndex] = temp2;
          siftDown(distHeap, indHeap, distHeapIndex, 0);
        }
      }
      return { indices, weights };
    }
    exports.deheapSort = deheapSort;
    function siftDown(heap1, heap2, ceiling, elt) {
      while (elt * 2 + 1 < ceiling) {
        var leftChild = elt * 2 + 1;
        var rightChild = leftChild + 1;
        var swap = elt;
        if (heap1[swap] < heap1[leftChild]) {
          swap = leftChild;
        }
        if (rightChild < ceiling && heap1[swap] < heap1[rightChild]) {
          swap = rightChild;
        }
        if (swap === elt) {
          break;
        } else {
          var temp1 = heap1[elt];
          heap1[elt] = heap1[swap];
          heap1[swap] = temp1;
          var temp2 = heap2[elt];
          heap2[elt] = heap2[swap];
          heap2[swap] = temp2;
          elt = swap;
        }
      }
    }
    function smallestFlagged(heap, row) {
      var ind = heap[0][row];
      var dist = heap[1][row];
      var flag = heap[2][row];
      var minDist = Infinity;
      var resultIndex = -1;
      for (var i = 0; i > ind.length; i++) {
        if (flag[i] === 1 && dist[i] < minDist) {
          minDist = dist[i];
          resultIndex = i;
        }
      }
      if (resultIndex >= 0) {
        flag[resultIndex] = 0;
        return Math.floor(ind[resultIndex]);
      } else {
        return -1;
      }
    }
    exports.smallestFlagged = smallestFlagged;
  }
});

// node_modules/umap-js/dist/matrix.js
var require_matrix = __commonJS({
  "node_modules/umap-js/dist/matrix.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function() {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCSR = exports.normalize = exports.eliminateZeros = exports.multiplyScalar = exports.maximum = exports.subtract = exports.add = exports.pairwiseMultiply = exports.identity = exports.transpose = exports.SparseMatrix = void 0;
    var utils = __importStar(require_utils());
    var SparseMatrix = (function() {
      function SparseMatrix2(rows, cols, values, dims) {
        this.entries = /* @__PURE__ */ new Map();
        this.nRows = 0;
        this.nCols = 0;
        if (rows.length !== cols.length || rows.length !== values.length) {
          throw new Error("rows, cols and values arrays must all have the same length");
        }
        this.nRows = dims[0];
        this.nCols = dims[1];
        for (var i = 0; i < values.length; i++) {
          var row = rows[i];
          var col = cols[i];
          this.checkDims(row, col);
          var key = this.makeKey(row, col);
          this.entries.set(key, { value: values[i], row, col });
        }
      }
      SparseMatrix2.prototype.makeKey = function(row, col) {
        return row + ":" + col;
      };
      SparseMatrix2.prototype.checkDims = function(row, col) {
        var withinBounds = row < this.nRows && col < this.nCols;
        if (!withinBounds) {
          throw new Error("row and/or col specified outside of matrix dimensions");
        }
      };
      SparseMatrix2.prototype.set = function(row, col, value) {
        this.checkDims(row, col);
        var key = this.makeKey(row, col);
        if (!this.entries.has(key)) {
          this.entries.set(key, { value, row, col });
        } else {
          this.entries.get(key).value = value;
        }
      };
      SparseMatrix2.prototype.get = function(row, col, defaultValue) {
        if (defaultValue === void 0) {
          defaultValue = 0;
        }
        this.checkDims(row, col);
        var key = this.makeKey(row, col);
        if (this.entries.has(key)) {
          return this.entries.get(key).value;
        } else {
          return defaultValue;
        }
      };
      SparseMatrix2.prototype.getAll = function(ordered) {
        if (ordered === void 0) {
          ordered = true;
        }
        var rowColValues = [];
        this.entries.forEach(function(value) {
          rowColValues.push(value);
        });
        if (ordered) {
          rowColValues.sort(function(a, b) {
            if (a.row === b.row) {
              return a.col - b.col;
            } else {
              return a.row - b.row;
            }
          });
        }
        return rowColValues;
      };
      SparseMatrix2.prototype.getDims = function() {
        return [this.nRows, this.nCols];
      };
      SparseMatrix2.prototype.getRows = function() {
        return Array.from(this.entries, function(_a2) {
          var _b = __read(_a2, 2), key = _b[0], value = _b[1];
          return value.row;
        });
      };
      SparseMatrix2.prototype.getCols = function() {
        return Array.from(this.entries, function(_a2) {
          var _b = __read(_a2, 2), key = _b[0], value = _b[1];
          return value.col;
        });
      };
      SparseMatrix2.prototype.getValues = function() {
        return Array.from(this.entries, function(_a2) {
          var _b = __read(_a2, 2), key = _b[0], value = _b[1];
          return value.value;
        });
      };
      SparseMatrix2.prototype.forEach = function(fn) {
        this.entries.forEach(function(value) {
          return fn(value.value, value.row, value.col);
        });
      };
      SparseMatrix2.prototype.map = function(fn) {
        var vals = [];
        this.entries.forEach(function(value) {
          vals.push(fn(value.value, value.row, value.col));
        });
        var dims = [this.nRows, this.nCols];
        return new SparseMatrix2(this.getRows(), this.getCols(), vals, dims);
      };
      SparseMatrix2.prototype.toArray = function() {
        var _this = this;
        var rows = utils.empty(this.nRows);
        var output = rows.map(function() {
          return utils.zeros(_this.nCols);
        });
        this.entries.forEach(function(value) {
          output[value.row][value.col] = value.value;
        });
        return output;
      };
      return SparseMatrix2;
    })();
    exports.SparseMatrix = SparseMatrix;
    function transpose(matrix) {
      var cols = [];
      var rows = [];
      var vals = [];
      matrix.forEach(function(value, row, col) {
        cols.push(row);
        rows.push(col);
        vals.push(value);
      });
      var dims = [matrix.nCols, matrix.nRows];
      return new SparseMatrix(rows, cols, vals, dims);
    }
    exports.transpose = transpose;
    function identity3(size) {
      var _a2 = __read(size, 1), rows = _a2[0];
      var matrix = new SparseMatrix([], [], [], size);
      for (var i = 0; i < rows; i++) {
        matrix.set(i, i, 1);
      }
      return matrix;
    }
    exports.identity = identity3;
    function pairwiseMultiply(a, b) {
      return elementWise(a, b, function(x, y) {
        return x * y;
      });
    }
    exports.pairwiseMultiply = pairwiseMultiply;
    function add(a, b) {
      return elementWise(a, b, function(x, y) {
        return x + y;
      });
    }
    exports.add = add;
    function subtract(a, b) {
      return elementWise(a, b, function(x, y) {
        return x - y;
      });
    }
    exports.subtract = subtract;
    function maximum(a, b) {
      return elementWise(a, b, function(x, y) {
        return x > y ? x : y;
      });
    }
    exports.maximum = maximum;
    function multiplyScalar(a, scalar) {
      return a.map(function(value) {
        return value * scalar;
      });
    }
    exports.multiplyScalar = multiplyScalar;
    function eliminateZeros(m) {
      var zeroIndices = /* @__PURE__ */ new Set();
      var values = m.getValues();
      var rows = m.getRows();
      var cols = m.getCols();
      for (var i = 0; i < values.length; i++) {
        if (values[i] === 0) {
          zeroIndices.add(i);
        }
      }
      var removeByZeroIndex = function(_, index) {
        return !zeroIndices.has(index);
      };
      var nextValues = values.filter(removeByZeroIndex);
      var nextRows = rows.filter(removeByZeroIndex);
      var nextCols = cols.filter(removeByZeroIndex);
      return new SparseMatrix(nextRows, nextCols, nextValues, m.getDims());
    }
    exports.eliminateZeros = eliminateZeros;
    function normalize(m, normType) {
      var e_1, _a2;
      if (normType === void 0) {
        normType = "l2";
      }
      var normFn = normFns[normType];
      var colsByRow = /* @__PURE__ */ new Map();
      m.forEach(function(_, row2, col) {
        var cols = colsByRow.get(row2) || [];
        cols.push(col);
        colsByRow.set(row2, cols);
      });
      var nextMatrix = new SparseMatrix([], [], [], m.getDims());
      var _loop_1 = function(row2) {
        var cols = colsByRow.get(row2).sort();
        var vals = cols.map(function(col) {
          return m.get(row2, col);
        });
        var norm = normFn(vals);
        for (var i = 0; i < norm.length; i++) {
          nextMatrix.set(row2, cols[i], norm[i]);
        }
      };
      try {
        for (var _b = __values(colsByRow.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
          var row = _c.value;
          _loop_1(row);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return)) _a2.call(_b);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      return nextMatrix;
    }
    exports.normalize = normalize;
    var normFns = (_a = {}, _a["max"] = function(xs) {
      var max2 = -Infinity;
      for (var i = 0; i < xs.length; i++) {
        max2 = xs[i] > max2 ? xs[i] : max2;
      }
      return xs.map(function(x) {
        return x / max2;
      });
    }, _a["l1"] = function(xs) {
      var sum = 0;
      for (var i = 0; i < xs.length; i++) {
        sum += xs[i];
      }
      return xs.map(function(x) {
        return x / sum;
      });
    }, _a["l2"] = function(xs) {
      var sum = 0;
      for (var i = 0; i < xs.length; i++) {
        sum += Math.pow(xs[i], 2);
      }
      return xs.map(function(x) {
        return Math.sqrt(Math.pow(x, 2) / sum);
      });
    }, _a);
    function elementWise(a, b, op) {
      var visited = /* @__PURE__ */ new Set();
      var rows = [];
      var cols = [];
      var vals = [];
      var operate = function(row2, col2) {
        rows.push(row2);
        cols.push(col2);
        var nextValue = op(a.get(row2, col2), b.get(row2, col2));
        vals.push(nextValue);
      };
      var valuesA = a.getValues();
      var rowsA = a.getRows();
      var colsA = a.getCols();
      for (var i = 0; i < valuesA.length; i++) {
        var row = rowsA[i];
        var col = colsA[i];
        var key = row + ":" + col;
        visited.add(key);
        operate(row, col);
      }
      var valuesB = b.getValues();
      var rowsB = b.getRows();
      var colsB = b.getCols();
      for (var i = 0; i < valuesB.length; i++) {
        var row = rowsB[i];
        var col = colsB[i];
        var key = row + ":" + col;
        if (visited.has(key))
          continue;
        operate(row, col);
      }
      var dims = [a.nRows, a.nCols];
      return new SparseMatrix(rows, cols, vals, dims);
    }
    function getCSR(x) {
      var entries = [];
      x.forEach(function(value2, row2, col2) {
        entries.push({ value: value2, row: row2, col: col2 });
      });
      entries.sort(function(a, b) {
        if (a.row === b.row) {
          return a.col - b.col;
        } else {
          return a.row - b.row;
        }
      });
      var indices = [];
      var values = [];
      var indptr = [];
      var currentRow = -1;
      for (var i = 0; i < entries.length; i++) {
        var _a2 = entries[i], row = _a2.row, col = _a2.col, value = _a2.value;
        if (row !== currentRow) {
          currentRow = row;
          indptr.push(i);
        }
        indices.push(col);
        values.push(value);
      }
      return { indices, values, indptr };
    }
    exports.getCSR = getCSR;
  }
});

// node_modules/umap-js/dist/tree.js
var require_tree = __commonJS({
  "node_modules/umap-js/dist/tree.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spread = exports && exports.__spread || function() {
      for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
      return ar;
    };
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function() {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchFlatTree = exports.makeLeafArray = exports.makeForest = exports.FlatTree = void 0;
    var utils = __importStar(require_utils());
    var FlatTree = /* @__PURE__ */ (function() {
      function FlatTree2(hyperplanes, offsets, children2, indices) {
        this.hyperplanes = hyperplanes;
        this.offsets = offsets;
        this.children = children2;
        this.indices = indices;
      }
      return FlatTree2;
    })();
    exports.FlatTree = FlatTree;
    function makeForest(data, nNeighbors, nTrees, random) {
      var leafSize = Math.max(10, nNeighbors);
      var trees = utils.range(nTrees).map(function(_, i) {
        return makeTree(data, leafSize, i, random);
      });
      var forest = trees.map(function(tree) {
        return flattenTree(tree, leafSize);
      });
      return forest;
    }
    exports.makeForest = makeForest;
    function makeTree(data, leafSize, n, random) {
      if (leafSize === void 0) {
        leafSize = 30;
      }
      var indices = utils.range(data.length);
      var tree = makeEuclideanTree(data, indices, leafSize, n, random);
      return tree;
    }
    function makeEuclideanTree(data, indices, leafSize, q, random) {
      if (leafSize === void 0) {
        leafSize = 30;
      }
      if (indices.length > leafSize) {
        var splitResults = euclideanRandomProjectionSplit(data, indices, random);
        var indicesLeft = splitResults.indicesLeft, indicesRight = splitResults.indicesRight, hyperplane = splitResults.hyperplane, offset = splitResults.offset;
        var leftChild = makeEuclideanTree(data, indicesLeft, leafSize, q + 1, random);
        var rightChild = makeEuclideanTree(data, indicesRight, leafSize, q + 1, random);
        var node = { leftChild, rightChild, isLeaf: false, hyperplane, offset };
        return node;
      } else {
        var node = { indices, isLeaf: true };
        return node;
      }
    }
    function euclideanRandomProjectionSplit(data, indices, random) {
      var dim = data[0].length;
      var leftIndex = utils.tauRandInt(indices.length, random);
      var rightIndex = utils.tauRandInt(indices.length, random);
      rightIndex += leftIndex === rightIndex ? 1 : 0;
      rightIndex = rightIndex % indices.length;
      var left = indices[leftIndex];
      var right = indices[rightIndex];
      var hyperplaneOffset = 0;
      var hyperplaneVector = utils.zeros(dim);
      for (var i = 0; i < hyperplaneVector.length; i++) {
        hyperplaneVector[i] = data[left][i] - data[right][i];
        hyperplaneOffset -= hyperplaneVector[i] * (data[left][i] + data[right][i]) / 2;
      }
      var nLeft = 0;
      var nRight = 0;
      var side = utils.zeros(indices.length);
      for (var i = 0; i < indices.length; i++) {
        var margin = hyperplaneOffset;
        for (var d = 0; d < dim; d++) {
          margin += hyperplaneVector[d] * data[indices[i]][d];
        }
        if (margin === 0) {
          side[i] = utils.tauRandInt(2, random);
          if (side[i] === 0) {
            nLeft += 1;
          } else {
            nRight += 1;
          }
        } else if (margin > 0) {
          side[i] = 0;
          nLeft += 1;
        } else {
          side[i] = 1;
          nRight += 1;
        }
      }
      var indicesLeft = utils.zeros(nLeft);
      var indicesRight = utils.zeros(nRight);
      nLeft = 0;
      nRight = 0;
      for (var i = 0; i < side.length; i++) {
        if (side[i] === 0) {
          indicesLeft[nLeft] = indices[i];
          nLeft += 1;
        } else {
          indicesRight[nRight] = indices[i];
          nRight += 1;
        }
      }
      return {
        indicesLeft,
        indicesRight,
        hyperplane: hyperplaneVector,
        offset: hyperplaneOffset
      };
    }
    function flattenTree(tree, leafSize) {
      var nNodes = numNodes(tree);
      var nLeaves = numLeaves(tree);
      var hyperplanes = utils.range(nNodes).map(function() {
        return utils.zeros(tree.hyperplane ? tree.hyperplane.length : 0);
      });
      var offsets = utils.zeros(nNodes);
      var children2 = utils.range(nNodes).map(function() {
        return [-1, -1];
      });
      var indices = utils.range(nLeaves).map(function() {
        return utils.range(leafSize).map(function() {
          return -1;
        });
      });
      recursiveFlatten(tree, hyperplanes, offsets, children2, indices, 0, 0);
      return new FlatTree(hyperplanes, offsets, children2, indices);
    }
    function recursiveFlatten(tree, hyperplanes, offsets, children2, indices, nodeNum, leafNum) {
      var _a;
      if (tree.isLeaf) {
        children2[nodeNum][0] = -leafNum;
        (_a = indices[leafNum]).splice.apply(_a, __spread([0, tree.indices.length], tree.indices));
        leafNum += 1;
        return { nodeNum, leafNum };
      } else {
        hyperplanes[nodeNum] = tree.hyperplane;
        offsets[nodeNum] = tree.offset;
        children2[nodeNum][0] = nodeNum + 1;
        var oldNodeNum = nodeNum;
        var res = recursiveFlatten(tree.leftChild, hyperplanes, offsets, children2, indices, nodeNum + 1, leafNum);
        nodeNum = res.nodeNum;
        leafNum = res.leafNum;
        children2[oldNodeNum][1] = nodeNum + 1;
        res = recursiveFlatten(tree.rightChild, hyperplanes, offsets, children2, indices, nodeNum + 1, leafNum);
        return { nodeNum: res.nodeNum, leafNum: res.leafNum };
      }
    }
    function numNodes(tree) {
      if (tree.isLeaf) {
        return 1;
      } else {
        return 1 + numNodes(tree.leftChild) + numNodes(tree.rightChild);
      }
    }
    function numLeaves(tree) {
      if (tree.isLeaf) {
        return 1;
      } else {
        return numLeaves(tree.leftChild) + numLeaves(tree.rightChild);
      }
    }
    function makeLeafArray(rpForest) {
      var e_1, _a;
      if (rpForest.length > 0) {
        var output = [];
        try {
          for (var rpForest_1 = __values(rpForest), rpForest_1_1 = rpForest_1.next(); !rpForest_1_1.done; rpForest_1_1 = rpForest_1.next()) {
            var tree = rpForest_1_1.value;
            output.push.apply(output, __spread(tree.indices));
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (rpForest_1_1 && !rpForest_1_1.done && (_a = rpForest_1.return)) _a.call(rpForest_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return output;
      } else {
        return [[-1]];
      }
    }
    exports.makeLeafArray = makeLeafArray;
    function selectSide(hyperplane, offset, point, random) {
      var margin = offset;
      for (var d = 0; d < point.length; d++) {
        margin += hyperplane[d] * point[d];
      }
      if (margin === 0) {
        var side = utils.tauRandInt(2, random);
        return side;
      } else if (margin > 0) {
        return 0;
      } else {
        return 1;
      }
    }
    function searchFlatTree(point, tree, random) {
      var node = 0;
      while (tree.children[node][0] > 0) {
        var side = selectSide(tree.hyperplanes[node], tree.offsets[node], point, random);
        if (side === 0) {
          node = tree.children[node][0];
        } else {
          node = tree.children[node][1];
        }
      }
      var index = -1 * tree.children[node][0];
      return tree.indices[index];
    }
    exports.searchFlatTree = searchFlatTree;
  }
});

// node_modules/umap-js/dist/nn_descent.js
var require_nn_descent = __commonJS({
  "node_modules/umap-js/dist/nn_descent.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __values = exports && exports.__values || function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function() {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializeSearch = exports.makeInitializedNNSearch = exports.makeInitializations = exports.makeNNDescent = void 0;
    var heap = __importStar(require_heap());
    var matrix = __importStar(require_matrix());
    var tree = __importStar(require_tree());
    var utils = __importStar(require_utils());
    function makeNNDescent(distanceFn, random) {
      return function nNDescent(data, leafArray, nNeighbors, nIters, maxCandidates, delta, rho, rpTreeInit) {
        if (nIters === void 0) {
          nIters = 10;
        }
        if (maxCandidates === void 0) {
          maxCandidates = 50;
        }
        if (delta === void 0) {
          delta = 1e-3;
        }
        if (rho === void 0) {
          rho = 0.5;
        }
        if (rpTreeInit === void 0) {
          rpTreeInit = true;
        }
        var nVertices = data.length;
        var currentGraph = heap.makeHeap(data.length, nNeighbors);
        for (var i = 0; i < data.length; i++) {
          var indices = heap.rejectionSample(nNeighbors, data.length, random);
          for (var j = 0; j < indices.length; j++) {
            var d = distanceFn(data[i], data[indices[j]]);
            heap.heapPush(currentGraph, i, d, indices[j], 1);
            heap.heapPush(currentGraph, indices[j], d, i, 1);
          }
        }
        if (rpTreeInit) {
          for (var n = 0; n < leafArray.length; n++) {
            for (var i = 0; i < leafArray[n].length; i++) {
              if (leafArray[n][i] < 0) {
                break;
              }
              for (var j = i + 1; j < leafArray[n].length; j++) {
                if (leafArray[n][j] < 0) {
                  break;
                }
                var d = distanceFn(data[leafArray[n][i]], data[leafArray[n][j]]);
                heap.heapPush(currentGraph, leafArray[n][i], d, leafArray[n][j], 1);
                heap.heapPush(currentGraph, leafArray[n][j], d, leafArray[n][i], 1);
              }
            }
          }
        }
        for (var n = 0; n < nIters; n++) {
          var candidateNeighbors = heap.buildCandidates(currentGraph, nVertices, nNeighbors, maxCandidates, random);
          var c = 0;
          for (var i = 0; i < nVertices; i++) {
            for (var j = 0; j < maxCandidates; j++) {
              var p = Math.floor(candidateNeighbors[0][i][j]);
              if (p < 0 || utils.tauRand(random) < rho) {
                continue;
              }
              for (var k = 0; k < maxCandidates; k++) {
                var q = Math.floor(candidateNeighbors[0][i][k]);
                var cj = candidateNeighbors[2][i][j];
                var ck = candidateNeighbors[2][i][k];
                if (q < 0 || !cj && !ck) {
                  continue;
                }
                var d = distanceFn(data[p], data[q]);
                c += heap.heapPush(currentGraph, p, d, q, 1);
                c += heap.heapPush(currentGraph, q, d, p, 1);
              }
            }
          }
          if (c <= delta * nNeighbors * data.length) {
            break;
          }
        }
        var sorted = heap.deheapSort(currentGraph);
        return sorted;
      };
    }
    exports.makeNNDescent = makeNNDescent;
    function makeInitializations(distanceFn) {
      function initFromRandom(nNeighbors, data, queryPoints, _heap, random) {
        for (var i = 0; i < queryPoints.length; i++) {
          var indices = utils.rejectionSample(nNeighbors, data.length, random);
          for (var j = 0; j < indices.length; j++) {
            if (indices[j] < 0) {
              continue;
            }
            var d = distanceFn(data[indices[j]], queryPoints[i]);
            heap.heapPush(_heap, i, d, indices[j], 1);
          }
        }
      }
      function initFromTree(_tree, data, queryPoints, _heap, random) {
        for (var i = 0; i < queryPoints.length; i++) {
          var indices = tree.searchFlatTree(queryPoints[i], _tree, random);
          for (var j = 0; j < indices.length; j++) {
            if (indices[j] < 0) {
              return;
            }
            var d = distanceFn(data[indices[j]], queryPoints[i]);
            heap.heapPush(_heap, i, d, indices[j], 1);
          }
        }
        return;
      }
      return { initFromRandom, initFromTree };
    }
    exports.makeInitializations = makeInitializations;
    function makeInitializedNNSearch(distanceFn) {
      return function nnSearchFn(data, graph, initialization, queryPoints) {
        var e_1, _a;
        var _b = matrix.getCSR(graph), indices = _b.indices, indptr = _b.indptr;
        for (var i = 0; i < queryPoints.length; i++) {
          var tried = new Set(initialization[0][i]);
          while (true) {
            var vertex = heap.smallestFlagged(initialization, i);
            if (vertex === -1) {
              break;
            }
            var candidates = indices.slice(indptr[vertex], indptr[vertex + 1]);
            try {
              for (var candidates_1 = (e_1 = void 0, __values(candidates)), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                var candidate = candidates_1_1.value;
                if (candidate === vertex || candidate === -1 || tried.has(candidate)) {
                  continue;
                }
                var d = distanceFn(data[candidate], queryPoints[i]);
                heap.uncheckedHeapPush(initialization, i, d, candidate, 1);
                tried.add(candidate);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
          }
        }
        return initialization;
      };
    }
    exports.makeInitializedNNSearch = makeInitializedNNSearch;
    function initializeSearch(forest, data, queryPoints, nNeighbors, initFromRandom, initFromTree, random) {
      var e_2, _a;
      var results = heap.makeHeap(queryPoints.length, nNeighbors);
      initFromRandom(nNeighbors, data, queryPoints, results, random);
      if (forest) {
        try {
          for (var forest_1 = __values(forest), forest_1_1 = forest_1.next(); !forest_1_1.done; forest_1_1 = forest_1.next()) {
            var tree_1 = forest_1_1.value;
            initFromTree(tree_1, data, queryPoints, results, random);
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (forest_1_1 && !forest_1_1.done && (_a = forest_1.return)) _a.call(forest_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      return results;
    }
    exports.initializeSearch = initializeSearch;
  }
});

// node_modules/is-any-array/lib/index.js
var require_lib = __commonJS({
  "node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var toString = Object.prototype.toString;
    function isAnyArray(object) {
      return toString.call(object).endsWith("Array]");
    }
    exports.default = isAnyArray;
  }
});

// node_modules/ml-matrix/node_modules/is-any-array/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/ml-matrix/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-rescale/node_modules/is-any-array/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/ml-array-rescale/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-max/node_modules/is-any-array/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/ml-array-max/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-max/lib/index.js
var require_lib5 = __commonJS({
  "node_modules/ml-array-max/lib/index.js"(exports, module) {
    "use strict";
    var isAnyArray = require_lib4();
    function max2(input, options = {}) {
      if (!isAnyArray.isAnyArray(input)) {
        throw new TypeError("input must be an array");
      }
      if (input.length === 0) {
        throw new TypeError("input must not be empty");
      }
      const { fromIndex = 0, toIndex = input.length } = options;
      if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
        throw new Error("fromIndex must be a positive integer smaller than length");
      }
      if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
        throw new Error(
          "toIndex must be an integer greater than fromIndex and at most equal to length"
        );
      }
      let maxValue = input[fromIndex];
      for (let i = fromIndex + 1; i < toIndex; i++) {
        if (input[i] > maxValue) maxValue = input[i];
      }
      return maxValue;
    }
    module.exports = max2;
  }
});

// node_modules/ml-array-min/node_modules/is-any-array/lib/index.js
var require_lib6 = __commonJS({
  "node_modules/ml-array-min/node_modules/is-any-array/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAnyArray = void 0;
    var toString = Object.prototype.toString;
    function isAnyArray(value) {
      const tag = toString.call(value);
      return tag.endsWith("Array]") && !tag.includes("Big");
    }
    exports.isAnyArray = isAnyArray;
  }
});

// node_modules/ml-array-min/lib/index.js
var require_lib7 = __commonJS({
  "node_modules/ml-array-min/lib/index.js"(exports, module) {
    "use strict";
    var isAnyArray = require_lib6();
    function min2(input, options = {}) {
      if (!isAnyArray.isAnyArray(input)) {
        throw new TypeError("input must be an array");
      }
      if (input.length === 0) {
        throw new TypeError("input must not be empty");
      }
      const { fromIndex = 0, toIndex = input.length } = options;
      if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
        throw new Error("fromIndex must be a positive integer smaller than length");
      }
      if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
        throw new Error(
          "toIndex must be an integer greater than fromIndex and at most equal to length"
        );
      }
      let minValue = input[fromIndex];
      for (let i = fromIndex + 1; i < toIndex; i++) {
        if (input[i] < minValue) minValue = input[i];
      }
      return minValue;
    }
    module.exports = min2;
  }
});

// node_modules/ml-array-rescale/lib/index.js
var require_lib8 = __commonJS({
  "node_modules/ml-array-rescale/lib/index.js"(exports, module) {
    "use strict";
    var isAnyArray = require_lib3();
    var max2 = require_lib5();
    var min2 = require_lib7();
    function _interopDefaultLegacy(e) {
      return e && typeof e === "object" && "default" in e ? e : { "default": e };
    }
    var max__default = /* @__PURE__ */ _interopDefaultLegacy(max2);
    var min__default = /* @__PURE__ */ _interopDefaultLegacy(min2);
    function rescale(input, options = {}) {
      if (!isAnyArray.isAnyArray(input)) {
        throw new TypeError("input must be an array");
      } else if (input.length === 0) {
        throw new TypeError("input must not be empty");
      }
      let output;
      if (options.output !== void 0) {
        if (!isAnyArray.isAnyArray(options.output)) {
          throw new TypeError("output option must be an array if specified");
        }
        output = options.output;
      } else {
        output = new Array(input.length);
      }
      const currentMin = min__default["default"](input);
      const currentMax = max__default["default"](input);
      if (currentMin === currentMax) {
        throw new RangeError(
          "minimum and maximum input values are equal. Cannot rescale a constant array"
        );
      }
      const {
        min: minValue = options.autoMinMax ? currentMin : 0,
        max: maxValue = options.autoMinMax ? currentMax : 1
      } = options;
      if (minValue >= maxValue) {
        throw new RangeError("min option must be smaller than max option");
      }
      const factor = (maxValue - minValue) / (currentMax - currentMin);
      for (let i = 0; i < input.length; i++) {
        output[i] = (input[i] - currentMin) * factor + minValue;
      }
      return output;
    }
    module.exports = rescale;
  }
});

// node_modules/ml-matrix/matrix.js
var require_matrix2 = __commonJS({
  "node_modules/ml-matrix/matrix.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var isAnyArray = require_lib2();
    var rescale = require_lib8();
    var indent = " ".repeat(2);
    var indentData = " ".repeat(4);
    function inspectMatrix() {
      return inspectMatrixWithOptions(this);
    }
    function inspectMatrixWithOptions(matrix, options = {}) {
      const {
        maxRows = 15,
        maxColumns = 10,
        maxNumSize = 8,
        padMinus = "auto"
      } = options;
      return `${matrix.constructor.name} {
${indent}[
${indentData}${inspectData(matrix, maxRows, maxColumns, maxNumSize, padMinus)}
${indent}]
${indent}rows: ${matrix.rows}
${indent}columns: ${matrix.columns}
}`;
    }
    function inspectData(matrix, maxRows, maxColumns, maxNumSize, padMinus) {
      const { rows, columns } = matrix;
      const maxI = Math.min(rows, maxRows);
      const maxJ = Math.min(columns, maxColumns);
      const result = [];
      if (padMinus === "auto") {
        padMinus = false;
        loop: for (let i = 0; i < maxI; i++) {
          for (let j = 0; j < maxJ; j++) {
            if (matrix.get(i, j) < 0) {
              padMinus = true;
              break loop;
            }
          }
        }
      }
      for (let i = 0; i < maxI; i++) {
        let line = [];
        for (let j = 0; j < maxJ; j++) {
          line.push(formatNumber(matrix.get(i, j), maxNumSize, padMinus));
        }
        result.push(`${line.join(" ")}`);
      }
      if (maxJ !== columns) {
        result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
      }
      if (maxI !== rows) {
        result.push(`... ${rows - maxRows} more rows`);
      }
      return result.join(`
${indentData}`);
    }
    function formatNumber(num, maxNumSize, padMinus) {
      return (num >= 0 && padMinus ? ` ${formatNumber2(num, maxNumSize - 1)}` : formatNumber2(num, maxNumSize)).padEnd(maxNumSize);
    }
    function formatNumber2(num, len) {
      let str = num.toString();
      if (str.length <= len) return str;
      let fix = num.toFixed(len);
      if (fix.length > len) {
        fix = num.toFixed(Math.max(0, len - (fix.length - len)));
      }
      if (fix.length <= len && !fix.startsWith("0.000") && !fix.startsWith("-0.000")) {
        return fix;
      }
      let exp = num.toExponential(len);
      if (exp.length > len) {
        exp = num.toExponential(Math.max(0, len - (exp.length - len)));
      }
      return exp.slice(0);
    }
    function installMathOperations(AbstractMatrix2, Matrix2) {
      AbstractMatrix2.prototype.add = function add(value) {
        if (typeof value === "number") return this.addS(value);
        return this.addM(value);
      };
      AbstractMatrix2.prototype.addS = function addS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.addM = function addM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.add = function add(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.add(value);
      };
      AbstractMatrix2.prototype.sub = function sub(value) {
        if (typeof value === "number") return this.subS(value);
        return this.subM(value);
      };
      AbstractMatrix2.prototype.subS = function subS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.subM = function subM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.sub = function sub(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sub(value);
      };
      AbstractMatrix2.prototype.subtract = AbstractMatrix2.prototype.sub;
      AbstractMatrix2.prototype.subtractS = AbstractMatrix2.prototype.subS;
      AbstractMatrix2.prototype.subtractM = AbstractMatrix2.prototype.subM;
      AbstractMatrix2.subtract = AbstractMatrix2.sub;
      AbstractMatrix2.prototype.mul = function mul(value) {
        if (typeof value === "number") return this.mulS(value);
        return this.mulM(value);
      };
      AbstractMatrix2.prototype.mulS = function mulS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.mulM = function mulM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.mul = function mul(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.mul(value);
      };
      AbstractMatrix2.prototype.multiply = AbstractMatrix2.prototype.mul;
      AbstractMatrix2.prototype.multiplyS = AbstractMatrix2.prototype.mulS;
      AbstractMatrix2.prototype.multiplyM = AbstractMatrix2.prototype.mulM;
      AbstractMatrix2.multiply = AbstractMatrix2.mul;
      AbstractMatrix2.prototype.div = function div(value) {
        if (typeof value === "number") return this.divS(value);
        return this.divM(value);
      };
      AbstractMatrix2.prototype.divS = function divS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.divM = function divM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.div = function div(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.div(value);
      };
      AbstractMatrix2.prototype.divide = AbstractMatrix2.prototype.div;
      AbstractMatrix2.prototype.divideS = AbstractMatrix2.prototype.divS;
      AbstractMatrix2.prototype.divideM = AbstractMatrix2.prototype.divM;
      AbstractMatrix2.divide = AbstractMatrix2.div;
      AbstractMatrix2.prototype.mod = function mod(value) {
        if (typeof value === "number") return this.modS(value);
        return this.modM(value);
      };
      AbstractMatrix2.prototype.modS = function modS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) % value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.modM = function modM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) % matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.mod = function mod(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.mod(value);
      };
      AbstractMatrix2.prototype.modulus = AbstractMatrix2.prototype.mod;
      AbstractMatrix2.prototype.modulusS = AbstractMatrix2.prototype.modS;
      AbstractMatrix2.prototype.modulusM = AbstractMatrix2.prototype.modM;
      AbstractMatrix2.modulus = AbstractMatrix2.mod;
      AbstractMatrix2.prototype.and = function and(value) {
        if (typeof value === "number") return this.andS(value);
        return this.andM(value);
      };
      AbstractMatrix2.prototype.andS = function andS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) & value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.andM = function andM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) & matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.and = function and(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.and(value);
      };
      AbstractMatrix2.prototype.or = function or(value) {
        if (typeof value === "number") return this.orS(value);
        return this.orM(value);
      };
      AbstractMatrix2.prototype.orS = function orS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) | value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.orM = function orM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) | matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.or = function or(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.or(value);
      };
      AbstractMatrix2.prototype.xor = function xor(value) {
        if (typeof value === "number") return this.xorS(value);
        return this.xorM(value);
      };
      AbstractMatrix2.prototype.xorS = function xorS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ^ value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.xorM = function xorM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.xor = function xor(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.xor(value);
      };
      AbstractMatrix2.prototype.leftShift = function leftShift(value) {
        if (typeof value === "number") return this.leftShiftS(value);
        return this.leftShiftM(value);
      };
      AbstractMatrix2.prototype.leftShiftS = function leftShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) << value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.leftShiftM = function leftShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) << matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.leftShift = function leftShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.leftShift(value);
      };
      AbstractMatrix2.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
        if (typeof value === "number") return this.signPropagatingRightShiftS(value);
        return this.signPropagatingRightShiftM(value);
      };
      AbstractMatrix2.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >> value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >> matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.signPropagatingRightShift(value);
      };
      AbstractMatrix2.prototype.rightShift = function rightShift(value) {
        if (typeof value === "number") return this.rightShiftS(value);
        return this.rightShiftM(value);
      };
      AbstractMatrix2.prototype.rightShiftS = function rightShiftS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >>> value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.rightShiftM = function rightShiftM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.rightShift = function rightShift(matrix, value) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.rightShift(value);
      };
      AbstractMatrix2.prototype.zeroFillRightShift = AbstractMatrix2.prototype.rightShift;
      AbstractMatrix2.prototype.zeroFillRightShiftS = AbstractMatrix2.prototype.rightShiftS;
      AbstractMatrix2.prototype.zeroFillRightShiftM = AbstractMatrix2.prototype.rightShiftM;
      AbstractMatrix2.zeroFillRightShift = AbstractMatrix2.rightShift;
      AbstractMatrix2.prototype.not = function not() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, ~this.get(i, j));
          }
        }
        return this;
      };
      AbstractMatrix2.not = function not(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.not();
      };
      AbstractMatrix2.prototype.abs = function abs2() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.abs(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.abs = function abs2(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.abs();
      };
      AbstractMatrix2.prototype.acos = function acos() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.acos(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.acos = function acos(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.acos();
      };
      AbstractMatrix2.prototype.acosh = function acosh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.acosh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.acosh = function acosh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.acosh();
      };
      AbstractMatrix2.prototype.asin = function asin() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.asin(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.asin = function asin(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.asin();
      };
      AbstractMatrix2.prototype.asinh = function asinh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.asinh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.asinh = function asinh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.asinh();
      };
      AbstractMatrix2.prototype.atan = function atan() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.atan(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.atan = function atan(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.atan();
      };
      AbstractMatrix2.prototype.atanh = function atanh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.atanh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.atanh = function atanh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.atanh();
      };
      AbstractMatrix2.prototype.cbrt = function cbrt() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.cbrt(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.cbrt = function cbrt(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cbrt();
      };
      AbstractMatrix2.prototype.ceil = function ceil() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.ceil(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.ceil = function ceil(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.ceil();
      };
      AbstractMatrix2.prototype.clz32 = function clz32() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.clz32(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.clz32 = function clz32(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.clz32();
      };
      AbstractMatrix2.prototype.cos = function cos() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.cos(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.cos = function cos(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cos();
      };
      AbstractMatrix2.prototype.cosh = function cosh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.cosh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.cosh = function cosh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.cosh();
      };
      AbstractMatrix2.prototype.exp = function exp() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.exp(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.exp = function exp(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.exp();
      };
      AbstractMatrix2.prototype.expm1 = function expm1() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.expm1(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.expm1 = function expm1(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.expm1();
      };
      AbstractMatrix2.prototype.floor = function floor() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.floor(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.floor = function floor(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.floor();
      };
      AbstractMatrix2.prototype.fround = function fround() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.fround(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.fround = function fround(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.fround();
      };
      AbstractMatrix2.prototype.log = function log() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log = function log(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log();
      };
      AbstractMatrix2.prototype.log1p = function log1p() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log1p(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log1p = function log1p(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log1p();
      };
      AbstractMatrix2.prototype.log10 = function log10() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log10(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log10 = function log10(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log10();
      };
      AbstractMatrix2.prototype.log2 = function log2() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.log2(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.log2 = function log2(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.log2();
      };
      AbstractMatrix2.prototype.round = function round() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.round(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.round = function round(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.round();
      };
      AbstractMatrix2.prototype.sign = function sign() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sign(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sign = function sign(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sign();
      };
      AbstractMatrix2.prototype.sin = function sin() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sin(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sin = function sin(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sin();
      };
      AbstractMatrix2.prototype.sinh = function sinh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sinh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sinh = function sinh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sinh();
      };
      AbstractMatrix2.prototype.sqrt = function sqrt() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.sqrt(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.sqrt = function sqrt(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.sqrt();
      };
      AbstractMatrix2.prototype.tan = function tan() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.tan(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.tan = function tan(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.tan();
      };
      AbstractMatrix2.prototype.tanh = function tanh() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.tanh(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.tanh = function tanh(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.tanh();
      };
      AbstractMatrix2.prototype.trunc = function trunc() {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, Math.trunc(this.get(i, j)));
          }
        }
        return this;
      };
      AbstractMatrix2.trunc = function trunc(matrix) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.trunc();
      };
      AbstractMatrix2.pow = function pow(matrix, arg0) {
        const newMatrix = new Matrix2(matrix);
        return newMatrix.pow(arg0);
      };
      AbstractMatrix2.prototype.pow = function pow(value) {
        if (typeof value === "number") return this.powS(value);
        return this.powM(value);
      };
      AbstractMatrix2.prototype.powS = function powS(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ** value);
          }
        }
        return this;
      };
      AbstractMatrix2.prototype.powM = function powM(matrix) {
        matrix = Matrix2.checkMatrix(matrix);
        if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
          throw new RangeError("Matrices dimensions must be equal");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) ** matrix.get(i, j));
          }
        }
        return this;
      };
    }
    function checkRowIndex(matrix, index, outer) {
      let max2 = outer ? matrix.rows : matrix.rows - 1;
      if (index < 0 || index > max2) {
        throw new RangeError("Row index out of range");
      }
    }
    function checkColumnIndex(matrix, index, outer) {
      let max2 = outer ? matrix.columns : matrix.columns - 1;
      if (index < 0 || index > max2) {
        throw new RangeError("Column index out of range");
      }
    }
    function checkRowVector(matrix, vector) {
      if (vector.to1DArray) {
        vector = vector.to1DArray();
      }
      if (vector.length !== matrix.columns) {
        throw new RangeError(
          "vector size must be the same as the number of columns"
        );
      }
      return vector;
    }
    function checkColumnVector(matrix, vector) {
      if (vector.to1DArray) {
        vector = vector.to1DArray();
      }
      if (vector.length !== matrix.rows) {
        throw new RangeError("vector size must be the same as the number of rows");
      }
      return vector;
    }
    function checkRowIndices(matrix, rowIndices) {
      if (!isAnyArray.isAnyArray(rowIndices)) {
        throw new TypeError("row indices must be an array");
      }
      for (let i = 0; i < rowIndices.length; i++) {
        if (rowIndices[i] < 0 || rowIndices[i] >= matrix.rows) {
          throw new RangeError("row indices are out of range");
        }
      }
    }
    function checkColumnIndices(matrix, columnIndices) {
      if (!isAnyArray.isAnyArray(columnIndices)) {
        throw new TypeError("column indices must be an array");
      }
      for (let i = 0; i < columnIndices.length; i++) {
        if (columnIndices[i] < 0 || columnIndices[i] >= matrix.columns) {
          throw new RangeError("column indices are out of range");
        }
      }
    }
    function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
      if (arguments.length !== 5) {
        throw new RangeError("expected 4 arguments");
      }
      checkNumber("startRow", startRow);
      checkNumber("endRow", endRow);
      checkNumber("startColumn", startColumn);
      checkNumber("endColumn", endColumn);
      if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix.rows || endRow < 0 || endRow >= matrix.rows || startColumn < 0 || startColumn >= matrix.columns || endColumn < 0 || endColumn >= matrix.columns) {
        throw new RangeError("Submatrix indices are out of range");
      }
    }
    function newArray(length, value = 0) {
      let array2 = [];
      for (let i = 0; i < length; i++) {
        array2.push(value);
      }
      return array2;
    }
    function checkNumber(name, value) {
      if (typeof value !== "number") {
        throw new TypeError(`${name} must be a number`);
      }
    }
    function checkNonEmpty(matrix) {
      if (matrix.isEmpty()) {
        throw new Error("Empty matrix has no elements to index");
      }
    }
    function sumByRow(matrix) {
      let sum = newArray(matrix.rows);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[i] += matrix.get(i, j);
        }
      }
      return sum;
    }
    function sumByColumn(matrix) {
      let sum = newArray(matrix.columns);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[j] += matrix.get(i, j);
        }
      }
      return sum;
    }
    function sumAll(matrix) {
      let v = 0;
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          v += matrix.get(i, j);
        }
      }
      return v;
    }
    function productByRow(matrix) {
      let sum = newArray(matrix.rows, 1);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[i] *= matrix.get(i, j);
        }
      }
      return sum;
    }
    function productByColumn(matrix) {
      let sum = newArray(matrix.columns, 1);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.columns; ++j) {
          sum[j] *= matrix.get(i, j);
        }
      }
      return sum;
    }
    function productAll(matrix) {
      let v = 1;
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          v *= matrix.get(i, j);
        }
      }
      return v;
    }
    function varianceByRow(matrix, unbiased, mean) {
      const rows = matrix.rows;
      const cols = matrix.columns;
      const variance = [];
      for (let i = 0; i < rows; i++) {
        let sum1 = 0;
        let sum2 = 0;
        let x = 0;
        for (let j = 0; j < cols; j++) {
          x = matrix.get(i, j) - mean[i];
          sum1 += x;
          sum2 += x * x;
        }
        if (unbiased) {
          variance.push((sum2 - sum1 * sum1 / cols) / (cols - 1));
        } else {
          variance.push((sum2 - sum1 * sum1 / cols) / cols);
        }
      }
      return variance;
    }
    function varianceByColumn(matrix, unbiased, mean) {
      const rows = matrix.rows;
      const cols = matrix.columns;
      const variance = [];
      for (let j = 0; j < cols; j++) {
        let sum1 = 0;
        let sum2 = 0;
        let x = 0;
        for (let i = 0; i < rows; i++) {
          x = matrix.get(i, j) - mean[j];
          sum1 += x;
          sum2 += x * x;
        }
        if (unbiased) {
          variance.push((sum2 - sum1 * sum1 / rows) / (rows - 1));
        } else {
          variance.push((sum2 - sum1 * sum1 / rows) / rows);
        }
      }
      return variance;
    }
    function varianceAll(matrix, unbiased, mean) {
      const rows = matrix.rows;
      const cols = matrix.columns;
      const size = rows * cols;
      let sum1 = 0;
      let sum2 = 0;
      let x = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          x = matrix.get(i, j) - mean;
          sum1 += x;
          sum2 += x * x;
        }
      }
      if (unbiased) {
        return (sum2 - sum1 * sum1 / size) / (size - 1);
      } else {
        return (sum2 - sum1 * sum1 / size) / size;
      }
    }
    function centerByRow(matrix, mean) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) - mean[i]);
        }
      }
    }
    function centerByColumn(matrix, mean) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) - mean[j]);
        }
      }
    }
    function centerAll(matrix, mean) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) - mean);
        }
      }
    }
    function getScaleByRow(matrix) {
      const scale = [];
      for (let i = 0; i < matrix.rows; i++) {
        let sum = 0;
        for (let j = 0; j < matrix.columns; j++) {
          sum += matrix.get(i, j) ** 2 / (matrix.columns - 1);
        }
        scale.push(Math.sqrt(sum));
      }
      return scale;
    }
    function scaleByRow(matrix, scale) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) / scale[i]);
        }
      }
    }
    function getScaleByColumn(matrix) {
      const scale = [];
      for (let j = 0; j < matrix.columns; j++) {
        let sum = 0;
        for (let i = 0; i < matrix.rows; i++) {
          sum += matrix.get(i, j) ** 2 / (matrix.rows - 1);
        }
        scale.push(Math.sqrt(sum));
      }
      return scale;
    }
    function scaleByColumn(matrix, scale) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) / scale[j]);
        }
      }
    }
    function getScaleAll(matrix) {
      const divider = matrix.size - 1;
      let sum = 0;
      for (let j = 0; j < matrix.columns; j++) {
        for (let i = 0; i < matrix.rows; i++) {
          sum += matrix.get(i, j) ** 2 / divider;
        }
      }
      return Math.sqrt(sum);
    }
    function scaleAll(matrix, scale) {
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          matrix.set(i, j, matrix.get(i, j) / scale);
        }
      }
    }
    var AbstractMatrix = class _AbstractMatrix {
      static from1DArray(newRows, newColumns, newData) {
        let length = newRows * newColumns;
        if (length !== newData.length) {
          throw new RangeError("data length does not match given dimensions");
        }
        let newMatrix = new Matrix(newRows, newColumns);
        for (let row = 0; row < newRows; row++) {
          for (let column = 0; column < newColumns; column++) {
            newMatrix.set(row, column, newData[row * newColumns + column]);
          }
        }
        return newMatrix;
      }
      static rowVector(newData) {
        let vector = new Matrix(1, newData.length);
        for (let i = 0; i < newData.length; i++) {
          vector.set(0, i, newData[i]);
        }
        return vector;
      }
      static columnVector(newData) {
        let vector = new Matrix(newData.length, 1);
        for (let i = 0; i < newData.length; i++) {
          vector.set(i, 0, newData[i]);
        }
        return vector;
      }
      static zeros(rows, columns) {
        return new Matrix(rows, columns);
      }
      static ones(rows, columns) {
        return new Matrix(rows, columns).fill(1);
      }
      static rand(rows, columns, options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { random = Math.random } = options;
        let matrix = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            matrix.set(i, j, random());
          }
        }
        return matrix;
      }
      static randInt(rows, columns, options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { min: min2 = 0, max: max2 = 1e3, random = Math.random } = options;
        if (!Number.isInteger(min2)) throw new TypeError("min must be an integer");
        if (!Number.isInteger(max2)) throw new TypeError("max must be an integer");
        if (min2 >= max2) throw new RangeError("min must be smaller than max");
        let interval2 = max2 - min2;
        let matrix = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            let value = min2 + Math.round(random() * interval2);
            matrix.set(i, j, value);
          }
        }
        return matrix;
      }
      static eye(rows, columns, value) {
        if (columns === void 0) columns = rows;
        if (value === void 0) value = 1;
        let min2 = Math.min(rows, columns);
        let matrix = this.zeros(rows, columns);
        for (let i = 0; i < min2; i++) {
          matrix.set(i, i, value);
        }
        return matrix;
      }
      static diag(data, rows, columns) {
        let l = data.length;
        if (rows === void 0) rows = l;
        if (columns === void 0) columns = rows;
        let min2 = Math.min(l, rows, columns);
        let matrix = this.zeros(rows, columns);
        for (let i = 0; i < min2; i++) {
          matrix.set(i, i, data[i]);
        }
        return matrix;
      }
      static min(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        let rows = matrix1.rows;
        let columns = matrix1.columns;
        let result = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
          }
        }
        return result;
      }
      static max(matrix1, matrix2) {
        matrix1 = this.checkMatrix(matrix1);
        matrix2 = this.checkMatrix(matrix2);
        let rows = matrix1.rows;
        let columns = matrix1.columns;
        let result = new this(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
          }
        }
        return result;
      }
      static checkMatrix(value) {
        return _AbstractMatrix.isMatrix(value) ? value : new Matrix(value);
      }
      static isMatrix(value) {
        return value != null && value.klass === "Matrix";
      }
      get size() {
        return this.rows * this.columns;
      }
      apply(callback) {
        if (typeof callback !== "function") {
          throw new TypeError("callback must be a function");
        }
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            callback.call(this, i, j);
          }
        }
        return this;
      }
      to1DArray() {
        let array2 = [];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            array2.push(this.get(i, j));
          }
        }
        return array2;
      }
      to2DArray() {
        let copy = [];
        for (let i = 0; i < this.rows; i++) {
          copy.push([]);
          for (let j = 0; j < this.columns; j++) {
            copy[i].push(this.get(i, j));
          }
        }
        return copy;
      }
      toJSON() {
        return this.to2DArray();
      }
      isRowVector() {
        return this.rows === 1;
      }
      isColumnVector() {
        return this.columns === 1;
      }
      isVector() {
        return this.rows === 1 || this.columns === 1;
      }
      isSquare() {
        return this.rows === this.columns;
      }
      isEmpty() {
        return this.rows === 0 || this.columns === 0;
      }
      isSymmetric() {
        if (this.isSquare()) {
          for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j <= i; j++) {
              if (this.get(i, j) !== this.get(j, i)) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }
      isDistance() {
        if (!this.isSymmetric()) return false;
        for (let i = 0; i < this.rows; i++) {
          if (this.get(i, i) !== 0) return false;
        }
        return true;
      }
      isEchelonForm() {
        let i = 0;
        let j = 0;
        let previousColumn = -1;
        let isEchelonForm = true;
        let checked = false;
        while (i < this.rows && isEchelonForm) {
          j = 0;
          checked = false;
          while (j < this.columns && checked === false) {
            if (this.get(i, j) === 0) {
              j++;
            } else if (this.get(i, j) === 1 && j > previousColumn) {
              checked = true;
              previousColumn = j;
            } else {
              isEchelonForm = false;
              checked = true;
            }
          }
          i++;
        }
        return isEchelonForm;
      }
      isReducedEchelonForm() {
        let i = 0;
        let j = 0;
        let previousColumn = -1;
        let isReducedEchelonForm = true;
        let checked = false;
        while (i < this.rows && isReducedEchelonForm) {
          j = 0;
          checked = false;
          while (j < this.columns && checked === false) {
            if (this.get(i, j) === 0) {
              j++;
            } else if (this.get(i, j) === 1 && j > previousColumn) {
              checked = true;
              previousColumn = j;
            } else {
              isReducedEchelonForm = false;
              checked = true;
            }
          }
          for (let k = j + 1; k < this.rows; k++) {
            if (this.get(i, k) !== 0) {
              isReducedEchelonForm = false;
            }
          }
          i++;
        }
        return isReducedEchelonForm;
      }
      echelonForm() {
        let result = this.clone();
        let h = 0;
        let k = 0;
        while (h < result.rows && k < result.columns) {
          let iMax = h;
          for (let i = h; i < result.rows; i++) {
            if (result.get(i, k) > result.get(iMax, k)) {
              iMax = i;
            }
          }
          if (result.get(iMax, k) === 0) {
            k++;
          } else {
            result.swapRows(h, iMax);
            let tmp = result.get(h, k);
            for (let j = k; j < result.columns; j++) {
              result.set(h, j, result.get(h, j) / tmp);
            }
            for (let i = h + 1; i < result.rows; i++) {
              let factor = result.get(i, k) / result.get(h, k);
              result.set(i, k, 0);
              for (let j = k + 1; j < result.columns; j++) {
                result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
              }
            }
            h++;
            k++;
          }
        }
        return result;
      }
      reducedEchelonForm() {
        let result = this.echelonForm();
        let m = result.columns;
        let n = result.rows;
        let h = n - 1;
        while (h >= 0) {
          if (result.maxRow(h) === 0) {
            h--;
          } else {
            let p = 0;
            let pivot = false;
            while (p < n && pivot === false) {
              if (result.get(h, p) === 1) {
                pivot = true;
              } else {
                p++;
              }
            }
            for (let i = 0; i < h; i++) {
              let factor = result.get(i, p);
              for (let j = p; j < m; j++) {
                let tmp = result.get(i, j) - factor * result.get(h, j);
                result.set(i, j, tmp);
              }
            }
            h--;
          }
        }
        return result;
      }
      set() {
        throw new Error("set method is unimplemented");
      }
      get() {
        throw new Error("get method is unimplemented");
      }
      repeat(options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { rows = 1, columns = 1 } = options;
        if (!Number.isInteger(rows) || rows <= 0) {
          throw new TypeError("rows must be a positive integer");
        }
        if (!Number.isInteger(columns) || columns <= 0) {
          throw new TypeError("columns must be a positive integer");
        }
        let matrix = new Matrix(this.rows * rows, this.columns * columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            matrix.setSubMatrix(this, this.rows * i, this.columns * j);
          }
        }
        return matrix;
      }
      fill(value) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, value);
          }
        }
        return this;
      }
      neg() {
        return this.mulS(-1);
      }
      getRow(index) {
        checkRowIndex(this, index);
        let row = [];
        for (let i = 0; i < this.columns; i++) {
          row.push(this.get(index, i));
        }
        return row;
      }
      getRowVector(index) {
        return Matrix.rowVector(this.getRow(index));
      }
      setRow(index, array2) {
        checkRowIndex(this, index);
        array2 = checkRowVector(this, array2);
        for (let i = 0; i < this.columns; i++) {
          this.set(index, i, array2[i]);
        }
        return this;
      }
      swapRows(row1, row2) {
        checkRowIndex(this, row1);
        checkRowIndex(this, row2);
        for (let i = 0; i < this.columns; i++) {
          let temp = this.get(row1, i);
          this.set(row1, i, this.get(row2, i));
          this.set(row2, i, temp);
        }
        return this;
      }
      getColumn(index) {
        checkColumnIndex(this, index);
        let column = [];
        for (let i = 0; i < this.rows; i++) {
          column.push(this.get(i, index));
        }
        return column;
      }
      getColumnVector(index) {
        return Matrix.columnVector(this.getColumn(index));
      }
      setColumn(index, array2) {
        checkColumnIndex(this, index);
        array2 = checkColumnVector(this, array2);
        for (let i = 0; i < this.rows; i++) {
          this.set(i, index, array2[i]);
        }
        return this;
      }
      swapColumns(column1, column2) {
        checkColumnIndex(this, column1);
        checkColumnIndex(this, column2);
        for (let i = 0; i < this.rows; i++) {
          let temp = this.get(i, column1);
          this.set(i, column1, this.get(i, column2));
          this.set(i, column2, temp);
        }
        return this;
      }
      addRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + vector[j]);
          }
        }
        return this;
      }
      subRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - vector[j]);
          }
        }
        return this;
      }
      mulRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * vector[j]);
          }
        }
        return this;
      }
      divRowVector(vector) {
        vector = checkRowVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / vector[j]);
          }
        }
        return this;
      }
      addColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) + vector[i]);
          }
        }
        return this;
      }
      subColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) - vector[i]);
          }
        }
        return this;
      }
      mulColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) * vector[i]);
          }
        }
        return this;
      }
      divColumnVector(vector) {
        vector = checkColumnVector(this, vector);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            this.set(i, j, this.get(i, j) / vector[i]);
          }
        }
        return this;
      }
      mulRow(index, value) {
        checkRowIndex(this, index);
        for (let i = 0; i < this.columns; i++) {
          this.set(index, i, this.get(index, i) * value);
        }
        return this;
      }
      mulColumn(index, value) {
        checkColumnIndex(this, index);
        for (let i = 0; i < this.rows; i++) {
          this.set(i, index, this.get(i, index) * value);
        }
        return this;
      }
      max(by) {
        if (this.isEmpty()) {
          return NaN;
        }
        switch (by) {
          case "row": {
            const max2 = new Array(this.rows).fill(Number.NEGATIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) > max2[row]) {
                  max2[row] = this.get(row, column);
                }
              }
            }
            return max2;
          }
          case "column": {
            const max2 = new Array(this.columns).fill(Number.NEGATIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) > max2[column]) {
                  max2[column] = this.get(row, column);
                }
              }
            }
            return max2;
          }
          case void 0: {
            let max2 = this.get(0, 0);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) > max2) {
                  max2 = this.get(row, column);
                }
              }
            }
            return max2;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      maxIndex() {
        checkNonEmpty(this);
        let v = this.get(0, 0);
        let idx = [0, 0];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            if (this.get(i, j) > v) {
              v = this.get(i, j);
              idx[0] = i;
              idx[1] = j;
            }
          }
        }
        return idx;
      }
      min(by) {
        if (this.isEmpty()) {
          return NaN;
        }
        switch (by) {
          case "row": {
            const min2 = new Array(this.rows).fill(Number.POSITIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) < min2[row]) {
                  min2[row] = this.get(row, column);
                }
              }
            }
            return min2;
          }
          case "column": {
            const min2 = new Array(this.columns).fill(Number.POSITIVE_INFINITY);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) < min2[column]) {
                  min2[column] = this.get(row, column);
                }
              }
            }
            return min2;
          }
          case void 0: {
            let min2 = this.get(0, 0);
            for (let row = 0; row < this.rows; row++) {
              for (let column = 0; column < this.columns; column++) {
                if (this.get(row, column) < min2) {
                  min2 = this.get(row, column);
                }
              }
            }
            return min2;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      minIndex() {
        checkNonEmpty(this);
        let v = this.get(0, 0);
        let idx = [0, 0];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            if (this.get(i, j) < v) {
              v = this.get(i, j);
              idx[0] = i;
              idx[1] = j;
            }
          }
        }
        return idx;
      }
      maxRow(row) {
        checkRowIndex(this, row);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(row, 0);
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) > v) {
            v = this.get(row, i);
          }
        }
        return v;
      }
      maxRowIndex(row) {
        checkRowIndex(this, row);
        checkNonEmpty(this);
        let v = this.get(row, 0);
        let idx = [row, 0];
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) > v) {
            v = this.get(row, i);
            idx[1] = i;
          }
        }
        return idx;
      }
      minRow(row) {
        checkRowIndex(this, row);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(row, 0);
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) < v) {
            v = this.get(row, i);
          }
        }
        return v;
      }
      minRowIndex(row) {
        checkRowIndex(this, row);
        checkNonEmpty(this);
        let v = this.get(row, 0);
        let idx = [row, 0];
        for (let i = 1; i < this.columns; i++) {
          if (this.get(row, i) < v) {
            v = this.get(row, i);
            idx[1] = i;
          }
        }
        return idx;
      }
      maxColumn(column) {
        checkColumnIndex(this, column);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(0, column);
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) > v) {
            v = this.get(i, column);
          }
        }
        return v;
      }
      maxColumnIndex(column) {
        checkColumnIndex(this, column);
        checkNonEmpty(this);
        let v = this.get(0, column);
        let idx = [0, column];
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) > v) {
            v = this.get(i, column);
            idx[0] = i;
          }
        }
        return idx;
      }
      minColumn(column) {
        checkColumnIndex(this, column);
        if (this.isEmpty()) {
          return NaN;
        }
        let v = this.get(0, column);
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) < v) {
            v = this.get(i, column);
          }
        }
        return v;
      }
      minColumnIndex(column) {
        checkColumnIndex(this, column);
        checkNonEmpty(this);
        let v = this.get(0, column);
        let idx = [0, column];
        for (let i = 1; i < this.rows; i++) {
          if (this.get(i, column) < v) {
            v = this.get(i, column);
            idx[0] = i;
          }
        }
        return idx;
      }
      diag() {
        let min2 = Math.min(this.rows, this.columns);
        let diag = [];
        for (let i = 0; i < min2; i++) {
          diag.push(this.get(i, i));
        }
        return diag;
      }
      norm(type2 = "frobenius") {
        switch (type2) {
          case "max":
            return this.max();
          case "frobenius":
            return Math.sqrt(this.dot(this));
          default:
            throw new RangeError(`unknown norm type: ${type2}`);
        }
      }
      cumulativeSum() {
        let sum = 0;
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            sum += this.get(i, j);
            this.set(i, j, sum);
          }
        }
        return this;
      }
      dot(vector2) {
        if (_AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
        let vector1 = this.to1DArray();
        if (vector1.length !== vector2.length) {
          throw new RangeError("vectors do not have the same size");
        }
        let dot = 0;
        for (let i = 0; i < vector1.length; i++) {
          dot += vector1[i] * vector2[i];
        }
        return dot;
      }
      mmul(other) {
        other = Matrix.checkMatrix(other);
        let m = this.rows;
        let n = this.columns;
        let p = other.columns;
        let result = new Matrix(m, p);
        let Bcolj = new Float64Array(n);
        for (let j = 0; j < p; j++) {
          for (let k = 0; k < n; k++) {
            Bcolj[k] = other.get(k, j);
          }
          for (let i = 0; i < m; i++) {
            let s = 0;
            for (let k = 0; k < n; k++) {
              s += this.get(i, k) * Bcolj[k];
            }
            result.set(i, j, s);
          }
        }
        return result;
      }
      mpow(scalar) {
        if (!this.isSquare()) {
          throw new RangeError("Matrix must be square");
        }
        if (!Number.isInteger(scalar) || scalar < 0) {
          throw new RangeError("Exponent must be a non-negative integer");
        }
        let result = Matrix.eye(this.rows);
        let bb = this;
        for (let e = scalar; e >= 1; e /= 2) {
          if ((e & 1) !== 0) {
            result = result.mmul(bb);
          }
          bb = bb.mmul(bb);
        }
        return result;
      }
      strassen2x2(other) {
        other = Matrix.checkMatrix(other);
        let result = new Matrix(2, 2);
        const a11 = this.get(0, 0);
        const b11 = other.get(0, 0);
        const a12 = this.get(0, 1);
        const b12 = other.get(0, 1);
        const a21 = this.get(1, 0);
        const b21 = other.get(1, 0);
        const a22 = this.get(1, 1);
        const b22 = other.get(1, 1);
        const m1 = (a11 + a22) * (b11 + b22);
        const m2 = (a21 + a22) * b11;
        const m3 = a11 * (b12 - b22);
        const m4 = a22 * (b21 - b11);
        const m5 = (a11 + a12) * b22;
        const m6 = (a21 - a11) * (b11 + b12);
        const m7 = (a12 - a22) * (b21 + b22);
        const c00 = m1 + m4 - m5 + m7;
        const c01 = m3 + m5;
        const c10 = m2 + m4;
        const c11 = m1 - m2 + m3 + m6;
        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        return result;
      }
      strassen3x3(other) {
        other = Matrix.checkMatrix(other);
        let result = new Matrix(3, 3);
        const a00 = this.get(0, 0);
        const a01 = this.get(0, 1);
        const a02 = this.get(0, 2);
        const a10 = this.get(1, 0);
        const a11 = this.get(1, 1);
        const a12 = this.get(1, 2);
        const a20 = this.get(2, 0);
        const a21 = this.get(2, 1);
        const a22 = this.get(2, 2);
        const b00 = other.get(0, 0);
        const b01 = other.get(0, 1);
        const b02 = other.get(0, 2);
        const b10 = other.get(1, 0);
        const b11 = other.get(1, 1);
        const b12 = other.get(1, 2);
        const b20 = other.get(2, 0);
        const b21 = other.get(2, 1);
        const b22 = other.get(2, 2);
        const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
        const m2 = (a00 - a10) * (-b01 + b11);
        const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
        const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
        const m5 = (a10 + a11) * (-b00 + b01);
        const m6 = a00 * b00;
        const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
        const m8 = (-a00 + a20) * (b02 - b12);
        const m9 = (a20 + a21) * (-b00 + b02);
        const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
        const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
        const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
        const m13 = (a02 - a22) * (b11 - b21);
        const m14 = a02 * b20;
        const m15 = (a21 + a22) * (-b20 + b21);
        const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
        const m17 = (a02 - a12) * (b12 - b22);
        const m18 = (a11 + a12) * (-b20 + b22);
        const m19 = a01 * b10;
        const m20 = a12 * b21;
        const m21 = a10 * b02;
        const m22 = a20 * b01;
        const m23 = a22 * b22;
        const c00 = m6 + m14 + m19;
        const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
        const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
        const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
        const c11 = m2 + m4 + m5 + m6 + m20;
        const c12 = m14 + m16 + m17 + m18 + m21;
        const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
        const c21 = m12 + m13 + m14 + m15 + m22;
        const c22 = m6 + m7 + m8 + m9 + m23;
        result.set(0, 0, c00);
        result.set(0, 1, c01);
        result.set(0, 2, c02);
        result.set(1, 0, c10);
        result.set(1, 1, c11);
        result.set(1, 2, c12);
        result.set(2, 0, c20);
        result.set(2, 1, c21);
        result.set(2, 2, c22);
        return result;
      }
      mmulStrassen(y) {
        y = Matrix.checkMatrix(y);
        let x = this.clone();
        let r1 = x.rows;
        let c1 = x.columns;
        let r2 = y.rows;
        let c2 = y.columns;
        if (c1 !== r2) {
          console.warn(
            `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`
          );
        }
        function embed(mat, rows, cols) {
          let r3 = mat.rows;
          let c3 = mat.columns;
          if (r3 === rows && c3 === cols) {
            return mat;
          } else {
            let resultat = _AbstractMatrix.zeros(rows, cols);
            resultat = resultat.setSubMatrix(mat, 0, 0);
            return resultat;
          }
        }
        let r = Math.max(r1, r2);
        let c = Math.max(c1, c2);
        x = embed(x, r, c);
        y = embed(y, r, c);
        function blockMult(a, b, rows, cols) {
          if (rows <= 512 || cols <= 512) {
            return a.mmul(b);
          }
          if (rows % 2 === 1 && cols % 2 === 1) {
            a = embed(a, rows + 1, cols + 1);
            b = embed(b, rows + 1, cols + 1);
          } else if (rows % 2 === 1) {
            a = embed(a, rows + 1, cols);
            b = embed(b, rows + 1, cols);
          } else if (cols % 2 === 1) {
            a = embed(a, rows, cols + 1);
            b = embed(b, rows, cols + 1);
          }
          let halfRows = parseInt(a.rows / 2, 10);
          let halfCols = parseInt(a.columns / 2, 10);
          let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
          let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);
          let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
          let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);
          let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
          let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);
          let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
          let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);
          let m1 = blockMult(
            _AbstractMatrix.add(a11, a22),
            _AbstractMatrix.add(b11, b22),
            halfRows,
            halfCols
          );
          let m2 = blockMult(_AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
          let m3 = blockMult(a11, _AbstractMatrix.sub(b12, b22), halfRows, halfCols);
          let m4 = blockMult(a22, _AbstractMatrix.sub(b21, b11), halfRows, halfCols);
          let m5 = blockMult(_AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
          let m6 = blockMult(
            _AbstractMatrix.sub(a21, a11),
            _AbstractMatrix.add(b11, b12),
            halfRows,
            halfCols
          );
          let m7 = blockMult(
            _AbstractMatrix.sub(a12, a22),
            _AbstractMatrix.add(b21, b22),
            halfRows,
            halfCols
          );
          let c11 = _AbstractMatrix.add(m1, m4);
          c11.sub(m5);
          c11.add(m7);
          let c12 = _AbstractMatrix.add(m3, m5);
          let c21 = _AbstractMatrix.add(m2, m4);
          let c22 = _AbstractMatrix.sub(m1, m2);
          c22.add(m3);
          c22.add(m6);
          let result = _AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
          result = result.setSubMatrix(c11, 0, 0);
          result = result.setSubMatrix(c12, c11.rows, 0);
          result = result.setSubMatrix(c21, 0, c11.columns);
          result = result.setSubMatrix(c22, c11.rows, c11.columns);
          return result.subMatrix(0, rows - 1, 0, cols - 1);
        }
        return blockMult(x, y, r, c);
      }
      scaleRows(options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { min: min2 = 0, max: max2 = 1 } = options;
        if (!Number.isFinite(min2)) throw new TypeError("min must be a number");
        if (!Number.isFinite(max2)) throw new TypeError("max must be a number");
        if (min2 >= max2) throw new RangeError("min must be smaller than max");
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; i++) {
          const row = this.getRow(i);
          if (row.length > 0) {
            rescale(row, { min: min2, max: max2, output: row });
          }
          newMatrix.setRow(i, row);
        }
        return newMatrix;
      }
      scaleColumns(options = {}) {
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { min: min2 = 0, max: max2 = 1 } = options;
        if (!Number.isFinite(min2)) throw new TypeError("min must be a number");
        if (!Number.isFinite(max2)) throw new TypeError("max must be a number");
        if (min2 >= max2) throw new RangeError("min must be smaller than max");
        let newMatrix = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.columns; i++) {
          const column = this.getColumn(i);
          if (column.length) {
            rescale(column, {
              min: min2,
              max: max2,
              output: column
            });
          }
          newMatrix.setColumn(i, column);
        }
        return newMatrix;
      }
      flipRows() {
        const middle = Math.ceil(this.columns / 2);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < middle; j++) {
            let first = this.get(i, j);
            let last = this.get(i, this.columns - 1 - j);
            this.set(i, j, last);
            this.set(i, this.columns - 1 - j, first);
          }
        }
        return this;
      }
      flipColumns() {
        const middle = Math.ceil(this.rows / 2);
        for (let j = 0; j < this.columns; j++) {
          for (let i = 0; i < middle; i++) {
            let first = this.get(i, j);
            let last = this.get(this.rows - 1 - i, j);
            this.set(i, j, last);
            this.set(this.rows - 1 - i, j, first);
          }
        }
        return this;
      }
      kroneckerProduct(other) {
        other = Matrix.checkMatrix(other);
        let m = this.rows;
        let n = this.columns;
        let p = other.rows;
        let q = other.columns;
        let result = new Matrix(m * p, n * q);
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            for (let k = 0; k < p; k++) {
              for (let l = 0; l < q; l++) {
                result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
              }
            }
          }
        }
        return result;
      }
      kroneckerSum(other) {
        other = Matrix.checkMatrix(other);
        if (!this.isSquare() || !other.isSquare()) {
          throw new Error("Kronecker Sum needs two Square Matrices");
        }
        let m = this.rows;
        let n = other.rows;
        let AxI = this.kroneckerProduct(Matrix.eye(n, n));
        let IxB = Matrix.eye(m, m).kroneckerProduct(other);
        return AxI.add(IxB);
      }
      transpose() {
        let result = new Matrix(this.columns, this.rows);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            result.set(j, i, this.get(i, j));
          }
        }
        return result;
      }
      sortRows(compareFunction = compareNumbers) {
        for (let i = 0; i < this.rows; i++) {
          this.setRow(i, this.getRow(i).sort(compareFunction));
        }
        return this;
      }
      sortColumns(compareFunction = compareNumbers) {
        for (let i = 0; i < this.columns; i++) {
          this.setColumn(i, this.getColumn(i).sort(compareFunction));
        }
        return this;
      }
      subMatrix(startRow, endRow, startColumn, endColumn) {
        checkRange(this, startRow, endRow, startColumn, endColumn);
        let newMatrix = new Matrix(
          endRow - startRow + 1,
          endColumn - startColumn + 1
        );
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startColumn; j <= endColumn; j++) {
            newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
          }
        }
        return newMatrix;
      }
      subMatrixRow(indices, startColumn, endColumn) {
        if (startColumn === void 0) startColumn = 0;
        if (endColumn === void 0) endColumn = this.columns - 1;
        if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
          throw new RangeError("Argument out of range");
        }
        let newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
        for (let i = 0; i < indices.length; i++) {
          for (let j = startColumn; j <= endColumn; j++) {
            if (indices[i] < 0 || indices[i] >= this.rows) {
              throw new RangeError(`Row index out of range: ${indices[i]}`);
            }
            newMatrix.set(i, j - startColumn, this.get(indices[i], j));
          }
        }
        return newMatrix;
      }
      subMatrixColumn(indices, startRow, endRow) {
        if (startRow === void 0) startRow = 0;
        if (endRow === void 0) endRow = this.rows - 1;
        if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
          throw new RangeError("Argument out of range");
        }
        let newMatrix = new Matrix(endRow - startRow + 1, indices.length);
        for (let i = 0; i < indices.length; i++) {
          for (let j = startRow; j <= endRow; j++) {
            if (indices[i] < 0 || indices[i] >= this.columns) {
              throw new RangeError(`Column index out of range: ${indices[i]}`);
            }
            newMatrix.set(j - startRow, i, this.get(j, indices[i]));
          }
        }
        return newMatrix;
      }
      setSubMatrix(matrix, startRow, startColumn) {
        matrix = Matrix.checkMatrix(matrix);
        if (matrix.isEmpty()) {
          return this;
        }
        let endRow = startRow + matrix.rows - 1;
        let endColumn = startColumn + matrix.columns - 1;
        checkRange(this, startRow, endRow, startColumn, endColumn);
        for (let i = 0; i < matrix.rows; i++) {
          for (let j = 0; j < matrix.columns; j++) {
            this.set(startRow + i, startColumn + j, matrix.get(i, j));
          }
        }
        return this;
      }
      selection(rowIndices, columnIndices) {
        checkRowIndices(this, rowIndices);
        checkColumnIndices(this, columnIndices);
        let newMatrix = new Matrix(rowIndices.length, columnIndices.length);
        for (let i = 0; i < rowIndices.length; i++) {
          let rowIndex = rowIndices[i];
          for (let j = 0; j < columnIndices.length; j++) {
            let columnIndex = columnIndices[j];
            newMatrix.set(i, j, this.get(rowIndex, columnIndex));
          }
        }
        return newMatrix;
      }
      trace() {
        let min2 = Math.min(this.rows, this.columns);
        let trace = 0;
        for (let i = 0; i < min2; i++) {
          trace += this.get(i, i);
        }
        return trace;
      }
      clone() {
        return this.constructor.copy(this, new Matrix(this.rows, this.columns));
      }
      /**
       * @template {AbstractMatrix} M
       * @param {AbstractMatrix} from
       * @param {M} to
       * @return {M}
       */
      static copy(from, to) {
        for (const [row, column, value] of from.entries()) {
          to.set(row, column, value);
        }
        return to;
      }
      sum(by) {
        switch (by) {
          case "row":
            return sumByRow(this);
          case "column":
            return sumByColumn(this);
          case void 0:
            return sumAll(this);
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      product(by) {
        switch (by) {
          case "row":
            return productByRow(this);
          case "column":
            return productByColumn(this);
          case void 0:
            return productAll(this);
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      mean(by) {
        const sum = this.sum(by);
        switch (by) {
          case "row": {
            for (let i = 0; i < this.rows; i++) {
              sum[i] /= this.columns;
            }
            return sum;
          }
          case "column": {
            for (let i = 0; i < this.columns; i++) {
              sum[i] /= this.rows;
            }
            return sum;
          }
          case void 0:
            return sum / this.size;
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      variance(by, options = {}) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { unbiased = true, mean = this.mean(by) } = options;
        if (typeof unbiased !== "boolean") {
          throw new TypeError("unbiased must be a boolean");
        }
        switch (by) {
          case "row": {
            if (!isAnyArray.isAnyArray(mean)) {
              throw new TypeError("mean must be an array");
            }
            return varianceByRow(this, unbiased, mean);
          }
          case "column": {
            if (!isAnyArray.isAnyArray(mean)) {
              throw new TypeError("mean must be an array");
            }
            return varianceByColumn(this, unbiased, mean);
          }
          case void 0: {
            if (typeof mean !== "number") {
              throw new TypeError("mean must be a number");
            }
            return varianceAll(this, unbiased, mean);
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      standardDeviation(by, options) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        const variance = this.variance(by, options);
        if (by === void 0) {
          return Math.sqrt(variance);
        } else {
          for (let i = 0; i < variance.length; i++) {
            variance[i] = Math.sqrt(variance[i]);
          }
          return variance;
        }
      }
      center(by, options = {}) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        const { center = this.mean(by) } = options;
        switch (by) {
          case "row": {
            if (!isAnyArray.isAnyArray(center)) {
              throw new TypeError("center must be an array");
            }
            centerByRow(this, center);
            return this;
          }
          case "column": {
            if (!isAnyArray.isAnyArray(center)) {
              throw new TypeError("center must be an array");
            }
            centerByColumn(this, center);
            return this;
          }
          case void 0: {
            if (typeof center !== "number") {
              throw new TypeError("center must be a number");
            }
            centerAll(this, center);
            return this;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      scale(by, options = {}) {
        if (typeof by === "object") {
          options = by;
          by = void 0;
        }
        if (typeof options !== "object") {
          throw new TypeError("options must be an object");
        }
        let scale = options.scale;
        switch (by) {
          case "row": {
            if (scale === void 0) {
              scale = getScaleByRow(this);
            } else if (!isAnyArray.isAnyArray(scale)) {
              throw new TypeError("scale must be an array");
            }
            scaleByRow(this, scale);
            return this;
          }
          case "column": {
            if (scale === void 0) {
              scale = getScaleByColumn(this);
            } else if (!isAnyArray.isAnyArray(scale)) {
              throw new TypeError("scale must be an array");
            }
            scaleByColumn(this, scale);
            return this;
          }
          case void 0: {
            if (scale === void 0) {
              scale = getScaleAll(this);
            } else if (typeof scale !== "number") {
              throw new TypeError("scale must be a number");
            }
            scaleAll(this, scale);
            return this;
          }
          default:
            throw new Error(`invalid option: ${by}`);
        }
      }
      toString(options) {
        return inspectMatrixWithOptions(this, options);
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      /**
       * iterator from left to right, from top to bottom
       * yield [row, column, value]
       * @returns {Generator<[number, number, number], void, void>}
       */
      *entries() {
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.columns; col++) {
            yield [row, col, this.get(row, col)];
          }
        }
      }
      /**
       * iterator from left to right, from top to bottom
       * yield value
       * @returns {Generator<number, void, void>}
       */
      *values() {
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.columns; col++) {
            yield this.get(row, col);
          }
        }
      }
    };
    AbstractMatrix.prototype.klass = "Matrix";
    if (typeof Symbol !== "undefined") {
      AbstractMatrix.prototype[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = inspectMatrix;
    }
    function compareNumbers(a, b) {
      return a - b;
    }
    function isArrayOfNumbers(array2) {
      return array2.every((element) => {
        return typeof element === "number";
      });
    }
    AbstractMatrix.random = AbstractMatrix.rand;
    AbstractMatrix.randomInt = AbstractMatrix.randInt;
    AbstractMatrix.diagonal = AbstractMatrix.diag;
    AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
    AbstractMatrix.identity = AbstractMatrix.eye;
    AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
    AbstractMatrix.prototype.tensorProduct = AbstractMatrix.prototype.kroneckerProduct;
    var Matrix = class _Matrix extends AbstractMatrix {
      /**
       * @type {Float64Array[]}
       */
      data;
      /**
       * Init an empty matrix
       * @param {number} nRows
       * @param {number} nColumns
       */
      #initData(nRows, nColumns) {
        this.data = [];
        if (Number.isInteger(nColumns) && nColumns >= 0) {
          for (let i = 0; i < nRows; i++) {
            this.data.push(new Float64Array(nColumns));
          }
        } else {
          throw new TypeError("nColumns must be a positive integer");
        }
        this.rows = nRows;
        this.columns = nColumns;
      }
      constructor(nRows, nColumns) {
        super();
        if (_Matrix.isMatrix(nRows)) {
          this.#initData(nRows.rows, nRows.columns);
          _Matrix.copy(nRows, this);
        } else if (Number.isInteger(nRows) && nRows >= 0) {
          this.#initData(nRows, nColumns);
        } else if (isAnyArray.isAnyArray(nRows)) {
          const arrayData = nRows;
          nRows = arrayData.length;
          nColumns = nRows ? arrayData[0].length : 0;
          if (typeof nColumns !== "number") {
            throw new TypeError(
              "Data must be a 2D array with at least one element"
            );
          }
          this.data = [];
          for (let i = 0; i < nRows; i++) {
            if (arrayData[i].length !== nColumns) {
              throw new RangeError("Inconsistent array dimensions");
            }
            if (!isArrayOfNumbers(arrayData[i])) {
              throw new TypeError("Input data contains non-numeric values");
            }
            this.data.push(Float64Array.from(arrayData[i]));
          }
          this.rows = nRows;
          this.columns = nColumns;
        } else {
          throw new TypeError(
            "First argument must be a positive number or an array"
          );
        }
      }
      set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
      }
      removeRow(index) {
        checkRowIndex(this, index);
        this.data.splice(index, 1);
        this.rows -= 1;
        return this;
      }
      addRow(index, array2) {
        if (array2 === void 0) {
          array2 = index;
          index = this.rows;
        }
        checkRowIndex(this, index, true);
        array2 = Float64Array.from(checkRowVector(this, array2));
        this.data.splice(index, 0, array2);
        this.rows += 1;
        return this;
      }
      removeColumn(index) {
        checkColumnIndex(this, index);
        for (let i = 0; i < this.rows; i++) {
          const newRow = new Float64Array(this.columns - 1);
          for (let j = 0; j < index; j++) {
            newRow[j] = this.data[i][j];
          }
          for (let j = index + 1; j < this.columns; j++) {
            newRow[j - 1] = this.data[i][j];
          }
          this.data[i] = newRow;
        }
        this.columns -= 1;
        return this;
      }
      addColumn(index, array2) {
        if (typeof array2 === "undefined") {
          array2 = index;
          index = this.columns;
        }
        checkColumnIndex(this, index, true);
        array2 = checkColumnVector(this, array2);
        for (let i = 0; i < this.rows; i++) {
          const newRow = new Float64Array(this.columns + 1);
          let j = 0;
          for (; j < index; j++) {
            newRow[j] = this.data[i][j];
          }
          newRow[j++] = array2[i];
          for (; j < this.columns + 1; j++) {
            newRow[j] = this.data[i][j - 1];
          }
          this.data[i] = newRow;
        }
        this.columns += 1;
        return this;
      }
    };
    installMathOperations(AbstractMatrix, Matrix);
    var SymmetricMatrix = class _SymmetricMatrix extends AbstractMatrix {
      /** @type {Matrix} */
      #matrix;
      get size() {
        return this.#matrix.size;
      }
      get rows() {
        return this.#matrix.rows;
      }
      get columns() {
        return this.#matrix.columns;
      }
      get diagonalSize() {
        return this.rows;
      }
      /**
       * not the same as matrix.isSymmetric()
       * Here is to check if it's instanceof SymmetricMatrix without bundling issues
       *
       * @param value
       * @returns {boolean}
       */
      static isSymmetricMatrix(value) {
        return Matrix.isMatrix(value) && value.klassType === "SymmetricMatrix";
      }
      /**
       * @param diagonalSize
       * @return {SymmetricMatrix}
       */
      static zeros(diagonalSize) {
        return new this(diagonalSize);
      }
      /**
       * @param diagonalSize
       * @return {SymmetricMatrix}
       */
      static ones(diagonalSize) {
        return new this(diagonalSize).fill(1);
      }
      /**
       * @param {number | AbstractMatrix | ArrayLike<ArrayLike<number>>} diagonalSize
       * @return {this}
       */
      constructor(diagonalSize) {
        super();
        if (Matrix.isMatrix(diagonalSize)) {
          if (!diagonalSize.isSymmetric()) {
            throw new TypeError("not symmetric data");
          }
          this.#matrix = Matrix.copy(
            diagonalSize,
            new Matrix(diagonalSize.rows, diagonalSize.rows)
          );
        } else if (Number.isInteger(diagonalSize) && diagonalSize >= 0) {
          this.#matrix = new Matrix(diagonalSize, diagonalSize);
        } else {
          this.#matrix = new Matrix(diagonalSize);
          if (!this.isSymmetric()) {
            throw new TypeError("not symmetric data");
          }
        }
      }
      clone() {
        const matrix = new _SymmetricMatrix(this.diagonalSize);
        for (const [row, col, value] of this.upperRightEntries()) {
          matrix.set(row, col, value);
        }
        return matrix;
      }
      toMatrix() {
        return new Matrix(this);
      }
      get(rowIndex, columnIndex) {
        return this.#matrix.get(rowIndex, columnIndex);
      }
      set(rowIndex, columnIndex, value) {
        this.#matrix.set(rowIndex, columnIndex, value);
        this.#matrix.set(columnIndex, rowIndex, value);
        return this;
      }
      removeCross(index) {
        this.#matrix.removeRow(index);
        this.#matrix.removeColumn(index);
        return this;
      }
      addCross(index, array2) {
        if (array2 === void 0) {
          array2 = index;
          index = this.diagonalSize;
        }
        const row = array2.slice();
        row.splice(index, 1);
        this.#matrix.addRow(index, row);
        this.#matrix.addColumn(index, array2);
        return this;
      }
      /**
       * @param {Mask[]} mask
       */
      applyMask(mask) {
        if (mask.length !== this.diagonalSize) {
          throw new RangeError("Mask size do not match with matrix size");
        }
        const sidesToRemove = [];
        for (const [index, passthroughs] of mask.entries()) {
          if (passthroughs) continue;
          sidesToRemove.push(index);
        }
        sidesToRemove.reverse();
        for (const sideIndex of sidesToRemove) {
          this.removeCross(sideIndex);
        }
        return this;
      }
      /**
       * Compact format upper-right corner of matrix
       * iterate from left to right, from top to bottom.
       *
       * ```
       *   A B C D
       * A 1 2 3 4
       * B 2 5 6 7
       * C 3 6 8 9
       * D 4 7 9 10
       * ```
       *
       * will return compact 1D array `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
       *
       * length is S(i=0, n=sideSize) => 10 for a 4 sideSized matrix
       *
       * @returns {number[]}
       */
      toCompact() {
        const { diagonalSize } = this;
        const compact = new Array(diagonalSize * (diagonalSize + 1) / 2);
        for (let col = 0, row = 0, index = 0; index < compact.length; index++) {
          compact[index] = this.get(row, col);
          if (++col >= diagonalSize) col = ++row;
        }
        return compact;
      }
      /**
       * @param {number[]} compact
       * @return {SymmetricMatrix}
       */
      static fromCompact(compact) {
        const compactSize = compact.length;
        const diagonalSize = (Math.sqrt(8 * compactSize + 1) - 1) / 2;
        if (!Number.isInteger(diagonalSize)) {
          throw new TypeError(
            `This array is not a compact representation of a Symmetric Matrix, ${JSON.stringify(
              compact
            )}`
          );
        }
        const matrix = new _SymmetricMatrix(diagonalSize);
        for (let col = 0, row = 0, index = 0; index < compactSize; index++) {
          matrix.set(col, row, compact[index]);
          if (++col >= diagonalSize) col = ++row;
        }
        return matrix;
      }
      /**
       * half iterator upper-right-corner from left to right, from top to bottom
       * yield [row, column, value]
       *
       * @returns {Generator<[number, number, number], void, void>}
       */
      *upperRightEntries() {
        for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
          const value = this.get(row, col);
          yield [row, col, value];
          if (++col >= this.diagonalSize) col = ++row;
        }
      }
      /**
       * half iterator upper-right-corner from left to right, from top to bottom
       * yield value
       *
       * @returns {Generator<[number, number, number], void, void>}
       */
      *upperRightValues() {
        for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
          const value = this.get(row, col);
          yield value;
          if (++col >= this.diagonalSize) col = ++row;
        }
      }
    };
    SymmetricMatrix.prototype.klassType = "SymmetricMatrix";
    var DistanceMatrix = class _DistanceMatrix extends SymmetricMatrix {
      /**
       * not the same as matrix.isSymmetric()
       * Here is to check if it's instanceof SymmetricMatrix without bundling issues
       *
       * @param value
       * @returns {boolean}
       */
      static isDistanceMatrix(value) {
        return SymmetricMatrix.isSymmetricMatrix(value) && value.klassSubType === "DistanceMatrix";
      }
      constructor(sideSize) {
        super(sideSize);
        if (!this.isDistance()) {
          throw new TypeError("Provided arguments do no produce a distance matrix");
        }
      }
      set(rowIndex, columnIndex, value) {
        if (rowIndex === columnIndex) value = 0;
        return super.set(rowIndex, columnIndex, value);
      }
      addCross(index, array2) {
        if (array2 === void 0) {
          array2 = index;
          index = this.diagonalSize;
        }
        array2 = array2.slice();
        array2[index] = 0;
        return super.addCross(index, array2);
      }
      toSymmetricMatrix() {
        return new SymmetricMatrix(this);
      }
      clone() {
        const matrix = new _DistanceMatrix(this.diagonalSize);
        for (const [row, col, value] of this.upperRightEntries()) {
          if (row === col) continue;
          matrix.set(row, col, value);
        }
        return matrix;
      }
      /**
       * Compact format upper-right corner of matrix
       * no diagonal (only zeros)
       * iterable from left to right, from top to bottom.
       *
       * ```
       *   A B C D
       * A 0 1 2 3
       * B 1 0 4 5
       * C 2 4 0 6
       * D 3 5 6 0
       * ```
       *
       * will return compact 1D array `[1, 2, 3, 4, 5, 6]`
       *
       * length is S(i=0, n=sideSize-1) => 6 for a 4 side sized matrix
       *
       * @returns {number[]}
       */
      toCompact() {
        const { diagonalSize } = this;
        const compactLength = (diagonalSize - 1) * diagonalSize / 2;
        const compact = new Array(compactLength);
        for (let col = 1, row = 0, index = 0; index < compact.length; index++) {
          compact[index] = this.get(row, col);
          if (++col >= diagonalSize) col = ++row + 1;
        }
        return compact;
      }
      /**
       * @param {number[]} compact
       */
      static fromCompact(compact) {
        const compactSize = compact.length;
        if (compactSize === 0) {
          return new this(0);
        }
        const diagonalSize = (Math.sqrt(8 * compactSize + 1) + 1) / 2;
        if (!Number.isInteger(diagonalSize)) {
          throw new TypeError(
            `This array is not a compact representation of a DistanceMatrix, ${JSON.stringify(
              compact
            )}`
          );
        }
        const matrix = new this(diagonalSize);
        for (let col = 1, row = 0, index = 0; index < compactSize; index++) {
          matrix.set(col, row, compact[index]);
          if (++col >= diagonalSize) col = ++row + 1;
        }
        return matrix;
      }
    };
    DistanceMatrix.prototype.klassSubType = "DistanceMatrix";
    var BaseView = class extends AbstractMatrix {
      constructor(matrix, rows, columns) {
        super();
        this.matrix = matrix;
        this.rows = rows;
        this.columns = columns;
      }
    };
    var MatrixColumnView = class extends BaseView {
      constructor(matrix, column) {
        checkColumnIndex(matrix, column);
        super(matrix, matrix.rows, 1);
        this.column = column;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.column, value);
        return this;
      }
      get(rowIndex) {
        return this.matrix.get(rowIndex, this.column);
      }
    };
    var MatrixColumnSelectionView = class extends BaseView {
      constructor(matrix, columnIndices) {
        checkColumnIndices(matrix, columnIndices);
        super(matrix, matrix.rows, columnIndices.length);
        this.columnIndices = columnIndices;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
      }
    };
    var MatrixFlipColumnView = class extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.rows, matrix.columns);
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
      }
    };
    var MatrixFlipRowView = class extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.rows, matrix.columns);
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
      }
    };
    var MatrixRowView = class extends BaseView {
      constructor(matrix, row) {
        checkRowIndex(matrix, row);
        super(matrix, 1, matrix.columns);
        this.row = row;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.row, columnIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(this.row, columnIndex);
      }
    };
    var MatrixRowSelectionView = class extends BaseView {
      constructor(matrix, rowIndices) {
        checkRowIndices(matrix, rowIndices);
        super(matrix, rowIndices.length, matrix.columns);
        this.rowIndices = rowIndices;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
      }
    };
    var MatrixSelectionView = class extends BaseView {
      constructor(matrix, rowIndices, columnIndices) {
        checkRowIndices(matrix, rowIndices);
        checkColumnIndices(matrix, columnIndices);
        super(matrix, rowIndices.length, columnIndices.length);
        this.rowIndices = rowIndices;
        this.columnIndices = columnIndices;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(
          this.rowIndices[rowIndex],
          this.columnIndices[columnIndex],
          value
        );
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(
          this.rowIndices[rowIndex],
          this.columnIndices[columnIndex]
        );
      }
    };
    var MatrixSubView = class extends BaseView {
      constructor(matrix, startRow, endRow, startColumn, endColumn) {
        checkRange(matrix, startRow, endRow, startColumn, endColumn);
        super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
        this.startRow = startRow;
        this.startColumn = startColumn;
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(
          this.startRow + rowIndex,
          this.startColumn + columnIndex,
          value
        );
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(
          this.startRow + rowIndex,
          this.startColumn + columnIndex
        );
      }
    };
    var MatrixTransposeView = class extends BaseView {
      constructor(matrix) {
        super(matrix, matrix.columns, matrix.rows);
      }
      set(rowIndex, columnIndex, value) {
        this.matrix.set(columnIndex, rowIndex, value);
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.matrix.get(columnIndex, rowIndex);
      }
    };
    var WrapperMatrix1D = class extends AbstractMatrix {
      constructor(data, options = {}) {
        const { rows = 1 } = options;
        if (data.length % rows !== 0) {
          throw new Error("the data length is not divisible by the number of rows");
        }
        super();
        this.rows = rows;
        this.columns = data.length / rows;
        this.data = data;
      }
      set(rowIndex, columnIndex, value) {
        let index = this._calculateIndex(rowIndex, columnIndex);
        this.data[index] = value;
        return this;
      }
      get(rowIndex, columnIndex) {
        let index = this._calculateIndex(rowIndex, columnIndex);
        return this.data[index];
      }
      _calculateIndex(row, column) {
        return row * this.columns + column;
      }
    };
    var WrapperMatrix2D = class extends AbstractMatrix {
      constructor(data) {
        super();
        this.data = data;
        this.rows = data.length;
        this.columns = data[0].length;
      }
      set(rowIndex, columnIndex, value) {
        this.data[rowIndex][columnIndex] = value;
        return this;
      }
      get(rowIndex, columnIndex) {
        return this.data[rowIndex][columnIndex];
      }
    };
    function wrap(array2, options) {
      if (isAnyArray.isAnyArray(array2)) {
        if (array2[0] && isAnyArray.isAnyArray(array2[0])) {
          return new WrapperMatrix2D(array2);
        } else {
          return new WrapperMatrix1D(array2, options);
        }
      } else {
        throw new Error("the argument is not an array");
      }
    }
    var LuDecomposition = class {
      constructor(matrix) {
        matrix = WrapperMatrix2D.checkMatrix(matrix);
        let lu = matrix.clone();
        let rows = lu.rows;
        let columns = lu.columns;
        let pivotVector = new Float64Array(rows);
        let pivotSign = 1;
        let i, j, k, p, s, t, v;
        let LUcolj, kmax;
        for (i = 0; i < rows; i++) {
          pivotVector[i] = i;
        }
        LUcolj = new Float64Array(rows);
        for (j = 0; j < columns; j++) {
          for (i = 0; i < rows; i++) {
            LUcolj[i] = lu.get(i, j);
          }
          for (i = 0; i < rows; i++) {
            kmax = Math.min(i, j);
            s = 0;
            for (k = 0; k < kmax; k++) {
              s += lu.get(i, k) * LUcolj[k];
            }
            LUcolj[i] -= s;
            lu.set(i, j, LUcolj[i]);
          }
          p = j;
          for (i = j + 1; i < rows; i++) {
            if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
              p = i;
            }
          }
          if (p !== j) {
            for (k = 0; k < columns; k++) {
              t = lu.get(p, k);
              lu.set(p, k, lu.get(j, k));
              lu.set(j, k, t);
            }
            v = pivotVector[p];
            pivotVector[p] = pivotVector[j];
            pivotVector[j] = v;
            pivotSign = -pivotSign;
          }
          if (j < rows && lu.get(j, j) !== 0) {
            for (i = j + 1; i < rows; i++) {
              lu.set(i, j, lu.get(i, j) / lu.get(j, j));
            }
          }
        }
        this.LU = lu;
        this.pivotVector = pivotVector;
        this.pivotSign = pivotSign;
      }
      isSingular() {
        let data = this.LU;
        let col = data.columns;
        for (let j = 0; j < col; j++) {
          if (data.get(j, j) === 0) {
            return true;
          }
        }
        return false;
      }
      solve(value) {
        value = Matrix.checkMatrix(value);
        let lu = this.LU;
        let rows = lu.rows;
        if (rows !== value.rows) {
          throw new Error("Invalid matrix dimensions");
        }
        if (this.isSingular()) {
          throw new Error("LU matrix is singular");
        }
        let count = value.columns;
        let X2 = value.subMatrixRow(this.pivotVector, 0, count - 1);
        let columns = lu.columns;
        let i, j, k;
        for (k = 0; k < columns; k++) {
          for (i = k + 1; i < columns; i++) {
            for (j = 0; j < count; j++) {
              X2.set(i, j, X2.get(i, j) - X2.get(k, j) * lu.get(i, k));
            }
          }
        }
        for (k = columns - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            X2.set(k, j, X2.get(k, j) / lu.get(k, k));
          }
          for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) {
              X2.set(i, j, X2.get(i, j) - X2.get(k, j) * lu.get(i, k));
            }
          }
        }
        return X2;
      }
      get determinant() {
        let data = this.LU;
        if (!data.isSquare()) {
          throw new Error("Matrix must be square");
        }
        let determinant2 = this.pivotSign;
        let col = data.columns;
        for (let j = 0; j < col; j++) {
          determinant2 *= data.get(j, j);
        }
        return determinant2;
      }
      get lowerTriangularMatrix() {
        let data = this.LU;
        let rows = data.rows;
        let columns = data.columns;
        let X2 = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            if (i > j) {
              X2.set(i, j, data.get(i, j));
            } else if (i === j) {
              X2.set(i, j, 1);
            } else {
              X2.set(i, j, 0);
            }
          }
        }
        return X2;
      }
      get upperTriangularMatrix() {
        let data = this.LU;
        let rows = data.rows;
        let columns = data.columns;
        let X2 = new Matrix(rows, columns);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            if (i <= j) {
              X2.set(i, j, data.get(i, j));
            } else {
              X2.set(i, j, 0);
            }
          }
        }
        return X2;
      }
      get pivotPermutationVector() {
        return Array.from(this.pivotVector);
      }
    };
    function hypotenuse(a, b) {
      let r = 0;
      if (Math.abs(a) > Math.abs(b)) {
        r = b / a;
        return Math.abs(a) * Math.sqrt(1 + r * r);
      }
      if (b !== 0) {
        r = a / b;
        return Math.abs(b) * Math.sqrt(1 + r * r);
      }
      return 0;
    }
    var QrDecomposition = class {
      constructor(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        let qr = value.clone();
        let m = value.rows;
        let n = value.columns;
        let rdiag = new Float64Array(n);
        let i, j, k, s;
        for (k = 0; k < n; k++) {
          let nrm = 0;
          for (i = k; i < m; i++) {
            nrm = hypotenuse(nrm, qr.get(i, k));
          }
          if (nrm !== 0) {
            if (qr.get(k, k) < 0) {
              nrm = -nrm;
            }
            for (i = k; i < m; i++) {
              qr.set(i, k, qr.get(i, k) / nrm);
            }
            qr.set(k, k, qr.get(k, k) + 1);
            for (j = k + 1; j < n; j++) {
              s = 0;
              for (i = k; i < m; i++) {
                s += qr.get(i, k) * qr.get(i, j);
              }
              s = -s / qr.get(k, k);
              for (i = k; i < m; i++) {
                qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
              }
            }
          }
          rdiag[k] = -nrm;
        }
        this.QR = qr;
        this.Rdiag = rdiag;
      }
      solve(value) {
        value = Matrix.checkMatrix(value);
        let qr = this.QR;
        let m = qr.rows;
        if (value.rows !== m) {
          throw new Error("Matrix row dimensions must agree");
        }
        if (!this.isFullRank()) {
          throw new Error("Matrix is rank deficient");
        }
        let count = value.columns;
        let X2 = value.clone();
        let n = qr.columns;
        let i, j, k, s;
        for (k = 0; k < n; k++) {
          for (j = 0; j < count; j++) {
            s = 0;
            for (i = k; i < m; i++) {
              s += qr.get(i, k) * X2.get(i, j);
            }
            s = -s / qr.get(k, k);
            for (i = k; i < m; i++) {
              X2.set(i, j, X2.get(i, j) + s * qr.get(i, k));
            }
          }
        }
        for (k = n - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            X2.set(k, j, X2.get(k, j) / this.Rdiag[k]);
          }
          for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) {
              X2.set(i, j, X2.get(i, j) - X2.get(k, j) * qr.get(i, k));
            }
          }
        }
        return X2.subMatrix(0, n - 1, 0, count - 1);
      }
      isFullRank() {
        let columns = this.QR.columns;
        for (let i = 0; i < columns; i++) {
          if (this.Rdiag[i] === 0) {
            return false;
          }
        }
        return true;
      }
      get upperTriangularMatrix() {
        let qr = this.QR;
        let n = qr.columns;
        let X2 = new Matrix(n, n);
        let i, j;
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            if (i < j) {
              X2.set(i, j, qr.get(i, j));
            } else if (i === j) {
              X2.set(i, j, this.Rdiag[i]);
            } else {
              X2.set(i, j, 0);
            }
          }
        }
        return X2;
      }
      get orthogonalMatrix() {
        let qr = this.QR;
        let rows = qr.rows;
        let columns = qr.columns;
        let X2 = new Matrix(rows, columns);
        let i, j, k, s;
        for (k = columns - 1; k >= 0; k--) {
          for (i = 0; i < rows; i++) {
            X2.set(i, k, 0);
          }
          X2.set(k, k, 1);
          for (j = k; j < columns; j++) {
            if (qr.get(k, k) !== 0) {
              s = 0;
              for (i = k; i < rows; i++) {
                s += qr.get(i, k) * X2.get(i, j);
              }
              s = -s / qr.get(k, k);
              for (i = k; i < rows; i++) {
                X2.set(i, j, X2.get(i, j) + s * qr.get(i, k));
              }
            }
          }
        }
        return X2;
      }
    };
    var SingularValueDecomposition = class {
      constructor(value, options = {}) {
        value = WrapperMatrix2D.checkMatrix(value);
        if (value.isEmpty()) {
          throw new Error("Matrix must be non-empty");
        }
        let m = value.rows;
        let n = value.columns;
        const {
          computeLeftSingularVectors = true,
          computeRightSingularVectors = true,
          autoTranspose = false
        } = options;
        let wantu = Boolean(computeLeftSingularVectors);
        let wantv = Boolean(computeRightSingularVectors);
        let swapped = false;
        let a;
        if (m < n) {
          if (!autoTranspose) {
            a = value.clone();
            console.warn(
              "Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose"
            );
          } else {
            a = value.transpose();
            m = a.rows;
            n = a.columns;
            swapped = true;
            let aux = wantu;
            wantu = wantv;
            wantv = aux;
          }
        } else {
          a = value.clone();
        }
        let nu = Math.min(m, n);
        let ni = Math.min(m + 1, n);
        let s = new Float64Array(ni);
        let U = new Matrix(m, nu);
        let V = new Matrix(n, n);
        let e = new Float64Array(n);
        let work = new Float64Array(m);
        let si = new Float64Array(ni);
        for (let i = 0; i < ni; i++) si[i] = i;
        let nct = Math.min(m - 1, n);
        let nrt = Math.max(0, Math.min(n - 2, m));
        let mrc = Math.max(nct, nrt);
        for (let k = 0; k < mrc; k++) {
          if (k < nct) {
            s[k] = 0;
            for (let i = k; i < m; i++) {
              s[k] = hypotenuse(s[k], a.get(i, k));
            }
            if (s[k] !== 0) {
              if (a.get(k, k) < 0) {
                s[k] = -s[k];
              }
              for (let i = k; i < m; i++) {
                a.set(i, k, a.get(i, k) / s[k]);
              }
              a.set(k, k, a.get(k, k) + 1);
            }
            s[k] = -s[k];
          }
          for (let j = k + 1; j < n; j++) {
            if (k < nct && s[k] !== 0) {
              let t = 0;
              for (let i = k; i < m; i++) {
                t += a.get(i, k) * a.get(i, j);
              }
              t = -t / a.get(k, k);
              for (let i = k; i < m; i++) {
                a.set(i, j, a.get(i, j) + t * a.get(i, k));
              }
            }
            e[j] = a.get(k, j);
          }
          if (wantu && k < nct) {
            for (let i = k; i < m; i++) {
              U.set(i, k, a.get(i, k));
            }
          }
          if (k < nrt) {
            e[k] = 0;
            for (let i = k + 1; i < n; i++) {
              e[k] = hypotenuse(e[k], e[i]);
            }
            if (e[k] !== 0) {
              if (e[k + 1] < 0) {
                e[k] = 0 - e[k];
              }
              for (let i = k + 1; i < n; i++) {
                e[i] /= e[k];
              }
              e[k + 1] += 1;
            }
            e[k] = -e[k];
            if (k + 1 < m && e[k] !== 0) {
              for (let i = k + 1; i < m; i++) {
                work[i] = 0;
              }
              for (let i = k + 1; i < m; i++) {
                for (let j = k + 1; j < n; j++) {
                  work[i] += e[j] * a.get(i, j);
                }
              }
              for (let j = k + 1; j < n; j++) {
                let t = -e[j] / e[k + 1];
                for (let i = k + 1; i < m; i++) {
                  a.set(i, j, a.get(i, j) + t * work[i]);
                }
              }
            }
            if (wantv) {
              for (let i = k + 1; i < n; i++) {
                V.set(i, k, e[i]);
              }
            }
          }
        }
        let p = Math.min(n, m + 1);
        if (nct < n) {
          s[nct] = a.get(nct, nct);
        }
        if (m < p) {
          s[p - 1] = 0;
        }
        if (nrt + 1 < p) {
          e[nrt] = a.get(nrt, p - 1);
        }
        e[p - 1] = 0;
        if (wantu) {
          for (let j = nct; j < nu; j++) {
            for (let i = 0; i < m; i++) {
              U.set(i, j, 0);
            }
            U.set(j, j, 1);
          }
          for (let k = nct - 1; k >= 0; k--) {
            if (s[k] !== 0) {
              for (let j = k + 1; j < nu; j++) {
                let t = 0;
                for (let i = k; i < m; i++) {
                  t += U.get(i, k) * U.get(i, j);
                }
                t = -t / U.get(k, k);
                for (let i = k; i < m; i++) {
                  U.set(i, j, U.get(i, j) + t * U.get(i, k));
                }
              }
              for (let i = k; i < m; i++) {
                U.set(i, k, -U.get(i, k));
              }
              U.set(k, k, 1 + U.get(k, k));
              for (let i = 0; i < k - 1; i++) {
                U.set(i, k, 0);
              }
            } else {
              for (let i = 0; i < m; i++) {
                U.set(i, k, 0);
              }
              U.set(k, k, 1);
            }
          }
        }
        if (wantv) {
          for (let k = n - 1; k >= 0; k--) {
            if (k < nrt && e[k] !== 0) {
              for (let j = k + 1; j < n; j++) {
                let t = 0;
                for (let i = k + 1; i < n; i++) {
                  t += V.get(i, k) * V.get(i, j);
                }
                t = -t / V.get(k + 1, k);
                for (let i = k + 1; i < n; i++) {
                  V.set(i, j, V.get(i, j) + t * V.get(i, k));
                }
              }
            }
            for (let i = 0; i < n; i++) {
              V.set(i, k, 0);
            }
            V.set(k, k, 1);
          }
        }
        let pp = p - 1;
        let eps = Number.EPSILON;
        while (p > 0) {
          let k, kase;
          for (k = p - 2; k >= -1; k--) {
            if (k === -1) {
              break;
            }
            const alpha = Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
            if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
              e[k] = 0;
              break;
            }
          }
          if (k === p - 2) {
            kase = 4;
          } else {
            let ks;
            for (ks = p - 1; ks >= k; ks--) {
              if (ks === k) {
                break;
              }
              let t = (ks !== p ? Math.abs(e[ks]) : 0) + (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
              if (Math.abs(s[ks]) <= eps * t) {
                s[ks] = 0;
                break;
              }
            }
            if (ks === k) {
              kase = 3;
            } else if (ks === p - 1) {
              kase = 1;
            } else {
              kase = 2;
              k = ks;
            }
          }
          k++;
          switch (kase) {
            case 1: {
              let f = e[p - 2];
              e[p - 2] = 0;
              for (let j = p - 2; j >= k; j--) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                if (j !== k) {
                  f = -sn * e[j - 1];
                  e[j - 1] = cs * e[j - 1];
                }
                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                    V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                    V.set(i, j, t);
                  }
                }
              }
              break;
            }
            case 2: {
              let f = e[k - 1];
              e[k - 1] = 0;
              for (let j = k; j < p; j++) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                f = -sn * e[j];
                e[j] = cs * e[j];
                if (wantu) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                    U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                    U.set(i, j, t);
                  }
                }
              }
              break;
            }
            case 3: {
              const scale = Math.max(
                Math.abs(s[p - 1]),
                Math.abs(s[p - 2]),
                Math.abs(e[p - 2]),
                Math.abs(s[k]),
                Math.abs(e[k])
              );
              const sp = s[p - 1] / scale;
              const spm1 = s[p - 2] / scale;
              const epm1 = e[p - 2] / scale;
              const sk = s[k] / scale;
              const ek = e[k] / scale;
              const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
              const c = sp * epm1 * (sp * epm1);
              let shift = 0;
              if (b !== 0 || c !== 0) {
                if (b < 0) {
                  shift = 0 - Math.sqrt(b * b + c);
                } else {
                  shift = Math.sqrt(b * b + c);
                }
                shift = c / (b + shift);
              }
              let f = (sk + sp) * (sk - sp) + shift;
              let g = sk * ek;
              for (let j = k; j < p - 1; j++) {
                let t = hypotenuse(f, g);
                if (t === 0) t = Number.MIN_VALUE;
                let cs = f / t;
                let sn = g / t;
                if (j !== k) {
                  e[j - 1] = t;
                }
                f = cs * s[j] + sn * e[j];
                e[j] = cs * e[j] - sn * s[j];
                g = sn * s[j + 1];
                s[j + 1] = cs * s[j + 1];
                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                    V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                    V.set(i, j, t);
                  }
                }
                t = hypotenuse(f, g);
                if (t === 0) t = Number.MIN_VALUE;
                cs = f / t;
                sn = g / t;
                s[j] = t;
                f = cs * e[j] + sn * s[j + 1];
                s[j + 1] = -sn * e[j] + cs * s[j + 1];
                g = sn * e[j + 1];
                e[j + 1] = cs * e[j + 1];
                if (wantu && j < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                    U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                    U.set(i, j, t);
                  }
                }
              }
              e[p - 2] = f;
              break;
            }
            case 4: {
              if (s[k] <= 0) {
                s[k] = s[k] < 0 ? -s[k] : 0;
                if (wantv) {
                  for (let i = 0; i <= pp; i++) {
                    V.set(i, k, -V.get(i, k));
                  }
                }
              }
              while (k < pp) {
                if (s[k] >= s[k + 1]) {
                  break;
                }
                let t = s[k];
                s[k] = s[k + 1];
                s[k + 1] = t;
                if (wantv && k < n - 1) {
                  for (let i = 0; i < n; i++) {
                    t = V.get(i, k + 1);
                    V.set(i, k + 1, V.get(i, k));
                    V.set(i, k, t);
                  }
                }
                if (wantu && k < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = U.get(i, k + 1);
                    U.set(i, k + 1, U.get(i, k));
                    U.set(i, k, t);
                  }
                }
                k++;
              }
              p--;
              break;
            }
          }
        }
        if (swapped) {
          let tmp = V;
          V = U;
          U = tmp;
        }
        this.m = m;
        this.n = n;
        this.s = s;
        this.U = U;
        this.V = V;
      }
      solve(value) {
        let Y2 = value;
        let e = this.threshold;
        let scols = this.s.length;
        let Ls = Matrix.zeros(scols, scols);
        for (let i = 0; i < scols; i++) {
          if (Math.abs(this.s[i]) <= e) {
            Ls.set(i, i, 0);
          } else {
            Ls.set(i, i, 1 / this.s[i]);
          }
        }
        let U = this.U;
        let V = this.rightSingularVectors;
        let VL = V.mmul(Ls);
        let vrows = V.rows;
        let urows = U.rows;
        let VLU = Matrix.zeros(vrows, urows);
        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < urows; j++) {
            let sum = 0;
            for (let k = 0; k < scols; k++) {
              sum += VL.get(i, k) * U.get(j, k);
            }
            VLU.set(i, j, sum);
          }
        }
        return VLU.mmul(Y2);
      }
      solveForDiagonal(value) {
        return this.solve(Matrix.diag(value));
      }
      inverse() {
        let V = this.V;
        let e = this.threshold;
        let vrows = V.rows;
        let vcols = V.columns;
        let X2 = new Matrix(vrows, this.s.length);
        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < vcols; j++) {
            if (Math.abs(this.s[j]) > e) {
              X2.set(i, j, V.get(i, j) / this.s[j]);
            }
          }
        }
        let U = this.U;
        let urows = U.rows;
        let ucols = U.columns;
        let Y2 = new Matrix(vrows, urows);
        for (let i = 0; i < vrows; i++) {
          for (let j = 0; j < urows; j++) {
            let sum = 0;
            for (let k = 0; k < ucols; k++) {
              sum += X2.get(i, k) * U.get(j, k);
            }
            Y2.set(i, j, sum);
          }
        }
        return Y2;
      }
      get condition() {
        return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
      }
      get norm2() {
        return this.s[0];
      }
      get rank() {
        let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
        let r = 0;
        let s = this.s;
        for (let i = 0, ii = s.length; i < ii; i++) {
          if (s[i] > tol) {
            r++;
          }
        }
        return r;
      }
      get diagonal() {
        return Array.from(this.s);
      }
      get threshold() {
        return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
      }
      get leftSingularVectors() {
        return this.U;
      }
      get rightSingularVectors() {
        return this.V;
      }
      get diagonalMatrix() {
        return Matrix.diag(this.s);
      }
    };
    function inverse(matrix, useSVD = false) {
      matrix = WrapperMatrix2D.checkMatrix(matrix);
      if (useSVD) {
        return new SingularValueDecomposition(matrix).inverse();
      } else {
        return solve(matrix, Matrix.eye(matrix.rows));
      }
    }
    function solve(leftHandSide, rightHandSide, useSVD = false) {
      leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
      rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
      if (useSVD) {
        return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
      } else {
        return leftHandSide.isSquare() ? new LuDecomposition(leftHandSide).solve(rightHandSide) : new QrDecomposition(leftHandSide).solve(rightHandSide);
      }
    }
    function determinant(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (matrix.isSquare()) {
        if (matrix.columns === 0) {
          return 1;
        }
        let a, b, c, d;
        if (matrix.columns === 2) {
          a = matrix.get(0, 0);
          b = matrix.get(0, 1);
          c = matrix.get(1, 0);
          d = matrix.get(1, 1);
          return a * d - b * c;
        } else if (matrix.columns === 3) {
          let subMatrix0, subMatrix1, subMatrix2;
          subMatrix0 = new MatrixSelectionView(matrix, [1, 2], [1, 2]);
          subMatrix1 = new MatrixSelectionView(matrix, [1, 2], [0, 2]);
          subMatrix2 = new MatrixSelectionView(matrix, [1, 2], [0, 1]);
          a = matrix.get(0, 0);
          b = matrix.get(0, 1);
          c = matrix.get(0, 2);
          return a * determinant(subMatrix0) - b * determinant(subMatrix1) + c * determinant(subMatrix2);
        } else {
          return new LuDecomposition(matrix).determinant;
        }
      } else {
        throw Error("determinant can only be calculated for a square matrix");
      }
    }
    function xrange(n, exception) {
      let range = [];
      for (let i = 0; i < n; i++) {
        if (i !== exception) {
          range.push(i);
        }
      }
      return range;
    }
    function dependenciesOneRow(error, matrix, index, thresholdValue = 1e-9, thresholdError = 1e-9) {
      if (error > thresholdError) {
        return new Array(matrix.rows + 1).fill(0);
      } else {
        let returnArray = matrix.addRow(index, [0]);
        for (let i = 0; i < returnArray.rows; i++) {
          if (Math.abs(returnArray.get(i, 0)) < thresholdValue) {
            returnArray.set(i, 0, 0);
          }
        }
        return returnArray.to1DArray();
      }
    }
    function linearDependencies(matrix, options = {}) {
      const { thresholdValue = 1e-9, thresholdError = 1e-9 } = options;
      matrix = Matrix.checkMatrix(matrix);
      let n = matrix.rows;
      let results = new Matrix(n, n);
      for (let i = 0; i < n; i++) {
        let b = Matrix.columnVector(matrix.getRow(i));
        let Abis = matrix.subMatrixRow(xrange(n, i)).transpose();
        let svd = new SingularValueDecomposition(Abis);
        let x = svd.solve(b);
        let error = Matrix.sub(b, Abis.mmul(x)).abs().max();
        results.setRow(
          i,
          dependenciesOneRow(error, x, i, thresholdValue, thresholdError)
        );
      }
      return results;
    }
    function pseudoInverse(matrix, threshold = Number.EPSILON) {
      matrix = Matrix.checkMatrix(matrix);
      if (matrix.isEmpty()) {
        return matrix.transpose();
      }
      let svdSolution = new SingularValueDecomposition(matrix, { autoTranspose: true });
      let U = svdSolution.leftSingularVectors;
      let V = svdSolution.rightSingularVectors;
      let s = svdSolution.diagonal;
      for (let i = 0; i < s.length; i++) {
        if (Math.abs(s[i]) > threshold) {
          s[i] = 1 / s[i];
        } else {
          s[i] = 0;
        }
      }
      return V.mmul(Matrix.diag(s).mmul(U.transpose()));
    }
    function covariance(xMatrix, yMatrix = xMatrix, options = {}) {
      xMatrix = new Matrix(xMatrix);
      let yIsSame = false;
      if (typeof yMatrix === "object" && !Matrix.isMatrix(yMatrix) && !isAnyArray.isAnyArray(yMatrix)) {
        options = yMatrix;
        yMatrix = xMatrix;
        yIsSame = true;
      } else {
        yMatrix = new Matrix(yMatrix);
      }
      if (xMatrix.rows !== yMatrix.rows) {
        throw new TypeError("Both matrices must have the same number of rows");
      }
      const { center = true } = options;
      if (center) {
        xMatrix = xMatrix.center("column");
        if (!yIsSame) {
          yMatrix = yMatrix.center("column");
        }
      }
      const cov = xMatrix.transpose().mmul(yMatrix);
      for (let i = 0; i < cov.rows; i++) {
        for (let j = 0; j < cov.columns; j++) {
          cov.set(i, j, cov.get(i, j) * (1 / (xMatrix.rows - 1)));
        }
      }
      return cov;
    }
    function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
      xMatrix = new Matrix(xMatrix);
      let yIsSame = false;
      if (typeof yMatrix === "object" && !Matrix.isMatrix(yMatrix) && !isAnyArray.isAnyArray(yMatrix)) {
        options = yMatrix;
        yMatrix = xMatrix;
        yIsSame = true;
      } else {
        yMatrix = new Matrix(yMatrix);
      }
      if (xMatrix.rows !== yMatrix.rows) {
        throw new TypeError("Both matrices must have the same number of rows");
      }
      const { center = true, scale = true } = options;
      if (center) {
        xMatrix.center("column");
        if (!yIsSame) {
          yMatrix.center("column");
        }
      }
      if (scale) {
        xMatrix.scale("column");
        if (!yIsSame) {
          yMatrix.scale("column");
        }
      }
      const sdx = xMatrix.standardDeviation("column", { unbiased: true });
      const sdy = yIsSame ? sdx : yMatrix.standardDeviation("column", { unbiased: true });
      const corr = xMatrix.transpose().mmul(yMatrix);
      for (let i = 0; i < corr.rows; i++) {
        for (let j = 0; j < corr.columns; j++) {
          corr.set(
            i,
            j,
            corr.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1))
          );
        }
      }
      return corr;
    }
    var EigenvalueDecomposition = class {
      constructor(matrix, options = {}) {
        const { assumeSymmetric = false } = options;
        matrix = WrapperMatrix2D.checkMatrix(matrix);
        if (!matrix.isSquare()) {
          throw new Error("Matrix is not a square matrix");
        }
        if (matrix.isEmpty()) {
          throw new Error("Matrix must be non-empty");
        }
        let n = matrix.columns;
        let V = new Matrix(n, n);
        let d = new Float64Array(n);
        let e = new Float64Array(n);
        let value = matrix;
        let i, j;
        let isSymmetric = false;
        if (assumeSymmetric) {
          isSymmetric = true;
        } else {
          isSymmetric = matrix.isSymmetric();
        }
        if (isSymmetric) {
          for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
              V.set(i, j, value.get(i, j));
            }
          }
          tred2(n, e, d, V);
          tql2(n, e, d, V);
        } else {
          let H = new Matrix(n, n);
          let ort = new Float64Array(n);
          for (j = 0; j < n; j++) {
            for (i = 0; i < n; i++) {
              H.set(i, j, value.get(i, j));
            }
          }
          orthes(n, H, ort, V);
          hqr2(n, e, d, V, H);
        }
        this.n = n;
        this.e = e;
        this.d = d;
        this.V = V;
      }
      get realEigenvalues() {
        return Array.from(this.d);
      }
      get imaginaryEigenvalues() {
        return Array.from(this.e);
      }
      get eigenvectorMatrix() {
        return this.V;
      }
      get diagonalMatrix() {
        let n = this.n;
        let e = this.e;
        let d = this.d;
        let X2 = new Matrix(n, n);
        let i, j;
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            X2.set(i, j, 0);
          }
          X2.set(i, i, d[i]);
          if (e[i] > 0) {
            X2.set(i, i + 1, e[i]);
          } else if (e[i] < 0) {
            X2.set(i, i - 1, e[i]);
          }
        }
        return X2;
      }
    };
    function tred2(n, e, d, V) {
      let f, g, h, i, j, k, hh, scale;
      for (j = 0; j < n; j++) {
        d[j] = V.get(n - 1, j);
      }
      for (i = n - 1; i > 0; i--) {
        scale = 0;
        h = 0;
        for (k = 0; k < i; k++) {
          scale = scale + Math.abs(d[k]);
        }
        if (scale === 0) {
          e[i] = d[i - 1];
          for (j = 0; j < i; j++) {
            d[j] = V.get(i - 1, j);
            V.set(i, j, 0);
            V.set(j, i, 0);
          }
        } else {
          for (k = 0; k < i; k++) {
            d[k] /= scale;
            h += d[k] * d[k];
          }
          f = d[i - 1];
          g = Math.sqrt(h);
          if (f > 0) {
            g = -g;
          }
          e[i] = scale * g;
          h = h - f * g;
          d[i - 1] = f - g;
          for (j = 0; j < i; j++) {
            e[j] = 0;
          }
          for (j = 0; j < i; j++) {
            f = d[j];
            V.set(j, i, f);
            g = e[j] + V.get(j, j) * f;
            for (k = j + 1; k <= i - 1; k++) {
              g += V.get(k, j) * d[k];
              e[k] += V.get(k, j) * f;
            }
            e[j] = g;
          }
          f = 0;
          for (j = 0; j < i; j++) {
            e[j] /= h;
            f += e[j] * d[j];
          }
          hh = f / (h + h);
          for (j = 0; j < i; j++) {
            e[j] -= hh * d[j];
          }
          for (j = 0; j < i; j++) {
            f = d[j];
            g = e[j];
            for (k = j; k <= i - 1; k++) {
              V.set(k, j, V.get(k, j) - (f * e[k] + g * d[k]));
            }
            d[j] = V.get(i - 1, j);
            V.set(i, j, 0);
          }
        }
        d[i] = h;
      }
      for (i = 0; i < n - 1; i++) {
        V.set(n - 1, i, V.get(i, i));
        V.set(i, i, 1);
        h = d[i + 1];
        if (h !== 0) {
          for (k = 0; k <= i; k++) {
            d[k] = V.get(k, i + 1) / h;
          }
          for (j = 0; j <= i; j++) {
            g = 0;
            for (k = 0; k <= i; k++) {
              g += V.get(k, i + 1) * V.get(k, j);
            }
            for (k = 0; k <= i; k++) {
              V.set(k, j, V.get(k, j) - g * d[k]);
            }
          }
        }
        for (k = 0; k <= i; k++) {
          V.set(k, i + 1, 0);
        }
      }
      for (j = 0; j < n; j++) {
        d[j] = V.get(n - 1, j);
        V.set(n - 1, j, 0);
      }
      V.set(n - 1, n - 1, 1);
      e[0] = 0;
    }
    function tql2(n, e, d, V) {
      let g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2;
      for (i = 1; i < n; i++) {
        e[i - 1] = e[i];
      }
      e[n - 1] = 0;
      let f = 0;
      let tst1 = 0;
      let eps = Number.EPSILON;
      for (l = 0; l < n; l++) {
        tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
        m = l;
        while (m < n) {
          if (Math.abs(e[m]) <= eps * tst1) {
            break;
          }
          m++;
        }
        if (m > l) {
          do {
            g = d[l];
            p = (d[l + 1] - g) / (2 * e[l]);
            r = hypotenuse(p, 1);
            if (p < 0) {
              r = -r;
            }
            d[l] = e[l] / (p + r);
            d[l + 1] = e[l] * (p + r);
            dl1 = d[l + 1];
            h = g - d[l];
            for (i = l + 2; i < n; i++) {
              d[i] -= h;
            }
            f = f + h;
            p = d[m];
            c = 1;
            c2 = c;
            c3 = c;
            el1 = e[l + 1];
            s = 0;
            s2 = 0;
            for (i = m - 1; i >= l; i--) {
              c3 = c2;
              c2 = c;
              s2 = s;
              g = c * e[i];
              h = c * p;
              r = hypotenuse(p, e[i]);
              e[i + 1] = s * r;
              s = e[i] / r;
              c = p / r;
              p = c * d[i] - s * g;
              d[i + 1] = h + s * (c * g + s * d[i]);
              for (k = 0; k < n; k++) {
                h = V.get(k, i + 1);
                V.set(k, i + 1, s * V.get(k, i) + c * h);
                V.set(k, i, c * V.get(k, i) - s * h);
              }
            }
            p = -s * s2 * c3 * el1 * e[l] / dl1;
            e[l] = s * p;
            d[l] = c * p;
          } while (Math.abs(e[l]) > eps * tst1);
        }
        d[l] = d[l] + f;
        e[l] = 0;
      }
      for (i = 0; i < n - 1; i++) {
        k = i;
        p = d[i];
        for (j = i + 1; j < n; j++) {
          if (d[j] < p) {
            k = j;
            p = d[j];
          }
        }
        if (k !== i) {
          d[k] = d[i];
          d[i] = p;
          for (j = 0; j < n; j++) {
            p = V.get(j, i);
            V.set(j, i, V.get(j, k));
            V.set(j, k, p);
          }
        }
      }
    }
    function orthes(n, H, ort, V) {
      let low = 0;
      let high = n - 1;
      let f, g, h, i, j, m;
      let scale;
      for (m = low + 1; m <= high - 1; m++) {
        scale = 0;
        for (i = m; i <= high; i++) {
          scale = scale + Math.abs(H.get(i, m - 1));
        }
        if (scale !== 0) {
          h = 0;
          for (i = high; i >= m; i--) {
            ort[i] = H.get(i, m - 1) / scale;
            h += ort[i] * ort[i];
          }
          g = Math.sqrt(h);
          if (ort[m] > 0) {
            g = -g;
          }
          h = h - ort[m] * g;
          ort[m] = ort[m] - g;
          for (j = m; j < n; j++) {
            f = 0;
            for (i = high; i >= m; i--) {
              f += ort[i] * H.get(i, j);
            }
            f = f / h;
            for (i = m; i <= high; i++) {
              H.set(i, j, H.get(i, j) - f * ort[i]);
            }
          }
          for (i = 0; i <= high; i++) {
            f = 0;
            for (j = high; j >= m; j--) {
              f += ort[j] * H.get(i, j);
            }
            f = f / h;
            for (j = m; j <= high; j++) {
              H.set(i, j, H.get(i, j) - f * ort[j]);
            }
          }
          ort[m] = scale * ort[m];
          H.set(m, m - 1, scale * g);
        }
      }
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          V.set(i, j, i === j ? 1 : 0);
        }
      }
      for (m = high - 1; m >= low + 1; m--) {
        if (H.get(m, m - 1) !== 0) {
          for (i = m + 1; i <= high; i++) {
            ort[i] = H.get(i, m - 1);
          }
          for (j = m; j <= high; j++) {
            g = 0;
            for (i = m; i <= high; i++) {
              g += ort[i] * V.get(i, j);
            }
            g = g / ort[m] / H.get(m, m - 1);
            for (i = m; i <= high; i++) {
              V.set(i, j, V.get(i, j) + g * ort[i]);
            }
          }
        }
      }
    }
    function hqr2(nn, e, d, V, H) {
      let n = nn - 1;
      let low = 0;
      let high = nn - 1;
      let eps = Number.EPSILON;
      let exshift = 0;
      let norm = 0;
      let p = 0;
      let q = 0;
      let r = 0;
      let s = 0;
      let z = 0;
      let iter = 0;
      let i, j, k, l, m, t, w, x, y;
      let ra, sa, vr, vi;
      let notlast, cdivres;
      for (i = 0; i < nn; i++) {
        if (i < low || i > high) {
          d[i] = H.get(i, i);
          e[i] = 0;
        }
        for (j = Math.max(i - 1, 0); j < nn; j++) {
          norm = norm + Math.abs(H.get(i, j));
        }
      }
      while (n >= low) {
        l = n;
        while (l > low) {
          s = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));
          if (s === 0) {
            s = norm;
          }
          if (Math.abs(H.get(l, l - 1)) < eps * s) {
            break;
          }
          l--;
        }
        if (l === n) {
          H.set(n, n, H.get(n, n) + exshift);
          d[n] = H.get(n, n);
          e[n] = 0;
          n--;
          iter = 0;
        } else if (l === n - 1) {
          w = H.get(n, n - 1) * H.get(n - 1, n);
          p = (H.get(n - 1, n - 1) - H.get(n, n)) / 2;
          q = p * p + w;
          z = Math.sqrt(Math.abs(q));
          H.set(n, n, H.get(n, n) + exshift);
          H.set(n - 1, n - 1, H.get(n - 1, n - 1) + exshift);
          x = H.get(n, n);
          if (q >= 0) {
            z = p >= 0 ? p + z : p - z;
            d[n - 1] = x + z;
            d[n] = d[n - 1];
            if (z !== 0) {
              d[n] = x - w / z;
            }
            e[n - 1] = 0;
            e[n] = 0;
            x = H.get(n, n - 1);
            s = Math.abs(x) + Math.abs(z);
            p = x / s;
            q = z / s;
            r = Math.sqrt(p * p + q * q);
            p = p / r;
            q = q / r;
            for (j = n - 1; j < nn; j++) {
              z = H.get(n - 1, j);
              H.set(n - 1, j, q * z + p * H.get(n, j));
              H.set(n, j, q * H.get(n, j) - p * z);
            }
            for (i = 0; i <= n; i++) {
              z = H.get(i, n - 1);
              H.set(i, n - 1, q * z + p * H.get(i, n));
              H.set(i, n, q * H.get(i, n) - p * z);
            }
            for (i = low; i <= high; i++) {
              z = V.get(i, n - 1);
              V.set(i, n - 1, q * z + p * V.get(i, n));
              V.set(i, n, q * V.get(i, n) - p * z);
            }
          } else {
            d[n - 1] = x + p;
            d[n] = x + p;
            e[n - 1] = z;
            e[n] = -z;
          }
          n = n - 2;
          iter = 0;
        } else {
          x = H.get(n, n);
          y = 0;
          w = 0;
          if (l < n) {
            y = H.get(n - 1, n - 1);
            w = H.get(n, n - 1) * H.get(n - 1, n);
          }
          if (iter === 10) {
            exshift += x;
            for (i = low; i <= n; i++) {
              H.set(i, i, H.get(i, i) - x);
            }
            s = Math.abs(H.get(n, n - 1)) + Math.abs(H.get(n - 1, n - 2));
            x = y = 0.75 * s;
            w = -0.4375 * s * s;
          }
          if (iter === 30) {
            s = (y - x) / 2;
            s = s * s + w;
            if (s > 0) {
              s = Math.sqrt(s);
              if (y < x) {
                s = -s;
              }
              s = x - w / ((y - x) / 2 + s);
              for (i = low; i <= n; i++) {
                H.set(i, i, H.get(i, i) - s);
              }
              exshift += s;
              x = y = w = 0.964;
            }
          }
          iter = iter + 1;
          m = n - 2;
          while (m >= l) {
            z = H.get(m, m);
            r = x - z;
            s = y - z;
            p = (r * s - w) / H.get(m + 1, m) + H.get(m, m + 1);
            q = H.get(m + 1, m + 1) - z - r - s;
            r = H.get(m + 2, m + 1);
            s = Math.abs(p) + Math.abs(q) + Math.abs(r);
            p = p / s;
            q = q / s;
            r = r / s;
            if (m === l) {
              break;
            }
            if (Math.abs(H.get(m, m - 1)) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H.get(m - 1, m - 1)) + Math.abs(z) + Math.abs(H.get(m + 1, m + 1))))) {
              break;
            }
            m--;
          }
          for (i = m + 2; i <= n; i++) {
            H.set(i, i - 2, 0);
            if (i > m + 2) {
              H.set(i, i - 3, 0);
            }
          }
          for (k = m; k <= n - 1; k++) {
            notlast = k !== n - 1;
            if (k !== m) {
              p = H.get(k, k - 1);
              q = H.get(k + 1, k - 1);
              r = notlast ? H.get(k + 2, k - 1) : 0;
              x = Math.abs(p) + Math.abs(q) + Math.abs(r);
              if (x !== 0) {
                p = p / x;
                q = q / x;
                r = r / x;
              }
            }
            if (x === 0) {
              break;
            }
            s = Math.sqrt(p * p + q * q + r * r);
            if (p < 0) {
              s = -s;
            }
            if (s !== 0) {
              if (k !== m) {
                H.set(k, k - 1, -s * x);
              } else if (l !== m) {
                H.set(k, k - 1, -H.get(k, k - 1));
              }
              p = p + s;
              x = p / s;
              y = q / s;
              z = r / s;
              q = q / p;
              r = r / p;
              for (j = k; j < nn; j++) {
                p = H.get(k, j) + q * H.get(k + 1, j);
                if (notlast) {
                  p = p + r * H.get(k + 2, j);
                  H.set(k + 2, j, H.get(k + 2, j) - p * z);
                }
                H.set(k, j, H.get(k, j) - p * x);
                H.set(k + 1, j, H.get(k + 1, j) - p * y);
              }
              for (i = 0; i <= Math.min(n, k + 3); i++) {
                p = x * H.get(i, k) + y * H.get(i, k + 1);
                if (notlast) {
                  p = p + z * H.get(i, k + 2);
                  H.set(i, k + 2, H.get(i, k + 2) - p * r);
                }
                H.set(i, k, H.get(i, k) - p);
                H.set(i, k + 1, H.get(i, k + 1) - p * q);
              }
              for (i = low; i <= high; i++) {
                p = x * V.get(i, k) + y * V.get(i, k + 1);
                if (notlast) {
                  p = p + z * V.get(i, k + 2);
                  V.set(i, k + 2, V.get(i, k + 2) - p * r);
                }
                V.set(i, k, V.get(i, k) - p);
                V.set(i, k + 1, V.get(i, k + 1) - p * q);
              }
            }
          }
        }
      }
      if (norm === 0) {
        return;
      }
      for (n = nn - 1; n >= 0; n--) {
        p = d[n];
        q = e[n];
        if (q === 0) {
          l = n;
          H.set(n, n, 1);
          for (i = n - 1; i >= 0; i--) {
            w = H.get(i, i) - p;
            r = 0;
            for (j = l; j <= n; j++) {
              r = r + H.get(i, j) * H.get(j, n);
            }
            if (e[i] < 0) {
              z = w;
              s = r;
            } else {
              l = i;
              if (e[i] === 0) {
                H.set(i, n, w !== 0 ? -r / w : -r / (eps * norm));
              } else {
                x = H.get(i, i + 1);
                y = H.get(i + 1, i);
                q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
                t = (x * s - z * r) / q;
                H.set(i, n, t);
                H.set(
                  i + 1,
                  n,
                  Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z
                );
              }
              t = Math.abs(H.get(i, n));
              if (eps * t * t > 1) {
                for (j = i; j <= n; j++) {
                  H.set(j, n, H.get(j, n) / t);
                }
              }
            }
          }
        } else if (q < 0) {
          l = n - 1;
          if (Math.abs(H.get(n, n - 1)) > Math.abs(H.get(n - 1, n))) {
            H.set(n - 1, n - 1, q / H.get(n, n - 1));
            H.set(n - 1, n, -(H.get(n, n) - p) / H.get(n, n - 1));
          } else {
            cdivres = cdiv(0, -H.get(n - 1, n), H.get(n - 1, n - 1) - p, q);
            H.set(n - 1, n - 1, cdivres[0]);
            H.set(n - 1, n, cdivres[1]);
          }
          H.set(n, n - 1, 0);
          H.set(n, n, 1);
          for (i = n - 2; i >= 0; i--) {
            ra = 0;
            sa = 0;
            for (j = l; j <= n; j++) {
              ra = ra + H.get(i, j) * H.get(j, n - 1);
              sa = sa + H.get(i, j) * H.get(j, n);
            }
            w = H.get(i, i) - p;
            if (e[i] < 0) {
              z = w;
              r = ra;
              s = sa;
            } else {
              l = i;
              if (e[i] === 0) {
                cdivres = cdiv(-ra, -sa, w, q);
                H.set(i, n - 1, cdivres[0]);
                H.set(i, n, cdivres[1]);
              } else {
                x = H.get(i, i + 1);
                y = H.get(i + 1, i);
                vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
                vi = (d[i] - p) * 2 * q;
                if (vr === 0 && vi === 0) {
                  vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
                }
                cdivres = cdiv(
                  x * r - z * ra + q * sa,
                  x * s - z * sa - q * ra,
                  vr,
                  vi
                );
                H.set(i, n - 1, cdivres[0]);
                H.set(i, n, cdivres[1]);
                if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                  H.set(
                    i + 1,
                    n - 1,
                    (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x
                  );
                  H.set(
                    i + 1,
                    n,
                    (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x
                  );
                } else {
                  cdivres = cdiv(
                    -r - y * H.get(i, n - 1),
                    -s - y * H.get(i, n),
                    z,
                    q
                  );
                  H.set(i + 1, n - 1, cdivres[0]);
                  H.set(i + 1, n, cdivres[1]);
                }
              }
              t = Math.max(Math.abs(H.get(i, n - 1)), Math.abs(H.get(i, n)));
              if (eps * t * t > 1) {
                for (j = i; j <= n; j++) {
                  H.set(j, n - 1, H.get(j, n - 1) / t);
                  H.set(j, n, H.get(j, n) / t);
                }
              }
            }
          }
        }
      }
      for (i = 0; i < nn; i++) {
        if (i < low || i > high) {
          for (j = i; j < nn; j++) {
            V.set(i, j, H.get(i, j));
          }
        }
      }
      for (j = nn - 1; j >= low; j--) {
        for (i = low; i <= high; i++) {
          z = 0;
          for (k = low; k <= Math.min(j, high); k++) {
            z = z + V.get(i, k) * H.get(k, j);
          }
          V.set(i, j, z);
        }
      }
    }
    function cdiv(xr, xi, yr, yi) {
      let r, d;
      if (Math.abs(yr) > Math.abs(yi)) {
        r = yi / yr;
        d = yr + r * yi;
        return [(xr + r * xi) / d, (xi - r * xr) / d];
      } else {
        r = yr / yi;
        d = yi + r * yr;
        return [(r * xr + xi) / d, (r * xi - xr) / d];
      }
    }
    var CholeskyDecomposition = class {
      constructor(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        if (!value.isSymmetric()) {
          throw new Error("Matrix is not symmetric");
        }
        let a = value;
        let dimension = a.rows;
        let l = new Matrix(dimension, dimension);
        let positiveDefinite = true;
        let i, j, k;
        for (j = 0; j < dimension; j++) {
          let d = 0;
          for (k = 0; k < j; k++) {
            let s = 0;
            for (i = 0; i < k; i++) {
              s += l.get(k, i) * l.get(j, i);
            }
            s = (a.get(j, k) - s) / l.get(k, k);
            l.set(j, k, s);
            d = d + s * s;
          }
          d = a.get(j, j) - d;
          positiveDefinite &&= d > 0;
          l.set(j, j, Math.sqrt(Math.max(d, 0)));
          for (k = j + 1; k < dimension; k++) {
            l.set(j, k, 0);
          }
        }
        this.L = l;
        this.positiveDefinite = positiveDefinite;
      }
      isPositiveDefinite() {
        return this.positiveDefinite;
      }
      solve(value) {
        value = WrapperMatrix2D.checkMatrix(value);
        let l = this.L;
        let dimension = l.rows;
        if (value.rows !== dimension) {
          throw new Error("Matrix dimensions do not match");
        }
        if (this.isPositiveDefinite() === false) {
          throw new Error("Matrix is not positive definite");
        }
        let count = value.columns;
        let B = value.clone();
        let i, j, k;
        for (k = 0; k < dimension; k++) {
          for (j = 0; j < count; j++) {
            for (i = 0; i < k; i++) {
              B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(k, i));
            }
            B.set(k, j, B.get(k, j) / l.get(k, k));
          }
        }
        for (k = dimension - 1; k >= 0; k--) {
          for (j = 0; j < count; j++) {
            for (i = k + 1; i < dimension; i++) {
              B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(i, k));
            }
            B.set(k, j, B.get(k, j) / l.get(k, k));
          }
        }
        return B;
      }
      get lowerTriangularMatrix() {
        return this.L;
      }
    };
    var nipals = class {
      constructor(X2, options = {}) {
        X2 = WrapperMatrix2D.checkMatrix(X2);
        let { Y: Y2 } = options;
        const {
          scaleScores = false,
          maxIterations = 1e3,
          terminationCriteria = 1e-10
        } = options;
        let u;
        if (Y2) {
          if (isAnyArray.isAnyArray(Y2) && typeof Y2[0] === "number") {
            Y2 = Matrix.columnVector(Y2);
          } else {
            Y2 = WrapperMatrix2D.checkMatrix(Y2);
          }
          if (Y2.rows !== X2.rows) {
            throw new Error("Y should have the same number of rows as X");
          }
          u = Y2.getColumnVector(0);
        } else {
          u = X2.getColumnVector(0);
        }
        let diff = 1;
        let t, q, w, tOld;
        for (let counter = 0; counter < maxIterations && diff > terminationCriteria; counter++) {
          w = X2.transpose().mmul(u).div(u.transpose().mmul(u).get(0, 0));
          w = w.div(w.norm());
          t = X2.mmul(w).div(w.transpose().mmul(w).get(0, 0));
          if (counter > 0) {
            diff = t.clone().sub(tOld).pow(2).sum();
          }
          tOld = t.clone();
          if (Y2) {
            q = Y2.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
            q = q.div(q.norm());
            u = Y2.mmul(q).div(q.transpose().mmul(q).get(0, 0));
          } else {
            u = t;
          }
        }
        if (Y2) {
          let p = X2.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
          p = p.div(p.norm());
          let xResidual = X2.clone().sub(t.clone().mmul(p.transpose()));
          let residual = u.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
          let yResidual = Y2.clone().sub(
            t.clone().mulS(residual.get(0, 0)).mmul(q.transpose())
          );
          this.t = t;
          this.p = p.transpose();
          this.w = w.transpose();
          this.q = q;
          this.u = u;
          this.s = t.transpose().mmul(t);
          this.xResidual = xResidual;
          this.yResidual = yResidual;
          this.betas = residual;
        } else {
          this.w = w.transpose();
          this.s = t.transpose().mmul(t).sqrt();
          if (scaleScores) {
            this.t = t.clone().div(this.s.get(0, 0));
          } else {
            this.t = t;
          }
          this.xResidual = X2.sub(t.mmul(w.transpose()));
        }
      }
    };
    exports.AbstractMatrix = AbstractMatrix;
    exports.CHO = CholeskyDecomposition;
    exports.CholeskyDecomposition = CholeskyDecomposition;
    exports.DistanceMatrix = DistanceMatrix;
    exports.EVD = EigenvalueDecomposition;
    exports.EigenvalueDecomposition = EigenvalueDecomposition;
    exports.LU = LuDecomposition;
    exports.LuDecomposition = LuDecomposition;
    exports.Matrix = Matrix;
    exports.MatrixColumnSelectionView = MatrixColumnSelectionView;
    exports.MatrixColumnView = MatrixColumnView;
    exports.MatrixFlipColumnView = MatrixFlipColumnView;
    exports.MatrixFlipRowView = MatrixFlipRowView;
    exports.MatrixRowSelectionView = MatrixRowSelectionView;
    exports.MatrixRowView = MatrixRowView;
    exports.MatrixSelectionView = MatrixSelectionView;
    exports.MatrixSubView = MatrixSubView;
    exports.MatrixTransposeView = MatrixTransposeView;
    exports.NIPALS = nipals;
    exports.Nipals = nipals;
    exports.QR = QrDecomposition;
    exports.QrDecomposition = QrDecomposition;
    exports.SVD = SingularValueDecomposition;
    exports.SingularValueDecomposition = SingularValueDecomposition;
    exports.SymmetricMatrix = SymmetricMatrix;
    exports.WrapperMatrix1D = WrapperMatrix1D;
    exports.WrapperMatrix2D = WrapperMatrix2D;
    exports.correlation = correlation;
    exports.covariance = covariance;
    exports.default = Matrix;
    exports.determinant = determinant;
    exports.inverse = inverse;
    exports.linearDependencies = linearDependencies;
    exports.pseudoInverse = pseudoInverse;
    exports.solve = solve;
    exports.wrap = wrap;
  }
});

// node_modules/ml-levenberg-marquardt/lib/index.js
var require_lib9 = __commonJS({
  "node_modules/ml-levenberg-marquardt/lib/index.js"(exports, module) {
    "use strict";
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var isArray = _interopDefault(require_lib());
    var mlMatrix = require_matrix2();
    function errorCalculation(data, parameters, parameterizedFunction) {
      let error = 0;
      const func = parameterizedFunction(parameters);
      for (let i = 0; i < data.x.length; i++) {
        error += Math.abs(data.y[i] - func(data.x[i]));
      }
      return error;
    }
    function gradientFunction(data, evaluatedData, params, gradientDifference, paramFunction) {
      const n = params.length;
      const m = data.x.length;
      let ans = new Array(n);
      for (let param = 0; param < n; param++) {
        ans[param] = new Array(m);
        let auxParams = params.slice();
        auxParams[param] += gradientDifference;
        let funcParam = paramFunction(auxParams);
        for (let point = 0; point < m; point++) {
          ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
        }
      }
      return new mlMatrix.Matrix(ans);
    }
    function matrixFunction(data, evaluatedData) {
      const m = data.x.length;
      let ans = new Array(m);
      for (let point = 0; point < m; point++) {
        ans[point] = [data.y[point] - evaluatedData[point]];
      }
      return new mlMatrix.Matrix(ans);
    }
    function step(data, params, damping, gradientDifference, parameterizedFunction) {
      let value = damping * gradientDifference * gradientDifference;
      let identity3 = mlMatrix.Matrix.eye(params.length, params.length, value);
      const func = parameterizedFunction(params);
      let evaluatedData = new Float64Array(data.x.length);
      for (let i = 0; i < data.x.length; i++) {
        evaluatedData[i] = func(data.x[i]);
      }
      let gradientFunc = gradientFunction(
        data,
        evaluatedData,
        params,
        gradientDifference,
        parameterizedFunction
      );
      let matrixFunc = matrixFunction(data, evaluatedData);
      let inverseMatrix = mlMatrix.inverse(
        identity3.add(gradientFunc.mmul(gradientFunc.transpose()))
      );
      params = new mlMatrix.Matrix([params]);
      params = params.sub(
        inverseMatrix.mmul(gradientFunc).mmul(matrixFunc).mul(gradientDifference).transpose()
      );
      return params.to1DArray();
    }
    function levenbergMarquardt(data, parameterizedFunction, options = {}) {
      let {
        maxIterations = 100,
        gradientDifference = 0.1,
        damping = 0,
        errorTolerance = 0.01,
        minValues,
        maxValues,
        initialValues
      } = options;
      if (damping <= 0) {
        throw new Error("The damping option must be a positive number");
      } else if (!data.x || !data.y) {
        throw new Error("The data parameter must have x and y elements");
      } else if (!isArray(data.x) || data.x.length < 2 || !isArray(data.y) || data.y.length < 2) {
        throw new Error(
          "The data parameter elements must be an array with more than 2 points"
        );
      } else if (data.x.length !== data.y.length) {
        throw new Error("The data parameter elements must have the same size");
      }
      let parameters = initialValues || new Array(parameterizedFunction.length).fill(1);
      let parLen = parameters.length;
      maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
      minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);
      if (maxValues.length !== minValues.length) {
        throw new Error("minValues and maxValues must be the same size");
      }
      if (!isArray(parameters)) {
        throw new Error("initialValues must be an array");
      }
      let error = errorCalculation(data, parameters, parameterizedFunction);
      let converged = error <= errorTolerance;
      let iteration;
      for (iteration = 0; iteration < maxIterations && !converged; iteration++) {
        parameters = step(
          data,
          parameters,
          damping,
          gradientDifference,
          parameterizedFunction
        );
        for (let k = 0; k < parLen; k++) {
          parameters[k] = Math.min(
            Math.max(minValues[k], parameters[k]),
            maxValues[k]
          );
        }
        error = errorCalculation(data, parameters, parameterizedFunction);
        if (isNaN(error)) break;
        converged = error <= errorTolerance;
      }
      return {
        parameterValues: parameters,
        parameterError: error,
        iterations: iteration
      };
    }
    module.exports = levenbergMarquardt;
  }
});

// node_modules/umap-js/dist/umap.js
var require_umap = __commonJS({
  "node_modules/umap-js/dist/umap.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = exports && exports.__generator || function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t[0] & 1) throw t[1];
        return t[1];
      }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
      }
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spread = exports && exports.__spread || function() {
      for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
      return ar;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initTransform = exports.resetLocalConnectivity = exports.fastIntersection = exports.findABParams = exports.cosine = exports.euclidean = exports.UMAP = void 0;
    var heap = __importStar(require_heap());
    var matrix = __importStar(require_matrix());
    var nnDescent = __importStar(require_nn_descent());
    var tree = __importStar(require_tree());
    var utils = __importStar(require_utils());
    var ml_levenberg_marquardt_1 = __importDefault(require_lib9());
    var SMOOTH_K_TOLERANCE = 1e-5;
    var MIN_K_DIST_SCALE = 1e-3;
    var UMAP2 = (function() {
      function UMAP3(params) {
        var _this = this;
        if (params === void 0) {
          params = {};
        }
        this.learningRate = 1;
        this.localConnectivity = 1;
        this.minDist = 0.1;
        this.nComponents = 2;
        this.nEpochs = 0;
        this.nNeighbors = 15;
        this.negativeSampleRate = 5;
        this.random = Math.random;
        this.repulsionStrength = 1;
        this.setOpMixRatio = 1;
        this.spread = 1;
        this.transformQueueSize = 4;
        this.targetMetric = "categorical";
        this.targetWeight = 0.5;
        this.targetNNeighbors = this.nNeighbors;
        this.distanceFn = euclidean2;
        this.isInitialized = false;
        this.rpForest = [];
        this.embedding = [];
        this.optimizationState = new OptimizationState();
        var setParam = function(key) {
          if (params[key] !== void 0)
            _this[key] = params[key];
        };
        setParam("distanceFn");
        setParam("learningRate");
        setParam("localConnectivity");
        setParam("minDist");
        setParam("nComponents");
        setParam("nEpochs");
        setParam("nNeighbors");
        setParam("negativeSampleRate");
        setParam("random");
        setParam("repulsionStrength");
        setParam("setOpMixRatio");
        setParam("spread");
        setParam("transformQueueSize");
      }
      UMAP3.prototype.fit = function(X2) {
        this.initializeFit(X2);
        this.optimizeLayout();
        return this.embedding;
      };
      UMAP3.prototype.fitAsync = function(X2, callback) {
        if (callback === void 0) {
          callback = function() {
            return true;
          };
        }
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                this.initializeFit(X2);
                return [4, this.optimizeLayoutAsync(callback)];
              case 1:
                _a.sent();
                return [2, this.embedding];
            }
          });
        });
      };
      UMAP3.prototype.setSupervisedProjection = function(Y2, params) {
        if (params === void 0) {
          params = {};
        }
        this.Y = Y2;
        this.targetMetric = params.targetMetric || this.targetMetric;
        this.targetWeight = params.targetWeight || this.targetWeight;
        this.targetNNeighbors = params.targetNNeighbors || this.targetNNeighbors;
      };
      UMAP3.prototype.setPrecomputedKNN = function(knnIndices, knnDistances) {
        this.knnIndices = knnIndices;
        this.knnDistances = knnDistances;
      };
      UMAP3.prototype.initializeFit = function(X2) {
        if (X2.length <= this.nNeighbors) {
          throw new Error("Not enough data points (" + X2.length + ") to create nNeighbors: " + this.nNeighbors + ".  Add more data points or adjust the configuration.");
        }
        if (this.X === X2 && this.isInitialized) {
          return this.getNEpochs();
        }
        this.X = X2;
        if (!this.knnIndices && !this.knnDistances) {
          var knnResults = this.nearestNeighbors(X2);
          this.knnIndices = knnResults.knnIndices;
          this.knnDistances = knnResults.knnDistances;
        }
        this.graph = this.fuzzySimplicialSet(X2, this.nNeighbors, this.setOpMixRatio);
        this.makeSearchFns();
        this.searchGraph = this.makeSearchGraph(X2);
        this.processGraphForSupervisedProjection();
        var _a = this.initializeSimplicialSetEmbedding(), head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
        this.optimizationState.head = head;
        this.optimizationState.tail = tail;
        this.optimizationState.epochsPerSample = epochsPerSample;
        this.initializeOptimization();
        this.prepareForOptimizationLoop();
        this.isInitialized = true;
        return this.getNEpochs();
      };
      UMAP3.prototype.makeSearchFns = function() {
        var _a = nnDescent.makeInitializations(this.distanceFn), initFromTree = _a.initFromTree, initFromRandom = _a.initFromRandom;
        this.initFromTree = initFromTree;
        this.initFromRandom = initFromRandom;
        this.search = nnDescent.makeInitializedNNSearch(this.distanceFn);
      };
      UMAP3.prototype.makeSearchGraph = function(X2) {
        var knnIndices = this.knnIndices;
        var knnDistances = this.knnDistances;
        var dims = [X2.length, X2.length];
        var searchGraph = new matrix.SparseMatrix([], [], [], dims);
        for (var i = 0; i < knnIndices.length; i++) {
          var knn = knnIndices[i];
          var distances = knnDistances[i];
          for (var j = 0; j < knn.length; j++) {
            var neighbor = knn[j];
            var distance = distances[j];
            if (distance > 0) {
              searchGraph.set(i, neighbor, distance);
            }
          }
        }
        var transpose = matrix.transpose(searchGraph);
        return matrix.maximum(searchGraph, transpose);
      };
      UMAP3.prototype.transform = function(toTransform) {
        var _this = this;
        var rawData = this.X;
        if (rawData === void 0 || rawData.length === 0) {
          throw new Error("No data has been fit.");
        }
        var nNeighbors = Math.floor(this.nNeighbors * this.transformQueueSize);
        nNeighbors = Math.min(rawData.length, nNeighbors);
        var init2 = nnDescent.initializeSearch(this.rpForest, rawData, toTransform, nNeighbors, this.initFromRandom, this.initFromTree, this.random);
        var result = this.search(rawData, this.searchGraph, init2, toTransform);
        var _a = heap.deheapSort(result), indices = _a.indices, distances = _a.weights;
        indices = indices.map(function(x) {
          return x.slice(0, _this.nNeighbors);
        });
        distances = distances.map(function(x) {
          return x.slice(0, _this.nNeighbors);
        });
        var adjustedLocalConnectivity = Math.max(0, this.localConnectivity - 1);
        var _b = this.smoothKNNDistance(distances, this.nNeighbors, adjustedLocalConnectivity), sigmas = _b.sigmas, rhos = _b.rhos;
        var _c = this.computeMembershipStrengths(indices, distances, sigmas, rhos), rows = _c.rows, cols = _c.cols, vals = _c.vals;
        var size = [toTransform.length, rawData.length];
        var graph = new matrix.SparseMatrix(rows, cols, vals, size);
        var normed = matrix.normalize(graph, "l1");
        var csrMatrix = matrix.getCSR(normed);
        var nPoints = toTransform.length;
        var eIndices = utils.reshape2d(csrMatrix.indices, nPoints, this.nNeighbors);
        var eWeights = utils.reshape2d(csrMatrix.values, nPoints, this.nNeighbors);
        var embedding = initTransform(eIndices, eWeights, this.embedding);
        var nEpochs = this.nEpochs ? this.nEpochs / 3 : graph.nRows <= 1e4 ? 100 : 30;
        var graphMax = graph.getValues().reduce(function(max2, val) {
          return val > max2 ? val : max2;
        }, 0);
        graph = graph.map(function(value) {
          return value < graphMax / nEpochs ? 0 : value;
        });
        graph = matrix.eliminateZeros(graph);
        var epochsPerSample = this.makeEpochsPerSample(graph.getValues(), nEpochs);
        var head = graph.getRows();
        var tail = graph.getCols();
        this.assignOptimizationStateParameters({
          headEmbedding: embedding,
          tailEmbedding: this.embedding,
          head,
          tail,
          currentEpoch: 0,
          nEpochs,
          nVertices: graph.getDims()[1],
          epochsPerSample
        });
        this.prepareForOptimizationLoop();
        return this.optimizeLayout();
      };
      UMAP3.prototype.processGraphForSupervisedProjection = function() {
        var _a = this, Y2 = _a.Y, X2 = _a.X;
        if (Y2) {
          if (Y2.length !== X2.length) {
            throw new Error("Length of X and y must be equal");
          }
          if (this.targetMetric === "categorical") {
            var lt = this.targetWeight < 1;
            var farDist = lt ? 2.5 * (1 / (1 - this.targetWeight)) : 1e12;
            this.graph = this.categoricalSimplicialSetIntersection(this.graph, Y2, farDist);
          }
        }
      };
      UMAP3.prototype.step = function() {
        var currentEpoch = this.optimizationState.currentEpoch;
        if (currentEpoch < this.getNEpochs()) {
          this.optimizeLayoutStep(currentEpoch);
        }
        return this.optimizationState.currentEpoch;
      };
      UMAP3.prototype.getEmbedding = function() {
        return this.embedding;
      };
      UMAP3.prototype.nearestNeighbors = function(X2) {
        var _a = this, distanceFn = _a.distanceFn, nNeighbors = _a.nNeighbors;
        var log2 = function(n) {
          return Math.log(n) / Math.log(2);
        };
        var metricNNDescent = nnDescent.makeNNDescent(distanceFn, this.random);
        var round = function(n) {
          return n === 0.5 ? 0 : Math.round(n);
        };
        var nTrees = 5 + Math.floor(round(Math.pow(X2.length, 0.5) / 20));
        var nIters = Math.max(5, Math.floor(Math.round(log2(X2.length))));
        this.rpForest = tree.makeForest(X2, nNeighbors, nTrees, this.random);
        var leafArray = tree.makeLeafArray(this.rpForest);
        var _b = metricNNDescent(X2, leafArray, nNeighbors, nIters), indices = _b.indices, weights = _b.weights;
        return { knnIndices: indices, knnDistances: weights };
      };
      UMAP3.prototype.fuzzySimplicialSet = function(X2, nNeighbors, setOpMixRatio) {
        if (setOpMixRatio === void 0) {
          setOpMixRatio = 1;
        }
        var _a = this, _b = _a.knnIndices, knnIndices = _b === void 0 ? [] : _b, _c = _a.knnDistances, knnDistances = _c === void 0 ? [] : _c, localConnectivity = _a.localConnectivity;
        var _d = this.smoothKNNDistance(knnDistances, nNeighbors, localConnectivity), sigmas = _d.sigmas, rhos = _d.rhos;
        var _e = this.computeMembershipStrengths(knnIndices, knnDistances, sigmas, rhos), rows = _e.rows, cols = _e.cols, vals = _e.vals;
        var size = [X2.length, X2.length];
        var sparseMatrix = new matrix.SparseMatrix(rows, cols, vals, size);
        var transpose = matrix.transpose(sparseMatrix);
        var prodMatrix = matrix.pairwiseMultiply(sparseMatrix, transpose);
        var a = matrix.subtract(matrix.add(sparseMatrix, transpose), prodMatrix);
        var b = matrix.multiplyScalar(a, setOpMixRatio);
        var c = matrix.multiplyScalar(prodMatrix, 1 - setOpMixRatio);
        var result = matrix.add(b, c);
        return result;
      };
      UMAP3.prototype.categoricalSimplicialSetIntersection = function(simplicialSet, target, farDist, unknownDist) {
        if (unknownDist === void 0) {
          unknownDist = 1;
        }
        var intersection = fastIntersection(simplicialSet, target, unknownDist, farDist);
        intersection = matrix.eliminateZeros(intersection);
        return resetLocalConnectivity(intersection);
      };
      UMAP3.prototype.smoothKNNDistance = function(distances, k, localConnectivity, nIter, bandwidth) {
        if (localConnectivity === void 0) {
          localConnectivity = 1;
        }
        if (nIter === void 0) {
          nIter = 64;
        }
        if (bandwidth === void 0) {
          bandwidth = 1;
        }
        var target = Math.log(k) / Math.log(2) * bandwidth;
        var rho = utils.zeros(distances.length);
        var result = utils.zeros(distances.length);
        for (var i = 0; i < distances.length; i++) {
          var lo = 0;
          var hi = Infinity;
          var mid = 1;
          var ithDistances = distances[i];
          var nonZeroDists = ithDistances.filter(function(d2) {
            return d2 > 0;
          });
          if (nonZeroDists.length >= localConnectivity) {
            var index = Math.floor(localConnectivity);
            var interpolation = localConnectivity - index;
            if (index > 0) {
              rho[i] = nonZeroDists[index - 1];
              if (interpolation > SMOOTH_K_TOLERANCE) {
                rho[i] += interpolation * (nonZeroDists[index] - nonZeroDists[index - 1]);
              }
            } else {
              rho[i] = interpolation * nonZeroDists[0];
            }
          } else if (nonZeroDists.length > 0) {
            rho[i] = utils.max(nonZeroDists);
          }
          for (var n = 0; n < nIter; n++) {
            var psum = 0;
            for (var j = 1; j < distances[i].length; j++) {
              var d = distances[i][j] - rho[i];
              if (d > 0) {
                psum += Math.exp(-(d / mid));
              } else {
                psum += 1;
              }
            }
            if (Math.abs(psum - target) < SMOOTH_K_TOLERANCE) {
              break;
            }
            if (psum > target) {
              hi = mid;
              mid = (lo + hi) / 2;
            } else {
              lo = mid;
              if (hi === Infinity) {
                mid *= 2;
              } else {
                mid = (lo + hi) / 2;
              }
            }
          }
          result[i] = mid;
          if (rho[i] > 0) {
            var meanIthDistances = utils.mean(ithDistances);
            if (result[i] < MIN_K_DIST_SCALE * meanIthDistances) {
              result[i] = MIN_K_DIST_SCALE * meanIthDistances;
            }
          } else {
            var meanDistances = utils.mean(distances.map(utils.mean));
            if (result[i] < MIN_K_DIST_SCALE * meanDistances) {
              result[i] = MIN_K_DIST_SCALE * meanDistances;
            }
          }
        }
        return { sigmas: result, rhos: rho };
      };
      UMAP3.prototype.computeMembershipStrengths = function(knnIndices, knnDistances, sigmas, rhos) {
        var nSamples = knnIndices.length;
        var nNeighbors = knnIndices[0].length;
        var rows = utils.zeros(nSamples * nNeighbors);
        var cols = utils.zeros(nSamples * nNeighbors);
        var vals = utils.zeros(nSamples * nNeighbors);
        for (var i = 0; i < nSamples; i++) {
          for (var j = 0; j < nNeighbors; j++) {
            var val = 0;
            if (knnIndices[i][j] === -1) {
              continue;
            }
            if (knnIndices[i][j] === i) {
              val = 0;
            } else if (knnDistances[i][j] - rhos[i] <= 0) {
              val = 1;
            } else {
              val = Math.exp(-((knnDistances[i][j] - rhos[i]) / sigmas[i]));
            }
            rows[i * nNeighbors + j] = i;
            cols[i * nNeighbors + j] = knnIndices[i][j];
            vals[i * nNeighbors + j] = val;
          }
        }
        return { rows, cols, vals };
      };
      UMAP3.prototype.initializeSimplicialSetEmbedding = function() {
        var _this = this;
        var nEpochs = this.getNEpochs();
        var nComponents = this.nComponents;
        var graphValues = this.graph.getValues();
        var graphMax = 0;
        for (var i = 0; i < graphValues.length; i++) {
          var value = graphValues[i];
          if (graphMax < graphValues[i]) {
            graphMax = value;
          }
        }
        var graph = this.graph.map(function(value2) {
          if (value2 < graphMax / nEpochs) {
            return 0;
          } else {
            return value2;
          }
        });
        this.embedding = utils.zeros(graph.nRows).map(function() {
          return utils.zeros(nComponents).map(function() {
            return utils.tauRand(_this.random) * 20 + -10;
          });
        });
        var weights = [];
        var head = [];
        var tail = [];
        var rowColValues = graph.getAll();
        for (var i = 0; i < rowColValues.length; i++) {
          var entry = rowColValues[i];
          if (entry.value) {
            weights.push(entry.value);
            tail.push(entry.row);
            head.push(entry.col);
          }
        }
        var epochsPerSample = this.makeEpochsPerSample(weights, nEpochs);
        return { head, tail, epochsPerSample };
      };
      UMAP3.prototype.makeEpochsPerSample = function(weights, nEpochs) {
        var result = utils.filled(weights.length, -1);
        var max2 = utils.max(weights);
        var nSamples = weights.map(function(w) {
          return w / max2 * nEpochs;
        });
        nSamples.forEach(function(n, i) {
          if (n > 0)
            result[i] = nEpochs / nSamples[i];
        });
        return result;
      };
      UMAP3.prototype.assignOptimizationStateParameters = function(state) {
        Object.assign(this.optimizationState, state);
      };
      UMAP3.prototype.prepareForOptimizationLoop = function() {
        var _a = this, repulsionStrength = _a.repulsionStrength, learningRate = _a.learningRate, negativeSampleRate = _a.negativeSampleRate;
        var _b = this.optimizationState, epochsPerSample = _b.epochsPerSample, headEmbedding = _b.headEmbedding, tailEmbedding = _b.tailEmbedding;
        var dim = headEmbedding[0].length;
        var moveOther = headEmbedding.length === tailEmbedding.length;
        var epochsPerNegativeSample = epochsPerSample.map(function(e) {
          return e / negativeSampleRate;
        });
        var epochOfNextNegativeSample = __spread(epochsPerNegativeSample);
        var epochOfNextSample = __spread(epochsPerSample);
        this.assignOptimizationStateParameters({
          epochOfNextSample,
          epochOfNextNegativeSample,
          epochsPerNegativeSample,
          moveOther,
          initialAlpha: learningRate,
          alpha: learningRate,
          gamma: repulsionStrength,
          dim
        });
      };
      UMAP3.prototype.initializeOptimization = function() {
        var headEmbedding = this.embedding;
        var tailEmbedding = this.embedding;
        var _a = this.optimizationState, head = _a.head, tail = _a.tail, epochsPerSample = _a.epochsPerSample;
        var nEpochs = this.getNEpochs();
        var nVertices = this.graph.nCols;
        var _b = findABParams(this.spread, this.minDist), a = _b.a, b = _b.b;
        this.assignOptimizationStateParameters({
          headEmbedding,
          tailEmbedding,
          head,
          tail,
          epochsPerSample,
          a,
          b,
          nEpochs,
          nVertices
        });
      };
      UMAP3.prototype.optimizeLayoutStep = function(n) {
        var optimizationState = this.optimizationState;
        var head = optimizationState.head, tail = optimizationState.tail, headEmbedding = optimizationState.headEmbedding, tailEmbedding = optimizationState.tailEmbedding, epochsPerSample = optimizationState.epochsPerSample, epochOfNextSample = optimizationState.epochOfNextSample, epochOfNextNegativeSample = optimizationState.epochOfNextNegativeSample, epochsPerNegativeSample = optimizationState.epochsPerNegativeSample, moveOther = optimizationState.moveOther, initialAlpha = optimizationState.initialAlpha, alpha = optimizationState.alpha, gamma2 = optimizationState.gamma, a = optimizationState.a, b = optimizationState.b, dim = optimizationState.dim, nEpochs = optimizationState.nEpochs, nVertices = optimizationState.nVertices;
        var clipValue = 4;
        for (var i = 0; i < epochsPerSample.length; i++) {
          if (epochOfNextSample[i] > n) {
            continue;
          }
          var j = head[i];
          var k = tail[i];
          var current = headEmbedding[j];
          var other = tailEmbedding[k];
          var distSquared = rDist(current, other);
          var gradCoeff = 0;
          if (distSquared > 0) {
            gradCoeff = -2 * a * b * Math.pow(distSquared, b - 1);
            gradCoeff /= a * Math.pow(distSquared, b) + 1;
          }
          for (var d = 0; d < dim; d++) {
            var gradD = clip(gradCoeff * (current[d] - other[d]), clipValue);
            current[d] += gradD * alpha;
            if (moveOther) {
              other[d] += -gradD * alpha;
            }
          }
          epochOfNextSample[i] += epochsPerSample[i];
          var nNegSamples = Math.floor((n - epochOfNextNegativeSample[i]) / epochsPerNegativeSample[i]);
          for (var p = 0; p < nNegSamples; p++) {
            var k_1 = utils.tauRandInt(nVertices, this.random);
            var other_1 = tailEmbedding[k_1];
            var distSquared_1 = rDist(current, other_1);
            var gradCoeff_1 = 0;
            if (distSquared_1 > 0) {
              gradCoeff_1 = 2 * gamma2 * b;
              gradCoeff_1 /= (1e-3 + distSquared_1) * (a * Math.pow(distSquared_1, b) + 1);
            } else if (j === k_1) {
              continue;
            }
            for (var d = 0; d < dim; d++) {
              var gradD = 4;
              if (gradCoeff_1 > 0) {
                gradD = clip(gradCoeff_1 * (current[d] - other_1[d]), clipValue);
              }
              current[d] += gradD * alpha;
            }
          }
          epochOfNextNegativeSample[i] += nNegSamples * epochsPerNegativeSample[i];
        }
        optimizationState.alpha = initialAlpha * (1 - n / nEpochs);
        optimizationState.currentEpoch += 1;
        return headEmbedding;
      };
      UMAP3.prototype.optimizeLayoutAsync = function(epochCallback) {
        var _this = this;
        if (epochCallback === void 0) {
          epochCallback = function() {
            return true;
          };
        }
        return new Promise(function(resolve, reject) {
          var step = function() {
            return __awaiter(_this, void 0, void 0, function() {
              var _a, nEpochs, currentEpoch, epochCompleted, shouldStop, isFinished;
              return __generator(this, function(_b) {
                try {
                  _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
                  this.embedding = this.optimizeLayoutStep(currentEpoch);
                  epochCompleted = this.optimizationState.currentEpoch;
                  shouldStop = epochCallback(epochCompleted) === false;
                  isFinished = epochCompleted === nEpochs;
                  if (!shouldStop && !isFinished) {
                    setTimeout(function() {
                      return step();
                    }, 0);
                  } else {
                    return [2, resolve(isFinished)];
                  }
                } catch (err) {
                  reject(err);
                }
                return [2];
              });
            });
          };
          setTimeout(function() {
            return step();
          }, 0);
        });
      };
      UMAP3.prototype.optimizeLayout = function(epochCallback) {
        if (epochCallback === void 0) {
          epochCallback = function() {
            return true;
          };
        }
        var isFinished = false;
        var embedding = [];
        while (!isFinished) {
          var _a = this.optimizationState, nEpochs = _a.nEpochs, currentEpoch = _a.currentEpoch;
          embedding = this.optimizeLayoutStep(currentEpoch);
          var epochCompleted = this.optimizationState.currentEpoch;
          var shouldStop = epochCallback(epochCompleted) === false;
          isFinished = epochCompleted === nEpochs || shouldStop;
        }
        return embedding;
      };
      UMAP3.prototype.getNEpochs = function() {
        var graph = this.graph;
        if (this.nEpochs > 0) {
          return this.nEpochs;
        }
        var length = graph.nRows;
        if (length <= 2500) {
          return 500;
        } else if (length <= 5e3) {
          return 400;
        } else if (length <= 7500) {
          return 300;
        } else {
          return 200;
        }
      };
      return UMAP3;
    })();
    exports.UMAP = UMAP2;
    function euclidean2(x, y) {
      var result = 0;
      for (var i = 0; i < x.length; i++) {
        result += Math.pow(x[i] - y[i], 2);
      }
      return Math.sqrt(result);
    }
    exports.euclidean = euclidean2;
    function cosine(x, y) {
      var result = 0;
      var normX = 0;
      var normY = 0;
      for (var i = 0; i < x.length; i++) {
        result += x[i] * y[i];
        normX += Math.pow(x[i], 2);
        normY += Math.pow(y[i], 2);
      }
      if (normX === 0 && normY === 0) {
        return 0;
      } else if (normX === 0 || normY === 0) {
        return 1;
      } else {
        return 1 - result / Math.sqrt(normX * normY);
      }
    }
    exports.cosine = cosine;
    var OptimizationState = /* @__PURE__ */ (function() {
      function OptimizationState2() {
        this.currentEpoch = 0;
        this.headEmbedding = [];
        this.tailEmbedding = [];
        this.head = [];
        this.tail = [];
        this.epochsPerSample = [];
        this.epochOfNextSample = [];
        this.epochOfNextNegativeSample = [];
        this.epochsPerNegativeSample = [];
        this.moveOther = true;
        this.initialAlpha = 1;
        this.alpha = 1;
        this.gamma = 1;
        this.a = 1.5769434603113077;
        this.b = 0.8950608779109733;
        this.dim = 2;
        this.nEpochs = 500;
        this.nVertices = 0;
      }
      return OptimizationState2;
    })();
    function clip(x, clipValue) {
      if (x > clipValue)
        return clipValue;
      else if (x < -clipValue)
        return -clipValue;
      else
        return x;
    }
    function rDist(x, y) {
      var result = 0;
      for (var i = 0; i < x.length; i++) {
        result += Math.pow(x[i] - y[i], 2);
      }
      return result;
    }
    function findABParams(spread, minDist) {
      var curve = function(_a2) {
        var _b = __read(_a2, 2), a2 = _b[0], b2 = _b[1];
        return function(x) {
          return 1 / (1 + a2 * Math.pow(x, 2 * b2));
        };
      };
      var xv = utils.linear(0, spread * 3, 300).map(function(val) {
        return val < minDist ? 1 : val;
      });
      var yv = utils.zeros(xv.length).map(function(val, index) {
        var gte = xv[index] >= minDist;
        return gte ? Math.exp(-(xv[index] - minDist) / spread) : val;
      });
      var initialValues = [0.5, 0.5];
      var data = { x: xv, y: yv };
      var options = {
        damping: 1.5,
        initialValues,
        gradientDifference: 0.1,
        maxIterations: 100,
        errorTolerance: 0.01
      };
      var parameterValues = ml_levenberg_marquardt_1.default(data, curve, options).parameterValues;
      var _a = __read(parameterValues, 2), a = _a[0], b = _a[1];
      return { a, b };
    }
    exports.findABParams = findABParams;
    function fastIntersection(graph, target, unknownDist, farDist) {
      if (unknownDist === void 0) {
        unknownDist = 1;
      }
      if (farDist === void 0) {
        farDist = 5;
      }
      return graph.map(function(value, row, col) {
        if (target[row] === -1 || target[col] === -1) {
          return value * Math.exp(-unknownDist);
        } else if (target[row] !== target[col]) {
          return value * Math.exp(-farDist);
        } else {
          return value;
        }
      });
    }
    exports.fastIntersection = fastIntersection;
    function resetLocalConnectivity(simplicialSet) {
      simplicialSet = matrix.normalize(simplicialSet, "max");
      var transpose = matrix.transpose(simplicialSet);
      var prodMatrix = matrix.pairwiseMultiply(transpose, simplicialSet);
      simplicialSet = matrix.add(simplicialSet, matrix.subtract(transpose, prodMatrix));
      return matrix.eliminateZeros(simplicialSet);
    }
    exports.resetLocalConnectivity = resetLocalConnectivity;
    function initTransform(indices, weights, embedding) {
      var result = utils.zeros(indices.length).map(function(z) {
        return utils.zeros(embedding[0].length);
      });
      for (var i = 0; i < indices.length; i++) {
        for (var j = 0; j < indices[0].length; j++) {
          for (var d = 0; d < embedding[0].length; d++) {
            var a = indices[i][j];
            result[i][d] += weights[i][j] * embedding[a][d];
          }
        }
      }
      return result;
    }
    exports.initTransform = initTransform;
  }
});

// node_modules/umap-js/dist/index.js
var require_dist = __commonJS({
  "node_modules/umap-js/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var umap_1 = require_umap();
    Object.defineProperty(exports, "UMAP", { enumerable: true, get: function() {
      return umap_1.UMAP;
    } });
  }
});

// node_modules/seedrandom/lib/alea.js
var require_alea = __commonJS({
  "node_modules/seedrandom/lib/alea.js"(exports, module) {
    (function(global, module2, define2) {
      function Alea(seed) {
        var me = this, mash = Mash();
        me.next = function() {
          var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
          me.s0 = me.s1;
          me.s1 = me.s2;
          return me.s2 = t - (me.c = t | 0);
        };
        me.c = 1;
        me.s0 = mash(" ");
        me.s1 = mash(" ");
        me.s2 = mash(" ");
        me.s0 -= mash(seed);
        if (me.s0 < 0) {
          me.s0 += 1;
        }
        me.s1 -= mash(seed);
        if (me.s1 < 0) {
          me.s1 += 1;
        }
        me.s2 -= mash(seed);
        if (me.s2 < 0) {
          me.s2 += 1;
        }
        mash = null;
      }
      function copy(f, t) {
        t.c = f.c;
        t.s0 = f.s0;
        t.s1 = f.s1;
        t.s2 = f.s2;
        return t;
      }
      function impl(seed, opts) {
        var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
        prng.int32 = function() {
          return xg.next() * 4294967296 | 0;
        };
        prng.double = function() {
          return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
        };
        prng.quick = prng;
        if (state) {
          if (typeof state == "object") copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      function Mash() {
        var n = 4022871197;
        var mash = function(data) {
          data = String(data);
          for (var i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 4294967296;
          }
          return (n >>> 0) * 23283064365386963e-26;
        };
        return mash;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.alea = impl;
      }
    })(
      exports,
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// node_modules/seedrandom/lib/xor128.js
var require_xor128 = __commonJS({
  "node_modules/seedrandom/lib/xor128.js"(exports, module) {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this, strseed = "";
        me.x = 0;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        me.next = function() {
          var t = me.x ^ me.x << 11;
          me.x = me.y;
          me.y = me.z;
          me.z = me.w;
          return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
        };
        if (seed === (seed | 0)) {
          me.x = seed;
        } else {
          strseed += seed;
        }
        for (var k = 0; k < strseed.length + 64; k++) {
          me.x ^= strseed.charCodeAt(k) | 0;
          me.next();
        }
      }
      function copy(f, t) {
        t.x = f.x;
        t.y = f.y;
        t.z = f.z;
        t.w = f.w;
        return t;
      }
      function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (typeof state == "object") copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xor128 = impl;
      }
    })(
      exports,
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// node_modules/seedrandom/lib/xorwow.js
var require_xorwow = __commonJS({
  "node_modules/seedrandom/lib/xorwow.js"(exports, module) {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this, strseed = "";
        me.next = function() {
          var t = me.x ^ me.x >>> 2;
          me.x = me.y;
          me.y = me.z;
          me.z = me.w;
          me.w = me.v;
          return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
        };
        me.x = 0;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        me.v = 0;
        if (seed === (seed | 0)) {
          me.x = seed;
        } else {
          strseed += seed;
        }
        for (var k = 0; k < strseed.length + 64; k++) {
          me.x ^= strseed.charCodeAt(k) | 0;
          if (k == strseed.length) {
            me.d = me.x << 10 ^ me.x >>> 4;
          }
          me.next();
        }
      }
      function copy(f, t) {
        t.x = f.x;
        t.y = f.y;
        t.z = f.z;
        t.w = f.w;
        t.v = f.v;
        t.d = f.d;
        return t;
      }
      function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (typeof state == "object") copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xorwow = impl;
      }
    })(
      exports,
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// node_modules/seedrandom/lib/xorshift7.js
var require_xorshift7 = __commonJS({
  "node_modules/seedrandom/lib/xorshift7.js"(exports, module) {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this;
        me.next = function() {
          var X2 = me.x, i = me.i, t, v, w;
          t = X2[i];
          t ^= t >>> 7;
          v = t ^ t << 24;
          t = X2[i + 1 & 7];
          v ^= t ^ t >>> 10;
          t = X2[i + 3 & 7];
          v ^= t ^ t >>> 3;
          t = X2[i + 4 & 7];
          v ^= t ^ t << 7;
          t = X2[i + 7 & 7];
          t = t ^ t << 13;
          v ^= t ^ t << 9;
          X2[i] = v;
          me.i = i + 1 & 7;
          return v;
        };
        function init2(me2, seed2) {
          var j, w, X2 = [];
          if (seed2 === (seed2 | 0)) {
            w = X2[0] = seed2;
          } else {
            seed2 = "" + seed2;
            for (j = 0; j < seed2.length; ++j) {
              X2[j & 7] = X2[j & 7] << 15 ^ seed2.charCodeAt(j) + X2[j + 1 & 7] << 13;
            }
          }
          while (X2.length < 8) X2.push(0);
          for (j = 0; j < 8 && X2[j] === 0; ++j) ;
          if (j == 8) w = X2[7] = -1;
          else w = X2[j];
          me2.x = X2;
          me2.i = 0;
          for (j = 256; j > 0; --j) {
            me2.next();
          }
        }
        init2(me, seed);
      }
      function copy(f, t) {
        t.x = f.x.slice();
        t.i = f.i;
        return t;
      }
      function impl(seed, opts) {
        if (seed == null) seed = +/* @__PURE__ */ new Date();
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (state.x) copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xorshift7 = impl;
      }
    })(
      exports,
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// node_modules/seedrandom/lib/xor4096.js
var require_xor4096 = __commonJS({
  "node_modules/seedrandom/lib/xor4096.js"(exports, module) {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this;
        me.next = function() {
          var w = me.w, X2 = me.X, i = me.i, t, v;
          me.w = w = w + 1640531527 | 0;
          v = X2[i + 34 & 127];
          t = X2[i = i + 1 & 127];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          v = X2[i] = v ^ t;
          me.i = i;
          return v + (w ^ w >>> 16) | 0;
        };
        function init2(me2, seed2) {
          var t, v, i, j, w, X2 = [], limit = 128;
          if (seed2 === (seed2 | 0)) {
            v = seed2;
            seed2 = null;
          } else {
            seed2 = seed2 + "\0";
            v = 0;
            limit = Math.max(limit, seed2.length);
          }
          for (i = 0, j = -32; j < limit; ++j) {
            if (seed2) v ^= seed2.charCodeAt((j + 32) % seed2.length);
            if (j === 0) w = v;
            v ^= v << 10;
            v ^= v >>> 15;
            v ^= v << 4;
            v ^= v >>> 13;
            if (j >= 0) {
              w = w + 1640531527 | 0;
              t = X2[j & 127] ^= v + w;
              i = 0 == t ? i + 1 : 0;
            }
          }
          if (i >= 128) {
            X2[(seed2 && seed2.length || 0) & 127] = -1;
          }
          i = 127;
          for (j = 4 * 128; j > 0; --j) {
            v = X2[i + 34 & 127];
            t = X2[i = i + 1 & 127];
            v ^= v << 13;
            t ^= t << 17;
            v ^= v >>> 15;
            t ^= t >>> 12;
            X2[i] = v ^ t;
          }
          me2.w = w;
          me2.X = X2;
          me2.i = i;
        }
        init2(me, seed);
      }
      function copy(f, t) {
        t.i = f.i;
        t.w = f.w;
        t.X = f.X.slice();
        return t;
      }
      ;
      function impl(seed, opts) {
        if (seed == null) seed = +/* @__PURE__ */ new Date();
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (state.X) copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xor4096 = impl;
      }
    })(
      exports,
      // window object or global
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// node_modules/seedrandom/lib/tychei.js
var require_tychei = __commonJS({
  "node_modules/seedrandom/lib/tychei.js"(exports, module) {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this, strseed = "";
        me.next = function() {
          var b = me.b, c = me.c, d = me.d, a = me.a;
          b = b << 25 ^ b >>> 7 ^ c;
          c = c - d | 0;
          d = d << 24 ^ d >>> 8 ^ a;
          a = a - b | 0;
          me.b = b = b << 20 ^ b >>> 12 ^ c;
          me.c = c = c - d | 0;
          me.d = d << 16 ^ c >>> 16 ^ a;
          return me.a = a - b | 0;
        };
        me.a = 0;
        me.b = 0;
        me.c = 2654435769 | 0;
        me.d = 1367130551;
        if (seed === Math.floor(seed)) {
          me.a = seed / 4294967296 | 0;
          me.b = seed | 0;
        } else {
          strseed += seed;
        }
        for (var k = 0; k < strseed.length + 20; k++) {
          me.b ^= strseed.charCodeAt(k) | 0;
          me.next();
        }
      }
      function copy(f, t) {
        t.a = f.a;
        t.b = f.b;
        t.c = f.c;
        t.d = f.d;
        return t;
      }
      ;
      function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (typeof state == "object") copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.tychei = impl;
      }
    })(
      exports,
      typeof module == "object" && module,
      // present in node.js
      typeof define == "function" && define
      // present with an AMD loader
    );
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// node_modules/seedrandom/seedrandom.js
var require_seedrandom = __commonJS({
  "node_modules/seedrandom/seedrandom.js"(exports, module) {
    (function(global, pool, math) {
      var width = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto;
      function seedrandom2(seed, options, callback) {
        var key = [];
        options = options == true ? { entropy: true } : options || {};
        var shortseed = mixkey(flatten(
          options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed,
          3
        ), key);
        var arc4 = new ARC4(key);
        var prng = function() {
          var n = arc4.g(chunks), d = startdenom, x = 0;
          while (n < significance) {
            n = (n + x) * width;
            d *= width;
            x = arc4.g(1);
          }
          while (n >= overflow) {
            n /= 2;
            d /= 2;
            x >>>= 1;
          }
          return (n + x) / d;
        };
        prng.int32 = function() {
          return arc4.g(4) | 0;
        };
        prng.quick = function() {
          return arc4.g(4) / 4294967296;
        };
        prng.double = prng;
        mixkey(tostring(arc4.S), pool);
        return (options.pass || callback || function(prng2, seed2, is_math_call, state) {
          if (state) {
            if (state.S) {
              copy(state, arc4);
            }
            prng2.state = function() {
              return copy(arc4, {});
            };
          }
          if (is_math_call) {
            math[rngname] = prng2;
            return seed2;
          } else return prng2;
        })(
          prng,
          shortseed,
          "global" in options ? options.global : this == math,
          options.state
        );
      }
      function ARC4(key) {
        var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
        if (!keylen) {
          key = [keylen++];
        }
        while (i < width) {
          s[i] = i++;
        }
        for (i = 0; i < width; i++) {
          s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
          s[j] = t;
        }
        (me.g = function(count) {
          var t2, r = 0, i2 = me.i, j2 = me.j, s2 = me.S;
          while (count--) {
            t2 = s2[i2 = mask & i2 + 1];
            r = r * width + s2[mask & (s2[i2] = s2[j2 = mask & j2 + t2]) + (s2[j2] = t2)];
          }
          me.i = i2;
          me.j = j2;
          return r;
        })(width);
      }
      function copy(f, t) {
        t.i = f.i;
        t.j = f.j;
        t.S = f.S.slice();
        return t;
      }
      ;
      function flatten(obj, depth) {
        var result = [], typ = typeof obj, prop;
        if (depth && typ == "object") {
          for (prop in obj) {
            try {
              result.push(flatten(obj[prop], depth - 1));
            } catch (e) {
            }
          }
        }
        return result.length ? result : typ == "string" ? obj : obj + "\0";
      }
      function mixkey(seed, key) {
        var stringseed = seed + "", smear, j = 0;
        while (j < stringseed.length) {
          key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
        }
        return tostring(key);
      }
      function autoseed() {
        try {
          var out;
          if (nodecrypto && (out = nodecrypto.randomBytes)) {
            out = out(width);
          } else {
            out = new Uint8Array(width);
            (global.crypto || global.msCrypto).getRandomValues(out);
          }
          return tostring(out);
        } catch (e) {
          var browser = global.navigator, plugins = browser && browser.plugins;
          return [+/* @__PURE__ */ new Date(), global, plugins, global.screen, tostring(pool)];
        }
      }
      function tostring(a) {
        return String.fromCharCode.apply(0, a);
      }
      mixkey(math.random(), pool);
      if (typeof module == "object" && module.exports) {
        module.exports = seedrandom2;
        try {
          nodecrypto = require_crypto();
        } catch (ex) {
        }
      } else if (typeof define == "function" && define.amd) {
        define(function() {
          return seedrandom2;
        });
      } else {
        math["seed" + rngname] = seedrandom2;
      }
    })(
      // global: `self` in browsers (including strict mode and web workers),
      // otherwise `this` in Node and other environments
      typeof self !== "undefined" ? self : exports,
      [],
      // pool: entropy pool starts empty
      Math
      // math: package containing random, pow, and seedrandom
    );
  }
});

// node_modules/seedrandom/index.js
var require_seedrandom2 = __commonJS({
  "node_modules/seedrandom/index.js"(exports, module) {
    var alea = require_alea();
    var xor128 = require_xor128();
    var xorwow = require_xorwow();
    var xorshift7 = require_xorshift7();
    var xor4096 = require_xor4096();
    var tychei = require_tychei();
    var sr = require_seedrandom();
    sr.alea = alea;
    sr.xor128 = xor128;
    sr.xorwow = xorwow;
    sr.xorshift7 = xorshift7;
    sr.xor4096 = xor4096;
    sr.tychei = tychei;
    module.exports = sr;
  }
});

// src/input/index.js
function detectFormat(content) {
  if (typeof content !== "string") return "text";
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return "text";
  const sampleLines = lines.slice(0, 20);
  if (isLikelyDelimited(sampleLines, "	")) {
    return "tsv";
  }
  if (isLikelyDelimited(sampleLines, ",")) {
    return "csv";
  }
  return "text";
}
function isLikelyDelimited(lines, delimiter) {
  if (!Array.isArray(lines)) {
    lines = lines.split(/\r?\n/).filter((line) => line.trim());
  }
  const counts = lines.map((line) => (line.match(new RegExp(delimiter, "g")) || []).length);
  const mode = (arr) => {
    const freq = {};
    let maxCount = 0, modeVal = 0;
    for (const v of arr) {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > maxCount) {
        maxCount = freq[v];
        modeVal = v;
      }
    }
    return modeVal;
  };
  const modeCount = mode(counts);
  const consistent = counts.filter((c) => c === modeCount).length;
  return modeCount >= 1 && consistent >= lines.length * 0.8;
}
function parseContent(content, format, Papa) {
  const textPrefix = format === "text" ? "text\n" : "";
  return Papa.parse(textPrefix + content, {
    header: true,
    skipEmptyLines: true,
    delimiter: format === "tsv" ? "	" : ",",
    quoteChar: '"',
    // 따옴표로 감싼 필드 처리
    transformHeader: (h) => h.trim().replace(/^["']|["']$/g, "")
    // 헤더의 앞뒤 따옴표 제거
  });
}
function guessColumns(rawData, cols) {
  return {
    textColumn: guessTextColumn(cols, rawData),
    dateColumn: guessDateColumn(cols, rawData),
    sizeColumn: guessSizeColumn(cols)
  };
}
function guessTextColumn(cols, rawData) {
  if (cols.includes("text")) return "text";
  if (cols.includes("\uD14D\uC2A4\uD2B8")) return "\uD14D\uC2A4\uD2B8";
  if (!cols.length) return "";
  const colScores = cols.map((key) => ({
    key,
    textLen: rawData.slice(0, 50).map((d) => (d[key] || "").replace(/\d/g, "")).join("").length
  }));
  colScores.sort((a, b) => b.textLen - a.textLen);
  return colScores[0].key;
}
function guessDateColumn(cols, rawData) {
  const sampleData = rawData.slice(0, 50);
  const datePatterns = [
    /^\d{8}$/,
    // YYYYMMDD
    /^\d{4}[-\/]\d{2}[-\/]\d{2}/
    // YYYY-MM-DD, YYYY/MM/DD
  ];
  const isDateLike = (str) => {
    const clean = String(str).trim().split(" ")[0];
    if (!datePatterns.some((p) => p.test(clean))) return false;
    const nums = clean.replace(/\D/g, "");
    const year = parseInt(nums.slice(0, 4));
    return year > 1900 && year < 2100;
  };
  const dateCols = cols.filter((key) => {
    const validCount = sampleData.filter((d) => isDateLike(d[key])).length;
    return validCount > sampleData.length * 0.9;
  });
  if (dateCols.includes("date")) return "date";
  return dateCols[0] || null;
}
function guessSizeColumn(cols) {
  return cols.find((d) => d.match(/size|clicks|가중치/i)) || null;
}
function createChunkData(rawData, columnMapping, options = {}) {
  const { maxSize = 1e3, reservoirSample: reservoirSample2 = null, userSubscript = "FREE" } = options;
  const filtered = rawData.filter(
    (d) => d[columnMapping.text]?.replace(/\\n/g, "\n")
  );
  let samples;
  if (userSubscript.match(/free|basic/i) || !reservoirSample2) {
    samples = filtered.slice(0, maxSize);
  } else {
    samples = reservoirSample2(filtered, maxSize)[0];
  }
  return samples.map((d, i) => ({
    ...d,
    textid: i + 1,
    text: d[columnMapping.text].replace(/\\n/g, "\n"),
    size: +d[columnMapping.size] ? +d[columnMapping.size] : 1,
    ...columnMapping.date && columnMapping.date !== "\uC5C6\uC74C" ? { date: d[columnMapping.date] } : {}
  })).filter((d) => d.text);
}
var DataInput = class {
  constructor(options = {}) {
    this.options = {
      maxSize: 1e3,
      ...options
    };
    this.Papa = options.Papa || null;
  }
  /**
   * PapaParse 라이브러리 설정
   */
  setPapa(Papa) {
    this.Papa = Papa;
    return this;
  }
  /**
   * 전체 입력 처리
   * @param {Object} file - { name, content }
   * @param {Object} columnMapping - { text, date, size } (없으면 자동 추측)
   * @returns {Object} { format, parsed, columns, chunkData, guessedColumns }
   */
  process(file, columnMapping = null) {
    if (!file?.content) {
      throw new Error("\uD30C\uC77C \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
    }
    if (!this.Papa) {
      throw new Error("PapaParse \uB77C\uC774\uBE0C\uB7EC\uB9AC\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4");
    }
    const format = detectFormat(file.content);
    const parsed = parseContent(file.content, format, this.Papa);
    const rawData = parsed.data;
    const columns = parsed.meta.fields || [];
    const guessedColumns = guessColumns(rawData, columns);
    const mapping = columnMapping || {
      text: guessedColumns.textColumn,
      date: guessedColumns.dateColumn,
      size: guessedColumns.sizeColumn
    };
    const chunkData = createChunkData(rawData, mapping, this.options);
    return {
      format,
      parsed,
      columns,
      guessedColumns,
      columnMapping: mapping,
      rawData,
      chunkData
    };
  }
  /**
   * 컬럼 매핑만 변경하여 chunkData 재생성
   */
  reprocess(rawData, columnMapping) {
    return createChunkData(rawData, columnMapping, this.options);
  }
};

// src/pipeline/level1.js
var Level1Pipeline = class {
  constructor(api, options = {}) {
    this.api = api;
    this.options = {
      maxSet: 1200,
      sampleSize: 1e3,
      assignThreshold: 0.82,
      clusterSimValue: 45,
      ...options
    };
  }
  /**
   * 1차 파이프라인 전체 실행
   * @param {Array} chunkData - 분석할 텍스트 데이터
   * @param {Function} onProgress - 진행률 콜백 (stage, progress, partialResult)
   * @returns {Promise<{embeds, wordClusters}>}
   */
  async run(chunkData, onProgress = () => {
  }) {
    onProgress({ stage: "embedding", progress: 0, message: "\uC784\uBCA0\uB529 \uC2DC\uC791..." });
    const embedResult = await this.doEmbedding(chunkData, (p) => {
      onProgress({ stage: "embedding", progress: p.progress, partialResult: p.embeds, message: p.message });
    });
    let interimClusters;
    if (embedResult.interimClusters) {
      interimClusters = embedResult.interimClusters;
      onProgress({ stage: "clustering", progress: 100, partialResult: interimClusters });
    } else {
      onProgress({ stage: "clustering", progress: 0, message: "\uD074\uB7EC\uC2A4\uD130\uB9C1..." });
      const clusterResult = await this.doClustering(embedResult.embeds, (p) => {
        onProgress({ stage: "clustering", progress: p.progress, partialResult: p.clusters });
      });
      interimClusters = clusterResult.interimClusters;
    }
    return {
      embeds: embedResult.embeds,
      interimClusters
    };
  }
  /**
   * 임베딩 단계
   */
  async doEmbedding(chunkData, onProgress = () => {
  }) {
    const useSampling = chunkData.length > this.options.maxSet;
    if (!useSampling) {
      return await this._embedAll(chunkData, onProgress);
    } else {
      return await this._embedWithSampling(chunkData, onProgress);
    }
  }
  /**
   * 전체 임베딩 (소규모 데이터)
   */
  async _embedAll(chunkData, onProgress) {
    const embeddings = [];
    const stream = this.api.streamEmbeddings(
      chunkData.map((d) => this._stripEmoji(d.text))
    );
    for await (const embedding of stream) {
      embeddings.push(embedding);
      onProgress({
        progress: Math.round(embeddings.length / chunkData.length * 100),
        embeds: embeddings,
        message: `\uC784\uBCA0\uB529 \uC911... (${Math.round(embeddings.length / chunkData.length * 100)}%)`
      });
    }
    const embeds = chunkData.map((d, i) => ({ ...d, embed: embeddings[i] }));
    return { embeds };
  }
  /**
   * 샘플링 기반 임베딩 (대규모 데이터)
   * 1) 샘플 임베딩 (0-30%)
   * 2) 샘플 클러스터링 (30-40%)
   * 3) 나머지 임베딩 + 센트로이드 할당 (40-100%)
   */
  async _embedWithSampling(chunkData, onProgress) {
    const { sampleSize, assignThreshold } = this.options;
    const sampleIdxs = this._randomSample(chunkData.length, sampleSize);
    const sampleSet = new Set(sampleIdxs);
    const sample = sampleIdxs.map((i) => chunkData[i]);
    const rest = chunkData.filter((_, i) => !sampleSet.has(i));
    const sampleEmbeds = [];
    const sampleStream = this.api.streamEmbeddings(sample.map((d) => d.text));
    for await (const e of sampleStream) {
      sampleEmbeds.push(e);
      onProgress({
        progress: Math.round(sampleEmbeds.length / sample.length * 30),
        embeds: sampleEmbeds,
        message: `\uC784\uBCA0\uB529 \uC911... (${Math.round(sampleEmbeds.length / sample.length * 30)}%)`
      });
    }
    let sampleWithEmbeds = sample.map((d, i) => ({ ...d, embed: sampleEmbeds[i] }));
    onProgress({ progress: 30, embeds: sampleWithEmbeds, message: "\uC0D8\uD50C \uD074\uB7EC\uC2A4\uD130\uB9C1..." });
    const sampleClusterResult = await this.doClustering(sampleWithEmbeds);
    const clusterMap = /* @__PURE__ */ new Map();
    for (const group of sampleClusterResult.interimClusters) {
      for (const item of group.cellDatas) {
        clusterMap.set(item.textid, item.cluster);
      }
    }
    sampleWithEmbeds = sampleWithEmbeds.map((d) => ({
      ...d,
      cluster: clusterMap.get(d.textid) ?? 999
    }));
    onProgress({ progress: 40, embeds: sampleWithEmbeds, message: "\uC784\uBCA0\uB529 \uC911... (40%)" });
    const centroids = this._computeCentroids(sampleWithEmbeds);
    const restResult = await this._embedAndAssignRest(
      rest,
      centroids,
      assignThreshold,
      (p) => onProgress({ progress: 40 + p.progress * 60, embeds: p.allEmbeds, message: p.message })
    );
    const mergedClusters = this._mergeClusters(
      sampleClusterResult.interimClusters,
      restResult.allEmbeds
    );
    return {
      embeds: [...sampleWithEmbeds, ...restResult.allEmbeds],
      interimClusters: mergedClusters
    };
  }
  /**
   * 나머지 데이터 임베딩 및 센트로이드 기반 클러스터 배정
   * @param {Array} rest - 나머지 데이터
   * @param {Array} centroids - 센트로이드 배열 [{cluster, mean, n}]
   * @param {number} threshold - 배정 임계값 (코사인 유사도)
   * @param {Function} onProgress - 진행률 콜백
   */
  async _embedAndAssignRest(rest, centroids, threshold, onProgress) {
    const batchSize = 300;
    const allEmbeds = [];
    for (let i = 0; i < rest.length; i += batchSize) {
      const batch = rest.slice(i, Math.min(i + batchSize, rest.length));
      const stream = this.api.streamEmbeddings(batch.map((d) => d.text));
      const batchEmbeds = [];
      for await (const e of stream) batchEmbeds.push(e);
      for (let j = 0; j < batch.length; j++) {
        const embed = batchEmbeds[j];
        const best = this._findNearestCentroid(embed, centroids);
        const withEmbed = {
          ...batch[j],
          embed,
          cluster: best.similarity >= threshold ? best.cluster : 999
        };
        allEmbeds.push(withEmbed);
      }
      onProgress({
        progress: (i + batch.length) / rest.length,
        allEmbeds,
        message: `\uC784\uBCA0\uB529 \uC911... (${Math.round(40 + (i + batch.length) / rest.length * 60)}%)`
      });
    }
    return { allEmbeds };
  }
  /**
   * 클러스터링 단계
   */
  async doClustering(embeds, onProgress = () => {
  }) {
    const { clusterSimValue } = this.options;
    const threshold = embeds.length >= 300 ? 45 : clusterSimValue / 100;
    if (!this.makeCluster) {
      throw new Error("makeCluster function not provided");
    }
    const clusterRaw = await this.makeCluster(embeds, threshold);
    const clusters = clusterRaw.map(
      (c) => c.data.map((d) => ({ ...d, region: c.data[0].chunk }))
    );
    const flatClusters = this._sortAndNumberClusters(clusters);
    const interimClusters = this._groupByCluster(flatClusters);
    onProgress({ progress: 100, clusters: interimClusters });
    return { interimClusters };
  }
  /**
   * 클러스터 ID별 그룹화
   */
  _groupByCluster(flatItems) {
    const groups = /* @__PURE__ */ new Map();
    flatItems.forEach((item) => {
      if (!groups.has(item.cluster)) {
        groups.set(item.cluster, {
          cluster: item.cluster,
          cellDatas: []
        });
      }
      groups.get(item.cluster).cellDatas.push(item);
    });
    return Array.from(groups.values()).sort((a, b) => a.cluster - b.cluster);
  }
  /**
   * 클러스터 정렬 및 번호 부여
   */
  _sortAndNumberClusters(clusters) {
    const sorted = clusters.map((c) => ({
      size: c.reduce((sum, d) => sum + (d.size ?? 1), 0),
      data: c
    })).sort((a, b) => b.size - a.size);
    return sorted.flatMap(
      (group, idx) => group.data.map((item) => ({ ...item, cluster: idx + 1 }))
    );
  }
  /**
   * 중심점 계산
   */
  _computeCentroids(embeds) {
    const byCluster = /* @__PURE__ */ new Map();
    for (const item of embeds) {
      if (!byCluster.has(item.cluster)) {
        byCluster.set(item.cluster, []);
      }
      byCluster.get(item.cluster).push(item.embed);
    }
    const centroids = [];
    for (const [cluster, vecs] of byCluster) {
      const dim = vecs[0].length;
      const mean = new Array(dim).fill(0);
      for (const v of vecs) {
        for (let i = 0; i < dim; i++) mean[i] += v[i];
      }
      for (let i = 0; i < dim; i++) mean[i] /= vecs.length;
      centroids.push({ cluster, mean, n: vecs.length });
    }
    return centroids;
  }
  /**
   * 코사인 유사도 계산
   */
  _cossim(a, b) {
    let p = 0, ma = 0, mb = 0;
    for (let i = 0; i < a.length; i++) {
      p += a[i] * b[i];
      ma += a[i] * a[i];
      mb += b[i] * b[i];
    }
    if (ma === 0 && mb === 0) return 1;
    if (ma * mb === 0) return 0;
    return p / (ma ** 0.5 * mb ** 0.5);
  }
  /**
   * 가장 가까운 센트로이드 찾기
   * @returns {{ cluster, similarity }}
   */
  _findNearestCentroid(embed, centroids) {
    let bestCluster = 999;
    let bestSim = -1;
    for (const c of centroids) {
      const sim = this._cossim(embed, c.mean);
      if (sim > bestSim) {
        bestSim = sim;
        bestCluster = c.cluster;
      }
    }
    return { cluster: bestCluster, similarity: bestSim };
  }
  /**
   * 나머지 데이터를 기존 interimClusters에 병합
   */
  _mergeClusters(interimClusters, restEmbeds) {
    const groups = /* @__PURE__ */ new Map();
    for (const group of interimClusters) {
      groups.set(group.cluster, {
        cluster: group.cluster,
        cellDatas: [...group.cellDatas]
      });
    }
    for (const item of restEmbeds) {
      const cid = item.cluster;
      if (!groups.has(cid)) {
        groups.set(cid, { cluster: cid, cellDatas: [] });
      }
      groups.get(cid).cellDatas.push(item);
    }
    return Array.from(groups.values()).sort((a, b) => a.cluster - b.cluster);
  }
  /**
   * 랜덤 샘플링
   */
  _randomSample(total, k) {
    const idxs = Array.from({ length: total }, (_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs.slice(0, Math.min(k, total));
  }
  /**
   * 이모지 제거
   */
  _stripEmoji(text) {
    return text;
  }
  /**
   * 외부 의존성 주입
   */
  setMakeCluster(fn) {
    this.makeCluster = fn;
    return this;
  }
};

// src/pipeline/level2.js
var Level2Pipeline = class {
  constructor(api, options = {}) {
    this.api = api;
    this.options = {
      language: "Korean",
      ...options
    };
  }
  /**
   * 2차 파이프라인 전체 실행
   * @param {Array} level1Labels - 1차 레이블 배열 [{cluster, label, embed, ...}]
   * @param {Object} context - 추가 컨텍스트 (selUsecase, bigLabelOption 등)
   * @param {Function} onProgress - 진행률 콜백
   * @returns {Promise<{bigLabels, bigLabelEmbeds, bigLabelClusters}>}
   */
  async run(labelClusters, context = {}, onProgress = () => {
  }) {
    const { selUsecase, bigLabelOption } = context;
    onProgress({ stage: "topic_extraction", progress: 0, message: "\uC0C1\uC704 \uD1A0\uD53D \uCD94\uCD9C..." });
    const bigLabels = await this.extractTopics(labelClusters, context);
    onProgress({
      stage: "topic_extraction",
      progress: 50,
      partialResult: { bigLabels }
    });
    onProgress({ stage: "topic_embedding", progress: 0, message: "\uD1A0\uD53D \uC784\uBCA0\uB529..." });
    const bigLabelEmbeds = await this.embedTopics(bigLabels);
    onProgress({
      stage: "topic_embedding",
      progress: 100,
      partialResult: { bigLabels, bigLabelEmbeds }
    });
    onProgress({ stage: "classification", progress: 0, message: "\uBD84\uB958 \uC9C4\uD589..." });
    const classificationResult = await this.classify(
      labelClusters,
      bigLabels,
      (p) => {
        const partialClusters = this._groupBigLabels(p.result, bigLabels, bigLabelEmbeds);
        onProgress({
          stage: "classification",
          progress: p.progress,
          message: p.message,
          partialResult: { bigLabelClusters: partialClusters }
        });
      }
    );
    const bigLabelClusters = this._groupBigLabels(classificationResult, bigLabels, bigLabelEmbeds);
    return {
      bigLabels,
      bigLabelClusters,
      interimClusters: classificationResult
    };
  }
  /**
   * 상위 토픽 추출
   */
  async extractTopics(level1Labels, context = {}) {
    const { selUsecase, bigLabelOption, selLabelLanguage } = context;
    if (!this.getPromptResult) {
      throw new Error("getPromptResult function not provided");
    }
    let userbigLabelOption = bigLabelOption && bigLabelOption.length > 1 ? bigLabelOption : "\uB370\uC774\uD130\uC758 \uC218\uC5D0 \uB530\uB77C 5-9\uAC1C \uC815\uB3C4\uC758 \uC801\uC808\uD55C \uAC2F\uC218\uAC00 \uB418\uB3C4\uB85D \uD574\uC918.";
    if (selUsecase?.category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C") {
      userbigLabelOption += " ~\uC6D0\uD568.~\uC2F6\uB2E4.~\uD558\uAE30.~\uD544\uC694 \uB4F1 \uC0AC\uC6A9\uC790 \uD575\uC2EC \uBAA9\uD45C\uB97C \uB098\uD0C0\uB0B4\uB294 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C.";
    } else if (selUsecase?.category === "\uB3C4\uBA54\uC778") {
      userbigLabelOption += " 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C.";
    }
    const textsForTopic = level1Labels.map((d) => d.label);
    const userInput = {
      service_type: this._getServiceType(selUsecase),
      texts: textsForTopic.join("\n"),
      language: selLabelLanguage || this.options.language,
      labelOption: userbigLabelOption + " \uAD04\uD638\uB098 \uCF5C\uB860 \uC0AC\uC6A9\uD55C \uCD94\uAC00 \uC124\uBA85 \uAE08\uC9C0"
    };
    const response = await this.getPromptResult(userInput);
    return (response.result || []).map(
      (d) => d.replace(/\*/g, "").replace(/: .+$/, "").replace(/- .+$/, "").replace(/\([^\(]+\)$/, "").trim()
    );
  }
  /**
   * 상위 토픽 임베딩
   */
  async embedTopics(bigLabels) {
    if (!this.api.getEmbeddings) return [];
    const embeddings = await this.api.getEmbeddings(bigLabels);
    return bigLabels.map((label, i) => ({
      bigLabel: label,
      embed: embeddings[i]
    }));
  }
  /**
   * 1차 레이블 → 2차 토픽 분류
   */
  async classify(labelClusters, bigLabels, onProgress = () => {
  }) {
    if (!this.classifyWithIdThreads) {
      throw new Error("classifyWithIdThreads function not provided");
    }
    const mapItem = (item) => {
      let id2 = item.id;
      if (id2 === void 0 && item.text) {
        const idMatch = item.text.match(/^(\d+)\s*:/);
        if (idMatch) id2 = idMatch[1];
      }
      const labelCluster = labelClusters.find((n) => String(n.cluster) === String(id2));
      if (!labelCluster) return null;
      let bigLabel = "\uAE30\uD0C0";
      if (item.category) {
        const trimmedCat = item.category.trim();
        const found = bigLabels.find(
          (bl) => bl === item.category || bl.trim() === trimmedCat || bl.trim().replace(/[.]/g, "") === trimmedCat.replace(/[.]/g, "")
        );
        if (found) bigLabel = found;
      }
      const bigClusterIdx = bigLabels.indexOf(bigLabel);
      const bigCluster = bigClusterIdx >= 0 ? bigClusterIdx + 1 : 999;
      return { ...labelCluster, bigLabel, bigCluster };
    };
    let accumulated = [];
    const result = await this.classifyWithIdThreads(
      bigLabels,
      labelClusters.map((d) => `${d.cluster} : ${d.label} ${d.description || ""}`),
      10,
      3,
      (progress, chunk) => {
        accumulated = [...accumulated, ...chunk];
        const mappedPartial = accumulated.map(mapItem).filter(Boolean);
        onProgress({
          progress,
          message: `\uBD84\uB958 \uC9C4\uD589 \uC911... (${Math.round(progress * 100)}%)`,
          result: mappedPartial
        });
      }
    );
    return result.map(mapItem).filter(Boolean);
  }
  /**
   * bigLabelClusters 그룹화
   * @param {Array} flatClassifiedLabels - Result from classify
   * @param {Array} bigLabels - List of topic strings
   * @param {Array} bigLabelEmbeds - List of {bigLabel, embed}
   */
  _groupBigLabels(flatClassifiedLabels, bigLabels, bigLabelEmbeds) {
    const groups = /* @__PURE__ */ new Map();
    const embedMap = new Map((bigLabelEmbeds || []).map((d) => [d.bigLabel, d.embed]));
    bigLabels.forEach((label, idx) => {
      const id2 = idx + 1;
      groups.set(id2, {
        bigCluster: id2,
        bigLabel: label,
        embed: embedMap.get(label) || [],
        clusters: []
        // Renamed from labels to clusters as requested
      });
    });
    if (!groups.has(999)) {
      groups.set(999, { bigCluster: 999, bigLabel: "\uAE30\uD0C0", embed: [], clusters: [] });
    }
    flatClassifiedLabels.forEach((item) => {
      const targetId = groups.has(item.bigCluster) ? item.bigCluster : 999;
      if (groups.has(targetId)) {
        groups.get(targetId).clusters.push(item);
      }
    });
    return Array.from(groups.values()).filter((g) => g.clusters.length > 0 || g.bigCluster !== 999).sort((a, b) => a.bigCluster - b.bigCluster);
  }
  /**
   * usecase에 따른 서비스 타입 결정
   */
  _getServiceType(selUsecase) {
    const category = selUsecase?.category;
    if (category === "\uD37C\uC18C\uB098") return "extract_persona";
    if (category === "\uB3C4\uBA54\uC778") return "extract_domain";
    if (category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C") return "extract_user_goal";
    return "extract_topics2";
  }
  /**
   * 외부 의존성 주입
   */
  setGetPromptResult(fn) {
    this.getPromptResult = fn;
    return this;
  }
  setClassifyWithIdThreads(fn) {
    this.classifyWithIdThreads = fn;
    return this;
  }
};

// src/pipeline/combine.js
function combineAll(wordClusters, labelClusters, bigLabelClusters) {
  let allWords = [];
  if (wordClusters && wordClusters.length > 0) {
    if (wordClusters[0].cellDatas) {
      allWords = wordClusters.flatMap((c) => c.cellDatas);
    } else {
      allWords = wordClusters;
    }
  }
  if (!allWords.length) return [];
  const labelMap = /* @__PURE__ */ new Map();
  if (labelClusters) {
    labelClusters.forEach((lc) => {
      labelMap.set(String(lc.cluster), {
        label: lc.label
      });
    });
  }
  const bigLabelMap = /* @__PURE__ */ new Map();
  if (bigLabelClusters) {
    bigLabelClusters.forEach((bg) => {
      const clusters = bg.clusters || bg.labels;
      if (clusters) {
        clusters.forEach((l) => {
          if (l.cluster !== void 0) {
            bigLabelMap.set(String(l.cluster), {
              bigCluster: bg.bigCluster,
              bigLabel: bg.bigLabel
            });
          }
        });
      }
    });
  }
  const enriched = allWords.map((word) => {
    const clusterId = word.cluster;
    const clusterKey = String(clusterId);
    const labelInfo = labelMap.get(clusterKey);
    const label = labelInfo?.label || word.cluster_keywords || `Cluster ${clusterId}`;
    const bigInfo = bigLabelMap.get(clusterKey);
    const bigCluster = bigInfo ? bigInfo.bigCluster : clusterId;
    const bigLabel = bigInfo ? bigInfo.bigLabel : "";
    return {
      ...word,
      label,
      bigCluster,
      bigLabel
    };
  });
  const grouped = groupBy(enriched, (w) => w.bigLabel || `Cluster ${w.bigCluster}`);
  const sorted = Object.entries(grouped).map(([key, words]) => ({
    cluster: key,
    // This is technically the group key
    size: words.reduce((sum, w) => sum + (w.size || 1), 0),
    // Use the bigCluster of the first word as the representative ID if possible
    bigCluster: words[0].bigCluster,
    bigLabel: words[0].bigLabel,
    data: words
  })).sort((a, b) => b.size - a.size);
  return sorted.flatMap(
    (group, idx) => group.data.map((word) => ({
      ...word,
      bigClusterOrder: idx
    }))
  );
}
async function createClusterWithLabel(tick, labelClusters, bigLabelClusters, wordClusters, d3, sortFunc) {
  await tick();
  try {
    return combineAll(wordClusters, labelClusters, bigLabelClusters);
  } catch (error) {
    console.error("clusterWithLabel \uCC98\uB9AC \uC911 \uC624\uB958:", error);
    return wordClusters;
  }
}
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// src/state/index.js
var PipelineState = class {
  constructor() {
    this.reset();
  }
  /**
   * 상태 초기화
   */
  reset() {
    this.cellData = {
      embeds: []
      // wordClusters 제거 (level1.interimClusters로 대체)
    };
    this.level1 = {
      interimClusters: [],
      // [{cluster:1, cellDatas:[..]}] - 초기 클러스터링
      labels: [],
      // Generated labels
      labelClusters: []
      // [{cluster:1, label:"..", cellDatas:[..]}] - Outlier 재배치 후 최종 클러스터
    };
    this.level2 = {
      interimClusters: [],
      // label의 embed를 이용한 클러스터링
      bigLabels: [],
      // bigLabelEmbeds removed (merged into bigLabelClusters)
      bigLabelClusters: []
      // [{bigCluster:1, bigLabel:"..", embed:[], clusters:[]}]
    };
    this.progress = {
      stage: "idle",
      percent: 0,
      message: ""
    };
    this.cellPos = [];
    this.labelPos = [];
    this.bigLabelPos = [];
    this.isComplete = false;
    return this;
  }
  /**
   * CellData 결과 설정 (Embeds)
   */
  setCellData(embeds) {
    this.cellData.embeds = embeds;
    return this;
  }
  /**
   * Level 1 결과 설정
   */
  setLevel1(interimClusters, labels, labelClusters) {
    if (interimClusters) this.level1.interimClusters = interimClusters;
    if (labels) this.level1.labels = labels;
    if (labelClusters) this.level1.labelClusters = labelClusters;
    return this;
  }
  /**
   * Level 1 레이블 추가/업데이트 (점진적 업데이트용)
   */
  addLabels(newLabels) {
    const existing = new Map(this.level1.labels.map((l) => [l.cluster, l]));
    for (const l of newLabels) {
      existing.set(l.cluster, l);
    }
    this.level1.labels = Array.from(existing.values());
    return this;
  }
  /**
   * Level 2 결과 설정
   */
  setLevel2(interimClusters, bigLabels, bigLabelClusters) {
    if (interimClusters) this.level2.interimClusters = interimClusters;
    if (bigLabels) this.level2.bigLabels = bigLabels;
    if (bigLabelClusters) this.level2.bigLabelClusters = bigLabelClusters;
    return this;
  }
  /**
   * 위치 정보 설정
   */
  setCellPos(cellPos) {
    this.cellPos = cellPos;
    return this;
  }
  setLabelPos(labelPos) {
    this.labelPos = labelPos;
    return this;
  }
  setBigLabelPos(bigLabelPos) {
    this.bigLabelPos = bigLabelPos;
    return this;
  }
  /**
   * 진행 상태 업데이트
   */
  setProgress(stage, percent, message = "") {
    this.progress = { stage, percent, message };
    return this;
  }
  /**
   * 완료 표시
   */
  complete() {
    this.isComplete = true;
    this.progress = { stage: "complete", percent: 100, message: "\uC644\uB8CC" };
    return this;
  }
  getCombined() {
    const activeLevel1Clusters = this.level1.labelClusters.length > 0 ? this.level1.labelClusters : this.level1.interimClusters;
    if (!activeLevel1Clusters || !activeLevel1Clusters.length) return [];
    const labelLookup = new Map(this.level1.labels.map((l) => [String(l.cluster), l.label]));
    const bigLabelMap = /* @__PURE__ */ new Map();
    if (this.level2.bigLabelClusters) {
      this.level2.bigLabelClusters.forEach((bg) => {
        const childClusters = bg.clusters || bg.labels;
        if (childClusters) {
          childClusters.forEach((l) => {
            if (l.cluster !== void 0) {
              bigLabelMap.set(String(l.cluster), { bigCluster: bg.bigCluster, bigLabel: bg.bigLabel });
            }
          });
        }
      });
    }
    const flattened = [];
    activeLevel1Clusters.forEach((clusterObj) => {
      const cluster = clusterObj.cluster;
      const bigInfo = bigLabelMap.get(String(cluster));
      let label = clusterObj.label;
      if (!label || label.startsWith("Cluster")) {
        label = labelLookup.get(String(cluster)) || label || `Cluster ${cluster}`;
      }
      if (clusterObj.cellDatas) {
        clusterObj.cellDatas.forEach((cell) => {
          flattened.push({
            ...cell,
            cluster,
            label,
            bigCluster: bigInfo?.bigCluster ?? cluster,
            bigLabel: bigInfo?.bigLabel || ""
          });
        });
      }
    });
    return flattened;
  }
  /**
   * 현재 상태 스냅샷
   */
  snapshot() {
    return {
      cellData: { ...this.cellData },
      level1: { ...this.level1 },
      level2: { ...this.level2 },
      combined: this.getCombined(),
      cellPos: [...this.cellPos],
      labelPos: [...this.labelPos],
      bigLabelPos: [...this.bigLabelPos],
      progress: { ...this.progress },
      isComplete: this.isComplete
    };
  }
  /**
   * 스냅샷에서 복원
   */
  restore(snapshot) {
    if (snapshot.cellData) this.cellData = { ...snapshot.cellData };
    if (snapshot.level1) this.level1 = { ...snapshot.level1 };
    if (snapshot.level2) this.level2 = { ...snapshot.level2 };
    if (snapshot.cellPos) this.cellPos = [...snapshot.cellPos];
    if (snapshot.labelPos) this.labelPos = [...snapshot.labelPos];
    if (snapshot.bigLabelPos) this.bigLabelPos = [...snapshot.bigLabelPos];
    this.isComplete = snapshot.isComplete ?? true;
    return this;
  }
  /**
   * 통계 정보
   */
  getStats() {
    const combined = this.getCombined();
    return {
      totalTexts: combined.length,
      clusterCount: new Set(combined.map((d) => d.cluster)).size,
      bigLabelCount: new Set(combined.map((d) => d.bigLabel).filter(Boolean)).size,
      labelsCount: this.level1.labels.length
    };
  }
};

// src/state/history.js
var HistoryManager = class {
  constructor(options = {}) {
    this.options = {
      maxSnapshots: 10,
      // 최대 저장 개수
      storageKey: "affinitybubble_history",
      ...options
    };
    this.snapshots = [];
    this.currentIndex = -1;
    this.compareTarget = null;
  }
  /**
   * 스냅샷 저장
   * @param {Object} options - 사용된 옵션 (labelOption, bigLabelOption 등)
   * @param {Object} results - 결과 데이터 (level1, level1Labels, level2)
   * @returns {Object} 저장된 스냅샷
   */
  save(options, results) {
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      options: { ...options },
      results: this._cloneResults(results),
      stats: this._calculateStats(results)
    };
    this.snapshots = [snapshot, ...this.snapshots.slice(0, this.options.maxSnapshots - 1)];
    this.currentIndex = -1;
    this._persistToStorage();
    return snapshot;
  }
  /**
   * 스냅샷 복원
   * @param {string} snapshotId - 복원할 스냅샷 ID
   * @returns {Object|null} 복원된 결과 데이터
   */
  restore(snapshotId) {
    const idx = this.snapshots.findIndex((s) => s.id === snapshotId);
    if (idx === -1) return null;
    this.currentIndex = idx;
    return this.snapshots[idx].results;
  }
  /**
   * 현재 스냅샷 가져오기
   */
  getCurrent() {
    if (this.currentIndex === -1) {
      return this.snapshots[0] || null;
    }
    return this.snapshots[this.currentIndex] || null;
  }
  /**
   * 스냅샷 목록 가져오기
   */
  getList() {
    return this.snapshots.map((s, idx) => ({
      id: s.id,
      timestamp: s.timestamp,
      options: s.options,
      stats: s.stats,
      isCurrent: this.currentIndex === -1 ? idx === 0 : idx === this.currentIndex
    }));
  }
  /**
   * 두 스냅샷 비교
   * @param {string} snapshotId1 
   * @param {string} snapshotId2 
   * @returns {Object} 비교 결과
   */
  compare(snapshotId1, snapshotId2) {
    const s1 = this.snapshots.find((s) => s.id === snapshotId1);
    const s2 = this.snapshots.find((s) => s.id === snapshotId2);
    if (!s1 || !s2) return null;
    return {
      optionsDiff: this._diffObjects(s1.options, s2.options),
      statsDiff: {
        clusterDelta: s2.stats.clusterCount - s1.stats.clusterCount,
        topicDelta: s2.stats.bigLabelCount - s1.stats.bigLabelCount,
        textDelta: s2.stats.totalTexts - s1.stats.totalTexts
      },
      labelChanges: this._findLabelChanges(s1, s2),
      snapshot1: s1,
      snapshot2: s2
    };
  }
  /**
   * 비교 모드 설정
   */
  setCompareTarget(snapshotId) {
    this.compareTarget = snapshotId;
    return this;
  }
  /**
   * 비교 모드 해제
   */
  clearCompare() {
    this.compareTarget = null;
    return this;
  }
  /**
   * 스냅샷 삭제
   */
  delete(snapshotId) {
    const idx = this.snapshots.findIndex((s) => s.id === snapshotId);
    if (idx !== -1) {
      this.snapshots.splice(idx, 1);
      if (this.currentIndex >= idx) {
        this.currentIndex = Math.max(-1, this.currentIndex - 1);
      }
      this._persistToStorage();
    }
    return this;
  }
  /**
   * 전체 삭제
   */
  clear() {
    this.snapshots = [];
    this.currentIndex = -1;
    this.compareTarget = null;
    this._persistToStorage();
    return this;
  }
  /**
   * 통계 계산
   */
  _calculateStats(results) {
    const combined = results.combined || [];
    const bigLabels = new Set(combined.map((d) => d.bigLabel).filter(Boolean));
    const clusters = new Set(combined.map((d) => d.cluster).filter(Boolean));
    const clusterSizes = {};
    for (const item of combined) {
      const label = item.label || `Cluster ${item.cluster}`;
      clusterSizes[label] = (clusterSizes[label] || 0) + (item.size || 1);
    }
    const topClusters = Object.entries(clusterSizes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, size]) => ({ label, size }));
    return {
      totalTexts: combined.length,
      clusterCount: clusters.size,
      bigLabelCount: bigLabels.size,
      topClusters
    };
  }
  /**
   * 결과 깊은 복사 (참조 끊기)
   */
  _cloneResults(results) {
    const clone = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map((item) => {
          if (typeof item === "object" && item !== null) {
            const { embed, ...rest } = item;
            return rest;
          }
          return item;
        });
      }
      return obj;
    };
    return {
      level1: {
        wordClusters: clone(results.level1?.wordClusters || [])
      },
      level1Labels: {
        labels: clone(results.level1Labels?.labels || []),
        labelClusters: clone(results.level1Labels?.labelClusters || [])
      },
      level2: {
        bigLabels: [...results.level2?.bigLabels || []],
        bigLabelClusters: clone(results.level2?.bigLabelClusters || [])
      },
      combined: clone(results.combined || [])
    };
  }
  /**
   * 객체 차이점 찾기
   */
  _diffObjects(obj1, obj2) {
    const diffs = [];
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    for (const key of allKeys) {
      const v1 = obj1?.[key];
      const v2 = obj2?.[key];
      if (JSON.stringify(v1) !== JSON.stringify(v2)) {
        diffs.push({ key, before: v1, after: v2 });
      }
    }
    return diffs;
  }
  /**
   * 레이블 변경점 찾기
   */
  _findLabelChanges(snapshot1, snapshot2) {
    const labels1 = new Set(
      (snapshot1.results.level1Labels?.labels || []).map((d) => d.label)
    );
    const labels2 = new Set(
      (snapshot2.results.level1Labels?.labels || []).map((d) => d.label)
    );
    const added = [...labels2].filter((l) => !labels1.has(l));
    const removed = [...labels1].filter((l) => !labels2.has(l));
    const common = [...labels1].filter((l) => labels2.has(l));
    return { added, removed, common, changed: added.length + removed.length };
  }
  /**
   * 로컬 스토리지 저장
   */
  _persistToStorage() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(
          this.options.storageKey,
          JSON.stringify(this.snapshots)
        );
      } catch (e) {
        console.warn("History \uC800\uC7A5 \uC2E4\uD328:", e);
      }
    }
  }
  /**
   * 로컬 스토리지에서 복원
   */
  loadFromStorage() {
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(this.options.storageKey);
        if (stored) {
          this.snapshots = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("History \uBCF5\uC6D0 \uC2E4\uD328:", e);
      }
    }
    return this;
  }
};

// src/utils/index.js
var import_umap_js = __toESM(require_dist(), 1);
var import_seedrandom = __toESM(require_seedrandom2(), 1);

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type2, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type2, that, args) {
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (var t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get(type2, name) {
  for (var i = 0, n = type2.length, c; i < n; ++i) {
    if ((c = type2[i]).name === name) {
      return c.value;
    }
  }
}
function set(type2, name, callback) {
  for (var i = 0, n = type2.length; i < n; ++i) {
    if (type2[i].name === name) {
      type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
      break;
    }
  }
  if (callback != null) type2.push({ name, value: callback });
  return type2;
}
var dispatch_default = dispatch;

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name) {
  var fullname = namespace_default(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}
function selectAll_default(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant_default(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function attr_default(name, value) {
  var fullname = namespace_default(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function style_default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function property_default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create2 = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name, before) {
  var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames2(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type2, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type2, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type2, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params);
  };
}
function dispatchFunction(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params.apply(this, arguments));
  };
}
function dispatch_default2(type2, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default2,
  [Symbol.iterator]: iterator_default
};
var selection_default = selection;

// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
  if (s) {
    if (r === max2) h = (g - b) / s + (g < b) * 6;
    else if (g === max2) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

// node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/constant.js
var constant_default2 = (x) => () => x;

// node_modules/d3-interpolate/src/color.js
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = (function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb2(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
})(1);
function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string_default(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i]) s[i] += bm;
      else s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs;
    else s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}

// node_modules/d3-interpolate/src/transform/decompose.js
var degrees = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose_default(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}

// node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;
      else if (b - a > 180) a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

// node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule_default(node, name, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}
function set2(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}
function get2(node, id2) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
  return schedule;
}
function create(node, id2, self2) {
  var schedules = node.__transition, tween;
  schedules[id2] = self2;
  self2.timer = timer(schedule, 0, self2.time);
  function schedule(elapsed) {
    self2.state = SCHEDULED;
    self2.timer.restart(start2, self2.delay, self2.time);
    if (self2.delay <= elapsed) start2(elapsed - self2.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self2.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self2.name) continue;
      if (o.state === STARTED) return timeout_default(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self2.state === STARTED) {
        self2.state = RUNNING;
        self2.timer.restart(tick, self2.delay, self2.time);
        tick(elapsed);
      }
    });
    self2.state = STARTING;
    self2.on.call("start", node, node.__data__, self2.index, self2.group);
    if (self2.state !== STARTING) return;
    self2.state = STARTED;
    tween = new Array(n = self2.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self2.state === ENDING) {
      self2.on.call("end", node, node.__data__, self2.index, self2.group);
      stop();
    }
  }
  function stop() {
    self2.state = ENDED;
    self2.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}

// node_modules/d3-transition/src/interrupt.js
function interrupt_default(node, name) {
  var schedules = node.__transition, schedule, active, empty2 = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty2) delete node.__transition;
}

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name) {
  return this.each(function() {
    interrupt_default(this, name);
  });
}

// node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule.tween = tween1;
  };
}
function tween_default(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get2(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition2, name, value) {
  var id2 = transition2._id;
  transition2.each(function() {
    var schedule = set2(this, id2);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get2(node, id2).value[name];
  };
}

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a, b) {
  var c;
  return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
}

// node_modules/d3-transition/src/transition/attr.js
function attrRemove2(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS2(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS2(fullname, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS2(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attr_default2(name, value) {
  var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
}

// node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween_default(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace_default(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

// node_modules/d3-transition/src/transition/delay.js
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function delay_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
}

// node_modules/d3-transition/src/transition/duration.js
function durationFunction(id2, value) {
  return function() {
    set2(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set2(this, id2).duration = value;
  };
}
function duration_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
}

// node_modules/d3-transition/src/transition/ease.js
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set2(this, id2).ease = value;
  };
}
function ease_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
}

// node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set2(this, id2).ease = v;
  };
}
function easeVarying_default(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}

// node_modules/d3-transition/src/transition/filter.js
function filter_default2(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/merge.js
function merge_default2(transition2) {
  if (transition2._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/on.js
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set2;
  return function() {
    var schedule = sit(this, id2), on = schedule.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule.on = on1;
  };
}
function on_default2(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}

// node_modules/d3-transition/src/transition/remove.js
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function remove_default2() {
  return this.on("end.remove", removeFunction(this._id));
}

// node_modules/d3-transition/src/transition/select.js
function select_default2(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}

// node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default2(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function") select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule_default(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}

// node_modules/d3-transition/src/transition/selection.js
var Selection2 = selection_default.prototype.constructor;
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}

// node_modules/d3-transition/src/transition/style.js
function styleNull(name, interpolate) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove2(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function style_default2(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
}

// node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function styleTween_default(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

// node_modules/d3-transition/src/transition/text.js
function textConstant2(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction2(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function text_default2(value) {
  return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
}

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function textTween_default(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}

// node_modules/d3-transition/src/transition/transition.js
function transition_default() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get2(node, id0);
        schedule_default(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}

// node_modules/d3-transition/src/transition/end.js
function end_default() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule = set2(this, id2), on = schedule.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });
    if (size === 0) resolve();
  });
}

// node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function transition(name) {
  return selection_default().transition(name);
}
function newId() {
  return ++id;
}
var selection_prototype = selection_default.prototype;
Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: select_default2,
  selectAll: selectAll_default2,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: filter_default2,
  merge: merge_default2,
  selection: selection_default2,
  transition: transition_default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on_default2,
  attr: attr_default2,
  attrTween: attrTween_default,
  style: style_default2,
  styleTween: styleTween_default,
  text: text_default2,
  textTween: textTween_default,
  remove: remove_default2,
  tween: tween_default,
  delay: delay_default,
  duration: duration_default,
  ease: ease_default,
  easeVarying: easeVarying_default,
  end: end_default,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

// node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function transition_default2(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}

// node_modules/d3-transition/src/selection/index.js
selection_default.prototype.interrupt = interrupt_default2;
selection_default.prototype.transition = transition_default2;

// node_modules/d3-brush/src/brush.js
var { abs, max, min } = Math;
function number1(e) {
  return [+e[0], +e[1]];
}
function number2(e) {
  return [number1(e[0]), number1(e[1])];
}
var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x, e) {
    return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]];
  },
  output: function(xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};
var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y, e) {
    return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]];
  },
  output: function(xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};
var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) {
    return xy == null ? null : number2(xy);
  },
  output: function(xy) {
    return xy;
  }
};
function type(t) {
  return { type: t };
}

// node_modules/d3-zoom/src/transform.js
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity2 = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
  return node.__zoom;
}

// src/utils/index.js
function cossim(a, b, w) {
  const len = a.length;
  let p = 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < len; i++) {
    p += a[i] * b[i] * (w ? w[i] : 1);
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  if (ma === 0 && mb === 0) return 1;
  if (ma * mb === 0) return 0;
  return p / (ma ** 0.5 * mb ** 0.5);
}
function euclidean(p, q) {
  function squaredEuclidean(p2, q2) {
    let d = 0;
    for (let i = 0; i < p2.length; i++) {
      d += (p2[i] - q2[i]) * (p2[i] - q2[i]);
    }
    return d;
  }
  return Math.sqrt(squaredEuclidean(p, q));
}
function countLeaves(node) {
  if (node.isLeaf) return 1;
  return countLeaves(node.children[0]) + countLeaves(node.children[1]);
}
function makeCluster_breakBig_optimized(arrayWithEmbed, nCluster = 0.8, distFunc = "cossim", hclust) {
  if (arrayWithEmbed.length === 0) return [];
  if (!hclust) throw new Error("hclust (ml-hclust) is required for clustering");
  const tree = hclust.agnes(
    arrayWithEmbed.map((e) => e.embed),
    {
      method: "complete",
      distanceFunction: distFunc === "cossim" ? (a, b) => 1 - cossim(a, b) : (a, b) => euclidean(a, b)
    }
  );
  const subtrees = nCluster < 1 ? tree.cut(nCluster) : tree.group(nCluster).children;
  const totalItems = arrayWithEmbed.length;
  const threshold = totalItems * 0.2;
  const finalClusters = [];
  let nextClusterId = 0;
  subtrees.forEach((subtree) => {
    const leafCount = countLeaves(subtree);
    if (nCluster < 1 && leafCount > threshold && leafCount >= 8) {
      const numSubClusters = Math.ceil(leafCount / threshold);
      subtree.group(numSubClusters).children.forEach((sub) => {
        const data = [];
        sub.traverse((n) => {
          if (n.isLeaf)
            data.push({ ...arrayWithEmbed[n.index], cluster: nextClusterId });
        });
        if (data.length) finalClusters.push({ cid: nextClusterId++, data });
      });
    } else {
      const data = [];
      subtree.traverse((n) => {
        if (n.isLeaf)
          data.push({ ...arrayWithEmbed[n.index], cluster: nextClusterId });
      });
      if (data.length) finalClusters.push({ cid: nextClusterId++, data });
    }
  });
  return finalClusters.sort((a, b) => b.data.length - a.data.length).map((d, i) => ({
    cid: i + 1,
    data: d.data.map((t) => ({ ...t, cluster: i + 1 }))
  }));
}
function makeCluster(arrayWithEmbed, nCluster = 0.8, distFunc = "cossim", hclust) {
  return makeCluster_breakBig_optimized(arrayWithEmbed, nCluster, distFunc, hclust);
}
async function processInParallel(processingFunc, data, {
  chunk_size = 20,
  max_threads = 4,
  delay_between_batches = 0,
  feedbackFunc = (d) => console.log(`\uC9C4\uD589\uB960: ${(d * 100).toFixed(1)}%`),
  context = null
} = {}) {
  const start2 = /* @__PURE__ */ new Date();
  console.log(
    `\uBCD1\uB82C \uCC98\uB9AC \uC2DC\uC791: ${data.length}\uAC1C \uD56D\uBAA9, \uCCAD\uD06C \uD06C\uAE30 ${chunk_size}, \uCD5C\uB300 ${max_threads} \uC2A4\uB808\uB4DC`
  );
  const chunkArray = (array2, size) => {
    const chunks = [];
    for (let i = 0; i < array2.length; i += size) {
      chunks.push(array2.slice(i, i + size));
    }
    return chunks;
  };
  const dataChunks = chunkArray(data, chunk_size);
  const totalItems = data.length;
  const results = [];
  const pendingPromises = /* @__PURE__ */ new Set();
  let chunkIndex = 0;
  let completedItems = 0;
  feedbackFunc(0, []);
  while (chunkIndex < dataChunks.length) {
    while (pendingPromises.size < max_threads && chunkIndex < dataChunks.length) {
      const currentChunk = dataChunks[chunkIndex];
      const currentChunkIndex = chunkIndex;
      chunkIndex++;
      const promise = (async () => {
        if (delay_between_batches > 0 && currentChunkIndex > 0) {
          await new Promise(
            (resolve) => setTimeout(resolve, delay_between_batches)
          );
        }
        return processingFunc(currentChunk, context);
      })().then((result) => {
        const flatResult = Array.isArray(result) ? result : [result];
        results.push(...flatResult);
        pendingPromises.delete(promise);
        completedItems += currentChunk.length;
        feedbackFunc(
          totalItems > 0 ? Math.min(completedItems / totalItems, 1) : 1,
          flatResult
        );
        return result;
      }).catch((error) => {
        console.error(`\uCCAD\uD06C ${currentChunkIndex} \uCC98\uB9AC \uC911 \uC624\uB958:`, error);
        pendingPromises.delete(promise);
        return [];
      });
      pendingPromises.add(promise);
    }
    if (pendingPromises.size > 0) {
      await Promise.race(Array.from(pendingPromises));
    }
  }
  if (pendingPromises.size > 0) {
    await Promise.all(Array.from(pendingPromises));
  }
  const end = /* @__PURE__ */ new Date();
  return results;
}
async function getPromptResult(api, userInput, promptId, configId = "Production", tick = async () => {
}, onPartial = null) {
  if (!promptId) promptId = userInput.service_type;
  const generator = api.prompt(
    userInput,
    promptId ?? userInput.service_type,
    configId
  );
  let response = null;
  await tick();
  for await (const chunk of generator) {
    try {
      response = chunk;
      if (onPartial && chunk?.result) {
        onPartial(chunk.result);
      }
    } catch (e) {
      console.log(e);
    }
  }
  return response;
}
async function getLabels(clusters, language, { datasetInfo, text_id, labelOption, api, tick, reportPartial } = {}) {
  const cluster_data = clusters.map(
    (cluster) => `
Cluster ${cluster.clusterId}:
${cluster.sentences.slice(0, 20).map((d, i) => `${cluster.textids[i]}: ${d.slice(0, 256)}`).join("\n")}
`
  ).join("\n");
  const option = datasetInfo?.data_type?.match(/키워드/) ? " \uBD80\uC815 \uC758\uBBF8\uC778 \uACBD\uC6B0 \uC774\uC720\uB97C \uC124\uBA85\uD558\uB294 \uD0A4\uC6CC\uB4DC\uB3C4 \uCD94\uAC00\uD574\uC918." : " \uBD80\uC815 \uC758\uBBF8\uC778 \uACBD\uC6B0 \uC774\uC720\uB97C \uC124\uBA85\uD558\uB294 \uD0A4\uC6CC\uB4DC\uB3C4 \uCD94\uAC00\uD574\uC918. \uC758\uBBF8\uB97C \uAD6C\uCCB4\uC801\uC73C\uB85C \uB4DC\uB7EC\uB0B4\uB294 \uC9E7\uC740 \uBB38\uC7A5\uC73C\uB85C.";
  const userInput = {
    service_type: datasetInfo?.data_type?.match(/사용자 목표/) ? "get_label_voice" : "get_label_outlier_sentiment",
    text_id,
    clusters: cluster_data,
    language,
    option: option + " " + (labelOption || "")
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
async function getLabels_threads(getLabelsFn, clusters, language = "Korean", chunkSize = 20, maxConcurrent = 3, progressFunc = null, contextParams = {}) {
  const processingFunc = async (clusterChunk, context2) => {
    return await getLabelsFn(clusterChunk, context2.language, context2);
  };
  const context = {
    language,
    ...contextParams
  };
  const results = await processInParallel(processingFunc, clusters, {
    chunk_size: chunkSize,
    max_threads: maxConcurrent,
    feedbackFunc: progressFunc,
    context
  });
  return results.sort((a, b) => {
    const clusterA = clusters.findIndex((c) => c.clusterId === a.cluster);
    const clusterB = clusters.findIndex((c) => c.clusterId === b.cluster);
    return clusterA - clusterB;
  });
}
async function getClassified(categories, sentences, { text_id, api, tick } = {}) {
  const userInput = {
    service_type: "classification",
    categories,
    texts: sentences,
    text_id
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
async function getClassifiedWithId(categories, sentences, { text_id, api, tick } = {}) {
  const userInput = {
    service_type: "classification_with_id",
    categories,
    texts: sentences,
    text_id
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
async function classifyWithId_threads(getClassifiedWithIdFn, categories, sentences, chunkSize = 20, maxConcurrent = 3, progressFunc = null, contextParams = {}) {
  const processingFunc = async (clusterChunk, context) => {
    return await getClassifiedWithIdFn(categories, clusterChunk, context);
  };
  const results = await processInParallel(processingFunc, sentences, {
    chunk_size: chunkSize,
    max_threads: maxConcurrent,
    feedbackFunc: progressFunc,
    context: contextParams
  });
  return results;
}
async function getTopics(texts, { language, bigLabelOption, selUsecase, text_id, api, tick, selTopicGenMethod, compactText } = {}) {
  let userbigLabelOption = String(bigLabelOption).length > 1 ? bigLabelOption : "\uB370\uC774\uD130\uC758 \uC218\uC5D0 \uB530\uB77C \uCCAD\uD06C \uB369\uC5B4\uB9AC\uAC00 \uB9E4\uC9C1\uB118\uBC84 5-9\uAC1C \uC815\uB3C4\uC758 \uC801\uC808\uD55C \uAC2F\uC218\uAC00 \uB418\uB3C4\uB85D \uD574\uC918.";
  if (selUsecase?.category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C")
    userbigLabelOption += " ~\uC6D0\uD568.~\uC2F6\uB2E4.~\uD558\uAE30.~\uD544\uC694 \uB4F1 \uC0AC\uC6A9\uC790 \uD575\uC2EC \uBAA9\uD45C\uB97C \uB098\uD0C0\uB0B4\uB294 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C \uC801\uC5B4\uC918.";
  if (selUsecase?.category === "\uB3C4\uBA54\uC778")
    userbigLabelOption += " 7\uB2E8\uC5B4 \uC774\uB0B4\uC758 \uAC04\uACB0\uD55C \uBB38\uC7A5\uC73C\uB85C \uC801\uC5B4\uC918.";
  const userInput = {
    service_type: selUsecase?.category === "\uD37C\uC18C\uB098" ? "extract_persona" : selUsecase?.category === "\uB3C4\uBA54\uC778" ? "extract_domain" : selUsecase?.category === "\uC0AC\uC6A9\uC790 \uBAA9\uD45C" ? "extract_user_goal" : "extract_topics2",
    text_id,
    texts: selTopicGenMethod === "\uB808\uC774\uBE14\uB9CC" ? texts.join("\n") : (compactText || []).join("\n").replace(/## /g, ""),
    language,
    labelOption: userbigLabelOption + " \uAD04\uD638\uB098 \uCF5C\uB860 \uC0AC\uC6A9\uD55C \uCD94\uAC00 \uC124\uBA85 \uAE08\uC9C0"
  };
  const response = await getPromptResult(api, userInput, null, "Production", tick);
  return response?.result;
}
function makeEmbedPos(embList, minDist = 0.1, nNeighbors = 10, seedValue = 1) {
  if (!embList || embList.length === 0) return [];
  if (embList.length === 1) {
    return [{ ...embList[0], pos: { x: 0, y: 0 } }];
  }
  const seed = (0, import_seedrandom.default)(seedValue);
  const wordPos = new import_umap_js.UMAP({
    nComponents: 2,
    minDist,
    nNeighbors: Math.min(embList.length - 1, nNeighbors),
    random: seed
  }).fit(embList.map((d) => d.embed));
  return embList.map((d, i) => {
    const [x, y] = wordPos[i];
    return { ...d, pos: { x, y } };
  });
}

// src/pipeline/full.js
var AffinityBubblePipeline = class {
  constructor(api, dependencies = {}) {
    this.api = api;
    this.deps = {
      hclust: dependencies.hclust || null,
      ...dependencies
    };
    const rawMakeCluster = dependencies.makeCluster || makeCluster;
    this.deps.makeCluster = (data, threshold) => rawMakeCluster(data, threshold, "cossim", this.deps.hclust);
    const rawGetPromptResult = dependencies.getPromptResult || getPromptResult;
    this.deps.getPromptResult = (userInput, promptId, configId, tick) => rawGetPromptResult(this.api, userInput, promptId, configId, tick);
    const rawClassifyWithIdThreads = dependencies.classifyWithIdThreads || classifyWithId_threads;
    this.deps.classifyWithIdThreads = (categories, sentences, chunkSize, maxConcurrent, progressFunc) => rawClassifyWithIdThreads(getClassified, categories, sentences, chunkSize, maxConcurrent, progressFunc, { api: this.api });
    const rawGetLabelsThreads = dependencies.getLabelsThreads || getLabels_threads;
    this.deps.getLabelsThreads = (getLabelsFn, clusters, language, chunkSize, maxConcurrent, progressFunc, context) => rawGetLabelsThreads(getLabelsFn, clusters, language, chunkSize, maxConcurrent, progressFunc, { api: this.api, ...context });
    this.level1 = new Level1Pipeline(api);
    this.level2 = new Level2Pipeline(api);
    this.state = new PipelineState();
    this.history = new HistoryManager();
    this.prevOptions = null;
    this.prevChunkDataHash = null;
    this.prevLevel1Result = null;
    this.prevLabels = null;
    this.prevLabelClusters = null;
    this.level1.setMakeCluster(this.deps.makeCluster);
    this.level2.setGetPromptResult(this.deps.getPromptResult);
    this.level2.setClassifyWithIdThreads(this.deps.classifyWithIdThreads);
  }
  /**
   * 전체 파이프라인 실행
   * @param {Array} chunkData - 입력 데이터
   * @param {Object} options - 옵션 (labelOption, bigLabelOption, selUsecase 등)
   * @param {Function} onProgress - 진행률 콜백
   * @returns {Promise<Object>} 최종 결과
   */
  async run(chunkData, options = {}, onProgress = () => {
  }) {
    const {
      labelOption,
      bigLabelOption,
      selUsecase,
      selLabelLanguage,
      clusterSimValue,
      clusterSimValue2
    } = options;
    const startStage = this._determineStartStage(chunkData, options);
    console.log(`[Pipeline] Starting from stage: ${startStage}`);
    this.state.reset();
    try {
      let level1Result;
      let labels;
      let labelClusters;
      if (startStage === "embedding") {
        const initialClusters = chunkData.map((d) => ({
          ...d,
          cluster: 0,
          cluster_keywords: "\uBD84\uC11D \uB300\uAE30 \uC911..."
        }));
        this.state.setCellData([], initialClusters);
        this.state.setProgress("level1", 0, "\uC784\uBCA0\uB529 \uC2DC\uC791...");
        onProgress(this.state.progress, this.state.snapshot());
        this.level1.options.clusterSimValue = clusterSimValue;
        level1Result = await this.level1.run(chunkData, (p) => {
          this.state.setProgress("level1", p.progress * 0.3, p.message);
          if (p.stage === "embedding" && p.partialResult) {
            this.state.setCellData(p.partialResult);
          }
          onProgress(this.state.progress, this.state.snapshot());
        });
      } else if (startStage === "clustering") {
        console.log("[Pipeline] Reusing embeddings, re-clustering...");
        this.state.setProgress("level1", 10, "\uD074\uB7EC\uC2A4\uD130\uB9C1 \uC7AC\uC2E4\uD589 (\uC784\uBCA0\uB529 \uC7AC\uC0AC\uC6A9)...");
        onProgress(this.state.progress, this.state.snapshot());
        const prevEmbeds = this.prevLevel1Result.embeds;
        this.level1.options.clusterSimValue = clusterSimValue;
        const clusterResult = await this.level1.doClustering(prevEmbeds, (p) => {
          this.state.setProgress("level1", 10 + p.progress * 0.2, "\uD074\uB7EC\uC2A4\uD130\uB9C1 \uC911...");
          onProgress(this.state.progress, this.state.snapshot());
        });
        level1Result = {
          embeds: prevEmbeds,
          interimClusters: clusterResult.interimClusters
        };
      } else {
        console.log("[Pipeline] Reusing level1 results...");
        level1Result = this.prevLevel1Result;
        this.state.setCellData(level1Result.embeds);
      }
      this.state.setCellData(level1Result.embeds);
      this.state.setLevel1(level1Result.interimClusters, [], []);
      onProgress(this.state.progress, this.state.snapshot());
      if (startStage === "embedding" || startStage === "clustering") {
        this.state.setProgress("positioning_cells", 30, "\uAC1C\uBCC4 \uB370\uC774\uD130 \uC88C\uD45C \uACC4\uC0B0 \uC911...");
        onProgress(this.state.progress, this.state.snapshot());
        if (level1Result.embeds.length > 0 && level1Result.interimClusters) {
          const flatCells = level1Result.interimClusters.flatMap((c) => c.cellDatas);
          const cellPos = makeEmbedPos(flatCells.map((d) => ({
            embed: d.embed,
            text: d.text,
            cluster: d.cluster
          })));
          this.state.setCellPos(cellPos);
        }
        onProgress(this.state.progress, this.state.snapshot());
      }
      if (startStage === "embedding" || startStage === "clustering" || startStage === "labeling") {
        this.state.setProgress("labeling", 30, "\uB808\uC774\uBE14 \uC0DD\uC131...");
        onProgress(this.state.progress, this.state.snapshot());
        const clustersForLabeling = level1Result.interimClusters.map((c) => ({
          clusterId: c.cluster,
          sentences: c.cellDatas.map((d) => d.text),
          textids: c.cellDatas.map((d) => d.textid)
        }));
        labels = await this._doLabeling(
          clustersForLabeling,
          { labelOption, selLabelLanguage },
          (progress, data) => {
            if (data && data.length > 0) {
              this.state.addLabels(data);
            }
            this.state.setProgress("labeling", 30 + progress * 20, `\uB808\uC774\uBE14 \uC0DD\uC131 \uC911... (${Math.round(progress * 100)}%)`);
            onProgress(this.state.progress, this.state.snapshot());
          }
        );
        this.state.setProgress("labeling", 60, "Outlier \uC7AC\uBC30\uCE58 \uBC0F \uCD5C\uC885 \uADF8\uB8F9\uD654...");
        labelClusters = await this._rearrangeOutliers(
          labels,
          level1Result.interimClusters,
          options
        );
      } else {
        console.log("[Pipeline] Reusing labels and labelClusters...");
        labels = this.prevLabels;
        labelClusters = this.prevLabelClusters;
      }
      this.state.setLevel1(level1Result.interimClusters, labels, labelClusters);
      onProgress(this.state.progress, this.state.snapshot());
      this.state.setProgress("level2", 50, "\uC0C1\uC704 \uD1A0\uD53D \uCD94\uCD9C...");
      onProgress(this.state.progress, this.state.snapshot());
      const level2Result = await this.level2.run(
        labelClusters,
        { selUsecase, bigLabelOption, selLabelLanguage, clusterSimValue2 },
        (p) => {
          this.state.setProgress("level2", 50 + p.progress * 0.4, p.message);
          if (p.partialResult) {
            this.state.setLevel2(
              null,
              p.partialResult.bigLabels || null,
              p.partialResult.bigLabelClusters || null
            );
          }
          onProgress(this.state.progress, this.state.snapshot());
        }
      );
      this.state.setLevel2(
        level2Result.interimClusters,
        level2Result.bigLabels,
        level2Result.bigLabelClusters
      );
      onProgress(this.state.progress, this.state.snapshot());
      this.state.setProgress("positioning", 85, "2\uCC28\uC6D0 \uC88C\uD45C \uACC4\uC0B0 \uC911...");
      onProgress(this.state.progress, this.state.snapshot());
      if (labels.length > 0) {
        const labelPos = makeEmbedPos(labels);
        this.state.setLabelPos(labelPos);
      }
      if (level2Result.bigLabelClusters && level2Result.bigLabelClusters.length > 0) {
        const bigLabelEmbeds = level2Result.bigLabelClusters.filter((c) => c.embed && c.embed.length > 0).map((c) => ({
          embed: c.embed,
          bigCluster: c.bigCluster,
          bigLabel: c.bigLabel
        }));
        if (bigLabelEmbeds.length > 0) {
          const bigLabelPos = makeEmbedPos(bigLabelEmbeds);
          this.state.setBigLabelPos(bigLabelPos);
        }
      }
      onProgress(this.state.progress, this.state.snapshot());
      this.state.setProgress("combining", 95, "\uB370\uC774\uD130 \uACB0\uD569...");
      onProgress(this.state.progress, this.state.snapshot());
      const combined = combineAll(
        this.state.level1.interimClusters,
        this.state.level1.labelClusters,
        this.state.level2.bigLabelClusters
      );
      this.state.complete();
      onProgress(this.state.progress, { combined });
      this._saveCurrentState(chunkData, options, level1Result, labels, labelClusters);
      const snapshot = this.history.save(options, this.state.snapshot());
      return {
        ...this.state.snapshot(),
        snapshotId: snapshot.id
      };
    } catch (error) {
      console.error("Pipeline \uC2E4\uD589 \uC624\uB958:", error);
      this.state.setProgress("error", 0, error.message);
      throw error;
    }
  }
  /**
   * 1차 레이블링 (getLabels_threads 호출)
   */
  async _doLabeling(clusterGroups, options, onProgress) {
    const { labelOption, selLabelLanguage } = options;
    if (!this.deps.getLabelsThreads) {
      console.warn("getLabelsThreads not provided, using placeholder");
      return [];
    }
    const labels = await this.deps.getLabelsThreads(
      getLabels,
      // 기본 getLabels 함수 전달
      clusterGroups,
      selLabelLanguage || "Korean",
      8,
      // chunkSize 유지 (사용자 요청)
      3,
      // maxConcurrent
      (progress, data) => {
        const validProgress = isNaN(progress) ? 0 : progress;
        onProgress(validProgress, data);
      },
      {
        datasetInfo: options.datasetInfo,
        text_id: options.text_id,
        labelOption: options.labelOption,
        api: this.api,
        tick: options.tick || (async () => {
        })
      }
    );
    if (labels.length && this.api.getEmbeddings) {
      const embeddings = await this.api.getEmbeddings(labels.map((d) => d.label));
      return labels.map((d, i) => ({ ...d, embed: embeddings[i] }));
    }
    return labels;
  }
  /**
   * 시작 단계 결정 (Stage별 선택적 재실행)
   *
   * Case 1: chunkData 변경 → 전체 재실행 (embedding부터)
   * Case 2: clusterSimValue 변경 → 클러스터링부터 (임베딩 재사용)
   * Case 3: labelOption 변경 → 레이블링부터
   * Case 4: bigLabelOption/selUsecase/clusterSimValue2 변경 → Level2부터
   * Case 5: 모든 옵션 동일 (재분석) → Level2만 재실행 (기본 동작)
   */
  _determineStartStage(chunkData, options) {
    const currentHash = this._computeChunkDataHash(chunkData);
    if (!this.prevOptions || !this.prevChunkDataHash || this.prevChunkDataHash !== currentHash) {
      console.log("[Pipeline] Stage: embedding (chunkData changed or first run)");
      return "embedding";
    }
    if (this.prevOptions.clusterSimValue !== options.clusterSimValue) {
      console.log("[Pipeline] Stage: clustering (clusterSimValue changed)");
      return "clustering";
    }
    if (this.prevOptions.labelOption !== options.labelOption || this.prevOptions.selLabelLanguage !== options.selLabelLanguage) {
      console.log("[Pipeline] Stage: labeling (labelOption changed)");
      return "labeling";
    }
    console.log("[Pipeline] Stage: level2 (bigLabel options changed or re-analyze)");
    return "level2";
  }
  /**
   * chunkData의 해시값 계산 (변경 감지용)
   * 간단한 해시: 데이터 길이 + 첫/마지막 텍스트의 일부 조합
   */
  _computeChunkDataHash(chunkData) {
    if (!chunkData || chunkData.length === 0) return null;
    const length = chunkData.length;
    const firstText = chunkData[0]?.text || chunkData[0]?.chunk || "";
    const lastText = chunkData[length - 1]?.text || chunkData[length - 1]?.chunk || "";
    const hashStr = `${length}:${firstText.substring(0, 50)}:${lastText.substring(0, 50)}`;
    let hash = 5381;
    for (let i = 0; i < hashStr.length; i++) {
      hash = (hash << 5) + hash + hashStr.charCodeAt(i);
    }
    return hash.toString(16);
  }
  /**
   * 현재 상태 저장 (다음 실행 시 비교용)
   */
  _saveCurrentState(chunkData, options, level1Result, labels, labelClusters) {
    this.prevChunkDataHash = this._computeChunkDataHash(chunkData);
    this.prevOptions = { ...options };
    this.prevLevel1Result = level1Result;
    this.prevLabels = labels;
    this.prevLabelClusters = labelClusters;
  }
  /**
   * Outlier 재배치 (Rearrange)
   */
  /**
   * Outlier 재배치 및 최종 레이블 그룹화
   * @returns {Promise<Array>} labelClusters [{cluster, label, cellDatas}]
   */
  async _rearrangeOutliers(labels, interimClusters, options) {
    const allCells = interimClusters.flatMap((c) => c.cellDatas);
    const wordClusterMap = new Map(allCells.map((d) => [d.textid, d]));
    const labelMap = new Map(labels.map((d) => [d.label, d.cluster]));
    const clusterToLabelMap = new Map(labels.map((d) => [d.cluster, d]));
    const finalGrouping = /* @__PURE__ */ new Map();
    labels.forEach((l) => {
      finalGrouping.set(l.cluster, {
        cluster: l.cluster,
        label: l.label,
        embed: l.embed,
        // Propagate embed
        description: l.description,
        // Propagate description
        cellDatas: [],
        original_cluster: l.cluster
      });
    });
    if (!finalGrouping.has(999)) {
      finalGrouping.set(999, {
        cluster: 999,
        label: "\uAE30\uD0C0",
        embed: null,
        description: "",
        cellDatas: [],
        original_cluster: 999
      });
    }
    if (!this.deps.classifyWithIdThreads) {
      console.warn("classifyWithIdThreads dependency missing. Skipping rearrange.");
      allCells.forEach((cell) => {
        const targetCluster = finalGrouping.has(cell.cluster) ? cell.cluster : 999;
        finalGrouping.get(targetCluster).cellDatas.push(cell);
      });
      return Array.from(finalGrouping.values());
    }
    const etcCells = allCells.filter((d) => d.cluster === 999);
    let outliers = labels.flatMap((d) => {
      if (!d.outliers) return [];
      return d.outliers.map((outlier) => {
        const idMatch = outlier.match(/^\d+:/);
        const textid = idMatch ? +idMatch[0].replace(":", "") : null;
        let reasonMatch = outlier.match(
          /#sentiment mismatch|#semantic divergence|#topic difference|#\S+/
        );
        const reason = reasonMatch ? reasonMatch[0] : "";
        if (!textid) return null;
        return {
          textid,
          label: d.label,
          text: outlier.replace(/^\d+:/, "").replace(" " + reason, "").trim(),
          reason,
          cluster: d.cluster,
          // current cluster
          item: wordClusterMap.get(textid)
        };
      });
    }).filter((d) => d && d.item);
    outliers = [...outliers, ...etcCells.map((c) => ({
      textid: c.textid,
      text: c.text,
      cluster: 999,
      item: c
    }))];
    const remappingMap = /* @__PURE__ */ new Map();
    if (outliers.length > 0) {
      console.log(`Re-classifying ${outliers.length} outliers...`);
      const allLabelTexts = labels.map((d) => d.label);
      try {
        const result = await this.deps.classifyWithIdThreads(
          allLabelTexts,
          outliers.map((d) => `${d.textid} : ${d.text}`),
          10,
          2,
          (p) => console.log(`Rearrange progress: ${(p * 100).toFixed(0)}%`)
        );
        if (result && result.length > 0) {
          const outlierMap = new Map(outliers.map((d) => [d.textid, d]));
          result.forEach((d) => {
            const originalId = d.id;
            const match = outlierMap.get(originalId);
            if (match && d.category) {
              const newClusterId = labelMap.get(d.category);
              if (newClusterId !== void 0) {
                remappingMap.set(originalId, newClusterId);
              }
            }
          });
        }
      } catch (e) {
        console.error("Error during _rearrangeOutliers:", e);
      }
    }
    allCells.forEach((cell) => {
      let targetClusterId = cell.cluster;
      if (remappingMap.has(cell.textid)) {
        targetClusterId = remappingMap.get(cell.textid);
      }
      if (!finalGrouping.has(targetClusterId)) {
        targetClusterId = 999;
      }
      const group = finalGrouping.get(targetClusterId);
      group.cellDatas.push({
        ...cell,
        cluster: targetClusterId
      });
    });
    return Array.from(finalGrouping.values()).filter((g) => g.cellDatas.length > 0 || g.cluster !== 999).sort((a, b) => a.cluster - b.cluster);
  }
  /**
   * 클러스터별 그룹화
   */
  _groupByCluster(wordClusters) {
    const groups = /* @__PURE__ */ new Map();
    for (const item of wordClusters) {
      if (!groups.has(item.cluster)) {
        groups.set(item.cluster, { clusterId: item.cluster, sentences: [], textids: [] });
      }
      const g = groups.get(item.cluster);
      g.sentences.push(item.text);
      g.textids.push(item.textid);
    }
    return [...groups.values()];
  }
  /**
   * 히스토리에서 복원
   */
  restoreFromHistory(snapshotId) {
    const results = this.history.restore(snapshotId);
    if (results) {
      this.state.restore(results);
    }
    return this.state.snapshot();
  }
  /**
   * 히스토리 목록
   */
  getHistoryList() {
    return this.history.getList();
  }
  /**
   * 두 히스토리 비교
   */
  compareHistory(id1, id2) {
    return this.history.compare(id1, id2);
  }
  /**
   * 현재 상태 가져오기
   */
  getState() {
    return this.state.snapshot();
  }
  /**
   * 의존성 설정
   */
  setDependencies(deps) {
    Object.assign(this.deps, deps);
    if (deps.makeCluster) this.level1.setMakeCluster(deps.makeCluster);
    if (deps.getPromptResult) this.level2.setGetPromptResult(deps.getPromptResult);
    if (deps.classifyWithIdThreads) this.level2.setClassifyWithIdThreads(deps.classifyWithIdThreads);
    return this;
  }
};

// src/working-status.js
function showWorkingStatus(target, totalSteps, currentStep, message) {
  let containerId, buttonId, targetElement, insertMode;
  if (typeof target === "string") {
    buttonId = target;
    targetElement = document.getElementById(buttonId);
    insertMode = "afterButton";
  } else if (typeof target === "object") {
    containerId = target.containerId;
    buttonId = target.buttonId;
    if (containerId) {
      targetElement = document.getElementById(containerId);
      insertMode = "inContainer";
    } else if (buttonId) {
      targetElement = document.getElementById(buttonId);
      insertMode = "afterButton";
    }
  }
  if (!targetElement) {
    console.error(`\uD0C0\uAC9F \uC694\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4:`, target);
    return null;
  }
  const statusId = containerId ? `${containerId}-inner` : `${buttonId}-status`;
  if (insertMode === "inContainer") {
    targetElement.style.display = "block";
  }
  let statusContainer = document.querySelector(`#${statusId}`);
  if (statusContainer) {
    const steps = statusContainer.querySelector(".steps");
    const icons = steps.querySelectorAll("i");
    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      const isIcon = i % 2 === 0;
      const stepNum = Math.floor(i / 2) + 1;
      if (isIcon) {
        if (stepNum < currentStep) {
          icon.className = "fi fi-ss-check-circle";
          icon.style.opacity = "1";
        } else {
          icon.className = "fi fi-br-circle";
          icon.style.opacity = "1";
          if (stepNum > currentStep) {
            icon.style.opacity = "0.1";
          }
        }
      } else {
        const lineStepNum = Math.floor(i / 2) + 1;
        icon.style.opacity = lineStepNum >= currentStep ? "0.1" : "1";
      }
    }
    const stepText2 = statusContainer.querySelector(".current_step");
    stepText2.textContent = ` ${currentStep}/${totalSteps}`;
    const messageRow2 = statusContainer.querySelectorAll("div")[1];
    messageRow2.textContent = message;
    return statusContainer;
  }
  function createIcon(type2) {
    const icon = document.createElement("i");
    if (type2 === "check") {
      icon.className = "fi fi-ss-check-circle";
    } else if (type2 === "empty") {
      icon.className = "fi fi-br-circle";
    } else if (type2 === "line") {
      icon.className = "fi fi-br-horizontal-rule";
    }
    return icon;
  }
  statusContainer = document.createElement("div");
  statusContainer.id = statusId;
  statusContainer.className = "working_status";
  const stepsRow = document.createElement("div");
  stepsRow.style.display = "flex";
  stepsRow.style.alignItems = "center";
  stepsRow.style.marginBottom = "8px";
  const stepsContainer = document.createElement("span");
  stepsContainer.className = "steps";
  stepsContainer.style.display = "flex";
  stepsContainer.style.alignItems = "center";
  for (let i = 1; i <= totalSteps; i++) {
    if (i < currentStep) {
      stepsContainer.appendChild(createIcon("check"));
    } else {
      const emptyIcon = createIcon("empty");
      if (i > currentStep) {
        emptyIcon.style.opacity = "0.1";
      }
      stepsContainer.appendChild(emptyIcon);
    }
    if (i < totalSteps) {
      const line = createIcon("line");
      if (i >= currentStep) {
        line.style.opacity = "0.1";
      }
      stepsContainer.appendChild(line);
    }
  }
  const stepText = document.createElement("span");
  stepText.className = "current_step";
  stepText.textContent = ` ${currentStep}/${totalSteps}`;
  stepText.style.marginLeft = "10px";
  stepText.style.fontWeight = "bold";
  stepsRow.appendChild(stepsContainer);
  stepsRow.appendChild(stepText);
  const messageRow = document.createElement("div");
  messageRow.textContent = message;
  messageRow.style.marginTop = "4px";
  statusContainer.appendChild(stepsRow);
  statusContainer.appendChild(messageRow);
  if (insertMode === "inContainer") {
    targetElement.innerHTML = "";
    targetElement.appendChild(statusContainer);
  } else {
    targetElement.insertAdjacentElement("afterend", statusContainer);
  }
  return statusContainer;
}
function completeWorkingStatus(target, message = "\uC5B4\uD53C\uB2C8\uD2F0\uBC84\uBE14 \uC644\uC131.", delay = 1e3) {
  let containerId, buttonId, statusId;
  if (typeof target === "string") {
    const containerInner = document.querySelector(`#${target}-inner`);
    const buttonStatus = document.querySelector(`#${target}-status`);
    if (containerInner) {
      containerId = target;
      statusId = `${target}-inner`;
    } else if (buttonStatus) {
      buttonId = target;
      statusId = `${target}-status`;
    } else {
      return null;
    }
  } else if (typeof target === "object") {
    containerId = target.containerId;
    buttonId = target.buttonId;
    statusId = containerId ? `${containerId}-inner` : `${buttonId}-status`;
  }
  const statusContainer = document.querySelector(`#${statusId}`);
  if (!statusContainer) {
    return null;
  }
  function doHide() {
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.display = "none";
        container.innerHTML = "";
      }
    } else {
      statusContainer.remove();
    }
  }
  const steps = statusContainer.querySelector(".steps");
  const icons = steps.querySelectorAll("i");
  const totalSteps = Math.ceil(icons.length / 2);
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const isIcon = i % 2 === 0;
    if (isIcon) {
      icon.className = "fi fi-ss-check-circle";
      icon.style.opacity = "1";
    } else {
      icon.style.opacity = "1";
    }
  }
  const stepText = statusContainer.querySelector(".current_step");
  stepText.textContent = ` ${totalSteps}/${totalSteps}`;
  const messageRow = statusContainer.querySelectorAll("div")[1];
  messageRow.textContent = message;
  setTimeout(() => {
    doHide();
  }, delay);
  return statusContainer;
}
function hideWorkingStatus(target) {
  let containerId, buttonId, statusId;
  if (typeof target === "string") {
    const containerInner = document.querySelector(`#${target}-inner`);
    const buttonStatus = document.querySelector(`#${target}-status`);
    if (containerInner) {
      containerId = target;
      statusId = `${target}-inner`;
    } else if (buttonStatus) {
      buttonId = target;
      statusId = `${target}-status`;
    } else {
      const container = document.getElementById(target);
      if (container) {
        container.style.display = "none";
        container.innerHTML = "";
      }
      return;
    }
  } else if (typeof target === "object") {
    containerId = target.containerId;
    buttonId = target.buttonId;
    statusId = containerId ? `${containerId}-inner` : `${buttonId}-status`;
  }
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = "none";
      container.innerHTML = "";
    }
  } else {
    const statusContainer = document.querySelector(`#${statusId}`);
    if (statusContainer) {
      statusContainer.remove();
    }
  }
}
function updatePipelineStatus(target, progressState) {
  const { stage, progress, message } = progressState;
  const stageMap = {
    "level1": 1,
    "embedding": 1,
    "clustering": 2,
    "positioning_cells": 2,
    "labeling": 3,
    "level2": 4,
    "positioning": 4,
    "combining": 5,
    "complete": 5,
    "error": 0
  };
  const totalSteps = 5;
  const currentStep = stageMap[stage] || 1;
  const normalizedTarget = typeof target === "string" ? { containerId: target } : target;
  if (stage === "complete") {
    return completeWorkingStatus(normalizedTarget, message || "\uC5B4\uD53C\uB2C8\uD2F0\uBC84\uBE14 \uC644\uC131.", 1500);
  }
  if (stage === "error") {
    return completeWorkingStatus(normalizedTarget, `\uC624\uB958: ${message}`, 3e3);
  }
  return showWorkingStatus(normalizedTarget, totalSteps, currentStep, message);
}

// src/insight/makeCompactText.js
function reservoirSample(arr, k) {
  const reservoir = [];
  let n = 0;
  for (const item of arr) {
    n++;
    if (reservoir.length < k) {
      reservoir.push(item);
    } else {
      const j = Math.floor(Math.random() * n);
      if (j < k) {
        reservoir[j] = item;
      }
    }
  }
  return [reservoir, n];
}
function groupBy2(data, keyFn) {
  const groups = /* @__PURE__ */ new Map();
  for (const item of data) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  return Array.from(groups.entries());
}
function makeCompactText(clusterWithLabel, options = {}) {
  const {
    totalSampleSize = 100,
    pipelineResult = null,
    forTopics = false,
    sortFunc = null
  } = options;
  if (!clusterWithLabel || clusterWithLabel.length === 0) {
    return [];
  }
  const total = clusterWithLabel.length;
  const result = [];
  const defaultSortFunc = (key) => (a, b) => b[key] - a[key];
  const sorter = sortFunc || defaultSortFunc;
  const groups = groupBy2(clusterWithLabel, (d) => d.cluster);
  const processedGroups = groups.map(([cluster, data]) => {
    const sampleSize = Math.round(data.length * totalSampleSize / total);
    return {
      cluster,
      label: data[0].label,
      description: pipelineResult?.level1?.labels?.find(
        (t) => t.label === data[0].label
      )?.description,
      size: data.length,
      sample: reservoirSample(
        data,
        Math.min(sampleSize, forTopics ? 3 : 5)
      )[0],
      data
    };
  }).sort(sorter("size")).filter((d) => forTopics || d.sample.length);
  processedGroups.forEach((d) => {
    result.push("## " + d.label);
    if (d.description) result.push("- " + d.description);
    d.sample.forEach((t) => {
      result.push("- " + (t.text || t.chunk || "").slice(0, 140));
    });
  });
  return result;
}
function makeCompactData(clusterWithLabel, options = {}) {
  const {
    totalSampleSize = 100,
    pipelineResult = null,
    forTopics = false,
    sortFunc = null
  } = options;
  if (!clusterWithLabel || clusterWithLabel.length === 0) {
    return [];
  }
  const total = clusterWithLabel.length;
  const defaultSortFunc = (key) => (a, b) => b[key] - a[key];
  const sorter = sortFunc || defaultSortFunc;
  const groups = groupBy2(clusterWithLabel, (d) => d.cluster);
  return groups.map(([cluster, data]) => {
    const sampleSize = Math.round(data.length * totalSampleSize / total);
    return {
      cluster,
      label: data[0].label,
      bigLabel: data[0].bigLabel,
      description: pipelineResult?.level1?.labels?.find(
        (t) => t.label === data[0].label
      )?.description,
      size: data.length,
      sample: reservoirSample(
        data,
        Math.min(sampleSize, forTopics ? 3 : 5)
      )[0]
    };
  }).sort(sorter("size")).filter((d) => forTopics || d.sample.length);
}

// src/insight/getInsightStream.js
var REPORT_TYPES = {
  SUMMARY: "get_insight",
  // 요약 정리
  PERSONA: "get_user_segment",
  // 퍼소나
  REVIEW: "get_review_insight",
  // 리뷰 분석
  THEMATIC: "get_thematic",
  // 사용자 분석
  UNEXPECTED: "get_unexpected",
  // 의외의 발견
  ALTERNATIVE: "get_alternative_lenses",
  // 관점 제시
  HMW: "get_hmw",
  // HMW 도출
  CUSTOM: "custom_report"
  // 사용자 정의
};
async function getInsightStream(api, textList, options = {}) {
  const {
    type: type2 = REPORT_TYPES.SUMMARY,
    requirements = "",
    language = "Korean",
    textId = "",
    userId = "",
    onProgress = () => {
    },
    onComplete = () => {
    },
    onError = () => {
    }
  } = options;
  onProgress("\uB9AC\uD3EC\uD2B8 \uC791\uC131 \uC0DD\uAC01 \uC815\uB9AC \uC911...");
  const system = "you are a text analysis expert.";
  const userInputs = {
    service_type: type2,
    text_id: textId,
    content: textList.join("\n"),
    system,
    requirements,
    language
  };
  let buffer = "";
  try {
    const promptId = userInputs.service_type;
    const configId = "Insight";
    const generator = api.prompt(userInputs, promptId, configId);
    let response = null;
    for await (const chunk of generator) {
      try {
        response = chunk;
        buffer = response?.markdown || buffer + (chunk?.text || "");
        onProgress(buffer);
      } catch (e) {
        console.error("Chunk processing error:", e);
      }
    }
    const title = buffer.split("\n")[0].replace(/#/g, "").trim();
    const historyItem = { title, body: buffer, timestamp: Date.now() };
    onComplete(buffer, historyItem);
    return buffer;
  } catch (error) {
    console.error("getInsightStream error:", error);
    onError(error);
    throw error;
  }
}
async function generateReport(api, options = {}) {
  const {
    data,
    type: type2 = REPORT_TYPES.SUMMARY,
    requirements = "",
    language = "Korean",
    sampleSize = 150,
    pipelineResult = null,
    onProgress = () => {
    },
    onComplete = () => {
    }
  } = options;
  if (!data || data.length === 0) {
    throw new Error("\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const compactText = makeCompactText(data, {
    totalSampleSize: sampleSize,
    pipelineResult
  });
  return getInsightStream(api, compactText, {
    type: type2,
    requirements,
    language,
    onProgress,
    onComplete
  });
}
function getReportTypeOptions() {
  return [
    { name: "\uC694\uC57D \uC815\uB9AC", func: REPORT_TYPES.SUMMARY },
    { name: "\uD37C\uC18C\uB098", func: REPORT_TYPES.PERSONA },
    // { name: "리뷰 분석", func: REPORT_TYPES.REVIEW },
    // { name: "사용자 분석", func: REPORT_TYPES.THEMATIC },
    // { name: "의외의 발견", func: REPORT_TYPES.UNEXPECTED },
    // { name: "관점 제시", func: REPORT_TYPES.ALTERNATIVE },
    // { name: "HMW 도출", func: REPORT_TYPES.HMW },
    { name: "\uC0AC\uC6A9\uC790 \uC815\uC758", func: REPORT_TYPES.CUSTOM }
  ];
}

// src/insight/insightRenderer.js
function simpleMarkdownParse(text) {
  if (!text) return "";
  return text.replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>").replace(/^/, "<p>").replace(/$/, "</p>");
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}
async function saveAsImage(element, filename = "insight-report.png") {
  if (typeof html2canvas === "undefined") {
    try {
      await import("https://html2canvas.hertzen.com/dist/html2canvas.min.js");
    } catch (e) {
      alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5\uC744 \uC704\uD574 html2canvas \uB77C\uC774\uBE0C\uB7EC\uB9AC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.");
      return;
    }
  }
  const canvas = await html2canvas(element);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
}
function renderInsight(insights, options = {}) {
  const {
    editMode = false,
    markdownParser = null,
    onCopy = null,
    onSave = null,
    onEditToggle = null,
    containerId = null,
    // null이면 항상 새 엘리먼트 생성
    createNew = !options.containerId
    // containerId 없으면 새로 생성
  } = options;
  const parser = markdownParser || simpleMarkdownParse;
  const parsedContent = parser(insights || "");
  const content = editMode ? `<div id="mdEditor" contentEditable="true" style="width:100%; line-height:1.5; font-size:1.2em; min-height:400px; white-space: pre-wrap; border:1px solid #ddd; padding:10px; border-radius:4px;">${insights || ""}</div>` : `<div class="parsed-content">${parsedContent.replace(/&quot;\n&quot;/g, '"<br>"')}</div>`;
  const buttons = `
    <button id="copyBtn" class="insight-btn"><i class="fi fi-br-duplicate"></i> \uD14D\uC2A4\uD2B8 \uBCF5\uC0AC</button>
    <button id="saveBtn" class="insight-btn"><i class="fi fi-br-download"></i> \uC774\uBBF8\uC9C0 \uC800\uC7A5</button>
    <button id="editBtn" class="insight-btn ${editMode ? "edit" : "richtext"}" data-action="toggle-edit">
      ${editMode ? '<i class="fi fi-br-check"></i> \uC644\uB8CC' : '<i class="fi fi-br-pencil"></i> \uD3B8\uC9D1'}
    </button>
  `;
  let container;
  if (createNew || !containerId) {
    container = document.createElement("div");
    if (containerId) container.id = containerId;
    container.innerHTML = `
      <div class="sub-buttons" id="insightButtons" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:10px;">${buttons}</div>
      <div class="report" id="insightReport">${content}</div>
    `;
  } else {
    container = document.getElementById(containerId);
    if (container) {
      const buttonsDiv = container.querySelector("#insightButtons") || container.querySelector(".sub-buttons");
      const reportDiv = container.querySelector("#insightReport") || container.querySelector(".report");
      if (buttonsDiv) buttonsDiv.innerHTML = buttons;
      if (reportDiv) reportDiv.innerHTML = content;
    } else {
      container = document.createElement("div");
      container.id = containerId;
      container.innerHTML = `
        <div class="sub-buttons" id="insightButtons" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:10px;">${buttons}</div>
        <div class="report" id="insightReport">${content}</div>
      `;
    }
  }
  const copyBtn = container.querySelector("#copyBtn");
  const saveBtn = container.querySelector("#saveBtn");
  const editBtn = container.querySelector("#editBtn");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      if (onCopy) {
        onCopy(insights);
      } else {
        await copyToClipboard(insights);
        alert("\uD14D\uC2A4\uD2B8\uAC00 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      }
    };
  }
  if (saveBtn) {
    saveBtn.onclick = async () => {
      if (onSave) {
        onSave(container.querySelector("#insightReport"));
      } else {
        const reportEl = container.querySelector("#insightReport");
        await saveAsImage(reportEl, "insight-report.png");
      }
    };
  }
  if (editBtn && onEditToggle) {
    editBtn.onclick = () => {
      if (editMode) {
        const editor = container.querySelector("#mdEditor");
        const newContent = editor ? editor.textContent : insights;
        onEditToggle(false, newContent);
      } else {
        onEditToggle(true, insights);
      }
    };
  }
  return container;
}
function toggleInsightVisibility(containerId = "insightDiv", show = true) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = show ? "block" : "none";
  }
}
function getInsightStyles() {
  return `
    #insightDiv {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    #insightDiv .insight-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    #insightDiv .insight-btn:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }

    #insightDiv h1 { font-size: 1.8em; margin: 0.5em 0; }
    #insightDiv h2 { font-size: 1.4em; margin: 0.5em 0; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    #insightDiv h3 { font-size: 1.2em; margin: 0.5em 0; }

    #insightDiv ul { margin: 0.5em 0; padding-left: 1.5em; }
    #insightDiv li { margin: 0.3em 0; }

    #insightDiv .report {
      line-height: 1.6;
      font-size: 1.1em;
    }

    #insightDiv tr th:first-child { background: #f5f5f5; }
    #insightDiv th { background: #fafafa; padding: 8px; text-align: left; }
    #insightDiv td { padding: 8px; border-bottom: 1px solid #eee; }
  `;
}
export {
  AffinityBubblePipeline,
  DataInput,
  HistoryManager,
  Level1Pipeline,
  Level2Pipeline,
  PipelineState,
  REPORT_TYPES,
  classifyWithId_threads,
  combineAll,
  completeWorkingStatus,
  cossim,
  createChunkData,
  createClusterWithLabel,
  detectFormat,
  euclidean,
  generateReport,
  getClassified,
  getClassifiedWithId,
  getInsightStream,
  getInsightStyles,
  getLabels,
  getLabels_threads,
  getPromptResult,
  getReportTypeOptions,
  getTopics,
  guessColumns,
  hideWorkingStatus,
  makeCluster,
  makeCluster_breakBig_optimized,
  makeCompactData,
  makeCompactText,
  makeEmbedPos,
  processInParallel,
  renderInsight,
  showWorkingStatus,
  toggleInsightVisibility,
  updatePipelineStatus
};
