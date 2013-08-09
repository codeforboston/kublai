"use strict"

require('coffee-script');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In this case its a HTTP server
  require('./server.coffee')(7027, '127.0.0.1');
}

