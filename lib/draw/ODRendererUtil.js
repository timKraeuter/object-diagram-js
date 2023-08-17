import {
  componentsToPath
} from 'diagram-js/lib/util/RenderUtil';

import {
  getBusinessObject
} from '../util/ModelUtil';


// element utils //////////////////////

export function getDi(element) {
  return element.businessObject.di;
}

export function getSemantic(element) {
  return element.businessObject;
}


// color access //////////////////////

export function getFillColor(element, defaultColor) {
  return (
    getColor(element) ||
    getDi(element).get('bioc:fill') ||
    defaultColor ||
    'white'
  );
}

export function getStrokeColor(element, defaultColor) {
  return (
    getColor(element) ||
    getDi(element).get('bioc:stroke') ||
    defaultColor ||
    'black'
  );
}


// cropping path customizations //////////////////////

export function getRectPath(shape) {
  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var rectPath = [
    [ 'M', x, y ],
    [ 'l', width, 0 ],
    [ 'l', 0, height ],
    [ 'l', -width, 0 ],
    [ 'z' ]
  ];

  return componentsToPath(rectPath);
}

// helpers //////////

function getColor(element) {
  var bo = getBusinessObject(element);

  return bo.color || element.color;
}