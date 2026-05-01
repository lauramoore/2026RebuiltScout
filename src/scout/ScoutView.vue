<template>
  <div v-if="error" class="error-message">{{ error }}</div>
  <div v-else>
    <h1>Match #{{ route.params.match }} Team #{{ route.params.team }}</h1>
    <header>
      <nav>
        <!-- Use named routes for robust navigation -->
        <router-link :to="{ name: 'scout-auton', params: route.params }">Auton</router-link>
        <router-link :to="{ name: 'scout-teleop', params: route.params }">Teleop</router-link>
        <router-link :to="{ name: 'scout-observations', params: route.params }">Observations</router-link>
      </nav>

    </header>

    <Penalties v-model="formData.penalties" />

    <!--
      The router will render the correct component here (ScoutAuton, ScoutTeleop, etc.).
      We use the v-slot API to pass the correct v-model to the rendered component.
    -->
    <router-view v-slot="{ Component }">
      <component :is="Component" v-model="currentModel" @done="finishAndSave" />
    </router-view>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, toRaw, watch } from 'vue';
import { useRoute, onBeforeRouteLeave, useRouter } from 'vue-router';
import { db, auth } from '../firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import Penalties from './components/Penalties.vue';

// Components are now loaded by the router, so direct imports are no longer needed.

const route = useRoute();
const router = useRouter();

const formData = reactive({
  auton: {},
  teleop: {},
  observations: { categories: [], notes: '' },
  penalties: {}
});
const error = ref(null);
const isSaving = ref(false);
const userId = ref(null);
const userName = ref(null);

let docRef = null;
let unsubscribeDoc = null;

// This computed property determines which part of the form is currently active
// based on the route name.
const currentSection = computed(() => {
  const routeName = String(route.name || '');
  if (routeName.startsWith('scout-auton')) return 'auton';
  if (routeName.startsWith('scout-teleop')) return 'teleop';
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
  // The route guard in main.js ensures that auth.currentUser is available here.
  const user = auth.currentUser;
  if (user) {
    userId.value = user.uid;
    userName.value = user.email;
    setupFirestoreListener();
  } else {
    // This case should not be reachable due to the route guard, but is a safe fallback.
    error.value = "Authentication error: No user found.";
  }
});

// Watch for changes in the current section (e.g., navigating from Auton to Teleop)
// and trigger a save. This is a more explicit way to handle saving on sub-navigation
// than using onBeforeRouteUpdate.
watch(currentSection, (newSection, oldSection) => {
  // We only want to save when leaving a section, not on the initial load.
  if (oldSection) {
    saveScoutData();
  }
});

// Save data when the user navigates away from the scouting page entirely.
onBeforeRouteLeave(async () => {
  const success = await saveScoutData();
  if (!success) {
    // If saving failed, ask the user if they really want to leave and lose changes.
    const answer = window.confirm(
      'Failed to save data. Are you sure you want to leave? Your recent changes might be lost.'
    );
    // If they click "Cancel", abort the navigation.
    if (!answer) return false;
  }
});

async function setupFirestoreListener() {
  if (!userId.value) return;

  try {
    const eventCode = route.params.event;
    const matchNumber = route.params.match;
    const teamNumber = route.params.team;
    const scoutRef = `${userId.value}_${teamNumber}`;



      docRef = doc(db, 'competitions', eventCode,
                            'matches', matchNumber,
                            'scouting', scoutRef  );

    unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
      // Ignore local changes to avoid overwriting form data while the user is typing.
      if (docSnap.metadata.hasPendingWrites) {
        return;
      }

      if (docSnap.exists()) {
        const remoteData = docSnap.data() || {};
        formData.auton = remoteData.auton || {};
        formData.teleop = remoteData.teleop || {};
        formData.observations = remoteData.observations || { categories: [], notes: '' };
        formData.penalties = remoteData.penalties || {};
      }
    }, (err) => {
      console.error("Error listening to scout document:", err);
      error.value = "Failed to load scouting data.";
    });
  } catch (err) {
    console.error("Error setting up Firestore listener:", err);
    error.value = `Failed to initialize scouting session: ${err.message}`;
  }
}

onUnmounted(() => {
  if (unsubscribeDoc) unsubscribeDoc();
});

async function finishAndSave() {
  const success = await saveScoutData();
  if (success) {
    router.push({ name: 'home' });
  }
  // If not successful, saveScoutData will set an error message for the user to see.
}

async function saveScoutData() {
  // Prevent concurrent saves if user clicks nav links quickly.
  if (isSaving.value) {
    return false;
  }
  if (!docRef) {
    error.value = "Cannot save, database connection not established.";
    return false;
  }
  isSaving.value = true;
  error.value = null;

  try {
    const dataToSave = {
      ...toRaw(formData),
      // Ensure these fields are always present on save
      team: route.params.team,
      match: route.params.match,
      scout_uid: userId.value,
      scout: userName.value,
      lastUpdated: new Date(),
    };
    // Always update the timestamp and merge with the existing document.
    await setDoc(docRef, dataToSave, { merge: true });
    return true; // Indicate success
    // Navigate back to the schedule after saving.
    // \\
    // router.back();
  } catch (err) {
    console.error("Error saving scout data:", err);
    error.value = `Failed to save data: ${err.message}`;
    return false; // Indicate failure
  } finally {
    isSaving.value = false;
  }
}
</script>

<style> /* Common form styles for scout components */
.form-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.form-group-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: start;
}
</style>

<style scoped>
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
previousCycle {
  margin: 1em;
}
nextCycle {
  margin: 1em;
}
addCyle {
  margin: 1em;
}

/* Responsive Navigation for Mobile */
@media screen and (max-width: 600px) {
  nav {
    /* Allow flex items to shrink if needed */
    justify-content: center;
    gap: 0.5rem;
  }

  nav a {
    padding: 0.5rem; /* Reduce padding to help items fit */
  }
}
</style>
