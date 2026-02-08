<template>
  <h3>Collection</h3>
  <div>
    <label>
      <input type="radio" value="neutral" v-model="fromLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="opposing" v-model="fromLocation" /> Opposing
    </label>
  </div>
  <div>
    <label>
      <input type="radio" value="1" v-model="capacity" /> 0 - 1/3
    </label>
    <label>
      <input type="radio" value="3" v-model="capacity" /> 1/3 - 2/3
    </label>
    <label>
      <input type="radio" value="5" v-model="capacity" /> 2/3 - Full
    </label>
  </div>
  <h3>Emptying</h3>
  <div>
    <label>
      <input type="radio" value="home" v-model="toLocation" /> Home
    </label>
    <label>
      <input type="radio" value="neutral" v-model="toLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="depot" v-model="toLocation" /> Depot
    </label>
    <label>
      <input type="radio" value="outpost" v-model="toLocation" /> Outpost
    </label>
      <div>
    <label>
      <input type="checkbox" value="true" v-model="mobileShotCapable" /> Shot on the Move
    </label>
  </div>
  </div>
  <div>
    <label>
      <input type="radio" value="1" v-model="speed" />pew
    </label>
    <label>
      <input type="radio" value="3" v-model="speed" /> pew-pew
    </label>
    <label>
      <input type="radio" value="7" v-model="speed" /> avalanche!
    </label>
  </div>
   <div>
    <label>
      <input type="radio" value="1" v-model="accuracy" /> wild
    </label>
    <label>
      <input type="radio" value="3" v-model="accuracy" /> ballpark
    </label>
    <label>
      <input type="radio" value="7" v-model="accuracy" /> bullseye
    </label>
  </div>
  <div>
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

const fromLocation = computed({
  get: () => props.modelValue.fromLocation,
  set: (value) => emit('update:modelValue', { ...props.modelValue, fromLocation: value })
});
const capacity = computed({
  get: () => props.modelValue.capacity,
  set: (value) => emit('update:modelValue', { ...props.modelValue, capacity: value })
});
const toLocation = computed({
  get: () => props.modelValue.toLocation,
  set: (value) => emit('update:modelValue', { ...props.modelValue, toLocation: value })
});
const speed = computed({
  get: () => props.modelValue.speed,
  set: (value) => emit('update:modelValue', { ...props.modelValue, speed: value })
});
const accuracy = computed({
  get: () => props.modelValue.accuracy,
  set: (value) => emit('update:modelValue', { ...props.modelValue, accuracy: value })
});
const mobileShotCapable = computed({
  get: () => props.modelValue.mobileShotCapable,
  set: (value) => emit('update:modelValue', { ...props.modelValue, mobileShotCapable: value })
});
</script>
