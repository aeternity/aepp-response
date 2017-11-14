/* eslint-disable no-param-reassign */

import Vue from 'vue';
import _ from 'lodash';

const randomDataBeforeNow = () =>
  new Date(Date.now() - Math.round((Math.random() * 1000 * 60 * 60 * 24 * 30)));
const randomDataAfterNow = () =>
  new Date(Date.now() + Math.round((Math.random() * 1000 * 60 * 60 * 24 * 30)));
const randomAddress = () => `0x${''.padStart(6, Math.random().toString(16).slice(2))}`;
const randomSupporters = () =>
  (new Array(5)).fill().reduce(p => ({
    ...p,
    [randomAddress()]: {
      lastSupportAt: randomDataBeforeNow(),
      amount: (Math.random() * 50).toFixed(2),
    },
  }), {});

const defaultQuestion = () => ({
  twitter: '',
  amount: 0,
  supporters: {},
  supportIds: new Set(),
  title: '',
  body: '',
  author: '',
  createdAt: 0,
  deadlineAt: 0,
  answered: false,
  foundationId: 0,
});

export default {
  state: () => ({
    account: randomAddress(),
    createQuestionModalShown: false,
    supportModalQuestion: false,
    alert: '',

    foundations: {
      1: { name: 'Refugees foundation E.V.', url: 'http://example.com/' },
      2: { name: 'Foundation 2', url: 'http://example.com/' },
      3: { name: 'Foundation 3', url: 'http://example.com/' },
      4: { name: 'Foundation 4', url: 'http://example.com/' },
      5: { name: 'Foundation 5', url: 'http://example.com/' },
    },

    questions: {
      1: {
        ...defaultQuestion(),
        twitter: 'AngelaMerkeICDU',
        title: 'Only the Jamaica Coalition?',
        body: 'The rumour is the Jamaica Coalition. Is that the only one that is now being considered?',
        amount: 1201,
        author: randomAddress(),
        createdAt: randomDataBeforeNow(),
        deadlineAt: randomDataAfterNow(),
        supporters: {},
        foundationId: 1,
      },
      2: {
        ...defaultQuestion(),
        twitter: 'NASA',
        title: 'Integer posuere erat a ante venenatis?',
        body: 'Dapibus posuere velit aliquet. Maecenas faucibus…',
        amount: 1200,
        author: randomAddress(),
        createdAt: randomDataBeforeNow(),
        deadlineAt: randomDataAfterNow(),
        supporters: randomSupporters(),
        answered: true,
        foundationId: 2,
      },
      3: {
        ...defaultQuestion(),
        twitter: 'cnnbrk',
        title: 'Vestibulum id ligula porta felis euismod semper?',
        body: 'Morbi leo risus, porta ac consectetur ac, vestibulum…',
        amount: 1200,
        author: randomAddress(),
        createdAt: new Date(),
        deadlineAt: randomDataAfterNow(),
        supporters: randomSupporters(),
        foundationId: 3,
      },
    },

    twitterAccounts: {
      searchResults: {},
      exists: [],
    },
  }),

  mutations: {
    toggleCreateQuestionModal(state) {
      state.createQuestionModalShown = !state.createQuestionModalShown;
    },
    showSupportModalForQuestion(state, address) {
      state.supportModalQuestion = address;
    },
    setAlert(state, alert) {
      state.alert = alert;
    },
    setQuestion(state, question) {
      Vue.set(state.questions, question.id, {
        ...defaultQuestion(),
        ...state.questions[question.id],
        ...question,
      });
    },
    supportQuestion(state, { id, questionId, supporterAccount, amount, createdAt }) {
      if (!state.questions[questionId]) {
        Vue.set(state.questions, questionId, defaultQuestion());
      }
      const { supportIds, supporters } = state.questions[questionId];
      if (supportIds.has(id)) return;
      supportIds.add(id);
      if (!supporters[supporterAccount]) {
        Vue.set(supporters, supporterAccount, { amount: 0, lastSupportAt: 0 });
      }
      supporters[supporterAccount].amount += amount;
      supporters[supporterAccount].lastSupportAt = createdAt;
      state.questions[questionId].amount += amount;
    },
    markSearchResultsAsRequested(state, query) {
      Vue.set(state.twitterAccounts.searchResults, query, 'requested');
    },
    addSearchResults(state, { query, accounts }) {
      if (!accounts) return;
      Vue.set(state.twitterAccounts.searchResults, query, accounts);
      state.twitterAccounts.exists = Array.from(Set.from([
        ...state.twitterAccounts.exists,
        ...accounts.map(account => account.screen_name.toLowerCase()),
      ]));
    },
  },

  actions: {
    setAlert({ commit }, options) {
      window.scrollTo(0, 0);
      const { text, autoClose } = options.text ? options : { text: options };
      commit('setAlert', text);
      if (autoClose) setTimeout(() => commit('setAlert'), 3000);
    },
    async createQuestion({ state, commit, dispatch }, { amount, ...question }) {
      dispatch('setAlert', {
        text: '✓ Your question was send',
        autoClose: true,
      });
      const id = Math.random().toString(16).slice(2);
      commit('setQuestion', {
        ...question,
        id,
        author: state.account,
        createdAt: new Date(),
      });
      commit('supportQuestion', {
        id: Math.random().toString(16).slice(2),
        questionId: id,
        supporterAccount: state.account,
        amount,
        createdAt: new Date(),
      });
      return id;
    },
    async supportQuestion({ state, commit, dispatch }, { questionId, amount }) {
      dispatch('setAlert', {
        text: '✓ Your support was send',
        autoClose: true,
      });
      commit('supportQuestion', {
        id: Math.random().toString(16).slice(2),
        questionId,
        supporterAccount: state.account,
        amount,
        createdAt: new Date(),
      });
    },
    searchTwitterAccount: _.throttle(({ commit, state }, query) => {
      if (!query || state.twitterAccounts.searchResults[query]) return;
      commit('markSearchResultsAsRequested', query);
      setTimeout(() =>
        commit('addSearchResults', {
          query,
          accounts: _.range(1, 4)
            .map(repeats => _.times(repeats, () => query).join(' '))
            .map(q => ({
              name: _.startCase(q),
              screen_name: q,
            })),
        }),
        50);
    }, 300),
  },
};
