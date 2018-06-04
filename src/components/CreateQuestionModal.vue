<template>
  <ae-modal v-if="visible" title="Create Question" @close="closeHandler">
    <form class="create-question-modal" @submit.prevent="createQuestion">
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
      <div v-else class="avatar" />

      <ae-label
        :for="`${_uid}_twitter`"
        help-type="dramatic"
        :help-text="errors.first('twitter')"
      >
        Twitter account
      </ae-label>
      <text-muted small>
        Choose a Twitter account from whom you want a video answer.
      </text-muted>
      <twitter-account-input
        name="twitter"
        :id="`${_uid}_twitter`"
        v-model="twitterUserId"
        v-validate="'required'"
      />

      <ae-label
        :for="`${_uid}_title`"
        :help-type="errors.has('title') ? 'dramatic' : undefined"
        :help-text="errors.first('title') || `characters left: ${50 - title.length}`"
      >
        Question – short
      </ae-label>
      <ae-input
        placeholder="Enter short question"
        name="title"
        :id="`${_uid}_title`"
        v-model="title"
        v-validate="'required|max:50'"
      />

      <ae-label
        :for="`${_uid}_body`"
        :help-type="errors.has('body') ? 'dramatic' : undefined"
        :help-text="errors.first('body') || `characters left: ${200 - body.length}`"
      >
        Description
      </ae-label>
      <ae-textarea
        placeholder="Write an extended description"
        name="body"
        :id="`${_uid}_body`"
        v-model="body"
        v-validate="'max:200'"
      />

      <ae-label
        :for="`${_uid}_amount`"
        help-type="dramatic"
        :help-text="errors.first('amount')"
      >Your donation</ae-label>
      <text-muted small>
        Once you get a reply to your question this amount
        will be donated to a foundation of your choice.
      </text-muted>
      <ae-amount-input
        name="amount"
        :id="`${_uid}_amount`"
        :value="{ amount, symbol: 'AE' }"
        @input="value => amount = value.amount"
        v-validate:amount="'min_value:1'"
        :units="[{ symbol: 'AE', name: 'æternity' }]"
      />

      <ae-label
        :for="`${_uid}_foundation`"
        help-type="dramatic"
        :help-text="errors.first('foundation')"
      >
        Foundation
      </ae-label>
      <ae-select
        placeholder="Enter short question"
        name="foundation"
        :id="`${_uid}_foundation`"
        v-model="foundationId"
        v-validate="'required'"
      >
        <option value="" disabled>Chose Foundation</option>
        <option
          v-for="(foundation, id) in foundations"
          :value="id"
        >
          {{foundation.name}}
        </option>
      </ae-select>

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
  import {
    AeModal, AeLabel, AeInput, AeTextarea, AeAmountInput,
  } from '@aeternity/aepp-components';
  import AeContentButton from './AeContentButton';
  import AeSelect from './AeSelect';
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
    components: {
      AeModal,
      AeLabel,
      AeInput,
      AeTextarea,
      AeAmountInput,
      AeContentButton,
      AeSelect,
      TextMuted,
      TwitterAccountInput,
    },
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
  @import '~@aeternity/aepp-components/dist/variables.scss';

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

    .text-muted {
      display: block;
      margin-top: 10px;
    }
  }
</style>
