<template>
  <table class="question-statistic">
    <tr :class="{ 'large-font': largeFont }">
      <td>{{question.amount.toLocaleString('en')}} Æ</td>
      <td>{{question.supporterCount}}</td>
      <td v-if="showDaysLeft" :class="{ active: !daysLeft }">{{daysLeft}}</td>
    </tr>
    <tr>
      <td><text-muted>Supported</text-muted></td>
      <td><text-muted>Supporters</text-muted></td>
      <td v-if="showDaysLeft"><text-muted>Days&nbsp;left</text-muted></td>
    </tr>
  </table>
</template>

<script>
  import TextMuted from './TextMuted';

  export default {
    components: { TextMuted },
    props: {
      question: Object,
      largeFont: { type: Boolean, default: false },
    },
    computed: {
      daysLeft() {
        return Math.floor(Math.max(this.question.deadlineAt - Date.now(), 0) / 1000 / 60 / 60 / 24);
      },
      showDaysLeft() {
        return this.question.stage !== 'answered';
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~@aeternity/aepp-components/dist/variables.scss';

  .question-statistic {
    margin-top: 20px;
    font-size: 16px;
    width: 100%;

    .text-muted {
      text-transform: uppercase;
      font-size: 12px;
    }

    tr {
      &:first-child {
        font-weight: bold;

        &.large-font {
          font-size: 24px;
        }

        td {
          padding-top: 0;
        }
      }
      &:last-child {
        color: $grey;
        td {
          padding-bottom: 0;
        }
      }
      td {
        padding: 1px;
        &:first-child {
          padding-left: 0;
        }
        &.active {
          color: $maegenta;
        }
      }
    }
  }
</style>
