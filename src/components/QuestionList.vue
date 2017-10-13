<template>
  <div>
    <question-list-item
      v-for="q in questions"
      :question="q"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import QuestionListItem from './QuestionListItem';

  export default {
    components: {
      QuestionListItem,
    },
    computed: mapState({
      questions: state => state.answers.questions,
    }),
  };
</script>
