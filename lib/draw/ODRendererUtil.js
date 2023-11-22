import { componentsToPath } from "diagram-js/lib/util/RenderUtil";

// element utils //////////////////////

export function getDi(element) {
  return element.businessObject.di;
}

export function getSemantic(element) {
  return element.businessObject;
}

// color access //////////////////////

export function getFillColor(element, defaultColor) {
  const di = getDi(element);

  return (
    di["background-color"] || di.get("bioc:fill") || defaultColor || "white"
  );
}

export function getStrokeColor(element, defaultColor) {
  const di = getDi(element);

  return di["border-color"] || di.get("bioc:stroke") || defaultColor || "black";
}

// cropping path customizations //////////////////////

export function getRectPath(shape) {
  var x = shape.x,
    y = shape.y,
    width = shape.width,
    height = shape.height;

  var rectPath = [
    ["M", x, y],
    ["l", width, 0],
    ["l", 0, height],
    ["l", -width, 0],
    ["z"],
  ];

  return componentsToPath(rectPath);
}
