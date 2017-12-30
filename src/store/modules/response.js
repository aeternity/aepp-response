/* eslint-disable no-param-reassign */

import Vue from 'vue';
import _ from 'lodash';
import Web3 from 'web3';
import IdManagerProvider from '@aeternity/id-manager-provider';
import IPFS from 'ipfs-mini';
import Bluebird from 'bluebird';
import BigNumber from 'bignumber.js';
import AETokenMeta from '../../assets/contracts/AEToken.json';
import Response from '../../assets/contracts/Response.json';

const web3 = new Web3();
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const idManager = new IdManagerProvider({
  skipSecurity: process.env.NODE_ENV === 'development',
});
let token;
let response;
let responseAddress;
const backend = async (name, params) => {
  const query = Object.keys(params)
    .reduce((p, n) => `${p}${p ? '&' : ''}${n}=${encodeURIComponent(params[n])}`, '');
  return (await fetch(`https://stage-response.aepps.com/${name}?${query}`)).json();
};
const decimals = 18;
const wrapSend = sendPromiEvent => new Promise((resolve, reject) =>
  sendPromiEvent.on('transactionHash', resolve).on('error', reject));
let newBlockInterval;

ipfs.addJSONAsync = Bluebird.promisify(ipfs.addJSON);
ipfs.catJSONAsync = Bluebird.promisify(ipfs.catJSON);

export default {
  state: () => ({
    account: null,
    createQuestionModalShown: false,
    supportModalQuestion: false,
    alert: '',
    foundations: {
      '0xfA491DF8780761853D127A9f7b2772D688A0E3B5': {
        name: 'Refugees foundation E.V.',
        url: 'http://example.com/',
      },
      '0x45992982736870Fe45c41049C5F785d4E4cc38Ec': {
        name: 'Foundation 2',
        url: 'http://example.com/',
      },
    },
    localQuestions: [],
    questions: {},
    twitterUsers: {},
    userSearchResults: {},
  }),

  mutations: {
    setAccount(state, account) {
      state.account = account;
    },
    toggleCreateQuestionModal(state) {
      state.createQuestionModalShown = !state.createQuestionModalShown;
    },
    showSupportModalForQuestion(state, address) {
      state.supportModalQuestion = address;
    },
    setAlert(state, alert) {
      state.alert = alert;
    },
    setLastQuestionListParams(state, params) {
      state.lastQuestionListParams = params;
    },
    setQuestion(state, question) {
      Vue.set(state.questions, question.id, question);
    },
    addLocalQuestion(state, question) {
      state.localQuestions.push({
        id: String(state.localQuestions.length),
        status: 'unsynced',
        ...question,
      });
    },
    linkLocalQuestion(state, { localQuestionId, questionId }) {
      Vue.set(state.localQuestions, localQuestionId, questionId);
    },
    setLocalQuestionStatus(state, { localQuestionId, status }) {
      state.localQuestions[localQuestionId].status = status;
    },
    supportQuestion(state, { questionId, supporterAccount, amount, createdAt }) {
      const { highestSupporters } = state.questions[questionId];
      const supporter = highestSupporters.find(s => s.account === supporterAccount);
      if (supporter) supporter.amount += amount;
      else highestSupporters.push({ account: supporterAccount, amount, lastSupportAt: createdAt });
      highestSupporters.sort((a, b) => b.amount - a.amount).splice(5);
    },
    setSearchRequestStatus(state, { query, status }) {
      Vue.set(state.userSearchResults, query, status);
    },
    addTwitterUser(state, user) {
      Vue.set(state.twitterUsers, user.id, user);
    },
    addSearchResults(state, { query, accounts }) {
      if (!accounts) return;
      accounts.forEach(account => Vue.set(state.twitterUsers, account.id, account));
      Vue.set(state.userSearchResults, query, accounts.map(({ id }) => id));
    },
  },

  actions: {
    async init({ state, commit, dispatch }) {
      window.addEventListener('load', async () => {
        let localProvider = true;
        if (await idManager.checkIdManager()) {
          web3.setProvider(idManager.web3.currentProvider);
        } else if (window.parent.web3) {
          web3.setProvider(window.parent.web3.currentProvider);
        } else {
          web3.setProvider(new Web3.providers.HttpProvider('https://kovan.infura.io'));
          localProvider = false;
        }

        const networkId = await web3.eth.net.getId();
        newBlockInterval = (networkId === 1 ? 15 : 5) * 1000;
        responseAddress = Response.networks[networkId].address;
        response = new web3.eth.Contract(Response.abi, responseAddress);
        token = new web3.eth.Contract(AETokenMeta.abi, AETokenMeta.networks[networkId].address);

        dispatch('syncQuestions');
        setInterval(() => dispatch('syncQuestions'), newBlockInterval);

        const accountPolling = async () => {
          const accounts = await web3.eth.getAccounts();
          const account = accounts[0] || null;
          if (account !== state.account) commit('setAccount', account);
          setTimeout(accountPolling, 500);
        };
        if (localProvider) await accountPolling();
      });
    },
    async getUser({ state, commit }, userId) {
      if (!state.twitterUsers[userId]) {
        commit('addTwitterUser', await backend('show', { userId }));
      }
      return state.twitterUsers[userId];
    },
    async syncQuestions({ state: { questions, localQuestions, foundations }, commit, dispatch }) {
      const questionCount = +await response.methods.questionCount().call();
      await Promise.all(_.times(questionCount, async (idx) => {
        const {
          twitterUserId, content, author, foundation,
          createdAt, deadlineAt, questionTweetId, answerTweetId, supporterCount, amount,
        } = { ...await response.methods.questions(idx).call() };
        const oldQuestion = questions[idx];
        const newQuestion = {
          ...oldQuestion,
          amount: +(new BigNumber(amount)).shift(-decimals),
          supporterCount: +supporterCount,
          questionTweetId: questionTweetId === '0' ? 0 : questionTweetId,
          answerTweetId: answerTweetId === '0' ? 0 : answerTweetId,
        };
        if (!oldQuestion) {
          Object.assign(newQuestion, {
            id: String(idx),
            twitterUser: await dispatch('getUser', twitterUserId),
            ...await ipfs.catJSONAsync(content),
            author,
            createdAt: new Date(createdAt * 1000),
            deadlineAt: new Date(deadlineAt * 1000),
            foundation: foundations[foundation],
          });
        }
        if (newQuestion.amount !== (oldQuestion && oldQuestion.amount)) {
          newQuestion.highestSupporters =
            (await Promise.all(_.times(5, n => response.methods.highestSupporter(idx, n).call())))
              .map(Object.values)
              .map(([account, lastSupportAt, a]) => ({
                account,
                lastSupportAt: new Date(lastSupportAt * 1000),
                amount: +(new BigNumber(a)).shift(-decimals),
              }))
              .filter(s => s.amount);
        }
        if (!_.isEqual(oldQuestion, newQuestion)) {
          const p = q => _.pick(q,
            ['twitterUser', 'author', 'title', 'body', 'deadlineAt', 'foundation']);
          const i = localQuestions.findIndex(q => _.isEqual(p(q), p(newQuestion)));
          if (i > -1) {
            commit('linkLocalQuestion', { localQuestionId: i, questionId: newQuestion.id });
            dispatch('setAlert', {
              text: '✓ Your question was published',
              autoClose: true,
            });
          }

          commit('setQuestion', newQuestion);
        }
      }));
    },
    setAlert({ commit }, options) {
      window.scrollTo(0, 0);
      const { text, autoClose } = options.text ? options : { text: options };
      commit('setAlert', text);
      if (autoClose) setTimeout(() => commit('setAlert'), 3000);
    },
    async createQuestion({ state, commit, dispatch }, {
      twitterUserId, title, body, amount, foundationId, deadlineAt,
    }) {
      const absoluteAmount = (new BigNumber(amount)).shift(decimals);
      const allowance = await token.methods.allowance(state.account, responseAddress).call();
      if (absoluteAmount.greaterThan(allowance)) {
        await wrapSend(
          token.methods
            .approve(responseAddress, absoluteAmount)
            .send({ from: state.account }));
      }
      await wrapSend(
        response.methods.createQuestion(
          twitterUserId,
          await ipfs.addJSONAsync({ title, body }),
          foundationId,
          Math.floor(deadlineAt / 1000),
          absoluteAmount,
        )
          .send({
            value: await response.methods.backendFee().call(),
            from: state.account,
          }));
      commit('addLocalQuestion', {
        twitterUser: state.twitterUsers[twitterUserId],
        amount,
        highestSupporters: [{ account: state.account, amount, lastSupportAt: new Date() }],
        supporterCount: 1,
        title,
        body,
        author: state.account,
        createdAt: new Date(),
        deadlineAt,
        questionTweetId: 0,
        answerTweetId: 0,
        foundation: state.foundations[foundationId],
      });
      const localQuestionId = state.localQuestions.length - 1;
      setTimeout(() => {
        if (typeof state.localQuestions[localQuestionId] === 'object') {
          commit('setLocalQuestionStatus', { localQuestionId, status: 'failed' });
          dispatch('setAlert', {
            text: 'Something went wrong while publishing your question',
          });
        }
      }, newBlockInterval * 2.5);
    },
    async supportQuestion({ state, commit, dispatch }, { questionId, amount }) {
      await wrapSend(
        token.methods.approveAndCall(
          responseAddress,
          (new BigNumber(amount)).shift(decimals),
          web3.eth.abi.encodeParameters(['uint', 'uint', 'uint'], [32 * 4, 32, questionId]),
        )
          .send({ from: state.account }));
      dispatch('setAlert', {
        text: '✓ Your support was send',
        autoClose: true,
      });
      commit('supportQuestion', {
        questionId,
        supporterAccount: state.account,
        amount,
        createdAt: new Date(),
      });
    },
    searchTwitterAccount: _.throttle(async ({ commit, state }, query) => {
      const r = state.userSearchResults[query];
      if (!query || r === 'requested' || Array.isArray(r)) return;
      commit('setSearchRequestStatus', { query, status: 'requested' });
      let accounts;
      try {
        accounts = await backend('search', { q: query });
      } catch (e) {
        commit('setSearchRequestStatus', { query, status: 'failed' });
        throw e;
      }
      commit('addSearchResults', { query, accounts });
    }, 300),
  },
};
