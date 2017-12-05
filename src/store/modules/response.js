/* eslint-disable no-param-reassign */

import Vue from 'vue';
import _ from 'lodash';
import Web3 from 'web3';
import IdManagerProvider from '@aeternity/id-manager-provider';
import IPFS from 'ipfs-mini';
import Bluebird from 'bluebird';
import BigNumber from 'bignumber.js';
import AETokenMeta from '../../assets/contracts/AEToken.json';
import ContractRegistryMeta from '../../assets/contracts/ContractRegistry.json';
import QuestionMeta from '../../assets/contracts/Question.json';
import QuestionCreatorMeta from '../../assets/contracts/QuestionCreator.json';

const web3 = new Web3();
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const idManager = new IdManagerProvider({
  skipSecurity: process.env.NODE_ENV === 'development',
});
let token;
let registry;
let questionCreatorAddress;
const decimals = 18;
const defaultQuestion = () => ({
  twitter: '',
  amount: 0,
  highestSupporters: [],
  supportersCount: 0,
  title: '',
  body: '',
  author: '',
  createdAt: 0,
  deadlineAt: 0,
  tweetId: 0,
  foundationId: '',
  contract: null,
});

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
    fetchedQuestionsCount: 0,
    questions: {},
    twitterAccounts: {
      searchResults: {},
      exists: [],
    },
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
      const { id, ipfsHash } = question;
      state.fetchedQuestionsCount += !state.questions[id] && id.startsWith('0x');
      if (id.startsWith('0x') && state.questions[ipfsHash]) delete state.questions[ipfsHash];
      Vue.set(state.questions, id, {
        ...defaultQuestion(),
        ...state.questions[id],
        ...question,
      });
    },
    supportQuestion(state, { questionId, supporterAccount, amount, createdAt }) {
      const { highestSupporters } = state.questions[questionId];
      const supporter = highestSupporters.find(s => s.address === supporterAccount);
      if (supporter) supporter.amount += amount;
      else highestSupporters.push({ address: supporterAccount, amount, lastSupportAt: createdAt });
      highestSupporters.sort((a, b) => b.amount - a.amount).splice(5);
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
    async init({ state, commit, dispatch }) {
      window.addEventListener('load', async () => {
        if (await idManager.checkIdManager()) {
          web3.setProvider(idManager.web3.currentProvider);
        } else if (window.parent.web3) {
          web3.setProvider(window.parent.web3.currentProvider);
        } else {
          web3.setProvider(new Web3.providers.HttpProvider('https://kovan.infura.io'));
        }

        const networkId = await web3.eth.net.getId();
        registry = new web3.eth.Contract(ContractRegistryMeta.abi,
          ContractRegistryMeta.networks[networkId].address);
        token = new web3.eth.Contract(AETokenMeta.abi, AETokenMeta.networks[networkId].address);
        questionCreatorAddress = QuestionCreatorMeta.networks[networkId].address;

        dispatch('syncQuestions');
        setInterval(() => dispatch('syncQuestions'), 60 * 1000);

        setInterval(() => {
          web3.eth.getAccounts(async (error, accounts) => {
            const account = accounts[0];
            if (account === state.account) return;
            commit('setAccount', error || !account ? null : account);
          });
        }, 500);
      });
    },
    async syncQuestions({ state: { questions, fetchedQuestionsCount }, commit }) {
      const questionsCount = +await registry.methods.getContractsCount().call();
      const getHighestSupporters = async question =>
        (await Promise.all(_.times(5, n => question.methods.highestDonors(n).call()
          .then(async ({ addr: address, lastDonatedAt: lastSupportAt }) => ({
            address,
            lastSupportAt: new Date(lastSupportAt * 1000),
            amount: +(new BigNumber(await question.methods.donorAmounts(address).call()))
              .shift(-decimals),
          }))))).filter(s => s.amount);
      await Promise.all([
        ..._.times(questionsCount - fetchedQuestionsCount, async (i) => {
          const idx = i + fetchedQuestionsCount;
          const questionAddress = await registry.methods.contracts(idx).call();
          const question = new web3.eth.Contract(QuestionMeta.abi, questionAddress);
          const [
            twitter, amount, highestSupporters, supportersCount, ipfsHash, author,
            createdAt, deadlineAt, tweetId, foundationId,
          ] = await Promise.all([
            question.methods.twitterAccount().call(),
            question.methods.donations().call(),
            getHighestSupporters(question),
            question.methods.donorCount().call(),
            question.methods.question().call(),
            question.methods.author().call(),
            question.methods.createdAt().call(),
            question.methods.deadline().call(),
            question.methods.tweetId().call(),
            question.methods.charity().call(),
          ]);
          commit('setQuestion', {
            id: questionAddress,
            twitter,
            amount: +(new BigNumber(amount)).shift(-decimals),
            highestSupporters,
            supportersCount: +supportersCount,
            ipfsHash,
            ...await ipfs.catJSONAsync(ipfsHash),
            author,
            createdAt: new Date(createdAt * 1000),
            deadlineAt: new Date(deadlineAt * 1000),
            tweetId: tweetId === '0' ? 0 : tweetId,
            foundationId,
          });
        }),
        ...Object.keys(questions).map(async (questionAddress) => {
          if (!questionAddress.startsWith('0x')) return;
          const question = new web3.eth.Contract(QuestionMeta.abi, questionAddress);
          const [amount, highestSupporters, supportersCount, tweetId] = await Promise.all([
            question.methods.donations().call(),
            getHighestSupporters(question),
            question.methods.donorCount().call(),
            question.methods.tweetId().call(),
          ]);
          commit('setQuestion', {
            id: questionAddress,
            amount: +(new BigNumber(amount)).shift(-decimals),
            highestSupporters,
            supportersCount: +supportersCount,
            tweetId: tweetId === '0' ? 0 : tweetId,
          });
        }),
      ]);
    },
    setAlert({ commit }, options) {
      window.scrollTo(0, 0);
      const { text, autoClose } = options.text ? options : { text: options };
      commit('setAlert', text);
      if (autoClose) setTimeout(() => commit('setAlert'), 3000);
    },
    async createQuestion({ state, commit, dispatch }, {
      twitter, title, body, amount, foundationId, deadlineAt,
    }) {
      const ipfsHash = await ipfs.addJSONAsync({ title, body });
      const encodeParameters = web3.eth.abi.encodeParameters.bind(web3.eth.abi);
      const encodeString = string => web3.eth.abi.encodeParameter('string', string).slice(66);
      const twitterEncoded = encodeString(twitter);
      const multiHashEncoded = encodeString(ipfsHash);
      const length = (twitterEncoded.length / 2) + (multiHashEncoded.length / 2) + (32 * 2);
      const bytes = [
        encodeParameters(['uint', 'uint'], [32 * 4, length]),
        twitterEncoded,
        multiHashEncoded,
        encodeParameters(['address', 'uint'],
          [foundationId, Math.floor(deadlineAt / 1000)]).slice(2),
      ].join('');
      await new Promise((resolve, reject) =>
        token.methods.approveAndCall(
          questionCreatorAddress,
          (new BigNumber(amount)).shift(decimals),
          bytes,
        ).send({ from: state.account })
          .on('transactionHash', resolve).on('error', reject));
      dispatch('setAlert', {
        text: '✓ Your question was send',
        autoClose: true,
      });
      const id = ipfsHash;
      commit('setQuestion', {
        id,
        twitter,
        amount,
        highestSupporters: [{ address: state.account, amount, lastSupportAt: new Date() }],
        supportersCount: 1,
        ipfsHash,
        title,
        body,
        author: state.account,
        createdAt: new Date(),
        deadlineAt,
        tweetId: 0,
        foundationId,
      });
      return id;
    },
    async supportQuestion({ state, commit, dispatch }, { questionId, amount }) {
      await new Promise((resolve, reject) =>
        token.methods.approveAndCall(
          questionId,
          (new BigNumber(amount)).shift(decimals),
          web3.eth.abi.encodeParameter('uint', 32 * 4),
        ).send({ from: state.account })
          .on('transactionHash', resolve).on('error', reject));
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
      if (!query || state.twitterAccounts.searchResults[query]) return;
      commit('markSearchResultsAsRequested', query);
      const response = await fetch(`https://stage-response.aepps.com/search?q=${query}&verified=1`);
      commit('addSearchResults', {
        query,
        accounts: await response.json(),
      });
    }, 300),
  },
};
