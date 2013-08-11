"use strict";
const kublai = require("../server");
const info = require("../package.json");
const program = require('commander');

program
  .version(info.version)
  .option('-i, --ip <ip>', 'IP address')
  .option('-p, --port <port>', 'port to listen on', parseInt)
  .option('-n, --number <n>', 'number of forks', parseInt)
  .option('-t, --tile <path>', 'tile path')
  .option('-d, --domains <domian>', 'out domains')
  .parse(process.argv);
  
kublai({
	forks:program.number,
	host:program.ip,
	port:program.port,
	path:program.tile,
	domain:program.domain
});
