import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import store from './store'
import 'vuetify/dist/vuetify.min.css'

import 'bootstrap/dist/js/bootstrap.min'
import './registerServiceWorker'
import dateFilter from '@/filters/date.filter'
import bytesToSize from '@/filters/size.filter'




Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.filter('date', dateFilter)
Vue.filter('fileSize', bytesToSize)

new Vue({
  store,
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app')
