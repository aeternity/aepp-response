<template>
  <ae-panel
    :to="{ name: 'question', params: question }"
    :ratioBottom="1"
  >
    <div class="question-list-item">
      <ae-badge v-if="label" :class="label.type">{{label.text}}</ae-badge>
      <img :src="question.twitterUser.imageUrl" />
      <div class="content">
        <h2>@{{question.twitterUser.screenName}}, {{question.title}}</h2>
        <text-muted v-if="question.body">{{question.body}}</text-muted>
        <question-status :question="question" />
        <question-statistic :question="question" />
      </div>
      <div class="arrow">
        <ae-icon name="chevron" />
      </div>
    </div>
  </ae-panel>
</template>

<script>
  import { AePanel, AeBadge, AeIcon } from '@aeternity/aepp-components';
  import TextMuted from './TextMuted';
  import QuestionStatistic from './QuestionStatistic';
  import QuestionStatus from './QuestionStatus';

  export default {
    components: { AePanel, AeBadge, AeIcon, TextMuted, QuestionStatistic, QuestionStatus },
    props: ['question'],
    computed: {
      label() {
        switch (this.question.stage) {
          case 'closed': return { text: 'closed' };
          case 'revertable': return { text: 'reclaim founds', type: 'branded' };
          case 'answered': return { text: 'answered' };
          default: return null;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~@aeternity/aepp-components/dist/variables.scss';

  .question-list-item {
    display: flex;
    flex-direction: row;
    position: relative;

    .ae-badge {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 12px;
      padding: 0 9px;

      &.branded {
        background-color: $maegenta;
      }
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
      display: flex;
      opacity: .3;

      .ae-icon {
        margin: auto;
      }
    }
  }
</style>
