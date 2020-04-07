<template>
  <div class="page">
    <div class="toolbar">
      <div>
        <a class="back-text" @click="goBack" href="javascript:void 0;">
          <font-awesome-icon :icon="faAngleLeft"></font-awesome-icon>
          返回
        </a>
      </div>
      <div class="btn-group">
        <button class="btn" @click="showAddTaskDialog">添加</button>
        <button class="btn" @click="showSettingDialog" style="margin-left:10px;">设置</button>
      </div>
    </div>
    <div class="content">
      <ul>
        <li v-for="(task, index) in buildTaskList" :key="index">
          <card v-bind="task"></card>
        </li>
      </ul>
      <page-description v-show="buildTaskList.length === 0" pageType="building"/>
    </div>
    <setting-dialog v-model="isShowSettingDialog" :storePath="eventsStorePath" :decodingTaskId="pId"/>
    <building-task-dialog v-model="isShowDialog" :selectedFolder="filePath" :decodingTaskId="pId"/>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import BuildingTaskDialog from '../components/BuildingTaskDialog';
import SettingDialog from '../components/SettingDialog';
import Card from '../components/Card';
import PageDescription from '../components/PageDescription';
import {faAngleLeft, faPlus, faFrog} from '@fortawesome/free-solid-svg-icons';
export default {
  components: { 
    'building-task-dialog': BuildingTaskDialog,
    'card': Card,
    'page-description': PageDescription,
    'setting-dialog': SettingDialog
  },
  data() {
    return {
      isShowDialog: false,
      isShowSettingDialog: false,
      filePath: '',
      pId: 0,
      faAngleLeft,
      faPlus,
      faFrog,
      buildTaskList: [],
      eventsStorePath: ''
    }
  },
  created() {
    const path = require('path');
    this.pId = Number(this.$route.params.id);
    let task = this.tasks.find(x => x.id == this.$route.params.id);
    this.filePath = task.path;
    this.eventsStorePath = path.dirname(task.path);
    let buildTaskList = this.buildTasks.filter(x => x.decodingTaskId === this.pId);
    this.buildTaskList.splice(0, this.buildTaskList.length, ...buildTaskList);
  },
  computed:{
    ...mapState({
      tasks: state => state.tasks,
      buildTasks: state => state.buildTasks
    })
  },
  watch: {
   buildTasks(val) {
    let buildTaskList = val.filter(x => x.decodingTaskId === this.pId);
    this.buildTaskList.splice(0, this.buildTaskList.length, ...buildTaskList);
   }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    showAddTaskDialog() {
      this.isShowDialog = true;
    },
    showSettingDialog() {
      this.isShowSettingDialog = true;
    }
  }
}
</script>
<style lang="scss" scoped>
.page {
  height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  .toolbar {
    z-index: 3;
    width: 100%;
    height: 60px;
    box-sizing: border-box;
    box-shadow: 1px 1px 2px 1px rgba(36, 36, 37, 0.2);
    position: sticky;
    top: 0;
    left: 0;
    background-color: #fff;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .back-text {
      color: #41b883;
      text-decoration: none;
      user-select: none;
      cursor: default;
    }
    .title {
      display: inline-block;
      margin-left: 20px;
      font-size: 20px;
      font-weight: 700;
    }
  }
  .footer {
    height: 40px;
  }
  .content {
    flex: 1;
    background-color: #f4f4f4;
    overflow: auto;
    position: relative;
    ul {
      list-style: none;
      box-sizing: border-box;
      padding: 5px 0;
      width: 60%;
      margin: 0 auto;
    }
  }
}
</style>