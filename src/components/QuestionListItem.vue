<template>
  <div class="question-list-item">
    <div class="content">
      <div>
        <img :src="question.person.imageUrl" />
        <div>
          <div class="name">{{question.person.name}}</div>
          <h3>{{question.content}}</h3>
        </div>
      </div>
      <div class="date">{{updatedAt}}</div>
    </div>

    <div class="controls">
      <div class="status">
        {{amount}}&nbsp;<span class="hidden-mobile">for answering this</span>
      </div>
      <div class="buttons">
        <button>Answer</button>
        <button>Increase</button>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import format from 'format-number';

  export default {
    props: ['question'],
    computed: {
      amount() {
        return format({ suffix: ' Æ' })(this.question.amount);
      },
      updatedAt() {
        return moment(this.question.updatedAt).calendar();
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '../variables';

  .question-list-item {
    position: relative;
    background: white;
    display: flex;
    flex-direction: row;
    border-radius: $base-border-radius;
    margin-bottom: $gutter;
    box-shadow: $base-box-shadow;
    text-decoration: none;
    color: inherit;
    padding-left: 5px;

    &:after {
      content: "";
      display: block;
      position: absolute;
      width: 5px;
      left: 0;
      top: 0;
      height: 100%;
      border-top-left-radius: $base-border-radius;
      border-bottom-left-radius: $base-border-radius;
      background: $brand-color;
    }

    .content {
      flex-grow: 1;

      > div {
        display: flex;
        flex-direction: row;
        margin: $gutter;

        img {
          width: 50px;
          height: 50px;
        }

        > div {
          margin-left: 10px;

          .name {
            font-weight: 500;
            font-size: 14px;
            line-height: 25px;
          }
          h3 {
            margin: 0;
            line-height: 25px;
          }
        }
      }

      .date {
        margin: $gutter;
        color: $gray-light;
        font-size: 14px;
      }
    }

    .controls {
      flex-grow: 0;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      text-align: center;
      justify-content: space-between;
      padding-right: $gutter;

      &::before, &::after {
        content: '';
      }

      .status {
        font-weight: 100;
        font-size: 16px;
        white-space: nowrap;
      }

      .buttons {
        display: flex;
        flex-direction: row;

        button {
          border: solid 2px $gray-light;
          color: gray;
          padding: 8px 20px;

          &:first-of-type {
            margin-right: $gutter;
          }

          &:hover {
            background-color: lightgray;
          }
        }
      }
    }

    @media screen and (max-width: $screen-sm) {
      flex-wrap: wrap;
      padding-left: 0;
      padding-top: 5px;

      &:after {
        width: 100%;
        height: 5px;
      }

      .content, .controls {
        flex-shrink: 0;
        box-sizing: border-box;
        width: 100%;
      }

      .controls {
        flex-direction: row;
        align-items: center;
        margin-bottom: $gutter;

        .status {
          flex-grow: 1;
        }

        .buttons {
          flex-grow: 0;
        }
      }
    }
  }
</style>
