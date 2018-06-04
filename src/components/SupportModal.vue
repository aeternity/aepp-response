<template>
  <ae-modal v-if="questionId" title="Support Question" @close="closeHandler">
    <form class="create-question-modal" @submit.prevent="supportQuestion">
      <ae-label
        :for="`${_uid}_amount`"
        help-type="dramatic"
        :help-text="errors.first('amount')"
      >Amount</ae-label>
      <ae-amount-input
        name="amount"
        :id="`${_uid}_amount`"
        :value="{ amount, symbol: 'AE' }"
        @input="value => amount = value.amount"
        v-validate:amount="'min_value:1'"
        :units="[{ symbol: 'AE', name: 'æternity' }]"
      />

      <ae-content-button submit :disabled="!account">
        <img :src="require(`emoji-datasource-apple/img/apple/64/1f44f.png`)" />
        Make Transaction
      </ae-content-button>

      <div class="secondary" v-if="account">
        You can support the question as much as you want,
        by simply changing the amount of the transaction.
      </div>
      <div class="secondary" v-else>
        You need to activate the AE Identity Manager or Metamask.
      </div>
    </form>
  </ae-modal>
</template>

<script>
  import { mapState } from 'vuex';
  import { focus } from 'vue-focus';
  import { AeModal, AeLabel, AeAmountInput } from '@aeternity/aepp-components';
  import AeContentButton from './AeContentButton';

  export default {
    data() {
      return {
        amount: 1,
      };
    },
    components: { AeModal, AeLabel, AeAmountInput, AeContentButton },
    directives: { focus },
    computed: mapState({
      questionId: state => state.response.supportModalQuestion,
      account: state => state.response.account,
    }),
    methods: {
      closeHandler() {
        this.$store.commit('showSupportModalForQuestion');
      },
      async supportQuestion() {
        const { questionId, amount } = this;
        await this.$store.dispatch('supportQuestion', { questionId, amount: +amount });
        this.closeHandler();
      },
    },
  };
</script>
