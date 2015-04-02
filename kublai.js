"use strict"
	module.exports = function(port, ip, tilePath, domain) {
	const mbtiles = require('mbtiles');
	const tilelive = require('tilelive');
	const express = require('express');
	const fs = require('fs');
	const mustache = require('mustache');
	const preview = mustache.compile(fs.readFileSync(__dirname+'/preview.html').toString());
	const kublai = express();

	kublai.use(express.compress());
	kublai.use(express.favicon(__dirname + '/public/favicon.ico'));
	kublai.use(express.logger('dev'));
	kublai.use(express.static(__dirname + '/public'));
	kublai.all('*', function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('X-Powered-By', 'Kublai');
		res.header('Cache-Control', 'max-age=600');
		return next();
	});
	mbtiles.registerProtocols(tilelive);
	
	function arrayEquality(a,b){
		if(!(Array.isArray(a)&&Array.isArray(b))){
			return false;
		}else if(a.length!==b.length){
			return false;
		}else{
			a.sort();
			b.sort();
			for(let i = 0,len=a.length;i<len;i++){
				if(a[i]!==b[i]){
					return false;
				}
			}
			return true;
		}
	}
	function parseInfo(resp,key){
		resp.tilejson = '2.1.0';
		if(resp.scheme){
			delete resp.scheme;
		}
		resp.tiles = [];
		let subDomains = ['a', 'b', 'c', 'd'];
		if(domain.indexOf('*')===-1){
			subDomains = [''];
		}
		for (let i = 0, len = subDomains.length; i < len; i++) {
			resp.tiles.push("http://" + templateDomain(subDomains[i])+"/" + key + "/{z}/{x}/{y}.png");
		}
		resp.leaflet = "http://"+templateDomain("{s}")+"/" + key + "/{z}/{x}/{y}.png";
		if(resp.template){
			resp.grids=[];
			for (let i = 0, len = subDomains.length; i < len; i++) {
				resp.grids.push("http://" + templateDomain(subDomains[i])+"/" + key + "/{z}/{x}/{y}.grid.json");
			}
			resp.leafletGrid = "http://"+templateDomain("{s}")+"/" + key + "/{z}/{x}/{y}.grid.json";
		}
		return resp;
	}
	const layers = new Map();
	let layerList = [];
	let layerInfo = {};
	function getLayers (){
		tilelive.list(tilePath, function(e, list) {
			if (!e) {
				if(layerList.length){
					layerList.forEach(function(layer){
						layers.delete(layer);
					})
				}
				layerList = Object.keys(list);
				layerInfo = {};
				layerList.forEach(function(key) {
					tilelive.load(list[key], function(err, tileSource) {
						if (!err) {
							layers.set(key,tileSource);
							tileSource.getInfo(function(err, resp) {
								if (!err) {
									layerInfo[key]=parseInfo(resp,key);
								}
							});
						}
					});
				});
			}
		});
	}
	getLayers();
	fs.watch(tilePath,getLayers);
	kublai.get('/', function(req, res, next) {
		res.jsonp(layerList.map(function(layer){
			const out = {};
			out.preview=layer+'/preview';
			out.id=layer;
			if(layer in layerInfo){
				out.info = layerInfo[layer];
			}
			return out;
		}));
	});
	kublai.get('/:layer/:z/:x/:y.png', function(req, res, next) {
		if (layers.has(req.params.layer)) {
			layers.get(req.params.layer).getTile(req.params.z, req.params.x, req.params.y, function(err, tile) {
				if (err) {
					res.jsonp(404,{
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
			res.jsonp(404,{
				err: 'unknown layer'
			});
		}
	});
	kublai.get('/:layer/:z/:x/:y.(grid.)?json', function(req, res, next) {
		if (layers.has(req.params.layer)) {
			layers.get(req.params.layer).getGrid(req.params.z, req.params.x, req.params.y, function(err, grid) {
				if (err) {
					res.jsonp(404,{
						err: err
					});
				} else {
					res.jsonp(grid);
				}
			});
		} else {
			res.jsonp(404,{
				err: 'unknown layer'
			});
		}
	});
	kublai.get('/:layer/preview', function(req, res, next) {
		if (layers.has(req.params.layer)) {
			res.set({
				'Content-Type': 'text/html'
			});
			res.send(preview({layer:req.params.layer}));
		} else {
			res.jsonp(404,{
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
					res.jsonp(parseInfo(resp,req.params.layer));
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

