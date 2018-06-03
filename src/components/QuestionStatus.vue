<template>
  <div class="question-status" v-if="question.status === 'unsynced'">
    <ae-loader /> Publishing ...
  </div>
  <div class="question-status" v-else-if="question.status === 'failed'">
    Something went wrong while publishing this question
  </div>
  <div class="question-status" v-else-if="!question.tweetId">
    <ae-loader /> Publishing of the corresponding tweet ...
  </div>
</template>

<script>
  import { AeLoader } from '@aeternity/aepp-components';

  export default {
    components: { AeLoader },
    props: {
      question: { type: Object },
    },
  };
</script>

<style lang="scss" scoped>
  .question-status {
    margin: 10px 0;

    .ae-loader {
      margin-right: 5px;
    }
  }
</style>
