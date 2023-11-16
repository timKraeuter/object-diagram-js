import $ from "jquery";

import "object-diagram-modeler/assets/odm.css";
import ODDebugger from "./Debugger";

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
    saveSVG().then(function (result) {
      setEncoded(downloadSvgLink, "object-diagram.svg", result.svg);
    });

    saveBoard().then(function (result) {
      setEncoded(downloadLink, "object-diagram.xml", result.xml);
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
    saveDebugStep(event.xml);
  });

  odDebugger.on("debugger.data.update", (event) => {
    odDebugger.importXML(event.xml);
    updateDebugStep(event.xml);
  });

  odDebugger.on("debugger.config", (event) => {
    saveConfig(event);
  });

  previousDebugState.on("click", previous);
  nextDebugState.on("click", next);
});
const previousDebugState = $("#previous-state");
const currentState = $("#current-state");
const nextDebugState = $("#next-state");

let config = {
  savedDebugSteps: 0,
};
let savedDebugSteps = [];
let currentStep = 0;

function loadCurrentDebugStep() {
  disableOrEnableNextAndPreviousButtons();
  setCurrentStepCSSAndHTML();
  let savedDebugStep = savedDebugSteps[currentStep];
  odDebugger.importXML(savedDebugStep);
}

function setCurrentStepCSSAndHTML() {
  if (currentStep === 0) {
    currentState.text("Debug Data");
    currentState.css("left", "49.5%");
    return;
  }
  currentState.css("left", "48%");
  if (currentStep === 1) {
    currentState.text(`Debug Data -${currentStep.toString()} Step`);
    return;
  }
  currentState.text(`Debug Data -${currentStep.toString()} Steps`);
}

function disableOrEnableNextAndPreviousButtons() {
  const value = "disabled";
  if (currentStep + 1 >= savedDebugSteps.length) {
    previousDebugState.addClass(value);
  } else {
    previousDebugState.removeClass(value);
  }
  if (currentStep - 1 < 0) {
    nextDebugState.addClass(value);
  } else {
    nextDebugState.removeClass(value);
  }
}

function saveConfig(data) {
  config = JSON.parse(data.content);
  console.log("Configuration received:", config);
  limitSavedDebugSteps();
  resetCurrentStepIfNeeded();
}

function resetCurrentStepIfNeeded() {
  if (currentStep !== 0) {
    currentStep = 0;
    loadCurrentDebugStep();
  }
}

function updateDebugStep(xml) {
  if (currentStep !== 0) {
    console.log("Should never come here");
    return;
  }
  savedDebugSteps[0] = xml;
}

function saveDebugStep(xml) {
  savedDebugSteps.unshift(xml);
  limitSavedDebugSteps();

  if (currentStep !== 0) {
    currentStep = 0;
    setCurrentStepCSSAndHTML();
  }

  disableOrEnableNextAndPreviousButtons();
}

function limitSavedDebugSteps() {
  // + 1 to keep the current step
  if (savedDebugSteps.length > config.savedDebugSteps + 1) {
    // Setting length automatically throws away old debug steps
    savedDebugSteps.length = config.savedDebugSteps + 1;
  }
}

function previous() {
  if (currentStep < savedDebugSteps.length - 1) {
    currentStep++;
    loadCurrentDebugStep();
  }
}

function next() {
  if (currentStep > 0) {
    currentStep--;
    loadCurrentDebugStep();
  }
}

document.addEventListener(
  "keyup",
  (event) => {
    if (event.code === "ArrowRight") {
      next();
    }
    if (event.code === "ArrowLeft") {
      previous();
    }
  },
  false,
);

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
