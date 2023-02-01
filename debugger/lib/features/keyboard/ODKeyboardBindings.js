import inherits from 'inherits-browser';

import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings';


/**
 * OD specific keyboard bindings.
 *
 * @param {Injector} injector
 */
export default function ODKeyboardBindings(injector) {
  injector.invoke(KeyboardBindings, this);
}

inherits(ODKeyboardBindings, KeyboardBindings);

ODKeyboardBindings.$inject = [
  'injector'
];


/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
ODKeyboardBindings.prototype.registerBindings = function(keyboard, editorActions) {

  // Remove some actions, such that they are not inherited.
  editorActions.unregister('removeSelection');
  editorActions.unregister('undo');
  editorActions.unregister('redo');
  editorActions.unregister('copy');
  editorActions.unregister('paste');

  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions);

  /**
   * Add keyboard binding if respective editor action
   * is registered.
   *
   * @param {String} action name
   * @param {Function} fn that implements the key binding
   */
  function addListener(action, fn) {

    if (editorActions.isRegistered(action)) {
      keyboard.addListener(fn);
    }
  }

  // select all elements
  // CTRL + A
  addListener('selectElements', function(context) {

    var event = context.keyEvent;

    if (keyboard.isKey([ 'a', 'A' ], event) && keyboard.isCmd(event)) {
      editorActions.trigger('selectElements');

      return true;
    }
  });
};