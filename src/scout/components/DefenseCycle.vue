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
      <input type="radio" :value="1" v-model="effective" /> minor
    </label>
    <label>
      <input type="radio" :value="3" v-model="effective" /> decent
    </label>
    <label>
      <input type="radio" :value="7" v-model="effective" /> excellent
    </label>
  </div>
  <h3>Penalties</h3>
  <div class="form-group">
    <label>
      <input type="radio" :value="0" v-model="penalties" /> None
    </label>
    <label>
      <input type="radio" :value="3" v-model="penalties" /> 1-2
    </label>
    <label>
      <input type="radio" :value="7" v-model="penalties" /> 3+
    </label>
  </div>
  <div class="form-group">
    <label>
      <input type="checkbox" v-model="majorFoul" /> Yellow Card
    </label>
    <label>
      <input type="checkbox" v-model="techFoul" /> Red Card
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
const penalties = useVModel('penalties');
const majorFoul = useVModel('majorFoul');
const techFoul = useVModel('techFoul');
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
