
<template>
  <a class="skip-link" href="#main-content">
    Skip to main content
  </a>

  <p
    v-if="sessionError"
    class="alert alert-warning m-3"
    role="alert"
  >
    {{ sessionError }}
  </p>

  <p
    class="visually-hidden"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {{ pageAnnouncement }}
  </p>

  <!-- Shared navigation: all authenticated pages except Home -->
  <header
    v-if="!loadingSession && currentUser && currentPage !== 'home' && currentPage !== 'login'"
    class="site-header"
  >
    <div class="container">
      <div class="nav-top">
        <button
          type="button"
          class="site-brand site-brand-button"
          aria-label="Recycling Application - Go to Home"
          @click="changePage('home')"
        >
          <span class="brand-icon" aria-hidden="true">🌿</span>
          <span>Recycling Application</span>
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary btn-sm logout-button"
          :disabled="loggingOut"
          @click="backToLogin"
        >
          {{ loggingOut ? 'Logging out...' : 'Log Out' }}
        </button>
      </div>

      <nav class="site-navigation" aria-label="Main navigation">
        <button
          v-for="item in navigationItems"
          :key="item.page"
          type="button"
          class="nav-item-button"
          :class="{ active: currentPage === item.page }"
          :aria-current="currentPage === item.page ? 'page' : undefined"
          @click="changePage(item.page)"
        >
          {{ item.label }}
        </button>

        <button
          v-if="currentUser.role === 'admin'"
          type="button"
          class="nav-item-button admin-nav-button"
          :class="{ active: currentPage === 'admin' }"
          :aria-current="currentPage === 'admin' ? 'page' : undefined"
          @click="changePage('admin')"
        >
          Admin
        </button>
      </nav>
    </div>
  </header>

  <main id="main-content" ref="mainElement" tabindex="-1">
    <p
      v-if="loadingSession"
      class="container py-5"
      role="status"
    >
      Checking your session...
    </p>

    <FirebaseLogin
      v-else-if="currentPage === 'login'"
      @login-success="loginSuccess"
    />

    <Home
      v-else-if="currentUser && currentPage === 'home'"
      :is-admin="currentUser?.role === 'admin'"
      @change-page="changePage"
      @back-login="backToLogin"
    />

    <Recycling
      v-else-if="currentUser && currentPage === 'recycling'"
      :current-user="currentUser"
      :get-rating-summary="ratingService.getRatingSummary"
      :save-rating="ratingService.saveRating"
      @back-home="changePage('home')"
    />

    <Map
      v-else-if="currentUser && currentPage === 'map'"
      @back-home="changePage('home')"
    />

    <Learn
      v-else-if="currentUser && currentPage === 'learn'"
      @back-home="changePage('home')"
    />

    <News
      v-else-if="currentUser && currentPage === 'news'"
      @back-home="changePage('home')"
    />

    <Email
      v-else-if="currentUser && currentPage === 'email'"
      :current-user="currentUser"
      @back-home="changePage('home')"
    />

    <Profile
      v-else-if="currentUser && currentPage === 'profile'"
      :current-user="currentUser"
      @profile-updated="handleProfileUpdated"
      @back-home="changePage('home')"
    />

    <Admin
      v-else-if="currentUser?.role === 'admin' && currentPage === 'admin'"
      :get-accounts="getAccounts"
      :delete-account="deleteAccount"
      @back-home="changePage('home')"
    />
  </main>
  <!-- Back to Top -->
  <button
    v-if="showBackToTop"
    type="button"
    class="back-to-top"
    aria-label="Back to top"
    title="Back to top"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'

import FirebaseLogin from './FirebaseLogin.vue'

import {
  observeFirebase,
  firebaseLogout,
  firebaseError,
} from './firebaseAuth.js'

import { getAccounts, deleteAccount } from './accountsApi.js'
import { ratingService } from './ratingsApi.js'

import Home from './Home.vue'
import Recycling from './Recycling.vue'
import Map from './Map.vue'
import Learn from './Learn.vue'
import News from './News.vue'
import Email from './Email.vue'
import Profile from './Profile.vue'
import Admin from './Admin.vue'

const currentUser = ref(null)
const currentPage = ref('login')
const loadingSession = ref(true)
const sessionError = ref('')
const mainElement = ref(null)
const pageAnnouncement = ref('')
const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 250
}

const scrollToTop = () => {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  window.scrollTo({
    top: 0,
    behavior: reduceMotion ? 'instant' : 'smooth',
  })
}
const loggingOut = ref(false)

const navigationItems = [
  { page: 'home', label: 'Home' },
  { page: 'recycling', label: 'Recycling' },
  { page: 'map', label: 'Map' },
  { page: 'learn', label: 'Learn' },
  { page: 'news', label: 'News' },
  { page: 'email', label: 'Email' },
  { page: 'profile', label: 'Profile' },
]

const pageNames = {
  login: 'Login',
  home: 'Home',
  recycling: 'Recycling',
  map: 'Recycling Location Map',
  learn: 'Learn',
  news: 'News',
  email: 'Email',
  profile: 'Profile',
  admin: 'Admin',
}

let unsubscribe
let disposed = false

watch(
  [currentPage, loadingSession],
  async ([page, loading], [previousPage, previousLoading]) => {
    if (loading) {
      document.title = 'Loading | Recycling Application'
      return
    }

    document.title = `${pageNames[page] || 'Home'} | Recycling Application`

    pageAnnouncement.value = `${pageNames[page] || 'Home'} page loaded`

    if (page !== previousPage && !previousLoading) {
      await nextTick()

      if (!disposed) {
        mainElement.value?.focus({ preventScroll: true })
      }
    }
  },
  { immediate: true, flush: 'post' },
)

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  try {
    const stop = await observeFirebase(
      (user) => {
        if (user) {
          if (currentUser.value?.id === user.id) {
            currentUser.value = user
            sessionError.value = ''
          } else {
            loginSuccess(user)
          }
        } else {
          currentUser.value = null
          currentPage.value = 'login'
        }

        loadingSession.value = false
      },
      (error) => {
        sessionError.value = firebaseError(error)
        loadingSession.value = false
      },
    )

    if (disposed) {
      stop()
    } else {
      unsubscribe = stop
    }
  } catch (error) {
    sessionError.value = firebaseError(error)
    loadingSession.value = false
  }
})

onUnmounted(() => {
  disposed = true
  unsubscribe?.()
  window.removeEventListener('scroll', handleScroll)
})

const loginSuccess = (user) => {
  sessionError.value = ''
  currentUser.value = user
  currentPage.value = 'home'
}

const handleProfileUpdated = (updatedUser) => {
  if (
    updatedUser &&
    currentUser.value?.id === updatedUser.id
  ) {
    currentUser.value = updatedUser
  }
}

const changePage = (page) => {
  const publicPages = [
    'home',
    'recycling',
    'map',
    'learn',
    'news',
    'profile',
    'email',
  ]

  const allowed =
    publicPages.includes(page) ||
    (page === 'admin' && currentUser.value?.role === 'admin')

  currentPage.value =
    currentUser.value && allowed
      ? page
      : currentUser.value
        ? 'home'
        : 'login'
}

const backToLogin = async () => {
  if (loggingOut.value) return

  loggingOut.value = true

  try {
    if (currentUser.value?.provider === 'firebase') {
      await firebaseLogout()
    }

    currentUser.value = null
    currentPage.value = 'login'
    sessionError.value = ''
  } catch (error) {
    sessionError.value = firebaseError(error)
  } finally {
    loggingOut.value = false
  }
}
</script>

<style>
/* Global theme */
:root {
  --app-primary: #198754;
  --app-primary-dark: #166534;
  --app-background: #f8faf9;
  --app-surface: #ffffff;
  --app-border: #e2e8e5;
}

body {
  background-color: var(--app-background);
  color: #25352c;
}

.btn-primary {
  background-color: var(--app-primary);
  border-color: var(--app-primary);
}

.btn-primary:hover,
.btn-primary:focus-visible {
  background-color: var(--app-primary-dark);
  border-color: var(--app-primary-dark);
}

.btn-outline-primary {
  color: var(--app-primary-dark);
  border-color: var(--app-primary);
}

.btn-outline-primary:hover {
  background-color: var(--app-primary);
  border-color: var(--app-primary);
  color: #ffffff;
}

.card {
  border-color: var(--app-border);
  border-radius: 14px;
}

/* Shared navigation */
.site-header {
  background: #ffffff;
  border-bottom: 1px solid var(--app-border);
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.035);
}

.nav-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 0 12px;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--app-primary-dark);
  font-size: 1.15rem;
  font-weight: 700;
}

.site-brand-button {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  margin-left: -14px;
  min-height: 56px;
  cursor: pointer;
  text-align: left;
}

.site-brand-button:hover {
  background: #e8f5e9;
  color: #14532d;
}

.brand-icon {
  font-size: 2rem;
  line-height: 1;
}

.logout-button {
  flex-shrink: 0;
}

.site-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 0 14px;
}

.nav-item-button {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 9px;
  padding: 9px 15px;
  color: #425448;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-item-button:hover {
  background: #e8f5e9;
  color: var(--app-primary-dark);
}

.nav-item-button.active {
  background: #e0f2e4;
  color: #14532d;
  border-color: #a6d6b0;
}

.admin-nav-button {
  color: #a12b2b;
}

.admin-nav-button:hover,
.admin-nav-button.active {
  background: #fff0f0;
  color: #922020;
  border-color: #edc4c4;
}

/* Back to Top */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;

  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;

  background: #198754;
  color: #ffffff;

  font-size: 28px;
  font-weight: 700;
  line-height: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);

  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.back-to-top:hover {
  background: #166534;
  transform: translateY(-3px);
}

.back-to-top:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 3px;
}

@media (max-width: 576px) {
  .back-to-top {
    right: 16px;
    bottom: 16px;
    width: 46px;
    height: 46px;
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top {
    transition: none;
  }

  .back-to-top:hover {
    transform: none;
  }
}

/* Accessibility */
.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 9999;
  padding: 12px 18px;
  background: #ffffff;
  color: #111827;
  border: 3px solid #111827;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  transform: translateY(-180%);
}

.skip-link:focus,
.skip-link:focus-visible {
  transform: translateY(0);
}

#main-content:focus {
  outline: none;
}

:where(button, a, input, select, textarea, [tabindex]):focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 3px;
}

@media (max-width: 576px) {
  .site-brand {
    font-size: 1rem;
  }

  .nav-top {
    padding-top: 14px;
  }

  .site-navigation {
    gap: 5px;
  }

  .nav-item-button {
    padding: 8px 11px;
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
