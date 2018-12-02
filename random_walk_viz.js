var width = 1000,
    height = 760;

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g")
  .attr("class", "everything");

//Tooltip stuff
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var tipMouseOver = function(d, html) {
  tooltip.html(html)
    .style("left", (d3.event.pageX + 20) + "px")
    .style("top", (d3.event.pageY - 15) + "px");
  tooltip.transition()
    .duration(200)
    .style("opacity", 0.9);
};

var tipMouseOut = function(d) {
  tooltip.transition()
    .duration(300)
    .style("opacity", 0);
};

//force graph
var simulate = d3.forceSimulation();

//drag functions
var drag = d3.drag()
  .on("start", function(d){
    if (!d3.event.active) simulate.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  })
  .on("drag", function(d){
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  })
  .on("end", function(d){
    if (!d3.event.active) simulate.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  });

//TODO
// function set_text_color(){
//   d3.select("body").append('input')
//     .attr('type','checkbox')
//     .attr("class", ".pCheckbox")
//     .text("Path 1").style("color", "blue");
//   d3.selectAll(".pCheckbox").each(function(d){
//     cb = d3.select(this);
//     cb.append("svg")
//       .attr("width", 30)
//       .attr("height", 30)
//     .append("rect")
//       .attr("width", 30)
//       .attr("height", 30)
//       .style("color",color_setter(parseInt(cb.property("value"))-1));
//     cb.style("color", color_setter(parseInt(cb.property("value"))-1));
//   })
// }

//sets the color
function color_setter(n) {
  var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colors[n % colors.length];
}

//allowing user to select which graph to view
d3.select(".sel_graph_button").on("click", select_graph);
//the json file of the graph has to be labeled "topic_name_2_path" Ex:
//Hevea_brasiliensis_2_path
//Linear_algebra_2_path
select_graph();
function select_graph(){
  var json_name = d3.select("#dropdown").property("value");
  d3.json(json_name + "_2_path.json", function(data) {
    d3.selectAll("tooltip").remove();
    d3.selectAll("marker").remove();
    d3.selectAll("path").remove();
    d3.selectAll("node").remove();
    d3.selectAll("circle").remove();
    d3.selectAll("text").remove();
    simulate.alpha(0.5).restart();
    update(data);
  });
}

function update(graph){
  var source_node = graph.links[0].source;

  //zoom
  var zoom = d3.zoom()
    .scaleExtent([1/2, 10])
    .on("zoom", function() { g.attr("transform", d3.event.transform); });
  zoom(svg);

  //arrowhead
  svg.append('defs').append('marker')
    .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 13)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5 L10,0 L0,5")
      .attr('fill', "black")
      .style('stroke','none');

  //adding links to graph
  var link = g.selectAll("path")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "path")
      .attr("marker-end", "url(#arrowhead)")
      .attr("fill", "none")
      .attr("stroke", function(d) { return color_setter(d.path); })
      .attr("stroke-width", 2.3)
    .on("mouseover", function(d){
      tipMouseOver(d, "Similarity: " + (Math.round(d.similarity * 10000)/10000) +
        "<br>Path: " + (d.path + 1) +
        "<br>Step: " + (d.step + 1));
      d3.select(this).style("stroke-width", 4);
    })
    .on("mouseout", function(d){
      tipMouseOut();
      d3.select(this).style("stroke-width", 2.3);
    });

  //adding nodes to graph
  var node = g.attr("class", "node")
  .selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("fill", function(d){
        if(d.id == source_node){ return "red"; }
        else {return "black";}
      });

  //creating the circle to represent each node
  var circle = node.append("circle")
    .attr("fill", function(d){
      if(d.id == source_node){ return "red"; }
      else {return "gray";}
    })
    .attr("r", function(d){
      if(d.id == source_node){ return Math.min(d.paths.length,6) + 4; }
      else {return Math.min(d.paths.length,6) + 3; }
    })
    .attr("stroke", "black")
    .on("mouseover", function(d){
      var html = "Name: " + d.name + "<br>Paths: ";
      for(var i = 0; i < d.paths.length; i++){
        if(i % 10 == 0 && i != 0) html = html + "<br>";
        html = html + " " + (d.paths[i] + 1);
      }
      tipMouseOver(d, html);
      d3.select(this).style("cursor", "pointer");
      d3.select(this).attr("r", Math.min(d.paths.length,6) + 4);
    })
    .on("mouseout", function(d){
      tipMouseOut();
      d3.select(this).style("cursor", "");
      d3.select(this).attr("r", function(d){
        if(d.id==source_node){ return Math.min(d.paths.length,6) + 4;} else {return Math.min(d.paths.length,6) + 3;}
      })
    });

  //simulating the graph
  simulate
    .nodes(graph.nodes)
    .force("link", d3.forceLink(graph.links))
    .force("charge", d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collide", d3.forceCollide(function(d){
      return d.id == source_node ? 60 : 30 //spacing out the center node
    }));
  simulate.tick();

  drag(node); //enables ability to drag nodes

  //Making node text visible/not
  d3.select("#text_visible").on("change", updateText);
  updateText();
  function updateText(){
    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) {
        if(d3.select("#text_visible").property("checked")){
          return d.name;
        } else {
          node.selectAll("text").remove();
        }
      })
      .style("font-size", "9px");
  }

  //CHOOSING CERTAIN PATHS
  //TODO:  set_text_color(); //Updates text color to their path
  d3.selectAll(".pCheckbox").on("change", updateLinks);
  updateLinks();
  function updateLinks(){
    var path_cb = [];
    d3.selectAll(".pCheckbox").each(function(d){
      cb = d3.select(this);
      if(cb.property("checked")){
        path_cb.push(parseInt(cb.property("value")));
      }
    });
    updatePaths(path_cb);
  }
  function updatePaths(path_cb){
    link.style("opacity", function(d){
      if(path_cb.includes(d.path)){
        return 1;
      } else {
        return 0.15;
      }
    });
  }

  //SELECT ALL/SELECT NONE
  d3.select(".selAllCheckbox").on("click", function(){
    d3.selectAll(".pCheckbox").property("checked", true);
    updateLinks();
  });
  d3.select(".selNoneCheckbox").on("click", function(){
    d3.selectAll(".pCheckbox").property("checked", false);
    updateLinks();
  });

  //on tick
  simulate.on("tick", function(){
    link.attr("d", positionLink);
    node.attr("transform", positionNode);
  });

  //arc of link
  function positionLink(d) {
    var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y +
      "A" + (dr * d.path/20) + "," + (dr * d.path/20) + " 0 0,1 " +
      d.target.x + "," + d.target.y;
  }

  //node position
  function positionNode(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
}
