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
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.red1 } }">{{ match.red1 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.red2 } }">{{ match.red2 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.red3 } }">{{ match.red3 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.blue1 } }">{{ match.blue1 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.blue2 } }">{{ match.blue2 }}</router-link></td>
      <td><router-link :to="{ name: 'scout', params: { match: match.matchNumber, team: match.blue3 } }">{{ match.blue3 }}</router-link></td>
    </tr>
  </tbody>
  </table>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../../firebase.js';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';

const matches = ref([]);
const error = ref(null);

let unsubscribe = null;

onMounted(() => {
  const matchesCollection = collection(db, 'gadal2026');
  const q = query(matchesCollection, orderBy('matchNumber'));

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
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
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
</style>
