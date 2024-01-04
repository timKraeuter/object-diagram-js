"use strict";

import "object-diagram-js/assets/object-diagram-js.css";
import ODDebugger from "./Debugger";

import {
  next,
  previous,
  saveDebugStep,
  updateDebugStepXML,
  saveConfig,
  getConfig,
  getCurrentStepData,
  isLastDebugStep,
} from "./stepHistory/DebugHistory.js";

import visualizeChanges from "./differ/DiffVisualizer";
import diff from "object-diagram-js-differ";

// modeler instance
const odDebugger = new ODDebugger({
  container: "#canvas",
  keyboard: {
    bindTo: window,
  },
});

/* screen interaction */
function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

const state = {
  fullScreen: false,
  keyboardHelp: false,
  help: false,
};
document.getElementById("js-edit").addEventListener("click", function () {
  window.open("https://timkraeuter.com/object-diagram-js/");
});
document
  .getElementById("js-toggle-fullscreen")
  .addEventListener("click", function () {
    state.fullScreen = !state.fullScreen;
    if (state.fullScreen) {
      enterFullscreen(document.documentElement);
    } else {
      exitFullscreen();
    }
  });

const embeddedValue = new URLSearchParams(window.location.search).get(
  "embedded",
);
if (embeddedValue === "true") {
  document.getElementById("fullscreen").remove();
}

document
  .getElementById("js-toggle-keyboard-help")
  .addEventListener("click", function () {
    state.keyboardHelp = !state.keyboardHelp;
    let displayProp = "none";
    if (state.keyboardHelp) {
      displayProp = "block";
    }
    document.getElementById("io-dialog-main").style.display = displayProp;
  });
document
  .getElementById("io-dialog-main")
  .addEventListener("click", function () {
    state.keyboardHelp = !state.keyboardHelp;
    let displayProp = "none";
    if (!state.keyboardHelp) {
      document.getElementById("io-dialog-main").style.display = displayProp;
    }
  });
document
  .getElementById("js-toggle-help")
  .addEventListener("click", function () {
    state.help = !state.help;
    let displayProp = "none";
    if (state.help) {
      displayProp = "block";
    }
    document.getElementById("help-dialog-main").style.display = displayProp;
  });
document
  .getElementById("help-dialog-main")
  .addEventListener("click", function () {
    state.help = !state.help;
    let displayProp = "none";
    if (!state.help) {
      document.getElementById("help-dialog-main").style.display = displayProp;
    }
  });

function saveSVG() {
  return odDebugger.saveSVG();
}

function saveBoard() {
  return odDebugger.saveXML({ format: true });
}

// bootstrap board functions
const downloadLink = document.getElementById("js-download-board");
const downloadSvgLink = document.getElementById("js-download-svg");

function setEncoded(link, name, data) {
  const encodedData = encodeURIComponent(data);

  if (data) {
    link.classList.add("active");
    link.setAttribute(
      "href",
      "data:application/xml;charset=UTF-8," + encodedData,
    );
    link.setAttribute("download", name);
  } else {
    link.classList.remove("active");
  }
}

const exportArtifacts = debounce(function () {
  const currentStepData = getCurrentStepData();
  saveSVG().then(function (result) {
    setEncoded(
      downloadSvgLink,
      `${currentStepData.fileName}-${currentStepData.line}.svg`,
      result.svg,
    );
  });

  saveBoard().then(function (result) {
    setEncoded(
      downloadLink,
      `${currentStepData.fileName}-${currentStepData.line}.xml`,
      result.xml,
    );
  });
}, 500);

odDebugger.on("commandStack.changed", exportArtifacts);
odDebugger.on("import.done", exportArtifacts);

// Debugging specific

odDebugger.on("element.dblclick", (event) => {
  if (isLastDebugStep()) {
    odDebugger._emit("debugger.loadChildren", event);
  }
});

function isNotEmptyBoard(board) {
  return Object.keys(board).length > 0;
}

odDebugger.on("debugger.data.new", (event) => {
  odDebugger.importXML(event.xml).then(() => {
    const debugStep = {
      xml: event.xml,
      line: event.line,
      fileName: event.fileName,
      added: [],
      changed: [],
    };
    saveDebugStep(debugStep);
    if (getConfig().coloredDiff && isNotEmptyBoard(event.lastBoard)) {
      const delta = diff(event.lastBoard, event.currentBoard);
      debugStep.added = Object.keys(delta._added);
      debugStep.changed = Object.keys(delta._changed);
      visualizeChanges(odDebugger, debugStep.added, debugStep.changed);
    }
  });
});

odDebugger.on("debugger.data.update", (event) => {
  odDebugger.importXML(event.xml).then(() => {
    updateDebugStepXML(event.xml);
    const currentStepData = getCurrentStepData();
    visualizeChanges(
      odDebugger,
      currentStepData.added,
      currentStepData.changed,
    );
  });
});

odDebugger.on("debugger.config", (event) => {
  saveConfig(event, odDebugger);
});

// Using diagram-js keyboard instead of addEventListener works even in the JCEF embeddedValue browser
const djsKeyboard = odDebugger.get("keyboard");
djsKeyboard.addListener(function (context) {
  const event = context.keyEvent;
  if (djsKeyboard.isKey(["ArrowRight"], event)) {
    next(odDebugger);
    return true;
  }
  if (djsKeyboard.isKey(["ArrowLeft"], event)) {
    previous(odDebugger);
    return true;
  }
});

const previousDebugState = document.getElementById("previous-state");
const nextDebugState = document.getElementById("next-state");

previousDebugState.addEventListener("click", () => previous(odDebugger));
nextDebugState.addEventListener("click", () => next(odDebugger));

// helpers //////////////////////

function debounce(fn, timeout) {
  let timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}
