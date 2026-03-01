<template>
  <div>
    <div class="form-group">
      <label for="notes">Notes:</label>
      <textarea id="notes" v-model="notes" rows="4" placeholder="General observations, robot capabilities, driver skill..."></textarea>
    </div>

    <div class="save-container">
      <button @click="finishScouting" class="save-button">
       Done
      </button>
    </div>
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

const notes = computed({
  get: () => props.modelValue.notes,
  set: (value) => {
    emit('update:modelValue', { ...props.modelValue, notes: value });
  }
});

function finishScouting() {
  emit('done');
}
</script>

<style scoped>
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
