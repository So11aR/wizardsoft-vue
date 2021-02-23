export default {
  state: {
    base: [],
  },
  mutations: {
    setBase(state, bases) {
      state.base = bases
    },
  },
  actions: {
    async fetchDataBases({ commit }) {
      try {
        const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        //const code = 222
        const response = await fetch(`http://192.168.2.179/api/serial/${code}/bases/`)
        const dataBases = await response.json()

        commit("setBase", dataBases)
      } catch (error) {
        throw new Error(error)
      }
    },
  },
  getters: {
    getDataBases(state) {
      return state.base
    },
  }
}