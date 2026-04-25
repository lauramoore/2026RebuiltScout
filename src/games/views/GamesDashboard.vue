<script setup>
import { RouterLink } from 'vue-router';

</script>

<template>
  <div>
    <h1>Games</h1>
    <nav>
      <RouterLink :to="{ name: 'games-captains', params: { event: 'MILSTEIN' } }">
        Alliance Captains
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin-top: 1rem;
}
nav a {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
}
nav a:hover {
  background-color: #e0e0e0;
}
</style>
