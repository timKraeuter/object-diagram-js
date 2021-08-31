import BehaviorModule from './behavior';
import RulesModule from '../rules';
import DiOrderingModule from '../di-ordering';
import OrderingModule from '../ordering';

import CommandModule from 'diagram-js/lib/command';
import TooltipsModule from 'diagram-js/lib/features/tooltips';
import LabelSupportModule from 'diagram-js/lib/features/label-support';
import AttachSupportModule from 'diagram-js/lib/features/attach-support';
import SelectionModule from 'diagram-js/lib/features/selection';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import SpaceToolModule from 'diagram-js/lib/features/space-tool';

import ODFactory from './ODFactory';
import ODUpdater from './ODUpdater';
import ElementFactory from './ElementFactory';
import Modeling from './Modeling';
import ODLayouter from './ODLayouter';
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';


export default {
  __init__: [
    'modeling',
    'odUpdater'
  ],
  __depends__: [
    BehaviorModule,
    RulesModule,
    DiOrderingModule,
    OrderingModule,
    CommandModule,
    TooltipsModule,
    LabelSupportModule,
    AttachSupportModule,
    SelectionModule,
    ChangeSupportModule,
    SpaceToolModule
  ],
  odFactory: [ 'type', ODFactory ],
  odUpdater: [ 'type', ODUpdater ],
  elementFactory: [ 'type', ElementFactory ],
  modeling: [ 'type', Modeling ],
  layouter: [ 'type', ODLayouter ],
  connectionDocking: [ 'type', CroppingConnectionDocking ]
};