import PPMS from './PPMS.vue'
import PPMSPayment from './PPMSPayment.vue'
var config = {
  submission_tabs: [{ id: 'ppms', label: 'PPMS', component: PPMS }],
  payment: PPMSPayment
}
// , permissions: { ANY: ['ADMIN', 'STAFF', 'VIEW'] }
export { config }
