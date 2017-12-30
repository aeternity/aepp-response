<template>
  <span class="ae-loader" />
</template>

<style lang="scss" scoped>
  @import '~aepp-components-davidyuk/dist/variables.scss';

  @keyframes rotation {
    from { transform: rotate(45deg); }
    to { transform: rotate(225deg); }
  }

  .ae-loader {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 1em;
    border: .2em solid $maegenta;
    vertical-align: middle;
    border-left-color: transparent;
    border-right-color: transparent;
    animation-name: rotation;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
</style>
