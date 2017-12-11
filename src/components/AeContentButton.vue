<template>
  <router-link v-if="to && !isExternalLink" :to="to" :class="className" @click="click">
    <slot />
  </router-link>
  <a v-else-if="to" :href="to" target="_blank" :class="className" @click="click">
    <slot />
  </a>
  <button v-else :class="className" @click="click" :type="type">
    <slot />
  </button>
</template>

<script>
  export default {
    props: {
      to: { type: [String, Object], required: false },
      aubergine: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      submit: { type: Boolean, default: false },
    },
    computed: {
      className() {
        return {
          'ae-content-button': true,
          aubergine: this.aubergine,
          disabled: this.disabled,
        };
      },
      isExternalLink() {
        return this.to && (new URL(this.to, window.location)).host !== window.location.host;
      },
      type() {
        return this.submit && !this.disabled ? 'submit' : 'button';
      },
    },
    methods: {
      click(e) {
        if (!this.disabled) this.$emit('click', e);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~aepp-components-davidyuk/dist/variables.scss';

  .ae-content-button {
    height: 50px;
    width: 305px;
    line-height: 40px;
    border-radius: 25px;
    border: none;
    box-sizing: border-box;
    background-color: $maegenta;
    color: $white;
    font-weight: 500;
    font-size: 16px;
    text-decoration: none;
    padding: 0;
    margin: 35px auto 5px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px 0 rgba(60, 60, 60, 0.1);

    &.aubergine {
      background-color: $aubergine;
    }

    &.disabled {
      opacity: .5;
      cursor: not-allowed;
    }
  }
</style>
