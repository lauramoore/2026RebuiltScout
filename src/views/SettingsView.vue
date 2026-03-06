<template>
  <div class="settings">
    <h1>Settings</h1>
    <div class="setting-group">
      <label for="event-select">Event ID</label>
      <input id="event-select" v-model="eventId" />
       <label for="season-select">Season</label>
      <input id="season-select"  v-model="season" />
    </div>

    <div>
      <button @click="scheduleUpdate">Update Schedule</button>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { functions } from '../firebase.js'
import { httpsCallable } from 'firebase/functions';

const eventId = ref('gadal');
const season = ref('2026');

async function scheduleUpdate() {
  const callImportFrcSchedule = httpsCallable(functions, 'importFrcSchedule');

  if (!eventId.value) {
    alert('Please select an event first.');
    return;
  }


  const scheduleQuery = {
    year: String(season.value),
    eventCode: eventId.value,
    tournamentLevel: "Qualification" // TODO: This could be a dropdown in the UI
  };

  console.log(`Calling importFrcSchedule with:`, scheduleQuery);
  alert('Updating schedule... This may take a moment.');

  try {
    const result = await callImportFrcSchedule(scheduleQuery);
    const data = result.data;

    if (data.success) {
      console.log(`Successfully imported schedule: ${data.message}`);
      alert(`Schedule updated! ${data.matchesSaved} matches saved.`);
    } else {
      console.warn(`Function reported an issue: ${data.message}`);
      alert(`Could not update schedule: ${data.message}`);
    }
  } catch (error) {
    console.error(`Error calling function: ${error.code} - ${error.message}`);
    alert(`An error occurred while updating the schedule: ${error.message}`);
  }
}

onMounted(async () => {

});
</script>

<style scoped>
.settings {
  padding: 20px;
}
.setting-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input {
  padding: 8px;
  width: 100%;
  max-width: 300px;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #3aa876;
}
</style>
