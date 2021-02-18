<template>
  <div>
    <div id="app-table-module">
      <div class="baseTableLimit__select" @click.stop>
        <!-- <label for="baseTableLimit" style="display: inline"
          >Показывать записей</label
        > -->

        <!-- <div class="select-wrap">
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
        </div> -->

        <selectCount @select-count="changeSelectCount" />
      </div>
      <v-expansion-panels>
       
        <v-expansion-panel
          v-for="(item) in pages[offset]"
          :key="item.id"
          :data-id="item.id"
          
          @click="test"
          ref="expPanel"
        >
        
          <v-expansion-panel-header>{{ item.name }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <selectDistribution
              :item="item"
              @change-distribution="changeDistributionSelect"
            />

            <tableLicenses
              @checkbox-all="selectAll"
              @select-checkbox="selectCheckbox"
              :item="item"
              :loading="loading"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="but__wrapper">
        <div class="but-download__info">
          <button
            class="but_download"
            @click="$emit('create-license-archive')"
            :disabled="
              (archive.progress < 100 ? true : false) || getLinks.length >= 5
            "
          >
            Скачать выделенное
          </button>
          <span
            class="but-download__message"
            v-if="archive.progress < 100 ? true : false"
          >
            Вы сможете повторить операцию, после загрузки текущего пакета
          </span>
          <span class="but-download__message" v-else-if="getLinks.length >= 5">
            {{ errorText }}
          </span>
          <span
            class="but-download__message but-download__message--danger"
            v-else
          >
            {{ emptyError }}
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
import { mapActions, mapGetters } from "vuex";
import preloader from "@/components/preloader";
import tableLicenses from "@/components/table-licenses";
import utils from "@/utils/utils";
import selectCount from "@/components/select-count";
import selectDistribution from "@/components/select-distribution";

export default {
  name: "app-table-module",
  data: () => ({
    offset: 0,
    optionSelected: true,
    pages: [],
    basesIds: [],
    // checkboxSelected: [],
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
    panels: [],
  }),
  components: {
    preloader,
    selectDistribution,
    tableLicenses,
    selectCount,
  },
  props: {
    archive: {
      type: Object,
      required: true,
    },
    distributionId: {
      required: true,
    },
    errorText: {
      type: String,
      required: true,
    },
    getLinks: {
      required: true,
    },
    emptyError: {
      required: true,
    },
    selectedCheckbox: {
      required: true,
    }
  },
  computed: {
    ...mapGetters(["getDataLicenses"]),
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
    ...mapActions(["fetchLicenses"]),
    changeSelectCount(stateSelect) {
      this.$emit("select-count", stateSelect);
      this.limit = stateSelect.limit;
      this.offset = 0;
      this.clearPages();
      this.splitPages();
    },
    test(e) {
      //console.log(e.target.parentElement.dataset.id);
      const panelId = +e.target.parentElement.dataset.id;
      //console.log(this.panels);
      this.panels.forEach((panel) => {
        if (panelId === panel.id) {
          panel.status = !panel.status;
          //console.log(panel);
        } else {
          panel.status = false
          if(this.selectedCheckbox.length) {
            utils.resetCheckbox(this.selectedCheckbox)
            this.selectedCheckbox = []
          }
          console.log(this.selectedCheckbox);
          // let previousPanel = panel.id
          // console.log(previousPanel);          
        }
         
      });
    },
    selectCheckbox(e) {
      this.$emit("select-checkbox", e);
      
    },
    changeDistributionSelect(distId, distSelected) {
      this.$emit("change-distribution", distId);
      console.log(distSelected);
    },
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
        this.offset++;
      }
    },
    prev() {
      if (this.canPrev) {
        this.offset--;
      }
    },
    selectAll(e, checkboxes) {
      checkboxes = checkboxes.map((checkbox) => {
        checkbox.checked = e.target.checked;
        return checkbox;
      });
      this.$emit("select-all", e, checkboxes);
    },
  },
  async mounted() {
    await this.fetchLicenses();
    await this.splitPages();

    this.$refs.expPanel.forEach((element) => {
      //console.log(element.$attrs);
      this.panels.push({
        id: element.$attrs["data-id"],
        status: false,
      });
      //panelAttrs.push(element.$attrs['data-id'])
      //console.log(element.$attrs['data-id']);
    });

    this.loading = false;
  },
};
</script>