<template>
    <div class="row">
    <p class="col-sm-12 col-lg-12">Please ensure that your lab has an account set up at: <a href="https://ppms.us/ucdavis/">https://ppms.us/ucdavis/</a>. This email should be what the PI uses to log in to PPMS.</p>
    <div class="col-sm-12 col-md-6 col-lg-3">
      <q-input 
        type="text"
        bottom-slots
        stack-label
        v-model="value.ppms_email"
        label="PPMS Email/Login for PPMS"
        :error="hasError('ppms_email')"
        :error-message="errorMessage('ppms_email')"/>
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
