import inherits from 'inherits';

import CoreModule from 'object-diagram-js/lib/core';
import TranslateModule from 'diagram-js/lib/i18n/translate';
import SelectionModule from 'diagram-js/lib/features/selection';
import OverlaysModule from 'diagram-js/lib/features/overlays';
import DirectEditingModule from 'diagram-js-direct-editing';
import WebsocketDebugClientModule from './websocket';

import BaseViewer from 'object-diagram-js/lib/BaseViewer';
import Modeler from '../../lib/Modeler';
import ModelingModule from '../../lib/features/modeling';

export default function Debugger(options) {
    BaseViewer.call(this, options);
}

inherits(Debugger, BaseViewer);

Debugger.prototype._modules = Modeler.prototype._interactionModules.concat([
    CoreModule,
    TranslateModule,
    SelectionModule,
    OverlaysModule,
    ModelingModule,
    DirectEditingModule, // Not really needed just to satisfy a dependency of the modeling module
    WebsocketDebugClientModule,
]);
