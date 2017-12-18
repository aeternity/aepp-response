<template>
  <div>
    <ae-filter-list>
      <ae-filter-item
        v-for="s in Object.keys(sorts)"
        :key="s"
        :active="currentSort === s"
        :to="{ name: 'question-list', params: { sort: s } }"
      >
        {{s}}
      </ae-filter-item>
    </ae-filter-list>

    <question-list-item
      v-for="question in questions"
      :key="question.id"
      :question="question"
    />
  </div>
</template>

<script>
  import { AeFilterList, AeFilterItem } from 'aepp-components-davidyuk';
  import QuestionListItem from './QuestionListItem';

  export default {
    components: { AeFilterList, AeFilterItem, QuestionListItem },
    data() {
      return {
        sorts: {
          newest: (a, b) => b.createdAt - a.createdAt,
          'highest support': (a, b) => b.amount - a.amount,
          'most supporters': (a, b) => b.supporterCount - a.supporterCount,
        },
      };
    },
    computed: {
      currentSort() {
        return this.$route.params.sort || Object.keys(this.sorts)[0];
      },
      questions() {
        const { questions, pendingQuestions } = this.$store.state.response;
        return [...Object.values(questions), ...pendingQuestions.filter(q => typeof q !== 'string')]
          .sort(this.sorts[this.currentSort]);
      },
    },
  };
</script>
