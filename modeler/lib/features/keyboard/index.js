import KeyboardModule from 'diagram-js/lib/features/keyboard';

import ODKeyboardBindings from './ODKeyboardBindings';

export default {
  __depends__: [
    KeyboardModule
  ],
  __init__: [ 'keyboardBindings' ],
  keyboardBindings: [ 'type', ODKeyboardBindings ]
};
