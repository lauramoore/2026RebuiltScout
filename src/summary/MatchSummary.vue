<template>
  <div class="match-summary">
    <h1>Match Summary: {{ matchId }}</h1>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="loading" class="loading">Loading scouting records...</div>

    <table v-else>
      <thead>
        <tr>
          <th>Team Number</th>
          <th>Scouters</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in scoutingRecords" :key="record.team">
          <td>{{ record.team }}</td>
          <td>{{ record.scouters.join(', ') }}</td>
        </tr>
        <tr v-if="scoutingRecords.length === 0">
          <td colspan="2">No scouting records found for match. {{ matchId }}</td>
        </tr>
      </tbody>
    </table>

    <button @click="calculate" class="back-button">Store</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute} from 'vue-router';
import { db } from '../firebase.js';
import { collection, query, getDocs } from 'firebase/firestore';

const route = useRoute();

const competitionId = route.params.event;
const matchId = route.params.match;

const scoutingRecords = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchScoutingRecords = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Query the 'scouting' collection for records matching this competition and match
    const scoutingRef = collection(db,
                       'competitions', competitionId,
                       'matches', matchId, 'scouting');
    const q = query(scoutingRef);

    const querySnapshot = await getDocs(q);
    const groupedRecords = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!groupedRecords[data.team]) {
        groupedRecords[data.team] = {
          team: data.team,
          scouters: []
        };
      }
      groupedRecords[data.team].scouters.push(data.scout);
    });
    scoutingRecords.value = Object.values(groupedRecords);
  } catch (err) {
    console.error("Error fetching scouting records:", err);
    error.value = "Failed to load scouting records.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchScoutingRecords();
});

async function calculate() {
  console.log("TODO trigger summary action")
}

</script>
