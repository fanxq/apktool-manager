<template>
  <base-dialog 
    :value ="value" 
    dialogTitle="新增反编译任务" 
    @input="onDialogVisibleChanged"
    @cancel="onCancel"
    @ok="onOK"
  >
    <section class="dialog-content">
      <div class="label">
        <span>任务名称</span>
      </div>
      <div class="text-box">
        <input type="text" placeholder="输入任务名称" v-model="taskName">
      </div>
      <div class="label" style="margin-top: 10px;">
        <span>选择文件</span>
        <span class="icon-wrapper l-icon-wrapper" data-title="选择文件">
          <font-awesome-icon :icon="faFolderOpen" @click="selectApk"></font-awesome-icon>
        </span>
      </div>
      <textarea v-model="fileName" placeholder="请选择需要反编译的APK文件" disabled></textarea>
    </section>
  </base-dialog>
</template>
<script>
import eventBus from '../utility/eventBus';
import { mapActions, mapMutations } from 'vuex';
import BaseDialog from '../components/BaseDialog';
import { v4 as uuidv4 } from 'uuid';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');
const childProcess = require('child_process');
const fsPromises = fs.promises;
export default {
   components: {
    'base-dialog': BaseDialog
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileName: '',
      taskName: '',
      faFolderOpen
    }
  },
  methods: {
    ...mapMutations({
      updateTaskInStore: 'updateTask'
    }),
    ...mapActions({
      addTask: 'addDecompileTask',
      updateTask: 'updateDecomplieTask'
    }),
    onDialogVisibleChanged(value) {
      this.$emit('input', value);
    },
    selectApk() {
      let selectedApkFile = dialog.showOpenDialogSync({
        title: '选择文件',
        filters: [
          {name: 'apk', extensions: ['apk']}
        ],
        properties:['openFile']
      });
      console.log(selectedApkFile);
      if (selectedApkFile && selectedApkFile.length !== 0) {
        this.fileName = selectedApkFile[0];
      }
    },
    onCancel() {
      this.taskName = '';
      this.fileName = '';
    },
    checkInputData() {
      try {
        if (!this.taskName || !this.taskName.trim()) {
          throw '任务名称不能为空！';
        }
        if (!this.fileName && !this.fileName.trim()) {
          throw '请选择需要反编译的APK文件！';
        }
        if (!fs.existsSync(this.fileName)) {
          throw `请确认文件 ${this.fileName} 是否存在！`;
        }
        return true;
      } catch(err) {
        this.$msgbox({
          type: 'error',
          message: err
        });
        return false;
      }
    },
    async resumeTask(task) {
      this.taskName = task.name;
      this.fileName = task.apkName;
      await this.onOK(task);
    },
    async onOK(pausedTask) {
      let task = null;
      try {
        if (!this.checkInputData()) {
          return;
        }
        this.$emit('input', false);
        let taskName = this.taskName;
        let fileName = this.fileName;
        this.taskName = '';
        this.fileName = '';
        if (pausedTask) {
          task = pausedTask;
          task.log = '';
          task.status = 'pending';
          task = await this.updateTask(task);
        } else {
          task = {name: taskName, apkName: fileName, status: 'pending', log: ''};
          task = await this.addTask(task);
        }
        const path = require('path');
        let destDir = require('electron').remote.getGlobal('userDataPath');
        destDir = path.join(destDir, uuidv4());
        console.log(destDir);
        if(!fs.existsSync(destDir)){
          fs.mkdirSync(destDir);
        }       
        const apkFileName = path.basename(fileName);
        const apkFileNameWithoutExt = path.basename(apkFileName, '.apk')
        
        //await fsPromises.copyFile(this.fileName, path.join(destDir, apkFileName));
        fs.copyFileSync(fileName, path.join(destDir, apkFileName));
        await new Promise((resolve, reject) => {
          let cp = childProcess.exec(`apktool d ${apkFileName}`, {cwd: destDir}, (err, stdout, stderr) => {
            if (err) {
              reject(err);
            }
            console.log(stderr.toString());
            resolve({stdout, stderr});
          });
          cp.stdout.on('data', (data) => {
            task.log = data.toString();
            this.updateTaskInStore(task);
          });
        }); 
        await fsPromises.unlink(path.join(destDir, apkFileName));
        task.status = 'done';
        task.path = path.join(destDir, apkFileNameWithoutExt);
        this.updateTask(task);
      } catch (error) {
        task.status = 'pause';
        this.updateTask(task);
      }
    }
  },
  mounted() {
    eventBus.$on('resumeTask', (data) => {
      this.resumeTask(JSON.parse(data));
    });
  },
  destroyed() {
    eventBus.$off('resumeTask');
  }
}
</script>
<style lang="scss" scoped>
  @import '../assets/css/shared.scss';
 .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .dialog-content {
    width: 300px;
    padding: 5px 10px;
    .label {
      text-align: left;
      user-select: none;
      margin: 5px 0px;
      color: #666;
      position: relative;
      .l-icon-wrapper {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    textarea {
      width: 100%;
      min-height: 100px;
      resize: none;
      padding: 5px;
      box-sizing: border-box;
      border-radius: 5px;
      border: 2px dotted $dark;
      outline: none;
      &::placeholder{
        color: rgba($dark, 0.9);
      }
    }
  }
</style>