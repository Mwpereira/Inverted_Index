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
        <p>1. Choose your preferred settings (you must click Invert after changing settings)</p>
        <p>2. Wait for the dictionary and postings files to generate</p>
        <p>3. Search and receive the relevant documents related to your keyword search</p>
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
      <b-button class='mt-1' @click='invert()'>
        Invert
      </b-button>
      <div v-show='invertSettings'>
        <p>Dictionary & Posting Files Current Settings:</p>
        <p>StopWord Removal: {{ invertSettings !== null ? invertSettings.removeStopWords : 'N/A' }} </p>
        <p>Stemming: {{ invertSettings !== null ? invertSettings.stemWords : 'N/A' }}</p>
      </div>
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
                     @keydown.native.enter='test'
                     icon='search'>
            </b-input>
          </b-field>
          <b-button class='mt-1' @click='test'>
            Search
          </b-button>
        </div>
        <div class='column'>
        </div>
      </div>
    </section>
    <section class='my-5' v-if='results'>
      <p class='is-size-5'><span class='has-text-weight-bold'>Results:</span> {{ results.length }} Document(s)</p>
      <div class='mt-3'>
        <b-field><span class='has-text-weight-bold'>Searches:</span> {{ searches }}</b-field>
        <b-field><span class='has-text-weight-bold'>Avg. Time:</span> {{ time / searches }}</b-field>
      </div>
      <div v-for='result in results' :key='result.documentId'>
        <div class='box'>
          <p><span class='has-text-weight-bold'>DocumentId:</span> {{ result.documentId }} </p>
          <p><span class='has-text-weight-bold'>Term Frequency:</span> {{ result.termFrequency }}</p>
          <p><span class='has-text-weight-bold'>Positions:</span> {{ result.results }}</p>
          <p><span class='has-text-weight-bold'>Summary:</span> {{ result.summary }}</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script lang='ts'>
import { Component, Vue } from 'nuxt-property-decorator'
import axios from 'axios'
import BuefyService from '~/services/buefy-service'

@Component
export default class Index extends Vue {
  private removeStopWords = false
  private stemWords = false
  private invertSettings = null

  private keyword = ''
  private time = 0
  private searches = 0
  private results = null

  private async test() {
    if (/\S/.test(this.keyword)) {
      await BuefyService.startLoading()
      await axios.post(`/test`, {
        keyword: this.keyword
      }).then(response => {
        // @ts-ignore
        this.results = response.data.results
        this.time += response.data.time
        this.searches++;
        BuefyService.successToast('Documents Retrieved')
      }).catch(error => {
        BuefyService.dangerToast(error.response.data.error)
      })
      await BuefyService.stopLoading()
    }
  }

  private async invert() {
    await BuefyService.startLoading()
    await axios.post(`/invert`, {
      removeStopWords: this.removeStopWords,
      stemWords: this.stemWords
    }).then(() => {
      BuefyService.successToast('Dictionary & Postings Generated')
    }).catch(error => {
      BuefyService.dangerToast(error.response.data.error)
    })
    await BuefyService.stopLoading()
  }
}
</script>

<style>
.toast.is-success {
  background-color: rgba(70, 201, 58, 0.1) !important;
}

.toast.is-danger {
  background-color: rgba(255, 71, 87, 0.1) !important;
}

.toast.is-success {
  color: rgb(70, 201, 58) !important;
}

.toast.is-danger {
  color: rgb(255, 71, 87) !important;
}
</style>
