import Vue from 'vue';
import Vuex from 'vuex';
//import data from '../assets/mockData/data'
const {
  ipcRenderer
} = require('electron');

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tasks: [],
    buildTasks: [],
    buildEvents: []
  },
  mutations: {
    addTask(state, task) {
      if (task && task.type === 'decompile') {
        state.tasks.unshift(task);
      } else {
        state.buildTasks.unshift(task);
      }
    },
    updateTask(state, task) {
      let index = -1;
      if (task.type === 'decompile') {
        state.tasks.forEach((x, i) => {
          if (x.id === task.id) {
            index = i;
            return;
          }
        });
        if (index !== -1) {
          state.tasks.splice(index, 1, task);
        }
      } else {
        state.buildTasks.forEach((x, i) => {
          if (x.id === task.id) {
            index = i;
            return;
          }
        });
        if (index !== -1) {
          state.buildTasks.splice(index, 1, task);
        }
      }
    },
    deleteTask(state, task) {
      let index = -1;
      let tasks = task.type === 'decompile' ? state.tasks : state.buildTasks;
      tasks.forEach((x, i) => {
        if (x.id === task.id) {
          index = i;
          return;
        }
      });
      if (index !== -1) {
        tasks.splice(index, 1);
      }
    },
    getTaskByName(state, name) {
      return state.tasks.find(x => x.name === name);
    },
    upsertBuildEvents(state, data) {
      let index = state.buildEvents.findIndex(x => x.taskId === data.taskId);
      if (index !== -1) {
        state.buildEvents.splice(index, 1, data);
      } else {
        state.buildEvents.push(data);
      }
    }
  },
  actions: {},
  modules: {}
});