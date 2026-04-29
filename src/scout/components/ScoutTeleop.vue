<template>
  <h1>Teleop</h1>
  <h3>Driver Skill</h3>
  <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="driverSkill" /> 1
    </label>
    <label>
      <input type="radio" value="3" v-model="driverSkill" /> 3
    </label>
    <label>
      <input type="radio" value="7" v-model="driverSkill" /> 7
    </label>
  </div>
  <div>
    <router-link :to="{ name: 'scout-teleop-passing', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Stockpiling</button>
    </router-link>
    <router-link :to="{ name: 'scout-teleop-scoring', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Scoring</button>
    </router-link>
    <router-link :to="{ name: 'scout-teleop-defense', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Defense</button>
    </router-link>
  </div>

  <div class="cycle-controls">
     <button v-if="currentCycleType && cycles.length > 0" @click="isEditing = !isEditing">
      {{ isEditing ? 'Done Editing' : 'Edit Cycle' }}
    </button>
    <CycleNavigator v-if="currentCycleType" :current-index="currentIndex" :total-cycles="cycles.length" @previous="previousCycle" @next="nextCycle" @add="addCycle" />

  </div>

  <div v-if="isEditing && currentCycleType && cycles.length > 0" class="edit-controls">
    <h4>Editing Cycle {{ currentIndex + 1 }}</h4>
    <div class="cycle-type-changer">
      <span>Change Type:</span>
      <button :disabled="currentCycleType === 'passing'" @click="changeCycleType('passing')">Passing</button>
      <button :disabled="currentCycleType === 'scoring'" @click="changeCycleType('scoring')">Scoring</button>
      <button :disabled="currentCycleType === 'defense'" @click="changeCycleType('defense')">Defense</button>
    </div>
    <button class="delete-button" @click="deleteCurrentCycle">Delete This Cycle</button>
  </div>

  <!-- The router will render the matched child component here. -->
  <!-- We use v-slot to pass the correct v-model (a single cycle object) to the rendered component. -->
  <router-view v-slot="{ Component }">
    <component :is="Component" v-model="currentCycleModel" />
  </router-view>

  <EndgameClimb v-model="climb" />
</template>
<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCycleManager } from '../composables/useCycleManager';
import CycleNavigator from './CycleNavigator.vue';
import EndgameClimb from './EndgameClimb.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue', "done"]);
const route = useRoute();
const router = useRouter();
const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

// This computed property will be the v-model for the EndgameClimb component.
const climb = computed({
  get: () => model.value.climb || {},
  set: (climbValue) => {
    model.value = { ...model.value, climb: climbValue };
  }
});

const driverSkill = computed( {
  get: () => props.modelValue.driverSkill || 0,
  set: (driverSkill) => {
    model.value = { ... model.value, driverSkill: driverSkill}
  }

});

// Determine which type of cycle is active based on the route name
const currentCycleType = computed(() => {
  const routeName = String(route.name || '');
  if (routeName.endsWith('passing')) return 'passing';
  if (routeName.endsWith('scoring')) return 'scoring';
  if (routeName.endsWith('defense')) return 'defense';
  return null;
});

const { currentIndex, cycles, currentCycleModel, addCycle, previousCycle, nextCycle } = useCycleManager(model, currentCycleType);

const isEditing = ref(false);

function changeCycleType(newType) {
  if (newType === currentCycleType.value || !cycles.value.length || !currentCycleType.value) return;

  // If moving to or from a defense cycle, start with a fresh, empty cycle.
  // Otherwise, copy the existing cycle data.
  const cycleToMove = (currentCycleType.value === 'defense' || newType === 'defense')
    ? {}
    : { ...currentCycleModel.value };

  // When converting from passing to scoring, remove passing-specific properties.
  if (currentCycleType.value === 'passing' && newType === 'scoring') {
    delete cycleToMove.toLocation;
    delete cycleToMove.bulldozer;
  } else if(currentCycleType.value === 'scoring' && newType === 'passing') {
    delete cycleToMove.fromLocation;
  }

  // Remove from the old cycle type's array
  let oldTypedCycles = (model.value[currentCycleType.value] || []).filter((_, i) => i !== currentIndex.value);
  // If the array becomes empty, add a new placeholder to conform to useCycleManager's expectation
  if (oldTypedCycles.length === 0) {
    oldTypedCycles.push({});
  }

  // Add to the new cycle type's array, replacing the placeholder if it exists
  const destinationCycles = model.value[newType] || [];
  const isDestinationPlaceholder = destinationCycles.length === 1 && Object.keys(destinationCycles[0]).length === 0;
  const newDestinationCycles = isDestinationPlaceholder
    ? [cycleToMove]
    : [...destinationCycles, cycleToMove];

  // Update the model with changes to both arrays
  model.value = {
    ...model.value,
    [currentCycleType.value]: oldTypedCycles,
    [newType]: newDestinationCycles,
  };

  isEditing.value = false;

  // Navigate to the new cycle type's view. useCycleManager will handle setting the index.
  router.push({ name: `scout-teleop-${newType}`, params: route.params });
}

function deleteCurrentCycle() {
  if (!cycles.value.length || !currentCycleType.value) return;

  const currentTypedCycles = model.value[currentCycleType.value] || [];
  const newTypedCycles = currentTypedCycles.filter((_, index) => index !== currentIndex.value);

  // If we deleted the last cycle, add a new blank one to prevent an empty list.
  if (newTypedCycles.length === 0) {
    newTypedCycles.push({});
  }

  // Update the model
  model.value = { ...model.value, [currentCycleType.value]: newTypedCycles };

  // If the index is now out of bounds (we deleted the last item), move it to the new last item.
  if (currentIndex.value >= newTypedCycles.length) {
    currentIndex.value = newTypedCycles.length - 1;
  }

  // Exit edit mode
  isEditing.value = false;
}
</script>

<style scoped>
button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.cycle-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-controls {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cycle-type-changer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.delete-button {
  background-color: #f44336;
  color: white;
  border-color: #f44336;
  align-self: flex-start;
}
</style>
