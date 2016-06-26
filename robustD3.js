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
	outline.plot = canvasSVG;
	outline.plotID = barId;
	return outline;
}




//scatterplot using bind, append, enter, update, and exit
// only handles numeric vs numeric not really made to be used with categorical vs numeric plotting
setCanvas.prototype.scatterPlot = function(data, xValue, yValue){
	this.mainElement = "circle";
	this.mainElementClass = "scatterPlotCircles"
	var selectValue = this.mainElement + "." + this.mainElementClass;
	graph = this.plot.select("g.mainGraph");
	outline = this;

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
	scatter.enter().append(this.mainElement)
		.attr("class", this.mainElementClass)
		.attr("r", 0)
	.merge(scatter)
		.transition(graphTrans)
		.attr("cx", function(x) { return xScale(x[xValue]); })
		.attr("cy", function(x) { return yScale(x[yValue]); })
		.attr("r", 5) 


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
	if(this.mainDesc == undefined){
		tempObj = {
			"xLabel"    : { "xCord" : (this.leftMargin + this.width/2), "yCord" : (this.height + this.topMargin + this.bottomMargin/2), "rotate" : 0, "fontSize" : (this.width/20),"label" : xLabel},
			"yLabel"    : { "xCord" : (this.leftMargin/2), "yCord" : (this.topMargin + this.height/2), "rotate" : -90, "fontSize" : (this.height/20),  "label" : yLabel},
			"mainTitle" : { "xCord" : (this.leftMargin + this.width/2), "yCord" : (this.topMargin/2), "rotate" : 0, "fontSize" : (this.width/20), "label" : mainTitle}
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

	newText.text(function(d) { return d.label; })
		.attr("transform", function(d) { return "translate(" + d.xCord +"," + d.yCord + ") " + "rotate(" + d.rotate + ")"; })
		.attr("font-size", function(d) { return d.fontSize; })
	newText.exit().remove();
}



setCanvas.prototype.colorFeature = function(data, variableKey, color){
	var selectValue = this.mainElement + "." + this.mainElementClass;
	graph = this.plot.select("g.mainGraph");
	getScatter = graph.selectAll(selectValue).data(data);
	getScatter.attr("fill", function(d) { return color(d[variableKey]); });
	this.colorScale = color;
	this.colorScaleValue = variableKey;
}


setCanvas.prototype.createTips = function(data, toolTipText){
	colorScale = this.colorScale;
	colorScaleValue = this.colorScaleValue;
	var graph = this.plot.select("g.mainGraph")
	var selectors = d3.selectAll(this.mainElement);
	var divToolTip = d3.select("body").append("div").attr("class","divToolTip")
		.style("opacity" , "0").style("position",  "absolute").style("text-align", "center").style("width",  "60px")					
		.style("height",  "28px").style("padding",  "2px").style("font",  "12px sans-serif")
		.style("background",   "lightsteelblue").style("border", "0px").style("border-radius",  "8px")			
		.style("pointer-events", "none");
	
		

	selectors.on("mouseover", function (d) {
		d3.select(this).attr("fill", "lightsteelblue");
		getDivToolTip = d3.select("div.divToolTip");
		getDivToolTip.transition().duration(500).text(toolTipText + ": " + d[toolTipText])
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 30) + "px")
			.style("opacity", ".9");

	       
		})
		.on("mouseout", function(d){
			d3.select(this).attr("fill", colorScale(d[colorScaleValue]))
		getDivToolTip = d3.select("div.divToolTip");
		getDivToolTip.transition().duration(1000).style("opacity", 0);
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
	this.mainElement = "rect";
	this.mainElementClass = "barCharts"
	var selectValue = this.mainElement + "." + this.mainElementClass;
	var graph = this.plot.select("g.mainGraph");
	var outline = this;
	console.log(this);


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

	// Create Axis
	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

		
	// Call Axis
	xAxisGroup.transition().duration(1000).call(xAxis);
	yAxisGroup.transition().duration(1000).call(yAxis);


	var	bars = graph.selectAll(selectValue).data(data);
	bars.enter()
		.append(this.mainElement)
		.attr("class", this.mainElementClass)
		.attr("width", 15)
	.merge(bars)
		.attr("y", function(x) { return yScale(x[yValue]); })	//.attr("height", function(x) { return outline.height - yScale(x[yValue]); })
		.attr("height", function(x) { return  outline.height - yScale(x[yValue]); })
		.attr("x", function(d, i) {return i  * 20; })
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
