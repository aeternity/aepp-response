<template>
  <select
    class="ae-select"
    :class="{ unselected: !value }"
    :placeholder="placeholder"
    @input="handleInput"
    :value="value"
  >
    <slot />
  </select>
</template>

<script>
  export default {
    props: {
      value: undefined,
      placeholder: undefined,
    },
    methods: {
      handleInput(inputEvent) {
        this.$emit('input', inputEvent.target.value);
      },
    },
  };
</script>

<style scoped lang="scss">
  @import '~@aeternity/aepp-components/dist/variables.scss';

  .ae-select {
    display: block;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10px;
    border: solid 2px $silver;
    padding: 19px 26px;
    margin: 10px 0 30px 0;
    background-color: $white;
    font-weight: 500;
    letter-spacing: 0.2px;
    color: $anthracite;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    appearance: none;

    * {
      font-weight: 500;
    }

    &::placeholder, &.unselected {
      opacity: .7;
    }
  }
</style>
