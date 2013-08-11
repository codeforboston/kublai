"use strict"
module.exports=function(options){
	const cluster = require('cluster');
	const numCPUs = require('os').cpus().length;
	const forks = options.forks || numCPUs;
	const host = options.host || '127.0.0.1';
	const port = options.port || process.env.PORT || 7027;
	const tilePath = options.path || "./tiles";
	const domain = options.domain || host+":"+port;
	if (cluster.isMaster) {
		for (let i = 0; i < forks; i++) {
			cluster.fork();
		}
		cluster.on('exit', function(worker, code, signal) {
			console.log('worker ' + worker.process.pid + ' died');
			cluster.fork();
		});
	} else {
		require('./kublai')(port, host, tilePath, domain);
	}
}
