<template>
  

    <select
      :data-id="item.id"
      id="selectDistribution"
      v-model="distributionId"
      @change="$emit('change-distribution', distributionId)"
      ref="select-distribution"
    >
      <option value="null" disabled>Выберите дистрибутив</option>
      <option value="not download">Не скачивать дистрибутив</option>
      <option
        v-for="itemDistribution in item.distribution"
        :key="itemDistribution.id"
        :value="itemDistribution.id"
      >
        {{ itemDistribution.architecture }}
        {{ itemDistribution.size }}
      </option>
    </select>

</template>

<script>
export default {
  data: () => ({
    distributionId: null
  }),
  props: ["item", "panel"],
  computed: {
    distSelected() {
      return typeof this.distributionId === "number";
    }
  },
};
</script>