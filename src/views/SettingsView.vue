<template>
  <div class="settings">
    <h1>Settings</h1>
    <div class="setting-group">
      <label for="event-select">Current Event ID</label>
      <select id="event-select" v-model="eventId">
        <option disabled value="">Select an event</option>
        <option v-for="event in events" :key="event.id" :value="event.id">
          {{ event.name || event.id }}
        </option>
      </select>
      <p class="description">
        Select the event you are currently scouting. This will be used as the default for new scout entries.
      </p>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase'; // Adjust path based on your project structure
import { doc, getDoc } from 'firebase/firestore';

const events = ref([]);
const eventId = ref('');

onMounted(async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'current'));
    if (settingsDoc.exists()) {
      const eventsData = settingsDoc.data();
      // Assuming the 'current' document's data is a map of event objects,
      // where keys are event IDs. This mirrors how a collection query result
      // (with doc.id and doc.data()) was being used before.
      events.value = Object.keys(eventsData).map(key => ({
        id: key,
        ...eventsData[key]
      }));
    } else {
      console.error("Firestore document 'settings/current' not found.");
    }
  } catch (error) {
    console.error("Error fetching settings from firestore:", error);
  }
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
