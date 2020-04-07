<template>
  <section class="content">
    <h1>Apktool</h1>
    <h1>Manager</h1>
    <h2 v-text="pageType === 'decoding' ? 'Decoding': 'Building'"></h2>
    <p v-show="pageType === 'decoding'">
      The decode option on Apktool can be invoked either from <strong>d</strong> or <strong>decode</strong> like shown below.
    </p>
     <p v-show="pageType === 'building'">
      The build option can be invoked either from <strong>b</strong> or <strong>build</strong> like shown below
    </p>
    <p v-html="docs">
    </p>
    <p v-show="pageType === 'decoding'">
       more in <a href="javascript:void;" @click="openExternal">Apktool#decoding</a>
    </p>
    <p v-show="pageType === 'building'">
       more in <a href="javascript:void;" @click="openExternal">Apktool#building</a>
    </p>
  </section>
</template>
<script>
let docs = {
  decoding:`$ apktool d bar.apk
    <em>// decodes bar.apk to bar folder</em>

    $ apktool decode bar.apk
    <em>// decodes bar.apk to bar folder</em>

    $ apktool d bar.apk -o baz
    <em>// decodes bar.apk to baz folder</em>`,
  building: `$ apktool b bar
    <em>// builds bar folder into bar/dist/bar.apk file</em>

    $ apktool b .
    <em>// builds current directory into ./dist</em>

    $ apktool b bar -o new_bar.apk
    <em>// builds bar folder into new_bar.apk</em>`
}
export default {
  props: {
    pageType: {
      type: String,
      default: 'decoding'
    }
  },
  data() {
    return {
      docs: docs[this.pageType]
    }
  },
  methods: {
    openExternal() {
      const {shell} = require('electron');
      if (this.pageType === 'decoding') {
        shell.openExternal('https://ibotpeaches.github.io/Apktool/documentation/#decoding');
      } else {
        shell.openExternal('https://ibotpeaches.github.io/Apktool/documentation/#building');
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  @import '../assets/css/shared.scss';
  .content {
    color: rgba($color: #888, $alpha: 0.75);
    user-select: none;
    h1 {
      font-size: 64px;
      margin-top: 5px;
      margin-bottom: 0px;
      color: rgba($color: $default-color, $alpha: 0.45);
    }
    h2 {
      margin: 10px 0px;
    }
    p{
      white-space: pre-wrap;
      margin: 0;
      margin-top: 2px;
    }
  }
</style>