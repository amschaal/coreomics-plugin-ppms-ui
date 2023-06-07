<template>
  <div>
    <q-btn label="Import orders" @click="dialog=true"/>
    <q-dialog
      v-model="dialog"
    >
      <q-card style="width: 80vw; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Search orders</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input label="order_id" v-model="order_id"/>
          <q-input label="comment" v-model="comment"/>
          <q-btn label="Search" @click="search"/>
          <q-table
              title="Orders"
              :data="orders"
              row-key="orderref"
              :dense="true"
              :filter="filter"
            >
              <template v-slot:top-left>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
              <template v-slot:body-cell-order_date="props">
                <q-td :props="props">
                  <q-btn label="Import" size="xs" color="primary" @click="$parent.importOrder(props.row.orderref)" :disabled="$parent.orders.indexOf(props.row.orderref) != -1"/> {{ props.value }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn label="cancel" color="red" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
  </div>
</template>

<script>
export default {
  props: ['submission', 'config'],
  data () {
    return {
      dialog: false,
      filter: '',
      date_gte: null,
      order_ids: [],
      order_id: null,
      comment: '',
      orders: []
    }
  },
  methods: {
    search () {
      this.$axios
        .get(`/api/plugins/ppms/submissions/${this.submission.id}/search_orders/`, { params: {comment:this.comment, order_ids: this.order_id ? [this.order_id] : []} })
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
      }
  },
  mounted () {
  }
}
</script>
