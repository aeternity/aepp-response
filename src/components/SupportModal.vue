<template>
  <ae-modal v-if="questionId" title="Support Question" @close="closeHandler">
    <form class="create-question-modal" @submit.prevent="supportQuestion">
      <label>Amount</label>
      <ae-amount v-model="amount" :min="1" />

      <ae-content-button>
        <img :src="require(`emoji-datasource-apple/img/apple/64/1f44f.png`)" />
        Make Transaction
      </ae-content-button>

      <div class="secondary">
        You can support the question as much as you want,
        by simply changing the amount of the transaction.
      </div>
    </form>
  </ae-modal>
</template>

<script>
  import { mapState } from 'vuex';
  import { focus } from 'vue-focus';
  import { AeModal, AeAmount } from 'aepp-components-davidyuk';
  import AeContentButton from './AeContentButton';

  export default {
    data() {
      return {
        amount: 1,
      };
    },
    components: { AeModal, AeAmount, AeContentButton },
    directives: { focus },
    computed: mapState({
      questionId: state => state.response.supportModalQuestion,
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
