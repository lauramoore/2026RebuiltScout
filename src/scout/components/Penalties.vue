<template>
  <div class="form-group form-group-grid">
     <button>-</button>Penalties: {{ penalties }}<button>+</button>
     <button>-</button>Fouls: {{ fouls }}<button>+</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
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
}
</style>
