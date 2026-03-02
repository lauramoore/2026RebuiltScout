<script setup>
import ScoutHome from '../scout/ScoutHome.vue'
</script>

<template>
  <aside>
    <router-link to="/settings" class="settings-button" title="Settings">
    </router-link>
  </aside>
  <main>
    <ScoutHome />
  </main>
</template>

<style scoped>

.settings-button {
  display: flex;
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--color-text);
}

.settings-button:hover {
  background-color: var(--color-background-soft);
}
</style>
