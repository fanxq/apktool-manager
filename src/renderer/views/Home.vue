<template>
  <div class="page">
    <div class="toolbar">
      <button class="btn" @click="showAddTaskDialog">添加</button>
      <div class="search-input-warpper">
        <span>
          <font-awesome-icon :icon="faSearch"></font-awesome-icon>
        </span>
        <input type="text" placeholder="搜索..." @keyup.enter="onSearch" v-model="taskName">
      </div>
    </div>
    <div class="content">
      <ul>
        <li v-for="(task, index) in tasks" :key="index">
          <card v-bind="task"></card>
        </li>
      </ul>
      <page-description v-show="tasks.length === 0" />
    </div>
    <div class="footer">
      <span>Power by <a href="javascript:void;" @click="openExternal">Apktool</a> </span>
    </div>
    <decoding-task-dialog v-model="isShowDialog"></decoding-task-dialog>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { mapState } from 'vuex';
import DecodingTaskDialog from '../components/DecodingTaskDialog';
import Card from '../components/Card';
import PageDescription from '../components/PageDescription';
export default {
  components: { 
    'decoding-task-dialog': DecodingTaskDialog,
    'card': Card,
    'page-description': PageDescription
  },
  data() {
    return {
      isShowDialog: false,
      faSearch,
      taskName: ''
    }
  },
  computed: {
    ...mapState({
      tasks: state => state.tasks
    })
  },
  methods: {
    showAddTaskDialog() {
      this.isShowDialog = true;
    },
    openExternal() {
      const {shell} = require('electron');
      shell.openExternal('https://ibotpeaches.github.io/Apktool/');
    },
    async onSearch() {
      let result = await ipcRenderer.invoke('find-decompile-tasks', this.taskName);
      if (result) {
        this.tasks.splice(0, this.tasks.length, ...result);
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../assets/css/shared.scss';
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
    .search-input-warpper {
      height: 24px;
      display: inline-flex;
      padding: 2px 10px;
      border:  2px solid #41b883;
      border-radius: 30px;
      align-items: center;
      justify-content: space-between;
      span {
        display: inline-block;
        // width: 20px;
        // height: 20px;
        // background-color: #ccc;
        color: #999;
        margin-right: 5px;
      }
      input {
        width: 200px;
        appearance: none;
        border: none;
        outline: none;
        &::placeholder {
          color: #999;
        }
      }
    }
  }
  .footer {
    height: 40px;
    background-color: #fff;
    padding: 5px 10px;
    line-height: 40px;
    color: #888;
    font-size: 14px;
    a {
      color: rgba($color: $default-color, $alpha: 0.65);
    }
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