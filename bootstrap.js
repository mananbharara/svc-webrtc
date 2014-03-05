var util = require('util'), WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: 8000}), connect = require('connect');

wss.broadcast = function(data) {
  for(var i in this.clients)
    this.clients[i].send(data);
};

wss.on('connection', function (ws) {
  util.log('New connection:' + ws.toString());
  ws.on('message', function(message) {
    ws.send(message);
    wss.broadcast(message);
  });
});

connect.createServer(connect.static(__dirname)).listen(process.env.PORT || 5000);
