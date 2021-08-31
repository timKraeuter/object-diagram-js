import {
  mid,
  setSnapped
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { isCmd } from 'diagram-js/lib/features/keyboard/KeyboardUtil';

import { isAny } from '../modeling/util/ModelingUtil';

import { some } from 'min-dash';

var HIGHER_PRIORITY = 1250;

var OBJECT_BOUNDS_PADDING = 10;

var TARGET_CENTER_PADDING = 20;

var AXES = [ 'x', 'y' ];

/**
 * Snap during connect.
 *
 * @param {EventBus} eventBus
 */
export default function ObjectConnectSnapping(eventBus) {
  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end',
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        canExecute = context.canExecute,
        start = context.start,
        hover = context.hover;

    // do NOT snap on CMD
    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (!context.initialConnectionStart) {
      context.initialConnectionStart = context.connectionStart;
    }

    // snap hover
    if (canExecute && hover) {
      snapToShape(event, hover, getTargetBoundsPadding());
    }

    if (hover && isAnyType(canExecute, [
      'od:Link',
    ])) {
      context.connectionStart = mid(start);

      // snap hover
      if (isAny(hover, [ 'od:Object' ])) {
        snapToTargetMid(event, hover);
      }
    }
  });
}

ObjectConnectSnapping.$inject = [ 'eventBus' ];


// helpers //////////

// snap to target if event in target
function snapToShape(event, target, padding) {
  AXES.forEach(function(axis) {
    var dimensionForAxis = getDimensionForAxis(axis, target);

    if (event[ axis ] < target[ axis ] + padding) {
      setSnapped(event, axis, target[ axis ] + padding);
    } else if (event[ axis ] > target[ axis ] + dimensionForAxis - padding) {
      setSnapped(event, axis, target[ axis ] + dimensionForAxis - padding);
    }
  });
}

// snap to target mid if event in target mid
function snapToTargetMid(event, target) {
  var targetMid = mid(target);

  AXES.forEach(function(axis) {
    if (isMid(event, target, axis)) {
      setSnapped(event, axis, targetMid[ axis ]);
    }
  });
}

function isType(attrs, type) {
  return attrs && attrs.type === type;
}

function isAnyType(attrs, types) {
  return some(types, function(type) {
    return isType(attrs, type);
  });
}

function getDimensionForAxis(axis, element) {
  return axis === 'x' ? element.width : element.height;
}

function getTargetBoundsPadding() {
  return OBJECT_BOUNDS_PADDING;
}

function isMid(event, target, axis) {
  return event[ axis ] > target[ axis ] + TARGET_CENTER_PADDING
    && event[ axis ] < target[ axis ] + getDimensionForAxis(axis, target) - TARGET_CENTER_PADDING;
}