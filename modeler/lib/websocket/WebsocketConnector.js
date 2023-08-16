import Moddle from '../moddle';
import ELK from 'elkjs/lib/elk.bundled.js';

// Rename this to debug api client or something
const websocket_url = 'ws://localhost:8071/debug';
export default function WebsocketConnector(eventBus) {

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', event => {
    if (event.element && event.element.type === 'od:Object') {

      // Load children of object on dblclick
      this.sendMessage(event.element.id);
    }
  });

  // Open websocket
  this.webSocket = new WebSocket(websocket_url);
  this.webSocket.onopen = () => {
    console.log('Connected to debug API.');
  };
  this.webSocket.onerror = () => {
    console.log('Connection to websocket debug API with url "' + websocket_url + '" failed.');
  };
  this.setOnMessageHandler(eventBus, {});
}
WebsocketConnector.prototype.$inject = [
  'eventBus'
];

const OBJECT_FONT_SIZE = '19.2px'; // 16px * 1.2 = 19.2px (Objects)
const LINK_FONT_SIZE = '18px'; // 15px * 1.2 = 18px (Objects)

WebsocketConnector.prototype.setOnMessageHandler = function(eventBus, lastBoard) {
  function mapSemantic(moddle, apiData) {
    let board = moddle.create('od:OdBoard');
    board.id = 'Board_debug';

    let boardElements = board.get('boardElements');

    // Map objects
    let objects = apiData.rootElement.get('object');
    let objectMap = {};
    objects.forEach(object => {
      let mapped_object = moddle.create('od:Object');
      boardElements.push(mapped_object);
      mapped_object.id = object.id;
      objectMap[mapped_object.id] = mapped_object;

      // Could do this when rendering as well and keep the full information here
      mapped_object.name = object.variableName + ':' + object.type.substring(object.type.lastIndexOf('.') + 1);


      // Map attribute values.
      mapped_object.attributeValues = '';
      if (object.attributeValue) {
        object.attributeValue.forEach(attribute => {
          mapped_object.attributeValues += attribute.name + '=' + attribute.value;
          mapped_object.attributeValues += '\n';
        });

        // removed the unwanted \n at the end.
        mapped_object.attributeValues = mapped_object.attributeValues.substring(0, mapped_object.attributeValues.length - 1);
      }
    });

    // Map links
    let links = apiData.rootElement.get('link');
    links.forEach(link => {
      let mapped_link = moddle.create('od:Link');
      mapped_link.id = link.id;
      mapped_link.name = link.type;
      mapped_link.type = link.type;
      mapped_link.sourceRef = objectMap[link.from.id];
      mapped_link.targetRef = objectMap[link.to.id];

      objectMap[link.from.id].get('links').push(mapped_link);
      boardElements.push(mapped_link);
    });

    // Map primitive root values
    const primitiveRootValus = apiData.rootElement.get('primitiveRootValue');
    if (primitiveRootValus && primitiveRootValus.length > 0) {
      let local_primitive_vars = moddle.create('od:Object');
      local_primitive_vars.id = 'LocalPrimitiveVars';
      local_primitive_vars.name = 'LocalPrimitiveVars';
      boardElements.push(local_primitive_vars);

      local_primitive_vars.attributeValues = '';
      primitiveRootValus.forEach(primitiveVar => {
        local_primitive_vars.attributeValues += primitiveVar.variableName + '=' + primitiveVar.value;
        local_primitive_vars.attributeValues += '\n';
      });

      // removed the unwanted \n at the end.
      local_primitive_vars.attributeValues = local_primitive_vars.attributeValues.substring(0, local_primitive_vars .attributeValues.length - 1);
    }

    return board;
  }

  async function addLayoutInformation(moddle, definitions, board) {

    // use elk for layouting
    const elk_graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
        'elk.layered.spacing.edgeNodeBetweenLayers': 25
      },
      children: [],
      edges: []
    };

    function getTextWidth(text, fontSize) {
      let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
      let context = canvas.getContext('2d');
      context.font = fontSize + ' IBM Plex Sans';
      let metrics = context.measureText(text);
      return Math.ceil(metrics.width);
    }

    function calcObjectWidth(object) {

      // use the width of the longest name or attribute for every object.
      const nameWidth = getTextWidth(object.name, OBJECT_FONT_SIZE);
      const attributeWidth = calcAttributeWidth(object);

      let width;
      if (nameWidth >= attributeWidth) {
        width = nameWidth;
      } else {
        width = attributeWidth;
      }

      // We add 10px of breathing room.
      return width + 10;
    }

    function calcAttributeWidth(object) {
      return Math.max.apply(
        Math,
        object.get('attributeValues').split(/\r\n|\r|\n/).map(singleAttribute => getTextWidth(singleAttribute, OBJECT_FONT_SIZE)));
    }

    function calcObjectHeight(object) {

      // Calculate number of lines by splitting at \n.
      let numberOfLines = object.get('attributeValues').split(/\r\n|\r|\n/).length;

      // The line height is 19.2px.
      let height = numberOfLines * 19.2;
      if (height === 0) {

        // 30px titel and 30px empty attributes.
        return 60;
      }

      // The titel is 30 px and we add some breathing room of 10px.
      return height + 30 + 10;
    }

    // Sort so the layout is deterministic.
    board.get('boardElements').sort((a, b) => a.id.localeCompare(b.id));
    board.get('boardElements').forEach(linkOrObject => {
      if (linkOrObject.$type === 'od:Object') {
        elk_graph.children.push({
          id: linkOrObject.id,
          width: calcObjectWidth(linkOrObject),
          height: calcObjectHeight(linkOrObject),
          boardElement: linkOrObject
        });
      } else {
        elk_graph.edges.push({
          id: linkOrObject.id,
          sources: [ linkOrObject.sourceRef.id ],
          targets: [ linkOrObject.targetRef.id ],
          labels: [
            {
              text: linkOrObject.name,
              width: getTextWidth(linkOrObject.name, LINK_FONT_SIZE),
              height: 18
            } ],
          boardElement: linkOrObject
        });
      }
    });

    const elk = new ELK();
    const layout = await elk.layout(elk_graph);

    let di_board = moddle.create('odDi:OdRootBoard');
    di_board.id = 'RootBoard_debug';
    definitions.get('rootBoards').push(di_board);

    di_board.plane = moddle.create('odDi:OdPlane');
    di_board.plane.id = 'Plane_debug';
    di_board.plane.boardElement = board;

    layout.children.forEach(object => {

      // Create a shape for each object
      let objectShape = moddle.create('odDi:OdShape');
      objectShape.boardElement = object.boardElement;
      objectShape.id = object.id + '_di';

      let shapeBounds = moddle.create('dc:Bounds');
      shapeBounds.width = object.width;
      shapeBounds.height = object.height;
      shapeBounds.x = object.x;
      shapeBounds.y = object.y;

      objectShape.bounds = shapeBounds;

      di_board.plane.get('planeElement').push(objectShape);
    });

    function createPoint(x, y) {
      let from_waypoint = moddle.create('dc:Point');
      from_waypoint.x = x;
      from_waypoint.y = y;
      return from_waypoint;
    }

    function addLabelInformation(edge, linkShape) {
      var elkLabel = edge.labels[0];
      var label = moddle.create('odDi:OdLabel');
      label.bounds = moddle.create('dc:Bounds');
      label.bounds.x = elkLabel.x;
      label.bounds.y = elkLabel.y;
      label.bounds.width = elkLabel.width;
      label.bounds.height = elkLabel.height;
      linkShape.label = label;
    }

    layout.edges.forEach(edge => {
      let linkShape = moddle.create('odDi:Link');
      linkShape.boardElement = edge.boardElement;
      linkShape.id = edge.id + '_di';
      addLabelInformation(edge, linkShape);

      edge.sections.forEach(section => {
        let startPoint = createPoint(section.startPoint.x, section.startPoint.y);
        linkShape.get('waypoint').push(startPoint);

        if (section.bendPoints) {
          section.bendPoints.forEach(bendPoint => {
            let linkBendPoint = createPoint(bendPoint.x, bendPoint.y);
            linkShape.get('waypoint').push(linkBendPoint);
          });
        }

        let endPoint = createPoint(section.endPoint.x, section.endPoint.y);
        linkShape.get('waypoint').push(endPoint);
      });

      di_board.plane.get('planeElement').push(linkShape);
    });
  }

  function visualizeDebugData(xmlData) {
    const moddle = new Moddle();

    // Parse xml.
    moddle.fromXML(xmlData, 'db:ObjectDiagram')
      .then(async apiData => {

        const definitions = moddle.create('od:Definitions');
        const board = mapSemantic(moddle, apiData);
        definitions.get('rootElements').push(board);
        lastBoard = board;

        await addLayoutInformation(moddle, definitions, board);

        moddle.toXML(definitions).then(xml => {
          eventBus.fire('debugger.data.new', xml);
        });
      })
      .catch(reason => console.log(reason));
  }

  function addLoadedChildrenToVisualization(xmlData) {
    const moddle = new Moddle();

    // Parse xml.
    moddle.fromXML(xmlData, 'db:ObjectDiagram')
      .then(async apiData => {

        const definitions = moddle.create('od:Definitions');
        const board = mapSemantic(moddle, apiData);
        const allBoardElements = board.get('boardElements');

        // Add old board elements to the newly created board.
        lastBoard.get('boardElements').forEach(boardElement => {

          // only add if not contained already
          if (!allBoardElements.some(element => element.id === boardElement.id)) {
            allBoardElements.push(boardElement);
          }
        });

        definitions.get('rootElements').push(board);
        lastBoard = board;

        await addLayoutInformation(moddle, definitions, board);

        moddle.toXML(definitions).then(xml => {
          eventBus.fire('debugger.data.new', xml);
        });
      })
      .catch(reason => console.log(reason));
  }

  this.webSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'error') {
      console.error('Websocket error message received:' + data.content);
      return;
    }
    if (data.type === 'loadChildren') {
      addLoadedChildrenToVisualization(data.content);
      return;
    }
    if (data.type === 'nextDebugStep') {
      visualizeDebugData(data.content);
    }
  };
};

WebsocketConnector.prototype.sendMessage = function(message) {
  this.webSocket.send(message);
};
