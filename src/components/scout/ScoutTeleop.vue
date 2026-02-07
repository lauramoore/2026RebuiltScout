<template>
  <h1>Teleop</h1>
  <h2>Passing/Stockpiling</h2>
  <PassingCycle v-model="model"/>
  <h2>Scoring</h2>
  <ScoreCycle v-model="model" />
  <h2>Defense</h2>
  <DefenseCycle v-model="model" />
</template>
<script setup>
import { computed } from 'vue';
import PassingCycle from  "./PassingCycle.vue";
import ScoreCycle from './ScoreCycle.vue';
import DefenseCycle from './DefenseCycle.vue'

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>
