var margin = {t:50,l:50,b:50,r:50},
    width = $('.canvas').width()-margin.l-margin.r,
    height = $('.canvas').height()-margin.t-margin.b;


/* ----- Setting up D3 Projection, Path, and Zoom ----- */
var projection = d3.geo.albersUsa()
    .translate([width/2, height/2])//;
    .scale(1400);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .translate([margin.l, margin.t])
    .scale(1)
    //.scaleExtent([1, 8])
    .on("zoom", zoomed);

var lineGen = d3.svg.line()
    .x(function(d){ 
        var proj = projection([d.where[0], d.where[1]]);
        return proj[0]; })
    .y(function(d){ r
        var proj = projection([d.where[0], d.where[1]]);
        return proj[1]; })
    .interpolate('linear');


/* ----- Setting up svg and canvas -----*/
var svg = d3.select('.canvas')
    .append('svg')
    .attr('width',width+margin.l+margin.r)
    .attr('height',height+margin.t+margin.b)
    .attr('transform',"translate("+margin.l+","+margin.t+")");

var features = svg.append('g')
    .attr('transform',"translate("+margin.l+","+margin.t+")");

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);


/* ----- Importing data ----- */
queue()
    .defer(d3.json, "data/gz_2010_us_050_00_5m.json")
    .defer(d3.json, "data/gz_2010_us_040_00_5m.json")
	.await(function(err, counties, states){
        if(err) console.error(err);

        //draw(counties, states, places);
        draw(counties, states);

        //draw location points once data is finished loading
        parseKml(function(places) { drawPoints(places); });
	})

//convert google kml location data (renamed to .xml file) to json
function parseKml(next){
    $.ajax({
        url: "data/history-06-27-2014_edited_days.xml",
        dataType:"xml"
    }).done(function(xmlData){
        //xml to json converter by stsvilik -- https://github.com/stsvilik/Xml-to-JSON
        var jsonData = xml.xmlToJSON(xmlData);

        //go directly to object level we want
        var data = jsonData.kml.Document.Placemark['gx:Track'];

        data = formatData(data);

        //callback
        next(data);
    });
}

//create objects with fields for corresponding locations and dates
function formatData(data){
    var dataArray = [];

    for (var x = 0; x < data.when.length; x++){
        dataArray.push({ 
            when: new Date(data.when[x].Text),
            where: data["gx:coord"][x].Text.split(" ") 
        })
    }

    return dataArray;
}

//draw the world, country, and airpoint points on the canvas
function draw(counties, states){
    var states = features.selectAll('.state')
        .data(states.features, function(d){
            return d.properties.STATE;
    });

    states
        .enter()
        .append('path')
        .attr('class','state')
        .attr('d',path)
        .style("stroke-width", "2px");
}

function drawPoints(places){
    console.log(places)

    var points = features.selectAll('point')
        .data(places)
        .enter()
        .append('circle')
        .attr('class','point')
        .attr('transform', function(d){
           var proj = projection([d.where[0], d.where[1]]);
           return 'translate('+proj[0]+','+proj[1]+')'
        })
        .attr('r', '2px')
        .attr('fill', '#690500')
        .attr('d',function(d){
            return lineGen(d);
        });
}


function zoomed() {
  features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  
  features.selectAll('.state')
    .style("stroke-width", 1.5 / d3.event.scale + "px");

  features.selectAll(".point")
    .attr('r', 2 / d3.event.scale + "px");
}

d3.select(self.frameElement).style("height", height + "px");




