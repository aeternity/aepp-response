<template>
  <ae-main>
    <ae-header-alert v-if="alert" @close="closeAlert">
      {{alert}}
    </ae-header-alert>
    <ae-header v-else name="Questions">
      <ae-header-button @click="toggleCreateQuestionModal()">
        <i class="fa fa-plus" /> Create New
      </ae-header-button>

      <ae-add-button
        slot="mobile-right"
        icon
        @click="toggleCreateQuestionModal()"
      />
    </ae-header>

    <router-view />

    <create-question-modal />
    <support-author-modal />
  </ae-main>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import {
    AeMain, AeHeader, AeHeaderButton, AeHeaderAlert, AeAddButton,
  } from 'aepp-components-davidyuk';
  import CreateQuestionModal from './components/CreateQuestionModal';
  import SupportAuthorModal from './components/SupportModal';

  export default {
    beforeCreate() {
      this.$store.dispatch('init');
    },
    components: {
      AeMain,
      AeHeader,
      AeHeaderButton,
      AeHeaderAlert,
      AeAddButton,
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

<style lang="scss">
  @import "../node_modules/font-awesome/css/font-awesome.css";
  @import '~aepp-components-davidyuk/dist/variables.scss';

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

  .ae-modal {
    label {
      display: block;
      text-transform: uppercase;
      font-weight: 500;
      margin-top: 25px;

      .help {
        font-size: 13px;
        float: right;
        text-transform: none;
        color: $grey;

        &.danger {
          color: $maegenta;
        }
      }
    }

    input, select, textarea, .ae-amount {
      margin: 10px 0;
    }

    .ae-amount > input {
      margin: 0;
    }
  }

  .ae-content-button {
    img {
      height: 24px;
      margin-right: 15px;
    }
  }
</style>
