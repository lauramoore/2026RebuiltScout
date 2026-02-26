<script setup>
  import { RouterView } from 'vue-router';
  import { useRoute } from 'vue-router';

  const route = useRoute();
</script>

<template>
  <header>
     <router-link class="home-button" :to="route.params.event ? { name: 'home', params: { event: route.params.event } } : '/'">
        <svg class="home-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
        </svg>
        Home
      </router-link>
  </header>
  <RouterView />
</template>
<style>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
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

  nav {
    width: auto;
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
