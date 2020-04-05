<template>
  <dialog>
    <header>
      <slot name="header">
        <h3>{{dialogTitle}}</h3>
        <button class="icon-btn" @click="onCancel">
          <font-awesome-icon :icon="faTimes"></font-awesome-icon>
        </button>
      </slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer">
        <section class="default-footer-container">
          <button class="btn btn-cancel" @click="onCancel">取消</button>
          <button class="btn" @click="onOK" autofocus>确定</button>
        </section>
      </slot>
    </footer>
  </dialog>
</template>
<script>
import { faTimes } from '@fortawesome/free-solid-svg-icons';
export default {
  props:{
    value: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogElement: null,
      faTimes
    }
  },
  watch: {
    value(val) {
      this.toggleDialog();
    }
  },
  methods: {
    showDialog() {
      this.dialogElement && this.dialogElement.showModal();
      this.$emit('input', true);
    },
    hideDialog() {
      this.dialogElement && this.dialogElement.close();
      this.$emit('input', false);
    },
    toggleDialog() {
      if (this.value) {
        this.showDialog();
      } else {
        this.hideDialog();
      }
    },
    onCancel() {
      this.hideDialog();
      this.$emit('cancel');
    },
    onOK() {
      //this.hideDialog();
      this.$emit('ok');
    }
  },
  mounted() {
    this.dialogElement = this.$el;
    this.toggleDialog();
  }
}
</script>
<style lang="scss" scoped>
@import '../assets/css/shared.scss';
dialog {
  border: 1px solid #cccccc;
  padding: 0 10px 10px;
  header {
    height: 20px;
    border-bottom: 1px solid #ccc;
    padding: 10px;
    line-height: 20px;
    position: relative;
    h3 {
      padding: 0;
      margin: 0;
      text-align: left;
    }
    .icon-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(-100%, -50%);
      appearance: none;
      outline: none;
      border: none;
      color: $red;
      background-color: transparent;
      padding: 0;
      font-size: 18px;
    }
  }
  main {
    min-width: 300px;
  }
  footer {
    height: 30px;
    padding: 5px 10px;
    line-height: 30px;
    .default-footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .btn-cancel {
        color: $red;
        border-color: $red;
         &:focus {
          background-color: rgba($color: $red, $alpha: 0.3);
        }
        &:hover{
          background-color: $red;
          color: #fff;
        }
      }
    }
  }
}
</style>