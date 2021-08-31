import {
  assign, map, pick,
} from 'min-dash';

import {
  isAny
} from './util/ModelingUtil';

import {
  is
} from '../../util/ModelUtil';


export default function ODFactory(moddle) {
  this._model = moddle;
}

ODFactory.$inject = [ 'moddle' ];


ODFactory.prototype._needsId = function(element) {
  return isAny(element, [
    'od:BoardElement'
  ]);
};

ODFactory.prototype._ensureId = function(element) {

  // generate semantic ids for elements
  // od:Object -> Object_ID
  var prefix;

  if (is(element, 'od:Object')) {
    prefix = 'Object';
  } else {
    prefix = (element.$type || '').replace(/^[^:]*:/g, '');
  }

  prefix += '_';

  if (!element.id && this._needsId(element)) {
    element.id = this._model.ids.nextPrefixed(prefix, element);
  }
};


ODFactory.prototype.create = function(type, attrs) {
  var element = this._model.create(type, attrs || {});

  this._ensureId(element);

  return element;
};


ODFactory.prototype.createDiLabel = function() {
  return this.create('odDi:OdLabel', {
    bounds: this.createDiBounds()
  });
};


ODFactory.prototype.createDiShape = function(semantic, bounds, attrs) {

  return this.create('odDi:OdShape', assign({
    boardElement: semantic,
    bounds: this.createDiBounds(bounds)
  }, attrs));
};


ODFactory.prototype.createDiBounds = function(bounds) {
  return this.create('dc:Bounds', bounds);
};

ODFactory.prototype.createDiEdge = function(semantic, waypoints, attrs) {
  return this.create('odDi:Link', assign({
    boardElement: semantic
  }, attrs));
};


ODFactory.prototype.createDiPlane = function(semantic) {
  return this.create('odDi:OdPlane', {
    boardElement: semantic
  });
};

ODFactory.prototype.createDiWaypoints = function(waypoints) {
  var self = this;

  return map(waypoints, function(pos) {
    return self.createDiWaypoint(pos);
  });
};

ODFactory.prototype.createDiWaypoint = function(point) {
  return this.create('dc:Point', pick(point, [ 'x', 'y' ]));
};