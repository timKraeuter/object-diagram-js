import diff from "object-diagram-js-differ";
import { updateDebugStep } from "../stepHistory/DebugHistory";

const DIFF = "diff";

export function colorDifference(odDebugger, last, current) {
  const delta = diff(last, current);

  const modeling = odDebugger.get("modeling");
  const registry = odDebugger.get("elementRegistry");
  const overlays = odDebugger.get("overlays");
  overlays.clear();

  const addedElements = Object.keys(delta._added).map((key) =>
    registry.get(key),
  );
  addedElements
    .filter((element) => !element.id.includes("Link"))
    .forEach((element) =>
      overlays.add(element, DIFF, {
        position: {
          top: -10,
          right: 10,
        },
        html: '<span class="marker marker-added"></span>',
      }),
    );

  modeling.setColor(addedElements, {
    fill: "#54B415",
    stroke: "#54B415",
  });

  const changedElements = Object.keys(delta._changed).map((key) =>
    registry.get(key),
  );
  changedElements
    .filter((element) => !element.id.includes("Link"))
    .forEach((element) =>
      overlays.add(element, DIFF, {
        position: {
          top: -12,
          right: 12,
        },
        html: '<span class="marker marker-changed"></span>',
      }),
    );
  modeling.setColor(changedElements, {
    fill: "#ef944e",
    stroke: "#ef944e",
  });

  odDebugger.saveXML({ format: true }).then((result) => {
    updateDebugStep(result);
  });
}
