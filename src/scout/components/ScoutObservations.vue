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
      <input type="checkbox" value="2e2Shooter" v-model="categories" />Full Field Passing
    </label>
    <label>
      <input type="checkbox" value="shove2outpost" v-model="categories" />Shove into Outpost
    </label>
     <label>
      <input type="checkbox" value="shootnmove" v-model="categories" />Shoot on the move
    </label>
     <label>
      <input type="checkbox" value="didNotShow" v-model="categories" />Never Showed
    </label>
    <label>
      <input type="checkbox" value="broken" v-model="categories" />Broke During Match
    </label>
  </div>
  <h3>Notes</h3>
  <textarea v-model="notes"></textarea>

  <div class="save-container">
     <button @click="finishScouting" class="save-button">
       Done
      </button>
  </div>

</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ categories: [], notes: '' })
  }
});

const emit = defineEmits(['update:modelValue', 'done']);
const categories = computed({
  get: () => props.modelValue.categories || [],
  set: (value) => emit('update:modelValue', { ...props.modelValue, categories: value })
});

const notes = computed({
  get: () => props.modelValue.notes || '',
  set: (value) => emit('update:modelValue', { ...props.modelValue, notes: value })
});

function finishScouting() {
  emit('done');
}
</script>

<style scoped>
.categories-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
   gap: 0.5rem;
  margin-bottom: 1rem;
}

.save-container {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

textarea {
  height: 8rem;
  width: 100%;
  box-sizing: border-box;
}
.save-button {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  background-color: #28a745; /* Green for go/finish */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
 }
</style>
