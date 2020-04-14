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
  actions: {
    async addDecompileTask({
      commit
    }, task) {
      let result = await ipcRenderer.invoke('add-decompile-task', task);
      if (result && result.id) {
        result.type = 'decompile';
        commit('addTask', result);
      }
      return result;
    },
    async updateDecomplieTask({
      commit
    }, task) {
      let decompileTask = await ipcRenderer.invoke('update-decompile-task', task);
      decompileTask.type = 'decompile';
      commit('updateTask', decompileTask);
      return decompileTask;
    },
    async addBuildTask({
      commit
    }, task) {
      let BuildTask = await ipcRenderer.invoke('add-build-task', task);
      if (BuildTask && BuildTask.id) {
        BuildTask.type = 'build';
        commit('addTask', BuildTask);
      }
      return BuildTask;
    },
    async updateBuildTask({
      commit
    }, task) {
      let BuildTask = await ipcRenderer.invoke('update-build-task', task);
      BuildTask.type = 'build';
      commit('updateTask', BuildTask);
      return BuildTask;
    },
    async deleteTask({
      commit
    }, task) {
      if (task.type === 'build') {
        let {error} = await ipcRenderer.invoke('delete-build-task', task);
        if (error) {
          throw error;
        }
      } else {
        let {error} = await ipcRenderer.invoke('delete-decompile-task', task);
        if (error) {
          throw error;
        }
      }
      commit('deleteTask', task);
    }
  },
  modules: {}
});