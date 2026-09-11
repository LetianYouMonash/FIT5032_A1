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
  />

  <Recycling
    v-else-if="currentUser && currentPage === 'recycling'"
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
</template>

<script setup>
import { ref } from 'vue'
import { registerAccount, authenticate, restoreSession, clearSession } from './auth.js'

import Login from './Login.vue'
import Register from './Register.vue'
import Home from './Home.vue'
import Recycling from './Recycling.vue'
import Map from './Map.vue'
import Learn from './Learn.vue'
import News from './News.vue'
import Profile from './Profile.vue'

const currentUser = ref(restoreSession())
const currentPage = ref(currentUser.value ? 'home' : 'login')

const loginSuccess = (user) => {
  currentUser.value = user
  currentPage.value = 'home'
}

const changePage = (page) => {
  const pages = ['home', 'recycling', 'map', 'learn', 'news', 'profile']
  currentPage.value = currentUser.value && pages.includes(page) ? page : 'login'
}

const backToLogin = () => {
  clearSession()
  currentUser.value = null
  currentPage.value = 'login'
}
</script>
