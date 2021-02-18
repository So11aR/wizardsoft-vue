<template>
  <div class="smetaWizard__controlls" @click="$emit('tab-active',$event)">
    <button data-type="db" :class="{tableActive: tabIsActive}" class="tableDatabase">
      Базы данных
    </button>
    <button data-type="lc" :class="{tableActive: !tabIsActive}" class="tableLicense">
      Обновления ПП и лицензии к модулям
    </button>
  </div>
</template>

<script>

export default {
  data: () => ({
    isActive: true,
  }),
  props: {
    tabIsActive: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    
  },
};
</script>