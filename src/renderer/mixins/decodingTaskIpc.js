import {
  ipcRenderer
} from 'electron'
export default {
  methods: {
    async saveTaskToDB(task) {
      let decodingTask = await ipcRenderer.invoke('add-decompile-task', task);
      if (decodingTask && decodingTask.id) {
        decodingTask.type = 'decompile';
      } else {
        throw '数据库异常';
      }
      this.$store.commit('addTask', decodingTask);
      return decodingTask;
    },
    async updateTaskInDB(task) {
      let decodingTask = await ipcRenderer.invoke('update-decompile-task', task);
      decodingTask.type = 'decompile';
      this.$store.commit('updateTask', decodingTask);
      return decodingTask;
    },
    sendTaskDoneToIpcMain() {
      ipcRenderer.send('task-has-done');
    }
  },
}