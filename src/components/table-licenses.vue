<template>
  <table id="moduleTable" :data-id="item.id">
    <thead>
      <tr>
        <th>
          <input type="checkbox" v-model="selected" @change="$emit('checkbox-all', $event, checkboxes)" />
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
          <input
            @change="$emit('select-checkbox', $event)"
            type="checkbox"
            ref="checkbox"
            :value="module.id"
          />
        </td>
        <td>{{ module.name }}</td>
        <td>{{ module.updated_at | date("datetime") }}</td>
        <td>{{ module.size }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
	data: () => ({
		checkboxes: [],
		selected: false
	}),
	props: ['item', 'loading'],
	mounted() {
		this.checkboxes = this.$refs.checkbox
	}
};
</script>