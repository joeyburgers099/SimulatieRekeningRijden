<template>
        <div id="wrapper">
        <div id="button">
                <button id='Start' @click="showDot2()">Start</button>
                <button id='AnimateLine' @click="animate()">AnimateLine</button>
        </div>
                <div id="map" @click="showDot()">

                </div>
        </div>
</template>

<style>
    body { margin:0; padding:5px; }
    #button{margin-left: 0px; padding-left: 15px; padding-bottom: 5px;padding-right: 5px; padding-top: 5px;}
    #map { position: absolute; height: 95%; width:97%;
            padding: 5px; margin: 10px;}
</style>


<script>
    // this is where the code for the next step will go
    import Mapbox from 'mapbox-gl';
    import * as turf from '@turf/turf'

    export default {
        name: 'app',
        components: {
            'mapbox': Mapbox
        },
        data() {
            return {}
        },
        mounted() {
                console.log('in mounted()');
            this.createMap();
        },
        methods: {
        showDot: function() {
                // coords
                var start = [7.426644, 43.740070];
                this.getRoute(start, this.map);
                // data variabele voor layer
                var car = { type: 'FeatureCollection',
                features: [{
                        type: 'Feature',
                        properties: {},
                        geometry: {
                                type: 'Point',
                                coordinates: start
                        }
                }]};
                // Als de layer niet bestaat maak hem aan anders niet.
                if(this.map.getLayer('begin')) {
                        console.log('layer begin bestaat al');
                }else{
                        this.map.addLayer({
                                id: 'begin',
                                type: 'circle',
                                source: {
                                        type: 'geojson',
                                        data: car
                                },
                                paint: {
                                        'circle-radius': 9,
                                        'circle-color': '#3887be'
                                }
                        });
                }

        },

                showDot2: function(){
                // coords
                var end = [7.415592, 43.735031];
                // data variabele voor de layer
                var endpoint = {
                        type: 'FeatureCollection',
                        features: [{
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                        type: 'Point',
                                        coordinates: end
                                }
                        }]};
                // Als de layer niet bestaat maak hem aan anders niet.
                if( this.map.getLayer('end')){
                        console.log('endpoint layer bestaat al')
                        this.getRoute(end, this.map);

                }else{
                        this.map.addLayer({
                                id: 'end',
                                type: 'circle',
                                source: {
                                        type: 'geojson',
                                        data: endpoint
                                },
                                paint: {
                                        'circle-radius': 9,
                                        'circle-color': '#f30'
                                }
                        });
                }
                },
                // Maakt de map aan
            createMap: function () {
                    console.log('in createMap')
                    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9leWJ1cmdlcnMwOTkiLCJhIjoiY2p0cG9iOTZtMDY2azRlczdybHU5OTU2eiJ9.BScZE0DWOamSxZpiYzf4pQ'
                    this.map = new Mapbox.Map({
                            container: 'map',
                            style: 'mapbox://styles/mapbox/streets-v11',  // stylesheet location
                            center: [7.426644, 43.740070], // starting position [lng, lat]
                            zoom: 13 // starting zoom
                    })
            },
            getRoute: function(end, map) {
                    // make a directions request using cycling profile
                    // an arbitrary start will always be the same
                    // only the end or destination will change
                    var start = [7.426644, 43.740070];
                    var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

                    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
                    var req = new XMLHttpRequest();
                    req.responseType = 'json';
                    req.open('GET', url, true);
                    req.onload = function() {
                            var data = req.response.routes[0];
                            console.log("data: " + data);
                            var route = data.geometry.coordinates;
                            console.log("route: " + route);
                            var geojson = {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                            type: 'LineString',
                                            coordinates: route
                                    }
                            };
                            console.log("geojson" + geojson);
                            // if the route already exists on the map, reset it using setData
                            if (map.getSource('route')) {
                                    console.log("in if map.source");

                                    map.getSource('route').setData(geojson);
                            } else { // otherwise, make a new request
                                    console.log("in else map.source");
                                    map.addLayer({
                                            id: 'route',
                                            type: 'line',
                                            source: {
                                                    type: 'geojson',
                                                    data: {
                                                            type: 'Feature',
                                                            properties: {},
                                                            geometry: {
                                                                    type: 'LineString',
                                                                    coordinates: geojson
                                                            }
                                                    }
                                            },
                                            layout: {
                                                    'line-join': 'round',
                                                    'line-cap': 'round'
                                            },
                                            paint: {
                                                    'line-color': '#3887be',
                                                    'line-width': 5,
                                                    'line-opacity': 0.75
                                            }
                                    });
                            }
                            // add turn instructions here at the end
                    };
                    req.send();

            },
            animate: function () {
                    var origin = [7.426644, 43.740070];
                    var destination = [7.415592, 43.735031];
                    // let route = this.map.getLayer('route');
                    // A single point that animates along the route.
                    // Coordinates are initially set to origin.
                    // let begin = this.map.getLayer('begin');
                    var route = {
                            "type": "FeatureCollection",
                            "features": [{
                                    "type": "Feature",
                                    "geometry": {
                                            "type": "LineString",
                                            "coordinates": [
                                                    origin,
                                                    destination
                                            ]
                                    }
                            }]
                    };

                        // A single point that animates along the route.
                        // Coordinates are initially set to origin.
                    var point = {
                            "type": "FeatureCollection",
                            "features": [{
                                    "type": "Feature",
                                    "properties": {},
                                    "geometry": {
                                            "type": "Point",
                                            "coordinates": origin
                                    }
                            }]
                    };
                    // Calculate the distance in kilometers between route start/end point.
                    var options= {units: 'kilometers'};
                    let lineDistance = turf.lineDistance(route.features[0],options);

                    let arc = [];

                    // Number of steps to use in the arc and animation, more steps means
                    // a smoother arc and animation, but too many steps will result in a
                    // low frame rate
                    let steps = 500;

                    // Draw an arc between the `origin` & `destination` of the two points
                    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
                            let segment = turf.along(route.features[0], i, options);
                            arc.push(segment.geometry.coordinates);
                    }

                    // Update the route with calculated arc coordinates
                    route.features[0].geometry.coordinates = arc;

                    // Used to increment the value of the point measurement against the route.
                    let counter = 0;

                    // Update point geometry to a new position based on counter denoting
                    // the index to access the arc.
                    point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];

                    // Calculate the bearing to ensure the icon is rotated to match the route arc
                    // The bearing is calculate between the current point and the next point, except
                    // at the end of the arc use the previous point and the current point
                    point.features[0].properties.bearing = turf.bearing(
                            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter - 1 : counter]),
                            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter : counter + 1])
                    );

                    // Update the source with this new data.
                    this.map.getSource('begin').setData(point);

                    // Request the next frame of animation so long the end has not been reached.
                    if (counter < steps) {
                            requestAnimationFrame(this.animate);
                    }

                    counter = counter + 1;
                    this.animate(counter);
            }
        }
    }
</script>
