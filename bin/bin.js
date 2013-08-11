"use strict";
const kublai = require("../server");
const info = require("../package.json");
const program = require('commander');
const fs = require('fs');
program
  .version(info.version)
  .option('-i, --ip <host>', 'IP address to bind to, defaults to process.env.IP or 127.0.0.1')
  .option('-p, --port <port>', 'port to listen on, defaults to process.env.PORT or 7027', parseInt)
  .option('-n, --number <forks>', 'number of forks, defaults to require("os").cpus().length', parseInt)
  .option('-t, --tile <path>', 'path to folder with tiles, defaults to "."')
  .option('-d, --domains <domain>', 'out domains, defaults to ip:port, add a "*" for subdomains')
  .option('-c, --config <path to config>', 'path to a config file')
  .parse(process.argv);
if(program.config){
	fs.readFile(program.config,{encoding:"utf8"},callKublai);
}else{
	callKublai(null,{});
}
function callKublai(err,config){
	if(err){
		console.log('err with path');
		return;
	}
	if(typeof config === "string"){
		config = JSON.parse(config);
	}
	if(program.number){
		config.forks = program.number;
	}
	if(program.ip){
		config.host = program.ip;
	}
	if(program.port){
		config.port = program.port;
	}
	if(program.tile){
		config.path = program.tile;
	}
	if(program.domains){
		config.domain = program.domains;
	}
	kublai(config);
}
