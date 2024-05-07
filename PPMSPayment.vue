<template>
    <div class="row">
    <p class="col-sm-12 col-lg-12">Please ensure that your lab has an account set up at: <a href="https://ppms.us/ucdavis/">https://ppms.us/ucdavis/</a>. This email should be what the PI uses to log in to PPMS.</p>
    <div class="col-sm-12 col-md-6 col-lg-3">
      <q-input 
        type="text"
        bottom-slots
        stack-label
        v-model="value.ppms_email"
        label="PPMS Login ID (usually your email)"
        :error="hasError('ppms_email')"
        :error-message="errorMessage('ppms_email')"/>
    </div>
    <div class="col-sm-12 col-md-6 col-lg-3">
      <q-input 
        type="text"
        bottom-slots
        stack-label
        v-model="value.account"
        label="PPMS Financial Account"
        hint="If you have more than one financial account number in PPMS, please specify which to use.  If not applicable, please enter 'n/a'."
        :error="hasError('account')"
        :error-message="errorMessage('account')"/>
    </div>
  </div>
</template>

<script>
// import { QSelect } from 'quasar'
// import _ from 'lodash'

export default {
  props: ['value', 'editable', 'errors', 'modify'],
  data () {
    return {
      payment: this.value
    }
  },
  methods: {
    errorMessage (field) {
      if (this.errors && this.errors[field] && this.errors[field]) {
        return this.errors[field].join ? this.errors[field].join(', ') : this.errors[field]
      }
      return ''
    },
    hasError (field) {
      return this.errors && this.errors[field] !== undefined
    }
  },
}
</script>
<style>
.q-field {
  padding: 3px !important;
}
</style>
