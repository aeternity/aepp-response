<template>
  <ae-modal v-if="visible" title="Create Question" @close="closeHandler">
    <form class="create-question-modal" @submit.prevent="createQuestion">
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
      <div v-else class="avatar" />

      <label :for="`${_uid}_twitter`">
        Twitter account
        <span class="help" :class="{ danger: errors.has('twitter') }">
          {{errors.first('twitter')}}
        </span>
      </label>
      <text-muted small>
        Choose a Twitter account from whom you want a video answer.
      </text-muted>
      <twitter-account-input
        name="twitter"
        :id="`${_uid}_twitter`"
        v-model="twitterUserId"
        v-validate="'required'"
        :class="{ danger: errors.has('twitter') }"
      />

      <label :for="`${_uid}_title`">
        Question – short
        <span class="help" :class="{ danger: errors.has('title') }">
          <template v-if="!errors.has('title')">characters left: {{50 - title.length}}</template>
          {{errors.first('title')}}
        </span>
      </label>
      <input
        placeholder="Enter short question"
        name="title"
        :id="`${_uid}_title`"
        v-model="title"
        v-validate="'required|max:50'"
        :class="{ danger: errors.has('title') }"
      />

      <label :for="`${_uid}_body`">
        Description
        <span class="help" :class="{ danger: errors.has('body') }">
          <template v-if="!errors.has('body')">characters left: {{200 - body.length}}</template>
          {{errors.first('body')}}
        </span>
      </label>
      <textarea
        placeholder="Write an extended description"
        name="body"
        :id="`${_uid}_body`"
        v-model="body"
        v-validate="'max:200'"
        :class="{ danger: errors.has('body') }"
      />

      <label>Your donation</label>
      <text-muted small>
        Once you get a reply to your question this amount
        will be donated to a foundation of your choice.
      </text-muted>
      <ae-amount v-model="amount" :min="1" />

      <label :for="`${_uid}_foundation`">
        Foundation
        <span class="help" :class="{ danger: errors.has('foundation') }">
          {{errors.first('foundation')}}
        </span>
      </label>
      <select
        placeholder="Enter short question"
        name="foundation"
        :id="`${_uid}_foundation`"
        v-model="foundationId"
        v-validate="'required'"
        :class="{ danger: errors.has('foundation'), unselected: !foundationId }"
      >
        <option value="" disabled>Chose Foundation</option>
        <option
          v-for="(foundation, id) in foundations"
          :value="id"
        >
          {{foundation.name}}
        </option>
      </select>

      <ae-content-button submit :disabled="!account">
        <img :src="require(`emoji-datasource-apple/img/apple/64/1f4b0.png`)" />
        Create Question
      </ae-content-button>

      <div class="secondary" v-if="!account">
        You need to activate the AE Identity Manager or Metamask.
      </div>
    </form>
  </ae-modal>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import { focus } from 'vue-focus';
  import { AeModal, AeAmount } from 'aepp-components-davidyuk';
  import AeContentButton from './AeContentButton';
  import TextMuted from './TextMuted';
  import TwitterAccountInput from './TwitterAccountInput';

  export default {
    data() {
      return {
        twitterUserId: '',
        title: '',
        body: '',
        amount: 1,
        foundationId: '',
      };
    },
    components: { AeModal, TextMuted, AeAmount, AeContentButton, TwitterAccountInput },
    directives: { focus },
    computed: mapState({
      visible: state => state.response.createQuestionModalShown,
      foundations: state => state.response.foundations,
      account: state => state.response.account,
      avatarUrl(state) {
        const user = state.response.twitterUsers[this.twitterUserId];
        return user && user.imageUrl;
      },
    }),
    methods: {
      ...mapMutations({
        closeHandler: 'toggleCreateQuestionModal',
      }),
      async createQuestion() {
        const valid = await this.$validator.validateAll();
        if (!valid) return;
        const { twitterUserId, title, body, amount, foundationId } = this;
        await this.$store.dispatch('createQuestion', {
          twitterUserId, title, body, amount, foundationId,
        });
        Object.assign(this.$data, this.$options.data());
        const { localQuestions } = this.$store.state.response;
        this.$router.push({
          name: 'question',
          params: localQuestions[localQuestions.length - 1],
        });
        this.closeHandler();
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~aepp-components-davidyuk/dist/variables.scss';

  .create-question-modal {
    .avatar {
      display: block;
      margin: 0 auto;
      width: 90px;
      height: 90px;
      border-radius: 45px;
      background-color: $silver;
      border: 0;
    }

    input, select {
      display: block;
    }
    input, select, textarea {
      border-radius: 10px;
      font-size: 16px;
      border: solid 2px $smoke;
      width: 100%;
      box-sizing: border-box;
      background-color: $white;

      &::placeholder, &.unselected {
        color: $silver;
      }

      &.danger {
        border-color: $maegenta;
      }
    }
    input, textarea {
      padding: 7px 13px;
      line-height: 26px;
    }
    select {
      padding: 10.5px 13px;

      option:enabled {
        color: $anthracite;
      }
    }
    input[type=date] {
      padding: 6px 13px;
    }
    textarea {
      min-height: 135px;
    }

    .text-muted {
      display: block;
      margin-top: 10px;
    }
  }
</style>
