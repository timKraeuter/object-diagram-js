import OdTreeWalker from './OdTreeWalker';

/**
 * The importodDiagram result.
 *
 * @typedef {Object} importodDiagramResult
 *
 * @property {Array<string>} warnings
 */

/**
* The importodDiagram error.
*
* @typedef {Error} importodDiagramError
*
* @property {Array<string>} warnings
*/

/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param  {djs.Diagram} diagram
 * @param  {ModdleElement<Definitions>} definitions
 * @param  {ModdleElement<OdRootBoard>} [rootBoard] the diagram to be rendered
 * (if not provided, the first one will be rendered)
 *
 * Returns {Promise<importodDiagramResult, importodDiagramError>}
 */
export function importOdDiagram(diagram, definitions, rootBoard) {

  var importer,
      eventBus,
      translate;

  var error,
      warnings = [];

  /**
   * Walk the diagram semantically, importing (=drawing)
   * all elements you encounter.
   *
   * @param {ModdleElement<Definitions>} definitions
   * @param {ModdleElement<OdRootBoard>} rootBoard
   */
  function render(definitions, rootBoard) {

    var visitor = {

      root: function(element) {
        return importer.add(element);
      },

      element: function(element, parentShape) {
        return importer.add(element, parentShape);
      },

      error: function(message, context) {
        warnings.push({ message: message, context: context });
      }
    };

    var walker = new OdTreeWalker(visitor, translate);

    // traverse xml document model,
    // starting at definitions
    walker.handleDefinitions(definitions, rootBoard);
  }

  return new Promise(function(resolve, reject) {
    try {
      importer = diagram.get('odImporter');
      eventBus = diagram.get('eventBus');
      translate = diagram.get('translate');

      eventBus.fire('import.render.start', { definitions: definitions });

      render(definitions, rootBoard);

      eventBus.fire('import.render.complete', {
        error: error,
        warnings: warnings
      });

      return resolve({ warnings: warnings });
    } catch (e) {
      return reject(e);
    }
  });
}