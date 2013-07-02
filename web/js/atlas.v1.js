(function(data) {
	/**
	 * Convert string to slug
	 * Source:  http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript/
	 */
	function str_to_slug(str) {
		str = str.replace(/^\s+|\s+$/g, ''); // trim
		str = str.toLowerCase();

		// remove accents, swap ñ for n, etc
		var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
		var to   = "aaaaeeeeiiiioooouuuunc------";
		for (var i=0, l=from.length ; i<l ; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}

		str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

		return str;
	}


    var width = 380,
    height = 1950;

	var projection = d3.geo.mercator()
		.scale(2200)
		.center([-72,-17])
		.translate([width/2, 0]);

	var svg = d3.select("#map").append("svg")
	    .attr("width", width)	
	    .attr("height", height);

	var g = svg.append("g");

	var path = d3.geo.path()
    	.projection(projection);


    var color = d3.scale.linear()
	    .domain([0, 0.5, 1])
	    .range(["green", "white", "red"]);

	d3.json("maps/regiones.json", function(error, chile) {
		// svg.append("path")
		// 	.datum(topojson.feature(chile, chile.objects.regions))
		// 	.attr("d", path);

		var region = 'pais';
		function showRegion(id, obj, join) {
			//console.log(obj.properties.Details);
			obj = obj | false;
			join = join | false;
			console.log(obj);
			$('#region').text(data[id]['REGION']);
			$('#variables li').each(function(index, el) {
	  			var link = $('a', $(el));
	  			var key = link.attr('id');
	  			valor = data[id][key];
	  			if (variables[key]['percent']) {
	  				valor = Math.round(data[id][key] * 1000)/10.0 + "%";
	  			}
	  			$('#valor', $(el)).text(valor);
	  		});

			//g.select("#"+id).attr('fill', color(Math.random()));
			// var centroid = path.centroid(d);
		    // x = width / 2 - centroid[0];
		    // y = height / 2 - centroid[1];
		    // console.log("X : " + x + ", Y : " + y);
		    console.log(id);
		}


		function showCountry() {
			showRegion('pais');
		}


		function showVariable(id) {
			if (variables[id]['percent']) {
				for(var key in data) {
					console.log(color(data[key][id]));
					g.select("#" + key).attr("fill", color(data[key][id]));
				}
				$('.selected').removeClass('selected');
				$('#'+id).addClass('selected');
			}
		}

		g.selectAll(".regions")
				.data(topojson.feature(chile, chile.objects.regions).features)
			.enter().append("path")
				.attr("id", function(d) {d.id = str_to_slug(d.properties.Region); return d.id;})
		    	.attr("class", function(d) { return "regions " + d.id; })
		    	.attr("d", path)
		    	.on('mouseover', function(d) {showRegion(d.id, d);})
		    	.on('mouseout', function(d) {showCountry();})
		    	.append("title").text(function(d) { return d.properties.Details; });


		for (var key in variables) {
			if (variables[key]['show']) {
				$('#variables').append(
				    $('<li>').append(
				        $('<a>')
				        	.attr('href','#')
				        	.attr('id', key)
				        	.attr('title', variables[key]['name'])
				        	.click(function(evt) {
				        		evt.preventDefault();
				        		var id = $(evt.currentTarget).attr('id');
				        		showVariable(id)
				        	})
				            .append(key.substring(0,16))
					).append(": <span id=\"valor\">0</span>")
				);
			}
		}

		/* Show country data by default */
		showCountry();
		//showVariable('PORC_NEDU_BAJO');
	});
  
}(data))
