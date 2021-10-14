// ------------------------------------------------------
// Set the size of the map
const width = 960
const height = 500

// ------------------------------------------------------
// Load the earthquake data

// Load both json files with Promise.all()
const mapPromise = d3.json('world-110m2.json') // world-110m2.json
const dataPromise = d3.csv('earthquake.csv')
Promise.all([mapPromise, dataPromise])
	.then(handleData)


// Create a color scale 
const colorScale = d3.scaleSequential()
	.domain([0, 100]) // TODO: Get the number of continent shapes
	.interpolator(d3.interpolateRainbow)


// ------------------------------------------------------
// Handle the earthquake data

function handleData([topology, earthquakeData]) {

	// These are all of the properties available from the csv

	// Date,Time,Latitude,Longitude,Type,Depth,Depth Error,Depth Seismic Stations,
	// Magnitude,Magnitude Type,Magnitude Error,Magnitude Seismic Stations,
	// Azimuthal Gap,Horizontal Distance,Horizontal Error,Root Mean Square,ID,
	// Source,Location Source,Magnitude Source,Status

	// Get the min and max Magnitude values
	const magnitudeExtent = d3.extent(earthquakeData, d => d.Magnitude)
	// ["5.5", "9.1"]

	// Make a Magnitude scale
	const magnitudeScale = d3.scaleLinear()
		.domain(magnitudeExtent)
		.range([5, 10])

	
	// Filter for earthquakes greater than 7 magnitude
	const data = earthquakeData.filter(d => d.Magnitude > 7)



	// Create a projection
	const projection = d3.geoMercator()
		.center([0, 5])
		.scale(150)
		.rotate([-180, 0])

	
	// Select the body and appeand an svg element
	const svg = d3.select("#svg")
		.append("svg")
		.attr("width", width)
		.attr("height", height)

	
	// Create a path that will draw the map
	const path = d3.geoPath()
		.projection(projection)

	
	// Use this group to hold the map
	const g = svg.append('g')


	// Draw the map into the svg
	g.selectAll('path')
		.data(topojson.feature(topology, topology.objects.countries).features)
		.enter()
		.append('path')
		.attr('d', path)
		.style('fill', (d, i) => colorScale(i)) // 


	// Draw the earthquake locations
	d3.select('#svg')
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		// Add circles at the lat and lon of each earthquake
		.attr('cx', d => projection([d.Longitude, d.Latitude])[0])
		.attr('cy', d => projection([d.Longitude, d.Latitude])[1])
		// Set the radius of the circles. I used Depth/50 as a 
		// ballpark number. This could use some research
		.attr('r', d => magnitudeScale(d.Magnitude))
		.attr('stroke', '#000')
		.attr('stroke-width', '1')
		.style('fill', 'transparent')
		// .style('opacity', 0.1)
		// Add some mouse events
		.on('mouseover', function (e, d) {
			d3.select(this)
				.attr('stroke', '#f00')
			d3.select('.info-box')
				.attr('display', 'yes')
				.attr('transform', `translate(${d3.select(this).attr('cx')}, ${d3.select(this).attr('cy')})`)
			d3.select('.info-box text')
				.text(d.Magnitude)
		})
		.on('mouseout', function (d, i) {
			d3.select(this)
				.attr('stroke', '#000')
				d3.select('.info-box')
					.attr('display', 'none')
		})


	// Make an SVG element to show some info
	// The group is a container for a rect and text element
	const infoBox = d3.select('#svg')
		.append('g')
		.attr('class', 'info-box')
		.attr('display', 'none')

	// Make the black box 
	infoBox.append('rect')
		.attr('width', 100)
		.attr('height', 100)

	// Display the magnitude here
	infoBox
		.append('text')
		.text('0.0')
		.attr('fill', 'white')
		.attr('dx', 50)
		.attr('dy', 50)
		.attr('text-anchor', 'middle')
		.attr('font-size', 48)
		.attr('font-family', 'Helvetica')
		.attr('alignment-baseline', 'middle')

}