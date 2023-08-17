import AutoPlaceModule from 'diagram-js/lib/features/auto-place';

import ODAutoPlace from './ODAutoPlace';

export default {
  __depends__: [ AutoPlaceModule ],
  __init__: [ 'odAutoPlace' ],
  odAutoPlace: [ 'type', ODAutoPlace ]
};