import $ from 'jquery';

import 'object-diagram-modeler/assets/odm.css';
import ODDebugger from './Debugger';

// modeler instance
const odDebugger = new ODDebugger({
  container: '#canvas',
  keyboard: {
    bindTo: window,
  }
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
};
document.getElementById('js-toggle-fullscreen').addEventListener('click', function() {
  state.fullScreen = !state.fullScreen;
  if (state.fullScreen) {
    enterFullscreen(document.documentElement);
  } else {
    exitFullscreen();
  }
});
document.getElementById('js-toggle-keyboard-help').addEventListener('click', function() {
  state.keyboardHelp = !state.keyboardHelp;
  let displayProp = 'none';
  if (state.keyboardHelp) {
    displayProp = 'block';
  }
  document.getElementById('io-dialog-main').style.display = displayProp;
});
document.getElementById('io-dialog-main').addEventListener('click', function() {
  state.keyboardHelp = !state.keyboardHelp;
  let displayProp = 'none';
  if (!state.keyboardHelp) {
    document.getElementById('io-dialog-main').style.display = displayProp;
  }
});

/* file functions */
function openFile(file, callback) {

  // check file api availability
  if (!window.FileReader) {
    return window.alert(
      'Looks like you use an older browser that does not support drag and drop. ' +
      'Try using a modern browser such as Chrome, Firefox or Internet Explorer > 10.');
  }

  // no file chosen
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {

    const xml = e.target.result;

    callback(xml);
  };

  reader.readAsText(file);
}

const fileInput = $('<input type="file" />').appendTo(document.body).css({
  width: 1,
  height: 1,
  display: 'none',
  overflow: 'hidden'
}).on('change', function(e) {
  openFile(e.target.files[0], openBoard);
});


function openBoard(xml) {

  // import board
  odDebugger.importXML(xml).catch(function(err) {
    if (err) {
      return console.error('could not import od board', err);
    }
  });
}

function saveSVG() {
  return odDebugger.saveSVG();
}

function saveBoard() {
  return odDebugger.saveXML({ format: true });
}

// bootstrap board functions
$(function() {

  const downloadLink = $('#js-download-board');
  const downloadSvgLink = $('#js-download-svg');

  const openExistingBoard = $('#js-open-board');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    const encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  const exportArtifacts = debounce(function() {

    saveSVG().then(function(result) {
      setEncoded(downloadSvgLink, 'object-diagram.svg', result.svg);
    });

    saveBoard().then(function(result) {
      setEncoded(downloadLink, 'object-diagram.xml', result.xml);
    });
  }, 500);

  odDebugger.on('commandStack.changed', exportArtifacts);
  odDebugger.on('import.done', exportArtifacts);

  openExistingBoard.on('click', function() {
    const input = $(fileInput);

    // clear input so that previously selected file can be reopened
    input.val('');
    input.trigger('click');
  });

});


// helpers //////////////////////

function debounce(fn, timeout) {
  let timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}
