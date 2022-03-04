import inherits from 'inherits';

import { assign, isObject } from 'min-dash';

import { append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate } from 'tiny-svg';

import { createLine } from 'diagram-js/lib/util/RenderUtil';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { getLabel } from '../features/label-editing/LabelUtil';

import { getBusinessObject, is } from '../util/ModelUtil';
import {
  query as domQuery
} from 'min-dom';

import { getFillColor, getRectPath, getSemantic, getStrokeColor, getColor, getLinkSourceRelation, getLinkTargetRelation} from './ODRendererUtil';
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

  function marker(type, fill, stroke, sourceOrTarget) {
    var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId + '-' + sourceOrTarget;

    if (!markers[id]) {
      createMarker(id, type, fill, stroke, sourceOrTarget);
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
      orient: 'auto-start-reverse',
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

  function createMarker(id, type, fill, stroke, sourceOrTarget) {
    var fillColor = stroke;
    var element = svgCreate('path');
    var ref;
    var scale = 0.5;

    if (type !== 'default') {
      scale = 0.95;
      fillColor = 'white';
    }

    // Only add the default arrow to the target direction.
    if (sourceOrTarget === 'target' && type === 'default') {
      svgAttr(element, { d: 'M 1 5 L 11 10 L 1 15 Z' });
      ref = { x: 11, y: 10 };
    }

    if (type === 'zero-or-many') {
      ref = { x: 20.3, y: 6.95 };
      svgAttr(element, { d: 'M13.063 6.945 25.563 6.945M13.063 6.945 25.563.695M13.063 6.945 25.563 13.195M13.063 6.945a6.25 6.25 0 1 1 0-.25Z' });
    } else if (type === 'one-or-many') {
      ref = { x: 19.75, y: 12.5 };
      svgAttr(element, { d: 'M25 12.5 0 12.5M12.5 12.5 25 6.25M12.5 12.5 25 18.75M6.25 6.25 6.25 18.75' });
    } else if (type === 'one') {
      ref = { x: 21.90, y: 12.5 };
      svgAttr(element, { d: 'M0 12.5 25 12.5M6.25 6.25 6.25 18.75M18.75 6.25 18.75 18.75' });
    } else if (type === 'zero-or-one') {
      ref = { x: 22.45, y: 6.95 };
      svgAttr(element, { d: 'M13.063 6.945 25.563 6.945M19.313.695 19.313 13.195M13.063 6.945a6.25 6.25 0 1 1 0-.25Z' });
    }

    addMarker(id, {
      element,
      ref,
      scale,
      attrs: {
        fill: fillColor,
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

      var sourceRelation = getLinkSourceRelation(element);
      var targetRelation = getLinkTargetRelation(element);

      var attrs = {
        strokeLinejoin: 'round',
        markerStart: marker(sourceRelation, fill, stroke, 'source'),
        markerEnd: marker(targetRelation, fill, stroke, 'target'),
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
  'config.odm',
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
