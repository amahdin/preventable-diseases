let question0 = function(data, worldMap, hivData) {
    // Convert 'Sum' and 'USA' to numbers
    data.forEach(row => {
        row['Sum'] = Number(row['Sum']);
        row['USA'] = Number(row['USA']);
    });

    // Sort data by 'Sum' and 'USA' in descending order separately
    let sortedSum = [...data].sort((a, b) => b['Sum'] - a['Sum']);
    let sortedUSA = [...data].sort((a, b) => b['USA'] - a['USA']);
    // Create JSON object for all diseases
    let allSumJson = {};
    data.forEach(row => {
        allSumJson[row['disease']] = Number(row['Sum']);
    });

    let allUSAJson = {};
    data.forEach(row => {
        allUSAJson[row['disease']] = Number(row['USA']);
    });

    //console.log("All Sum values:", allSumJson);
    //console.log("All USA values:", allUSAJson);

    // Create JSON object for top 5 diseases
    let topSumJson = {};
    sortedSum.slice(0, 5).forEach(row => {
        topSumJson[row['disease']] = Number(row['Sum']);
    });

    let topUSAJson = {};
    sortedUSA.slice(0, 5).forEach(row => {
        topUSAJson[row['disease']] = Number(row['USA']);
    });

    //console.log("Top 5 Sum values:", topSumJson);
    //console.log("Top 5 USA values:", topUSAJson);
    console.log(sortedSum)
    // Call question1, question2, question3 with top 5 diseases and all diseases
    question2(allUSAJson, allSumJson);
    question3(allUSAJson, allSumJson);

    // Call question4 with worldMap data
    question4(worldMap);
    question5(sortedSum, sortedUSA);
    question6(hivData);
}


let assignment5 = function() {
    let csvFilePath = "cleaned_csv.csv";
    let jsonFilePath = "updated_data.json";
    let csvForQ6 = 'clean_hiv.csv';
    
    // Load CSV data
    d3.csv(csvFilePath).then(function(data) {
        // Load JSON data
        d3.json(jsonFilePath).then(worldMap => {
            // Load CSV data for Q6
            d3.csv(csvForQ6).then(function(hivData) {
                // Call question0 with both CSV and JSON data, and the additional hivData
                question0(data, worldMap, hivData);
            });
        });
    });
}


let question4 = function(worldMap) {
    let width = 1000;
    let height = 800;

    const svg2 = d3.select("#q4_plot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection2 = d3.geoNaturalEarth1()
        .scale(200)
        .translate([width / 2, height / 2]);

    const pathgeo2 = d3.geoPath().projection(projection2);
    const tooltip = d3.select('.tooltip');

    // Define the quartiles
    const quartiles = [0.05, 0.1209143137941875, 0.27237637636063944, 1.0007743735838772];

    // Create a color scale with four categories
    const colorScale = d3.scaleThreshold()
        .domain(quartiles)
        .range(['white', "#ffcccc", "#ff9999", "#ff6666", "#ff0000"]);

    // Draw the globe outline
    svg2.append('path')
    .attr('class', 'sphere')
    .attr('d', pathgeo2({ type: 'Sphere' }))
    .attr("fill", "rgba(135, 206, 235, 0.3)");
    //title
    svg2.append("text")
    .attr("x", (width / 2))             
    .attr("y", 20)
    .attr("text-anchor", "middle")  
    .style("font-size", "20px") 
    .style("text-decoration", "underline")  
    .style("font-weight", "bold") 
    .text("Infectious and parasitic diseases across the world");


    // Draw the countries
    svg2.selectAll('.worldpath')
        .data(worldMap.features)
        .enter()
        .append("path")
        .attr('class', 'worldpath')
        .attr('d', pathgeo2)
        .attr("fill", d => colorScale(d.properties.population))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("fill", "coral");
            tooltip.style("opacity", 1)
                .html(d.properties.name + " : " + d.properties.population)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .attr("fill", d => colorScale(d.properties.population));
            tooltip.style("opacity", 0);
        });
};


let question2 = function(data_us, data_africa) {
    
    // get the number of data points
    const dataLength = Math.max(Object.keys(data_africa).length, Object.keys(data_africa).length);

    // define a scale for the circle's radius based on the sum value
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(Object.values(data_africa), d => d)]) 
        .range([2, 40]); // output range
    
    // calculate total height based on number of data points and maximum circle diameter
    const totalHeight = dataLength * 0.7 * radiusScale(d3.max(Object.values(data_africa), d => d));
    
    // Increase SVG canvas size
    const margin = {top: 50, right: 100, bottom: 70, left: 0},  
    width = 1000 - margin.left - margin.right, 
    height = totalHeight + margin.top + margin.bottom; 
    // create an svg container
    const svg = d3.select("#q2_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (margin.left-100) + "," + margin.top + ")");


    // Add title to the SVG
    
    svg.append("text")
        .attr("x", width / 2)             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .style("font-weight", "bold")  
        .text("Prevalent Diseases in Africa");

    // prepare data for force graph
    const nodes = Object.entries(data_africa).map(([id, value]) => ({id, value}));
    nodes.push({id: "Sum", value: Object.values(data_africa).reduce((a, b) => a + b)});
    const links = nodes.slice(0, -1).map(node => ({source: node.id, target: "Sum"}));

        // create a force simulation
        const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(300)) 
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // create a link (line) for each link in the links array
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line");
    
        // Define the div for the tooltip
    const div = d3.select("body").append("div") 
        .attr("class", "tooltip")                
        .style("opacity", 0);

        const colorScale = d3.scaleOrdinal()
        .domain(nodes.map(d => d.id)) 
        .range(d3.schemeCategory10); 
      
      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => Math.sqrt(d.value) * 15)
        .attr("fill", d => colorScale(d.id)) 
        .call(drag(simulation))
        .on("mouseover", function(event, d) {     
            div.transition()     
                .duration(200)      
                .style("opacity", .9);     
            div.html(d.id)  
                .style("left", (event.pageX) + "px")     
                .style("top", (event.pageY - 28) + "px");
            d3.select(this) 
                .transition()
                .duration(200)
                .style("fill", d => d.id === "Sum" ? "lightcoral" : "skyblue");
        })
        .on("mouseout", function(event, d) {     
            div.transition()     
                .duration(500)      
                .style("opacity", 0);
            d3.select(this) 
                .transition()
                .duration(200)
                .style("fill", function(d) { return colorScale(d.id); }); 
        
        
        });

    // update the positions of the links and nodes in the simulation
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // create a drag handler function
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}


let question3 = function(data_us, data_africa) {
    // get the number of data points
    const dataLength = Math.max(Object.keys(data_us).length, Object.keys(data_africa).length);

    // define a scale for the circle's radius based on the sum value
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(Object.values(data_us), d => d)]) 
        .range([2, 40]);
    
    // calculate total height based on number of data points and maximum circle diameter
    const totalHeight = dataLength * 0.7 * radiusScale(d3.max(Object.values(data_us), d => d));
    
    // Increase SVG canvas size
    const margin = {top: 50, right: 100, bottom: 70, left: 0},  
    width = 1000 - margin.left - margin.right, 
    height = totalHeight + margin.top + margin.bottom;
    // create an svg container
    const svg = d3.select("#q3_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (margin.left-100) + "," + margin.top + ")");


    // Add title to the SVG
    svg.append("text")
        .attr("x", width / 2)             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .style("font-weight", "bold")  
        .text("Prevalent Diseases in United States");


    const nodes = Object.entries(data_us).map(([id, value]) => ({id, value}));
    nodes.push({id: "Sum", value: Object.values(data_us).reduce((a, b) => a + b)});
    const links = nodes.slice(0, -1).map(node => ({source: node.id, target: "Sum"}));

        // create a force simulation
        const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(300)) 
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // create a link (line) for each link in the links array
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line");
    
        // Define the div for the tooltip
    const div = d3.select("body").append("div") 
        .attr("class", "tooltip")                
        .style("opacity", 0);
    const colorScale = d3.scaleOrdinal()
        .domain(nodes.map(d => d.id)) 
        .range(d3.schemeCategory10); 
      
      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => Math.sqrt(d.value) * 15)
        .attr("fill", d => colorScale(d.id)) 
        .call(drag(simulation))
        .on("mouseover", function(event, d) {    
            div.transition()     
                .duration(200)      
                .style("opacity", .9);     
            div.html(d.id)  
                .style("left", (event.pageX) + "px")     
                .style("top", (event.pageY - 28) + "px");
            d3.select(this) 
                .transition()
                .duration(200)
                .style("fill", d => d.id === "Sum" ? "lightcoral" : "skyblue");
        })
        .on("mouseout", function(event, d) {  
            div.transition()     
                .duration(500)      
                .style("opacity", 0);
            d3.select(this) 
                .transition()
                .duration(200)
                .style("fill", function(d) { return colorScale(d.id); }); 
        });
        

    
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}








let question5 = function(sortedSum, sortedUSA) {
    let displayedDiseases = 4;  
    let sortType = document.getElementById('sort-dropdown').value;  

    function update() {
        d3.select("#q5_plot").html("");  

        let sortedData = sortType === 'africa' ? sortedSum : sortedUSA;
        let titleText = sortType === 'africa' ? "Prevalent Diseases: Africa vs USA" : "Prevalent Diseases: USA vs Africa";

        let topDiseases = sortedData.slice(0, displayedDiseases);  
        let margin = {top: 30, right: 30, bottom: 70, left: 170},  
            width = 720 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        let svg = d3.select("#q5_plot")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

        
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text(titleText);

        let subgroups = ["USA", "Sum"];
        let legendNames = { 'USA': 'USA', 'Sum': 'Africa' };  

        let y = d3.scaleBand()
            .domain(topDiseases.map(d => d.disease))
            .range([0, height])
            .padding([0.2]);

        svg.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0))
            .selectAll("text")
                .style("font-weight", "bold")  
                .style("font-size", "10px");   

        let x = d3.scaleLinear()
            .domain([0, d3.max(topDiseases, d => d.Sum + d.USA)])
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        let color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#377eb8', '#e41a1c']); 

        let stackedData = d3.stack()
            .keys(subgroups)
            (topDiseases)

        
        let tooltip = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

        
        let mouseover = function(event, d) {
            let currentElement = d3.select(this);
            currentElement.attr("old_fill", currentElement.attr("fill")); 
            currentElement.style("fill", "#DAA520"); 
            tooltip.style("opacity", 1)
        }
        let mousemove = function(event, d) {
            tooltip
            .html((d[1] - d[0]))
            .style("left", (event.pageX+20) + "px")
            .style("top", (event.pageY) + "px")
        }
        let mouseleave = function(event, d) {
            let currentElement = d3.select(this);
            currentElement.style("fill", currentElement.attr("old_fill")); 
            tooltip.style("opacity", 0)
        }

        // Show the bars
        let bars = svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                    .attr("y", d => y(d.data.disease))
                    .attr("x", d => x(d[0]))
                    .attr("height", y.bandwidth())
                    .attr("width", d => x(0))  
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave);

        bars.transition()
            .duration(1000)  
            .attr("width", d => x(d[1]) - x(d[0]));  

        // Add a legend at the bottom
        let legend = svg.append("g")
        .attr("transform", `translate(0,${height + margin.bottom / 2})`);

        // Create rectangles for the legend
        legend.selectAll("rect")
        .data(subgroups)
        .enter()
        .append("rect")
            .attr("x", (d, i) => i * 100)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => color(d));

        // Add the labels for the legend
        legend.selectAll("text")
        .data(subgroups)
        .enter()
        .append("text")
            .attr("x", (d, i) => i * 100 + 15)
            .attr("y", 10)
            .text(d => legendNames[d])  // Use the legendNames map here
            .attr("text-anchor", "start")
            .style("alignment-baseline", "middle");
    }

    // Call update initially to draw the initial graph
    update();

    // Event listeners for the buttons
    document.getElementById('addButton').addEventListener('click', function() {
        if (displayedDiseases < sortedSum.length) {
            displayedDiseases++;
            update();  // Redraw the graph
        }
    });

    document.getElementById('removeButton').addEventListener('click', function() {
        if (displayedDiseases > 1) {
            displayedDiseases--;
            update();  // Redraw the graph
        }
    });

    // Event listener for the dropdown
    document.getElementById('sort-dropdown').addEventListener('change', function() {
        sortType = this.value;
        update();  // Redraw the graph
    });
};



let question6 = function(hivData) {
    let margin = {top: 10, right: 100, bottom: 60, left: 80},
        width = 840 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let svg = d3.select("#q6_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xScale = d3.scaleLinear()
        .domain(d3.extent(hivData, function(d) { return d.Year; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "15px");

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(hivData, function(d) {
            return Math.max.apply(Math, hivData.columns.slice(1).map(function(country){ return d[country]; }));
        })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "15px");

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let line = d3.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.value); });

    let countries = hivData.columns.slice(1);  

    // Create a map for storing line data by country
    let drawnLines = new Map();

    // Add initial countries to drawnLines
    let initialCountries = ['Eswatini', 'Lesotho', 'South Africa', 'Botswana', 'United States'];
    initialCountries.forEach(function(country) {
        if (countries.includes(country)) {
            let countryData = hivData.map(function(d) {
                return {Year: d.Year, value: +d[country]};
            });
            drawnLines.set(country, {data: countryData, newlyAdded: true});
        }
    });

    let redrawChart = function() {
        // Remove the existing lines and legends from the chart
        svg.selectAll("path").remove();
        svg.selectAll(".country-label").remove();
        svg.selectAll(".legend-circle").remove();
    
        let i = 0;
        drawnLines.forEach((countryData, country) => {
            // Draw line
            let linePath = svg.append("path")
                .datum(countryData.data)
                .attr("fill", "none")
                .attr("stroke", color(i))
                .attr("stroke-width", 3)
                .attr("d", line);
    
            // If the line is newly added, do the transition
            if (countryData.newlyAdded) {
                linePath.attr("stroke-dasharray", function() { return this.getTotalLength(); })
                        .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
                        .transition()
                        .duration(2000)  
                        .attr("stroke-dashoffset", 0);
                countryData.newlyAdded = false;  
            }
    
            // Draw the legend
            svg.append("circle")
                .attr("cx", width - 20)
                .attr("cy", 5 + i*20) 
                .attr("r", 6)
                .style("fill", color(i))
                .attr("class", "legend-circle"); 
    
            svg.append("text")
                .attr("x", width  - 10)  
                .attr("y", 10 + i*20)  
                .text(country)
                .attr("class", "country-label")  
                .style("font-size", "15px")
                .attr("alignment-baseline", "middle");
    
            i++;
        });
    
        // Re-add the axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("font-size", "15px");
    
        svg.append("g")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "15px");
    };
    

    redrawChart();
    
        // Event listener to add a country
        d3.select("#add-country").on("click", function() {
            let selectedCountry = d3.select("#country-dropdown").property("value");
            if (!drawnLines.has(selectedCountry)) {
                let countryData = hivData.map(function(d) {
                    return {Year: d.Year, value: +d[selectedCountry]};
                });
                drawnLines.set(selectedCountry, {data: countryData, newlyAdded: true});
            }
            redrawChart();
        });
    
        // Event listener to remove a country
        d3.select("#remove-country").on("click", function() {
            let selectedCountry = d3.select("#country-dropdown").property("value");
            drawnLines.delete(selectedCountry);
            redrawChart();
        });
    
        // Event listener to set the threshold
        d3.select("#set-threshold").on("click", function() {
            let threshold = +d3.select("#threshold").property("value");
            for (let [country, countryData] of drawnLines) {
                if (countryData.data[0].value < threshold) {
                    drawnLines.delete(country);
                }
            }
            redrawChart();
        });
    
        // Event listener to clear all countries
        d3.select("#clear-all").on("click", function() {
            drawnLines.clear();
            svg.selectAll("circle").remove();
            svg.selectAll(".country-label").remove();
            redrawChart();
        });

    // Create dropdown
    let dropdown = d3.select("#country-dropdown")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(function(d) { return d; })
        .attr("value", function(d) { return d; });

    // Add button event listener
    d3.select("#add-country").on("click", function() {
        let selectedCountry = d3.select("#country-dropdown").property("value");
        if (!drawnLines.has(selectedCountry)) {
            let countryData = hivData.map(function(d) {
                return {Year: d.Year, value: +d[selectedCountry]};
            });
            drawnLines.set(selectedCountry, {data: countryData, newlyAdded: true});
        }
        redrawChart();
    });

    // Remove button event listener
    d3.select("#remove-country").on("click", function() {
        let selectedCountry = d3.select("#country-dropdown").property("value");
        drawnLines.delete(selectedCountry);
        redrawChart();
    });

    // Clear All button event listener
    d3.select("#clear-all").on("click", function() {
        drawnLines.clear();
        svg.selectAll("circle").remove();
        svg.selectAll(".country-label").remove();
        redrawChart();
    });

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2 + margin.left)
        .attr("y", height + margin.bottom - 20)
        .text("Years")
        .style("font-size", "15px")
        .style("font-weight", "bold"); 

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height/2)
        .text("Rate per 1000")
        .style("font-size", "15px")
        .style("font-weight", "bold");
};