<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth'],
})

const route = useRoute()
const {$auth} = useNuxtApp();

const codeDigits = ref(['', '', '', '', '', ''])
const codeInputs = ref<HTMLInputElement[]>([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resendCooldown = ref(0)
const userId = computed(() => route.query.userId as string)

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value && /^\d$/.test(value)) {
    codeDigits.value[index] = value

    if (index < 5) {
      codeInputs.value[index + 1]?.focus()
    }
  } else {
    codeDigits.value[index] = ''
  }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    codeInputs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pasteData = event.clipboardData?.getData('text')

  if (pasteData && /^\d{6}$/.test(pasteData)) {
    const digits = pasteData.split('')
    codeDigits.value = digits
    codeInputs.value[5]?.focus()
  }
}

const handleVerify = async () => {
  const code = codeDigits.value.join('')

  if (code.length !== 6) {
    errorMessage.value = 'Please enter all 6 digits'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  $auth
      ._2fa('admin', code)
      .then((response) => {
        loading.value = false;
        successMessage.value = 'Verification successful! Redirecting...'
        setTimeout(() => {
          navigateTo('/welcome')
        }, 1500)
      }).catch((error) => {
    loading.value = false;
    errorMessage.value =
        errorMessage.value = error?.message || 'Invalid or expired code'
    codeDigits.value = ['', '', '', '', '', '']
    codeInputs.value[0]?.focus()
  })
}

const handleResend = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  await $autx('/api/admin/gerar_codigo', {
    method: 'POST',
  }).then((response) => {
    loading.value = false;

    successMessage.value = 'New code generated successfully!'
    resendCooldown.value = 30

    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)

  }).catch((error) => {
    errorMessage.value = error?.message || 'Failed to generate new code. Please try again.'
  })
}

onMounted(() => {
  codeInputs.value[0]?.focus()
})
</script>
<template>
  <div class="auth-page">
    <div class="auth-container fade-in">
      <div class="logo-section">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
        <h1 class="gradient-text">Two-Factor Authentication</h1>
        <p class="subtitle">Enter the 6-digit code to verify your identity</p>
      </div>

      <div class="card">
        <div class="code-info">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p>A 6-digit verification code has been generated. In a production environment, this would be sent via email
            or SMS.</p>
          <div class="demo-code">
            <strong>Demo Code (check console):</strong> The code is logged in the browser console
          </div>
        </div>

        <form @submit.prevent="handleVerify">
          <div class="form-group">
            <label for="code">Verification Code</label>
            <div class="code-input-container">
              <input
                  v-for="(digit, index) in codeDigits"
                  :key="index"
                  :ref="el => codeInputs[index] = el"
                  v-model="codeDigits[index]"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="code-input"
                  @input="handleInput(index, $event)"
                  @keydown="handleKeyDown(index, $event)"
                  @paste="handlePaste"
              />
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <button
              type="submit"
              class="btn btn-primary btn-full"
              :disabled="loading || codeDigits.some(d => !d)"
          >
            <span v-if="loading" class="loading">Verifying...</span>
            <span v-else>Verify Code</span>
          </button>

          <button
              type="button"
              class="btn btn-secondary btn-full"
              style="margin-top: 0.75rem"
              @click="handleResend"
              :disabled="loading || resendCooldown > 0"
          >
            {{ resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code' }}
          </button>
        </form>
      </div>

      <div class="footer-text">
        <button class="link-button" @click="navigateTo('/')">
          Back to login
        </button>
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
  left: -250px;
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
  right: -200px;
  pointer-events: none;
}

.auth-container {
  width: 100%;
  max-width: 540px;
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

.code-info {
  background: var(--color-bg-lighter);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.info-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 0.75rem;
  color: var(--color-secondary);
}

.info-icon svg {
  width: 100%;
  height: 100%;
}

.code-info p {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.demo-code {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.875rem;
}

.demo-code strong {
  color: var(--color-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.code-input-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.code-input {
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  background: var(--color-bg-lighter);
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.code-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.1);
}

.btn-full {
  width: 100%;
}

.footer-text {
  text-align: center;
  margin-top: 2rem;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 640px) {
  .auth-page {
    padding: 1rem;
  }

  .logo-section h1 {
    font-size: 1.5rem;
  }

  .code-input {
    width: 2.5rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  .code-input-container {
    gap: 0.375rem;
  }
}
</style>
