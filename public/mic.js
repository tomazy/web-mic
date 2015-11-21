;(function mic(){
  'use strict';
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();

  var canvas = document.querySelector('canvas');

  var waveView = createWaveView(canvas);
  var hijack; // http://stackoverflow.com/questions/24338144/chrome-onaudioprocess-stops-getting-called-after-a-while

  var client = new BinaryClient('ws://' + document.location.host);
  client.on('open', function(){
    console.log('client open');
    var outStream = client.createStream({audio: true});
    initAudio(function(stream){
      console.log('gotStream');

      var realAudioInput = audioContext.createMediaStreamSource(stream);
      realAudioInput.onended = function(){
        console.log('realAudioInput.onended')
      }

      hijack = audioContext.createScriptProcessor(4*1024, 1, 1);

      hijack.onaudioprocess = function(e){
        var data = e.inputBuffer.getChannelData(0);
        outStream.write(data);
        waveView.updateData(data);
      };

      realAudioInput.connect(hijack);

      hijack.connect(audioContext.destination);
    })
  });

  function initAudio(cb){
    if (!navigator.getUserMedia)
       navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    navigator.getUserMedia({
      audio: {
        mandatory: {
          "googEchoCancellation": "false",
          "googAutoGainControl": "false",
          "googNoiseSuppression": "false",
          "googHighpassFilter": "false"
        },
        optional: []
    }}, cb, function(e){
      alert('Error getting audio!');
      console.error(e);
    })
  }

})();
