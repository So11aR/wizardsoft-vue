<template>
  <select
    :data-id="item.id"
    id="selectDistribution"
    v-model="distributionId"
    @change="$emit('change-distribution', distributionId, distSelected)"
  >
    <option :value="null" disabled>Выберите дистрибутив</option>
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
    distributionId: null,
    distSelected: false
  }),
  props: ["item"],
};
</script>