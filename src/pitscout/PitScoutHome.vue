<template>
  <div class="pitscout-home-container">
    <h1>Pit Scouting</h1>
    <p>Select an event and team to begin pit scouting.</p>
    <form @submit.prevent="startScouting" class="scout-selection-form">
      <div class="form-group">
        <label for="event">Event Code:</label>
        <input type="text" id="event" v-model="eventCode" required placeholder="e.g., 2024oncmp">
      </div>
      <div class="form-group">
        <label for="team">Team Number:</label>
        <input type="number" id="team" v-model="teamNumber" required placeholder="e.g., 2056">
      </div>
      <button type="submit" class="btn-primary">Scout Team</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const eventCode = ref('');
const teamNumber = ref('');

function startScouting() {
  if (eventCode.value && teamNumber.value) {
    router.push({
      name: 'pitscout-form',
      params: { event: eventCode.value, team: teamNumber.value }
    });
  }
}
</script>

<style scoped>
.pitscout-home-container {
  padding: 1rem;
}
.scout-selection-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
</style>
