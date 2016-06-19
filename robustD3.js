//javascript functions that creates quick and easy cavnas for plotting scatterplots and histograms
//
//creating outline object


// construction function 
setCanvas =  function(width, height){
	var chartMargin   = {top: height*.10, right: width*.10, bottom: height*.20, left: width*.15},
		chartWidth  = width  - chartMargin.left - chartMargin.right,
		chartHeight = height - chartMargin.top  - chartMargin.bottom;
	this.width = chartWidth;
	this.height = chartHeight 
	this.topMargin = chartMargin.top
	this.bottomMargin = chartMargin.bottom
	this.leftMargin =  chartMargin.left
	this.rightMargin =  chartMargin.right
}


//creating canvas using svg elements (uniqueId, outline from outlineParametes)
canvas = function(barId, height, width){
	var outline = new setCanvas(width, height)
	var div = d3.select("body").append("div").attr("id", barId).attr("class","robustD3Canvas");
	var canvasSVG = div.append("svg")
		.attr("width",  outline.width  + outline.leftMargin + outline.rightMargin)
		.attr("height", outline.height + outline.topMargin + outline.bottomMargin)
	graph = canvasSVG.append("g")
		.attr("class", "mainGraph")
		.attr("transform", "translate(" + outline.leftMargin + "," +  outline.topMargin + ")");		
	outline.plot = canvasSVG
	return outline;
}




//scatterplot using bind, append, enter, update, and exit
// only handles numeric vs numeric not really made to be used with categorical vs numeric plotting
setCanvas.prototype.scatterPlot = function(data, xValue, yValue){
	graph = this.plot.select("g.mainGraph");
	outline = this;
	rangeXValue = d3.extent(data, function(x) { return x[xValue]; });
	rangeYValue = d3.extent(data, function(x) { return x[yValue]; });

	graph.selectAll(".axis").remove();
	var xScale = d3.scale.linear().range([0, outline.width]);
	var yScale = d3.scale.linear().range([outline.height, 0]);

	//map data values (x,y) to graph scale
	xScale.domain([rangeXValue[0]*.8, rangeXValue[1] *1.2]);
	yScale.domain([rangeYValue[0]*.8, rangeYValue[1] *1.2]);

	// Create Axis group
	var xAxisGroup = graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", "x axis");
	var yAxisGroup = graph.append("g").attr("class", "y axis");

	// Create Axis
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	
	// Call Axis
	xAxisGroup.transition().duration(1000).call(xAxis);
	yAxisGroup.transition().duration(1000).call(yAxis);
	graph.selectAll(".axis line, .axis path").style({ "fill":"none", "stroke": "black", "shape-rendering":"crispEdges" });
	graph.selectAll(".axis text").style({"font-family": "sans-serif", "font-size": "11px"});


	// Bind Data
	var scatter = graph.selectAll("circle").data(data);
	//Enter
	scatter.enter().append("circle")
		.attr("class", "scatterplotCircles")
		.attr("r", 0);

	//Update
	scatter
		.transition().duration(1000)
		.attr("r", 5) 
		.attr("cx", function(x) { return xScale(x[xValue]); })
		.attr("cy", function(x) { return yScale(x[yValue]); });

	//Exit
	scatter.exit()
		.transition().duration(1000)
			.attr("r", 0)
			.remove();
	this.updateDesc(xValue.toUpperCase(), yValue.toUpperCase(), xValue.toUpperCase() + " vs. " + yValue.toUpperCase())
}



setCanvas.prototype.updateDesc = function(xLabel, yLabel, mainTitle){
	this.plot.selectAll("text.DescText").remove();
	if(this.mainDesc == undefined){
		tempObj = {
			"xLabel"    : {"xCord" : (this.leftMargin + this.width/2), "yCord" : (this.height + this.topMargin + this.bottomMargin/2), "rotate" : 0, "fontSize" : (this.width/20),"label" : xLabel},
			"yLabel"    : {"xCord" : (this.leftMargin/2), "yCord" : (this.topMargin + this.height/2), "rotate" : -90, "fontSize" : (this.height/20),  "label" : yLabel},
			"mainTitle" : {"xCord" : (this.leftMargin + this.width/2), "yCord" : (this.topMargin/2), "rotate" : 0, "fontSize" : (this.width/20), "label" : mainTitle}
		}	
		this.mainDesc = tempObj
	}else {	
		tempObj = this.mainDesc;
		tempObj.xLabel.label = xLabel
		tempObj.yLabel.label = yLabel
		tempObj.mainTitle.label = mainTitle

	}
	getArray = Object.keys(tempObj).map(function (key) {return tempObj[key]});
	newText = this.plot.selectAll("g.DescText").data(getArray);
	newText.enter().append("text").attr("class", "DescText").attr("text-anchor", "middle");

//	newText = newGroupsText.attr("transform", "rotate(90)").append("text")
	newText.text(function(d) { return d.label; })
		.attr("transform", function(d) { return "translate(" + d.xCord +"," + d.yCord + ") " + "rotate(" + d.rotate + ")"; })
		.attr("font-size", function(d) { return d.fontSize; })
	newText.exit().remove();
}


//really easy nesting function with d3.nesting as descending. 
groupByKey = function(data, mainKey){
	var nestedData = d3.nest()
		.key(function(d){ return dateRevert(d[mainKey]); })
			.sortKeys(d3.descending)
		.entries(data);
	return nestedData;
};



