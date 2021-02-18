export default {
  state: {
    dataLicenses: [],
  },
  mutations: {
    setLicense(state, licenses) {
      state.dataLicenses = licenses
    },
  },
  actions: {
    async fetchLicenses({ commit }) {
      try {
        //const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        const code = 222
        const response = await fetch(`http://192.168.2.179/api/serial/${code}/product_version/`)
        const dataLicenses = await response.json()

        commit("setLicense", dataLicenses)
      } catch (error) {
        throw new Error(error)
      }
    },
  },
  getters: {
    getDataLicenses(state) {
      return state.dataLicenses
    },
  }
}

