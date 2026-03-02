<script setup>
  import { RouterView } from 'vue-router';
  import { useRoute } from 'vue-router';
  import IconEcosystem from './components/icons/IconEcosystem.vue';
  import IconHome from './components/icons/IconHome.vue';

  const route = useRoute();
</script>

<template>
  <header>
     <router-link class="nav-button" :to="route.params.event ? { name: 'home', params: { event: route.params.event } } : '/'">
        <IconHome />
        Home
      </router-link>
       <router-link class="nav-button" :to="route.params.event ? { name: 'pitscout', params: { event: route.params.event } } : '/pitscout'">
        <IconEcosystem />
          Pit Scout
      </router-link>
  </header>
  <RouterView />
</template>
<style>
header {
  line-height: 1.5;
  display: flex;
  gap: 1rem;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.nav-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #42b983;
  border-radius: 4px;
  text-decoration: none;
  color: white;
  background-color: #42b983;
}

.home-button:hover {
  background-color: #3aa873;
  border-color: #3aa873;
}

.home-icon {
  width: 1.2em;
  height: 1.2em;
  fill: currentColor;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
