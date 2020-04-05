<template>
  <base-dialog 
    :value ="value" 
    @input="onDialogVisibleChanged" 
    dialogTitle="新增构建任务"
    @cancel="onCancel"
    @ok="onOK"
  >
    <section class="dialog-content">
      <div class="label">
        <span>任务名称</span>
      </div>
      <div class="text-box">
        <input type="text" v-model="taskName" placeholder="输入任务名称">
      </div>
      <div class="label">
        <input type="checkbox" class="checkbox" id="cbxBeforeBuild" v-model="isBeforeBuildCmdEnabled">
        <label for="cbxBeforeBuild">启用设置中的Build前生成事件命令行</label>
      </div>
      <textarea v-model="beforeBuildCmd" placeholder="Build前生成事件命令行" :disabled="isBeforeBuildCmdEnabled"></textarea>
      <div class="label">
        <input type="checkbox" class="checkbox" id="cbxAfterBuild" v-model="isAfterBuildCmdEnabled">
        <label for="cbxAfterBuild">启用设置中的Build后生成事件命令行</label>
      </div>
      <textarea v-model="afterBuildCmd" placeholder="Build后生成事件命令行" :disabled="isAfterBuildCmdEnabled"></textarea>
    </section>
  </base-dialog>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import eventBus from '../utility/eventBus';
import BaseDialog from '../components/BaseDialog';
import { ipcRenderer } from 'electron';
import { v4 as uuidv4 } from 'uuid'
const { dialog } = require('electron').remote;
const fs = require('fs');
const childProcess = require('child_process');
const fsPromises = fs.promises;
const imageInfo = require('imageinfo');
const path = require('path');
export default {
   components: {
    'base-dialog': BaseDialog
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    selectedFolder:{
      type: String
    },
    decodingTaskId: {
      type: Number
    }
  },
  data() {
    return {
      taskName: '',
      beforeBuildCmd: '',
      afterBuildCmd: '',
      isBeforeBuildCmdEnabled: false,
      isAfterBuildCmdEnabled: false
    }
  },
  computed: {
    ...mapState({
      buildEvents: state => state.buildEvents
    })
  },
  watch: {
    isBeforeBuildCmdEnabled(val) {
      if (val) {
        let events = this.buildEvents.find(x => x.taskId === this.decodingTaskId);
        if (events && events.beforeBuildCmd) {
          this.beforeBuildCmd = events.beforeBuildCmd;
        }
      } else {
        this.beforeBuildCmd = '';
      }
    },
    isAfterBuildCmdEnabled(val) {
      if (val) {
        let events = this.buildEvents.find(x => x.taskId === this.decodingTaskId);
        if (events && events.afterBuildCmd) {
          this.afterBuildCmd = events.afterBuildCmd;
        }
      } else {
        this.afterBuildCmd = '';
      }
    },
  },
  methods: {
    ...mapMutations({
      updateTaskInStore: 'updateTask'
    }),
    ...mapActions({
      addTask: 'addBuildTask',
      updateTask: 'updateBuildTask'
    }),
    async copySignFiles(destDir) {
      if (!fs.existsSync(destDir)) {
        return;
      }
      const signFilesDir = require('electron').remote.getGlobal('assetsPath');
      const files = await fsPromises.readdir(signFilesDir);
      const promises = [];
      if (files) {
        files.forEach(x => {
          promises.push(fsPromises.copyFile(path.join(signFilesDir, x), path.join(destDir, x)));
        });
      }
      await Promise.all(promises);
    },
    async deleteSignFiles(destDir) {
      const fileNames = [ 'signapk.jar', 'testkey.x509.pem', 'testkey.pk8'];
      const promises = [];
      fileNames.forEach(x => {
        let tFilePath = path.join(destDir, x);
        promises.push(fsPromises.unlink(tFilePath));
      });
      await Promise.all(promises);
    },
    renameImageWithRealExtension(imgPath) {
      let data = fs.readFileSync(imgPath);
      let info = imageInfo(data);
      if (info) {
        if (info.mimeType) {
          let pos = info.mimeType.indexOf('/');
          if (pos !== -1) {
            let extName = info.mimeType.substring(pos + 1);
            fs.renameSync(imgPath, path.join(path.dirname(imgPath), 
              path.basename(imgPath).replace(`${path.extname(imgPath)}`, `.${extName}`)));
          }
        }
      }
    },
    async buildApk(srcDir, destDir, outputFile, task) {
     let needRebuild = await new Promise((resolve, reject) => {
        let cp = childProcess.exec(`apktool b ${srcDir} -o ${outputFile}`, {cwd: destDir}, (err, stdout, stderr) => {
          if(err) {
            throw err;
          }
          resolve(stderr);
        });
        cp.stdout.on('data', (data) => {
          if (task) {
            task.log = data.toString();
             this.updateTaskInStore(task);
          }
        });
        cp.stderr.on('data', (data) => {
           if (task) {
            task.log = data.toString();
             this.updateTaskInStore(task);
          }
        });
      }).then((stderr)=>{
         if (stderr) {
            const resultLines = stderr.toString().split('\r\n');
            const errMsg = 'ERROR: Failure processing PNG image';
            let hasImgError = false;
            resultLines.forEach(x => {
              if (x) {
                let pos = x.indexOf(errMsg);
                if (pos !== -1) {
                  hasImgError = true;
                  let imgPath = x.substring(pos + errMsg.length);
                  imgPath = imgPath.trim();
                  this.renameImageWithRealExtension(imgPath);
                }
              }
            });
            return hasImgError;
          }
      }).then((hasImgError) => {
        return hasImgError ? true : false;
      });
      return needRebuild;
    },
    async signApk(dest, apkName){
      await this.copySignFiles(dest);
      await new Promise((resolve, reject) => {
        let cp = childProcess.exec(`java -jar signapk.jar testkey.x509.pem testkey.pk8 ${apkName}.apk ${apkName}.signed.apk`, {cwd: dest}, (err, stdout, stderr) => {
          if (err) {
            throw err;
          }
          resolve();
        });
      });
      await this.deleteSignFiles(dest);
    },
    async runBeforeBuildCmd(task) {
      if (this.beforeBuildCmd && this.beforeBuildCmd.trim()) {
        if (task) {
          task.log = '执行Build前生成事件命令行';
          this.updateTaskInStore(task);
        }
        await new Promise((resolve, reject) => {
          childProcess.exec(this.beforeBuildCmd, (err, stdout, stderr) => {
            if (err) {
              throw err;
            }
            if (stderr) {
              throw new Error(stderr);
            }
            resolve();
          });
        });
      }
    },
    async runAfterBuildCmd(task) {
      if (this.afterBuildCmd && this.afterBuildCmd.trim()) {
        if (task) {
          task.log = '执行Build后生成事件命令行';
          this.updateTaskInStore(task);
        }
        await new Promise((resolve, reject) => {
          childProcess.exec(this.afterBuildCmd, (err, stdout, stderr) => {
            if (err) {
              throw err;
            }
            if (stderr) {
              throw new Error(stderr);
            }
            resolve();
          });
        });
      }
    },
    onDialogVisibleChanged(value) {
      this.$emit('input', value);
    },
    resetData() {
      this.taskName = '';
    },
    onCancel() {
      this.resetData();
    },
    async resumeTask(task) {
      this.taskName = task.name;
      await this.onOK(task);
    },
    async onOK(pausedTask) {
      this.$emit('input', false);
      let task = null;
      try {
        if (pausedTask) {
          task = pausedTask;
          task.status = 'pending';
          task.log = '';
          task = await this.updateTask(task);
        } else {
          task = {decodingTaskId: this.decodingTaskId, name: this.taskName, status: 'pending', log: ''};
          task = await this.addTask(task);
           if (typeof task === 'string') {
            let exception = new Error(task);
            exception.name = 'ValidationError';
            throw exception;
          }
        }
        this.resetData();
        await this.runBeforeBuildCmd(task);
        const buildFilesFolder = this.selectedFolder;
        const destDir = path.dirname(this.selectedFolder);
        const buildFilesPath = path.basename(this.selectedFolder);
        let outputPath = path.join(destDir, 'build');
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath);
        }
        outputPath = path.join(outputPath, uuidv4());
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath);
        }
        let outputFile = path.join(outputPath,`${buildFilesPath}.apk`);
        if (fs.existsSync(buildFilesFolder)) {
          let needRebuild = await this.buildApk(buildFilesPath, destDir, outputFile, task);
          if (needRebuild) {
             await this.buildApk(buildFilesPath, destDir, outputFile);
          }
          task.log = '文件签名中...';
          this.updateTaskInStore(task);
          await this.signApk(outputPath, buildFilesPath, task);
          
          task.status = 'done';
          task.path = path.join(outputPath, `${buildFilesPath}.apk`);
          this.updateTask(task);
          await this.runAfterBuildCmd(task);
        }
      } catch (error) {
         if (error && error.name && error.name === 'ValidationError') {
           this.$msgbox({
            type: 'error',
            message: error.message
          });
          this.$emit('input', true);
          return;
        }
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
.dialog-content {
  width: 300px;
  padding: 5px 10px;
  .label {
    text-align: left;
    user-select: none;
    margin: 5px 0px;
    color: #666;
    .checkbox {
      visibility: hidden;
      position: relative;
      margin-right: 10px;
      &::before {
        position: absolute;
        content: '';
        visibility: visible;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        width: 16px;
        height: 16px;
        border: 2px solid $dark;
        box-sizing: border-box;
        text-align: center;
        line-height: 1;
      }
      &:checked {
        &::before {
          border: 2px solid $default-color;
          background-color: $default-color;
          color: #fff;
          content: '\2714';
        }
      }
      &:hover {
        &::before {
           border: 2px solid $default-color;
        }
      }
    }
  }
  textarea {
    width: 100%;
    min-height: 100px;
    resize: none;
    padding: 5px;
    box-sizing: border-box;
    border-radius: 5px;
    border: 2px solid $dark;
    outline: none;
    &::placeholder{
      color: rgba($dark, 0.9);
    }
  }
}
</style>