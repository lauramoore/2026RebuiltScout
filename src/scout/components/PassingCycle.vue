<template>
  <h3>Collection</h3>
  <div class="form-group">
    <label>
      <input type="radio" value="neutral" v-model="fromLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="opposing" v-model="fromLocation" /> Opposing
    </label>
  </div>
  <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="capacity" /> 0 - 1/3
    </label>
    <label>
      <input type="radio" value="3" v-model="capacity" /> 1/3 - 2/3
    </label>
    <label>
      <input type="radio" value="7" v-model="capacity" /> 2/3 - Full
    </label>
  </div>
  <h3>Emptying</h3>
  <div class="form-group form-group-grid">
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
  </div>
  <div class="form-group">
    <label>
      <input type="checkbox" value="true" v-model="mobileShotCapable" /> Shot on the Move
    </label>
  </div>
  <div class="form-group">
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
   <div class="form-group">
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

const fromLocation = useVModel('fromLocation');
const capacity = useVModel('capacity');
const toLocation = useVModel('toLocation');
const speed = useVModel('speed');
const accuracy = useVModel('accuracy');
const mobileShotCapable = useVModel('mobileShotCapable');
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
