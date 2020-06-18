<template>
  <div>
  <currency-input v-model="value" currency="INR" locale="en-IN"/>
  </div>
</template>
<script>
// import vue 
import Vue from 'vue'
// import Vue Currency Input 
import VueCurrencyInput from 'vue-weblineindia-currency-input'

Vue.use(VueCurrencyInput)
export default {
  data: () => ({ value: 1000 })
}
</script>