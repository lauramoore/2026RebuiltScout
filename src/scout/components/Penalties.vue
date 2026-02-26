<template>
  <div class="form-group form-group-grid">
     <button type="button" @click="penalties = Math.max(0, (penalties || 0) - 1)">-</button>
     <span>Penalties: {{ penalties || 0 }}</span>
     <button type="button" @click="penalties = (penalties || 0) + 1">+</button>

     <button type="button" @click="fouls = Math.max(0, (fouls || 0) - 1)">-</button>
     <span>Fouls: {{ fouls || 0 }}</span>
     <button type="button" @click="fouls = (fouls || 0) + 1">+</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ penalties: 0, fouls: 0 })
  }
});

const emit = defineEmits(['update:modelValue']);

const useVModel = (key) => {
    return computed({
        get: () => props.modelValue[key],
        set: (value) => emit('update:modelValue', { ...props.modelValue, [key]: value })
    });
};

const penalties = useVModel('penalties');
const fouls = useVModel('fouls');
</script>

<style scoped>
.form-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.form-group-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: start;
  gap: 0.5rem;
  align-items: center;
}
</style>
