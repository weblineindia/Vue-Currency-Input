import Vue from 'vue'
import VueCurrencyInputField from 'vue-currency-inputfield'

Vue.use(VueCurrencyInputField, <%= serialize(options) %>)
