<template>
  <div>
    <ae-filter-list>
      <ae-filter-item
        v-for="s in Object.keys(sorts)"
        :key="s"
        :active="currentSort === s"
        :to="{ name: 'question-list', params: { sort: s, filter: currentFilter } }"
      >
        {{s}}
      </ae-filter-item>
      <ae-filter-separator />
      <ae-filter-item
        v-for="f in Object.keys(filters)"
        :key="f"
        :active="currentFilter === f"
        :to="{ name: 'question-list', params: { sort: currentSort, filter: f } }"
      >
        {{f}}
      </ae-filter-item>
    </ae-filter-list>

    <question-list-item
      v-for="question in questions"
      :key="question.status + question.id"
      :question="question"
    />
  </div>
</template>

<script>
  import { AeFilterList, AeFilterItem, AeFilterSeparator } from 'aepp-components-davidyuk';
  import QuestionListItem from './QuestionListItem';

  export default {
    components: { AeFilterList, AeFilterItem, AeFilterSeparator, QuestionListItem },
    data() {
      return {
        sorts: {
          newest: (a, b) => b.createdAt - a.createdAt,
          'highest support': (a, b) => b.amount - a.amount,
        },
        filters: {
          all: () => true,
          unanswered: a => !a.answerTweetId,
          answered: a => !!a.answerTweetId,
        },
      };
    },
    computed: {
      currentSort() {
        return this.$route.params.sort || Object.keys(this.sorts)[0];
      },
      currentFilter() {
        return this.$route.params.filter || Object.keys(this.filters)[0];
      },
      questions() {
        const { questions, pendingQuestions } = this.$store.state.response;
        return [...Object.values(questions), ...pendingQuestions.filter(q => typeof q !== 'string')]
          .filter(this.filters[this.currentFilter])
          .sort(this.sorts[this.currentSort]);
      },
    },
  };
</script>
