"use strict";

var _config = require("./config.js");
var _preferences = require("../src/config/preferences.js");
var _pic = require("./pic.js");
var _figures = require("./figures.js");
function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) ||
    _iterableToArrayLimit(arr, i) ||
    _unsupportedIterableToArray(arr, i) ||
    _nonIterableRest()
  );
}
function _nonIterableRest() {
  throw new TypeError(
    "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(arr, i) {
  var _i =
    null == arr
      ? null
      : ("undefined" != typeof Symbol && arr[Symbol.iterator]) ||
        arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (((_x = (_i = _i.call(arr)).next), 0 === i)) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else
        for (
          ;
          !(_n = (_s = _x.call(_i)).done) &&
          (_arr.push(_s.value), _arr.length !== i);
          _n = !0
        );
    } catch (err) {
      (_d = !0), (_e = err);
    } finally {
      try {
        if (!_n && null != _i.return && ((_r = _i.return()), Object(_r) !== _r))
          return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
var canvas = document.querySelector(".canvas");
var renderSection = document.querySelector(".render-section");
canvas.height = renderSection.offsetHeight;
canvas.width = renderSection.offsetWidth;
_config.config.height =
  canvas.height - (canvas.height % _config.config.cellSize);
_config.config.width = canvas.width - (canvas.width % _config.config.cellSize);
var ctx = canvas.getContext("2d");
var lsX = document.querySelector("#land_x");
var lsY = document.querySelector("#land_y");
var rotX = document.querySelector("#rot_x");
var rotY = document.querySelector("#rot_y");
var rotA = document.querySelector("#rot_angle");
var sk = document.querySelector("#sk");
var drawArrow = function drawArrow(ctx, xStart, yStart, xEnd, yEnd, color) {
  ctx.beginPath();
  var headLen = 10;
  var dx = xEnd - xStart;
  var dy = yEnd - yStart;
  var angle = Math.atan2(dy, dx);
  ctx.moveTo(xStart, yStart);
  ctx.lineTo(xEnd, yEnd);
  ctx.lineTo(
    xEnd - headLen * Math.cos(angle - Math.PI / 6),
    yEnd - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(xEnd, yEnd);
  ctx.lineTo(
    xEnd - headLen * Math.cos(angle + Math.PI / 6),
    yEnd - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
};
var drawLine = function drawLine(ctx, pref, pStart, pEnd) {
  ctx.moveTo(pStart.x * pref.cellToMm, pStart.y * pref.cellToMm);
  ctx.lineTo(pEnd.x * pref.cellToMm, pEnd.y * pref.cellToMm);
};
var drawDot = function drawDot(ctx, pref, point, color) {
  ctx.beginPath();
  ctx.arc(point.x * pref.cellToMm, point.y * pref.cellToMm, 3, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
};
var degToRad = function degToRad(deg) {
  return deg * (Math.PI / 180);
};
var matrix = function matrix(m1, m2) {
  var result = [];
  for (var i = 0; i < m1.length; i++) {
    result[i] = [];
    for (var j = 0; j < m2[0].length; j++) {
      var sum = 0;
      for (var k = 0; k < m1[0].length; k++) {
        sum += m1[i][k] * m2[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};
var renderGridWithAxis = function renderGridWithAxis(ctx, pref) {
  grid();
  var xArrow = {
    x: pref.width,
    y: 0,
  };
  var yArrow = {
    x: 0,
    y: pref.height,
  };
  drawArrow(ctx, 0, 0, xArrow.x, xArrow.y, "#fa0000");
  drawArrow(ctx, 0, 0, yArrow.x, yArrow.y, "#065af3");
};
var getFergPoint = function getFergPoint(t, seg) {
  var p0 = seg[0];
  var p1 = seg[1];
  var p0Der = seg[2];
  p0Der = 3 * (p0Der - p0);
  var p1Der = seg[3];
  p1Der = 3 * (p1Der - p1);
  return (
    p0 * (1 - 3 * Math.pow(t, 2) + 2 * Math.pow(t, 3)) +
    p1 * (3 * Math.pow(t, 2) - 2 * Math.pow(t, 3)) +
    p0Der * (t - 2 * Math.pow(t, 2) + Math.pow(t, 3)) +
    p1Der * (-Math.pow(t, 2) + Math.pow(t, 3))
  );
};
var getBezierPoint = function getBezierPoint(t, p0, p1, p2, p3) {
  return {
    x:
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x,
    y:
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y,
  };
};
var getPic = function getPic(pref) {
  _pic.pic.pushFig(
    _figures.moliere,
    (0, _figures.getHeart)(1, 0, 0, 0, rot),
    (0, _figures.getHeart)(1, 45, 0.59, -0.46, rot),
    (0, _figures.getHeart)(1, 135, 1.4, -0.61, rot),
    (0, _figures.getHeart)(1, 180, 2.2, -0.35, rot),
    (0, _figures.getHeart)(1, -45, 0.55, 0.69, rot),
    (0, _figures.getHeart)(1, -100, 1.36, 0.84, rot),
    (0, _figures.getHeart)(1, -100, 1.36, 0.84, rot),
    (0, _figures.getHeart)(1, -120, 2.14, 0.34, rot),
    (0, _figures.getHeart)(1.5, 90, 0.3, -5.6, rot),
    _figures.cup,
    _figures.kettle
  );
  if (pref.ls.x !== 0 || pref.ls.y !== 0) {
    _pic.pic.figs = _pic.pic.figs.map(function (fig) {
      return fig.map(function (l) {
        var _l = _slicedToArray(l, 4),
          p0 = _l[0],
          p1 = _l[1],
          p2 = _l[2],
          p3 = _l[3];
        return [land(p0, pref), land(p1, pref), land(p2, pref), land(p3, pref)];
      });
    });
  }
  if (pref.rot.angle !== 0) {
    _pic.pic.figs = _pic.pic.figs.map(function (fig) {
      return fig.map(function (l) {
        var _l2 = _slicedToArray(l, 4),
          p0 = _l2[0],
          p1 = _l2[1],
          p2 = _l2[2],
          p3 = _l2[3];
        return [
          rot(p0, _config.config),
          rot(p1, _config.config),
          rot(p2, _config.config),
          rot(p3, _config.config),
        ];
      });
    });
  }
  _pic.pic.figs = _pic.pic.figs.map(function (fig) {
    return fig.map(function (l) {
      var _l3 = _slicedToArray(l, 4),
        p0 = _l3[0],
        p1 = _l3[1],
        p2 = _l3[2],
        p3 = _l3[3];
      var newLine = [];
      _pic.pic.pushSPoint(p0);
      _pic.pic.pushRPoint(p1);
      _pic.pic.pushRPoint(p2);
      _pic.pic.pushSkLine(p0, p1);
      _pic.pic.pushSkLine(p1, p2);
      _pic.pic.pushSkLine(p2, p3);
      for (
        var t = pref.tStart;
        Math.round(t * 10) / 10 <= pref.tEnd;
        t += pref.tStep
      ) {
        var point = getBezierPoint(t, p0, p1, p2, p3);
        newLine.push({
          x: point.x,
          y: point.y,
        });
      }
      return newLine;
    });
  });
  console.log(_pic.pic);
};
var land = function land(point, pref) {
  var _matrix = matrix(
      [[point.x, point.y, 1]],
      [
        [1, 0, 0],
        [0, 1, 0],
        [pref.ls.x, pref.ls.y, 1],
      ]
    ),
    _matrix2 = _slicedToArray(_matrix, 1),
    res = _matrix2[0];
  point.x = res[0];
  point.y = res[1];
  return point;
};
var rot = function rot(point, config) {
  var _matrix3 = matrix(
      [[point.x, point.y, 1]],
      [
        [
          Math.cos(degToRad(config.rot.angle)),
          Math.sin(degToRad(config.rot.angle)),
          0,
        ],
        [
          -Math.sin(degToRad(config.rot.angle)),
          Math.cos(degToRad(config.rot.angle)),
          0,
        ],
        [
          -config.rot.x * (Math.cos(degToRad(config.rot.angle)) - 1) +
            config.rot.y * Math.sin(degToRad(config.rot.angle)),
          -config.rot.x * Math.sin(degToRad(config.rot.angle)) -
            config.rot.y * (Math.cos(degToRad(config.rot.angle)) - 1),
          1,
        ],
      ]
    ),
    _matrix4 = _slicedToArray(_matrix3, 1),
    res = _matrix4[0];
  point.x = res[0];
  point.y = res[1];
  return point;
};
var createAnimationContour = function createAnimationContour(pref) {
  var newPic = {
    figures: [],
    segmentPoints: [],
    referencePoints: [],
    skeletonLines: [],
    addFigures: function addFigures() {
      var _this$figures;
      (_this$figures = this.figures).push.apply(_this$figures, arguments);
    },
  };
  var createLine = function createLine(xStart, xEnd, yStart, yEnd, n) {
    var xStep = (xEnd - xStart) / (3 * n);
    var yStep = (yEnd - yStart) / (3 * n);
    var xCur = xStart;
    var yCur = yStart;
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr[i] = [];
      for (var j = 0; j < 4; j++) {
        arr[i].push({
          x: xCur,
          y: yCur,
        });
        if (j !== 3) {
          xCur += xStep;
          yCur += yStep;
        }
      }
    }
    return arr;
  };
  newPic.addFigures(
    createLine(6, 8, 5, 7, 5),
    createLine(8, 10, 7, 5, 2),
    createLine(10, 8, 5, 5, 2),
    createLine(8, 6, 5, 5, 2),
    createLine(6, 8, 5, 3, 2),
    createLine(8, 10, 3, 5, 2),
    createLine(8, 6, 5, 5, 2),
    createLine(6, 8, 5, 3, 2),
    createLine(8, 10, 3, 5, 2),
    createLine(3, 13, 2, 2, 2),
    createLine(13, 8, 2, 10, 11),
    createLine(8, 3, 10, 2, 26)
  );
  newPic.figures = newPic.figures.map(function (fig) {
    return fig.map(function (l) {
      var _l4 = _slicedToArray(l, 4),
        p0 = _l4[0],
        p1 = _l4[1],
        p2 = _l4[2],
        p3 = _l4[3];
      var newLine = [];
      for (
        var t = pref.tStart;
        Math.round(t * 10) / 10 <= pref.tEnd;
        t += pref.tStep
      ) {
        var point = getBezierPoint(t, p0, p1, p2, p3);
        newLine.push({
          x: point.x,
          y: point.y,
        });
      }
      return newLine;
    });
  });
  return newPic;
};
var grid = function grid() {
  for (var i = 0; i <= _config.config.height; i += _config.config.cellSize) {
    var lineX = {
      x: _config.config.width,
      y: i,
    };
    var lineY = {
      x: 0,
      y: i,
    };
    ctx.moveTo(lineX.x, lineX.y);
    ctx.lineTo(lineY.x, lineY.y);
  }
  for (
    var _i2 = 0;
    _i2 <= _config.config.width;
    _i2 += _config.config.cellSize
  ) {
    var _lineX = {
      x: _i2,
      y: 0,
    };
    var _lineY = {
      x: _i2,
      y: _config.config.height,
    };
    ctx.moveTo(_lineX.x, _lineX.y);
    ctx.lineTo(_lineY.x, _lineY.y);
  }
  ctx.strokeStyle = "#d0d0d0";
  ctx.stroke();
  ctx.closePath();
};
var render = function render(ctx, pref) {
  ctx.beginPath();
  var curPoint;
  _pic.pic.figs.forEach(function (fig) {
    return fig.forEach(function (l) {
      return l.forEach(function (p, i) {
        if (i === 0) {
          curPoint = p;
          return;
        }
        drawLine(ctx, pref, curPoint, p);
        curPoint = p;
      });
    });
  });
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();
  if (pref.an.sK) {
    _pic.pic.sPoints.forEach(function (p) {
      return drawDot(ctx, pref, p, "#0a71d7");
    });
    _pic.pic.rPoints.forEach(function (p) {
      return drawDot(ctx, pref, p, "#0ef17a");
    });
    _pic.pic.skLines.forEach(function (l) {
      return drawLine(ctx, pref, l.pStart, l.pEnd);
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#919191";
    ctx.stroke();
  }
  ctx.closePath();
};
var clearAndRender = function clearAndRender(ctx, canvas, pref, anim) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  renderGridWithAxis(ctx, pref);
  if (!anim) getPic(pref);
  render(ctx, pref);
};
ctx.transform(1, 0, 0, -1, 0, canvas.height);
renderGridWithAxis(ctx, _preferences.preferences);
lsX.value = _config.config.ls.x;
lsY.value = _config.config.ls.y;
rotX.value = _config.config.rot.x;
rotY.value = _config.config.rot.y;
rotA.value = _config.config.rot.angle;
sk.checked = _config.config.an.sK;
_config.config.an.sK = sk.checked;
document.querySelector(".btn--render").addEventListener("click", function (e) {
  e.preventDefault();
  _pic.pic.clearFigs();
  _pic.pic.clearSPoints();
  _pic.pic.clearRPoints();
  _pic.pic.clearSkLines();
  _config.config.ls.x = +lsX.value;
  _config.config.ls.y = +lsY.value;
  _config.config.rot.x = +rotX.value;
  _config.config.rot.y = +rotY.value;
  _config.config.rot.angle = +rotA.value;
  _config.config.an.sK = sk.checked;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  clearAndRender(ctx, canvas, _config.config);
});
document
  .querySelector(".btn--animation")
  .addEventListener("click", function (e) {
    e.preventDefault();
    var ctx = canvas.getContext("2d");
    _pic.pic.clearFigs();
    _pic.pic.clearSPoints();
    _pic.pic.clearRPoints();
    _pic.pic.clearSkLines();
    var endContour = createAnimationContour(_config.config);
    getPic(_config.config);
    _pic.pic.clearSPoints();
    _pic.pic.clearRPoints();
    _pic.pic.clearSkLines();
    _pic.pic.figs.forEach(function (fig, fi) {
      return fig.forEach(function (l, li) {
        l.forEach(function (p, pi) {
          setTimeout(function () {
            _pic.pic.figs[fi][li][pi] = endContour.figures[fi][li][pi];
            clearAndRender(ctx, canvas, _config.config, true);
          }, _config.config.an.duration);
        });
      });
    });
  });
