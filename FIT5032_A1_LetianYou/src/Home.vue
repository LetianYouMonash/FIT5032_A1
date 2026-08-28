<template>
  <div class="container text-center mt-5">
    <h1>Home Page</h1>

    <div class="row g-3 mt-4">
      <div class="col-12 col-md">
        <button class="btn btn-outline-primary w-100" @click="$emit('change-page', 'recycling')">
          Recycling & Reuse
        </button>
      </div>

      <div class="col-12 col-md">
        <button class="btn btn-outline-primary w-100" @click="$emit('change-page', 'map')">
          Map
        </button>
      </div>

      <div class="col-12 col-md">
        <button class="btn btn-outline-primary w-100" @click="$emit('change-page', 'learn')">
          Learn
        </button>
      </div>

      <div class="col-12 col-md">
        <button class="btn btn-outline-primary w-100" @click="$emit('change-page', 'news')">
          News
        </button>
      </div>

      <div class="col-12 col-md">
        <button class="btn btn-outline-primary w-100" @click="$emit('change-page', 'profile')">
          Profile
        </button>
      </div>
    </div>

    <button class="btn btn-secondary mt-4" @click="$emit('back-login')">Back to Login</button>
  </div>
</template>

<script setup>
defineEmits(['change-page', 'back-login'])
</script>
