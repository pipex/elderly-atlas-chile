/**
 * From html5-boilerplate https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js
 *
 * Avoid `console` errors in browsers that lack a console.
 */
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

    /**
     * Calculate the size of an object
     */
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
}());




/**
 * Draws a chart for the selected date and IMEI in the selected element
 * of the page
 * 
 * @select id of the object where the chart will be drawn 
 * @date date to draw
 * @imei imei of the device (TODO: sacar para produccion)
 * @options associative array with the css classes to assign for each of the options in the csv (format {'case' : 'class')
 * @default css class 
 */
 function detailedDayChart(select, csv_url, date, options, default_option) {
  var customTimeFormat = timeFormat([
    [d3.time.format("%b %d %Y"), function() { return true; }],
    [d3.time.format("%b %d"), function(d) { return d.getMonth(); }],
    [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
    [d3.time.format("%H:%M"), function(d) { return d.getHours();}]
  ]);

  function timeFormat(formats) {
    return function(date) {
      var i = formats.length - 1, f = formats[i];
      while (!f[1](date)) f = formats[--i];
      return f[0](date);
    };
  }

  /* Define the margins of the chart */
  var margin = {top: 0, right: 20, bottom: 20, left: 32},
    width = 738 - margin.left - margin.right,
    height = 140 - margin.top - margin.bottom;

  /* Define the scale and range of the X axis */
  var x = d3.time.scale()
    .range([0, width])
    .domain([new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0,0), new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0,0)]);

  /* Define the scale and range of the Y axis */
  var y = d3.scale.linear()
    .range([0,height])
    .domain([0,1]);

  /* Format for the X axis (Hour:Minutes) */
  var timeFormat = d3.time.format("%H:%M");

  var dateFormat = d3.time.format("%Y-%m-%d");

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.hours, 2)
      .tickFormat(customTimeFormat)
      .orient("bottom");
      
  var svg = d3.select(select)
    .append("svg")    
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(csv_url, function(error,data) {
    if (error || data.length === 0) {
      d3.select(select).html(d3.select('#template_nodata').html());
    }

    data.forEach(function(d) {
      var inicio = d.inicio.split(":");
      d.inicio = new Date(date.getFullYear(), date.getMonth(), date.getDate(), inicio[0], inicio[1], inicio[2]);

      var fin = d.fin.split(":")
      d.fin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), fin[0], fin[1], fin[2]);
    });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.selectAll("."+default_option)
        .data(data)
        .enter().append("rect")
        .attr("class", function(d) {
          return d.caso in options ? options[d.caso] : default_option;
        })
        .attr("x", function(d) { return x(d.inicio); })
        .attr("width", function(d) {return x(d.fin) - x(d.inicio);})
        .attr("y", y(0))
        .attr("height", y(1));
  });
}


function daySummaryChart(select, csv_url, options, default_option) {
  var margin = {top: 10, right: 20, bottom: 0, left: 30},
    width = 738 - margin.left - margin.right,
    height = 40 - margin.top - margin.bottom;

  var dateFormat = d3.time.format("%Y-%m-%d");

  var y = d3.scale.linear()
      .range([0,height])
      .domain([0,1]);

  var svg = d3.select(select)
    .append("svg")    
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(csv_url, function(error,data) {
    var range = 0;

    var hasData = false;
    data.forEach(function(d) {
      d.valor = parseFloat(d.valor);
      range += d.valor;
      hasData = d.valor != 0 || hasData;
    });

    if (error || !hasData || data.length === 0) {
      d3.select(select).select("svg").attr("style", "display:none;");
      return false;
    }

    var x = d3.scale.linear()
      .range([0, width])
      .domain([0, range]); 

    var inicio = 0;
    data.forEach(function(d) {
      d.percent = d.valor * 100 / range;
      d.percent = Math.round(d.percent*10)/10.0;
      d.inicio = inicio;
      inicio = inicio + d.valor;
    });

    //define class
    var rects = svg.selectAll("g.group")
        .data(data)
        .enter()
        .append("g")
          .attr("class", "group");
    
    //rectangles
    rects.append("rect")
      .attr("class", function(d) {return d.nombre in options ? options[d.nombre] : default_option;})
      .attr("x", function(d) { return x(d.inicio); })
      .attr("y", y(0))
      .attr("width", function(d) {return x(d.valor);})
      .attr("height", y(1));
      
    //dy: "desplázate (lo mismo que el alto de un bloque) hacia abajo
    //y un poquito menos para no estar pegado al borde"
    rects.append("text")
      .attr("class", function(d) {return x(d.valor) < 30 ? 'percentRect-none':'percentRect';})
      .attr("x", function(d) { return x(d.inicio); })
      .attr("y", function(d) { return y(0); })
      .attr("dy", y(1)-2)
      .text(function(d){ if (d.valor > 0) return d.percent + '%'; });

    /* Etiquetas del gráfico */
    rects.append("text")
      .attr("class", function(d) {return x(d.valor) < 30 ? 'labelRect-none' : 'labelRect';})
      .attr("x", function(d) { return x(d.inicio); })
      .attr("y", function(d) { return y(0); })
      .attr("dy", y(0) - 2)
      .text(function(d){ if (d.valor > 0) return d.nombre; });

  });
}

function daySummaryChart2(select, csv_url, options, default_option) {
  var margin = {top: 0, right: 40, bottom: 0, left: 32},
    width = 758 - margin.left - margin.right,
    height = Object.size(options)*10 - margin.top - margin.bottom;

  var dateFormat = d3.time.format("%Y-%m-%d");

  var y = d3.scale.linear()
      .range([0,height])
      .domain([0,1]);

  var svg = d3.select(select)
    .append("svg")    
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(csv_url, function(error,data) {
    var range = 0;
    var hasData = false;
    data.forEach(function(d) {
      d.valor = parseFloat(d.valor);
      range += d.valor;
      hasData = d.valor != 0 || hasData;
    });

    if (error || !hasData || data.length === 0) {
      d3.select(select).select("svg").attr("style", "display:none;");
      return false;
    }

    var x = d3.scale.linear()
      .range([0, width])
      .domain([0, range]); 

    var inicio = 0;
    var count = 0;
    data.forEach(function(d) {
      d.index = count++;
      d.percent = d.valor * 100 / range;
      d.percent = Math.round(d.percent*100)/100.0;
      d.inicio = inicio;
      inicio = inicio + d.valor;
    });

    var sepHeight = 4;
    var rectHeight = (height - ((count - 1) * sepHeight)) / count;

    //define class
    var rects = svg.selectAll("g.group")
        .data(data)
        .enter()
        .append("g")
          .attr("class", "group");
    
    //rectangles
    rects.append("rect")
      .attr("class", function(d) {return d.nombre in options ? options[d.nombre] : default_option;})
      .attr("x", function(d) { return x(d.inicio); })
      .attr("y", function(d) { return y(0) + (rectHeight + sepHeight)*d.index ;})
      .attr("width", function(d) {return x(d.valor) > 0? x(d.valor) : 1;})
      .attr("height", rectHeight);
      
    //dy: "desplázate (lo mismo que el alto de un bloque) hacia abajo
    //y un poquito menos para no estar pegado al borde"
    /* Percentage */
    rects.append("text")
      .attr("class", 'labelRect')
      .attr("x", function(d) { return x(d.inicio) + x(d.valor); })
      .attr("dx", 0)
      .attr("y", function(d) { return y(0) + (rectHeight + sepHeight)*d.index; })
      .attr("dy", rectHeight - 1)
      .text(function(d){ return d.percent + '%'; });

    /* Etiquetas del gráfico */
    rects.append("text")
      .attr("class", 'labelRect')
      .text(function(d){ return d.nombre; })
      .attr("x", function(d) {return x(d.inicio); })
      .attr("dx", function(d) {return -(this.getComputedTextLength()) - 4;})
      .attr("y", function(d) {return y(0) + (rectHeight + sepHeight)*d.index; })
      .attr("dy", rectHeight - 1);
  });
}

function connectionPieChart(select, csv_url, options, default_option) {
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 220 - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom
    radius = width/2;

  var svg = d3.select(select)
    .append("svg")    
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

  var arc = d3.svg.arc() //this will create <path> elements for us using arc data
    .outerRadius(radius)
    .innerRadius(radius - 25);


  var arc2 = d3.svg.arc() //this will create <path> elements for us using arc data
    .outerRadius(radius - 27)
    .innerRadius(radius - 35);

  var pie = d3.layout.pie() //this will create arc data for us given a list of values
    .value(function(d) { return d.valor; }); //we must tell it out to access the value of each element in our data array

  d3.csv(csv_url, function(error,data) {
    var sinDatos = false;
    data.forEach(function(d) {
      d.valor = parseFloat(d.valor);
      d.percent = d.valor * 100 / 86400;
      d.percent = Math.round(d.percent*10)/10.0;

      console.log(d);

      if (d.nombre === "Sin conexión" && d.valor === 86400) {
        sinDatos = true;
      }
    });

    if (error || sinDatos || data.length === 0) {
      d3.select("#total_times_section").html(d3.select('#template_nodata').html());
      return false;
    }

    //define class
    var arcs = svg.selectAll("g.slice")
        .data(pie(data))
        .enter()
        .append("g")
          .attr("class", "slice");

    var arcs2 = svg.selectAll("g.slice2")
        .data(pie(data))
        .enter()
        .append("g")
          .attr("class", "slice2");
    
    arcs.append("path")
      .attr("class", function(d) { return d.data.nombre in options ? options[d.data.nombre] : default_option; } ) //set the color for each slice to be chosen from the color function defined above
      .attr("d", arc); //this creates the actual SVG path using the associated data (pie) with the arc drawing function

    arcs2.append("path")
      .attr("class", function(d) {
        return d.data.nombre === "Sin conexión" ? "bg" : "conreg";
      })
      .attr("d", arc2);
  });
}

function connectionSmallChart(select, csv_url, options, default_option) {
  var margin = {top: 10, right: 60, bottom: 20, left: 0},
    width = 300 - margin.left - margin.right,
    height = 38 - margin.top - margin.bottom;

  var dateFormat = d3.time.format("%Y-%m-%d");

  var y = d3.scale.linear()
      .range([0,height])
      .domain([0,1]);

  var svg = d3.select(select)
    .append("svg")    
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(csv_url, function(error,data) {
    var range = 0;

    var newData = [];
    var conectado = {nombre: "Conectado", valor : 0};

    var percentConectado = 0, percentRegistros = 0;
    /* Create new data array */
    data.forEach(function(d) {
      d.valor = parseFloat(d.valor);
      if (d.nombre === "No conectado") {
        newData.push({nombre: "Sin conexión", valor : d.valor});
        percentRegistros += d.valor;
      }
      else if (d.nombre === "Conectado") {
        newData.push({nombre: "Conectado", valor : d.valor});
        percentRegistros += d.valor;
        percentConectado = d.valor;
      }
    });

    /* Calculate the X axis range */
    newData.forEach(function(d) {
      range += d.valor;
    });

    var x = d3.scale.linear()
      .range([0, width])
      .domain([0, range]); 

    var inicio = 0;
    newData.forEach(function(d) {
      d.percent = d.valor * 100 / range;
      d.percent = Math.round(d.percent*10)/10.0;
      d.inicio = inicio;
      inicio = inicio + d.valor;
    });

    /* Calculado sobre el total del dia*/
    percentRegistros = percentRegistros * 100 / 86400;
    percentRegistros = Math.round(percentRegistros*10)/10.0;

    /* Calculado sobre el total de mediciones */
    percentConectado = percentConectado * 100 / range;
    percentConectado = Math.round(percentConectado*10)/10.0;

    /* TODO: Set the percentage values in the HTML */
    d3.select("#total_times_registros").text(percentRegistros + "%");
    d3.select("#total_times_conectado").text(percentConectado + "%");

    //define class
    var rects = svg.selectAll("g.group")
        .data(newData)
        .enter()
        .append("g")
          .attr("class", "group");
    
    //rectangles
    rects.append("rect")
      .attr("class", function(d) {return d.nombre in options ? options[d.nombre] : default_option;})
      .attr("x", function(d) { return x(d.inicio); })
      .attr("y", y(0))
      .attr("width", function(d) {return x(d.valor);})
      .attr("height", y(1));
      
    //dy: "desplázate (lo mismo que el alto de un bloque) hacia abajo
    //y un poquito menos para no estar pegado al borde"
    rects.append("text")
      .text(function(d){ if (d.valor > 0) return d.percent + '%'; })
      .attr("class", 'percentSmall')
      .attr("x", function(d) { return d.nombre == "Conectado" ? x(d.inicio) : x(d.inicio) + x(d.valor); })
      .attr("y", function(d) { return y(0); })
      .attr("dy", y(0)-2)
      .attr("dx", function(d) {return d.nombre == "Conectado" ? 0 : -this.getComputedTextLength();});

    /* Etiquetas del gráfico */
    rects.append("text")
      .text(function(d){ if (d.valor > 0) return d.nombre; })
      .attr("class", 'labelSmall')
      .attr("x", function(d) { return d.nombre == "Conectado" ? x(d.inicio) : x(d.inicio) + x(d.valor); })
      .attr("y", function(d) { return y(1); })
      .attr("dy", y(1)+1)
      .attr("dx", function(d) {return d.nombre == "Conectado" ? 0 : -this.getComputedTextLength();});

  });
}