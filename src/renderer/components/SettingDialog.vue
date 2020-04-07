<template>
  <base-dialog 
    :value ="value" 
    dialogTitle="生成事件设置" 
    @input="onDialogVisibleChanged"
    @cancel="onCancel"
    @ok="onOK"
  >
    <section class="dialog-content">
      <div class="label">
        <span>Build前生成事件命令行</span>
      </div>
      <textarea v-model="beforeBuildCmd"></textarea>
       <div class="label">
        <span>Build后生成事件命令行</span>
      </div>
      <textarea v-model="afterBuildCmd"></textarea>
    </section>
  </base-dialog>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import fs from 'fs';
import path from 'path';
import BaseDialog from './BaseDialog';
export default {
  components: {
    'base-dialog': BaseDialog
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    storePath: {
      type: String,
      required: true
    },
    decodingTaskId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      beforeBuildCmd: '',
      afterBuildCmd: ''
    }
  },
  async created() {
    try {
      let events = this.buildEvents.find(x => x.taskId === this.decodingTaskId);
      if (events) {
        this.beforeBuildCmd = events.beforeBuildCmd;
        this.afterBuildCmd = events.afterBuildCmd;
      } else {
        let beforeBuildContent = await fs.promises.readFile(path.join(this.storePath, 'buildEvents', 'beforeBuild.txt'), {encoding: 'utf8'});
        this.beforeBuildCmd = beforeBuildContent;
        let afterBuildContent = await fs.promises.readFile(path.join(this.storePath,  'buildEvents', 'afterBuild.txt'), {encoding: 'utf8'});
        this.afterBuildCmd = afterBuildContent;
        this.upsertBuildEvents({taskId: this.decodingTaskId, beforeBuildCmd: this.beforeBuildCmd, afterBuildCmd: this.afterBuildCmd});
      }
    } catch {
      this.beforeBuildCmd = '';
      this.afterBuildCmd = '';
    }
  },
  computed: {
    ...mapState({
      buildEvents: state => state.buildEvents
    })
  },
  methods: {
    ...mapMutations([
        'upsertBuildEvents'
      ]
    ),
    onDialogVisibleChanged(value) {
      this.$emit('input', value);
    },
    onCancel() {

    },
    async onOK() {
      try {
        this.$emit('input', false);
        if (!fs.existsSync(path.join(this.storePath, 'buildEvents'))) {
          await fs.promises.mkdir(path.join(this.storePath, 'buildEvents'));
        }
        await fs.promises.writeFile(path.join(this.storePath, 'buildEvents','beforeBuild.txt'), this.beforeBuildCmd, { encoding: 'utf8'});
        await fs.promises.writeFile(path.join(this.storePath, 'buildEvents', 'afterBuild.txt'), this.afterBuildCmd, {encoding: 'utf8'});
        this.upsertBuildEvents({taskId: this.decodingTaskId, beforeBuildCmd: this.beforeBuildCmd, afterBuildCmd: this.afterBuildCmd});
      } catch(err) {
        alert(err.message);
        this.$emit('input', true);
      }
    }
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