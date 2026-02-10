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
      <td>{{ match.matchNumber }}</td>
      <td class="clickable-team" @click="scoutTeam(match.id, match.red[0])">{{ match.red[0] }}</td>
      <td class="clickable-team" @click="scoutTeam(match, match.red[1])">{{ match.red[1] }}</td>
      <td class="clickable-team" @click="scoutTeam(match, match.red[2])">{{ match.red[2] }}</td>
      <td class="clickable-team" @click="scoutTeam(match, match.blue[0])">{{ match.blue[0] }}</td>
      <td class="clickable-team" @click="scoutTeam(match, match.blue[1])">{{ match.blue[1] }}</td>
      <td class="clickable-team" @click="scoutTeam(match, match.blue[2])">{{ match.blue[2] }}</td>
    </tr>
  </tbody>
  </table>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase.js';
import { query, collection, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

const matches = ref([]);
const error = ref(null);
const userId = ref(null);
const router = useRouter();

let unsubscribe = null;
let authUnsubscribe = null;

onMounted(() => {
  const scheduleRef = collection(db, 'competitions', 'gadal2026', 'schedule');
  const q = query(scheduleRef, orderBy('matchNumber', 'asc'));

  unsubscribe = onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
      matches.value = [];
      error.value = "No match data found. You may need to refresh the schedule from the settings.";
    } else {
      error.value = null;
      matches.value = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    }
  }, (err) => {
    console.error("Firestore read failed:", err);
    error.value = "Failed to load match schedule. " + err;
  });

  const auth = getAuth();
  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid;
    } else {
      userId.value = null;
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
  if (authUnsubscribe) {
    authUnsubscribe();
  }
});

async function scoutTeam(match, teamNumber) {
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
    const eventCode = 'gadal2026';
    const docRef = doc(db, 'users', userId.value, eventCode, String(match.matchNumber));
    // Create document with match details if it doesn't exist, or merge if it does.
    // Ensure a document for the match exists. This will hold scouting data for all teams.
    // Using { merge: true } prevents overwriting existing scouting data for other teams.
    await setDoc(docRef, { ...match }, { merge: true });
    // Navigate to the scouting form for the specific team.
    router.push({ name: 'scout-form', params: { match: match.matchNumber, team: teamNumber } });
  } catch (err) {
    console.error("Failed to create match scout document:", err);
    error.value = `Failed to prepare for match scouting: ${err.message}`;
    console.error("Failed to prepare for team scouting:", err);
    error.value = `Failed to prepare for scouting: ${err.message}`;
  }
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
