<template>
  <div class="login-container">
    <h1>Login to 2026 Rebuilt Scout</h1>
    <button @click="login">Sign in with Google</button>
  </div>
</template>

<script setup>
import {auth, authProvider} from '../firebase.js';
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const login = async () => {
  try {
    await signInWithPopup(auth, authProvider);
    router.push("/"); // Send them home after successful login
  } catch (error) {
    console.error("Login failed", error);
  }

};
</script>
