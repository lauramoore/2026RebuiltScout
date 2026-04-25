<template>

  <div class="form-group form-group-grid">
    <label>
      <input type="radio" value="home" v-model="fromLocation" /> Home
    </label>
    <label>
      <input type="radio" value="neutral" v-model="fromLocation" /> Neutral
    </label>
     <label>
      <input type="radio" value="opposing" v-model="fromLocation" /> Opposing
    </label>
  </div>
  <h4>Fill Level</h4>
  <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="capacity" /> &lt;30
    </label>
    <label>
      <input type="radio" value="3" v-model="capacity" /> 30 - 75
    </label>
    <label>
      <input type="radio" value="7" v-model="capacity" /> 80%+
    </label>
  </div>
   <h3>Passing</h3>
   <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="passing" /> 1
    </label>
    <label>
      <input type="radio" value="3" v-model="passing" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="passing" /> 7
    </label>
  </div>
   <h3>Bulldozing</h3>
   <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="bulldozing" /> 1
    </label>
    <label>
      <input type="radio" value="3" v-model="bulldozing" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="bulldozing" /> 7
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
const passing = useVModel('passing');
const bulldozing = useVModel('bulldozing');
</script>
