<template>
  <base-dialog v-model="isShow">
    <section class="dialog-content">
      <font-awesome-icon 
        class="icon"
        :class="[type === 'error'? 'error':'info']"
        :icon="type === 'error'? faTimesCircle: faInfoCircle" 
      ></font-awesome-icon>
      <span class="content">
        {{message}}
      </span>
    </section>
    <section class="footer" slot="footer">
      <button autofocus class="btn" @click="onOK">确定</button>
    </section>
  </base-dialog>
</template>
<script>
import BaseDialog from '../BaseDialog';
import { faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
export default {
  components: {
    'base-dialog': BaseDialog
  },
  data() {
    return {
      isShow: false,
      faTimesCircle,
      faInfoCircle,
      type: 'error',
      message: ''
    }
  },
  methods: {
    setOptions(options) {
      this.type = options.type || 'error',
      this.message = options.message || '';
    },
    showModal() {
      this.isShow = true;
    },
    onOK() {
      this.isShow = false;
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/shared.scss';
.dialog-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  .icon {
    font-size: 24px;
    margin-right: 10px;
    &.error {
      color: $red;
    }
    &.info {
      color: #0266a8;
    }
  }
  .content {
    flex: 1;
  }
}
.footer {
  button {
    float: right;
  }
}
</style>