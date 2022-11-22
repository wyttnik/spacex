import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

function setup(){
    const spaceX = new SpaceX();
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        RenderLaunches(data, listContainer);
        spaceX.launchpads().then(pads=>{
            drawMap(pads);
        });
    });
}

function RenderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.innerHTML = launch.name;
        item.classList.add('launch');
        item.setAttribute('launchpad',launch.launchpad);
        list.appendChild(item);
    })
    container.replaceChildren(list);
    list.onmouseover = list.onmouseout = event => {
        let e;
        if (event.type === 'mouseover' & 
            event.target.getAttribute('class') === 'launch') {
                event.target.style.color = 'red';
                e = document.getElementById(event.target.getAttribute('launchpad'))
                e.parentNode.appendChild(e).setAttribute('fill','red');
            }
            
        else if (event.type === 'mouseout' & 
            event.target.getAttribute('class') === 'launch') {
                event.target.style.color = '';
                e = document.getElementById(event.target.getAttribute('launchpad'))
                e.parentNode.appendChild(e).setAttribute('fill','blue');
            }
    };
}

function drawMap(pads){
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        .scale(70)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);
    var featureCollection = {
        features: pads.map(d=> {
            return {
                'type':'Feature',
                'geometry':{
                    'type':'Point',
                    'coordinates':[d.longitude,d.latitude]
                },
                'properties': { 'id':d.id }
            }
        })
    };

    svg.append("g")
    .selectAll("path")
    .data(Geo.features)
    .enter()
    .append("path")
    .attr("class", "topo")
    .attr("d", d3.geoPath()
        .projection(projection)
    )
    .attr("fill", function (d) {
        return d3.color();
    })
    .style("opacity", .7);

    svg.append("g")
    .attr('class','launchpads')
    .selectAll("path")
    .data(featureCollection.features)
    .enter()
    .append("path")
    .attr('id',d=>d.properties.id)
    .attr("d", d3.geoPath()
            .projection(projection)
        )
    .attr("fill", 'blue');
}
