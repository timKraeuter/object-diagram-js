import { is } from '../../util/ModelUtil';

import {
  getMid,
  asTRBL,
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  findFreePosition,
  generateGetNextPosition,
  getConnectedDistance
} from 'diagram-js/lib/features/auto-place/AutoPlaceUtil';


/**
 * Find the new position for the target element to
 * connect to source.
 *
 * @param  {djs.model.Shape} source
 * @param  {djs.model.Shape} element
 *
 * @return {Point}
 */
export function getNewShapePosition(source, element) {

  if (is(element, 'od:Object')) {
    return getFlowNodePosition(source, element);
  }
}

/**
 * Always try to place element right of source;
 * compute actual distance from previous nodes in flow.
 */
export function getFlowNodePosition(source, element) {

  var sourceTrbl = asTRBL(source);
  var sourceMid = getMid(source);

  var horizontalDistance = getConnectedDistance(source, {
    filter: function(connection) {
      return is(connection, 'od:Link');
    }
  });

  var margin = 30,
      minDistance = 80,
      orientation = 'left';

  var position = {
    x: sourceTrbl.right + horizontalDistance + element.width / 2,
    y: sourceMid.y + getVerticalDistance(orientation, minDistance)
  };

  var nextPositionDirection = {
    y: {
      margin: margin,
      minDistance: minDistance
    }
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}


function getVerticalDistance(orientation, minDistance) {
  if (orientation.indexOf('top') != -1) {
    return -1 * minDistance;
  } else if (orientation.indexOf('bottom') != -1) {
    return minDistance;
  } else {
    return 0;
  }
}