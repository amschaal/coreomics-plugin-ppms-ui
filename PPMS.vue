<template>
  <div>
    <div>
      <h3>Orders</h3>
      <ul>
        <li v-for="(o, i) in orders">{{o}}</li>
      </ul>
      <span v-if="!create"><q-btn @click="create=true" label="Add" color="primary" size="sm"/> a new order.  When possible, it is recommended to only have one order per submission.</span>
    </div>
    <fieldset v-if="create">
      <legend>Create a new order</legend>
    <q-table
      title="Services"
      :data="services"
      row-key="Service id"
      :dense="true"
      :filter="filter"
      selection="single"
      :selected.sync="selected"
      v-if="!service"
    >
      <template v-slot:top-left>
        <b>Services</b>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
    <q-field label="Service" hint="The PPMS API requires exactly one service to be chosen for new order creation.  After the order is created, services may be modified within PPMS itself.">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <span v-if="service">{{service['Service id']}} - {{service['Name']}} <q-btn label="Change service" @click="selected=[]"/></span>
            <span v-else>*Please select a service from the table above!</span>
          </div>
        </template>
      </q-field>
    
    <q-input label="username" v-model="neworder.username"/>
    <q-input label="quantity" type="number" v-model="neworder.quantity"/>
    <q-btn color="primary" label="Create order" @click="createOrder" :disabled="(invalid_order || processing)"/>
  </fieldset>
  </div>
</template>

<script>
export default {
  props: ['submission', 'config'],
  data () {
    return {
      services: [],
      selected: [],
      orders: [],
      filter: '',
      neworder: {},
      processing: false,
      mounted: false,
      create: false
    }
  },
  methods: {
    createOrder () {
      if (this.invalid_order) {
        this.$q.notify({message: 'Please ensure all order fields are filled out.', type: 'negative'})
      } else {
        this.neworder.serviceid = this.service['Service id']
        this.processing = true
        this.$axios
        .post(`/api/plugins/ppms/submissions/${this.submission.id}/create_order/`, this.neworder)
        .then((response) => {
          this.orders = response.data.orders
          this.processing = false
          this.neworder = {}
        })
        .catch((error) => {
          if (error.response) {
            var reason = error.response.data && error.response.data.detail ? error.response.data.detail : ''
            this.$q.notify({message: 'There was an error creating the order. '+reason, type: 'negative'})
            this.processing = false
          }
        })
      }
    }
  },
  mounted () {
    console.log('services', this.services) // this should only happen once thanks to keep-alive, but it doesn't appear to be the case
    this.$axios
        .get(`/api/plugins/ppms/submissions/${this.submission.id}/services/`)
        .then((response) => {
          this.services = response.data.services
        })
        .catch((error) => {
          if (error.response && error.response.status !== 404) {
            this.$q.notify({message: 'There was an error retrieving the services.', type: 'negative'})
          }
        })
    this.$axios
        .get(`/api/plugins/ppms/submissions/${this.submission.id}/orders/`)
        .then((response) => {
          this.orders = response.data.orders
        })
        .catch((error) => {
          if (error.response && error.response.status !== 404) {
            this.$q.notify({message: 'There was an error retrieving the orders for this submission.', type: 'negative'})
          }
        })
  },
  computed: {
    'service': function () {
      return this.selected.length == 1 ? this.selected[0] : null
    },
    'invalid_order': function () {
      return !this.service || !this.neworder.username || !this.neworder.quantity
    }
  }
}
</script>
