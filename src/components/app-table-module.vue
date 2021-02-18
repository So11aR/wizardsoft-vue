<template>
  <div>
    <!-- <div
      class="link-box"
      v-if="
        linkReadyBases &&
        Object.keys(archive).length &&
        archive.progress === 100
      "
    >
      <span>Скачать </span>
      <a
        @click="linkReadyBases = !linkReadyBases"
        :href="getLink"
        target="_blank"
        class="hiddenProgress"
        :class="{ showProgress: archive.progress === 100 ? true : false }"
        >пакеты программных продуктов
        {{ archive.created_at | dateFilter("time") }}</a
      >
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
    </div> -->

    <div id="app-table-module">
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
      <pre>
        {{getDataLicenses}}
      </pre>
      <v-expansion-panels>
        <v-expansion-panel v-for="item in pages[offset]" :key="item.id">
          <v-expansion-panel-header>{{ item.name }}</v-expansion-panel-header>

          <v-expansion-panel-content>
            <select
              id="selectDistribution"
              v-model="distributionId"
            >
              <option :value="null" disabled>Выберите дистрибутив</option>
              <option>Не скачивать дистрибутив</option>
              <option
                v-for="itemDistribution in item.distribution"
                :key="itemDistribution.id"
                :value="itemDistribution.id"
              >
                {{ itemDistribution.architecture }}
                {{ itemDistribution.size }}
              </option>
            </select>
            <div>
              <table id="moduleTable">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        v-model="selected"
                        @change="selectAll"
                        
                      />
                    </th>
                    <th>Наименование</th>
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
                  <tr v-for="module in item.modules_licenses" :key="module.id">
                    <td>
                      <input type="checkbox" ref="checkbox" :value="module.id" />
                    </td>
                    <td>{{ module.name }}</td>
                    <td>{{ module.updated_at | date("datetime") }}</td>
                    <td>{{ module.size }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="but__wrapper">
        <div class="but-download__info">
          <button class="but_download" @click="createLicenseTask">
            Скачать выделенное
          </button>
          <span class="but-download__message">
            Вы сможете повторить операцию, после загрузки текущего пакета
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
import utils from "@/utils/utils";
console.log(utils);

export default {
  name: "app-table-module",
  data: () => ({
    offset: 0,
    counts: [10, 25, 50, 100],
    optionSelected: true,
    distributionId: null,
    pages: [],
    basesIds: [],
    checkboxSelected: [],
    totalPages: 0,
    limit: 5, // 10
    selected: false,
    loading: true,
    linkReadyBases: true,
    progressVisible: false,
    errorsObj: {
      WAITING: "Пакет добавлен в очередь на загрузку",
      IN_PROCESS: "Загрузка пакета баз данных",
      SUCCESS: "Загрузка завершена",
      FAILURE: "Ошибка создания архива",
    },
    disabledDownloadButton: false,
  }),
  components: {
    preloader,
  },
  computed: {
    getDataLicenses() {
      return this.$store.getters.getDataLicenses;
    },
    canNext() {
      return this.offset + 1 < this.totalPages;
    },
    canPrev() {
      return this.offset > 0;
    },
  },
  watch: {
    limit(value) {
      if (this.selected) {
        this.selected = false;
      }
      this.clearPages();
      this.splitPages();
      this.offset = 0;
    },
  },
  methods: {
    splitPages() {
      this.totalPages = Math.ceil(this.getDataLicenses.length / this.limit);
      for (let i = 0; i < this.totalPages; i++) {
        const start = i * this.limit;
        const end = start + this.limit;
        this.pages.push(this.getDataLicenses.slice(start, end));
      }
    },
    clearPages() {
      this.pages = [];
    },
    next() {
      if (this.canNext) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset++;
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
    async createLicenseTask() {
      this.selectedCheckbox();
      console.log(this.checkboxSelected);
      const licenseTask = {
        type_task: "product",
        data: {
          distribution: this.distributionId,
          modules_licenses: this.checkboxSelected.map(checkbox => +checkbox.value)
        },
      };
      if (this.checkboxSelected.length) {
        if(typeof this.distributionId === "number") {
          //TODO: вызов экшена для архивации дистрибутивов

          await this.$store.dispatch("fetchArchiveTasks", licenseTask)
        }
      }
    },
  },
  async mounted() {
    await this.$store.dispatch("fetchLicenses");
    await this.splitPages();
    this.loading = false;
  },
};
</script>