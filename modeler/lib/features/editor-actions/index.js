import EditorActionsModule from 'diagram-js/lib/features/editor-actions';

import ODEditorActions from './ODEditorActions';

export default {
  __depends__: [
    EditorActionsModule
  ],
  editorActions: [ 'type', ODEditorActions ]
};
