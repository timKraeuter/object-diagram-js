import $ from 'jquery';

import 'visual-debugger/assets/odm.css';
import ODModeler from 'visual-debugger/lib/Modeler';

// modeler instance
var modeler = new ODModeler({
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
  help: false,
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
document.getElementById('js-toggle-help').addEventListener('click', function() {
  state.help = !state.help;
  let displayProp = 'none';
  if (state.help) {
    displayProp = 'block';
  }
  document.getElementById('help-dialog-main').style.display = displayProp;
});
document.getElementById('help-dialog-main').addEventListener('click', function() {
  state.help = !state.help;
  let displayProp = 'none';
  if (!state.help) {
    document.getElementById('help-dialog-main').style.display = displayProp;
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

  var reader = new FileReader();

  reader.onload = function(e) {

    var xml = e.target.result;

    callback(xml);
  };

  reader.readAsText(file);
}

var fileInput = $('<input type="file" />').appendTo(document.body).css({
  width: 1,
  height: 1,
  display: 'none',
  overflow: 'hidden'
}).on('change', function(e) {
  openFile(e.target.files[0], openBoard);
});


function openBoard(xml) {

  // import board
  modeler.importXML(xml).catch(function(err) {
    if (err) {
      return console.error('could not import od board', err);
    }
  });
}

function saveSVG() {
  return modeler.saveSVG();
}

function saveBoard() {
  return modeler.saveXML({ format: true });
}

// bootstrap board functions
$(function() {

  var downloadLink = $('#js-download-board');
  var downloadSvgLink = $('#js-download-svg');

  var openExistingBoard = $('#js-open-board');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG().then(function(result) {
      setEncoded(downloadSvgLink, 'object-diagram.svg', result.svg);
    });

    saveBoard().then(function(result) {
      setEncoded(downloadLink, 'object-diagram.xml', result.xml);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
  modeler.on('import.done', exportArtifacts);

  openExistingBoard.on('click', function() {
    var input = $(fileInput);

    // clear input so that previously selected file can be reopened
    input.val('');
    input.trigger('click');
  });

});

// helpers //////////////////////

function debounce(fn, timeout) {
  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}