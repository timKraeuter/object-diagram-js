import inherits from 'inherits';

import CreateMoveSnapping from 'diagram-js/lib/features/snapping/CreateMoveSnapping';

/**
 * Snap during create and move.
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function ODCreateMoveSnapping(injector) {
  injector.invoke(CreateMoveSnapping, this);
}

inherits(ODCreateMoveSnapping, CreateMoveSnapping);

ODCreateMoveSnapping.$inject = [
  'injector'
];

ODCreateMoveSnapping.prototype.initSnap = function(event) {
  return CreateMoveSnapping.prototype.initSnap.call(this, event);
};

ODCreateMoveSnapping.prototype.addSnapTargetPoints = function(snapPoints, shape, target) {
  return CreateMoveSnapping.prototype.addSnapTargetPoints.call(this, snapPoints, shape, target);
};

ODCreateMoveSnapping.prototype.getSnapTargets = function(shape, target) {
  return CreateMoveSnapping.prototype.getSnapTargets.call(this, shape, target);
};
