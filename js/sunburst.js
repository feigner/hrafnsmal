/*!
 *
 * Hrafnsmal sunburst chart.
 *
 * Listens for data_update events and redraw the graph.
 *
 * TODO: massive cleanup.
 *
*******************************************************************************/

window.hrafnsmal = window.hrafnsmal || {};

window.hrafnsmal.sunburst = (function(){

    var w = window.innerWidth,
        h = window.innerHeight,
        r = Math.min(w, h) / 2 - 100;

    var initial_color = '#87d2c7',
        animation_duration = 800,
        filler = window.hrafnsmal.fillers.plain;

    var vis = d3.select("#chart").append("svg:svg")
        .attr("width", w)
        .attr("height", h)
      .append("svg:g")
        .attr("transform", "translate(" + w / 2 + "," + ((h / 2) - 33) + ")");

    var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, r * r])
        .value(function(d) { return 1; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return d.x; })
        .endAngle(function(d) { return d.x + d.dx; })
        .innerRadius(function(d) { return Math.sqrt(d.y); })
        .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

    var tooltip = d3.select("body").append("div")
       .attr("id", "tooltip")
       .style("opacity", 1e-6);

    /**
     * Update the chart with new data.
     */
    chart_update = function(e, root){

        var nodes = partition.nodes(root)

        var g = vis.selectAll("g")
            .data(nodes, function(d) { return d.id; })
            .enter().append("svg:g")
            .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring

        g.insert("svg:path")
         .attr("d", arc)
         .style("stroke", "#fff")
         .style("stroke-opacity", 0.4)
         .style('fill', initial_color)
         .style("fill-opacity", 0.8)
         .each(stash)
         .on("click", function(d){
             if (d.depth == 1) 
                window.open(d.url.replace('api.','').replace('repos/',''), '_blank');
             if (d.depth == 2) 
                window.open(d.url.replace('api.','').replace('repos/','') + '/commits/' + d.ref.replace('refs/heads/',''), '_blank')
             if (d.depth == 3) 
                window.open(d.url.replace('api.','').replace('repos/','').replace('commits','commit'), '_blank')
         })
         .on('mouseover', function(d){
             tooltip.transition()
                .duration(animation_duration/2)
                .style("opacity", 1)
         })
         .on('mouseout', function(d){
             tooltip.transition()
                .duration(animation_duration/2)
                .style("opacity", 1e-6);
         })
         .on('mousemove', function(d){

              html = '';
              if (d.depth == 1){ 
                  html = d.name + "<br /><br />" +
                         d.children.length + " Pushes <br />" + 
                         d.stats.commits + " Commits <br />" +
                         d.stats.files + " Files <br />" +
                         d.stats.modifications.total + " Changes <br />"
              }
              if (d.depth == 2){ 
                  html = d.ref + " @ " +
                         d.created_at + "<br /><br />" + 
                         d.children.length + " Commits <br />" + 
                         d.stats.files + " Files <br />" +
                         d.stats.modifications.total + " Changes <br />"
              }
              if (d.depth == 3){
                  html = d.commit.message + "<br /><br />" +
                         d.stats.files + " Files <br />" +
                         d.stats.modifications.total + " Changes <br />";
              }

              tooltip.html(html)
                 .style("left", (d3.event.pageX - 34) + "px")
                 .style("top", (d3.event.pageY + 34) + "px");
         });

        // animate path move / fill
        vis.selectAll("g path").transition()
           .duration(animation_duration)
           .attrTween("d", arc_tween)
           .style('fill', filler);

        // repo name text
        g.insert("svg:text")
         .attr("class", "label")
         .attr("display", function(d) { return d.depth < 2 ? null : "none"; }) // only show repo names
         .attr("x", function(d) { return Math.sqrt(d.y); })
         .attr("dx", "6") // margin
         .attr("dy", ".35em") // vertical-align
         .attr("transform", function(d) { return "rotate(" + (d.x + d.dx / 2 - Math.PI / 2) / Math.PI * 180 + ")"; })
         .text(function(d) { return (d.name && d.name.length > 16) ? d.name.substr(0,16) : d.name; }) // trim name

        // animate text rotation
        vis.selectAll("g text").transition()
           .duration(animation_duration)
           .attr("transform", function(d) { return "rotate(" + (d.x + d.dx / 2 - Math.PI / 2) / Math.PI * 180 + ")"; })
    }

    // stash the old values for transitioning.
    stash = function(d) { d.x0 = d.x; d.dx0 = d.dx; }

    // interpolate the arcs
    arc_tween = function(a) {
        var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
        return function(t) { var b = i(t); a.x0 = b.x; a.dx0 = b.dx; return arc(b); };
    }

    filler_update = function(e,name){
        filler = window.hrafnsmal.fillers[name];
        vis.selectAll("g path").transition()
           .duration(animation_duration)
           .style('fill', filler);
    }

    // register event handlers
    $('body').on('filler_update', filler_update);
    $('body').on('data_update', chart_update);

})();
