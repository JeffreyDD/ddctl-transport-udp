const dgram = require('dgram')

var transport = function(options){
  this.options = options || {}
}

Object.assign(transport.prototype, {
  send: function(message, cb){
    if(!this.client)
      this.client = dgram.createSocket('udp4')

    var messageBuf = new Buffer(JSON.stringify(message))

    var host = this.options.host
    var port = this.options.port

    this.client.send(messageBuf, 0, messageBuf.length, port, host, function(err, bytes) {
        if (err) { cb(err); return; }
        console.log('UDP message sent to ' + host +':'+ port + ':')
        console.log(message)
        cb(null, {status: 'OK', bytes: bytes})
        this.client.close()
    }.bind(this));
  },
  listen: function(cb){
    if(!this.server){
      this.server = dgram.createSocket('udp4')

      this.server.on('listening', function () {
        var address = this.server.address()
        console.log('UDP Server listening on ' + address.address + ":" + address.port)
      }.bind(this));

      this.server.on('message', function (messageStr, remote) {
        cb(null, JSON.parse(messageStr.toString('utf8')), remote)
      });

      this.server.bind(this.options.port)
    }else{
      cb('server already started, try to restart ddctl-server')
    }
  }
})

module.exports = transport;
