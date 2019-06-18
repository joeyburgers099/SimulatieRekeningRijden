import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import Map from '../components/Map'
import test from '../components/test'
import Mapbox from '../components/MapBox'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: test
    },
    {
      path: '/map',
      name: 'Map',
      component: Map
    },
    {
      path: '/test',
      name: 'Test',
      component: test
    },
    {
      path: '/mapbox',
      name: 'mapbox',
      component: Mapbox
    }
  ]
})
