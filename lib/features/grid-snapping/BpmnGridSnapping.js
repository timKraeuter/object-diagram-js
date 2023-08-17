export default function BpmnGridSnapping(eventBus) {
  eventBus.on([
    'create.init',
    'shape.move.init'
  ], function(event) {
    var context = event.context;

    if (!context.gridSnappingContext) {
      context.gridSnappingContext = {};
    }

    context.gridSnappingContext.snapLocation = 'top-left';
  });
}

BpmnGridSnapping.$inject = [ 'eventBus' ];