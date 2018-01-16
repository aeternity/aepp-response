<template>
  <div
    v-infinite-scroll="loadMore"
    infinite-scroll-disabled="scrollDisabled"
    infinite-scroll-immediate-check="false"
  >
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

    <div class="loader">
      <ae-loader v-if="loading" />
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import infiniteScroll from 'vue-infinite-scroll';
  import { AeFilterList, AeFilterItem, AeFilterSeparator } from 'aepp-components-davidyuk';
  import AeLoader from './AeLoader';
  import QuestionListItem from './QuestionListItem';

  export default {
    components: { AeFilterList, AeFilterItem, AeFilterSeparator, AeLoader, QuestionListItem },
    directives: { infiniteScroll },
    data() {
      return {
        sorts: {
          newest: (a, b) => b.createdAt - a.createdAt || b.id - a.id,
          'highest support': (a, b) => b.amount - a.amount || b.id - a.id,
        },
        loading: false,
      };
    },
    computed: {
      ...mapState({
        filters: (state) => {
          const isRevertable = question => question.stage === 'revertable';
          return {
            all: () => true,
            unanswered: question => question.stage !== 'answered',
            answered: question => question.stage === 'answered',
            ...Object.values(state.response.questions).find(isRevertable)
              ? { reclaim: isRevertable } : {},
          };
        },
        questions({ response: { questions, localQuestions } }) {
          return [...Object.values(questions), ...localQuestions.filter(q => typeof q !== 'string')]
            .filter(this.filters[this.currentFilter])
            .sort(this.sorts[this.currentSort]);
        },
        scrollDisabled({ response: { firstQuestionId } }) {
          return this.loading || !firstQuestionId;
        },
      }),
      currentSort() {
        return this.$route.params.sort || Object.keys(this.sorts)[0];
      },
      currentFilter() {
        return this.$route.params.filter || Object.keys(this.filters)[0];
      },
    },
    methods: {
      async loadMore() {
        this.loading = true;
        await this.$store.dispatch('loadMoreQuestions');
        this.loading = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .loader {
    text-align: center;
  }
</style>
