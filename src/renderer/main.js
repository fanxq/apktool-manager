import Vue from 'vue';
import MessageBox from './components/MessageBox/index';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/global.scss';
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';
const {
  ipcRenderer
} = require('electron');

console.log(process.env.NODE_ENV);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;
Vue.use(MessageBox);

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    ipcRenderer.invoke('load-data').then((result) => {
      if (result && result.decompileTask && result.buildTask) {
        this.$store.state.tasks = result.decompileTask.map(t => {
          t.type = 'decompile';
          if (t.status === 'pending') {
            t.status = 'pause';
          }
          return t;
        });
        this.$store.state.buildTasks = result.buildTask.map(t => {
          t.type = 'build';
          if (t.status === 'pending') {
            t.status = 'pause';
          }
          return t;
        });
      }
    }).catch(err => {
      this.$msgbox({
        type: 'error',
        message: typeof err === 'string' ? err : err.message
      });
    });
  }
}).$mount('#app')