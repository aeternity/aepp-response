<template>
  <ae-panel
    :to="{ name: 'question', params: { id: question.id || question.ipfsHash } }"
    :ratioBottom="(Date.now() - question.createdAt) / (question.deadlineAt - question.createdAt)"
  >
    <div class="question-list-item">
      <ae-category v-if="question.tweetId">answered</ae-category>
      <img :src="`https://twitter.com/${question.twitter}/profile_image?size=original`" />
      <div class="content">
        <h2>@{{question.twitter}}</h2>
        <text-muted>
          {{question.title}}
          <template v-if="question.body"> – {{question.body}}</template>
        </text-muted>
        <question-statistic :question="question" />
      </div>
      <div class="arrow">
        <i class="fa fa-angle-right" />
      </div>
    </div>
  </ae-panel>
</template>

<script>
  import { AePanel, AeCategory } from 'aepp-components-davidyuk';
  import TextMuted from './TextMuted';
  import QuestionStatistic from './QuestionStatistic';

  export default {
    components: { AePanel, AeCategory, TextMuted, QuestionStatistic },
    props: ['question'],
  };
</script>

<style lang="scss" scoped>
  @import '~aepp-components-davidyuk/dist/variables.scss';

  .question-list-item {
    display: flex;
    flex-direction: row;
    position: relative;

    .ae-category {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 12px;
      padding: 0 9px;
    }

    img {
      width: 50px;
      height: 50px;
      border-radius: 25px;
      margin-right: 12px;
      flex-shrink: 0;
      object-fit: cover;
    }

    .content {
      flex-grow: 1;

      h2 {
        margin: 0;
        font-size: 16px;
        line-height: 20px;
        font-weight: bold;
      }

      h2 + .text-muted {
        display: block;
        margin: 4px 0 0 0;
        font-size: 14px;
        line-height: 23px;
      }
    }

    .arrow {
      font-size: 28px;
      display: flex;
      margin-left: 10px;
      opacity: .3;

      i {
        margin: auto;
      }
    }
  }
</style>
