<template>
  <h3>Location</h3>
  <div>
    <label>
      <input type="radio" value="neutral" v-model="defenseLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="opposing" v-model="defenseLocation" /> Opposing
    </label>
    <label>
      <input type="radio" value="depot" v-model="defenseLocation" /> Depot
    </label>
    <label>
      <input type="radio" value="outpost" v-model="defenseLocation" /> Outpost
    </label>
    <label>
      <input type="radio" value="outpost" v-model="defenseLocation" /> Home
    </label>
  </div>
  <div>
    <label>
      <input type="radio" value="low" v-model="effective" /> minor
    </label>
    <label>
      <input type="radio" value="medium" v-model="effective" /> decent
    </label>
    <label>
      <input type="radio" value="full" v-model="effective" /> excellent
    </label>
  </div>
  <h3>Penaties</h3>
  <div>
    <label>
      <input type="radio" value="home" v-model="penalties" /> None
    </label>
    <label>
      <input type="radio" value="neutral" v-model="penalties" /> 1-2
    </label>
    <label>
      <input type="radio" value="depot" v-model="penalties" /> 3+
    </label>
    <div>
    <label>
      <input type="checkbox" value="true" v-model="majorFoul" />Yellow Card
    </label>
        <label>
      <input type="checkbox" value="true" v-model="techFoul" />Red Card
    </label>
  </div>
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

const defenseLocation = computed({
  get: () => props.modelValue.defenseLocation,
  set: (value) => emit('update:modelValue', { ...props.modelValue, defenseLocation: value })
});
const effective = computed({
  get: () => props.modelValue.effective,
  set: (value) => emit('update:modelValue', { ...props.modelValue, effective: value })
});
const penalties = computed({
  get: () => props.modelValue.penalties,
  set: (value) => emit('update:modelValue', { ...props.modelValue, penalties: value })
});
const majorFoul = computed({
  get: () => props.modelValue.majorFoul,
  set: (value) => emit('update:modelValue', { ...props.modelValue, majorFoul: value })
});
const techFoul = computed({
  get: () => props.modelValue.techFoul,
  set: (value) => emit('update:modelValue', { ...props.modelValue, techFoul: value })
});
</script>
