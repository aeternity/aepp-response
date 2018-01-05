<template>
  <ae-panel v-if="question" :closeHandler="close">
    <div class="question-detail">
      <div class="centered" v-if="['closed', 'revertable'].includes(question.stage)">
        This question was not answered in the defined time frame and is closed.
        Everybody who supported this question can claim his tokens back
      </div>
      <div class="twitter-account">
        <a :href="`https://twitter.com/${question.twitterUser.screenName}`" target="_blank">
          <img :src="question.twitterUser.imageUrl" />
          @{{question.twitterUser.screenName}}
        </a>
      </div>
      <h2 class="title">“{{question.title}}"</h2>
      <div class="body" v-if="question.body">{{question.body}}</div>
      <div class="secondary">
        Asked by <span>{{question.author.slice(0, 8)}}...</span>
      </div>
      <tweet
        v-if="question.stage === 'answered'"
        class="tweet"
        :id="question.answerTweetId"
        :options="{ conversation: 'none', width: 550, align: 'center' }"
      />
      <ae-hr v-else />
      <question-status :question="question" />
      <ae-hr />
      <question-statistic largeFont :question="question" />
      <div class="will-be-donated">
        {{donatedTo}}
        <a :href="question.foundation.url" target="_blank">{{question.foundation.name}}</a>
      </div>
      <ae-hr />
      <h2 class="highest-supporters">Highest supporters</h2>
      <table>
        <tr v-for="supporter in question.highestSupporters">
          <td>{{supporter.account.slice(0, 8)}}...</td>
          <td><text-muted>{{supporter.lastSupportAt | moment('calendar')}}</text-muted></td>
          <td>{{supporter.amount}}&nbsp;Æ</td>
        </tr>
      </table>
      <template v-if="question.stage === 'opened'">
        <ae-content-button @click="showSupportModal" :disabled="status === 'unsynced'">
          <img :src="require(`emoji-datasource-apple/img/apple/64/1f44f.png`)" />
          Support Question
        </ae-content-button>
        <div class="secondary">
          Minimum amount to support: 1&nbsp;Æ
        </div>
        <ae-hr />
        <div class="centered">
          Are you @{{question.twitterUser.screenName}} and you want to respond to this question, so we can
          donate the full amount to a good cause? Answer the question with a reply on
          Twitter with a short video of you. Easily reply with this button:
        </div>
        <ae-content-button to="https://twitter.com/" aubergine>
          <img :src="require(`emoji-datasource-apple/img/apple/64/270f-fe0f.png`)" />
          Answer on Twitter
        </ae-content-button>
      </template>
      <template v-if="['closed', 'revertable'].includes(question.stage)">
        <ae-content-button @click="revertSupport" :disabled="revertButtonIsDisabled">
          Claim tokens back
        </ae-content-button>
        <div class="secondary">{{revertButtonSecondary}}</div>
      </template>
    </div>
  </ae-panel>
  <p v-else class="centered">This question seems to be missing</p>
</template>

<script>
  import { mapState } from 'vuex';
  import { AePanel, AeHr, AeHrProgressBar } from 'aepp-components-davidyuk';
  import { Tweet } from 'vue-tweet-embed';
  import TextMuted from './TextMuted';
  import QuestionStatistic from './QuestionStatistic';
  import QuestionStatus from './QuestionStatus';
  import AeContentButton from './AeContentButton';

  export default {
    props: {
      id: String,
      status: String,
    },
    components: {
      AePanel,
      AeHr,
      AeHrProgressBar,
      TextMuted,
      QuestionStatistic,
      QuestionStatus,
      AeContentButton,
      Tweet,
    },
    data() {
      return {
        revertInProgress: {},
      };
    },
    computed: {
      ...mapState({
        question({ response: { localQuestions, questions } }) {
          let q;
          if (this.status) {
            q = localQuestions[this.id];
            if (typeof q === 'string') {
              q = questions[q];
              this.$router.replace({ name: 'question', params: q });
            }
          } else {
            q = questions[this.id];
          }
          return q;
        },
        account: ({ response: { account } }) => account,
      }),
      donatedTo() {
        switch (this.question.stage) {
          case 'opened': return 'will be donated to';
          case 'closed':
          case 'revertable':
            return 'was going to donate to';
          case 'answered': return 'donated to';
          default: throw new Error('Invalid stage');
        }
      },
      revertButtonSecondary() {
        const { account, question, revertInProgress } = this;
        if (!account) return 'You need to activate the AE Identity Manager or Metamask';
        if (+question.supportRevertedAt[account]) {
          return [
            question.supporterAmount[account],
            'AE were send back to you on',
            question.supportRevertedAt[account].toLocaleDateString(),
          ].join(' ');
        }
        if (revertInProgress[account]) return 'Tokens returning in progress';
        if (question.supporterAmount[account]) {
          return `You supported this question with ${question.supporterAmount[account]} Æ`;
        }
        return 'With this account you didn\'t support this question';
      },
      revertButtonIsDisabled() {
        return this.question.stage !== 'revertable' || this.revertInProgress[this.account];
      },
    },
    methods: {
      close() {
        this.$router.push({
          name: 'question-list',
          params: this.$store.state.response.lastQuestionListParams,
        });
      },
      async revertSupport() {
        await this.$store.dispatch('revertSupport', this.id);
        this.$set(this.revertInProgress, this.account, true);
      },
      showSupportModal() {
        this.$store.commit('showSupportModalForQuestion', this.id);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Roboto+Mono:500');
  @import '~aepp-components-davidyuk/dist/variables.scss';

  .centered {
    font-size: 16px;
    line-height: 23px;
    text-align: center;
    color: $black;
    margin-bottom: 20px;
  }

  .question-detail {
    padding: 0 110px;
    overflow: hidden;

    .twitter-account {
      text-align: center;

      a {
        text-decoration: none;
        display: inline-block;
        font-size: 18px;
        line-height: 28px;
        color: $black;

        img {
          width: 80px;
          height: 80px;
          border-radius: 40px;
          display: block;
          object-fit: cover;
          margin: 0 auto 8px auto;
        }
      }
    }

    .title {
      font-size: 24px;
      font-weight: bold;
      line-height: 32px;
      margin-top: 25px;
      margin-bottom: 4px;
    }

    .body {
      font-size: 18px;
      line-height: 28px;
      color: $black;
      margin-bottom: 20px;
    }

    .tweet {
      margin: 20px 0 40px 0;
    }

    .will-be-donated {
      font-size: 12px;
      font-weight: 500;
      color: $grey;
      text-transform: uppercase;
      margin: 20px 0;

      a {
        font-size: 12px;
        font-weight: 500;
        color: $anthracite;
        text-decoration: none;
      }
    }

    .highest-supporters {
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.2px;
      color: $maegenta;
      text-transform: uppercase;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    table {
      width: 100%;

      tr {
        td:nth-child(1) {
          font-size: 16px;
          line-height: 30px;
          font-weight: 500;
          font-family: 'Roboto Mono', monospace;
          width: 1px;
          padding-right: 13px;
        }
        td:nth-child(2) {
          font-size: 14px;
        }
        td:nth-child(3) {
          text-align: right;
          color: $maegenta;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    @media (max-width: $container-width) {
      padding: 0 55px;
    }

    @media (max-width: $screen-phone) {
      padding: 0;
    }
  }
</style>
