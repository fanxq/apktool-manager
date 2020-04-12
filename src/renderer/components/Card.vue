<template>
  <div class="card">
    <div class="content">
      <div class="row">
        <div class="task-name">{{name}}</div>
        <span class="toolbar" v-show="status === 'done'">
          <span class="icon-wrapper" data-title="在文件资源管理器中显示">
            <font-awesome-icon :icon="faFolderOpen" @click="showInFolder"></font-awesome-icon>
          </span>
          <span class="icon-wrapper" data-title="打包管理" v-show="type !== 'build'">
            <font-awesome-icon :icon="faList" @click="gotoPackageManagementPage"></font-awesome-icon>
          </span>
          <span class="icon-wrapper" data-title="删除">
            <font-awesome-icon :icon="faTrashAlt" @click="deleteTask"></font-awesome-icon>
          </span>
        </span>
        <span class="toolbar" v-show="status === 'pause'">
          <span class="icon-wrapper" data-title="运行任务">
            <font-awesome-icon :icon="faPlayCircle" @click="resumeTask"></font-awesome-icon>
          </span>
          <span class="icon-wrapper" data-title="删除">
            <font-awesome-icon :icon="faTrashAlt" @click="deleteTask"></font-awesome-icon>
          </span>
        </span>
      </div>
      <div class="row">
        <div class="log" v-show="status === 'pending'">
          <span class="tips" v-if="type === 'build'">构建中</span>
          <span class="tips" v-if="type === 'decompile'">反编译中</span>
          <p>{{log}}</p>
        </div>
        <div class="info" v-show="status === 'done'">
          <p>{{createdAt}}</p>
          <p>{{path}}</p>
        </div>
        <div class="info" v-show="status === 'pause'">
          <span>任务已中止，请重新开始或删除该任务！</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import eventBus from '../utility/eventBus';
import { mapActions } from 'vuex';
import { faTrashAlt, faFolderOpen, faList, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
export default {
  props:['name', 'status', 'createdAt', 'path', 'id', 'type', 'log'],
  data() {
    return {
      faTrashAlt,
      faFolderOpen,
      faList,
      faPlayCircle
    }
  },
  methods: {
    ...mapActions({
      _deleteTask: 'deleteTask'
    }),
    showInFolder() {
      const shell = require('electron').shell;
      shell.showItemInFolder(this.path);
    },
    gotoPackageManagementPage() {
      this.$router.push(`/packageManagement/${this.id}`);
    },
    deleteTask() {
      this._deleteTask({id: this.id, type: this.type});
    },
    resumeTask() {
       let task;
      if (this.type === 'build') {
        let decodingTaskId = this.$el.getAttribute('decodingTaskId');
        task = {id: this.id, name: this.name, decodingTaskId: Number(decodingTaskId), status: this.status};
      } else {
        let apkName = this.$el.getAttribute('apkName');
        task = {id: this.id, name: this.name, apkName: apkName, status: this.status};
      }
      eventBus.$emit('resumeTask', JSON.stringify(task));
    }
  }
}
</script>
<style lang="scss" scoped>
 
.card {
  background-color: #fff;
  border: 1px solid #f4f4f4;
  padding: 15px;
  // height: 120px;
  position: relative;
  margin-bottom: 10px;
 
  .content {
    .task-name {
      text-align: left;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 22px;
      font-weight: 500;
      color: #555;
    }
    
    .log {
      width: 100%;
      text-align: left;
      color: #888;
       .tips {
        position: relative;
        display: inline-block;
        margin: 5px 0;
        &::after{
          position: absolute;
          font-size: 20px;
          content: '......';
          letter-spacing: 5px;
          top: -6px;
          animation: dots 3s linear infinite;
        }
      }
      p {
        height: 65px;
        max-width: 100%;
        white-space: pre-wrap;
        margin: 0;
        overflow: auto;
        &::-webkit-scrollbar{
          width: 4px;
          height: 4px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: #4f4f4f65;
        }
        &::-webkit-scrollbar-track{
          background-color: transparent;
        }
      }
    }
   

    .info {
      color: #888;
      text-align: left;
      p {
        font-size: 14px;
        margin: 5px 0px;
        word-break: break-all;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }
    }
  }
}
</style>