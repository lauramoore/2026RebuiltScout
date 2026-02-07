<template>
  <h1>Teleop</h1>
  <div>
    <router-link :to="`/scout/${$route.params.match}/${$route.params.team}/teleop/passing`" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Passing/Stockpiling</button>
    </router-link>
    <router-link :to="`/scout/${$route.params.match}/${$route.params.team}/teleop/scoring`" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Scoring</button>
    </router-link>
    <router-link :to="`/scout/${$route.params.match}/${$route.params.team}/teleop/defense`" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Defense</button>
    </router-link>
  </div>

  <!-- Display title from route meta -->
  <h2 v-if="$route.meta.title">{{ $route.meta.title }}</h2>

  <!-- The router will render the matched child component here. -->
  <!-- v-model on router-view passes the model down to the route component. -->
  <router-view v-model="model"></router-view>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped>
button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}
</style>
