<template>
<!--    <div class='overlay'>-->

<!--    </div>-->
        <div>
                <button id='Start' @click="showDot2()">Start</button>
                <div id="map" @click="showDot()"></div>
        </div>
</template>

<style>
    body { margin:0; padding:0; }
    #map { position:absolute; height: 100%; width:100%; }
</style>


<script>
    // this is where the code for the next step will go
    import Mapbox from 'mapbox-gl';


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
            }
        }
    }
</script>
