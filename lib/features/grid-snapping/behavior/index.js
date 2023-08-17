import AutoPlaceBehavior from './AutoPlaceBehavior';
import LayoutConnectionBehavior from './LayoutConnectionBehavior';

export default {
  __init__: [
    'gridSnappingAutoPlaceBehavior',
    'gridSnappingLayoutConnectionBehavior',
  ],
  gridSnappingAutoPlaceBehavior: [ 'type', AutoPlaceBehavior ],
  gridSnappingLayoutConnectionBehavior: [ 'type', LayoutConnectionBehavior ]
};