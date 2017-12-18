<template>
  <div class="twitter-account-input">
    <input
      v-model="value"
      @focus="dropDownState = -1"
      @input="handleInput"
      @keydown.up.prevent="selectSearchResult(true)"
      @keydown.down.prevent="selectSearchResult(false)"
      @keydown.enter.prevent="handleEnterPress"
      @keydown.esc="dropDownState = -2"
      @blur="handleBlur"
      placeholder="Search Twitter account"
    />
    <div v-if="dropDownState >= -1 && value">
      <div class="arrow" />
      <div class="search-results" @mouseover="dropDownState = -1">
        <div class="message" v-if="message">
          {{message}}
        </div>
        <button
          v-else
          @click="handleSearchResultClick(item)"
          v-for="(item, idx) in searchResults"
          type="button"
          tabindex="-1"
          :class="{ active: dropDownState === idx }"
        >
          <img :src="item.imageUrl" />
          <span>
            <span>{{item.name}}</span><br />
            {{item.screenName}}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import { AeHr } from 'aepp-components-davidyuk';

  export default {
    components: { AeHr },
    data() {
      return {
        value: '',
        dropDownState: -2,
      };
    },
    computed: mapState({
      searchResults(state) {
        const results = state.response.userSearchResults[this.value];
        return (Array.isArray(results) ? results : [])
          .map(userId => state.response.twitterUsers[userId]);
      },
      message(state) {
        const results = state.response.userSearchResults[this.value];
        switch (results) {
          case 'requested': return 'Loading ...';
          case 'failed': return 'Something went wrong.';
          default:
        }
        if (results && results.length === 0) return `No results for ${this.value}`;
        return '';
      },
    }),
    watch: {
      value(value) {
        this.$store.dispatch('searchTwitterAccount', value);
      },
    },
    methods: {
      selectSearchResult(up) {
        const length = this.searchResults ? this.searchResults.length + 1 : 1;
        this.dropDownState = ((length + this.dropDownState + (up ? 0 : 2)) % length) - 1;
      },
      handleInput() {
        this.dropDownState = -1;
        this.$emit('input', '0');
      },
      inputUser(user) {
        this.$emit('input', user ? user.id : '');
        this.value = user ? user.screenName : '';
      },
      handleBlur(event) {
        let { relatedTarget: element } = event;
        let internalElement = false;
        while (!internalElement && element) {
          internalElement = internalElement || element.className === 'twitter-account-input';
          element = element.parentElement;
        }
        if (!internalElement) {
          this.inputUser(this.searchResults.find(u =>
            u.screenName.toLowerCase() === this.value.toLowerCase()));
          this.dropDownState = -2;
        }
        this.$emit('blur', event);
      },
      handleSearchResultClick(user) {
        this.dropDownState = -2;
        this.inputUser(user);
      },
      handleEnterPress() {
        if (this.dropDownState < 0) return;
        this.inputUser(this.searchResults[this.dropDownState]);
        this.dropDownState = -2;
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~aepp-components-davidyuk/dist/variables.scss';

  .twitter-account-input {
    position: relative;
    margin: 10px 0;

    &.danger {
      input {
        border-color: $maegenta;
      }
    }

    input {
      display: block;
      border-radius: 10px;
      font-size: 16px;
      border: solid 2px $smoke;
      background-color: $white;
      padding: 7px 13px;
      line-height: 26px;
      width: 100%;
      box-sizing: border-box;
      margin: 0;

      &::placeholder {
        color: $silver;
      }
    }

    > div {
      position: absolute;
      width: 100%;

      .arrow {
        width: 0;
        border: solid transparent;
        border-bottom-color: $silver;
        border-width: 0 6px 8px 6px;
        margin-left: 20px;
      }

      .search-results {
        background-color: $white;
        border: 1px solid $silver;
        border-radius: 10px;
        box-shadow: 0 4px 8px 0 rgba(60, 60, 60, 0.1);

        .message {
          padding: 15px 12px;
        }

        button {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          border: none;
          background: transparent;
          padding: 15px 12px;
          border-top: 1px solid $silver;
          text-align: left;

          &:first-of-type {
            border-top: none;
          }

          &:hover, &.active {
            background-color: $smoke;
          }

          img {
            width: 50px;
            height: 50px;
            border-radius: 25px;
            margin-right: 12px;
            object-fit: cover;
          }

          span {
            font-size: 14px;
            color: $black;

            span {
              font-size: 16px;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
</style>
