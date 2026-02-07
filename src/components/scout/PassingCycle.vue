<template>
  <h3>Collection</h3>
  <div>
    <label>
      <input type="radio" value="neutral" v-model="collectionLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="opposing" v-model="collectionLocation" /> Opposing
    </label>
    <label>
      <input type="radio" value="depot" v-model="collectionLocation" /> Depot
    </label>
    <label>
      <input type="radio" value="outpost" v-model="collectionLocation" /> Outpost
    </label>
  </div>
  <div>
    <label>
      <input type="radio" value="low" v-model="capacity" /> 0 - 1/3
    </label>
    <label>
      <input type="radio" value="medium" v-model="capacity" /> 1/3 - 2/3
    </label>
    <label>
      <input type="radio" value="full" v-model="capacity" /> 2/3 - Full
    </label>
  </div>
  <h3>Emptying</h3>
  <div>
    <label>
      <input type="radio" value="home" v-model="emptyingLocation" /> Home
    </label>
    <label>
      <input type="radio" value="neutral" v-model="emptyingLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="depot" v-model="emptyingLocation" /> Depot
    </label>
    <label>
      <input type="radio" value="outpost" v-model="emptyingLocation" /> Outpost
    </label>
      <div>
    <label>
      <input type="checkbox" value="true" v-model="mobileScoring" /> Shot on the Move
    </label>
  </div>
  </div>
  <div>
    <label>
      <input type="radio" value="slow" v-model="speed" />pew
    </label>
    <label>
      <input type="radio" value="medium" v-model="speed" /> pew-pew
    </label>
    <label>
      <input type="radio" value="fast" v-model="speed" /> avalanche!
    </label>
  </div>
   <div>
    <label>
      <input type="radio" value="wild" v-model="accuracy" /> wild
    </label>
    <label>
      <input type="radio" value="decent" v-model="accuracy" /> ballpark
    </label>
    <label>
      <input type="radio" value="precise" v-model="accuracy" /> bullseye
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

const collectionLocation = computed({
  get: () => props.modelValue.collectionLocation,
  set: (value) => emit('update:modelValue', { ...props.modelValue, collectionLocation: value })
});
const capacity = computed({
  get: () => props.modelValue.capacity,
  set: (value) => emit('update:modelValue', { ...props.modelValue, capacity: value })
});
const emptyingLocation = computed({
  get: () => props.modelValue.emptyingLocation,
  set: (value) => emit('update:modelValue', { ...props.modelValue, emptyingLocation: value })
});
const speed = computed({
  get: () => props.modelValue.speed,
  set: (value) => emit('update:modelValue', { ...props.modelValue, speed: value })
});
const accuracy = computed({
  get: () => props.modelValue.accuracy,
  set: (value) => emit('update:modelValue', { ...props.modelValue, accuracy: value })
});
</script>
