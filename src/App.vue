<template>
  <div id="app">
    <Progressbar :archive="archive" :errorsObj="errorsObj" />
    <Links
      :taskCreated="taskCreated"
      :archive="archive"
      :getLinks="getLinks"
      :getArchives="getArchives"
    />

    <!-- <pre>
      {{ archive }}
    </pre> -->
    <tabControls :tabIsActive="tabIsActive" @tab-active="tabActive" />
    <!-- <div class="table-limit-select">
      <SelectCount />
    </div> -->
    <!-- <appTable v-if="tabIsActive" /> -->
    <appTable1
      v-if="tabIsActive"
      @select-all="checkboxSelectAll"
      @select-checkbox="checkboxCheck"
      @create-task="createTasks"
      @select-count="changeSelectCount"
      :checkboxIds="checkboxIds"
      :taskCreated="taskCreated"
      :archive="archive"
      :errorText="errorText"
      :errorsObj="errorsObj"
      :getLinks="getLinks"
      :emptyErrorBase="emptyErrorBase"
      :emptyTasks="emptyTasks"
      :checkboxAllEl="checkboxAllEl"
    />
    <!-- <appTableModule v-else /> -->
    <appTableModule1
      v-else
      @change-distribution="setDistributionId"
      @select-checkbox="checkboxCheck"
      @create-license-archive="createLicenseTask"
      @select-all="checkboxSelectAll"
      @select-count="changeSelectCount"
      :archive="archive"
      :distributionId="distributionId"
      :errorText="errorText"
      :getLinks="getLinks"
      :emptyError="emptyError"
      :selectedCheckbox="selectedCheckbox"
    />
  </div>
</template>

<script>
//import appTableModule from "@/components/app-table-module";
//import appTable from "@/components/app-table";
import { mapActions, mapGetters } from "vuex";
import utils from "@/utils/utils";
import appTable1 from "@/components/app-table1";
import appTableModule1 from "@/components/app-table-module1";
import tabControls from "@/components/tab-controls";
import SelectCount from "@/components/select-count";
import Progressbar from "@/components/progressbar";
import Links from "@/components/links";

export default {
  name: "App",
  data: () => ({
    tabIsActive: true,
    checkboxIds: [],
    selectedCheckbox: [],
    checkboxAllEl: "",
    taskCreated: false,
    distributionId: null,
    errorsObj: {
      WAITING: "Пакет добавлен в очередь на загрузку",
      IN_PROCESS: "Загрузка пакета баз данных",
      SUCCESS: "Загрузка завершена",
      FAILURE: "Ошибка создания архива",
    },
    emptyError: "",
    emptyErrorBase: "",
    emptyTasks: false,
    errorText:
      "Вы не можете хранить больше 5 ссылок одновременно. Для загрузки удалите ссылку",
  }),
  components: {
    //appTableModule,
    appTableModule1,
    tabControls,
    //appTable,
    appTable1,
    SelectCount,
    Progressbar,
    Links,
  },
  methods: {
    ...mapActions(["fetchDataBases", "fetchArchives", "fetchArchiveTasks"]),
    changeSelectCount(stateSelect) {
      if (stateSelect.selectedValue) {
        this.selectedCheckbox.forEach((checkbox, index) => {
          if (+checkbox.value === this.checkboxIds[index]) {
            //console.log(checkbox);
            if (checkbox.checked) {
              checkbox.checked = false;
            }
          }
        });
        this.checkboxIds = [];
        this.selectedCheckbox = [];
      }
    },
    checkboxSelectAll(event, checkboxes) {
      this.checkboxAllEl = event.target;
      this.selectedCheckbox = checkboxes.filter((checkbox) => checkbox.checked);
      if (this.selectedCheckbox.length) {
        this.checkboxIds = this.selectedCheckbox.map(
          (checkbox) => +checkbox.value
        );
      }
    },
    checkboxCheck(e) {
      const target = e.target;
      if (!this.checkboxIds.includes(+target.value)) {
        this.checkboxIds.push(+target.value);
        this.selectedCheckbox.push(target);
        //console.log(this.selectedCheckbox);
        this.emptyTasks = false;
      } else {
        //FIXME: Сделать фильтрацию чекбоксов и их id короче
        const index = this.checkboxIds.findIndex(
          (item) => item === +target.value
        );
        const checkboxIndex = this.selectedCheckbox.findIndex(
          (item) => +item.value === +target.value
        );
        this.checkboxIds.splice(index, 1);
        this.selectedCheckbox.splice(checkboxIndex, 1);
        //console.log(this.selectedCheckbox);
      }
    },
    tabActive(e) {
      this.tabIsActive = e.target.dataset.type === "db";
    },
    setDistributionId(distributionId) {
      this.distributionId = distributionId;
    },
    downloadFile(link, archiveName) {
      const linkEl = document.createElement("a");
      linkEl.href = link;
      linkEl.setAttribute("download", archiveName);
      linkEl.setAttribute("target", "_blank");
      linkEl.dataset.link = "";
      linkEl.style.display = "none";
      linkEl.click();
      return false;
    },
    async createTasks() {
      const archiveTasks = {
        type_task: "bases",
        data: {
          bases_ids: this.checkboxIds,
        },
      };
      if (this.getArchives.length !== 5) {
        if (!this.checkboxIds.length) {
          this.emptyErrorBase = "Для скачивания, выбериет хотябы один элемент";
          this.emptyTasks = true;
          return;
        }
        await this.saveTask(archiveTasks);
        const clearTimer = await setInterval(() => {
          if (this.archive.progress === 100) {
            const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
            this.downloadFile(lastLinkArchive, this.archive.archive_name);
            clearTimeout(clearTimer);
          }
        }, 1000);
      } else {
        this.errorText =
          "Нельзя создать больше пяти задач от серийного номера.";
        utils.resetCheckbox(this.selectedCheckbox);
        utils.resetCheckboxAll(this.checkboxAllEl);
      }
    },
    async saveTask(task) {
      await this.fetchArchiveTasks(task);
      await utils.resetCheckbox(this.selectedCheckbox);
      utils.resetCheckboxAll(this.checkboxAllEl);
      this.taskCreated = true;
      this.checkboxIds = [];
    },
    async createLicenseTask() {
      const licenseTask = {
        type_task: "product",
        data: {
          distribution: this.distributionId,
          modules_licenses: this.checkboxIds,
        },
      };
      if (this.getArchives.length !== 5) {
        if (
          typeof this.distributionId === "number" &&
          this.checkboxIds.length
        ) {
          await this.saveTask(licenseTask);
          const clearTimer = await setInterval(() => {
            if (this.archive.progress === 100) {
              const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
              this.downloadFile(lastLinkArchive, this.archive.archive_name);
              clearTimeout(clearTimer);
            }
          }, 1000);
        } else if (
          typeof this.distributionId === "number" &&
          !this.checkboxIds.length
        ) {
          licenseTask.data.distribution = this.distributionId;
          //console.log(licenseTask);
          await this.fetchArchiveTasks(licenseTask);
          await this.fetchArchives();
          this.taskCreated = true;
          const clearTimer = await setInterval(() => {
            if (this.archive.progress === 100) {
              const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
              this.downloadFile(lastLinkArchive, this.archive.archive_name);
              clearTimeout(clearTimer);
            }
          }, 1000);
        } else {
          //TODO: вызов сообщения если пользователь не выбрал модули
          const modules = {
            modules_licenses: this.checkboxIds,
          };
          licenseTask.data = modules;
          await this.saveTask(licenseTask);
          const clearTimer = await setInterval(() => {
          if (this.archive.progress === 100) {
            const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
            this.downloadFile(lastLinkArchive, this.archive.archive_name);
            clearTimeout(clearTimer);
          }
        }, 1000);
          this.emptyError = this.getMessageError;
          //console.log(this.emptyError);
          console.log("Выберите дистрибутив");
        }
      } else {
        this.errorText =
          "Нельзя создать больше пяти задач от серийного номера.";
        utils.resetCheckbox(this.selectedCheckbox);
        utils.resetCheckboxAll(this.checkboxAllEl);
      }
    },
  },
  async mounted() {
    await this.fetchArchives();
  },
  computed: mapGetters([
    "archive",
    "getLinks",
    "getArchives",
    "getTaskCreated",
    "getMessageError",
  ]),
};
</script>

<style lang="scss">
@import "~bootstrap/dist/css/bootstrap.min.css";
@import url("./assets/css/style.css");
</style>
