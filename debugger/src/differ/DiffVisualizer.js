"use strict";

const DIFF = "diff";

export default function visualizeChanges(odDebugger, added, changed) {
  visualizeAdded(odDebugger, added);
  visualizeChanged(odDebugger, changed);
}

function visualizeChanged(odDebugger, changed) {
  const registry = odDebugger.get("elementRegistry");
  const changedElements = changed.map((value) => registry.get(value));

  const modeling = odDebugger.get("modeling");
  modeling.setColor(changedElements, {
    fill: "#ef944e",
    stroke: "#ef944e",
  });
  addOverlaysChanged(odDebugger, changed);
}

function addOverlaysChanged(odDebugger, lastChanged) {
  const overlays = odDebugger.get("overlays");
  // Add overlays to objects but not links
  lastChanged
    .filter((element) => !element.includes("Link"))
    .forEach((element) =>
      overlays.add(element, DIFF, {
        position: {
          top: -12,
          right: 12,
        },
        html: '<span class="marker marker-changed ojs-general-icon"></span>',
      }),
    );
}

function visualizeAdded(odDebugger, added) {
  const registry = odDebugger.get("elementRegistry");
  const lastAddedElements = added.map((value) => registry.get(value));

  const modeling = odDebugger.get("modeling");
  modeling.setColor(lastAddedElements, {
    fill: "#54B415",
    stroke: "#54B415",
  });
  addOverlaysAdded(odDebugger, added);
}

function addOverlaysAdded(odDebugger, lastAdded) {
  const overlays = odDebugger.get("overlays");
  // Add overlays to objects but not links
  lastAdded
    .filter((element) => !element.includes("Link"))
    .forEach((element) =>
      overlays.add(element, DIFF, {
        position: {
          top: -10,
          right: 10,
        },
        html: '<span class="marker marker-added ojs-general-icon"></span>',
      }),
    );
}
