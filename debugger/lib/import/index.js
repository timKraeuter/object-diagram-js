import translate from 'diagram-js/lib/i18n/translate';

import OdImporter from './OdImporter';

export default {
  __depends__: [
    translate
  ],
  odImporter: [ 'type', OdImporter ]
};