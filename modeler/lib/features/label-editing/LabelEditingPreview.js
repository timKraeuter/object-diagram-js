import {
  remove as svgRemove
} from 'tiny-svg';

var MARKER_HIDDEN = 'djs-element-hidden';


export default function LabelEditingPreview(
    eventBus, canvas) {


  var element, gfx;

  eventBus.on('directEditing.activate', function(context) {
    var activeProvider = context.active;

    element = activeProvider.element.label || activeProvider.element;


    if (element.labelTarget) {
      canvas.addMarker(element, MARKER_HIDDEN);
    }
  });


  eventBus.on([ 'directEditing.complete', 'directEditing.cancel' ], function(context) {
    var activeProvider = context.active;

    if (activeProvider) {
      canvas.removeMarker(activeProvider.element.label || activeProvider.element, MARKER_HIDDEN);
    }

    element = undefined;

    if (gfx) {
      svgRemove(gfx);

      gfx = undefined;
    }
  });
}

LabelEditingPreview.$inject = [
  'eventBus',
  'canvas'
];