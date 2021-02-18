<template>
  <div>
    <!-- <pre>
      {{ getArchives }}
    </pre>

    <pre>
          {{ getLinks }}
    </pre> -->

    <!-- v-if="
          linkReadyBases &&
          Object.keys(archive).length &&
          archive.progress === 100 &&
          !getArchives.length
        " -->

    <!-- v-if="linkReadyBases && archive.progress === 100" -->

    <div
      class="link-box__wrapper"
      v-if="
        (archive.progress === 100 && taskCreated) ||
        (getLinks.length && !taskCreated)
      "
    >
      <div
        class="link-box"
        v-for="(archive, idx) in getArchives"
        :key="getLinks[idx]"
      >
        <span class="mr-3 link-box__text">Скачать </span>
        <a class="mr-3 link-box__link" :href="getLinks[idx]" target="_blank"
          >пакеты баз данных {{ archive.created_at | date("time") }}</a
        >
        <button
          class="but-delete"
          @click="deleteLink"
          :data-id="archive.id"
          data-delete="true"
        >
          <span>&times;</span>
        </button>
      </div>
      <v-snackbar v-model="snackbar" :timeout="timeout">
        {{ linkDeleteText }}

        <template v-slot:action="{ attrs }">
          <v-btn
            color="blue"
            text
            v-bind="attrs"
            @click="snackbar = false"
            style="font-size: 1.3rem"
          >
            &times;
          </v-btn>
        </template>
      </v-snackbar>
    </div>

    <div
      class="progress-wrapper"
      v-if="
        archive.progress < 100
          ? (progressVisible = true)
          : (progressVisible = false)
      "
    >
      <v-app class="progress-line">
        <v-progress-linear
          :class="{ showProgress: archive.progress < 100 ? true : false }"
          class="hiddenProgress progress-bar"
          color="blue darken-1"
          height="25"
          :value="archive.progress"
        >
          <strong class="white--text">{{ archive.progress || 0 }}%</strong>
        </v-progress-linear>
      </v-app>
      <v-alert
        :class="{ showProgress: archive.progress < 100 ? true : false }"
        class="hiddenProgress progress-alert ma-0"
        >{{ errorsObj[archive.status] }}</v-alert
      >
    </div>

    <div id="app-table-main" class="tables-show">
      <div class="baseTableLimit__select" @click.stop>
        <label for="baseTableLimit" style="display: inline"
          >Показывать записей</label
        >

        <div class="select-wrap">
          <label v-if="optionSelected">{{ limit }}</label>
          <select
            class="custom-select"
            v-model="limit"
            @change="optionSelected = false"
          >
            <option :value="count" v-for="count in counts" :key="count">
              {{ count }}
            </option>
          </select>
        </div>
      </div>

      <table id="mainTable">
        <thead>
          <tr>
            <th>
              <input type="checkbox" v-model="selected" @change="selectAll" />
            </th>
            <th>№</th>
            <th>Наименование</th>
            <th>Регион</th>
            <th>Дата обновления</th>
            <th>Дата выгрузки</th>
            <th>Размер</th>
          </tr>
        </thead>
        <tr v-if="loading">
          <td class="preloader-wrapper" colspan="7">
            <preloader />
          </td>
        </tr>
        <tbody v-else>
          <tr v-for="(data, index) in pages[offset]" :key="data.id">
            <td>
              <input
                type="checkbox"
                @change="checkboxCheck"
                :checked="checkboxIds.includes(data.id)"
                :data-id="
                  offset === 0 ? index + 1 : limit * offset + (index + 1)
                "
                :value="data.id"
                ref="checkbox"
              />
            </td>
            <td>
              {{ offset === 0 ? index + 1 : limit * offset + (index + 1) }}
            </td>
            <td>{{ data.basename }}</td>
            <td>{{ data.region }}</td>
            <td>{{ data.updated_at | date("datetime") }}</td>
            <td>{{ data.updatedate | date("datetime") }}</td>
            <td>{{ data.size }}</td>
          </tr>
        </tbody>
      </table>
      <div class="but__wrapper">
        <div class="but-download__info">
          <button
            class="but_download"
            @click="createTasks"
            :disabled="archive.progress < 100 ? true : false"
          >
            Скачать выделенное
          </button>
          <span
            class="but-download__message"
            v-if="archive.progress < 100 ? true : false"
          >
            Вы сможете повторить операцию, после загрузки текущего пакета
          </span>

          <span class="message-error" v-if="getArchiveError">
            {{ getArchiveError }}
          </span>
        </div>

        <div class="but__controlls">
          <button
            @click="prev"
            :disabled="!this.canPrev"
            class="but_default_bg"
            style="margin-right: 20px"
          >
            Предыдущая
          </button>
          <button
            @click="next"
            :disabled="!this.canNext"
            class="but_default_bg"
          >
            Следующая
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import preloader from "@/components/preloader";
//import utils from "@/utils/utils"

export default {
  data() {
    return {
      offset: 0,
      pages: [],
      basesIds: [],
      checkboxSelected: [],
      checkboxIds: [],
      totalPages: 0,
      limit: 5, // 10
      selected: false,
      optionSelected: true,
      disabledDownloadButton: false,
      errorsObj: {
        WAITING: "Пакет добавлен в очередь на загрузку",
        IN_PROCESS: "Загрузка пакета баз данных",
        SUCCESS: "Загрузка завершена",
        FAILURE: "Ошибка создания архива",
      },
      counts: [10, 25, 50, 100],
      progressVisible: false,
      loading: true,
      taskCreated: false,
      linkDeleteText: "",
      timeout: 2000,
      snackbar: false,
    };
  },
  components: {
    preloader,
  },
  watch: {
    limit(value) {
      if (this.selected) {
        this.selected = false;
      }
      this.offset = 0;
      this.checkboxIds = [];
      this.clearPages();
      this.splitPages();
    },
  },
  filters: {
    numberLimit: (value) => +value,
  },
  async mounted() {
    await this.$store.dispatch("fetchDataBases");
    await this.splitPages();
    await this.$store.dispatch("fetchArchives");
    this.loading = false;
  },
  methods: {
    // async deleteLink(e) {
    //   const target = e.target;
    //   if (target.dataset.delete) {
    //     const id = +target.dataset.id;
    //     await this.$store.dispatch("deleteArchive", id);
    //     await this.$store.dispatch("fetchArchives");
    //     this.snackbar = true;
    //   }
    //   this.linkDeleteText = "Архив успешно удалён!";
    //   console.log(target);
    // },
    next() {
      if (this.canNext) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset++;
      }
    },
    checkboxCheck(e) {
      const target = e.target;
      if (!this.checkboxIds.includes(+target.value)) {
        this.checkboxIds.push(+target.value);
      } else {
        const index = this.checkboxIds.findIndex(
          (item) => item === +target.value
        );
        this.checkboxIds.splice(index, 1);
      }
    },
    prev() {
      if (this.canPrev) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset--;
      }
    },
    clearPages() {
      this.pages = [];
    },
    splitPages() {
      this.totalPages = Math.ceil(this.getDataBases.length / this.limit);
      for (let i = 0; i < this.totalPages; i++) {
        const start = i * this.limit;
        const end = start + this.limit;
        this.pages.push(this.getDataBases.slice(start, end));
      }
    },
    selectAll(e) {
      this.$refs.checkbox.forEach(
        (checkbox) => (checkbox.checked = e.target.checked)
      );
    },

    selectedCheckbox() {
      this.checkboxSelected = this.$refs.checkbox.filter(
        (checkbox) => checkbox.checked
      );
    },

    //09.01 #26660 создание заданий
    async createTasks() {
      this.selectedCheckbox();
      this.basesIds = this.checkboxSelected.map((checkbox) => +checkbox.value);

      const archiveTasks = {
        type_task: "bases",
        data: {
          bases_ids: this.basesIds,
        },
      };

      if (this.checkboxSelected.length) {
        //if (!this.getArchiveError) {
         // console.log(this.getArchiveError);
          await this.$store.dispatch("fetchArchiveTasks", archiveTasks);
          await this.$store.dispatch("fetchArchives");
          this.$refs.checkbox.forEach((checkbox) => (checkbox.checked = false));
          this.selected = false;
          this.taskCreated = true;
          // console.log(this.getArchiveError);
      // }
      } else {
        console.log("Вы ничего не выбрали");
      }
    },
  },
  computed: {
    getDataBases() {
      return this.$store.getters.getDataBases;
    },
    getTotalPages() {
      return this.$store.getters.getTotalPages;
    },
    canNext() {
      return this.offset + 1 < this.totalPages;
    },
    canPrev() {
      return this.offset > 0;
    },
    archive() {
      return this.$store.getters.archive;
    },
    getLink() {
      return this.$store.getters.getLink;
    },
    getLinks() {
      return this.$store.getters.getLinks;
    },
    getArchives() {
      return this.$store.getters.getArchives;
    },
    getArchiveError() {
      return this.$store.getters.getArchiveError;
    },
  },
};
</script>

<style scoped lang="scss">
</style>