<template>
  <div>
    <div>
      <div if submission.payment.group>
        <h3>Group</h3>
        <span v-for="v,k in groupFields"><b>{{ v }}:</b>{{ submission.payment.group[k] }}<br></span>
      </div>
      <h3>Orders</h3>
      <ul>
        <li v-for="(o, i) in orders"><a target="_blank" :href="`https://ppms.us/ucdavis-test/vorder/?orderid=${o}`">Order #{{o}}</a></li>
      </ul>
    </div>
    <OrderSearch :submission="submission"/>
    <q-btn label="Create order" @click="openOrderDialog()"/>
    <q-dialog
      v-model="create"
    >
      <q-card style="width: 80vw; max-width: 80vw;">
        <q-card-section>
          <div class="text-h4">Create a new order in PPMS.</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div>
            <div class="text-h5">Step 1: Select a user for order creation</div>
            <q-table
              title="Users"
              :data="accounts"
              row-key="UserID"
              :dense="true"
              :filter="filter"
              selection="single"
              :selected.sync="user_selection"
            >
              <template v-slot:top-left>
                <b>Users</b>
                <q-input borderless dense debounce="300" v-model="user_filter" placeholder="Search">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
              <!-- <template v-slot:body-cell-UserID="props">
                <q-td :props="props">
                  <q-btn label="Create order" size="xs" @click="openOrderDialog(props.row)"/>
                </q-td>
              </template> -->
            </q-table>
          </div>
          
          <div v-if="user">
            <div class="text-h5">Step 2: Create the order</div>
            <q-radio v-model="creation_method" val="ppms" label="On PPMS" />
            <q-radio v-model="creation_method" val="api" label="Using the API" />
            <div class="text-h5" v-if="creation_method == 'ppms'">
              <a  :href="`https://ppms.us/ucdavis-test/order/?userid=${user.UserID}`" target="_blank">Create order</a> directly in PPMS. Once the order is created, return here to import the newly created order using the "Import Orders" button.
            </div>
            <div v-else>
              <legend>Creating a new order via the API is limited to 1 service.  For more services, please create the order using the PPMS site.</legend>
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
              
              <!-- <q-input label="username" v-model="neworder.username"/> -->
              <q-input label="quantity" type="number" v-model="neworder.quantity"/>
              <q-btn color="primary" label="Create order" @click="createOrder" :disabled="(invalid_order || processing)"/>
            </div>
            
          </div>
          
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
           <q-btn label="cancel" color="red" v-close-popup/>
        </q-card-actions>
      </q-card>
  </q-dialog>
  </div>
</template>

<script>
import OrderSearch from './OrderSearch.vue'

export default {
  props: ['submission', 'config'],
  data () {
    return {
      services: [],
      selected: [],
      orders: [],
      accounts: [],
      filter: '',
      user_filter: '',
      neworder: {},
      user_selection: [],
      processing: false,
      mounted: false,
      create: false,
      creation_method: 'ppms',
      groupFields: {'admname': 'Admin Name', 'admemail': 'Admin Email', 'headname': 'Head Name', 'unitname': 'Unit Name', 'heademail': 'Head Email', 'department': 'Department', 'affiliation': 'Affiliation', 'institution': 'Institution', 'creationdate': 'Created'}
    }
  },
  methods: {
    createOrder () {
      if (this.invalid_order) {
        this.$q.notify({message: 'Please ensure all order fields are filled out.', type: 'negative'})
      } else {
        this.neworder.serviceid = this.service['Service id']
        this.neworder.username = this.user.Login
        this.processing = true
        this.$axios
        .post(`/api/plugins/ppms/submissions/${this.submission.id}/create_order/`, this.neworder)
        .then((response) => {
          this.orders = response.data.plugin_data.orders
          this.processing = false
          this.neworder = {}
          this.$q.notify({message: `PPMS Order #${response.data.order} successfully created. `, type: 'positive'})
          this.create = false
        })
        .catch((error) => {
          if (error.response) {
            var reason = error.response.data && error.response.data.detail ? error.response.data.detail : ''
            this.$q.notify({message: 'There was an error creating the order. '+reason, type: 'negative'})
            this.processing = false
          }
        })
      }
    },
    importOrder (order_id) {
      if (!order_id) {
        this.$q.notify({message: 'Please include an order id.', type: 'negative'})
      } else {
        this.$axios
        .post(`/api/plugins/ppms/submissions/${this.submission.id}/import_order/`, {order_id: order_id})
        .then((response) => {
          this.orders.push(response.data)
          this.$q.notify({message: `PPMS Order #${order_id} successfully imported. `, type: 'positive'})
        })
        .catch((error) => {
          if (error.response) {
            var reason = error.response.data && error.response.data.detail ? error.response.data.detail : ''
            this.$q.notify({message: 'There was an error importing the order. '+reason, type: 'negative'})
          }
        })
      }
    },
    openOrderDialog() {
      // this.user = user
      // this.neworder.username = this.user.Login
      this.create = true
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
      this.$axios
        .get(`/api/plugins/ppms/submissions/${this.submission.id}/user_info/`)
        .then((response) => {
          this.accounts = response.data
        })
        .catch((error) => {
          if (error.response && error.response.status !== 404) {
            this.$q.notify({message: 'Unable to fetch user account info using PI and submitter emails.', type: 'negative'})
          }
        })
  },
  computed: {
    'service': function () {
      return this.selected.length == 1 ? this.selected[0] : null
    },
    'invalid_order': function () {
      return !this.service || !this.user || !this.user.Login || !this.neworder.quantity
    },
    'user': function () {
      return this.user_selection.length > 0 ? this.user_selection[0] : null
    }
  },
  components: {
    OrderSearch
  }
}
</script>
