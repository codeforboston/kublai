mbtiles = require 'mbtiles'
tilelive = require 'tilelive'
express = require 'express'
kublai = express()
kublai.use express.compress()
kublai.all '*', (req, res, next)->
	res.header 'Access-Control-Allow-Origin', '*'
	res.header 'Access-Control-Allow-Headers', 'X-Requested-With'
	next()
preview = """
<!doctype html>
<html lang="en">
    <head>
		<meta charset='utf-8'/>
		<title>
			Historical
		</title>
		<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css" />
		<!--[if lte IE 8]>
			<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.ie.css" />
		<![endif]-->
		<style>
			html { height: 100% }
			body { height: 100%; margin: 0; padding: 0;}
			#map{ height: 100% }
		</style>
	</head>
	<body>
		<div id="map"></div>
		<script src="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js"></script>
		<script>
				var map = L.map('map',{maxZoom:14}).setView([42.35445293701623, -71.06755256652832],14);
				
				L.tileLayer('{z}/{x}/{y}.png').addTo(map);
		
		</script>
		
	</body>
</html>

"""
mbtiles.registerProtocols tilelive

layers={}

tilelive.list "./tiles", (e,list)=>
	unless e
		keys = Object.keys list
		keys.forEach (key)->
			tilelive.load list[key], (err, tileSource)->
				layers[key] = tileSource unless err
	@
	
kublai.get '/:layer/:z/:x/:y.png', (req, res, next) ->
	if req.params.layer of layers
		layers[req.params.layer].getTile req.params.z, req.params.x, req.params.y,(err,tile)->
			if err
				res.jsonp {err:err}
			else
				res.set
					'Content-Type': "image/png"
				res.send tile
	else
		res.jsonp {err:'unknown layer'}
kublai.get '/:layer/preview',(req,res,next)->
	if req.params.layer of layers
		res.send preview
	else
		res.jsonp {err:'unknown layer'}
kublai.get '/:layer/tile',(req,res,next)->
	if req.params.layer of layers
		layers[req.params.layer].getInfo (err,resp)->
			if err
				res.jsonp 404, {err:err}
			else
				res.jsonp resp
	else
		res.jsonp 404,{err:'unknown layer'}

module.exports = (port,ip)->
	kublai.listen port, ip
	console.log 'listening on '+ip+':'+port
