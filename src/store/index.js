import Vue from 'vue'
import Vuex from 'vuex'
import appTable from '@/store/modules/app-table'
import appTableModule from '@/store/modules/app-table-module'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    archive: {},
    archiveTasks: {},
    archives: [],
    link: '#',
    links: [],
    messageError: '',

  },
  mutations: {
    setArchiveTasks(state, data) {
      state.archiveTasks = data
    },
    async setArchive(state, archive) {
      state.archive = archive
    },
    setArchives(state, archives) {
      state.archives = archives
    },
    createLinks(state, links) {
      if (Array.isArray(links)) {
        state.links = links.map(link => `http://192.168.2.179/api/serial/${link.code}/archives/${link.id}/download`)
      }
      else {
        const link = `http://192.168.2.179/api/serial/${links.code}/archives/${links.id}/download`
        !state.links.includes(link) && state.links.push(link)
      }
    },
    setMessageError(state, error) {
      state.messageError = error
    },


  },
  actions: {
    // Отправка задач на архивирование #26660
    async fetchArchiveTasks({ commit, getters, dispatch }, data) {
      try {
        const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        //const code = 222;
        const response = await fetch(`http://192.168.2.179/api/serial/${code}/archives/`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(data)
        });

        const responseData = await response.json()
        //throw (responseData)
        //FIXME:обработка оштбки добавления
        //console.log(responseData)

        if (!response.ok) {
          throw (responseData)
        }

        await dispatch("fetchArchive", responseData.id)
        let clearTimer = setInterval(async () => {
          await dispatch("fetchArchive", responseData.id)
          await dispatch("fetchArchives")
         // console.log(getters.archive);
  
          if (getters.archive.progress === 100) {
            console.log(getters.archive);
            clearInterval(clearTimer)
          }
        }, 1000)

      } catch (error) {
        commit("setMessageError", error.error[0])
        console.log(error.error[0]);
      }
    },

    // архивированный файл
    async fetchArchive({ commit }, id = '') {
      try {
        const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        //const code = 222;
        const response = await fetch(`http://192.168.2.179/api/serial/${code}/archives/${id}`);
        const archive = await response.json();

        const dataLink = {
          code,
          id: archive.id
        }

        commit("setArchive", archive);
        commit("createLinks", dataLink);

      } catch (error) {
        throw new Error(error)
      }
    },

    // Получение всех текущих архивов с сервера
    async fetchArchives({ commit }, id = '') {
      try {
        const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        //const code = 222;
        const response = await fetch(`http://192.168.2.179/api/serial/${code}/archives`);
        const archives = await response.json();

        const dataLinks = archives.map(archive => ({
          code, id: archive.id
        }))

        commit("createLinks", dataLinks);

        commit("setArchives", archives);

      } catch (error) {
        throw new Error(error)
      }
    },
    async deleteArchive({ commit }, id) {
      try {
        //const code = 222
        const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        const response = await fetch(`http://192.168.2.179/api/serial/${code}/archives/${id}`, {
          method: 'DELETE',
          mode: 'cors',
        });
        console.log(response.status);
        console.log(response.statusText);
        console.log("архив успешно удалён");
      } catch (error) {
        throw new Error(error)
      }
    }

  },
  getters: {
    getArchiveTasks(state) {
      return state.archiveTasks
    },
    archive(state) {
      return state.archive
    },
    waitingTask(state) {
      return state.waitingTask
    },
    getLink(state) {
      return state.link
    },
    getArchives(state) {
      return state.archives
    },
    getLinks(state) {
      return state.links
    },
    getMessageError(state) {
      return state.messageError
    },


  },
  modules: {
    appTable,
    appTableModule
  }
})
