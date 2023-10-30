import inherits from "inherits-browser";

import CoreModule from "object-diagram-modeler/lib/core";
import TranslateModule from "diagram-js/lib/i18n/translate";
import SelectionModule from "diagram-js/lib/features/selection";
import OverlaysModule from "diagram-js/lib/features/overlays";
import WebsocketConnectorModule from "./websocket";

import BaseViewer from "object-diagram-modeler/lib/BaseViewer";
import Modeler from "../../lib/Modeler";

export default function Debugger(options) {
  BaseViewer.call(this, options);
}

inherits(Debugger, BaseViewer);

// modules the viewer is composed of
Debugger.prototype._modules =
    Modeler.prototype._interactionModules.concat([
      CoreModule,
      TranslateModule,
      SelectionModule,
      OverlaysModule,
      WebsocketConnectorModule
    ]);

// default moddle extensions the viewer is composed of
Debugger.prototype._moddleExtensions = {};
