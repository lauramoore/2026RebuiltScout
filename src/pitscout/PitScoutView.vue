<template>
  <div class="pitscout-view-container">
    <h1>Pit Scout: Team {{ teamNumber }}</h1>
    <div v-if="loadingTemplate" class="loading">Loading form...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <form v-if="formTemplate" @submit.prevent="handleSubmit">
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

      <!-- Dynamic Fields from Template -->
      <fieldset>
        <legend>Robot Details</legend>
        <FormGenerator :template="formTemplate" v-model="formData.dynamic" />
      </fieldset>

      <!-- Media Handling -->
      <fieldset>
        <legend>Robot Photo</legend>
        <div class="form-group">
          <label for="robot-photo">Capture or Upload Photo</label>
          <input type="file" id="robot-photo" accept="image/*" @change="handleFileChange" required />
        </div>
        <div v-if="photoPreview" class="photo-preview">
          <img :src="photoPreview" alt="Robot photo preview" />
        </div>
      </fieldset>

      <button type="submit" :disabled="isSubmitting" class="btn-primary">
        {{ isSubmitting ? 'Submitting...' : 'Submit Scout Data' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from '../firebase';
import FormGenerator from './components/FormGenerator.vue';
import { getFormTemplate, uploadRobotPhoto, uploadScoutData } from './pitScoutDataService.js';

const route = useRoute();
const router = useRouter();

const teamNumber = route.params.team;
const eventCode = route.params.event;

const formTemplate = ref(null);
const formData = reactive({
  height: null,
  width: null,
  length: null,
  weight: null,
  hopperNotes: '',
  dynamic: {},
});
const robotPhoto = ref(null);
const photoPreview = ref(null);
const isSubmitting = ref(false);
const loadingTemplate = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const template = await getFormTemplate();

    // Initialize dynamic form data with null values to ensure reactivity
    template.fields.forEach(field => {
      formData.dynamic[field.name] = field.defaultValue !== undefined ? field.defaultValue : null;
    });
    formTemplate.value = template;

  } catch (e) {
    error.value = e.message;
    console.error(e);
  } finally {
    loadingTemplate.value = false;
  }
});

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
  isSubmitting.value = true;
  error.value = null;

  try {
    // 1. Upload photo and get its GCS path
    const photoGcsPath = await uploadRobotPhoto(eventCode, teamNumber, robotPhoto.value);

    // 2. Prepare the final JSON data object
    const scoutData = {
      teamNumber: teamNumber,
      scoutName: auth.currentUser.email,
      timestamp: new Date().toISOString(),
      photoGcsPath: photoGcsPath,
      ...formData,
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
  gap: 1.5rem;
}

.form-group-grid {
  display: grid;
  /* Lays out label and input in two columns */
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 1rem;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
}

legend {
  padding: 0 0.5rem;
  font-weight: bold;
  color: #a1bedb;
}

/* Set a specific width for number inputs to fit about 3 digits */
form input[type="number"] {
  width: 8ch;
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
</style>
