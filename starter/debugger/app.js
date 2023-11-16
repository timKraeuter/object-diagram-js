import $ from "jquery";

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
} from "./stepHistory/debugHistory.js";

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
$(function () {
  const downloadLink = $("#js-download-board");
  const downloadSvgLink = $("#js-download-svg");

  $(".buttons a").click(function (e) {
    if (!$(this).is(".active")) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    const encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass("active").attr({
        href: "data:application/xml;charset=UTF-8," + encodedData,
        download: name,
      });
    } else {
      link.removeClass("active");
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

  odDebugger.on("debugger.data.new", (event) => {
    odDebugger.importXML(event.xml);
    saveDebugStep(event);
  });

  odDebugger.on("debugger.data.update", (event) => {
    odDebugger.importXML(event.xml);
    updateDebugStep(event);
  });

  odDebugger.on("debugger.config", (event) => {
    saveConfig(event);
  });
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

const previousDebugState = $("#previous-state");
const nextDebugState = $("#next-state");

previousDebugState.on("click", () => previous(odDebugger));
nextDebugState.on("click", () => next(odDebugger));

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
