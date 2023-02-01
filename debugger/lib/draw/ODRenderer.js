import inherits from 'inherits-browser';

import { assign, isObject } from 'min-dash';

import { append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate } from 'tiny-svg';

import { createLine } from 'diagram-js/lib/util/RenderUtil';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { getLabel } from '../features/label-editing/LabelUtil';

import { getBusinessObject, is } from '../util/ModelUtil';
import {
  query as domQuery
} from 'min-dom';

import { getFillColor, getRectPath, getSemantic, getStrokeColor } from './ODRendererUtil';
import Ids from 'ids';

var RENDERER_IDS = new Ids();

var HIGH_FILL_OPACITY = .35;

var DEFAULT_TEXT_SIZE = 16;
var markers = {};

export default function ODRenderer(
    config, eventBus, styles,
    canvas, textRenderer, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config && config.defaultFillColor,
      defaultStrokeColor = config && config.defaultStrokeColor;

  var rendererId = RENDERER_IDS.next();

  var computeStyle = styles.computeStyle;

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    });
    svgAttr(rect, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function renderLabel(parentGfx, label, options) {

    options = assign({
      size: {
        width: 100
      }
    }, options);

    var text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, fontSize) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getColor(element) === 'black' ? 'white' : 'black',
        fontSize: fontSize || DEFAULT_TEXT_SIZE
      },
    });
  }

  function renderExternalLabel(parentGfx, element) {

    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: 'black'
        }
      )
    });
  }

  function renderAttributes(parentGfx, element) {
    var semantic = getSemantic(element);
    if (semantic.attributeValues) {
      renderLabel(parentGfx, semantic.attributeValues, {
        box: {
          height: element.height + 30,
          width: element.width
        },
        padding: 5,
        align: 'center-middle',
        style: {
          fill: defaultStrokeColor
        }
      });
    }
  }

  function addDivider(parentGfx, element) {
    drawLine(parentGfx, [
      { x: 0, y: 30 },
      { x: element.width, y: 30 }
    ], {
      stroke: getStrokeColor(element, defaultStrokeColor)
    });
  }

  function drawLine(parentGfx, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    var line = createLine(waypoints, attrs);

    svgAppend(parentGfx, line);

    return line;
  }

  function renderTitelLabel(parentGfx, element) {
    let semantic = getSemantic(element);
    let text = '';
    if (semantic.name) {
      text = semantic.name;

    }
    renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: element.width
      },
      padding: 5,
      align: 'center-middle',
      style: {
        fill: defaultStrokeColor
      }
    });
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  function marker(fill, stroke) {
    var id = '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function addMarker(id, options) {
    var attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    var ref = options.ref || { x: 0, y: 0 };

    var scale = options.scale || 1;

    // fix for safari / chrome / firefox bug not correctly
    // resetting stroke dash array
    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [ 10000, 1 ];
    }

    var marker = svgCreate('marker');

    svgAttr(options.element, attrs);

    svgAppend(marker, options.element);

    svgAttr(marker, {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    var defs = domQuery('defs', canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function colorEscape(str) {

    // only allow characters and numbers
    return str.replace(/[^0-9a-zA-z]+/g, '_');
  }

  function createMarker(id, type, fill, stroke) {
    var linkEnd = svgCreate('path');
    svgAttr(linkEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

    addMarker(id, {
      element: linkEnd,
      ref: { x: 11, y: 10 },
      scale: 0.5,
      attrs: {
        fill: stroke,
        stroke: stroke
      }
    });
  }

  this.handlers = {
    'od:Object': function(parentGfx, element, attrs) {
      var rect = drawRect(parentGfx, element.width, element.height, 0, assign({
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: HIGH_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs));

      addDivider(parentGfx, element);

      renderTitelLabel(parentGfx, element);

      renderAttributes(parentGfx, element);

      return rect;
    },
    'od:Link': function(parentGfx, element) {
      var pathData = createPathFromConnection(element);

      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker(fill, stroke),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };
      return drawPath(parentGfx, pathData, attrs);
    },
    'od:TextBox': function(parentGfx, element) {
      var attrs = {
        fill: 'none',
        stroke: 'none'
      };

      var textSize = element.textSize || DEFAULT_TEXT_SIZE;

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle', textSize);

      return rect;
    },
    'label': function(parentGfx, element) {
      return renderExternalLabel(parentGfx, element);
    }
  };
}


inherits(ODRenderer, BaseRenderer);

ODRenderer.$inject = [
  'config.object',
  'eventBus',
  'styles',
  'canvas',
  'textRenderer'
];


ODRenderer.prototype.canRender = function(element) {
  return is(element, 'od:BoardElement');
};

ODRenderer.prototype.drawShape = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

ODRenderer.prototype.drawConnection = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

ODRenderer.prototype.getShapePath = function(element) {

  return getRectPath(element);
};

// helpers //////////

function getColor(element) {
  var bo = getBusinessObject(element);

  return bo.color || element.color;
}
