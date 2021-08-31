import ODRenderer from './ODRenderer';
import TextRenderer from './TextRenderer';

export default {
  __init__: [ 'odRenderer' ],
  odRenderer: [ 'type', ODRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
