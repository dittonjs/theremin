// Store frame for motion functions

var bufferSize = 4096;

function getBitCrusher() {
    var bufferSize = 4096;
    var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
    node.bits = 4; // between 1 and 16
    node.normfreq = 0.1; // between 0.0 and 1.0
    var step = Math.pow(1/2, node.bits);
    var phaser = 0;
    var last = 0;
    node.onaudioprocess = function(e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            phaser += node.normfreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    };
    return node;
}

var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

let audioCtx = new AudioContext();
let gainNode = audioCtx.createGain();
let bitCrusher = getBitCrusher();
gainNode.gain.value = .1;
let oscillator = audioCtx.createOscillator();
let effect = 'none';
let started = false;

function playOscillator() {
    gainNode = audioCtx.createGain();
    oscillator = audioCtx.createOscillator();
    if (effect == 'none') {
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
    } else if (effect == 'bit'){
      bitCrusher = getBitCrusher();
      oscillator.connect(gainNode);
      gainNode.connect(bitCrusher);
      bitCrusher.connect(audioCtx.destination);
    }



    oscillator.frequency.value = 440;
    gainNode.gain.value = 1;
    oscillator.start();
}
// to use HMD mode:
// controllerOptions.optimizeHMD = true;

Leap.loop(controllerOptions, function(frame) {
  if (frame.hands.length == 2) {
    if(!started) {
      started = true;
      playOscillator()
    }
    for (var i = 0; i < frame.hands.length; i++) {
      var hand = frame.hands[i];
      if (hand.type === 'right')
        oscillator.frequency.value = 340 + (hand.palmPosition[0] * 3);
      else
        gainNode.gain.value = hand.palmPosition[1] < 100 ? 0 : (hand.palmPosition[1] - 100) / 150

      if (gainNode.gain.value > 1) gainNode.gain.value = 1;
      document.getElementById('frequency').innerHTML = `Frequency: ${parseInt(oscillator.frequency.value)}`;
      document.getElementById('gain').innerHTML = `Gain: ${gainNode.gain.value}`;
      // Hand motion factors
    }
  }
  else {
    if(started) {
      started = false;
      oscillator.stop();
    }
  }
})

function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}

function getBitCrusher() {
  var bufferSize = 4096;
  var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);
  node.bits = 4; // between 1 and 16
  node.normfreq = 0.1; // between 0.0 and 1.0
  var step = Math.pow(1/2, node.bits);
  var phaser = 0;
  var last = 0;
  node.onaudioprocess = function(e) {
      var input = e.inputBuffer.getChannelData(0);
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
          phaser += node.normfreq;
          if (phaser >= 1.0) {
              phaser -= 1.0;
              last = step * Math.floor(input[i] / step + 0.5);
          }
          output[i] = last;
      }
  };
  return node;
}

function crushBits() {
  if (effect === 'bit') effect = 'none';
  else
    effect = 'bit';
}