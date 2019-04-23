
<template>
    <div id="map">
        <mapbox access-token="pk.eyJ1Ijoiam9leWJ1cmdlcnMwOTkiLCJhIjoiY2p0cG9iOTZtMDY2azRlczdybHU5OTU2eiJ9.BScZE0DWOamSxZpiYzf4pQ"
            :map-options="{
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v11',  // stylesheet location
                center: [7.426644, 43.740070], // starting position [lng, lat]
                zoom: 13 // starting zoom
            }">
        </mapbox>
    </div>
</template>

<script>
    import Mapbox from 'mapbox-gl';
    export default {
        name: 'app',
        components: {
            'mapbox': Mapbox
        },
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<style>
    body { margin:0; padding:0; }
    #map { position:absolute; height: 100%; width:100%; }

    #app {
        width: 100%;
        height: 500px;
    }
</style>
