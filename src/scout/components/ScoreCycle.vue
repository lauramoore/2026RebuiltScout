<template>

  <h3>Shooting</h3>
  <div class="form-group">
    <h4>Capacity</h4>
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
    <h4>Rate</h4>
    <label>
      <input type="radio" value="1" v-model="speed" /> 1
    </label>
    <label>
      <input type="radio" value="3" v-model="speed" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="speed" /> 7
    </label>
  </div>
   <h4>Accuracy</h4>
   <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="accuracy" /> &lt;50%
    </label>
    <label>
      <input type="radio" value="3" v-model="accuracy" /> 50%-75%
    </label>
    <label>
      <input type="radio" value="7" v-model="accuracy" /> 80%+
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

const capacity = useVModel('capacity');
const speed = useVModel('speed');
const accuracy = useVModel('accuracy');
</script>
