<template>
  <div v-if="error" class="error-message">{{ error }}</div>
  <div v-else>
    <h1>Match #{{ route.params.match }} Team #{{ route.params.team }}</h1>
    <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
    <form @submit.prevent="saveScoutData">
      <!-- Assuming these components use v-model to bind to the formData properties -->
      <ScoutAuton v-model="formData.auton" />
      <ScoutTeleop v-model="formData.teleop" />
      <ScoutEndgame v-model="formData.endgame" />
      <ScoutObservations v-model="formData.observations" />
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../firebase.js';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import ScoutAuton from './components/ScoutAuton.vue';
import ScoutTeleop from './components/ScoutTeleop.vue';
import ScoutEndgame from './components/ScoutEndgame.vue';
import ScoutObservations from './components/ScoutObservations.vue';

const route = useRoute();
const router = useRouter();

const formData = reactive({
  auton: {},
  teleop: {},
  endgame: {}
});
const error = ref(null);
const isSaving = ref(false);
const userId = ref(null);

let docRef = null;
let unsubscribeDoc = null;
let authUnsubscribe = null;

onMounted(() => {
  const auth = getAuth();
  authUnsubscribe = onAuthStateChanged(auth, user => {
    if (user) {
      userId.value = user.uid;
      setupFirestoreListener();
    } else {
      // This should not happen due to the route guard, but handle it just in case.
      error.value = "You must be logged in to scout.";
      userId.value = null;
      if (unsubscribeDoc) unsubscribeDoc();
    }
  });
});

function setupFirestoreListener() {
  if (!userId.value) return;

  const eventCode = 'gadal2026';
  const matchNumber = route.params.match;
  const teamNumber = route.params.team;

  docRef = doc(db, 'users', userId.value, eventCode, matchNumber);

  unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const teamData = docSnap.data()?.[`scoutingData.${teamNumber}`] || {};
      // Merge data to avoid overwriting the reactive object
      Object.assign(formData, teamData);
    }
  }, (err) => {
    console.error("Error listening to scout document:", err);
    error.value = "Failed to load scouting data.";
  });
}

onUnmounted(() => {
  if (authUnsubscribe) authUnsubscribe();
  if (unsubscribeDoc) unsubscribeDoc();
});

async function saveScoutData() {
  if (!docRef) {
    error.value = "Cannot save, database connection not established.";
    return;
  }
  isSaving.value = true;
  error.value = null;

  try {
    const teamNumber = route.params.team;
    // Use dot notation to update only the data for this team.
    await updateDoc(docRef, {
      [`scoutingData.${teamNumber}`]: formData
    });
    // Navigate back to the schedule after saving.
    router.back();
  } catch (err) {
    console.error("Error saving scout data:", err);
    error.value = `Failed to save data: ${err.message}`;
  } finally {
    isSaving.value = false;
  }
}
</script>
