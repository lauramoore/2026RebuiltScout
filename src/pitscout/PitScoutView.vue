<template>
  <div class="pitscout-view-container">
    <h1>Pit Scout: Team {{ teamNumber }}</h1>
    <div v-if="error" class="error-message">{{ error }}</div>

    <form @submit.prevent="handleSubmit">
         <!-- Media Handling -->
      <fieldset>
        <legend>Robot Photo</legend>
        <div class="form-group">
          <label for="robot-photo">Capture or Upload Photo</label>
          <input type="file" id="robot-photo" accept="image/*" @change="handleFileChange" />
        </div>
        <div v-if="photoPreview" class="photo-preview">
          <img :src="photoPreview" alt="Robot photo preview" />
        </div>
      </fieldset>
      <!-- Core Data Points -->
      <fieldset>
        <legend>Hopper Dimensions</legend>
        <div class="form-group form-group-grid">
          <label for="height">Height (in):</label>
          <input type="number" id="height" max="999" v-model.number="formData.height" required step="0.1" />

          <label for="width">Width (in):</label>
          <input type="number" id="width"  max="999" v-model.number="formData.width" required step="0.1" />

          <label for="length">Length (in):</label>
          <input type="number" id="length"  max="999" v-model.number="formData.length" required step="0.1" />
        </div>
        <div class="form-group">
           <label for="description">Hopper Description</label>
          <textarea id="description" v-model="formData.hopperNotes" placeholder="e.g., The turret intake takes up about half the hopper capacity"></textarea>
        </div>
      </fieldset>
      <fieldset>
        <legend>Robot Weight</legend>
        <div class="form-group form-group-grid">
          <label for="weight">Weight (lbs):</label>
          <input type="number" id="weight"  max="999" v-model.number="formData.weight" required step="0.1" />
        </div>
      </fieldset>

      <!-- Hardcoded fields from template -->
      <fieldset>
        <legend>Robot Details</legend>
        <div class="form-group">
          <label for="fuelCapacity">What is your fuel capacity?</label>
          <input type="number" id="fuelCapacity" v-model.number="formData.fuelCapacity" required placeholder="e.g., 5" />
        </div>
        <div class="form-group">
          <label for="intakeTime">Intake time (seconds)</label>
          <input type="number" id="intakeTime" v-model.number="formData.intakeTime" placeholder="e.g., 2.5" step="0.1" />
        </div>
        <div class="form-group">
          <label for="shootingRate">Shooting/output rate (fuel per second)</label>
          <input type="number" id="shootingRate" v-model.number="formData.shootingRate" placeholder="e.g., 3" step="0.1" />
        </div>
        <div class="form-group">
          <label for="autonomousStrategies">Autonomous strategies</label>
          <textarea id="autonomousStrategies" v-model="formData.autonomousStrategies" placeholder="Describe your autonomous routines..."></textarea>
        </div>
        <div class="form-group">
          <label for="shooterType">Shooter Type</label>
          <select id="shooterType" v-model="formData.shooterType" required>
            <option :value="null" disabled>Please select one</option>
            <option>Fixed Shooter</option>
            <option>Hooded Shooter</option>
            <option>Turret</option>
          </select>
        </div>
        <div class="form-group">
          <label for="shootingLocation">If fixed/no turret: shooting location?</label>
          <input type="text" id="shootingLocation" v-model="formData.shootingLocation" placeholder="e.g., at hub base" />
        </div>
        <div class="form-group">
          <label for="climbDetails">Climb location, level, and time frame</label>
          <textarea id="climbDetails" v-model="formData.climbDetails" placeholder="e.g., Center, Level 3, in 15 seconds"></textarea>
        </div>
        <div class="form-group">
          <label for="driveTeamExperience">Drive team years/rating</label>
          <input type="text" id="driveTeamExperience" v-model="formData.driveTeamExperience" placeholder="e.g., 3 years, experienced" />
        </div>
        <div class="form-group">
          <label for="inactiveStyle">Describe your playstyle or strategy during the inactive periods?</label>
          <textarea id="inactiveStyle" v-model="formData.inactiveStyle" placeholder="e.g., We focus collecting in neutral zone and shooting into home zone"></textarea>
        </div>
        <div class="form-group">
          <label for="activeStyle">Describe your playstyle or strategy during the active periods?</label>
          <textarea id="activeStyle" v-model="formData.activeStyle" placeholder="e.g. We attempt to score 2 hoppers full collecting from the home zone"></textarea>
        </div>
        <div class="form-group">
          <label for="notes">Additional Notes</label>
          <textarea id="notes" v-model="formData.notes" placeholder="Any other important details..."></textarea>
        </div>
      </fieldset>

      <button type="submit" :disabled="isSubmitting" class="btn-primary">
        {{ isSubmitting ? 'Saving...' : 'Done' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { uploadRobotPhoto, uploadScoutData, loadExistingData, getFileUrl } from './pitScoutDataService.js';
import { auth } from '../firebase';

const route = useRoute();
const router = useRouter();

const teamNumber = route.params.team;
const eventCode = route.params.event;

const formData = reactive({
  height: null,
  width: null,
  length: null,
  weight: null,
  hopperNotes: '',
  fuelCapacity: null,
  intakeTime: null,
  shootingRate: null,
  autonomousStrategies: '',
  shooterType: null,
  shootingLocation: '',
  climbDetails: '',
  driveTeamExperience: '',
  inactiveStyle: '',
  activeStyle: '',
  notes: '',
});
const robotPhoto = ref(null);
const photoPreview = ref(null);
const isSubmitting = ref(false);
const error = ref(null);
const loadedData = ref(null); // To store the original loaded data

onMounted(() => {
  load();
});

async function load() {
  try {
    const data = await loadExistingData(teamNumber);
    loadedData.value = data;

    if (!data || Object.keys(data).length === 0) {
      console.log(`No existing data for team ${teamNumber}. Starting fresh.`);
      return;
    }

    // Populate the form with the loaded data.
    for (const key in formData) {
      if (data.hasOwnProperty(key)) {
        formData[key] = data[key];
      }
    }

    // Also load the photo preview from GCS via the service
    if (data.photoGcsPath) {
      try {
        photoPreview.value = await getFileUrl(data.photoGcsPath);
      } catch (urlError) {
        console.error("Error getting photo download URL:", urlError);
        error.value = "Failed to load existing robot photo preview.";
      }
    }
  } catch (e) {
      console.error('Error loading existing data:', e);
      error.value = 'Failed to load existing data.';
  }
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  robotPhoto.value = file;
  // Create a URL for the preview
  photoPreview.value = URL.createObjectURL(file);
}

async function handleSubmit() {
  if (!auth.currentUser) {
    error.value = "Authentication error. Please sign in again.";
    return;
  }
  // A photo is required, either existing or newly uploaded.
  if (!robotPhoto.value && !photoPreview.value) {
    error.value = "A robot photo is required.";
    return;
  }

  isSubmitting.value = true;
  error.value = null;

  try {
    // Start with existing photo data if it exists.
    let photoGcsPath = loadedData.value?.photoGcsPath;

    // 1. If a new photo was selected, upload it and get its new URL and path.
    if (robotPhoto.value) {
      const newPhotoGcsPath = await uploadRobotPhoto(eventCode, teamNumber, robotPhoto.value);
      photoGcsPath = newPhotoGcsPath;

    }

    // 2. Prepare the final JSON data object with a public photo URL
    const scoutData = {
      ...formData,
      teamNumber: teamNumber,
      scoutName: auth.currentUser.email,
      timestamp: new Date().toISOString(),
      photoGcsPath: photoGcsPath,
    };

    // 3. Upload the JSON data file to GCS
    await uploadScoutData(eventCode, teamNumber, scoutData);

    // 4. Success: Navigate back to the pit scout home
    router.push({ name: 'pitscout-home' });

  } catch (e) {
    console.error('Submission failed:', e);
    error.value = `Submission failed: ${e.message}`;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style>
.pitscout-view-container {
  padding: 1rem;
  margin: 0 auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

}

.form-group-grid {
  display: grid;
  /* Lays out label and input in two columns */
  grid-template-columns: auto 1fr;
  align-items: center;
  /* More space between rows, less between label and input */
  row-gap: 1.5rem;
  column-gap: 0.75rem;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  /* Add spacing between groups of controls within a fieldset */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

legend {
  padding: 0 0.5rem;
  font-weight: bold;
  color: #08794d;
}

/* Set a specific width for number inputs to fit about 3 digits */
form input[type="number"] {
  width: 40%;
}

.photo-preview img {
  max-width: 100%;
  height: auto;
  max-height: 300px;
  margin-top: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}

select, textarea, input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
