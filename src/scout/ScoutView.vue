<template>
  <div v-if="error" class="error-message">{{ error }}</div>
  <div v-else>
    <header>
      <h1>Match #{{ route.params.match }} Team #{{ route.params.team }}</h1>
      <nav>
        <!-- Use named routes for robust navigation -->
        <router-link :to="{ name: 'scout-auton', params: route.params }">Auton</router-link>
        <router-link :to="{ name: 'scout-teleop', params: route.params }">Teleop</router-link>
        <router-link :to="{ name: 'scout-endgame', params: route.params }">Endgame</router-link>
        <router-link :to="{ name: 'scout-observations', params: route.params }">Observations</router-link>
      </nav>
    </header>

    <form @submit.prevent="saveScoutData">
      <!--
        The router will render the correct component here (ScoutAuton, ScoutTeleop, etc.).
        We use the v-slot API to pass the correct v-model to the rendered component.
      -->
      <router-view v-slot="{ Component }">
        <component :is="Component" v-model="currentModel" />
      </router-view>

      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../firebase.js';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Components are now loaded by the router, so direct imports are no longer needed.

const route = useRoute();
const router = useRouter();

const formData = reactive({
  auton: {},
  teleop: {},
  endgame: {},
  observations: { categories: [], notes: '' }
});
const error = ref(null);
const isSaving = ref(false);
const userId = ref(null);

let docRef = null;
let unsubscribeDoc = null;
let authUnsubscribe = null;

// This computed property determines which part of the form is currently active
// based on the route name.
const currentSection = computed(() => {
  const routeName = String(route.name || '');
  if (routeName.startsWith('scout-auton')) return 'auton';
  if (routeName.startsWith('scout-teleop')) return 'teleop';
  if (routeName.startsWith('scout-endgame')) return 'endgame';
  if (routeName.startsWith('scout-observations')) return 'observations';
  return null;
});

// This computed property with a getter and setter acts as the v-model
// for the currently active component rendered by <router-view>.
const currentModel = computed({
  get() {
    if (currentSection.value) {
      // Return the data for the current section, or a default empty object if it's falsy.
      return formData[currentSection.value] || {};
    }
    return {};
  },
  set(value) {
    if (currentSection.value) {
      formData[currentSection.value] = value;
    }
  }
});

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

<style scoped>
/* Add some basic styling for the nav links to look like tabs */
nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
nav a {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 4px;
}
nav a.router-link-active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}
.error-message {
  color: red;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
