<template>
  <span>
    <q-btn label="Import orders" color="primary" @click="dialog=true"/>
    <q-dialog
      v-model="dialog"
    >
      <q-card style="width: 80vw; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Search orders</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row" v-if="!search_order">
            <q-input outlined v-model="date_gte" label="Created after">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="date_gte" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-radio v-model="comment" :val="submission.id" :label="`Comment contains Submission ID (${submission.id})`" />
            <q-radio v-model="comment" :val="submission.internal_id" label="Line" :label="`Comment contains assigned Project ID (${submission.internal_id})`"/>
            <q-radio v-model="comment" val="" label="No/Other comment" />
            <q-input label="comment" v-model="other_comment" class="col" outlined v-if="!comment"/>
          </div>
          <div class="row">
            <q-checkbox v-model="search_order" label="OR search by Order ID." class="col"/>
            <q-input label="order_id" v-model="order_id" class="col" outlined v-if="search_order"/>
          </div>
          <div><q-btn label="Search" @click="search"/></div>
          <q-table
              title="Orders"
              :data="orders"
              row-key="orderref"
              :dense="true"
              :filter="filter"
            >
              <template v-slot:top-left>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Filter results">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
              <template v-slot:body-cell-order_date="props">
                <q-td :props="props">
                  <q-btn label="Import" size="xs" color="primary" @click="$parent.importOrder(props.row.orderref)" :disabled="orderExists(props.row.orderref)"/> {{ props.value }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-actions align="right" class="bg-white">
            <q-btn label="dismiss" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
  </span>
</template>

<script>
export default {
  props: ['submission', 'config'],
  data () {
    return {
      dialog: false,
      filter: '',
      date_gte: this.submission.submitted.substr(0,10),
      order_ids: [],
      order_id: null,
      comment: '',
      other_comment: '',
      search_order: false,
      orders: []
    }
  },
  methods: {
    search () {
      var params = {}
      if (this.search_order) {
        params.order_ids = this.order_id ? [this.order_id] : []
      } else {
        var comment = this.comment || this.other_comment
        params = {date_gte: this.date_gte, comment:comment}
      }
      this.$axios
        .get(`/api/plugins/ppms/submissions/${this.submission.id}/search_orders/`, { params: params })
        .then((response) => {
          this.orders = response.data
          this.$q.notify({message: `${this.orders.length} orders found.`, type: 'positive'})
        })
        .catch((error) => {
          if (error.response) {
            var reason = error.response.data && error.response.data.detail ? error.response.data.detail : ''
            this.$q.notify({message: 'There was an error searching for orders. ' + reason, type: 'negative'})
          }
        })
      },
      orderExists (order_id) {
        return this.$parent.orders.filter(o=>o.orderref==order_id).length > 0
      }
  },
  mounted () {
  }
}
</script>
