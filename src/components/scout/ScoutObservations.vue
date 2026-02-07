<template>
  <h1>Observations</h1>
  <h3>Categories</h3>
  <div>
      <label>
      <input type="checkbox" value="efficient" v-model="categories" />Trench
    </label>
    <label>
      <input type="checkbox" value="unreliable" v-model="categories" />Bump
    </label>
    <label>
      <input type="checkbox" value="fast" v-model="categories" />Blocked Partners
    </label>
    <label>
      <input type="checkbox" value="agile" v-model="categories" />Broke Down
    </label>
    <label>
      <input type="checkbox" value="clunky" v-model="categories" />Slow
    </label>
    <label>
      <input type="checkbox" value="sturdy" v-model="categories" />Escape Artist
    </label>
    <label>
      <input type="checkbox" value="sturdy" v-model="categories" />Sniper
    </label>
     <label>
      <input type="checkbox" value="sturdy" v-model="categories" />Dump Truck
    </label>
  </div>
  <h3>Notes</h3>
  <textarea v-model="notes"></textarea>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ categories: [], notes: '' })
  }
});

const emit = defineEmits(['update:modelValue']);

const categories = computed({
  get: () => props.modelValue.categories || [],
  set: (value) => emit('update:modelValue', { ...props.modelValue, categories: value })
});

const notes = computed({
  get: () => props.modelValue.notes || '',
  set: (value) => emit('update:modelValue', { ...props.modelValue, notes: value })
});
</script>

