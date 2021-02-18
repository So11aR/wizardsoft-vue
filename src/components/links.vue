<template>
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
      <a
        class="mr-3 link-box__link"
        target="_blank"
        :href="getLinks[idx]"
        v-if="archive.type_task === 'bases'"
        >пакеты баз данных {{ archive.created_at | date("time") }}  {{archive.size | fileSize}}</a
      >
      <a
        class="mr-3 link-box__link"
        target="_blank"
        :href="getLinks[idx]"
        v-else
        >пакеты программных продуктов {{ archive.created_at | date("time") }} {{archive.size | fileSize}}</a
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
</template>

<script>
export default {
  data: () => ({
    linkDeleteText: "",
    timeout: 2000,
    snackbar: false,
  }),
  props: {
    archive: {
      type: Object,
      required: true,
    },
    taskCreated: {
      type: Boolean,
      required: true,
    },
    getLinks: {
      required: true,
    },
    getArchives: {
      required: true,
    },
  },
  methods: {
    async deleteLink(e) {
      const target = e.target;
      if (target.dataset.delete) {
        const id = +target.dataset.id;
        await this.$store.dispatch("deleteArchive", id);
        await this.$store.dispatch("fetchArchives");
        this.snackbar = true;
      }
      this.linkDeleteText = "Архив успешно удалён!";
      console.log(target);
    },
  },
};
</script>