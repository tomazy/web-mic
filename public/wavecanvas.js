(function(global){
  function findMinMax(buff, idx, len){
    var min = 1;
    var max = -1;
    var end = idx + len;
    while (idx < end){
      var sample = buff[idx++];
      if (sample > max)
        max = sample;
      if (sample < min)
        min = sample;
    }
    return (Math.abs(min) > Math.abs(max)) ? min : max;
  }

  function createWaveView(canvas){
    var currentData;
    var ctx = canvas.getContext('2d');
    var barWidth = 1;

    function updateCanvas(){
      var numBars = Math.floor(canvas.width / barWidth);
      var maxBar = Math.floor(canvas.height / 2);

      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (currentData) {
        var samplesPerBar = Math.max(1, Math.floor(currentData.length / numBars));

        var path = [];

        for (var b = 0; b < numBars; b++){
          var minMax = findMinMax(currentData, b * samplesPerBar, samplesPerBar);
          var x = b * barWidth;
          var barH = maxBar * ((minMax > 0) ? 1 : -1) * minMax;
          var y = minMax > 0 ? maxBar - barH : maxBar;
          // ctx.fillRect(x, y, barWidth, barH);
          var yy = minMax > 0 ? maxBar - barH : maxBar + barH;
          path.push([x, yy])
        }

        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (var i = 1; i < path.length; i++){
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.strokStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      requestAnimationFrame(updateCanvas);
    }
    updateCanvas();

    return {
      updateData: function(data){
        currentData = data;
      }
    }
  }

  global.createWaveView = createWaveView;
})(this);
