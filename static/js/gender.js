// Step 1: Set up our chart
//=================================

var svgWidth = 1400;
var svgHeight = 500;

var margin = {
  top: 60,
  right: 50,
  bottom: 80,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);



// Step 3:
// Import data from flask this file represents USA Athletes Gold Medal winners
// =================================
d3.json("/counts").then(function(usaData) {
  // Step 4: Parse the data
  // Format the data and convert to numerical and date values
  // =================================
  // Create a function to parse date and time
  var parseTime = d3.timeParse("%Y");
    
  // Format the data
  usaData.forEach(function(data) {
    data.year = parseTime(data.year);
    data.male = +data.male;
    data.female = +data.female;
  });

  // Step 5: Create the scales for the chart
  // =================================
  var xTimeScale = d3.scaleTime()
    .domain(d3.extent(usaData, d => d.year))
    .range([0, width]);

  var yLinearScale1 = d3.scaleLinear()
    .range([height, 0])
    .domain([0,d3.max(usaData, d => d.male)])
  var yLinearScale2 = d3.scaleLinear()
    .range([height, 0])
    .domain([0,d3.max(usaData, d => d.female)])
  


  // Step 7: Create the axes
  // =================================
  var bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%Y"));
  var leftAxis = d3.axisLeft(yLinearScale1);
  var rightAxis = d3.axisRight(yLinearScale2);



  // Step 8: Append the axes to the chartGroup
  // ==============================================
  // Add x-axis
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // Add y1-axis to the left side of the display
  chartGroup.append("g").call(leftAxis);

  // Add y2-axis to the right side of the display
  chartGroup.append("g").attr("transform", `translate(${width}, 0)`).call(rightAxis);

  // Step 9: Set up two line generators and append two SVG paths
  // ==============================================

  // Line generator for male data
  var line1 = d3.line()
    .x(d => xTimeScale(d.year))
    .y(d => yLinearScale1(d.male));

  // Line generator for female data
  var line2 = d3.line()
    .x(d => xTimeScale(d.year))
    .y(d => yLinearScale2(d.female));

  // Append a path for line1
  chartGroup.append("path")
    .data([usaData])
    .attr("d", line1)
    .classed("line blue", true);

  // Append a path for line2
  chartGroup.append("path")
    .data([usaData])
    .attr("d", line2)
    .classed("line red", true);

  // append circles to data points
  var circlesGroup = chartGroup.selectAll("circle")
    .data([usaData])
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xTimeScale(i))
    .attr("cy", d => yLinearScale1(d.male))
    .attr("r", "5")
    .attr("fill", "blue");

  var circlesGroup = chartGroup.selectAll("circle")
    .data([usaData])
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xTimeScale(i))
    .attr("cy", d => yLinearScale2(d.female))
    .attr("r", "5")
    .attr("fill", "red");  

  // Append a div to the body to create tooltips, assign it a class
  var toolTip = d3.select("body").append("div")
    .attr("class", "tooltip");
    
  circlesGroup.on("mouseover", function(d, i) {
    toolTip.style("display", "block");
    toolTip.html(`Athletes: <strong>${usaData[i]}</strong>`)
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px");
  })  
    .on("mouseout", function() {
      toolTip.style("display", "none");
    })

  // Add color coded titles to the x-axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .text("Gold Medal Athletes");

  chartGroup.append("text")
    // Position the text
    // Center the text:
    // (https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor)
    .attr("transform", `translate(${width / 2}, ${height + margin.top})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "blue")
    .text("USA Male Gold Medal Athletes");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "red")
    .text("USA Female Gold Medal Athletes");
}).catch(function(error) {
  console.log(error);
});