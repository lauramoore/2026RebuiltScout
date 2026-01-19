<template>
  <div id="firebaseui-auth-container"></div>
</template>

<script setup>
import { onMounted, inject } from 'vue';
import * as firebaseui from 'firebaseui';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

// Inject the firebaseAuth instance from app config or provide/inject
const firebaseAuth = inject('$auth');

onMounted(() => {
  if (!firebaseAuth) {
    console.error('firebaseAuth instance not found. Make sure it is provided.');
    return;
  }
  const ui = new firebaseui.auth.AuthUI(firebaseAuth);
  const uiConfig = {
    signInSuccessUrl: '/',
    signInOptions: [
      {
        provider: GoogleAuthProvider.PROVIDER_ID,
        providerName: 'Google',
        customParameters: {
          // Example: prompt: 'select_account'
        }
      },
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        providerName: 'Email',
        signInMethod: 'password'
      }
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    // tosUrl: 'http://localhost/test-tos',
    // privacyPolicyUrl: 'http://localhost/test-privacy',
  };
  ui.start('#firebaseui-auth-container', uiConfig);
});
</script>
