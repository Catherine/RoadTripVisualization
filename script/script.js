var margin = {t:50,l:50,b:50,r:50},
    width = $('.canvas').width()-margin.l-margin.r,
    height = $('.canvas').height()-margin.t-margin.b;

var dotColor = '#992A31';
var dotColorSet = true;
var week = ["Jun 28", "Jun 29", "Jun 30", "Jul 01", "Jul 02", "Jul 03", "Jul 04", "Jul 05", "Jul 06", "Jul 07", "Jul 08"];
var colorArray = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'black', 'brown', 'white', '#323232', '#28ea39'];


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

var colorRange = d3.scale.linear().domain([0,0.15]).range(["#fff","red"]);


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

        //set up click events
        $('#plot').on('click', function(e){
            dotColorSet = true;
            drawPoints(places);
         });
     
        $('#plot_color').on('click', function(e){
            dotColorSet = false;
            console.log("clicked plot_color and dotColorSet=" + dotColorSet);
            drawPoints(places);
        });

        
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
        .transition()
        .attr('r', '2px')
        .attr('fill', function(d){
            if (dotColorSet){
                return dotColor;
            } else 
            return colorize(d);
        })
        // .style('fill',function(d){
        //    var rate = d.when;
        //    return scaleColor(rate);
        // })
        ;
}

function colorize(d){
    console.log('hit colorize');
    var date = d.when;

    for(var x = 0; x < week.length; x++){
        if (date.indexOf(week[x]) > -1){
            console.log("found date " + date + " in " + week[x])
            return colorArray[x];
        }
    }
    
}


function zoomed() {
  features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  
  features.selectAll('.state')
    .style("stroke-width", 1.5 / d3.event.scale + "px");

  features.selectAll(".point")
    .attr('r', 2 / d3.event.scale + "px");
}

d3.select(self.frameElement).style("height", height + "px");




