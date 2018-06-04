<template>
  <ae-main>
    <ae-header name="Questions">
      <ae-button
        type="dramatic"
        @click="toggleCreateQuestionModal">
        <ae-icon
          slot="icon"
          invert
          type="dramatic"
          name="plus" /> Create New
      </ae-button>

      <ae-button
        slot="mobile-right"
        type="dramatic"
        @click="toggleCreateQuestionModal"
      >
        <ae-icon
          slot="icon"
          invert
          type="dramatic"
          name="plus" />
      </ae-button>
    </ae-header>
    <ae-banner v-if="alert">
      {{ alert }}
      <ae-button
        slot="right"
        plain
        size="small"
        @click="() => closeAlert()">
        <ae-icon
          slot="icon"
          name="close" />
      </ae-button>
    </ae-banner>

    <router-view />

    <create-question-modal />
    <support-author-modal />
  </ae-main>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import {
    AeMain, AeHeader, AeBanner, AeButton, AeIcon,
  } from '@aeternity/aepp-components';
  import CreateQuestionModal from './components/CreateQuestionModal';
  import SupportAuthorModal from './components/SupportModal';

  export default {
    beforeCreate() {
      this.$store.dispatch('init');
    },
    components: {
      AeMain,
      AeHeader,
      AeBanner,
      AeButton,
      AeIcon,
      CreateQuestionModal,
      SupportAuthorModal,
    },
    computed: mapState({
      alert: state => state.response.alert,
    }),
    watch: {
      $route(to, { name, params }) {
        if (name !== 'question-list') return;
        this.$store.commit('setLastQuestionListParams', params);
      },
    },
    methods: {
      ...mapMutations({
        toggleCreateQuestionModal: 'toggleCreateQuestionModal',
      }),
      closeAlert() {
        this.$store.commit('setAlert');
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~@aeternity/aepp-components/dist/variables.scss';

  .ae-banner {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
  }

  /deep/ {
    .secondary {
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.3px;
      text-align: center;
      color: $grey;
      margin-top: 15px;

      span {
        color: $maegenta;
        font-weight: bold;
        font-family: 'Roboto Mono', monospace;
      }
    }

    .ae-content-button {
      img {
        height: 24px;
        margin-right: 15px;
      }
    }
  }
</style>
