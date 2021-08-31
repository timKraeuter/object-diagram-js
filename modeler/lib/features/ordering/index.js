import translate from 'diagram-js/lib/i18n/translate';

import ODOrderingProvider from './ODOrderingProvider';

export default {
  __depends__: [
    translate
  ],
  __init__: [ 'odOrderingProvider' ],
  odOrderingProvider: [ 'type', ODOrderingProvider ]
};