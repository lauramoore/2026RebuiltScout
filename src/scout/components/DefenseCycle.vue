<template>
  <h3>Location</h3>
  <div class="form-group form-group-grid">
    <label>
      <input type="radio" value="neutral" v-model="defenseZone" /> Neutral
    </label>
    <label>
      <input type="radio" value="opposing" v-model="defenseZone" /> Opposing
    </label>
    <label>
      <input type="radio" value="home" v-model="defenseZone" /> Home
    </label>
  </div>
  <h3>Effectiveness</h3>
  <div class="form-group">
    <label>
      <input type="radio" :value="1" v-model="effective" /> 1
    </label>
    <label>
      <input type="radio" :value="3" v-model="effective" /> 3
    </label>
    <label>
      <input type="radio" :value="7" v-model="effective" /> 7
    </label>
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

const defenseZone = useVModel('defenseLocation');
const effective = useVModel('effective');
</script>
