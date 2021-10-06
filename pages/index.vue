<template>
  <section class='section'>
    <section class='has-text-centered'>
      <h1 class='title'>Inverted Index Program</h1>
      <h2 class='is-size-5'>Completed By: Michael Pereira</h2>
      <h2 class='is-size-5'>Student #: 500896409</h2>
    </section>
    <section class='my-5'>
      <h3 class='is-size-5 has-text-weight-bold mb-4'>Instructions</h3>
      <div class='is-size-6'>
        <p>1. Choose your preferred settings</p>
        <p>2. Wait for the dictionary and postings files to generate</p>
        <p>3. Receive the relevant documents related to your keyword search</p>
      </div>
    </section>
    <section class='my-5'>
      <h3 class='is-size-5 has-text-weight-bold mb-4'>Settings</h3>
      <b-field>
        <b-checkbox v-model='removeStopWords'
                    type='is-warning'>
          Enable StopWord Removal
        </b-checkbox>
      </b-field>
      <b-field>
        <b-checkbox v-model='stemWords'
                    type='is-warning'>
          Enable Stemming
        </b-checkbox>
      </b-field>
    </section>
    <section class='my-5'>
      <div class='columns'>
        <div class='column'>
          <b-field class='is-size-5 has-text-weight-bold mb-4'>Search Documents</b-field>
          <b-field>
            <b-input placeholder='Keyword'
                     type='search'
                     icon-pack='fas'
                     v-model='keyword'
                     icon='search'>
            </b-input>
          </b-field>
          <b-button class='mt-1' @click='searchKeyword()'>
            Search
          </b-button>
        </div>
        <div class='column'>
          <!--          <b-field><span class='is-size-5 has-text-weight-bold'>Searches:</span> {{ searches }}</b-field>-->
          <!--          <b-field>Avg. Time: {{ avgTime }}</b-field>-->
        </div>
      </div>
    </section>
    <section class='my-5' v-if='results'>
      <p>Results: {{  }} Documents</p>
    </section>
  </section>
</template>

<script lang='ts'>
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'
import BuefyService from '~/services/buefy-service'

@Component
export default class Index extends Vue {
  private keyword = ''
  private removeStopWords = false
  private stemWords = false
  private avgTime = 0
  private searches = 0
  private results = null;

  private async searchKeyword() {
    if (/\S/.test(this.keyword)) {
      await BuefyService.startLoading()
      const data = {
        keyword: this.keyword,
        removeStopWords: this.removeStopWords,
        stemWords: this.stemWords
      }
      await axios.post(`/invert`,data).then(() => {
        this.searches++
      })
      await BuefyService.stopLoading()
    }
  }
}
</script>

