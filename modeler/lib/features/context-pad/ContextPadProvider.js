import {
  assign,
  isArray,
} from 'min-dash';

import {
  hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';


/**
 * A provider for od elements context pad.
 */
export default function ContextPadProvider(
    config, injector, eventBus, connect, create,
    elementFactory, contextPad, modeling, rules,
    translate) {

  config = config || {};

  contextPad.registerProvider(this);

  this._connect = connect;
  this._create = create;
  this._elementFactory = elementFactory;
  this._contextPad = contextPad;

  this._modeling = modeling;

  this._rules = rules;
  this._translate = translate;

  if (config.autoPlace !== false) {
    this._autoPlace = injector.get('autoPlace', false);
  }

  eventBus.on('create.end', 250, function(event) {
    let context = event.context,
        shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    let entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });
}

ContextPadProvider.$inject = [
  'config.contextPad',
  'injector',
  'eventBus',
  'connect',
  'create',
  'elementFactory',
  'contextPad',
  'modeling',
  'rules',
  'translate'
];


ContextPadProvider.prototype.getContextPadEntries = function(element) {

  const {
    _rules: rules,
    _modeling: modeling,
    _translate: translate,
    _connect: connect,
    _elementFactory: elementFactory,
    _autoPlace: autoPlace,
    _create: create
  } = this;

  let actions = {};

  if (element.type === 'label') {
    return actions;
  }

  createDeleteEntry(actions);
  if (element.type === 'od:Object') {
    createLinkObjectsEntry(actions);
    createLinkNewObjectEntry(actions);
  }

  if (element.type === 'od:Link') {
    assign(actions, {
      'change-source-relation-1': {
        group: 'change-source-relation',
        className: 'bpmn-icon-connection',
        title: 'Change source relation to "default"',
        action: {
          click: () => {
            modeling.updateProperties(element, { sourceRelation: 'default' });
          }
        }
      }
    });

    assign(actions, {
      'change-source-relation-2': {
        group: 'change-source-relation',
        className: 'bpmn-icon-connection',
        title: 'Change source relation to "one-or-many"',
        action: {
          click: () => {
            modeling.updateProperties(element, { sourceRelation: 'one-or-many' });
          }
        }
      }
    });

    assign(actions, {
      'change-source-relation-3': {
        group: 'change-source-relation',
        className: 'bpmn-icon-connection',
        title: 'Change source relation to "zero-or-many"',
        action: {
          click: () => {
            modeling.updateProperties(element, { sourceRelation: 'zero-or-many' });
          }
        }
      }
    });

    assign(actions, {
      'change-source-relation-4': {
        group: 'change-source-relation',
        className: 'bpmn-icon-connection',
        title: 'Change source relation to "one"',
        action: {
          click: () => {
            modeling.updateProperties(element, { sourceRelation: 'one' });
          }
        }
      }
    });

    assign(actions, {
      'change-source-relation-5': {
        group: 'change-source-relation',
        className: 'bpmn-icon-connection',
        title: 'Change source relation to "zero-or-one"',
        action: {
          click: () => {
            modeling.updateProperties(element, { sourceRelation: 'zero-or-one' });
          }
        }
      }
    });

    assign(actions, {
      'change-target-relation-1': {
        group: 'change-target-relation',
        className: 'bpmn-icon-connection',
        title: 'Change target relation to "default"',
        action: {
          click: () => {
            modeling.updateProperties(element, { targetRelation: 'default' });
          }
        }
      }
    });

    assign(actions, {
      'change-target-relation-2': {
        group: 'change-target-relation',
        className: 'bpmn-icon-connection',
        title: 'Change target relation to "one-or-many"',
        action: {
          click: () => {
            modeling.updateProperties(element, { targetRelation: 'one-or-many' });
          }
        }
      }
    });

    assign(actions, {
      'change-target-relation-3': {
        group: 'change-target-relation',
        className: 'bpmn-icon-connection',
        title: 'Change target relation to "zero-or-many"',
        action: {
          click: () => {
            modeling.updateProperties(element, { targetRelation: 'zero-or-many' });
          }
        }
      }
    });

    assign(actions, {
      'change-target-relation-4': {
        group: 'change-target-relation',
        className: 'bpmn-icon-connection',
        title: 'Change target relation to "one"',
        action: {
          click: () => {
            modeling.updateProperties(element, { targetRelation: 'one' });
          }
        }
      }
    });

    assign(actions, {
      'change-target-relation-5': {
        group: 'change-target-relation',
        className: 'bpmn-icon-connection',
        title: 'Change target relation to "zero-or-one"',
        action: {
          click: () => {
            modeling.updateProperties(element, { targetRelation: 'zero-or-one' });
          }
        }
      }
    });
  }

  return actions;

  function removeElement() {
    modeling.removeElements([ element ]);
  }

  function createDeleteEntry(actions) {

    // delete element entry, only show if allowed by rules
    let deleteAllowed = rules.allowed('elements.delete', { elements: [ element ] });

    if (isArray(deleteAllowed)) {

      // was the element returned as a deletion candidate?
      deleteAllowed = deleteAllowed[0] === element;
    }

    if (deleteAllowed) {
      assign(actions, {
        'delete': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: translate('Remove'),
          action: {
            click: removeElement
          }
        }
      });
    }
  }

  function startConnect(event, element) {
    connect.start(event, element);
  }

  function createLinkObjectsEntry(actions) {
    assign(actions, {
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection',
        title: 'Link object to other objects',
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  function createLinkNewObjectEntry(actions) {
    assign(actions, {
      'append.append-task': appendAction(
        'od:Object',
        'od-no-font-icon-object',
        translate('Link with new object')
      ),
    });
  }

  /**
   * Create an append action
   *
   * @param {string} type
   * @param {string} className
   * @param {string} [title]
   * @param {Object} [options]
   *
   * @return {Object} descriptor
   */
  function appendAction(type, className, title, options) {

    if (typeof title !== 'string') {
      options = title;
      title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
    }

    function appendStart(event, element) {

      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape, {
        source: element
      });
    }


    var append = autoPlace ? function(event, element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      autoPlace.append(element, shape);
    } : appendStart;


    return {
      group: 'model',
      className: className,
      title: title,
      action: {
        dragstart: appendStart,
        click: append
      }
    };
  }
};
