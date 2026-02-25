<script setup lang="ts">
definePageMeta({
  layout: false
})
const { $auth } = useNuxtApp();

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const fullName = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!isSignUp.value) {
    loading.value = true;

    $auth.loginWith('admin', {
      username: email.value,
      password: password.value,
    }).then(() => {
      loading.value = false;
      navigateTo({
        path: '/verify-2fa',
      })
    }).catch((error) => {
      loading.value = false;
      errorMessage.value = error?.message;
    })
  }
}

</script>
<template>
  <div class="auth-page">
    <div class="auth-container fade-in">
      <div class="logo-section">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.5"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="gradient-text">Secure Login</h1>
        <p class="subtitle">Two-factor authentication for enhanced security</p>
      </div>

      <div class="card">
        <div class="tabs">
          <button
              class="tab"
              :class="{ active: !isSignUp }"
              @click="isSignUp = false"
          >
            Sign In
          </button>
          <button
              class="tab"
              :class="{ active: isSignUp }"
              @click="isSignUp = true"
          >
            Sign Up
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div v-if="isSignUp" class="form-group">
            <label for="fullName">Full Name</label>
            <input
                id="fullName"
                v-model="fullName"
                type="text"
                class="input"
                placeholder="John Doe"
                required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
                id="email"
                v-model="email"
                type="email"
                class="input"
                placeholder="you@example.com"
                required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
                id="password"
                v-model="password"
                type="password"
                class="input"
                placeholder="••••••••"
                required
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button
              type="submit"
              class="btn btn-primary btn-full"
              :disabled="loading"
          >
            <span v-if="loading" class="loading">Processing...</span>
            <span v-else>{{ isSignUp ? 'Create Account' : 'Sign In' }}</span>
          </button>
        </form>
      </div>

      <div class="footer-text">
        <p>Protected by advanced security measures</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 220, 130, 0.1) 0%, transparent 70%);
  top: -250px;
  right: -250px;
  pointer-events: none;
}

.auth-page::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
  bottom: -200px;
  left: -200px;
  pointer-events: none;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  color: var(--color-primary);
}

.logo svg {
  width: 100%;
  height: 100%;
}

.logo-section h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: var(--color-bg-lighter);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.btn-full {
  width: 100%;
  margin-top: 0.5rem;
}

.footer-text {
  text-align: center;
  margin-top: 2rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .auth-page {
    padding: 1rem;
  }

  .logo-section h1 {
    font-size: 1.75rem;
  }
}
</style>
