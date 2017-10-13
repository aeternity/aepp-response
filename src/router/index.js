import Vue from 'vue';
import Router from 'vue-router';

import QuestionList from '../components/QuestionList';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'question-list',
      component: QuestionList,
    },
  ],
});
