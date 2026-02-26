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

    <!--
      The router will render the correct component here (ScoutAuton, ScoutTeleop, etc.).
      We use the v-slot API to pass the correct v-model to the rendered component.
    -->
    <router-view v-slot="{ Component }">
      <component :is="Component" v-model="currentModel" />
    </router-view>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, toRaw } from 'vue';
import { useRoute, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';
import { db } from '../firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Components are now loaded by the router, so direct imports are no longer needed.

const route = useRoute();

const formData = reactive({
  auton: {},
  teleop: {},
  endgame: {},
  observations: { categories: [], notes: '' }
});
const error = ref(null);
const isSaving = ref(false);
const userId = ref(null);
const userName = ref(null);

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
      userName.value = user.email;
      setupFirestoreListener();
    } else {
      // This should not happen due to the route guard, but handle it just in case.
      error.value = "You must be logged in to scout.";
      userId.value = null;
      userName.value = null;
      if (unsubscribeDoc) unsubscribeDoc();
    }
  });
});

// Save data whenever the user navigates between scouting sections.
onBeforeRouteUpdate(async () => {
  // isSaving check in saveScoutData will prevent concurrent saves.
  await saveScoutData();
});

// Save data when the user navigates away from the scouting page entirely.
onBeforeRouteLeave(async () => {
  await saveScoutData();
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
      // Create document for each scouter_team so that different users can't overwrite each other
      //and will not have any document contention during scouting
      // We initialize the document with a full, empty structure.
      // Using { merge: true } prevents us from overwriting existing data if the user reloads the page.
      // This also helps satisfy security rules that might require certain fields to exist.
      const initialData = {
        team: teamNumber,
        match: matchNumber,
        scout: userName.value,
        lastUpdated: new Date(),
        auton: {
          preload: {},
        },
        teleop: {},
        endgame: {},
        observations: { categories: [], notes: '' },
        penalties:{}
      };
      await setDoc(docRef, initialData, { merge: true });

    unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() || {};
        formData.auton = remoteData.auton || {};
        formData.teleop = remoteData.teleop || {};
        formData.endgame = remoteData.endgame || {};
        formData.observations = remoteData.observations || { categories: [], notes: '' };
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
  if (authUnsubscribe) authUnsubscribe();
  if (unsubscribeDoc) unsubscribeDoc();
});

async function saveScoutData() {
  // Prevent concurrent saves if user clicks nav links quickly.
  if (isSaving.value) {
    return;
  }
  if (!docRef) {
    error.value = "Cannot save, database connection not established.";
    return;
  }
  isSaving.value = true;
  error.value = null;

  try {
    // Create a clean data object for Firestore.
    // toRaw() gets the plain object, and the JSON dance removes any 'undefined' values
    // that Firestore would reject.
    const dataToSave = JSON.parse(JSON.stringify(toRaw(formData)));
    // Always update the timestamp and merge with the existing document.
    await setDoc(docRef, {
      ...dataToSave,
      lastUpdated: new Date()
    }, { merge: true });
    // Navigate back to the schedule after saving.
    // \\
    // router.back();
  } catch (err) {
    console.error("Error saving scout data:", err);
    error.value = `Failed to save data: ${err.message}`;
  } finally {
    isSaving.value = false;
  }
}
</script>

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
