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
      <input type="radio" value="home" v-model="defenseLocation" /> Home
    </label>
  </div>
  <h3>Effectiveness</h3>
  <div>
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
  <div>
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
  <div>
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

const defenseLocation = useVModel('defenseLocation');
const effective = useVModel('effective');
const penalties = useVModel('penalties');
const majorFoul = useVModel('majorFoul');
const techFoul = useVModel('techFoul');
</script>
