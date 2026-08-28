<template>
  <Login
    v-if="currentPage === 'login'"
    :users="users"
    @register="currentPage = 'register'"
    @login-success="loginSuccess"
  />

  <Register
    v-else-if="currentPage === 'register'"
    :users="users"
    @register-user="addUser"
    @update-user="updateUser"
    @delete-user="deleteUser"
    @back-login="currentPage = 'login'"
  />

  <Home v-else-if="currentPage === 'home'" @change-page="changePage" @back-login="backToLogin" />

  <Recycling v-else-if="currentPage === 'recycling'" @back-home="currentPage = 'home'" />

  <Map v-else-if="currentPage === 'map'" @back-home="currentPage = 'home'" />

  <Learn v-else-if="currentPage === 'learn'" @back-home="currentPage = 'home'" />

  <News v-else-if="currentPage === 'news'" @back-home="currentPage = 'home'" />

  <Profile
    v-else-if="currentPage === 'profile'"
    :current-user="currentUser"
    @back-home="currentPage = 'home'"
  />
</template>

<script setup>
import { ref } from 'vue'

import Login from './Login.vue'
import Register from './Register.vue'
import Home from './Home.vue'
import Recycling from './Recycling.vue'
import Map from './Map.vue'
import Learn from './Learn.vue'
import News from './News.vue'
import Profile from './Profile.vue'

const currentPage = ref('login')

const users = ref([])

const currentUser = ref(null)

const addUser = (newUser) => {
  users.value.push(newUser)
}

const loginSuccess = (user) => {
  currentUser.value = user
  currentPage.value = 'home'
}

const changePage = (page) => {
  currentPage.value = page
}

const backToLogin = () => {
  currentUser.value = null
  currentPage.value = 'login'
}

const updateUser = ({ index, field, value }) => {
  users.value[index][field] = value
}

const deleteUser = (index) => {
  users.value.splice(index, 1)
}
</script>
