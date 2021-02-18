<template>
  <div>
    <div id="app-table-main" class="tables-show">
      <div class="baseTableLimit__select" @click.stop>
        <selectCount 
          @select-count="changeSelectCount"
        />
      </div> 

      

      <table id="mainTable">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                v-model="selected"
                @change="$emit('select-all', $event, selectAll($event))"
              />
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
                @change="$emit('select-checkbox', $event)"
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
            @click="$emit('create-task')"
            :disabled="
              (archive.progress < 100 ? true : false) || getLinks.length >= 5 || emptyTasks"
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
            class="but-download__message"
            v-if="emptyTasks"
          >
            {{emptyErrorBase}}
          </span>
        </div>

        <div class="but__controlls">
          <button
            @click="prev"
            :disabled="!canPrev"
            class="but_default_bg"
            style="margin-right: 20px"
          >
            Предыдущая
          </button>
          <button @click="next" :disabled="!canNext" class="but_default_bg">
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
import selectCount from "@/components/select-count";
import utils from "@/utils/utils";

export default {
  data() {
    return {
      offset: 0,
      basesIds: [],
      pages: [],
      bases: [],
      checkboxSelected: [],
      //checkboxIds: [],
      totalPages: 0,
      limit: 5, // 10
      selected: false,
      optionSelected: true,
      disabledDownloadButton: false,
      counts: [10, 25, 50, 100],
      progressVisible: false,
      loading: true,
      linkDeleteText: "",
      timeout: 2000,
      snackbar: false,
    };
  },
  props: [
    "checkboxIds",
    "taskCreated",
    "archive",
    "errorText",
    "getLinks",
    "errorsObj",
    "emptyErrorBase",
    "emptyTasks",
    "checkboxAllEl"
  ],
  components: {
    preloader,
    selectCount
  },
  watch: {
    limit(value) {
      // if (this.selected) {
      //   this.selected = false;
      // }
      // console.log(this.selectedCheckbox);
      // if (this.selectedCheckbox.length) {
      //   this.selectedCheckbox.forEach((checkbox) => (checkbox.checked = false));
      // }
      console.log(this.checkboxSelected);
      //this.offset = 0;
      //FIXME:Сброс идентификаторов при изменении селекта
      //this.checkboxIds = [];
      // this.clearPages();
      // this.splitPages();
    },
  },
  filters: {
    numberLimit: (value) => +value,
  },
  methods: {
    ...mapActions(["fetchDataBases"]),
    changeSelectCount(stateSelect) {
      this.$emit('select-count', stateSelect)
      this.limit = stateSelect.limit
      this.offset = 0;
      this.clearPages();
      this.splitPages();
      if(this.checkboxAllEl) {
        this.checkboxAllEl.checked = false
      }
    },
    next() {
      if (this.canNext) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset++;
        //this.selectCheckbox();
        //console.log(this.selectedCheckbox);
      }
    },
    prev() {
      if (this.canPrev) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset--;
        //this.selectCheckbox();
        //console.log(this.selectedCheckbox);
      }
    },
    clearPages() {
      this.pages = [];
    },
    splitPages() {
      this.totalPages = Math.ceil(this.getDataBases.length / this.limit);
      console.log(this.totalPages);
      for (let i = 0; i < this.totalPages; i++) {
        const start = i * this.limit;
        const end = start + this.limit;
        this.pages.push(this.getDataBases.slice(start, end));
      }
      console.log(this.pages);
    },
    selectAll(e) {
      this.$refs.checkbox.forEach(
        (checkbox) => (checkbox.checked = e.target.checked)
      );
      return this.$refs.checkbox.map((checkbox) => checkbox);
    },
    selectCheckbox() {
      this.checkboxSelected = this.$refs.checkbox.filter(
        (checkbox) => checkbox.checked
      );
    },
  },
  async mounted() {
    await this.fetchDataBases();
    await this.splitPages();
    this.loading = false;
  },
  computed: {
    ...mapGetters(["getTotalPages", "getDataBases"]),
    canNext() {
      return this.offset + 1 < this.totalPages;
    },
    canPrev() {
      return this.offset > 0;
    },
  },
};
</script>
