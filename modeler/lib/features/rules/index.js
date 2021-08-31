import RulesModule from 'diagram-js/lib/features/rules';

import ODRules from './ODRules';

export default {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'odRules' ],
  odRules: [ 'type', ODRules ]
};
