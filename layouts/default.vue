<template>
  <div>
    <section class='main-content columns'>
      <div class='container column is-10'>
        <Nuxt />
      </div>
    </section>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class Default extends Vue {
}
</script>

<style>
/*html, body {*/
/*  overflow-x: hidden;*/
/*}*/

/*.toast.is-success {*/
/*  background-color: rgb(70, 201, 58) !important;*/
/*}*/

/*.toast.is-warning {*/
/*  background-color: rgb(255, 186, 0) !important;*/
/*}*/

/*.toast div {*/
/*  color: white !important;*/
/*}*/

/*.toast.is-danger {*/
/*  background-color: rgb(255, 71, 87) !important;*/
/*}*/

/*.toast.is-info {*/
/*  background-color: rgb(59, 222, 200) !important;*/
/*}*/
</style>
