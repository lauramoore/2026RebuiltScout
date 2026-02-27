<template>
  <h3>From</h3>
  <div class="form-group">
    <label>
      <input type="radio" value="neutral" v-model="fromLocation" /> Neutral
    </label>
    <label>
      <input type="radio" value="opposing" v-model="fromLocation" /> Opposing
    </label>
  </div>
  <h3>TO</h3>
  <div class="form-group form-group-grid">
    <label>
      <input type="radio" value="home" v-model="toLocation" /> Home
    </label>
    <label>
      <input type="radio" value="neutral" v-model="toLocation" /> Neutral
    </label>
  </div>
   <div class="form-group">
    <h3>Capacity</h3>
    <label>
      <input type="radio" value="1" v-model="capacity" /> 1
    </label>
    <label>
      <input type="radio" value="3" v-model="capacity" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="capacity" /> 7
    </label>
  </div>
  <div class="form-group">
     <h3>Rate</h3>
    <label>
      <input type="radio" value="1" v-model="speed" />1
    </label>
    <label>
      <input type="radio" value="3" v-model="speed" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="speed" /> 7
    </label>
  </div>
   <div class="form-group">
    <h3>Accuracy</h3>
    <label>
      <input type="radio" value="1" v-model="accuracy" /> 1
    </label>
    <label>
      <input type="radio" value="3" v-model="accuracy" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="accuracy" /> 7
    </label>
  </div>
  <div class="form-group">
    <label>
      <input type="checkbox" value="true" v-model="mobileShotCapable" /> Shot on the Move
    </label>
    <label>
      <input type="checkbox" value="true" v-model="bulldozer" /> Bulldozer
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
