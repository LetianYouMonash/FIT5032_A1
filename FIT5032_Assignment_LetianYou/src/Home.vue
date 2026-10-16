
<template>
  <div class="home-page">
    <div class="container py-5">

      <!-- Welcome Section -->
      <section class="hero-section mb-5" aria-labelledby="welcome-title">
        <div class="row align-items-center g-4">
          <div class="col-lg-8">
            <span class="hero-label">
              🌿 RECYCLING APPLICATION
            </span>

            <h1 id="welcome-title" class="display-5 fw-bold mt-3 mb-3">
              Welcome to a
              <span class="text-success">Greener Future</span>
            </h1>

            <p class="lead text-secondary mb-4">
              Learn how to recycle smarter, discover recycling
              locations, and take small steps towards a more
              sustainable lifestyle.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <button
                type="button"
                class="btn btn-success btn-lg"
                @click="$emit('change-page', 'recycling')"
              >
                Explore Recycling →
              </button>

              <button
                type="button"
                class="btn btn-outline-success btn-lg"
                @click="$emit('change-page', 'map')"
              >
                Find Locations
              </button>
            </div>
          </div>

          <div class="col-lg-4 text-center">
            <div class="hero-illustration" aria-hidden="true">
              <span class="recycle-symbol">♻️</span>
              <p class="fw-semibold text-success mb-0">
                Reduce · Reuse · Recycle
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="mb-5" aria-labelledby="features-title">
        <div class="text-center mb-4">
          <h2 id="features-title" class="fw-bold">
            Explore Our Features
          </h2>
          <p class="text-secondary">
            Everything you need to start your recycling journey.
          </p>
        </div>

        <div class="row g-4">

          <!-- Recycling -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">♻️</div>
              <h3 class="h5 fw-bold">Recycling & Reuse</h3>
              <p class="text-secondary">
                Explore recycling information and share your
                experiences through ratings.
              </p>
              <button
                type="button"
                class="btn btn-outline-success mt-auto"
                @click="$emit('change-page', 'recycling')"
              >
                Explore Recycling →
              </button>
            </div>
          </div>

          <!-- Map -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">📍</div>
              <h3 class="h5 fw-bold">Recycling Locations</h3>
              <p class="text-secondary">
                Discover recycling collection points using
                our interactive location map.
              </p>
              <button
                type="button"
                class="btn btn-outline-success mt-auto"
                @click="$emit('change-page', 'map')"
              >
                View Map →
              </button>
            </div>
          </div>

          <!-- Learn -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">📚</div>
              <h3 class="h5 fw-bold">Learning Centre</h3>
              <p class="text-secondary">
                Learn recycling best practices through guides,
                useful tips, and interactive quizzes.
              </p>
              <button
                type="button"
                class="btn btn-outline-success mt-auto"
                @click="$emit('change-page', 'learn')"
              >
                Start Learning →
              </button>
            </div>
          </div>

          <!-- News -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">📰</div>
              <h3 class="h5 fw-bold">Environmental News</h3>
              <p class="text-secondary">
                Explore environmental articles and stay
                informed about sustainability topics.
              </p>
              <button
                type="button"
                class="btn btn-outline-success mt-auto"
                @click="$emit('change-page', 'news')"
              >
                Read News →
              </button>
            </div>
          </div>

          <!-- Email -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">✉️</div>
              <h3 class="h5 fw-bold">Email a Resource</h3>
              <p class="text-secondary">
                Share useful recycling information and
                resources through email.
              </p>
              <button
                type="button"
                class="btn btn-outline-success mt-auto"
                @click="$emit('change-page', 'email')"
              >
                Share a Resource →
              </button>
            </div>
          </div>

          <!-- Profile -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="feature-card">
              <div class="feature-icon" aria-hidden="true">👤</div>
              <h3 class="h5 fw-bold">My Profile</h3>
              <p class="text-secondary">
                View your account information and manage
                your username, email, and password.
              </p>
              <button
                type="button"
                class="btn btn-outline-success mt-auto"
                @click="$emit('change-page', 'profile')"
              >
                View Profile →
              </button>
            </div>
          </div>

          <!-- Admin: visible only to admins -->
          <div v-if="isAdmin" class="col-12">
            <div class="admin-card">
              <div>
                <h3 class="h5 fw-bold mb-2">
                  🛡️ Administration
                </h3>
                <p class="text-secondary mb-0">
                  Manage application accounts and administrative tasks.
                </p>
              </div>

              <button
                type="button"
                class="btn btn-outline-danger"
                @click="$emit('change-page', 'admin')"
              >
                Open Admin Panel →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Recycling Tips -->
      <section class="tips-section mb-5" aria-labelledby="tips-title">
        <div class="row align-items-center g-4">
          <div class="col-md-8">
            <span class="text-success fw-semibold">
              💡 RECYCLING TIP
            </span>

            <h2 id="tips-title" class="h3 fw-bold mt-2">
              Small Actions Make a Big Difference
            </h2>

            <p class="text-secondary mb-0">
              Empty and rinse recyclable containers before
              placing them in the correct recycling bin.
              Always check your local recycling guidelines
              to avoid contamination.
            </p>
          </div>

          <div class="col-md-4 text-md-end">
            <button
              type="button"
              class="btn btn-success"
              @click="$emit('change-page', 'learn')"
            >
              Discover More Tips →
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="home-footer">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <p class="text-secondary mb-0">
            🌱 Small actions. Big impact.
          </p>

          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('back-login')"
          >
            Log Out
          </button>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['change-page', 'back-login'])
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8faf9;
}

.hero-section {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  border: 1px solid #d9eadb;
  border-radius: 20px;
  padding: 55px 45px;
}

.hero-label {
  display: inline-block;
  color: #166534;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.hero-illustration {
  background: #dff2e3;
  border-radius: 50%;
  width: 240px;
  height: 240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.recycle-symbol {
  font-size: 6rem;
  line-height: 1.2;
}

.feature-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 28px;
  background: #ffffff;
  border: 1px solid #e2e8e5;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.feature-card p {
  flex-grow: 1;
  line-height: 1.7;
}

.feature-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
  border-radius: 14px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.admin-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: #fff8f8;
  border: 1px solid #f1d2d2;
  border-radius: 16px;
}

.tips-section {
  background: #edf7ee;
  border: 1px solid #d6e9d8;
  border-radius: 16px;
  padding: 35px;
}

.home-footer {
  padding-top: 24px;
  border-top: 1px solid #e2e8e5;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 35px 24px;
  }

  .hero-illustration {
    width: 180px;
    height: 180px;
  }

  .recycle-symbol {
    font-size: 4.5rem;
  }

  .admin-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .tips-section {
    padding: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card {
    transition: none;
  }

  .feature-card:hover {
    transform: none;
  }
}
</style>
