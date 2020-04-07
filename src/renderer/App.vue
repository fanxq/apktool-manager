<template>
  <div id="app">
    <main class="view">
      <router-view/>
    </main>
  </div>
</template>
<style lang="scss">
#app {
  // font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  display: flex;
  // flex-direction: column;
  align-items: stretch;
}

.view {
  flex: 1;
  height: 100%;
}
</style>
