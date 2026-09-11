<template>
  <Login
    v-if="currentPage === 'login'"
    :authenticate="authenticate"
    @register="currentPage = 'register'"
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
    :get-rating-summary="getRatingSummary"
    :get-user-rating="getUserRating"
    :save-rating="saveRating"
    @back-home="currentPage = 'home'"
  />

  <Map v-else-if="currentUser && currentPage === 'map'" @back-home="currentPage = 'home'" />

  <Learn v-else-if="currentUser && currentPage === 'learn'" @back-home="currentPage = 'home'" />

  <News v-else-if="currentUser && currentPage === 'news'" @back-home="currentPage = 'home'" />

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
import { ref } from 'vue'
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
import Profile from './Profile.vue'
import Admin from './Admin.vue'
import { getRatingSummary, getUserRating, saveRating } from './ratings.js'

const currentUser = ref(restoreSession())
const currentPage = ref(currentUser.value ? 'home' : 'login')

const loginSuccess = (user) => {
  currentUser.value = user
  currentPage.value = 'home'
}

const changePage = (page) => {
  const publicPages = ['home', 'recycling', 'map', 'learn', 'news', 'profile']
  const allowed =
    publicPages.includes(page) || (page === 'admin' && currentUser.value?.role === 'admin')
  currentPage.value = currentUser.value && allowed ? page : currentUser.value ? 'home' : 'login'
}

const backToLogin = () => {
  clearSession()
  currentUser.value = null
  currentPage.value = 'login'
}
</script>
