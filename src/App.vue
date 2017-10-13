<template>
  <div>
    <app-header />
    <app-header hidden />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
  import AppHeader from './components/AppHeader';

  export default {
    components: {
      AppHeader,
    },
  };
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Roboto');
  @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
  @import "~normalize.css";
  @import "../node_modules/font-awesome/css/font-awesome.css";
  @import "./variables";

  * {
    outline: none !important;
    -webkit-font-smoothing: antialiased;
  }
  body {
    background: $gray-lighter;
    font-family: $font-family-text;
    color: $base-text-color;
  }
  .main-content {
    max-width: $container-width;
    margin: 0 auto;
    padding-top: 10px;
    @media screen and (max-width: $container-width){
      padding: 10px;
    }
  }
  button, .button {
    border: none;
    background-color: transparent;
    font-weight: bold;
    border-radius: 100px;
    padding: 5px 20px;
    cursor: pointer;
    font-family: $font-family-header;
    text-align: center;
    box-sizing: border-box;
  }
  input, input[type=text] {
    appearance: none;
  }
  @media screen and (max-width: $screen-xs){
    .hidden-mobile {
      display: none;
    }
  }
</style>
