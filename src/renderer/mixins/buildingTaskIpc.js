import {
  ipcRenderer
} from 'electron';
export default {
  methods: {
    async saveTaskToDB(task) {
      let buildingTask = await ipcRenderer.invoke('add-build-task', task);
      if (buildingTask && buildingTask.id) {
        buildingTask.type = 'build';
      } else {
        throw '数据库异常';
      }
      this.$store.commit('addTask', buildingTask);
      return buildingTask;
    },
    async updateTaskInDB(task) {
      let buildingTask = await ipcRenderer.invoke('update-build-task', task);
      buildingTask.type = 'build';
      this.$store.commit('updateTask', buildingTask);
      return buildingTask;
    },
    sendTaskDoneToIpcMain() {
      ipcRenderer.send('task-has-done');
    }
  },
}