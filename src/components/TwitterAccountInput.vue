<template>
  <div class="twitter-account-input">
    <input
      :value="value"
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
        <div class="message" v-if="!Array.isArray(searchResults)">
          Loading ...
        </div>
        <div class="message" v-else-if="searchResults.length === 0">
          No results for {{value}}
        </div>
        <button
          v-else
          @click="handleSearchResultClick(item.screen_name)"
          v-for="(item, idx) in searchResults"
          type="button"
          tabindex="-1"
          :class="{ active: dropDownState == idx }"
        >
          <img :src="`https://twitter.com/${item.screen_name}/profile_image?size=normal`" />
          <span>
            <span>{{item.name}}</span><br />
            {{item.screen_name}}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { AeHr } from '@aeternity/aepp-components';

  export default {
    props: {
      value: { type: String, default: 0 },
    },
    components: { AeHr },
    data() {
      return {
        dropDownState: -2,
      };
    },
    computed: {
      searchResults() {
        return this.$store.state.response.twitterAccounts.searchResults[this.value];
      },
    },
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
      handleInput(inputEvent) {
        this.dropDownState = -1;
        const { value } = inputEvent.target;
        this.$emit('input', value);
      },
      handleBlur(event) {
        let { relatedTarget: element } = event;
        let internalElement = false;
        while (!internalElement && element) {
          internalElement = internalElement || element.className === 'twitter-account-input';
          element = element.parentElement;
        }
        if (!internalElement) {
          if (!this.$store.state.response.twitterAccounts.exists.includes(
              this.value.toLowerCase())) {
            this.$emit('input', '');
          }
          this.dropDownState = -2;
        }
        this.$emit('blur', event);
      },
      handleSearchResultClick(screenName) {
        this.dropDownState = -2;
        this.$emit('input', screenName);
      },
      handleEnterPress() {
        if (this.dropDownState < 0) return;
        this.$emit('input', this.searchResults[this.dropDownState].screen_name);
        this.dropDownState = -2;
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~@aeternity/aepp-components/dist/variables.scss';

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
