<template>
  <h1>Match Schedule</h1>
  <div v-if="error" class="error-message">{{ error }}</div>
  <table>
    <thead>
    <tr>
      <th>Match#</th>
      <th>Red 1</th>
      <th>Red 2</th>
      <th>Red 3</th>
      <th>Blue 1</th>
      <th>Blue 2</th>
      <th>Blue 3</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="match in matches" :key="match.id">
      <td>{{ match.id }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.red[0])">{{ match.red[0] }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.red[1])">{{ match.red[1] }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.red[2])">{{ match.red[2] }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.blue[0])">{{ match.blue[0] }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.blue[1])">{{ match.blue[1] }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.blue[2])">{{ match.blue[2] }}</td>
      <td class="clickable-team" @click="summarizeMatch(match.id)"> Match Summary </td>
    </tr>
  </tbody>
  </table>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase.js';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

const matches = ref([]);
const error = ref(null);
const userId = ref(null);
const router = useRouter();

let unsubscribeSchedule = null;
let unsubscribeAuth = null;
const eventCode = 'scout-training';

function setupScheduleListener() {
  // Ensure we don't create duplicate listeners if this function is ever called again.
  if (unsubscribeSchedule) unsubscribeSchedule();

  const scheduleRef = collection(db, 'competitions', eventCode, 'schedule');
  const q = query(scheduleRef, orderBy('matchNumber', 'asc'));

  unsubscribeSchedule = onSnapshot(q, (querySnapshot) => {
    // For debugging: log when a snapshot is received and its source.
    console.log(
      `Schedule snapshot received. From cache: ${querySnapshot.metadata.fromCache}, Documents: ${querySnapshot.size}`
    );
    if (querySnapshot.empty) {
      matches.value = [];
      error.value = "No match data found. You may need to refresh the schedule from the settings.";
    } else {
      error.value = null;
      matches.value = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    }
  }, (err) => {
    console.error("Firestore read failed:", err);
    error.value = "Failed to load match schedule. " + err.message;
  });
}

onMounted(() => {
  const auth = getAuth();
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid;
      // Now that we have an authenticated user, set up the listener.
      setupScheduleListener();
    } else {
      // Handle user logging out
      userId.value = null;
      if (unsubscribeSchedule) unsubscribeSchedule();
      matches.value = [];
      error.value = "You must be logged in to view the schedule.";
    }
  });
});

onUnmounted(() => {
  if (unsubscribeSchedule) {
    unsubscribeSchedule();
  }
  if (unsubscribeAuth) {
    unsubscribeAuth();
  }
});

async function scoutTeam(matchNumber, teamNumber) {
  if (!userId.value) {
    error.value = "You must be logged in to scout a match.";
    return;
  }
  if (!teamNumber) {
    // Don't do anything if the team number is not assigned yet in the schedule.
    return;
  }

  error.value = null;

  try {

    // Navigate to the scouting form for the specific team.
    router.push({ name: 'scout-form', params: { event: eventCode, match: matchNumber, team: teamNumber } });
  } catch (err) {
    console.error("Failed to navigate to scouting form:", err);
    error.value = `Failed to prepare for scouting: ${err.message}`;
  }
}

async function summarizeMatch(matchNumber) {
  if (!userId.value) {
    error.value = "You must be logged in to summarize a match.";
    return;
  }
  if (!matchNumber) {
    // Don't do anything if the team number is not assigned yet in the schedule.
    return;
  }
    // Navigate to the scouting form for the specific team.
  router.push({ name: 'match-summary', params: { event: eventCode, match: matchNumber } });
}
</script>
<style scoped>
.error-message {
  color: #d32f2f; /* A nice red color for errors */
  background-color: #ffcdd2; /* A light red background */
  border: 1px solid #d32f2f;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.clickable-team {
  cursor: pointer;
  text-decoration: underline;
  color: blue;
}
</style>
