<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allTeams: {
    type: Array,
    required: true,
    default: () => []
  },
  maxTeams: {
    type: Number,
    default: 8
  },
  initialSelection: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:selection']);

// Initialize selection based on maxTeams prop
const selectedTeams = ref(
  Array.from({ length: props.maxTeams }, (_, i) => props.initialSelection[i] || null)
);

// Check if a team is already selected in another slot to prevent duplicates
function isTeamSelected(teamNumber, currentIndex) {
  if (!teamNumber) return false;
  return selectedTeams.value.some((selectedNumber, index) => {
    return index !== currentIndex && selectedNumber === teamNumber;
  });
}

// Emit the updated list to the parent component whenever a selection changes
function handleSelectionChange() {
  emit('update:selection', [...selectedTeams.value]);
}
</script>

<template>
  <div class="team-picklist-container">
    <ol class="picklist">
      <li v-for="index in maxTeams" :key="`pick-${index}`">
        <span class="rank-label">{{ index }}.</span>
        <select
          v-model="selectedTeams[index - 1]"
          @change="handleSelectionChange"
          class="team-select"
        >
          <option :value="null">-- Select a Team --</option>
          <option
            v-for="team in allTeams"
            :key="team.teamNumber"
            :value="team.teamNumber"
            :disabled="isTeamSelected(team.teamNumber, index - 1)"
          >
            {{ team.teamNumber }} - {{ team.nameShort || team.nickname }}
          </option>
        </select>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.team-picklist-container {
  width: 100%;
}
</style>
