<template>
  <div>

    <q-table
      title="Services"
      :data="services"
      row-key="Service id"
      :dense="true"
      :filter="filter"
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
  </div>
</template>

<script>
export default {
  props: ['submission', 'config'],
  data () {
    return {
      services: [],
      filter: ''
    }
  },
  methods: {
  },
  mounted () {
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
  },
  computed: {
  }
}
</script>
