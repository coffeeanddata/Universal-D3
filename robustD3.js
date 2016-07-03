//javascript functions that creates quick and easy cavnas for plotting scatterplots and histograms
//creating outline object
// construction function 
setCanvas =  function(width, height){
	this.outline = {}
	var outline = this.outline;
	var chartMargin   = {top: height*.10, right: width*.10, bottom: height*.20, left: width*.15},
		chartWidth  = width  - chartMargin.left - chartMargin.right,
		chartHeight = height - chartMargin.top  - chartMargin.bottom;
	outline.width = chartWidth;
	outline.height = chartHeight 
	outline.topMargin = chartMargin.top
	outline.bottomMargin = chartMargin.bottom
	outline.leftMargin =  chartMargin.left
	outline.rightMargin =  chartMargin.right
}


//creating canvas using svg elements (uniqueId, outline from outlineParametes)
canvas = function(barId, width, height){
	var setupCanvas = new setCanvas(width, height)
	var outline = setupCanvas.outline;
	var div = d3.select("body").append("div").attr("id", barId).attr("class","robustD3Canvas");
	var canvasSVG = div.append("svg")
		.attr("width",  outline.width  + outline.leftMargin + outline.rightMargin)
		.attr("height", outline.height + outline.topMargin + outline.bottomMargin)
	graph = canvasSVG.append("g")
		.attr("class", "mainGraph")
		.attr("transform", "translate(" + outline.leftMargin + "," +  outline.topMargin + ")");		
	setupCanvas.plot = canvasSVG;
	setupCanvas.plotID = barId;
	setupCanvas.canvasProperties  = {};
	return setupCanvas;
}


setCanvas.prototype.objectProperties = function(objectKeys, objectValues){
	getObject = this.canvasProperties;
	objectKeys.forEach(function(key, index) {  
		if(getObject[key] == undefined){
		getObject[key] = objectValues[index]; 
		}
	});
}



//scatterplot using bind, append, enter, update, and exit
// only handles numeric vs numeric not really made to be used with categorical vs numeric plotting
setCanvas.prototype.scatterPlot = function(data, xValue, yValue){
	objectKeys = ["data", "mainElement", "mainElementClass", "colorScaleValue", "colorScale"]
	objectVals = [data, "circle", "scatterPlotCircles", yValue, function(d) { return "#000000";}] 
	this.objectProperties(objectKeys, objectVals)


	var selectValue = this.mainElement + "." + this.mainElementClass;
	var graph = this.plot.select("g.mainGraph");
	var outline = this.outline;
	var CP  = this.canvasProperties;	

	graphTrans = d3.transition().duration(1000);

	rangeXValue = d3.extent(data, function(x) { return x[xValue]; });
	rangeYValue = d3.extent(data, function(x) { return x[yValue]; });

	graph.selectAll(".axis").remove();
	var xScale = d3.scaleLinear().range([0, outline.width]);
	var yScale = d3.scaleLinear().range([outline.height, 0]);

	//map data values (x,y) to graph scale
	xScale.domain([rangeXValue[0]*.7, rangeXValue[1] *1.1]);
	yScale.domain([rangeYValue[0]*.7, rangeYValue[1] *1.1]);



	// Create Axis group
	var xAxisGroup = graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", "xAxis axis");
	var yAxisGroup = graph.append("g").attr("class", "yAxis axis");

		
	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	
	// Call Axis
	xAxisGroup.transition().duration(1000).call(xAxis).selectAll("text").attr("class", "xAxisText axisText");
	yAxisGroup.transition().duration(1000).call(yAxis).selectAll("text").attr("class", "yAxisText axisText");
	
	// Bind Data
	var scatter = graph.selectAll(selectValue).data(data);
	//Enter
	scatter.enter().append(CP.mainElement)
		.attr("class", CP.mainElementClass)
		.attr("r", 0)
	.merge(scatter)
		.transition(graphTrans)
		.attr("cx", function(x) { return xScale(x[xValue]); })
		.attr("cy", function(x) { return yScale(x[yValue]); })
		.attr("r", outline.width/ 120) 

	//Exit
	scatter.exit()
		.transition().duration(1000)
			.attr("r", 0)
			.remove();
	if(this.mainDesc == undefined){
		this.updateDesc(xValue.toUpperCase(), yValue.toUpperCase(), xValue.toUpperCase() + " vs. " + yValue.toUpperCase())
	}
}



setCanvas.prototype.updateDesc = function(xLabel, yLabel, mainTitle){
	this.plot.selectAll("text.DescText").remove();
	var outline = this.outline;
	if(this.mainDesc == undefined){
		tempObj = {
			"xLabel"    : { "xCord"    : (outline.leftMargin + outline.width/2),
							"yCord"    : (outline.height + outline.topMargin + outline.bottomMargin/2),
							"rotate"   : 0, 
							"fontSize" : ((outline.width + outline.height)/60),
							"label"    : xLabel
						  },
			"yLabel"    : { "xCord"    : (outline.leftMargin/2), 
							"yCord"    : (outline.topMargin + outline.height/2),
							"rotate"   : -90, 
							"fontSize" : ((outline.width + outline.height)/60),
							"label"    : yLabel
						  },
			"mainTitle" : { "xCord"    : (outline.leftMargin + outline.width/2),
							"yCord"    : (outline.topMargin/2), 
							"rotate"   : 0,  
							"fontSize" : (outline.width/ 40),
							"label"    : mainTitle
						 }
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
	newText.enter()
		.append("text")
		.attr("class", "DescText")
		.attr("text-anchor", "middle")
	.merge(newText)
		.text(function(d) { return d.label; })
		.attr("transform", function(d) { return "translate(" + d.xCord +"," + d.yCord + ") " + "rotate(" + d.rotate + ")"; })
		.attr("font-size", function(d) { return d.fontSize; })
	newText.exit().remove();
}



setCanvas.prototype.colorFeature = function(data, variableKey, color){
	var CP = this.canvasProperties;
	var graph = this.plot.select("g.mainGraph");

	var selectValue = CP.mainElement + "." + CP.mainElementClass;
	getScatter = graph.selectAll(selectValue).data(data);
	getScatter.attr("fill", function(d) { return color(d[variableKey]); });
	CP.colorScale = color;
	CP.colorScaleValue = variableKey;
}


setCanvas.prototype.createTips = function(data, toolTipText){
	var	CP = this.canvasProperties;
	var graph = this.plot.select("g.mainGraph")
	var selectors = d3.selectAll(CP.mainElement);
	var divToolTip = d3.select("body").append("div").attr("class","divToolTip")
		.style("position",  "absolute").style("width", "80px").style("height", "auto")
		.style("padding", "4px").style("background-color", "white").style("-webkit-border-radius","10px")
        .style("-moz-border-radius", "10px").style("border-radius", "10px")
		.style("-webkit-box-shadow", "4px 4px 10px rgba(0, 0, 0, 0.4)")
		.style("-moz-box-shadow" ,"4px 4px 10px rgba(0, 0, 0, 0.4)")
    	.style("box-shadow", "4px 4px 10px rgba(0, 0, 0, 0.4)")
        .style("pointer-events", "none").style("opacity", "0");
		// tool tip theme 
		//http://chimera.labs.oreilly.com/books/1230000000345/ch10.html#_hover_to_highlight

	selectors.on("mouseover", function (d) {
		d3.select(this).attr("fill", "lightsteelblue");
		getDivToolTip = d3.select("div.divToolTip");
		getDivToolTip.transition().duration(250).text(toolTipText + ": " + d[toolTipText])
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 30) + "px")
			.style("opacity", 1);
		})
		.on("mouseout", function(d){
			d3.select(this).attr("fill", CP.colorScale(d[CP.colorScaleValue]))
		getDivToolTip = d3.select("div.divToolTip");
		getDivToolTip.transition().duration(500).style("opacity", 0);
		})
}


//really easy nesting function with d3.nesting as descending. 
groupByKey = function(data, mainKey){
	var nestedData = d3.nest()
		.key(function(d){ return dateRevert(d[mainKey]); })
			.sortKeys(d3.descending)
		.entries(data);
	return nestedData;
};


// Barchart
setCanvas.prototype.barChart = function(data, xValue, yValue){
	objectKeys = ["data","yValue", "xValue", "mainElement", "mainElementClass", "colorScaleValue", "colorScale"]
	objectVals = [data, yValue, xValue, "rect", "barChart", yValue, function(d) { return "#000000";}] 
	this.objectProperties(objectKeys, objectVals)

	var selectValue = this.mainElement + "." + this.mainElementClass;
	var graph = this.plot.select("g.mainGraph");
	var outline = this.outline;
	var CP = this.canvasProperties;	

	this.createAxis("string", "number")
	yScale = this.axisProperties.yScale;
	xScale = this.axisProperties.xScale;
	/*
//	rangeYValue = d3.extent(data, function(x) { return x[yValue]; });
//	graph.selectAll(".axis").remove();

	// note the rounding, if the width/length < 1, then barplot bandwith will be rounded to 0
	var xScale = d3.scaleBand().rangeRound([0, outline.width]).padding(0.1);
	//	var yScale = d3.scaleLinear().range([outline.height, 0]);

	//map data values (x,y) to graph scale
	xScale.domain(data.map(function(d) { return d[xValue]; }));
	//	yScale.domain([rangeYValue[0]*.7, rangeYValue[1] *1.1]);

	// Create Axis group
	var xAxisGroup = graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", "xAxis axis");
	//var yAxisGroup = graph.append("g").attr("class", "yAxis axis");


	// Create Axis
	var xAxis = d3.axisBottom(xScale);
	//var yAxis = d3.axisLeft(yScale);

	// Call Axis
	xAxisGroup.transition().duration(1000).call(xAxis).selectAll("text").attr("class", "xAxisText axisText");
	//yAxisGroup.transition().duration(1000).call(yAxis).selectAll("text").attr("class", "yAxisText axisText");
*/
	var	bars = graph.selectAll(selectValue).data(data);
	bars.enter()
		.append(CP.mainElement)
		.attr("class", CP.mainElementClass)
		.attr("width", xScale.bandwidth())
	.merge(bars)
		.attr("fill", function(x) {return CP.colorScale(x[yValue]); })
		.attr("y", function(x) { return yScale(x[yValue]); })			
		.attr("height", function(x) { return  outline.height - yScale(x[yValue]); })
		.attr("x", function(d) {return xScale(d[xValue]); })
	if(this.mainDesc == undefined){
		this.updateDesc(xValue.toUpperCase(), yValue.toUpperCase(), xValue.toUpperCase() + " vs. " + yValue.toUpperCase())
	}
}

//returns new object: frequency table result (used for barplot)
getFreq = function(data, variable){
	freqObj = {}
	data.forEach(function(d){ 
		var getValue = d[variable];
		freqObj[getValue] = freqObj[getValue] == undefined ? 1 : freqObj[getValue] + 1;
	}) 
	var newArray = Object.keys(freqObj).map(function(key) { 
		var tempObj = {};
		tempObj[variable] = key
		tempObj["Freq"]   = freqObj[key]
		return tempObj;
	});
	return newArray;
}


setCanvas.prototype.rotateText = function(axis, rotate, anchor, moveUp, moveSide){
	var graph = this.plot.select("g.mainGraph g.xAxis");
	var getAxisText = graph.selectAll("text");
	getAxisText.attr("transform", "rotate(" + rotate + ")")	
	.attr("dx", moveUp + "em")
    .attr("dy", moveSide + "em")
	.attr("text-anchor", anchor);
}


setCanvas.prototype.setAxisFunctions = function(){
	return {
		numberbarChart : "numericBarPlot",
		stringbarChart : "charBarPlot"
	}
}

setCanvas.prototype.charBarPlot = function(val){
	var	data     = this.canvasProperties.data;
	var outline  = this.outline;
	var valScale = d3.scaleBand().rangeRound([0, outline.width]).padding(0.1);

	//map data values (x,y) to graph scale
	valScale.domain(data.map(function(d) { return d[val]; }));

	// Create Axis group
	var axisGroup = graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", "xAxis axis");

	// Create Axis
	var setAxis = d3.axisBottom(valScale);

	// Call Axis
	axisGroup.transition().duration(1000).call(setAxis).selectAll("text").attr("class", "xAxisText axisText");
	return valScale;

}


setCanvas.prototype.numericBarPlot = function(val){
	var	data    = this.canvasProperties.data;
	var outline = this.outline;
	rangeVal    = d3.extent(data, function(x) { return x[val]; });

	var valScale = d3.scaleLinear().range([outline.height, 0]);

	//map data values (x,y) to graph scale
	valScale.domain([rangeVal[0]*.7, rangeVal[1] *1.1]);

	// Create Axis group
	var axisGroup = graph.append("g").attr("class", "yAxis axis");

	// Create Axis
	var setAxis = d3.axisLeft(valScale);

	// Call Axis
	axisGroup.transition().duration(1000).call(setAxis).selectAll("text").attr("class", "yAxisText axisText");
	return valScale;
}

setCanvas.prototype.createAxis = function(xType, yType){
	this.axisProperties = {}
	var axisObject = this.axisProperties;
	axisObject.xType = xType, axisObject.yType = yType;

	allAxisFunctions = this.setAxisFunctions()
	var graphClass =	this.canvasProperties.mainElementClass;

	

	graph.selectAll(".axis").remove();
	this.axisProperties.yScale = this[allAxisFunctions[yType + graphClass]](this.canvasProperties.yValue)
	this.axisProperties.xScale = this[allAxisFunctions[xType + graphClass]](this.canvasProperties.xValue) 

}











































