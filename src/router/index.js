import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import Map from '../components/Map'
import test from '../components/test'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
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
    }
  ]
})
