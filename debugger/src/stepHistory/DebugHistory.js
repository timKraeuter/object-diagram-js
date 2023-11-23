import visualizeChanges from "../differ/DiffVisualizer";

const debugPosition = document.getElementById("debug-position");

let config = {
  savedDebugSteps: 0,
  coloredDiff: true,
};
let savedDebugSteps = [];
let currentStep = 0;

const previousDebugStateButton = document.getElementById("previous-state");
const currentStateText = document.getElementById("current-state");
const nextDebugStateButton = document.getElementById("next-state");

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

export function saveConfig(data, odDebugger) {
  config = JSON.parse(data.content);
  limitSavedDebugSteps();
  resetCurrentStepIfNeeded(odDebugger);
}

export function getConfig() {
  return config;
}

export function getCurrentStepData() {
  return savedDebugSteps[currentStep];
}

export function isLastDebugStep() {
  return currentStep === 0;
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

export function updateDebugStepXML(xml) {
  savedDebugSteps[0].xml = xml;
}

function loadCurrentDebugStep(odDebugger) {
  disableOrEnableNextAndPreviousButtons();
  setCurrentStepCSSAndHTML();
  let debugStep = getCurrentStepData();
  odDebugger.importXML(debugStep.xml).then(() => {
    visualizeChanges(odDebugger, debugStep.added, debugStep.changed);
  });
  setDebugPosition(debugStep);
}

function setDebugPosition(debugStep) {
  debugPosition.textContent = `${debugStep.fileName}:${debugStep.line}`;
}

function setCurrentStepCSSAndHTML() {
  if (currentStep === 0) {
    currentStateText.textContent = "Debug Data";
    currentStateText.style.left = "49.5%";
    return;
  }
  currentStateText.style.left = "48%";
  if (currentStep === 1) {
    currentStateText.textContent = `Debug Data -${currentStep} Step`;
    return;
  }
  currentStateText.textContent = `Debug Data -${currentStep} Steps`;
}

function disableOrEnableNextAndPreviousButtons() {
  const value = "disabled";
  if (currentStep + 1 >= savedDebugSteps.length) {
    previousDebugStateButton.classList.add(value);
  } else {
    previousDebugStateButton.classList.remove(value);
  }
  if (currentStep - 1 < 0) {
    nextDebugStateButton.classList.add(value);
  } else {
    nextDebugStateButton.classList.remove(value);
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
