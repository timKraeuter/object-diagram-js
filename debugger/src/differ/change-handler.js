function isAny(element, types) {
  return types.some(function (t) {
    return element.$type === t;
  });
}

function isTracked(element) {
  if (isAny(element, ["od:Link", "od:Object", "od:OdBoard"])) {
    return {
      element: element,
      property: "",
    };
  }
}

export default function ChangeHandler() {
  this._changed = {};
  this._removed = {};
  this._added = {};
}

ChangeHandler.prototype.removed = function (model, property, element, idx) {
  let tracked;

  if ((tracked = isTracked(element))) {
    if (!this._removed[tracked.element.id]) {
      this._removed[tracked.element.id] = element;
    }
  } else if ((tracked = isTracked(model))) {
    this.changed(
      tracked.element,
      tracked.property + property + "[" + idx + "]",
      null,
      element,
    );
  }
};

ChangeHandler.prototype.changed = function (
  model,
  property,
  newValue,
  oldValue,
) {
  let tracked;

  if ((tracked = isTracked(model))) {
    let changed = this._changed[tracked.element.id];

    if (!changed) {
      changed = this._changed[tracked.element.id] = { model: model, attrs: {} };
    }

    if (oldValue !== undefined || newValue !== undefined) {
      changed.attrs[property] = { oldValue: oldValue, newValue: newValue };
    }
  }
};

ChangeHandler.prototype.added = function (model, property, element, idx) {
  let tracked;

  if ((tracked = isTracked(element))) {
    if (!this._added[tracked.element.id]) {
      this._added[tracked.element.id] = element;
    }
  } else if ((tracked = isTracked(model))) {
    this.changed(
      tracked.element,
      tracked.property + property + "[" + idx + "]",
      element,
      null,
    );
  }
};

ChangeHandler.prototype.moved = function (model, property, oldIndex, newIndex) {
  // noop
};
