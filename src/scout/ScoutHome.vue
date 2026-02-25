<template>
  <h1>Match Schedule</h1>
  <div v-if="error" class="error-message">{{ error }}</div>
  <table>
    <thead>
    <tr>
      <th>Match#</th>
      <th class="team-red">Red 1</th>
      <th class="team-red">Red 2</th>
      <th class="team-red">Red 3</th>
      <th class="team-blue">Blue 1</th>
      <th class="team-blue">Blue 2</th>
      <th class="team-blue">Blue 3</th>
      <th>Summary</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="match in matches" :key="match.id">
      <td>{{ match.id }}</td>
      <td class="clickable-team team-red" @click="scoutTeam(match.id, match.red[0])">{{ match.red[0] }}</td>
      <td class="clickable-team team-red" @click="scoutTeam(match.id, match.red[1])">{{ match.red[1] }}</td>
      <td class="clickable-team team-red" @click="scoutTeam(match.id, match.red[2])">{{ match.red[2] }}</td>
      <td class="clickable-team team-blue" @click="scoutTeam(match.id, match.blue[0])">{{ match.blue[0] }}</td>
      <td class="clickable-team team-blue" @click="scoutTeam(match.id, match.blue[1])">{{ match.blue[1] }}</td>
      <td class="clickable-team team-blue" @click="scoutTeam(match.id, match.blue[2])">{{ match.blue[2] }}</td>
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

/* General table styling */
table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

th, td {
  padding: 0.75rem;
  border: 1px solid #ddd;
}

thead th {
  background-color: #6c757d;
  color: white;
  font-weight: bold;
}

/* Alliance colors for header */
th.team-red {
  background-color: #c62828; /* Dark Red */
}

th.team-blue {
  background-color: #1565c0; /* Dark Blue */
}

/* Default (odd) row colors for alliance cells */
.team-red {
  background-color: #d32f2f;
  color: white;
}
.team-blue {
  background-color: #1976d2;
  color: white;
}

/* Alternating (even) row colors */
tbody tr:nth-child(even) {
  background-color: #f8f9fa; /* Light grey for non-team cells */
}
tbody tr:nth-child(even) .team-red {
  background-color: #ef5350; /* Lighter Red */
}
tbody tr:nth-child(even) .team-blue {
  background-color: #42a5f5; /* Lighter Blue */
}

.clickable-team {
  cursor: pointer;
  text-decoration: underline;
  color: #ffffff;
}

/* Remove underline from colored cells and make text bold */
.clickable-team.team-red,
.clickable-team.team-blue {
  text-decoration: none;
  font-weight: bold;
}

.clickable-team:hover {
  filter: brightness(1.15);
}
</style>
