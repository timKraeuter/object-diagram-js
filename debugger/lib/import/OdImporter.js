import {
  assign
} from 'min-dash';

import { is } from '../util/ModelUtil';

import {
  isLabelExternal,
  getExternalLabelBounds
} from '../util/LabelUtil';

import {
  getLabel
} from '../features/label-editing/LabelUtil';

import {
  elementToString
} from './Util';
import { getMid } from 'diagram-js/lib/layout/LayoutUtil';


function elementData(semantic, attrs) {
  return assign({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }, attrs);
}

function notYetDrawn(translate, semantic, refSemantic, property) {
  return new Error(translate('element {element} referenced by {referenced}#{property} not yet drawn', {
    element: elementToString(refSemantic),
    referenced: elementToString(semantic),
    property: property
  }));
}


/**
 * An importer that adds OD elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementFactory} elementFactory
 * @param {ElementRegistry} elementRegistry
 * @param {Function} translate
 * @param {TextRenderer} textRenderer
 */
export default function OdImporter(
    eventBus, canvas, elementFactory,
    elementRegistry, translate, textRenderer) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._elementFactory = elementFactory;
  this._elementRegistry = elementRegistry;
  this._translate = translate;
  this._textRenderer = textRenderer;
}

OdImporter.$inject = [
  'eventBus',
  'canvas',
  'elementFactory',
  'elementRegistry',
  'translate',
  'textRenderer'
];


/**
 * Add od element (semantic) to the canvas onto the
 * specified parent shape.
 */
OdImporter.prototype.add = function(semantic, parentElement) {

  var di = semantic.di,
      element,
      translate = this._translate,
      hidden;

  var parentIndex;

  // ROOT ELEMENT
  // handle the special case that we deal with a
  // invisible root element
  if (is(di, 'odDi:OdPlane')) {

    // add a virtual element (not being drawn)
    element = this._elementFactory.createRoot(elementData(semantic));

    this._canvas.setRootElement(element);
  }

  // SHAPE
  else if (is(di, 'odDi:OdShape')) {

    var isFrame = isFrameElement(semantic);

    hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    var bounds = semantic.di.bounds;

    element = this._elementFactory.createShape(elementData(semantic, {
      hidden: hidden,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      isFrame: isFrame
    }));

    this._canvas.addShape(element, parentElement, parentIndex);
  }

  // CONNECTION
  else if (is(di, 'odDi:Link')) {

    var source = this._getSource(semantic),
        target = this._getTarget(semantic);

    hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

    element = this._elementFactory.createConnection(elementData(semantic, {
      hidden: hidden,
      source: source,
      target: target,
      waypoints: getWaypoints(semantic, source, target)
    }));

    this._canvas.addConnection(element, parentElement, 0);
  }

  else {
    throw new Error(translate('unknown di {di} for element {semantic}', {
      di: elementToString(di),
      semantic: elementToString(semantic)
    }));
  }

  // (optional) LABEL
  if (isLabelExternal(semantic) && getLabel(element)) {
    this.addLabel(semantic, element);
  }


  this._eventBus.fire('boardElement.added', { element: element });

  return element;
};

function getWaypoints(bo, source, target) {

  var waypoints = bo.di.waypoint;

  if (!waypoints || waypoints.length < 2) {
    return [ getMid(source), getMid(target) ];
  }

  return waypoints.map(function(p) {
    return { x: p.x, y: p.y };
  });
}


/**
 * Attach the boundary element to the given host
 *
 * @param {ModdleElement} boundarySemantic
 * @param {djs.model.Base} boundaryElement
 */
OdImporter.prototype._attachBoundary = function(boundarySemantic, boundaryElement) {
  var translate = this._translate;
  var hostSemantic = boundarySemantic.attachedToRef;

  if (!hostSemantic) {
    throw new Error(translate('missing {semantic}#attachedToRef', {
      semantic: elementToString(boundarySemantic)
    }));
  }

  var host = this._elementRegistry.get(hostSemantic.id),
      attachers = host && host.attachers;

  if (!host) {
    throw notYetDrawn(translate, boundarySemantic, hostSemantic, 'attachedToRef');
  }

  // wire element.host <> host.attachers
  boundaryElement.host = host;

  if (!attachers) {
    host.attachers = attachers = [];
  }

  if (attachers.indexOf(boundaryElement) === -1) {
    attachers.push(boundaryElement);
  }
};


/**
 * add label for an element
 */
OdImporter.prototype.addLabel = function(semantic, element) {
  var bounds,
      text,
      label;

  bounds = getExternalLabelBounds(semantic, element);

  text = getLabel(element);

  if (text) {

    // get corrected bounds from actual layouted text
    bounds = this._textRenderer.getExternalLabelBounds(bounds, text);
  }

  label = this._elementFactory.createLabel(elementData(semantic, {
    id: semantic.id + '_label',
    labelTarget: element,
    type: 'label',
    hidden: element.hidden || !getLabel(element),
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  }));

  return this._canvas.addShape(label, element.parent);
};

/**
 * Return the drawn connection end based on the given side.
 *
 * @throws {Error} if the end is not yet drawn
 */
OdImporter.prototype._getEnd = function(semantic, side) {

  var element,
      refSemantic,
      translate = this._translate;

  refSemantic = semantic[side + 'Ref'];


  element = refSemantic && this._getElement(refSemantic);

  if (element) {
    return element;
  }

  if (refSemantic) {
    throw notYetDrawn(translate, semantic, refSemantic, side + 'Ref');
  } else {
    throw new Error(translate('{semantic}#{side} Ref not specified', {
      semantic: elementToString(semantic),
      side: side
    }));
  }
};

OdImporter.prototype._getSource = function(semantic) {
  return this._getEnd(semantic, 'source');
};

OdImporter.prototype._getTarget = function(semantic) {
  return this._getEnd(semantic, 'target');
};


OdImporter.prototype._getElement = function(semantic) {
  return this._elementRegistry.get(semantic.id);
};


// helpers //////////

function isFrameElement(semantic) {
  return is(semantic, 'od:Group');
}