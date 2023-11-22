import "object-diagram-modeler/assets/odm.css";
import ODDebugger from "./Debugger";

import {
  currentStep,
  next,
  previous,
  saveDebugStep,
  savedDebugSteps,
  updateDebugStep,
  saveConfig,
  getConfig,
} from "./stepHistory/DebugHistory.js";
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
  const currentStepData = savedDebugSteps[currentStep];
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
  if (currentStep === 0) {
    odDebugger._emit("debugger.loadChildren", event);
  }
});

function colorDifference(last, current) {
  const delta = diff(last, current);

  const modeling = odDebugger.get("modeling");
  const registry = odDebugger.get("elementRegistry");

  const addedElements = Object.keys(delta._added).map((key) =>
    registry.get(key),
  );
  modeling.setColor(addedElements, {
    fill: "#158311",
    stroke: "#158311",
  });

  const changedElements = Object.keys(delta._changed).map((key) =>
    registry.get(key),
  );
  modeling.setColor(changedElements, {
    fill: "#e76e09",
    stroke: "#e76e09",
  });

  odDebugger.saveXML({ format: true }).then((result) => {
    updateDebugStep(result);
  });
}

function isNotEmptyBoard(board) {
  return Object.keys(board).length > 0;
}

odDebugger.on("debugger.data.new", (event) => {
  odDebugger.importXML(event.xml).then(() => {
    if (getConfig().coloredDiff && isNotEmptyBoard(event.lastBoard)) {
      colorDifference(event.lastBoard, event.currentBoard);
    }
  });

  saveDebugStep(event);
});

odDebugger.on("debugger.data.update", (event) => {
  odDebugger.importXML(event.xml);
  updateDebugStep(event);
});

odDebugger.on("debugger.config", (event) => {
  saveConfig(event);
});

document.addEventListener(
  "keyup",
  (event) => {
    if (event.code === "ArrowRight") {
      next(odDebugger);
    }
    if (event.code === "ArrowLeft") {
      previous(odDebugger);
    }
  },
  false,
);

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
