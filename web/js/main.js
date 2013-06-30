(function(data) {
    var width = 400,
    height = 960;

	var projection = d3.geo.mercator()
		.translate([2100, -400])
		.scale(1500);

	var svg = d3.select("#map").append("svg")
	    .attr("width", width)	
	    .attr("height", height);

	var g = svg.append("g");

	var path = d3.geo.path()
    	.projection(projection);


    var color = d3.scale.linear()
	    .domain([0, 0.5, 1])
	    .range(["green", "white", "red"]);

	d3.json("maps/chile.json", function(error, chile) {
	  var region = 'pais';

	  function selectRegion(r) {
	  		$('#variables li').each(function(index, el) {
	  			var link = $('a', $(el));
	  			var key = link.attr('id');
	  			$('#valor', $(el)).text(data[r][key]);
	  		});

	  		region = r;
	  }


	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.araucania))
	      .attr("id", "araucania")
	      .attr("d", path)
	      .on('click', function() {selectRegion('araucania');});
	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.arica))
	      .attr("id", "arica")
	      .attr("d", path)
	      .on('click', function() {selectRegion('arica');});
	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.antofagasta))
	      .attr("id", "antofagasta")
	      .attr("d", path)
	      .on('click', function() {selectRegion('antofagasta');});
	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.atacama))
	      .attr("id", "atacama")
	      .attr("d", path)
	      .on('click', function() {selectRegion('atacama');});
	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.bdo_ohiggins))
	      .attr("id", "bdo_ohiggins")
	      .attr("d", path)
	      .on('click', function() {selectRegion('bdo_ohiggins');});
	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.biobio))
	      .attr("id", "biobio")
	      .attr("d", path)
	      .on('click', function() {selectRegion('biobio');});
	  g.append("path")
	      .datum(topojson.feature(chile, chile.objects.coquimbo))
	      .attr("id", "coquimbo")
	      .attr("d", path);
	   g.append("path")
	      .datum(topojson.feature(chile, chile.objects.los_lagos))
	      .attr("id", "los_lagos")
	      .attr("d", path)
	      .on('click', function() {selectRegion('coquimbo');});
	   g.append("path")
	      .datum(topojson.feature(chile, chile.objects.los_rios))
	      .attr("id", "los_rios")
	      .attr("d", path)
	      .on('click', function() {selectRegion('los_rios');});
	   g.append("path")
	      .datum(topojson.feature(chile, chile.objects.maule))
	      .attr("id", "maule")
	      .attr("d", path)
	      .on('click', function() {selectRegion('maule');});
	   g.append("path")
	      .datum(topojson.feature(chile, chile.objects.metropolitana))
	      .attr("id", "metropolitana")
	      .attr("d", path)
	      .on('click', function() {selectRegion('metropolitana');});
	   g.append("path")
	      .datum(topojson.feature(chile, chile.objects.tarapaca))
	      .attr("id", "tarapaca")
	      .attr("d", path)
	      .on('click', function() {selectRegion('tarapaca');});
	   g.append("path")
	      .datum(topojson.feature(chile, chile.objects.valparaiso))
	      .attr("id", "valparaiso")
	      .attr("d", path)
	      .on('click', function() {selectRegion('valparaiso');});


		function colorPaths(varId) {
			console.log(varId);
			for(var key in data) {
				console.log(color(data[key][varId]));
				g.select("#" + key).attr("fill", color(data[key][varId]));
			}
			$('#var').text(variables[varId]);
		}
		

		for (var key in variables) {
			$('#variables').append(
			    $('<li>').append(
			        $('<a>')
			        	.attr('href','#')
			        	.attr('id', key)
			        	.click(function(obj) {

			        		var id = $(obj.currentTarget).attr('id');
			        		colorPaths(id)
			        	})
			            .append(variables[key])
			).append(": <span id=\"valor\">0</span>")
			);
		}

		selectRegion('pais');
		colorPaths('PORC_NEDU_BAJO');
	});


	
	
	// var zoom = d3.behavior.zoom()
	//     .on("zoom",function() {
	//         g.attr("transform","translate("+ 
	//             d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	//         g.selectAll("path")  
	//             .attr("d", path.projection(projection)); 
	//   	});

	/*;

	svg.call(zoom);*/

  
}(data))
