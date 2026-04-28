<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import TeamPickList from '../components/TeamPickList.vue';
import { db } from '../../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const eventCode = computed(() => route.params.event || 'MILSTEIN');

const userId = ref(null);
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
  if (!userId.value) {
    error.value = "You must be logged in to view or edit a picklist.";
    loading.value = false;
    allTeams.value = [];
    selectedTeams.value = Array(8).fill(null);
    return;
  }
  loading.value = true;
  error.value = null;

  try {
    // 1. Fetch all teams for the event to populate selection dropdowns
    const eventDocRef = doc(db, 'competitions', eventCode.value);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists() && eventDoc.data().teams?.length > 0) {
      // Sort teams by team number for a consistent dropdown order
      allTeams.value = [...eventDoc.data().teams].sort((a, b) => a.teamNumber - b.teamNumber);
    } else {
      error.value = "No teams found for this event. Please import teams from the Settings page.";
      allTeams.value = [];
      selectedTeams.value = Array(8).fill(null);
      loading.value = false;
      return;
    }

    // 2. Fetch the user's picklist
    const picklistDocRef = doc(db, 'captains', userId.value);
    const picklistDoc = await getDoc(picklistDocRef);

    if (picklistDoc.exists()) {
      const picklistData = picklistDoc.data();
      if (picklistData.teams && Array.isArray(picklistData.teams)) {
        // The saved picklist is an array of team numbers.
        // We need to map these numbers back to the full team objects for the TeamPickList component.
        const teamMap = new Map(allTeams.value.map(t => [t.teamNumber, t]));
        const loadedTeams = picklistData.teams.map(teamNumber => teamMap.get(teamNumber) || null);
        // Ensure the array is exactly 8 elements long, padding with null if needed.
        selectedTeams.value = Array.from({ length: 8 }, (_, i) => loadedTeams[i] || null);
      } else {
        selectedTeams.value = Array(8).fill(null);
      }
    } else {
      // No picklist document exists for this user yet.
      selectedTeams.value = Array(8).fill(null);
    }
  } catch (e) {
    console.error("Error fetching data:", e);
    error.value = `Failed to load data: ${e.message}`;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid;
      fetchData();
    } else {
      userId.value = null;
      error.value = "You must be logged in to manage a picklist.";
      loading.value = false;
      allTeams.value = [];
      selectedTeams.value = Array(8).fill(null);
    }
  });
});

// Re-fetch data if the event parameter in the URL changes
watch(eventCode, (newEventCode, oldEventCode) => {
    if (newEventCode && newEventCode !== oldEventCode) {
        fetchData();
    }
});

async function savePicklist() {
  if (!userId.value) {
    alert("Cannot save, you are not logged in.");
    return;
  }
  try {
    const picklistDocRef = doc(db, 'captains', userId.value);
    // Ensure we save exactly 8 elements, padding with null for empty slots.
    const teamNumbers = Array.from({ length: 8 }, (_, i) => {
        const team = selectedTeams.value[i];
        return team?.teamNumber ?? null;
    });
    await setDoc(picklistDocRef, { teams: teamNumbers });
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
