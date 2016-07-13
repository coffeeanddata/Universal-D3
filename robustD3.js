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
		.style("background-color", "#F8F8F9");
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
	objectKeys = ["data", "xValue", "yValue", "mainElement", "mainElementClass", "colorScaleValue", "colorScale"]
	objectVals = [data, xValue, yValue, "circle", "scatterPlotCircles", yValue, function(d) { return "#000000";}] 
	this.objectProperties(objectKeys, objectVals)


	var selectValue = this.mainElement + "." + this.mainElementClass;
	var graph = this.plot.select("g.mainGraph");
	var outline = this.outline;
	var CP  = this.canvasProperties;	

	graphTrans = d3.transition().duration(1000);
	this.createAxis("number", "number")
	yScale = this.axisProperties.yScale;
	xScale = this.axisProperties.xScale;
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



setCanvas.prototype.colorFeature = function(variableKey, color){
	var CP = this.canvasProperties, data = CP.data,
		graph = this.plot.select("g.mainGraph");

	var selectValue = CP.mainElement + "." + CP.mainElementClass;
	getScatter = graph.selectAll(selectValue).data(data);
	getScatter.attr("fill", function(d) { return color(d[variableKey]); });
	CP.colorScale = color;
	CP.colorScaleValue = variableKey;
}


setCanvas.prototype.createTips = function( toolTipText){
	var	CP = this.canvasProperties, graph = this.plot.select("g.mainGraph"),
		data = data = CP.data,
		selectors = d3.selectAll(CP.mainElement);
	var divToolTip = d3.select("body").append("div").attr("class","divToolTip"+this.plotID);
	divToolTip
		.attr("storeText", toolTipText)
		.style("position",  "absolute").style("width", "80px").style("height", "auto")
		.style("padding", "4px").style("background-color", "white").style("-webkit-border-radius","10px")
        .style("-moz-border-radius", "10px").style("border-radius", "10px")
		.style("-webkit-box-shadow", "4px 4px 10px rgba(0, 0, 0, 0.4)")
		.style("-moz-box-shadow" ,"4px 4px 10px rgba(0, 0, 0, 0.4)")
    	.style("box-shadow", "4px 4px 10px rgba(0, 0, 0, 0.4)")
        .style("pointer-events", "none").style("opacity", "0");
		// tool tip theme 
		//http://chimera.labs.oreilly.com/books/1230000000345/ch10.html#_hover_to_highlight

	selectCanvas = d3.select("div#"+this.plotID);
	selectCanvas.on("mouseover", function(d) { canvasID = d3.select(this).attr("id"); })
	selectors.on("mouseover", function (d) {
		originalColor = d3.select(this).attr("fill")
		d3.select(this).attr("fill", "lightsteelblue");
		getDivToolTip = d3.select("div.divToolTip"+ canvasID);
		var	toolTipText = getDivToolTip.attr("storeText");
		getDivToolTip.transition().duration(250).text(toolTipText + ": " + d[toolTipText])
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 30) + "px")
			.style("opacity", 1);
		})
		.on("mouseout", function(d){
			d3.select(this).attr("fill",originalColor) 
		getDivToolTip = d3.select("div.divToolTip" + canvasID);
		getDivToolTip.transition().duration(0).style("opacity", 0);
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


// BarPlot

setCanvas.prototype.groupedBarPlotCheck = function(gValue, charValue, intValue){
	var CP = this.canvasProperties;
	console.log(CP.stacked)
	CP.mainElementClass = typeof(gValue) == "string" ? (CP.stacked == true ? "stackedBarPlot" : "groupBarPlot") : CP.mainElementClass
	if(typeof(gValue) == "string"){
		getKeys = [];
		groupedByCharAxis = {}
		groupByGValue    =  d3.nest().key(function(k) { return k[gValue]; } ).entries(CP.data);
		groupByCharValue =  d3.nest().key(function(k) { return k[charValue]; } ).entries(CP.data);

		groupByGValue.map(function(d){ 
			getKeys.push(d["key"]);
		})

		groupByCharValue.map(function(d) { 
			mapObj =  {};
			cumulativeSumArray = [];
			d.values.map(function(g) {
				mapObj[g[gValue]] = d3.sum(cumulativeSumArray);
				//temporary Value that will be removed once cummulaitve sum workjed correctly
				mapObj[g[gValue] + "original"] = g[intValue];
				cumulativeSumArray.push(g[intValue])

			})
			groupedByCharAxis[d["key"]] = mapObj;
		})
		CP.data.map(function(d) { 
			d["gValueIndex"] = getKeys.indexOf(d[gValue] + "");
			var getCharValueObj = groupedByCharAxis[d[charValue]]
			d["barStartValue"]  = getCharValueObj[d[gValue]]
		})
		this.canvasProperties.groupValueKeys = getKeys;
	}
}


setCanvas.prototype.barPlot = function(data, xValue, yValue, gValue, stacked){
	objectKeys = ["data","yValue", "xValue", "gValue", "stacked", "mainElement", "mainElementClass", "colorScaleValue", "colorScale"]
	objectVals = [data,   yValue,   xValue,   gValue,  stacked,   "rect", "barPlot", yValue, function(d) { return "#000000";}] 
	this.objectProperties(objectKeys, objectVals)
	
	
	//this.canvasProperties.mainElementClass = typeof(gValue) == "string" ? "groupBarPlot" : "barPlot";
	var selectValue = this.mainElement + "." + this.mainElementClass,
		graph = this.plot.select("g.mainGraph"),
		outline = this.outline,
		CP = this.canvasProperties;	
	var tForTransition = d3.transition().duration(500);

	var typeofX = typeof(data[0][xValue]),
		typeofY = typeof(data[0][yValue]),
		charVal = (typeofX == "string") ? xValue : yValue,
		numVal  = (typeofX == "numeric") ? xValue : yValue;
	this.groupedBarPlotCheck(gValue, charVal, numVal)
	this.barChartLogistics(typeofX, typeofY)
	this.createAxis(typeofX, typeofY);
	yScale = this.axisProperties.yScale;
	xScale = this.axisProperties.xScale;


	var	bars = graph.selectAll(selectValue).data(data);
	bars.enter()
		.append(CP.mainElement)
		.attr("class", CP.mainElementClass)
		.attr("width",  0)
		.attr("height", 0)
		.attr("fill",   function(x) { return CP.colorScale(x[yValue]); })
	.merge(bars)
		.transition(tForTransition)
		.attr("width",  CP.barChartLogistics.widthFunction)
		.attr("height", CP.barChartLogistics.heightFunction)
		.attr("y",  	CP.barChartLogistics.yFunction)			
		.attr("x",      CP.barChartLogistics.xFunction) 
	if(this.mainDesc == undefined){
		this.updateDesc(xValue.toUpperCase(), yValue.toUpperCase(), xValue.toUpperCase() + " vs. " + yValue.toUpperCase())
	}
}


setCanvas.prototype.barChartLogistics = function(typeofX, typeofY){
	this.canvasProperties.barChartLogistics = {}
	var	BCLog = this.canvasProperties.barChartLogistics, outline = this.outline, CP = this.canvasProperties

	if(CP.mainElementClass == "barPlot") {
	
		if(typeofY == "number"){
			BCLog.heightFunction = function(x) { return outline.height - yScale(x[CP.yValue]); } 
			BCLog.widthFunction = function(x) { return xScale.bandwidth(); } 
			BCLog.yFunction = function(x) { return yScale(x[CP.yValue])};  
			BCLog.xFunction = function(x) {return   xScale(x[CP.xValue]) } 
		} else {	
			BCLog.heightFunction = function(x) { return yScale.bandwidth(); }
			BCLog.widthFunction = function(x) {return   xScale(x[CP.xValue]) } 
			BCLog.yFunction = function(x) { return yScale(x[CP.yValue])};  
			BCLog.xFunction = 0
		}
		/*
		BCLog.heightFunction = (typeofY == "number") ? function(x) { return outline.height - yScale(x[CP.yValue]); } :
			function(x) { return yScale.bandwidth(); }

		BCLog.widthFunction  = (typeofX == "number") ? 
			function(x) {return   xScale(x[CP.xValue]) } :
			function(x) { return xScale.bandwidth(); } 
		BCLog.xFunction = (typeofX == "number") ?
			0 :
			function(x) {return   xScale(x[CP.xValue]) } 
		BCLog.yFunction = function(x) { return yScale(x[CP.yValue])};  
*/
		}	else if (CP.mainElementClass == "stacked"){
			BCLog.heightFunction = (typeofY == "number") ?
				function(x) { return outline.height - yScale(x[CP.yValue]); } :
				function(x) { return yScale.bandwidth() / CP.groupValueKeys.length; } 
			BCLog.xFunction = (typeofX == "number") ?
				0 :
				function(x) { return xScale(x[CP.xValue]) + (x['gValueIndex']) * (xScale.bandwidth() / CP.groupValueKeys.length);  } 

			BCLog.widthFunction  = (typeofX == "number") ? 
				function(x) {return   xScale(x[CP.xValue]) } :
				function(x) { return xScale.bandwidth() / CP.groupValueKeys.length; } 
			BCLog.yFunction =	BCLog.Function = (typeofY == "number") ?
				function(x) { return yScale(x[CP.yValue])}  :
				function(x) { return yScale(x[CP.yValue]) + (x['gValueIndex']) * (yScale.bandwidth() / CP.groupValueKeys.length);  } 
	} else{
		BCLog.heightFunction = (typeofY == "number") ?
			function(x) { return outline.height - yScale(x[CP.yValue]); } :
			function(x) { return yScale.bandwidth() / CP.groupValueKeys.length; } 
		BCLog.xFunction = (typeofX == "number") ?
			0 :
			function(x) { return xScale(x[CP.xValue]) + (x['gValueIndex']) * (xScale.bandwidth() / CP.groupValueKeys.length);  } 

		BCLog.widthFunction  = (typeofX == "number") ? 
			function(x) {return   xScale(x[CP.xValue]) } :
			function(x) { return xScale.bandwidth() / CP.groupValueKeys.length; } 
		BCLog.yFunction =	BCLog.Function = (typeofY == "number") ?
			function(x) { return yScale(x[CP.yValue])}  :
			function(x) { return yScale(x[CP.yValue]) + (x['gValueIndex']) * (yScale.bandwidth() / CP.groupValueKeys.length);  } 
	}
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
		numberscatterPlotCircles : "numericBarPlot",
		numberbarPlot : "numericBarPlot",
		stringbarPlot : "charBarPlot",
		stringgroupBarPlot : "charBarPlot",
		numbergroupBarPlot : "numericBarPlot"
	}
}

setCanvas.prototype.charBarPlot = function(val, axisValue){
	var	data     = this.canvasProperties.data;
	var outline  = this.outline;

	this.axisProperties[axisValue + "Outline"] = (axisValue == "y") ? [outline.height, 0] : [0, outline.width];
	var valScale = d3.scaleLinear().range(this.axisProperties[axisValue + "Outline"]);
	var valScale = d3.scaleBand().rangeRound(this.axisProperties[axisValue + "Outline"]).padding(0.15);

	//map data values (x,y) to graph scale
	valScale.domain(data.map(function(d) { return d[val]; }));
	// Create Axis group
	var axisGroup = (axisValue == "y") ?  graph.append("g").attr("class", axisValue + "Axis axis") : graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", axisValue + "Axis axis");

	// Create Axis
	var setAxis = (axisValue == "y") ?  d3.axisLeft(valScale) : d3.axisBottom(valScale);

	// Call Axis
	axisGroup.transition().duration(1000).call(setAxis).selectAll("text").attr("class", axisValue + "AxisText axisText");
	return valScale;
}


setCanvas.prototype.numericBarPlot = function(val, axisValue){
	var	data    = this.canvasProperties.data;
	var outline = this.outline;
	rangeVal    = d3.extent(data, function(x) { return x[val]; });

	this.axisProperties[axisValue + "Outline"] = (axisValue == "y") ? [outline.height, 0] : [0, outline.width];
	var valScale = d3.scaleLinear().range(this.axisProperties[axisValue + "Outline"]);

	//map data values (x,y) to graph scale
	valScale.domain([rangeVal[0]*.7, rangeVal[1] *1.1]);

	// Create Axis group
	var axisGroup = (axisValue == "y") ?  graph.append("g").attr("class", axisValue + "Axis axis") : graph.append("g").attr("transform", "translate(0, " + outline.height + ")").attr("class", axisValue + "Axis axis");

	// Create Axis
	var setAxis = (axisValue == "y") ?  d3.axisLeft(valScale) : d3.axisBottom(valScale);

	// Call Axis
	axisGroup.transition().duration(1000).call(setAxis).selectAll("text").attr("class", axisValue + "AxisText axisText");
	return valScale;
}





setCanvas.prototype.createAxis = function(xType, yType){
	this.axisProperties = {}
	var axisObject = this.axisProperties;
//	this.axisProperties.NumericValue = (yType == "number") ? "height" : "width";
	axisObject.xType = xType, axisObject.yType = yType;

	allAxisFunctions = this.setAxisFunctions()
	var graphClass =	this.canvasProperties.mainElementClass;



	graph.selectAll(".axis").remove();
	this.axisProperties.yScale = this[allAxisFunctions[yType + graphClass]](this.canvasProperties.yValue, "y")
	this.axisProperties.xScale = this[allAxisFunctions[xType + graphClass]](this.canvasProperties.xValue, "x") 

}









































// random backup colors
//var countryScale = d3.scaleOrdinal().range(["#437a9f", "#e93641", "#728c3f", "#92c6db", "#f26262", "#FF9900", "#B62084", "#551A8B", "#109618" ]);
