<template>
  <p v-if="sessionError" class="alert alert-warning m-3" role="alert">{{ sessionError }}</p>
  <p v-if="loadingSession" class="container py-5" role="status">Checking your session...</p>
  <Login
    v-else-if="currentPage === 'login'"
    :authenticate="authenticate"
    @register="currentPage = 'register'"
    @login-success="loginSuccess"
    @firebase="currentPage = 'firebase'"
  />

  <FirebaseLogin
    v-else-if="currentPage === 'firebase'"
    @back="currentPage = 'login'"
    @login-success="loginSuccess"
  />

  <Register
    v-else-if="currentPage === 'register'"
    :register-account="registerAccount"
    @back-login="currentPage = 'login'"
  />

  <Home
    v-else-if="currentUser && currentPage === 'home'"
    @change-page="changePage"
    @back-login="backToLogin"
    :is-admin="currentUser?.role === 'admin'"
  />

  <Recycling
    v-else-if="currentUser && currentPage === 'recycling'"
    :current-user="currentUser"
    :get-rating-summary="ratingService.getRatingSummary"
    :get-user-rating="ratingService.getUserRating"
    :save-rating="ratingService.saveRating"
    @back-home="currentPage = 'home'"
  />

  <Map v-else-if="currentUser && currentPage === 'map'" @back-home="currentPage = 'home'" />

  <Learn v-else-if="currentUser && currentPage === 'learn'" @back-home="currentPage = 'home'" />

  <News v-else-if="currentUser && currentPage === 'news'" @back-home="currentPage = 'home'" />

  <Email
    v-else-if="currentUser && currentPage === 'email'"
    :current-user="currentUser"
    @back-home="currentPage = 'home'"
  />

  <Profile
    v-else-if="currentUser && currentPage === 'profile'"
    :current-user="currentUser"
    @back-home="currentPage = 'home'"
  />

  <Admin
    v-else-if="currentUser?.role === 'admin' && currentPage === 'admin'"
    :get-accounts="getAccounts"
    :delete-account="deleteAccount"
    @back-home="currentPage = 'home'"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FirebaseLogin from './FirebaseLogin.vue'
import {
  observeFirebase,
  firebaseLogout,
  firebaseError,
  firebaseRatingStore,
} from './firebaseAuth.js'
import {
  registerAccount,
  authenticate,
  restoreSession,
  clearSession,
  getAccounts,
  deleteAccount,
} from './auth.js'

import Login from './Login.vue'
import Register from './Register.vue'
import Home from './Home.vue'
import Recycling from './Recycling.vue'
import Map from './Map.vue'
import Learn from './Learn.vue'
import News from './News.vue'
import Email from './Email.vue'
import Profile from './Profile.vue'
import Admin from './Admin.vue'
import { getRatingSummary, getUserRating, saveRating } from './ratings.js'

const currentUser = ref(restoreSession())
const currentPage = ref(currentUser.value ? 'home' : 'login')
const loadingSession = ref(true)
const sessionError = ref('')
const cloudRatings = firebaseRatingStore()
const ratingService = computed(() =>
  currentUser.value?.provider === 'firebase'
    ? cloudRatings
    : { getRatingSummary, getUserRating, saveRating },
)
let unsubscribe
let disposed = false
onMounted(async () => {
  try {
    const stop = await observeFirebase(
      (user) => {
        if (user) loginSuccess(user)
        else if (currentUser.value?.provider === 'firebase') {
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
    if (disposed) stop()
    else unsubscribe = stop
  } catch (error) {
    sessionError.value = firebaseError(error)
    loadingSession.value = false
  }
})
onUnmounted(() => {
  disposed = true
  unsubscribe?.()
})

const loginSuccess = (user) => {
  if (user.provider === 'firebase') clearSession()
  sessionError.value = ''
  currentUser.value = user
  currentPage.value = 'home'
}

const changePage = (page) => {
  const publicPages = ['home', 'recycling', 'map', 'learn', 'news', 'profile', 'email']
  const allowed =
    publicPages.includes(page) || (page === 'admin' && currentUser.value?.role === 'admin')
  currentPage.value = currentUser.value && allowed ? page : currentUser.value ? 'home' : 'login'
}

const backToLogin = async () => {
  try {
    if (currentUser.value?.provider === 'firebase') await firebaseLogout()
    clearSession()
    currentUser.value = null
    currentPage.value = 'login'
    sessionError.value = ''
  } catch (error) {
    sessionError.value = firebaseError(error)
  }
}
</script>
