<template>
  <div>
    <RouterLink :to="{ name: 'home' }">Back to Match Schedule</RouterLink>
    <h1>Scouting Match {{ route.params.match }} for Team {{ route.params.team }}</h1>
    <!-- Scouting form will go here -->
  </div>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router';

const route = useRoute();
</script>
