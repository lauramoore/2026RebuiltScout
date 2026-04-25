<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import TeamPickList from '../components/TeamPickList.vue';
import { db } from '../../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const route = useRoute();
const eventCode = computed(() => route.params.event || 'MILSTEIN');

const allTeams = ref([]);
const selectedTeams = ref(Array(8).fill(null));
const loading = ref(true);
const error = ref(null);

// Fetch all teams for the event and any saved picklist
async function fetchData() {
  if (!eventCode.value) {
    error.value = "No event specified in the URL. Please navigate from a schedule page.";
    loading.value = false;
    allTeams.value = [];
    return;
  }
  loading.value = true;
  error.value = null;

  try {
    const eventDocRef = doc(db, 'competitions', eventCode.value);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const data = eventDoc.data();
      if (data.teams && data.teams.length > 0) {
        // Sort teams by team number for a consistent dropdown order
        allTeams.value = [...data.teams].sort((a, b) => a.teamNumber - b.teamNumber);
      } else {
        error.value = "No teams found for this event. Please import teams from the Settings page.";
      }

      // Load saved picklist if it exists
      if (data.picklist && Array.isArray(data.picklist)) {
        selectedTeams.value = Array.from({ length: 8 }, (_, i) => data.picklist[i] || null);
      } else {
        // If no picklist, initialize with an empty array of 8 slots
        selectedTeams.value = Array(8).fill(null);
      }
    } else {
      error.value = "Event data not found. Please import teams and schedule from the Settings page.";
    }
  } catch (e) {
    console.error("Error fetching data:", e);
    error.value = `Failed to load team list: ${e.message}`;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
});

// Re-fetch data if the event parameter in the URL changes
watch(eventCode, (newEventCode, oldEventCode) => {
    if (newEventCode && newEventCode !== oldEventCode) {
        fetchData();
    }
});

async function savePicklist() {
  if (!eventCode.value) {
    alert("Cannot save, no event specified.");
    return;
  }
  try {
    const eventDocRef = doc(db, 'competitions', eventCode.value);
    await setDoc(eventDocRef, { picklist: selectedTeams.value }, { merge: true });
    alert("Picklist saved successfully!");
  } catch (e) {
    console.error("Error saving picklist:", e);
    alert(`Failed to save picklist: ${e.message}`);
  }
}
</script>

<template>
  <div class="alliance-selection">
    <h1>Alliance Selection Picklist</h1>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading">Loading teams...</div>
    <div v-else-if="allTeams.length > 0">
      <TeamPickList
        :key="eventCode"
        :all-teams="allTeams"
        :initial-selection="selectedTeams"
        @update:selection="selectedTeams = $event"
      />
      <button @click="savePicklist">Save Picklist</button>
    </div>
    <div v-else-if="!error">
      <p>No teams available to create a picklist.</p>
    </div>
  </div>
</template>

<style scoped>
.alliance-selection {
  padding: 20px;
}
.error-message {
  color: #d32f2f;
  background-color: #ffcdd2;
  border: 1px solid #d32f2f;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
button:hover {
  background-color: #3aa876;
}
</style>
