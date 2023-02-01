import inherits from 'inherits-browser';

import BaseModeler from './BaseModeler';

import Viewer from './Viewer';
import NavigatedViewer from './NavigatedViewer';

import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import TouchModule from 'diagram-js/lib/navigation/touch';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';

import DirectEditingModule from 'diagram-js-direct-editing';
import AlignElementsModule from 'diagram-js/lib/features/align-elements';
import AutoScrollModule from 'diagram-js/lib/features/auto-scroll';
import BendpointsModule from 'diagram-js/lib/features/bendpoints';
import WebsocketConnectorModule from './websocket';
import ConnectModule from 'diagram-js/lib/features/connect';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import CopyPasteModule from './features/copy-paste';
import CreateModule from 'diagram-js/lib/features/create';
import EditorActionsModule from './features/editor-actions';
import GridSnappingModule from './features/grid-snapping';
import KeyboardModule from './features/keyboard';
import AutoplaceModule from './features/auto-place';
import KeyboardMoveSelectionModule from 'diagram-js/lib/features/keyboard-move-selection';
import ModelingModule from './features/modeling';
import MoveModule from 'diagram-js/lib/features/move';
import ResizeModule from 'diagram-js/lib/features/resize';
import SnappingModule from './features/snapping';

export default function Modeler(options) {
  BaseModeler.call(this, options);
}

inherits(Modeler, BaseModeler);


Modeler.Viewer = Viewer;
Modeler.NavigatedViewer = NavigatedViewer;

Modeler.prototype._interactionModules = [

  // non-modeling components
  KeyboardMoveModule,
  DirectEditingModule,
  MoveCanvasModule,
  TouchModule,
  ZoomScrollModule
];

Modeler.prototype._modelingModules = [

  // modeling components
  AutoplaceModule,
  AlignElementsModule,
  AutoScrollModule,
  BendpointsModule,
  ConnectModule,
  ConnectionPreviewModule,
  CopyPasteModule,
  CreateModule,
  EditorActionsModule,
  GridSnappingModule,
  KeyboardModule,
  KeyboardMoveSelectionModule,
  ModelingModule,
  MoveModule,
  ResizeModule,
  SnappingModule,
  WebsocketConnectorModule
];


// modules the modeler is composed of
//
// - viewer modules
// - interaction modules
// - modeling modules

Modeler.prototype._modules = [].concat(
  Viewer.prototype._modules,
  Modeler.prototype._interactionModules,
  Modeler.prototype._modelingModules
);
