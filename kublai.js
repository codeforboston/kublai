"use strict"
module.exports = function(port, ip, tilePath, domain) {
const mbtiles = require('mbtiles');
const tilelive = require('tilelive');
const express = require('express');
const fs = require('fs');
const kublai = express();

kublai.use(express.compress());
kublai.use(express.favicon(__dirname + '/public/favicon.ico'));
kublai.use(express.logger('dev'));
kublai.use(express.static(__dirname + '/public'));
kublai.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('X-Powered-By', 'Kublai');
  return next();
});


mbtiles.registerProtocols(tilelive);

const layers = new Map();

tilelive.list(tilePath, function(e, list) {
  if (!e) {
	const keys = Object.keys(list);
	keys.forEach(function(key) {
	  tilelive.load(list[key], function(err, tileSource) {
		if (!err) {
		  layers.set(key,tileSource);
		}
	  });
	});
  }
});

kublai.get('/:layer/:z/:x/:y.png', function(req, res, next) {
  if (layers.has(req.params.layer)) {
	layers.get(req.params.layer).getTile(req.params.z, req.params.x, req.params.y, function(err, tile) {
	  if (err) {
		res.jsonp({
		  err: err
		});
	  } else {
		res.set({
		  'Content-Type': "image/png"
		});
		res.send(tile);
	  }
	});
  } else {
	res.jsonp({
	  err: 'unknown layer'
	});
  }
});
kublai.get('/:layer/:z/:x/:y.(grid.)?json', function(req, res, next) {
  if (layers.has(req.params.layer)) {
	layers.get(req.params.layer).getGrid(req.params.z, req.params.x, req.params.y, function(err, grid) {
	  if (err) {
		res.jsonp({
		  err: err
		});
	  } else {
		res.jsonp(grid);
	  }
	});
  } else {
	res.jsonp({
	  err: 'unknown layer'
	});
  }
});
kublai.get('/:layer/preview', function(req, res, next) {
  if (layers.has(req.params.layer)) {
	res.sendfile(__dirname +'/preview.html');
  } else {
	res.jsonp({
	  err: 'unknown layer'
	});
  }
});
function templateDomain(sub){
	return domain.replace('*',sub);
}
kublai.get('/:layer/tile(.json)?', function(req, res, next) {
  if (layers.has(req.params.layer)) {
	layers.get(req.params.layer).getInfo(function(err, resp) {
	  if (err) {
		return res.jsonp(404, {
		  err: err
		});
	  } else {
		resp.tilejson = '2.1.0';
		resp.tiles = [];
		let subDomains = ['a', 'b', 'c', 'd'];
		if(domain.indexOf('*')===-1){
			subDomains = [''];
		}
		for (let i = 0, len = subDomains.length; i < len; i++) {
		  resp.tiles.push("http://" + templateDomain(subDomains[i])+"/" + req.params.layer + "/{z}/{x}/{y}.png");
		}
		resp.leaflet = "http://"+templateDomain("{s}")+"/" + req.params.layer + "/{z}/{x}/{y}.png";
		if(resp.template){
			resp.grids=[];
			for (let i = 0, len = subDomains.length; i < len; i++) {
				resp.grids.push("http://" + templateDomain(subDomains[i])+"/" + req.params.layer + "/{z}/{x}/{y}.grid.json");
			}
			resp.leafletGrid = "http://"+templateDomain("{s}")+"/" + req.params.layer + "/{z}/{x}/{y}.grid.json";
		}
		res.jsonp(resp);
	  }
	});
  } else {
	res.jsonp(404, {
	  err: 'unknown layer'
	});
  }
});


  kublai.listen(port, ip);
  console.log('listening on ' + ip + ':' + port);
};

