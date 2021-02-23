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
      @change-panel="changePanel"
      :archive="archive"
      :distributionId="distributionId"
      :errorText="errorText"
      :getLinks="getLinks"
      :emptyError="emptyError"
      :panel="panel"
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
    licenseTaskData: {},
    panel: {},
    licModIds: [],
    panelId: null,
    panels: [],
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
    changePanel(e, panels, licModIds) {
      this.panelId = +e.target.parentElement.dataset.id;
      this.panels = panels;
      console.log(this.panelId);
      console.log(this.panels);
      //console.log(panels);
      console.log(licModIds);
      panels.forEach((panel) => {
        if (this.panelId === panel.id) {
          panel.status = !panel.status;
          panel.current = true;
          console.log(panel);
          this.panel = panel;
          this.licModIds = licModIds;
          // const licenseTask = {
          //   type_task: "product",
          //   data: {
          //     distribution: this.distributionId,
          //     modules_licenses: this.checkboxIds,
          //   },
          // };
          // utils.resetCheckbox(this.selectedCheckbox);
          // utils.resetCheckboxAll(this.checkboxAllEl);
          // this.checkboxIds = []
        } else {
          panel.current = false;
          console.log(panel);
          if (!panel.current) {
            console.log(panel);
            panel.status = false;
            //panel.current = false;
            if (panel.checkboxes.length) {
              utils.resetCheckbox(panel.checkboxes);
              licModIds.splice(0);
              //utils.resetCheckboxAll(this.checkboxAllEl);

              this.checkboxIds = [];
            }
            panel.distSelected = false;
          }
        }
      });
    },
    changeSelectCount(stateSelect) {
      if (stateSelect.selectedValue) {
        this.selectedCheckbox.forEach((checkbox, index) => {
          if (+checkbox.value === this.checkboxIds[index]) {
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
      console.log(checkboxes);
      if (this.checkboxAllEl.checked) {
        this.selectedCheckbox = checkboxes.filter((checkbox) => {
          return checkbox.checked;
        });

        if (this.selectedCheckbox.length) {
          this.checkboxIds = this.selectedCheckbox.map(
            (checkbox) => +checkbox.value
          );
        }
        this.emptyTasks = false;
      } else {
        utils.resetCheckbox(this.selectedCheckbox);
        this.checkboxIds.splice(0);
      }
    },
    checkboxCheck(e) {
      const target = e.target;
      if (!this.checkboxIds.includes(+target.value) && target.checked) {
        this.checkboxIds.push(+target.value);
        this.selectedCheckbox.push(target);
        // console.log(this.selectedCheckbox);
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
        // console.log(this.selectedCheckbox);
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
          this.emptyErrorBase = "Для скачивания, выберите хотя бы один элемент";
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
      this.licModIds = [];
      //this.distributionId = null;
      // const panelIndex = this.panels.findIndex(
      //   (panel) => panel.id === this.panelId
      // );
      // this.panels[panelIndex].distSelected = false;
      // console.log(this.panels[panelIndex]);
      // console.log(this.panel);
    },
    async createLicenseTask() {
      const licenseTask = {
        type_task: "product",
        data: {
          distribution: this.distributionId,
          modules_licenses: this.licModIds,
        },
      };

      if (this.getArchives.length !== 5) {
        console.log("click");
        console.log(licenseTask);
        console.log(this.licModIds);
        if (
          typeof this.distributionId === "number" &&
          licenseTask.data.modules_licenses.length
        ) {
          await this.saveTask(licenseTask);
          utils.resetPanelDistSelected(this.panels, this.panelId);
          const clearTimer = await setInterval(() => {
            if (this.archive.progress === 100) {
              const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
              this.downloadFile(lastLinkArchive, this.archive.archive_name);
              clearTimeout(clearTimer);
            }
          }, 1000);
        } else if (
          typeof this.distributionId === "number" &&
          !licenseTask.data.modules_licenses.length
        ) {
          licenseTask.data.distribution = this.distributionId;
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
          //TODO: сделать обработку отправки на сервер, когда выбрано "не скачивать дистрибутив"

          if (isNaN(this.distributionId) && this.licModIds.length) {
            const modules = {
              modules_licenses: this.licModIds,
            };
            licenseTask.data = modules;
            delete licenseTask.distribution
            await this.saveTask(licenseTask);
            // utils.resetPanelDistSelected(this.panels, this.panelId);
            //FIXME:Добавтить код ниже вместо сброса через утилиты
            // const panelIndex = panels.findIndex(
            // 	(panel) => panel.id === panelId
            // );
            // panels[panelIndex].distSelected = false;
            const clearTimer = await setInterval(() => {
              if (this.archive.progress === 100) {
                const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
                this.downloadFile(lastLinkArchive, this.archive.archive_name);
                clearTimeout(clearTimer);
              }
            }, 1000);
            this.emptyError = this.getMessageError;
            console.log("Выберите дистрибутив");
            this.emptyTasks = false;
          } else {
            console.log("Выберите хотя бы один элемент");
          }
        }
      } else {
        this.errorText =
          "Нельзя создать больше пяти задач от серийного номера.";
        // utils.resetCheckbox(this.selectedCheckbox);
        // utils.resetCheckboxAll(this.checkboxAllEl);
      }
    },
  },
  async mounted() {
    await this.fetchArchives();
    console.log(this.selectedCheckbox);
  },
  computed: mapGetters([
    "archive",
    "getLinks",
    "getArchives",
    "getMessageError",
  ]),
};
</script>

<style lang="scss">
//@import "~bootstrap/dist/css/bootstrap.min.css";
//@import url("./assets/css/style.css");
</style>
