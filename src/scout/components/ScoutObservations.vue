<template>
  <h1>Observations</h1>
  <h3>Categories</h3>
  <div class="categories-container">
      <label>
      <input type="checkbox" value="trench" v-model="categories" />Uses Trench
    </label>
    <label>
      <input type="checkbox" value="bump" v-model="categories" />Uses Bump
    </label>
    <label>
      <input type="checkbox" value="2e2Shooter" v-model="categories" />End-To-End Passing
    </label>
    <label>
      <input type="checkbox" value="bulldozer" v-model="categories" />Fuel Bulldozer
    </label>
     <label>
      <input type="checkbox" value="didNotShow" v-model="categories" />Never Showed
    </label>
      <label>
      <input type="checkbox" value="inTheWay" v-model="categories" />Blocked Partners
    </label>
    <label>
      <input type="checkbox" value="broken" v-model="categories" />Broke During Match
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

<style scoped>
.categories-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
textarea {
  height: 8rem;
  width: 100%;
  box-sizing: border-box;
}
</style>
