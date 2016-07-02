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
	xScale.domain([rangeXValue[0]*.8, rangeXValue[1] *1.2]);
	yScale.domain([rangeYValue[0]*.8, rangeYValue[1] *1.2]);


	// Create Axis group
	var xAxisGroup = graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", "x axis");
	var yAxisGroup = graph.append("g").attr("class", "y axis");

		
	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	
	// Call Axis
	xAxisGroup.transition(graphTrans).call(xAxis);
	yAxisGroup.transition(graphTrans).call(yAxis);
	
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
			"xLabel"    : { "xCord" : (outline.leftMargin + outline.width/2), "yCord" : (outline.height + outline.topMargin + outline.bottomMargin/2), "rotate" : 0, "fontSize" : ((outline.width + outline.height)/45),"label" : xLabel},
			"yLabel"    : { "xCord" : (outline.leftMargin/2), "yCord" : (outline.topMargin + outline.height/2), "rotate" : -90, "fontSize" : ((outline.width + outline.height)/45),  "label" : yLabel},
			"mainTitle" : { "xCord" : (outline.leftMargin + outline.width/2), "yCord" : (outline.topMargin/2), "rotate" : 0, "fontSize" : (outline.width/ 25), "label" : mainTitle}
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
	/*
	var divToolTip = d3.select("body").append("div").attr("class","divToolTip")
		.style("opacity" , "0").style("position",  "absolute").style("text-align", "center").style("width",  "60px")					
		.style("height",  "28px").style("padding",  "2px").style("font",  "12px sans-serif")
		.style("background",   "lightsteelblue").style("border", "0px").style("border-radius",  "8px")			
		.style("pointer-events", "none");
	*/

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
	objectKeys = ["mainElement", "mainElementClass", "colorScaleValue", "colorScale"]
	objectVals = ["rect", "barCharts", yValue, function(d) { return "#000000";}] 
	this.objectProperties(objectKeys, objectVals)

	var selectValue = this.mainElement + "." + this.mainElementClass;
	var graph = this.plot.select("g.mainGraph");
	var outline = this.outline;
	var CP = this.canvasProperties;	


	rangeYValue = d3.extent(data, function(x) { return x[yValue]; });
	graph.selectAll(".axis").remove();


	var xScale = d3.scaleBand().rangeRound([0, outline.width]).padding(0.1);
	var yScale = d3.scaleLinear().range([outline.height, 0]);

	//map data values (x,y) to graph scale
	xScale.domain(data.map(function(d) { return d[xValue]; }));
	yScale.domain([rangeYValue[0]*.8, rangeYValue[1] *1.2]);

	// Create Axis group
	var xAxisGroup = graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", "x axis");
	var yAxisGroup = graph.append("g").attr("class", "y axis");


	// Create Axis
	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	// Call Axis
	xAxisGroup.transition().duration(1000).call(xAxis);
	yAxisGroup.transition().duration(1000).call(yAxis);

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
