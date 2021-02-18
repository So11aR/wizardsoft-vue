<template>
  <div
    class="progress-wrapper"
     v-if="
      archive.progress < 100
        ? (progressVisible = true)
        : (progressVisible = false)
    "
  >
  <pre>
      {{ archive }}
    </pre>
 
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
</template>

<script>
export default {
  props: {
    archive: {
      type: Object,
      required: true,
    },
    errorsObj: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 250px !important;
}
.progress-wrapper {
  display: flex;
  align-items: center;
}
.ma-0 {
  margin: 0;
}
</style>