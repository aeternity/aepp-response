import Vue from 'vue';
import Router from 'vue-router';
import QuestionList from '../components/QuestionList';
import QuestionDetail from '../components/QuestionDetail';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    { path: '/question/:id', name: 'question', component: QuestionDetail, props: true },
    { path: '/:sort?', name: 'question-list', component: QuestionList, props: true },
  ],
});
