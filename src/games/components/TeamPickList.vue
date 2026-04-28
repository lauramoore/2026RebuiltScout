<script setup>
import { ref, watch } from 'vue';

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
  selection: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:selection']);
const selectedTeams = ref([]);

// Check if a team is already selected in another slot to prevent duplicates
function isTeamSelected(teamNumber, currentIndex) {
  if (!teamNumber) return false;
  return selectedTeams.value.some((selectedTeam, index) => {
    // selectedTeam can be a team object or null
    return index !== currentIndex && selectedTeam?.teamNumber === teamNumber;
  });
}

// Emit the updated list to the parent component whenever a selection changes
function handleSelectionChange() {
  emit('update:selection', [...selectedTeams.value]);
}

// When the selection prop from the parent changes (e.g., after async data load),
// update the internal state of this component.
watch(() => props.selection, (newSelection) => {
  selectedTeams.value = Array.from({ length: props.maxTeams }, (_, i) => {
    return (newSelection && newSelection[i]) || null;
  });
}, { immediate: true });
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
            :value="team"
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
