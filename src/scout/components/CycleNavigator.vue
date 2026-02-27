<template>
  <div class="cycle-navigator">
    <button @click="$emit('previous')" :disabled="currentIndex === 0" type="button">&lt;</button>
    <span>Cycle {{ currentIndex + 1 }} of {{ totalCycles }}</span>
    <button @click="$emit('next')" :disabled="currentIndex >= totalCycles - 1" type="button">&gt;</button>
    <button @click="$emit('add')" type="button">New</button>
  </div>
</template>

<script setup>
defineProps({
  currentIndex: {
    type: Number,
    required: true
  },
  totalCycles: {
    type: Number,
    required: true
  }
});

defineEmits(['previous', 'next', 'add']);
</script>

<style scoped>
.cycle-navigator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-block: 1rem;
}
</style>
