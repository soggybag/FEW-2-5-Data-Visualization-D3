# D3 World Map Earthquake Data 

This example displays a map of the world and maps earthquakes incidents onto the map. 

See the live example [here](https://soggybag.github.io/FEW-2-5-Data-Visualization-D3/d3-world-map-earthquakes/index.html). 

## What is this? 

This example displays a world map using d3 and GeoJSON data. It loads historical earthquake data from a csv and maps all of the earthquakes with a magnitude greater than 7 onto the map. Hovering over an an earthquake displays the magnitude. This is all done using D3.js.

The data represented here covers 1965 to 2016 which is a lot of information! For this reason filtering to 7+ magnitude quakes shows a reasonable amount of information without bogging down the browser. 

The earthquake data contains the following fields: 

> Date, Time, Latitude, Longitude, Type, Depth, Depth Error, Depth Seismic Stations,
> Magnitude, Magnitude Type, Magnitude Error, Magnitude Seismic Stations,
> Azimuthal Gap, Horizontal Distance, Horizontal Error, Root Mean Square, ID,
> Source, Location Source, Magnitude Source, Status

That's a lot of data! This example only uses the Latitude, Longitude, and Magnitude. 

## Concepts

- Loading data d3.csv()
	- JS Promise and Promise.all()
- SVG
	- path
	- circle
	- rect
	- text
	- g
- Handling events d3.on()
- Projecting geojson data with d3.geoMercator()
- Normalizing data with d3.scaleLinear()

### Loading data d3.csv()

The example loads data from a CSV file using `d3.csv()`. There is a lot of data in this file making it an excellent for expanding on this project. 

The geojson is loaded with `d3.json()`.

#### JS Promise and Promise.all()

Since we're loading multiple data files we might as well load them at the same time. Using `Promise.all()` this becomes easy to do. 

```JS
// Load both json files with Promise.all()
const mapPromise = d3.json('world-110m2.json') // world-110m2.json
const dataPromise = d3.csv('earthquake.csv')
Promise.all([mapPromise, dataPromise])
	.then(handleData)

function handleData([topology, earthquakeData]) {
	//...
}
```

Note! Promise.all() resolves to an array where the first value (`topology`) is the data from the first promise, `mapPromise` in this case, and the second value (`earthquakeData`) is the value from the second promise `dataPromise`.

In this way we can handle the loading of two files with a single handler function: `handleData`. Notice here the values returned are deconstructed into the vars: `topology` and `earthquakeData`.

### SVG

Everything on the page is drawn with SVG using the following elements: `<g>`, `<path>`, `<text>`, `<rect>`, `<circle>`. 

#### g

The g element represents a group. Use this like you might use a div or section in an HTML document. 

The g is used here in a couple places. First it is used to contain contain all of the paths that make up the map. 

Second, it's used to hold popup. In the case to the popup the group is used as the parent since popup is made of two child elements: text, and rect. Using a group here makes it easy to move the children together since transforming the group also transforms it's children. 

#### path

The path element allows us to draw any shape formed from a series of lines and curves. This is most powerful drawing element available to SVG. You can draw just about anything with a path. 

Here the path is used to draw the shapes of the countries and continents of the map. 

#### text

Test is used to draw text. Use here to draw the magintude into the popup box. 

#### rect

The rect element draws a rectangle. A rect is drawn from the upper left corner. 

You'll draw a rect by setting the x and y to place the upper left corner and then set the width and height. 

#### circle

Use the circle to draw a circle. The circle is used here to show the locations of earthquakes on the map. 

You'll draw a circle by setting the cx and cy attributes which represent the center x and y of the circle. Set the circle r attribute to define it's radius. 

### Handling events d3.on()

Events are handled in d3 by using element `.on()`. The example uses `.on('mouseover', handler)` and `.on('mouseout', handler)` to show and hide the popup displaying the magnitude. 

Note! handler should be a function, not an arrow function! Using an arrow function here loses the reference to `this` that comes with the event. Using an arrow function the event handler would not be able to reference itself. In the example it's important to maintain a reference to the original element since the script wants to move the box to the position of circle you are hovering over. 

```JS
.on('mouseover', function (e, d) {
	...
	d3.select(this).attr('cx')
	...
})
```

Note! The `d3.on()` event while simialr to the standard `element.addEventListener()` is also different! The handler function receives two parameters, `e` and `d` in the sample code. The first is the event object, and the second is data associated with this element. 

### Projecting geojson data with d3.geoMercator()

The world is a globe and the screen is a flat surface. Mapping one to the other needs to make a few compromises. The example uses a mercador projection. This stretches regions as you get closer to the poles. 

```JS
const projection = d3.geoMercator()
	...
```

D3 supports many different projection types! Try them out for yourself. 

Try one of these: 

- `d3.geoAzimuthalEqualArea()`
- `d3.geoAzimuthalEquidistant()`
- `d3.geoGnomonic()`
- `d3.geoOrthographic()`
- `d3.geoStereographic()`
- `d3.geoAlbers()`
- `d3.geoConicConformal()`
- `d3.geoConicEqualArea()`
- `d3.geoConicEquidistant()`
- `d3.geoEquirectangular()`
- **`geoMercator()`**
- `d3.geoTransverseMercator()`

- https://www.d3indepth.com/geographic/

Once a projection is generated we need to pass that into a geo path generator. 

```JS
const path = d3.geoPath()
		.projection(projection)
```

To convert geoJSON into a path I'm using topojson library. 

```HTML
<script src="https://unpkg.com/topojson@3"></script>
```

The path is added to the svg document and drawn here: 

```JS
// Draw the map into the svg
g.selectAll('path')
	.data(topojson.feature(topology, topology.objects.countries).features)
	.enter()
	.append('path')
	.attr('d', path)
	.style('fill', (d, i) => colorScale(i)) // 
```

Data is pulled from geoJSON and a path is drawn for each country. 

- https://www.d3indepth.com/geographic/
- https://github.com/topojson/topojson

### Normalizing data with d3.scaleLinear()

Scales are used to convert values in the data to values that can be represented on the screen. The process normalizes data by scaling it from it's domain, the range of the source data, to a range, the range and type used to display it on the screen. 

To color each country I used a sequential scale: 

```JS
// Create a color scale 
const colorScale = d3.scaleSequential()
	.domain([0, 100]) // TODO: Get the number of continent shapes
	.interpolator(d3.interpolateRainbow)
```

While not a scale the projection acts as scale converting latitude and longitude into screen x and y. The following lines of code position the circles on the map: 

```JS
...
// Add circles at the lat and lon of each earthquake
	.attr('cx', d => projection([d.Longitude, d.Latitude])[0])
	.attr('cy', d => projection([d.Longitude, d.Latitude])[1])
...
```

- https://www.d3indepth.com/scales/

## Challenges!

You can expand your knowledge and practice your craft by expanding what is in this example. try these challenges: 

- The popup could display more information. This could be: 
	- Date
	- Station
	- Or anything else from the list above


## Credits

Sorry I can't credit the earthquake data, I don't know where it came from. 
