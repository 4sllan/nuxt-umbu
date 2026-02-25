<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth', '_2fa']
})

const {$auth} = useNuxtApp();

const profile = ref<any>(null)
const loginTime = ref('')
const loading = ref(false)

const loadProfile = async () => {
  const user = {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@example.com'
  }

  if (!user) {
    navigateTo('/')
    return
  }

  profile.value = user;
}

const handleLogout = async () => {
  loading.value = true;

  $auth.logout('admin').then(() => {
    loading.value = false;
  })
}

onMounted(async () => {
  await loadProfile()

  const now = new Date()
  loginTime.value = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>
<template>
  <div class="welcome-page">
    <div class="welcome-container fade-in">
      <div class="welcome-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="gradient-text">Welcome!</h1>
        <p class="subtitle">You have successfully authenticated with 2FA</p>
      </div>

      <div class="card">
        <div class="user-info">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="user-details">
            <h2>{{ profile?.full_name || 'User' }}</h2>
            <p>{{ profile?.email }}</p>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Secure Authentication</h3>
            <p>Your account is protected with two-factor authentication</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Privacy First</h3>
            <p>Your data is encrypted and securely stored</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Fast & Modern</h3>
            <p>Built with cutting-edge technology for optimal performance</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Always Protected</h3>
            <p>Continuous monitoring and security updates</p>
          </div>
        </div>

        <div class="actions">
          <button
              class="btn btn-primary"
              @click="handleLogout"
              :disabled="loading"
          >
            <span v-if="loading" class="loading">Signing out...</span>
            <span v-else>Sign Out</span>
          </button>
        </div>
      </div>

      <div class="footer-info">
        <div class="info-item">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Logged in: {{ loginTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
}

.welcome-page::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 220, 130, 0.15) 0%, transparent 70%);
  top: -300px;
  right: -300px;
  pointer-events: none;
  animation: pulse-glow 4s ease-in-out infinite;
}

.welcome-page::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
  bottom: -250px;
  left: -250px;
  pointer-events: none;
  animation: pulse-glow 4s ease-in-out infinite 2s;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.welcome-container {
  width: 100%;
  max-width: 900px;
  position: relative;
  z-index: 1;
}

.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: var(--color-primary);
}

.logo svg {
  width: 100%;
  height: 100%;
}

.welcome-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.125rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-bg-lighter);
  border: 2px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.avatar svg {
  width: 50%;
  height: 50%;
}

.user-details h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.user-details p {
  color: var(--color-text-muted);
  font-size: 1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: var(--color-bg-lighter);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 220, 130, 0.1);
  border-color: var(--color-primary);
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.footer-info {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.info-item svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .welcome-header h1 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
