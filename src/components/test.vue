<template>
        <div id="wrapper">
        <div id="button">
                <button id='Start' @click="startAnimate()">Start</button>
<!--                <button id='AnimateLine' @click="startAnimate()">AnimateLine</button>-->

        </div>
                <div>
                        <p>Aantal voertuigen: {{ value }}</p>
                        <input type="number" class="form-control" v-model="value" :min="1" :max="3" inline controls></input>
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
    import axios from 'axios'

    export default {
        name: 'app',
        // car: {
        //     start: null,
        //     end: null,
        //     routes: null,
        //     lastroutesindex: 0,
        //     currentroutesindex:1,
        //     currBegin: null,
        //     currEnd: null
        // },
        components: {
            'mapbox': Mapbox
        },
        data() {
            return {
                counter: 0,
                    value: 1,

                //0: start, 1: end, 2: routes, 3: lastroutesindex, 4: currentroutesindex, 5: currentBegin, 6: currentEnd, 7: point, 8: counter
                starteneindpunten: [],
                cartrackers: [{
                        // id: -1,
                        movements: [{
                                 distance: -1,
                                 duration: -1,
                                 streetName: ''
                        }],
                        totalDistance: 0,
                        totalDuration: 0,
                        beginTime: 0,
                        endTime: 0
                }]
            }
        },
        mounted() {
                console.log('in mounted()');
            this.createMap();
            this.initCars();
        },
        methods: {
            setlist: function(start, end){
                this.starteneindpunten.push([start, end, [], 0 , 1 , [], [], undefined, 0]);
            },
            setstarteneindpunten: function(){
                var start = [7.426644, 43.740070];
                var end = [7.415592, 43.735031];
                this.setlist(start, end);

                start = [7.423555, 43.727910];
                end = [7.439061, 43.74683];
                this.setlist(start, end);

                start = [7.427037,43.731962];
                end = [7.418660, 43.725329];
                this.setlist(start, end);

                console.log('setstarteneindpunten: ' + this.starteneindpunten);
            },
                generateRoute: async function(index){
                    var start = this.getBegin(index);
                    var end =  this.getEnd(index);//this.starteneindpunten[i][1];
                        console.log('generateroutes: ' + index + ' ' + start + ' | ' + end);
                        var res = await this.getroute2(start, end ).then(function(response) {
                                return response;
                        });
                        var result = JSON.parse(JSON.stringify(res));
                        console.log(' coords: ' + JSON.stringify(result.data.routes[0].geometry.coordinates) + '    |   ');
                        var routes = result.data.routes[0].geometry.coordinates;
                        var totalDistance = JSON.stringify(result.data.routes[0].distance);
                        var totalDuration = JSON.stringify(result.data.routes[0].duration);
                        var movements = [];
                        var steps = result.data.routes[0].legs[0].steps;
                        for(let i = 0; i < steps.length; i++){
                                movements.push({duration: steps[i].duration,
                                                distance: steps[i].distance,
                                                streetName: steps[i].name});
                        }
                        let begintime = this.getCurrentDate();

                        this.cartrackers[index] = {movements: movements, totalDistance: totalDistance, totalDuration: totalDuration, beginTime: begintime};
                        for(let i = 0; i< this.cartrackers.length; i++){
                                console.log('cartracker ' + i + ':  ' + JSON.stringify(this.cartrackers[i]));
                        }
                        this.starteneindpunten[index][2] = routes;

                },
            generateRoutes: async function(){
                for(var i = 0; i <  this.starteneindpunten.length; i++){
                        this.generateRoute(i);
                }
                console.log(this.starteneindpunten);
            },

                // Maakt de map aan
            createMap: function () {
                    console.log('in createMap');
                    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9leWJ1cmdlcnMwOTkiLCJhIjoiY2p0cG9iOTZtMDY2azRlczdybHU5OTU2eiJ9.BScZE0DWOamSxZpiYzf4pQ'
                    this.map = new Mapbox.Map({
                            container: 'map',
                            style: 'mapbox://styles/mapbox/streets-v11',  // stylesheet location
                            center: [7.426644, 43.740070], // starting position [lng, lat]
                            zoom: 13 // starting zoom
                    })
            },
                getroute2: async function(start, end) {
                    console.log('in getroute2');
                    // make a directions request using driving profile
                    // only the end or destination will change
                    // an arbitrary start will always be the same
                    var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1]
                            + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

                    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
                    return await axios.get(url);
                },
                sendCartracker: function(index){
                    console.log('in sendCartracker');
                    let cartracker = this.cartrackers[index];
                        var url = '';

                        axios.post(url);
                },
                getCurrentDate: function(){
                    let myDate = new Date();
                    const options = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'};
                    let date = myDate.toLocaleDateString('nl-NL',options);
                    return date;
                },
            getCounter: function(index){
                return this.starteneindpunten[index][8];
            },
            setCounterToZero: function(index){
                this.starteneindpunten[index][8] = 0;
            },
            counterPlusOne: function(index){
              this.starteneindpunten[index][8]++;
            },
            getBegin: function(currindex) {
                var begin = this.starteneindpunten[currindex][0];
                return begin;
            },
            getEnd: function(index){
                var end = this.starteneindpunten[index][1];
                return end;
            },
                setEnd: function(index, end){
                  this.starteneindpunten[index][1] = end;
                },
                setBegin: function(index, begin){
                  this.starteneindpunten[index][0] = begin;
                },
            getRouting: function(currindex, index) {
                var end = this.starteneindpunten[currindex][2][index];
                return end;
            },
            setPoint: function(index, begin){
                this.starteneindpunten[index][7] = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": begin
                        }
                    }]
                };
            },
            getPoint: function(index) {
                return this.starteneindpunten[index][7];
            },
            getLastrouteindex: function(i){
                return this.starteneindpunten[i][3];
            },
            setLastrouteindex: function(i, index){
              this.starteneindpunten[i][3] = index;
            },
            getCurrentrouteindex: function(i){
                return this.starteneindpunten[i][4];
            },
            setCurrentrouteindex: function(i){
                this.starteneindpunten[i][4]+= 1;
            },
            getCurrentBegin: function(i){
                return this.starteneindpunten[i][5];
            },
            getCurrentEnd: function(i){
              return this.starteneindpunten[i][6];
            },
            setCurrentBegin: function(i, begin){
              this.starteneindpunten[i][5] = begin;
            },
            setCurrentEnd: function(i, end){
                this.starteneindpunten[i][6] = end;
            },
                initCars: function(){
                    this.setstarteneindpunten();
                    this.generateRoutes();
                },
            startAnimate: function() {

                for(var i = 0; i < this.value; i++){


                    this.setCurrentBegin(i, this.getBegin(i));
                    this.setCurrentEnd(i, this.getRouting(i, this.getCurrentrouteindex(i)));

                    this.setPoint(i, this.getCurrentBegin(i));


                    this.map.addSource('car' + i, {
                        'type': 'geojson',
                        'data': this.getPoint(i)
                    });

                    var route = this.starteneindpunten[i][2];
                    console.log('route ' + route);
                        var geojson = {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                        type: 'LineString',
                                        coordinates: route
                                }
                        };
                        this.map.addSource('line' + i, {
                                type: 'geojson',
                                data: geojson
                        });
                        this.map.addLayer({
                                id: 'route' + i,
                                type: 'line',
                                source: 'line' + i,
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
                        this.map.addLayer({
                                id: 'car' + i,
                                type: 'circle',
                                source: 'car' + i,
                                paint: {
                                        'circle-radius': 9,
                                        'circle-color': '#59be2f'
                                }
                        });
                    this.animate(i);
                }

            },
            getnextdestination: function(i){
                this.setLastrouteindex(i, this.getCurrentrouteindex(i));

                this.setCurrentrouteindex(i);


                this.setCurrentBegin(i, this.getRouting(i, this.getLastrouteindex(i)));
                this.setCurrentEnd(i, this.getRouting(i, this.getCurrentrouteindex(i)));



                this.setCounterToZero(i);

                console.log(i + ' nextdestination ' + this.getLastrouteindex(i) + ' | ' + this.getCurrentrouteindex(i) +
                        ' | ' + this.getCurrentBegin(i) + ' | ' + this.getCurrentEnd(i));

                if(this.getCurrentEnd(i) == undefined){
                        this.cartrackers[i].endTime = this.getCurrentDate();
                        this.sendCartracker(i);
                }
                this.animate(i);
            },
            animate: function (index) {
                    var route = {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "LineString",
                                "coordinates": [
                                    this.getCurrentBegin(index),
                                    this.getCurrentEnd(index)
                                ]
                            }
                        }]
                    };

                    // Calculate the distance in kilometers between route start/end point.
                    var options = {units: 'kilometers'};
                    let lineDistance = turf.lineDistance(route.features[0], options);

                    let arc = [];

                    // Number of steps to use in the arc and animation, more steps means
                    // a smoother arc and animation, but too many steps will result in a
                    // low frame rate
                    // afstand / snelheid * sec * tick
                    var calcedSteps = Math.ceil(lineDistance / 40 * 3600 * 60);

                    let steps = calcedSteps;

                    // Draw an arc between the `origin` & `destination` of the two points
                    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
                        let segment = turf.along(route.features[0], i, options);
                        arc.push(segment.geometry.coordinates);
                    }

                    // Update the route with calculated arc coordinates
                    route.features[0].geometry.coordinates = arc;

                    this.visualiseAnimate(this.getPoint(index), route, steps, index);
                // }
            },
            visualiseAnimate: function(point, route, steps, index){
                    var self = this;
                // Used to increment the value of the point measurement against the route.

                // Update point geometry to a new position based on counter denoting
                // the index to access the arc.
                point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[self.getCounter(index)];


                // Update the source with this new data.
                    self.map.getSource('car' + index).setData(point);

                // Request the next frame of animation so long the end has not been reached.
                if (self.getCounter(index) < steps) {
                    console.log(self.getCounter(index) + ' steps ' + steps);
                    requestAnimationFrame(() => {
                            self.animate(index);
                    });
                } else{
                        self.getnextdestination(index);
                }
                    self.counterPlusOne(index);
            }


            // getRoute: function(end, map) {
            //         // make a directions request using cycling profile
            //         // only the end or destination will change
            //         var start = [7.426644, 43.740070];
            //         // an arbitrary start will always be the same
            //         var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
            //
            //         // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
            //         var req = new XMLHttpRequest();
            //         req.responseType = 'json';
            //         req.open('GET', url, true);
            //         req.onload = function() {
            //                 var data = req.response.routes[0];
            //                 console.log("data: " + data);
            //                 var route = data.geometry.coordinates;
            //                 console.log("route: " + route);
            //                 var geojson = {
            //                         type: 'Feature',
            //                         properties: {},
            //                         geometry: {
            //                                 type: 'LineString',
            //                                 coordinates: route
            //                         }
            //                 };
            //                 console.log("geojson" + geojson);
            //                 // if the route already exists on the map, reset it using setData
            //                 if (map.getSource('route')) {
            //                         console.log("in if map.source");
            //
            //                         map.getSource('route').setData(geojson);
            //                 } else { // otherwise, make a new request
            //                         console.log("in else map.source");
            //                         map.addLayer({
            //                                 id: 'route',
            //                                 type: 'line',
            //                                 source: {
            //                                         type: 'geojson',
            //                                         data: {
            //                                                 type: 'Feature',
            //                                                 properties: {},
            //                                                 geometry: {
            //                                                         type: 'LineString',
            //                                                         coordinates: geojson
            //                                                 }
            //                                         }
            //                                 },
            //                                 layout: {
            //                                         'line-join': 'round',
            //                                         'line-cap': 'round'
            //                                 },
            //                                 paint: {
            //                                         'line-color': '#3887be',
            //                                         'line-width': 5,
            //                                         'line-opacity': 0.75
            //                                 }
            //                         });
            //                 }
            //                 // add turn instructions here at the end
            //         };
            //         req.send();
            //
            // },
            // showDot2: function(){
            // // coords
            // var end = [7.415592, 43.735031];
            // // data variabele voor de layer
            // var endpoint = {
            //         type: 'FeatureCollection',
            //         features: [{
            //                 type: 'Feature',
            //                 properties: {},
            //                 geometry: {
            //                         type: 'Point',
            //                         coordinates: end
            //                 }
            //         }]};
            // // Als de layer niet bestaat maak hem aan anders niet.
            // if( this.map.getLayer('end')){
            //         console.log('endpoint layer bestaat al')
            //         this.getRoute(end, this.map);
            //
            // }else{
            //         this.map.addLayer({
            //                 id: 'end',
            //                 type: 'circle',
            //                 source: {
            //                         type: 'geojson',
            //                         data: endpoint
            //                 },
            //                 paint: {
            //                         'circle-radius': 9,
            //                         'circle-color': '#f30'
            //                 }
            //         });
            // }
            // },
            // showDot: function() {
            //     // coords
            //     var start = this.starteneindpunten[0][0];//[7.426644, 43.740070];
            //     this.getRoute(start, this.map);
            //     // data variabele voor layer
            //     var car = { type: 'FeatureCollection',
            //         features: [{
            //             type: 'Feature',
            //             properties: {},
            //             geometry: {
            //                 type: 'Point',
            //                 coordinates: start
            //             }
            //         }]};
            //     // Als de layer niet bestaat maak hem aan anders niet.
            //     if(this.map.getLayer('begin')) {
            //         console.log('layer begin bestaat al');
            //     }else{
            //         this.map.addLayer({
            //             id: 'begin',
            //             type: 'circle',
            //             source: {
            //                 type: 'geojson',
            //                 data: car
            //             },
            //             paint: {
            //                 'circle-radius': 9,
            //                 'circle-color': '#3887be'
            //             }
            //         });
            //     }
            //
            // },
        }
    }
</script>
