import { ref, computed, watch } from 'vue';

/**
 * A composable for managing a list of "cycles" within a larger data model.
 * It handles adding, navigating, and updating individual cycles.
 *
 * @param {import('vue').Ref<Object>} model - A computed ref with get/set for the parent component's v-model.
 * @param {import('vue').Ref<string | null>} cycleKey - A ref containing the property name on the model object that holds the array of cycles.
 */
export function useCycleManager(model, cycleKey) {
  const currentIndex = ref(0);

  const cycles = computed(() => (cycleKey.value ? model.value[cycleKey.value] : []) || []);

  // When the cycleKey changes (e.g., switching from "passing" to "scoring"),
  // ensure we have at least one cycle and reset the index to the last one.
  watch(cycleKey, (newKey) => {
    if (newKey) {
      const currentCycles = model.value[newKey] || [];
      if (currentCycles.length === 0) {
        // Create a new object to trigger the model's setter, initializing the cycle array.
        model.value = { ...model.value, [newKey]: [{}] };
      }
      // Go to the last cycle for this type.
      // We read model.value again because it might have been updated in this watch handler.
      currentIndex.value = (model.value[newKey]?.length || 1) - 1;
    }
  }, { immediate: true });

  const currentCycleModel = computed({
    get: () => {
      return cycles.value[currentIndex.value] || {};
    },
    set: (value) => {
      if (!cycleKey.value) return;
      const newCycles = [...cycles.value];
      newCycles[currentIndex.value] = value;
      // Create a new object to trigger the model's setter, updating the cycle array.
      model.value = { ...model.value, [cycleKey.value]: newCycles };
    }
  });

  function addCycle() {
    if (!cycleKey.value) return;
    const newCycles = [...cycles.value, {}];
    model.value = { ...model.value, [cycleKey.value]: newCycles };
    currentIndex.value = newCycles.length - 1;
  }

  function previousCycle() {
    if (currentIndex.value > 0) currentIndex.value--;
  }

  function nextCycle() {
    if (currentIndex.value < cycles.value.length - 1) currentIndex.value++;
  }

  return { currentIndex, cycles, currentCycleModel, addCycle, previousCycle, nextCycle };
}
