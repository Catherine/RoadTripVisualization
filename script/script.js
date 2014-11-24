var margin = {t:50,l:50,b:50,r:50},
    width = $('.canvas').width()-margin.l-margin.r,
    height = $('.canvas').height()-margin.t-margin.b;

var svg = d3.select('.canvas')
    .append('svg')
    .attr('width',width+margin.l+margin.r)
    .attr('height',height+margin.t+margin.b)
    .append('g')
    .attr('transform',"translate("+margin.l+","+margin.t+")");

var projection = d3.geo.albersUsa()
    .translate([width/2, height/2]);
    //.scale(180);

var path = d3.geo.path()
    .projection(projection);

//import data
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
        url: "data/history-06-27-2014.xml",
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

    var states = svg.selectAll('.state')
        .data(states.features, function(d){
            return d.properties.STATE;
    });

    states
        .enter()
        .append('path')
        .attr('class','state')
        .attr('d',path);
}

function drawPoints(places){

    console.log(places)

    var points = svg.selectAll('point')
        .data(places)
        .enter()
        .append('circle')
        .attr('class','point')
        .attr('transform', function(d){
           var proj = projection([d.where[0], d.where[1]]);
           return 'translate('+proj[0]+','+proj[1]+')'
        })
        .attr('r', '1')
        .attr('fill', 'red');



}