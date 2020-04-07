import Vue from 'vue';
import MessageBox from './MessageBox.vue';

let messageBoxInstance = null;
let MessageBoxConstructor = Vue.extend(MessageBox);
let init = () => {
  messageBoxInstance = new MessageBoxConstructor();
  messageBoxInstance.$mount();
  document.body.appendChild(messageBoxInstance.$el);
};

let caller = (options) => {
  if (!messageBoxInstance) {
    init();
  }
  messageBoxInstance.setOptions(options);
  messageBoxInstance.showModal();
}

export default {
  install(vue) {
    vue.prototype.$msgbox = caller
  }
};