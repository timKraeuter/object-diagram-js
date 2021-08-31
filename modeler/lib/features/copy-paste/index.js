import CopyPasteModule from 'diagram-js/lib/features/copy-paste';

import ODCopyPaste from './ODCopyPaste';
import ModdleCopy from './ModdleCopy';

export default {
  __depends__: [
    CopyPasteModule
  ],
  __init__: [ 'odCopyPaste', 'moddleCopy' ],
  odCopyPaste: [ 'type', ODCopyPaste ],
  moddleCopy: [ 'type', ModdleCopy ]
};
