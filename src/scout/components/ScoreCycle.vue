<template>
  <h3>Collection</h3>
  <div>
    <label>
      <input type="radio" value="home" v-model="fromLocation" /> Home
    </label>
    <label>
      <input type="radio" value="depot" v-model="fromLocation" /> Depot
    </label>
    <label>
      <input type="radio" value="outpost" v-model="fromLocation" /> Outpost
    </label>
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
      <input type="radio" value="7" v-model="capacity" /> 2/3 - Full
    </label>
  </div>
  <h3>Emptying</h3>
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
      <input type="radio" value="3" v-model="accuracy" /> on target
    </label>
    <label>
      <input type="radio" value="7" v-model="accuracy" /> bullseye
    </label>
  </div>
  <div>
     <label>
      <input type="checkbox" value="true" v-model="mobileShotCapable" /> on the move
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
const speed = useVModel('speed');
const accuracy = useVModel('accuracy');
const mobileShotCapable = useVModel('mobileShotCapable');
</script>
