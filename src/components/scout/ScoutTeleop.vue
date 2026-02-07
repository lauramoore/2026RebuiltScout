<template>
  <h1>Teleop</h1>
  <ScoutCycle v-model="model"/>
</template>
<script setup>
import { computed } from 'vue';
import ScoutCycle from  "./ScoutCycle.vue";

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>
