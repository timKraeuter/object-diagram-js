import {
  every
} from 'min-dash';

import inherits from 'inherits';

import {
  is
} from '../../util/ModelUtil';

import {
  isLabel
} from '../../util/LabelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import { isAny } from '../modeling/util/ModelingUtil';


/**
 * OD specific modeling rule
 */
export default function ODRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(ODRules, RuleProvider);

ODRules.$inject = [ 'eventBus' ];

ODRules.prototype.init = function() {

  this.addRule('connection.start', function(context) {
    var source = context.source;

    return canStartConnection(source);
  });

  this.addRule('connection.create', function(context) {
    var source = context.source,
        target = context.target,
        hints = context.hints || {},
        targetParent = hints.targetParent;

    // temporarily set target parent for scoping
    // checks to work
    if (targetParent) {
      target.parent = targetParent;
    }

    try {
      return canConnect(source, target);
    } finally {

      // unset temporary target parent
      if (targetParent) {
        target.parent = null;
      }
    }
  });

  this.addRule('connection.reconnect', function(context) {

    var connection = context.connection,
        source = context.source,
        target = context.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', function(context) {
    return {
      type: context.connection.type
    };
  });

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule('elements.create', function(context) {
    var elements = context.elements,
        position = context.position,
        target = context.target;

    return every(elements, function(element) {
      if (element.host) {
        return canAttach(element, element.host, null, position);
      }

      return canCreate(element, target, null, position);
    });
  });

  this.addRule('elements.move', function(context) {

    var target = context.target,
        shapes = context.shapes,
        position = context.position;

    return canAttach(shapes, target, null, position) ||
      canMove(shapes, target, position);
  });

  this.addRule('shape.create', function(context) {
    return canCreate(
      context.shape,
      context.target,
      context.source,
      context.position
    );
  });

  this.addRule('shape.attach', function(context) {

    return canAttach(
      context.shape,
      context.target,
      null,
      context.position
    );
  });

  this.addRule('element.copy', function(context) {
    var element = context.element,
        elements = context.elements;

    return canCopy(elements, element);
  });
};

ODRules.prototype.canConnect = canConnect;

ODRules.prototype.canMove = canMove;

ODRules.prototype.canAttach = canAttach;

ODRules.prototype.canDrop = canDrop;

ODRules.prototype.canCreate = canCreate;

ODRules.prototype.canReplace = canReplace;

ODRules.prototype.canResize = canResize;

ODRules.prototype.canCopy = canCopy;

/**
 * Utility functions for rule checking
 */

function isSame(a, b) {
  return a === b;
}

function getParents(element) {

  var parents = [];

  while (element) {
    element = element.parent;

    if (element) {
      parents.push(element);
    }
  }

  return parents;
}

function isParent(possibleParent, element) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function isGroup(element) {
  return is(element, 'od:Group') && !element.labelTarget;
}

/**
 * Checks if given element can be used for starting connection.
 *
 * @param  {Element} element
 * @return {boolean}
 */
function canStartConnection(element) {
  if (nonExistingOrLabel(element)) {
    return null;
  }

  return is(element,
    'od:Object'
  );
}

function nonExistingOrLabel(element) {
  return !element || isLabel(element);
}


function canConnect(source, target) {
  if (nonExistingOrLabel(source) || nonExistingOrLabel(target)) {
    return null;
  }
  if (canConnectLink(source, target)) {
    return { type: 'od:Link' };
  }
  return false;
}

function canConnectLink(source, target) {
  return is(source, 'od:Object') && is(target, 'od:Object');
}

/**
 * Can an element be dropped into the target element
 *
 * @return {Boolean}
 */
function canDrop(element, target) {

  // can move labels
  if (isLabel(element) || isGroup(element)) {
    return true;
  }

  // drop board elements onto boards
  return is(element, 'od:BoardElement') && is(target, 'od:OdBoard');
}

function canReplace(elements, target) {
  return target;
}


function canAttach(elements, target) {

  if (!Array.isArray(elements)) {
    elements = [ elements ];
  }

  // only (re-)attach one element at a time
  if (elements.length !== 1) {
    return false;
  }

  var element = elements[0];

  // do not attach labels
  if (isLabel(element)) {
    return false;
  }

  if (is(target, 'od:BoardElement')) {
    return false;
  }

  return 'attach';
}


function canMove(elements, target) {

  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  return elements.every(function(element) {
    return canDrop(element, target);
  });
}

function canCreate(shape, target, source, position) {

  if (!target) {
    return false;
  }

  if (isLabel(shape) || isGroup(shape)) {
    return true;
  }

  if (isSame(source, target)) {
    return false;
  }

  // ensure we do not drop the element
  // into source
  if (source && isParent(source, target)) {
    return false;
  }

  return canDrop(shape, target, position);
}

function canResize(shape, newBounds) {
  if (isAny(shape, [ 'od:Object' ])) {
    return !newBounds || (newBounds.width >= 50 && newBounds.height >= 50);
  }
  return false;
}

function canCopy(elements, element) {
  return true;
}
