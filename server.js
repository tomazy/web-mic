import http from 'http';
import express from 'express';
import { BinaryServer } from 'binaryjs';

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const bs = BinaryServer({server: server});

var destStreams;

var mics = [];
var speakers = [];

function isMic(client){
  return mics.some(c => c.client === client);
}

function connectToMics(client, meta) {
  mics.forEach((mic) => {
    const send = client.createStream(meta);
    mic.stream.pipe(send);
    speakers.push({client, stream: send});
  })
}

function removeMic(client){
  mics = mics.filter(c => c.client !== client)
}

function removeFromSpeakers(client){
  speakers.some((c) => {
    if (c.client === client){
      c.stream.destroy();
      delete c.client;
      delete c.stream;
      return true;
    }
  });
}

bs.on('connection', (client) => {
  console.log('client connected!');

  console.log('mics:', mics.length);

  connectToMics(client);

  client.on('stream', (stream, meta) => {
    console.log('on:stream', meta);

    removeFromSpeakers(client);

    mics.push({client, stream});

    Object.keys(bs.clients).forEach((id) => {
      const otherClient  = bs.clients[id];
      if (!isMic(otherClient))
        connectToMics(otherClient, meta);
    })
  });

  client.on('close', function(){
    removeMic(client);
    console.log('on:close, mic: ', isMic(client), Object.keys(client.streams));
  });

  client.on('error', function(){
    console.error('on:error', arguments);
  });
});

server.listen(9000, '0.0.0.0', function(_, e){
  if (e)
    console.error(e);
  console.log("listening on http://0.0.0.0:9000");
});
