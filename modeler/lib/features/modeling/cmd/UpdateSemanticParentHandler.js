export default function UpdateSemanticParentHandler(odUpdater) {
  this._odUpdater = odUpdater;
}

UpdateSemanticParentHandler.$inject = [ 'odUpdater' ];


UpdateSemanticParentHandler.prototype.execute = function(context) {
  var dataStoreBo = context.dataStoreBo,
      newSemanticParent = context.newSemanticParent,
      newDiParent = context.newDiParent;

  context.oldSemanticParent = dataStoreBo.$parent;
  context.oldDiParent = dataStoreBo.di.$parent;

  // update semantic parent
  this._odUpdater.updateSemanticParent(dataStoreBo, newSemanticParent);

  // update DI parent
  this._odUpdater.updateDiParent(dataStoreBo.di, newDiParent);
};

UpdateSemanticParentHandler.prototype.revert = function(context) {
  var dataStoreBo = context.dataStoreBo,
      oldSemanticParent = context.oldSemanticParent,
      oldDiParent = context.oldDiParent;

  // update semantic parent
  this._odUpdater.updateSemanticParent(dataStoreBo, oldSemanticParent);

  // update DI parent
  this._odUpdater.updateDiParent(dataStoreBo.di, oldDiParent);
};

