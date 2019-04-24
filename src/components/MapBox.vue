<template>
    <!--    <div class='overlay'>-->

    <!--    </div>-->
    <div>
        <button id='Start' @click="showDot2()">Start</button>
        <button id='AnimateLine' @click="animateLine()">AnimateLine</button>
        <!--<button id='ShowRoute' @click="getRoute()">Visualiseer de route</button>-->
        <!--<button id='Clear' @click="clearMap">Clear map</button>-->
        <div id="map" @click="showDot()"></div>
    </div>
</template>

<style>
    body { margin:0; padding:0; }
    #Start{margin-left: 15px; margin-bottom: 5px; margin-top: 5px;}
    #AnimateLine{margin-left: 15px; margin-right: 15px; margin-bottom: 5px; margin-top: 5px;}
    #map { position:absolute; height: 95%; width:97%; padding: 15px; margin-bottom: 15px;}
</style>


<script>
    // this is where the code for the next step will go
    import Mapbox from 'mapbox-gl';
    import * as turf from '@turf/turf';

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
            // this.click();

        },
        methods: {
            showDot: function() {
                // coords
                var start = [7.426644, 43.740070];
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
            animateLine: function(){

                var start = [7.426644, 43.740070];

                var end = [7.415592, 43.735031];
                // A simple line from origin to destination.
                var route = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                start,
                                end
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
                            "coordinates": start
                        }
                    }]
                };

                var options = {
                    units:'kilometers'
                }

                // Calculate the distance in kilometers between route start/end point.
                var lineDistance = turf.lineDistance(route.features[0], options);

                var arc = [];

                // Number of steps to use in the arc and animation, more steps means
                // a smoother arc and animation, but too many steps will result in a
                // low frame rate
                var steps = 500;

                // Draw an arc between the `origin` & `destination` of the two points
                for (var i = 0; i < lineDistance; i += lineDistance / steps) {
                    var segment = turf.along(route.features[0], i, options);
                    arc.push(segment.geometry.coordinates);
                }

                // Update the route with calculated arc coordinates
                route.features[0].geometry.coordinates = arc;

                // Used to increment the value of the point measurement against the route.
                var counter = 0;


                this.map.on('load', function () {
                    // Add a source and layer displaying a point which will be animated in a circle.
                    this.map.addSource('route', {
                        "type": "geojson",
                        "data": route
                    });

                    this.map.addSource('point', {
                        "type": "geojson",
                        "data": point
                    });

                    this.map.addLayer({
                        "id": "route",
                        "source": "route",
                        "type": "line",
                        "paint": {
                            "line-width": 2,
                            "line-color": "#007cbf"
                        }
                    });

                    this.map.addLayer({
                        "id": "point",
                        "source": "point",
                        "type": "symbol",
                        "layout": {
                            "icon-image": "airport-15",
                            "icon-rotate": ["get", "bearing"],
                            "icon-rotation-alignment": "map",
                            "icon-allow-overlap": true,
                            "icon-ignore-placement": true
                        }
                    });

                    function animate() {
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
                        this.map.getLayer('point').data=point;

                        // Request the next frame of animation so long the end has not been reached.
                        if (counter < steps) {
                            requestAnimationFrame(animate);
                        }

                        counter = counter + 1;
                    }

                    document.getElementById('replay').addEventListener('click', function() {
                        // Set the coordinates of the original point back to origin
                        point.features[0].geometry.coordinates = origin;

                        // Update the source layer
                        map.getSource('point').setData(point);

                        // Reset the counter
                        counter = 0;

                        // Restart the animation.
                        animate(counter);
                    });

                    // Start the animation.
                    animate(counter);
                });

                // if (this.map.getSource('route')) {
                //     console.log("route bestaal al");
                // } else { // otherwise, make a new request
                //     console.log("andere route");
                //     this.map.addSource('route', {
                //         type: "geojson",
                //         data: route
                //     });
                //     this.map.addLayer({
                //         id: 'route',
                //         source: 'route',
                //         type: "line",
                //         paint: {
                //             'line-color': '#007cbf',
                //             'line-width': 2
                //         }
                //     });
                // }
                // if (this.map.getSource('point')) {
                //     console.log("point bestaal al");
                // } else { // otherwise, make a new request
                //     console.log("andere point");
                //     this.map.addSource('point', {
                //         type: "geojson",
                //         data: point
                //     });
                //     this.map.addLayer({
                //         id: 'point',
                //         source: 'point',
                //         type: 'symbol',
                //         layout: {
                //             'icon-image': 'airport-15',
                //             'icon-rotate': ['get', 'bearing'],
                //             'icon-rotation-alignment': 'map',
                //             'icon-allow-overlap': true,
                //             'icon-ignore-placement': true
                //         }
                //     });
                // }
                //
                // // Update point geometry to a new position based on counter denoting
                // // the index to access the arc.
                // point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];
                //
                // // Calculate the bearing to ensure the icon is rotated to match the route arc
                // // The bearing is calculate between the current point and the next point, except
                // // at the end of the arc use the previous point and the current point
                // point.features[0].properties.bearing = turf.bearing(
                //     turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter - 1 : counter]),
                //     turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter : counter + 1])
                // );
                //
                // // Update the source with this new data.
                // this.map.getLayer('point').data=point;
                //
                // // Request the next frame of animation so long the end has not been reached.
                // if (counter < steps) {
                //     requestAnimationFrame(this.animateLine);
                // }
                //
                // counter = counter + 1;
                //
                // this.animateLine(counter);
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
            }
        }
    }
</script>
