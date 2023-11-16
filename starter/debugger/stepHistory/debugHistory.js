import $ from "jquery";

const debugPosition = $("#debug-position");

let config = {
  savedDebugSteps: 0,
};
export let savedDebugSteps = [];
export let currentStep = 0;

const previousDebugState = $("#previous-state");
const currentState = $("#current-state");
const nextDebugState = $("#next-state");

export function previous(odDebugger) {
  if (currentStep < savedDebugSteps.length - 1) {
    currentStep++;
    loadCurrentDebugStep(odDebugger);
  }
}

export function next(odDebugger) {
  if (currentStep > 0) {
    currentStep--;
    loadCurrentDebugStep(odDebugger);
  }
}

export function saveConfig(data) {
  config = JSON.parse(data.content);
  limitSavedDebugSteps();
  resetCurrentStepIfNeeded();
}

export function saveDebugStep(step) {
  savedDebugSteps.unshift(step);
  limitSavedDebugSteps();

  if (currentStep !== 0) {
    currentStep = 0;
    setCurrentStepCSSAndHTML();
  }

  setDebugPosition(step);
  disableOrEnableNextAndPreviousButtons();
}

export function updateDebugStep(debugStep) {
  if (currentStep !== 0) {
    console.log("Should never come here");
    return;
  }
  savedDebugSteps[0].xml = debugStep.xml;
}

function loadCurrentDebugStep(odDebugger) {
  disableOrEnableNextAndPreviousButtons();
  setCurrentStepCSSAndHTML();
  let savedDebugStep = savedDebugSteps[currentStep];
  odDebugger.importXML(savedDebugStep.xml);
  setDebugPosition(savedDebugStep);
}

function setDebugPosition(debugStep) {
  debugPosition.text(`${debugStep.fileName}:${debugStep.line}`);
}

function setCurrentStepCSSAndHTML() {
  if (currentStep === 0) {
    currentState.text("Debug Data");
    currentState.css("left", "49.5%");
    return;
  }
  currentState.css("left", "48%");
  if (currentStep === 1) {
    currentState.text(`Debug Data -${currentStep} Step`);
    return;
  }
  currentState.text(`Debug Data -${currentStep} Steps`);
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

function resetCurrentStepIfNeeded(odDebugger) {
  if (currentStep !== 0) {
    currentStep = 0;
    loadCurrentDebugStep(odDebugger);
  }
}

function limitSavedDebugSteps() {
  // + 1 to keep the current step
  if (savedDebugSteps.length > config.savedDebugSteps + 1) {
    // Setting length automatically throws away old debug steps
    savedDebugSteps.length = config.savedDebugSteps + 1;
  }
}
