var WebSocketServer = require('ws').Server, http = require('http'), express = require('express'),
  app = express(), util = require('util');

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(process.env.PORT || 8080);

var wss = new WebSocketServer({server: server});
wss.broadcast = function (data) {
  for (var i in this.clients)
    this.clients[i].send(data);
};

wss.on('connection', function (ws) {
  util.log('New connection:' + ws.toString());
  ws.on('message', function (message) {
    ws.send(message);
    wss.broadcast(message);
  });
});
