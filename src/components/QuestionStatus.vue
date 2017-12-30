<template>
  <div class="question-status" v-if="question.status === 'unsynced'">
    <ae-loader /> Publishing ...
  </div>
  <div class="question-status" v-else-if="question.status === 'failed'">
    Something went wrong while publishing this question
  </div>
  <div class="question-status" v-else-if="!hideTweetStatus">
    <template v-if="question.questionTweetId">
      Tweet with this question is
      <a
        :href="`https://twitter.com/statuses/${question.questionTweetId}`"
        target="_blank"
      >here</a>.
    </template>
    <template v-else>
      <ae-loader /> Publishing of the corresponding tweet ...
    </template>
  </div>
</template>

<script>
  import AeLoader from './AeLoader';

  export default {
    components: { AeLoader },
    props: {
      question: { type: Object },
      'hide-tweet-status': { type: Boolean },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~aepp-components-davidyuk/dist/variables.scss';

  .question-status {
    margin: 10px 0;

    .ae-loader {
      margin-right: 5px;
    }

    a {
      color: inherit;
    }
  }
</style>
