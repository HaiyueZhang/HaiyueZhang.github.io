let currentScene = 1;
let scenes = [];
let data = [];
let width = 1200;
let height = 600;
let margin = { top: 30, right: 30, bottom: 50, left: 100 };
let xScale = d3.scaleTime().range([margin.left, width - margin.right]); // Adjust the range of xScale
let yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
let xAxis = d3.axisBottom(xScale).ticks(6);
let yAxis = d3.axisLeft(yScale);
let parseDate = d3.timeParse("%Y-%m-%d");

let line = d3
  .line()
  .x((d) => xScale(d.date))
  .y((d) => yScale(d.cases));

let tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("background", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px");

let svg = d3
  .select("#scene-1")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.csv("/data/new-york-data.csv", (d) => {
  console.log(d);
  return {
    date: parseDate(d.date),
    state: d.state,
    cases: +d.cases,
    deaths: +d.deaths,
  };
}).then((d) => {
  data = d;
  setupScenes();
  showScene(1);
});

function setupScenes() {
  scenes[1] = svg.append("g").attr("id", "scene1");
  scenes[2] = svg.append("g").attr("id", "scene2").attr("opacity", 0);
  scenes[3] = svg.append("g").attr("id", "scene3").attr("opacity", 0);
  scenes[4] = svg.append("g").attr("id", "scene4").attr("opacity", 0);
  scenes[5] = svg.append("g").attr("id", "scene5").attr("opacity", 0);

  // Scene 1
  createScene1();

  // Scene 2
  createScene2();

  // Scene 3
  createScene3();

  // Scene 4
  createScene4();

  // Scene 5
  createScene5();
}

function hideDots(sceneId) {
  d3.select("#" + sceneId)
    .selectAll(".dot") // select all dots
    .style("display", "none"); // hide them
}

function showDots(sceneId) {
  d3.select("#" + sceneId)
    .selectAll(".dot") // select all dots
    .style("display", null); // show them (null will reset the display property to its default value)
}

function showScene(sceneNum) {
  scenes.forEach((s, i) => {
    s.transition()
      .duration(500)
      .attr("opacity", i === sceneNum ? 1 : 0);

    // If it's not the current scene, hide its dots
    if (i !== sceneNum) {
      hideDots("scene" + i);
    }
    // If it's the current scene, show its dots
    else {
      showDots("scene" + i);
    }
  });
  currentScene = sceneNum;
}

function createScene1() {
  // Filter the data for the time period of this scene
  let sceneData = data.filter(
    (d) =>
      d.date >= parseDate("2021-01-23") && d.date <= parseDate("2021-05-01")
  );

  xScale.domain(d3.extent(sceneData, (d) => d.date));
  yScale.domain([0, 90000]);

  // draw x-axis
  scenes[1]
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // Add label for the x-axis
  scenes[1]
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 40})`
    )
    .style("text-anchor", "middle")
    .text("Date");

  // draw y-axis
  scenes[1]
    .append("g")
    .attr("transform", `translate(${margin.left},0)`) // Shift the y-axis to the right
    .call(yAxis);

  // Add label for the y-axis
  scenes[1]
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left / 2},${height / 2}) rotate(-90)`
    ) // Adjust the label position
    .style("text-anchor", "middle")
    .text("Cases");

  // draw line
  scenes[1]
    .append("path")
    .datum(sceneData)
    .attr("fill", "none")
    .attr("stroke", "#d73027")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // draw title
  scenes[1]
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text(
      "New reported cases by day in New York from 2021-01-23 to 2021-05-01"
    );

  // draw dot
  scenes[1]
    .selectAll(".dot")
    .data(sceneData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) {
      return xScale(d.date);
    })
    .attr("cy", function (d) {
      return yScale(d.cases);
    })
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      // Add stroke around dot on hover
      d3.select(this).attr("stroke-width", 2).attr("r", 7); // Increase the radius here
      tooltip
        .html(
          `Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>Cases: ${d.cases}`
        )
        .style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", d3.pointer(event, this)[1] + 160 + "px")
        .style("left", d3.pointer(event, this)[0] + 80 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke", null)
        .attr("stroke-width", null)
        .attr("r", 5); // Restore the original radius here
      tooltip.style("visibility", "hidden");
    });

  // Add dialog box (a rectangle in SVG)
  scenes[1]
    .append("rect")
    .attr("x", 490) // x position of the box, adjust as needed
    .attr("y", 70) // y position of the box, adjust as needed
    .attr("width", 560) // width of the box, adjust as needed
    .attr("height", 105) // height of the box, adjust as needed
    .style("fill", "#FFEFD5") // color of the box
    .style("stroke", "black") // border color of the box
    .style("stroke-width", 1); // border width of the box

  // Add general annotation
  scenes[1]
    .append("text")
    .attr("x", 500) // Adjust x position as needed
    .attr("y", 90) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `During the first time period, the line chart of new reported case showed
      <tspan x='500' dy='1.2em'>recession trend, which decreased from 13909 to 2199 with several vibrations.</tspan>
      <tspan x='500' dy='1.2em'>State Government Response: On February 10, 2021, Large capacity</tspan>
      <tspan x='500' dy='1.2em'>areas reopen at 10% capacity, effective February 24, with a negative PCR</tspan>
      <tspan x='500' dy='1.2em'>test within 72 hours or full COVID-19 vaccination status required to attend.</tspan>`
    );

  let vertexPoint = sceneData.find((d) => +d.date === +parseDate("2021-03-24"));
  let vertexX = xScale(vertexPoint.date);
  let vertexY = yScale(vertexPoint.cases);

  // Define the arrow marker
  scenes[1]
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "arrow")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "#000000");

  // Add an arrow using line
  scenes[1]
    .append("line")
    .attr("x1", vertexX - 10) // start of the line (arrow tail)
    .attr("y1", vertexY - 40)
    .attr("x2", vertexX) // end of the line (arrow head)
    .attr("y2", vertexY)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end");

  // Add annotation
  scenes[1]
    .append("text")
    .attr("x", vertexX - 155) // Adjust x position as needed
    .attr("y", vertexY - 75) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `The new reported covid case reached a vertex of 20184 
      <tspan x='${
        vertexX - 155
      }' dy='1.2em'> on 2021-03-24 in the first period.</tspan>`
    );
}

function createScene2() {
  let sceneData = data.filter(
    (d) =>
      d.date >= parseDate("2021-05-02") && d.date <= parseDate("2021-08-08")
  );

  xScale.domain(d3.extent(sceneData, (d) => d.date));
  yScale.domain([0, 90000]);

  // draw x-axis
  scenes[2]
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // Add label for the x-axis
  scenes[2]
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 40})`
    )
    .style("text-anchor", "middle")
    .text("Date");

  // draw y-axis
  scenes[2]
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Add label for the y-axis
  scenes[2]
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left / 2},${height / 2}) rotate(-90)`
    ) // Adjust the label position
    .style("text-anchor", "middle")
    .text("Cases");

  // draw line
  scenes[2]
    .append("path")
    .datum(sceneData)
    .attr("fill", "none")
    .attr("stroke", "#1CBC23")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // draw title
  scenes[2]
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text(
      "New reported cases by day in New York from 2021-05-02 to 2021-08-08"
    );

  // draw dot
  scenes[2]
    .selectAll(".dot")
    .data(sceneData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) {
      return xScale(d.date);
    })
    .attr("cy", function (d) {
      return yScale(d.cases);
    })
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      // Add stroke around dot on hover
      d3.select(this).attr("stroke-width", 2).attr("r", 7); // Increase the radius here
      tooltip
        .html(
          `Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>Cases: ${d.cases}`
        )
        .style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", d3.pointer(event, this)[1] + 160 + "px")
        .style("left", d3.pointer(event, this)[0] + 80 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke", null)
        .attr("stroke-width", null)
        .attr("r", 5); // Restore the original radius here
      tooltip.style("visibility", "hidden");
    });

  // Add dialog box (a rectangle in SVG)
  scenes[2]
    .append("rect")
    .attr("x", 490) // x position of the box, adjust as needed
    .attr("y", 70) // y position of the box, adjust as needed
    .attr("width", 560) // width of the box, adjust as needed
    .attr("height", 105) // height of the box, adjust as needed
    .style("fill", "#FFEFD5") // color of the box
    .style("stroke", "black") // border color of the box
    .style("stroke-width", 1); // border width of the box

  // Add general annotation
  scenes[2]
    .append("text")
    .attr("x", 500) // Adjust x position as needed
    .attr("y", 90) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `During the second time period, the line chart of new reported case showed
      <tspan x='500' dy='1.2em'>plateau trend, which is around number of 800.</tspan>
      <tspan x='500' dy='1.2em'>State Government Response: On June 13, 2021, All capacity restrictions</tspan> 
      <tspan x='500' dy='1.2em'>lifted due to 70% of NYers getting at least one shot of the COVID-19 vaccine.</tspan> 
      <tspan x='500' dy='1.2em'>On June 24, 2021, State of Emergency expires.</tspan>`
    );

  let basePoint = sceneData.find((d) => +d.date === +parseDate("2021-06-29"));
  let baseX = xScale(basePoint.date);
  let baseY = yScale(basePoint.cases);

  // Define the arrow marker
  scenes[2]
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "arrow")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "#000000");

  // Add an arrow using line
  scenes[2]
    .append("line")
    .attr("x1", baseX - 10) // start of the line (arrow tail)
    .attr("y1", baseY - 40)
    .attr("x2", baseX) // end of the line (arrow head)
    .attr("y2", baseY)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end");

  // Add annotation
  scenes[2]
    .append("text")
    .attr("x", baseX - 155) // Adjust x position as needed
    .attr("y", baseY - 75) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `The new reported covid case reached a trough in the second period,
    <tspan x='${
      baseX - 155
    }' dy='1.2em'>the lowest point was at 244 cases on 2021-06-29.</tspan>`
    );
}

function createScene3() {
  let sceneData = data.filter(
    (d) =>
      d.date >= parseDate("2021-08-09") && d.date <= parseDate("2021-11-15")
  );

  xScale.domain(d3.extent(sceneData, (d) => d.date));
  yScale.domain([0, 90000]);

  // draw x-axis
  scenes[3]
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // Add label for the x-axis
  scenes[3]
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 40})`
    )
    .style("text-anchor", "middle")
    .text("Date");

  // draw y-axis
  scenes[3]
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Add label for the y-axis
  scenes[3]
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left / 2},${height / 2}) rotate(-90)`
    ) // Adjust the label position
    .style("text-anchor", "middle")
    .text("Cases");

  // draw line
  scenes[3]
    .append("path")
    .datum(sceneData)
    .attr("fill", "none")
    .attr("stroke", "#FFD850")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // draw title
  scenes[3]
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text(
      "New reported cases by day in New York from 2021-08-09 to 2021-11-15"
    );

  // draw dot
  scenes[3]
    .selectAll(".dot")
    .data(sceneData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) {
      return xScale(d.date);
    })
    .attr("cy", function (d) {
      return yScale(d.cases);
    })
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      // Add stroke around dot on hover
      d3.select(this).attr("stroke-width", 2).attr("r", 7); // Increase the radius here
      tooltip
        .html(
          `Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>Cases: ${d.cases}`
        )
        .style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", d3.pointer(event, this)[1] + 160 + "px")
        .style("left", d3.pointer(event, this)[0] + 80 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke", null)
        .attr("stroke-width", null)
        .attr("r", 5); // Restore the original radius here
      tooltip.style("visibility", "hidden");
    });

  // Add dialog box (a rectangle in SVG)
  scenes[3]
    .append("rect")
    .attr("x", 490) // x position of the box, adjust as needed
    .attr("y", 70) // y position of the box, adjust as needed
    .attr("width", 560) // width of the box, adjust as needed
    .attr("height", 125) // height of the box, adjust as needed
    .style("fill", "#FFEFD5") // color of the box
    .style("stroke", "black") // border color of the box
    .style("stroke-width", 1); // border width of the box

  // Add general annotation
  scenes[3]
    .append("text")
    .attr("x", 500) // Adjust x position as needed
    .attr("y", 90) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `During the third time period, the line chart of new reported case shows
    <tspan x='500' dy='1.2em'>fluctuating trend, which vibrated in a range from 2500 to 7500.</tspan>
    <tspan x='500' dy='1.2em'>State Government Response: On August 27, 2021, Gov. Hochul and the New</tspan> 
    <tspan x='500' dy='1.2em'>York State Department of Health institute a universal mask mandate for all</tspan> 
    <tspan x='500' dy='1.2em'>public and private schools for students, staff, and faculty in response to the</tspan>
    <tspan x='500' dy='1.2em'>emerging Delta variant. </tspan>`
    );
}

function createScene4() {
  // Filter the data for the time period of this scene
  let sceneData = data.filter(
    (d) =>
      d.date >= parseDate("2021-11-16") && d.date <= parseDate("2022-02-23")
  );

  xScale.domain(d3.extent(sceneData, (d) => d.date));
  yScale.domain([0, 90000]);

  // draw x-axis
  scenes[4]
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // Add label for the x-axis
  scenes[4]
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 40})`
    )
    .style("text-anchor", "middle")
    .text("Date");

  // draw y-axis
  scenes[4]
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Add label for the y-axis
  scenes[4]
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left / 2},${height / 2}) rotate(-90)`
    ) // Adjust the label position
    .style("text-anchor", "middle")
    .text("Cases");

  // draw line
  scenes[4]
    .append("path")
    .datum(sceneData)
    .attr("fill", "none")
    .attr("stroke", "#0094FF")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // draw title
  scenes[4]
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text(
      "New reported cases by day in New York from 2021-11-16 to 2022-02-23"
    );

  // draw dot
  scenes[4]
    .selectAll(".dot")
    .data(sceneData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) {
      return xScale(d.date);
    })
    .attr("cy", function (d) {
      return yScale(d.cases);
    })
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      // Add stroke around dot on hover
      d3.select(this).attr("stroke-width", 2).attr("r", 7); // Increase the radius here
      tooltip
        .html(
          `Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>Cases: ${d.cases}`
        )
        .style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", d3.pointer(event, this)[1] + 160 + "px")
        .style("left", d3.pointer(event, this)[0] + 80 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke", null)
        .attr("stroke-width", null)
        .attr("r", 5); // Restore the original radius here
      tooltip.style("visibility", "hidden");
    });

  // Add dialog box (a rectangle in SVG)
  scenes[4]
    .append("rect")
    .attr("x", 140) // x position of the box, adjust as needed
    .attr("y", 70) // y position of the box, adjust as needed
    .attr("width", 360) // width of the box, adjust as needed
    .attr("height", 150) // height of the box, adjust as needed
    .style("fill", "#FFEFD5") // color of the box
    .style("stroke", "black") // border color of the box
    .style("stroke-width", 1); // border width of the box

  // Add general annotation
  scenes[4]
    .append("text")
    .attr("x", 150) // Adjust x position as needed
    .attr("y", 90) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `During the fourth time period, the line chart of 
  <tspan x='150' dy='1.2em'>new reported case showed surge, peak point,</tspan>
  <tspan x='150' dy='1.2em'>and plummeting. The whole trend graph was</tspan>
  <tspan x='150' dy='1.2em'>same as a normal distirbution.</tspan> 
  <tspan x='150' dy='1.2em'>State Government Response: On November 27,</tspan>
  <tspan x='150' dy='1.2em'>2021, A new pre-emptive State of Emergency is</tspan>
  <tspan x='150' dy='1.2em'>declared over Omicron variant.</tspan>`
    );

  // Add dialog box (a rectangle in SVG)
  scenes[4]
    .append("rect")
    .attr("x", 810) // x position of the box, adjust as needed
    .attr("y", 120) // y position of the box, adjust as needed
    .attr("width", 385) // width of the box, adjust as needed
    .attr("height", 185) // height of the box, adjust as needed
    .style("fill", "#FFEFD5") // color of the box
    .style("stroke", "black") // border color of the box
    .style("stroke-width", 1); // border width of the box

  // Add general annotation
  scenes[4]
    .append("text")
    .attr("x", 818) // Adjust x position as needed
    .attr("y", 141) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `State Government Response: On December 20 and 
  <tspan x='818' dy='1.2em'>31, 2021, Gov. Hochul announces two "Winter Surge </tspan>
  <tspan x='818' dy='1.2em'>Plans", which includes simplified school testing </tspan>
  <tspan x='818' dy='1.2em'>regulations, new testing sites, mask and home test </tspan>
  <tspan x='818' dy='1.2em'>distribution, and a $65 million fund for county</tspan>
  <tspan x='818' dy='1.2em'>governments to support vaccination efforts. Also, </tspan>
  <tspan x='818' dy='1.2em'>students are required to be vaccinated and boosted</tspan> 
  <tspan x='818' dy='1.2em'>by January 15 in order to return to campus, and an</tspan>
  <tspan x='818' dy='1.2em'> extension of the mask or vax mandate to February 1.</tspan>`
    );

  let vertexPoint = sceneData.find((d) => +d.date === +parseDate("2022-01-08"));
  let vertexX = xScale(vertexPoint.date);
  let vertexY = yScale(vertexPoint.cases);

  // Define the arrow marker
  scenes[4]
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "arrow")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "#000000");

  // Add an arrow using line
  scenes[4]
    .append("line")
    .attr("x1", vertexX + 150) // start of the line (arrow tail)
    .attr("y1", vertexY + 30)
    .attr("x2", vertexX) // end of the line (arrow head)
    .attr("y2", vertexY)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end");

  // Add annotation
  scenes[4]
    .append("text")
    .attr("x", vertexX + 155) // Adjust x position as needed
    .attr("y", vertexY + 45) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `The new reported covid case reached the peak at
      <tspan x='${
        vertexX + 155
      }' dy='1.2em'>90132 on 2022-01-08 for the whole time period. </tspan>`
    );

  let basePoint = sceneData.find((d) => +d.date === +parseDate("2021-12-25"));
  let baseX = xScale(basePoint.date);
  let baseY = yScale(basePoint.cases);

  // Define the arrow marker
  scenes[4]
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "arrow")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "#000000");

  // Add an arrow using line
  scenes[4]
    .append("line")
    .attr("x1", baseX + 25) // start of the line (arrow tail)
    .attr("y1", baseY - 40)
    .attr("x2", baseX) // end of the line (arrow head)
    .attr("y2", baseY)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end");

  // Add annotation
  scenes[4]
    .append("text")
    .attr("x", baseX + 25) // Adjust x position as needed
    .attr("y", baseY - 120) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `The new reported covid case 
    <tspan x='${
      baseX + 25
    }' dy='1.2em'>is 0 on 2021-12-25, which is weird.</tspan>
    <tspan x='${
      baseX + 25
    }' dy='1.2em'>I believe this day new york does not </tspan>
    <tspan x='${
      baseX + 25
    }' dy='1.2em'>test and record covid cases, which</tspan>
    <tspan x='${baseX + 25}' dy='1.2em'>is an outlier.</tspan>`
    );
}

function createScene5() {
  // Filter the data for the time period of this scene
  let sceneData = data.filter(
    (d) =>
      d.date >= parseDate("2021-01-23") && d.date <= parseDate("2022-02-23")
  );

  xScale.domain(d3.extent(sceneData, (d) => d.date));
  yScale.domain([0, 90000]);

  // draw x-axis
  scenes[5]
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // Add label for the x-axis
  scenes[5]
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 40})`
    )
    .style("text-anchor", "middle")
    .text("Date");

  // draw y-axis
  scenes[5]
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Add label for the y-axis
  scenes[5]
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left / 2},${height / 2}) rotate(-90)`
    ) // Adjust the label position
    .style("text-anchor", "middle")
    .text("Cases");

  // Color function
  const colorScale = d3
    .scaleOrdinal()
    .domain(["Recession", "Plateau", "Fluctuating", "Surge, Plummeting"])
    .range(["#d73027", "#1CBC23", "#FFD850", "#0094FF"]); // adjust colors as needed

  // Segments' boundaries
  const boundaries = [
    parseDate("2021-05-01"), // Recession end
    parseDate("2021-08-08"), // Plateau end
    parseDate("2021-11-15"), // Fluctuating end
    parseDate("2022-02-23"), // Surge end
  ];

  // Function to get segment name based on date
  function getSegmentName(date) {
    if (date < boundaries[0]) return "Recession";
    if (date < boundaries[1]) return "Plateau";
    if (date < boundaries[2]) return "Fluctuating";
    return "Surge, Plummeting";
  }

  // Add the line
  sceneData.forEach((d, i) => {
    if (i === 0) return; // skip the first element

    const segmentName = getSegmentName(d.date);
    const color = colorScale(segmentName);

    scenes[5]
      .append("line")
      .attr("x1", xScale(sceneData[i - 1].date))
      .attr("y1", yScale(sceneData[i - 1].cases))
      .attr("x2", xScale(d.date))
      .attr("y2", yScale(d.cases))
      .attr("stroke", color)
      .attr("stroke-width", 2.5);
  });

  // Add legend
  let legend = scenes[5]
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(["Recession", "Plateau", "Fluctuating", "Surge, Plummeting"])
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend
    .append("rect")
    .attr("x", 125)
    .attr("y", 40)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", colorScale);

  legend
    .append("text")
    .attr("x", 150)
    .attr("y", 50)
    .attr("dy", "0.32em")
    .text(function (d) {
      return d;
    });

  // draw title
  scenes[5]
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text(
      "New reported cases by day in New York from 2021-01-23 to 2022-02-23"
    );

  // Add dialog box (a rectangle in SVG)
  scenes[5]
    .append("rect")
    .attr("x", 360) // x position of the box, adjust as needed
    .attr("y", 70) // y position of the box, adjust as needed
    .attr("width", 570) // width of the box, adjust as needed
    .attr("height", 105) // height of the box, adjust as needed
    .style("fill", "#FFEFD5") // color of the box
    .style("stroke", "black") // border color of the box
    .style("stroke-width", 1); // border width of the box

  // Add general annotation
  scenes[5]
    .append("text")
    .attr("x", 370) // Adjust x position as needed
    .attr("y", 90) // Adjust y position as needed
    .style("font-size", "16px")
    .style("fill", "black")
    .html(
      `With contributions from various government measures, the number of new
    <tspan x='370' dy='1.2em'>COVID-19 cases decreased gradually in the first half of the period. However,</tspan>
    <tspan x='370' dy='1.2em'>due to the rapid spread of the Omicron variant, the numbers demonstrated</tspan> 
    <tspan x='370' dy='1.2em'>exponential growth. This increase was curtailed after the government</tspan> 
    <tspan x='370' dy='1.2em'>announced two "Winter Surge Plans", which led to a dramatic decline in cases.</tspan>`
    );
}

// Add an event listener to the buttons
d3.select("#button1").on("click", function () {
  showScene(1);
});

d3.select("#button2").on("click", function () {
  showScene(2);
});

d3.select("#button3").on("click", function () {
  showScene(3);
});

d3.select("#button4").on("click", function () {
  showScene(4);
});

d3.select("#button5").on("click", function () {
  showScene(5);
});
