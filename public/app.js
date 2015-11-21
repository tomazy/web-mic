;(function(){
  'use strict';
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();

  var canvas = document.querySelector('canvas');
  var waveView = createWaveView(canvas);

  function playBuffer(buffer){
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }

  function makeBuffer(data){
    var buffer = audioContext.createBuffer(1, data.length, 44100);
    var nowBuffering = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++){
      nowBuffering[i] = data[i]
    }
    return buffer;
  }

  var client = new BinaryClient('ws://' + document.location.host);
  client.on('stream', function(stream, meta){
    console.log('got remote stream', meta);
    stream.on('data', function(data){
      var arr = new Float32Array(data);
      waveView.updateData(arr);
      playBuffer(makeBuffer(arr));
    });

    stream.on('end', function(){
      console.log('stream end');
    });
  });

  fileinput.addEventListener('change', function(event){
    var file = event.target.files[0];
    client.send(file);
  }, false);

})();
