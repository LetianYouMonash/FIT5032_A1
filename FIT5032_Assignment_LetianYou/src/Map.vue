
<template>
  <div class="container py-4">
    <h1 class="text-center mb-3">Recycling Location Map</h1>
    <p class="text-center text-muted">
      Search for locations and plan a route to your destination.
    </p>

    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <form @submit.prevent="searchLocation">
          <label for="destination" class="form-label fw-bold">
            Search Destination
          </label>

          <div class="input-group">
            <input
              id="destination"
              v-model.trim="searchText"
              type="text"
              class="form-control"
              placeholder="e.g. Melbourne Central"
              maxlength="200"
              required
            />

            <button
              class="btn btn-primary"
              type="submit"
              :disabled="loading"
            >
              Search
            </button>
          </div>
        </form>

        <div v-if="results.length" class="mt-3">
          <label for="result" class="form-label">
            Select a search result
          </label>

          <select
            id="result"
            v-model="selectedIndex"
            class="form-select"
            @change="selectLocation"
          >
            <option
              v-for="(place, index) in results"
              :key="place.place_id"
              :value="index"
            >
              {{ place.display_name }}
            </option>
          </select>
        </div>

        <hr />

        <div class="d-flex flex-wrap gap-2">
          <button
            class="btn btn-outline-primary"
            type="button"
            :disabled="loading"
            @click="useMyLocation"
          >
            Use My Location
          </button>

          <button
            class="btn btn-success"
            type="button"
            :disabled="loading || !destination"
            @click="planRoute"
          >
            Plan Route
          </button>

          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="clearRoute"
          >
            Clear Route
          </button>
        </div>

        <p class="small text-muted mt-2 mb-0">
          Route planning uses your selected starting point.
          If you do not provide your location, Melbourne CBD
          is used as the default starting point.
        </p>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="alert alert-danger"
      role="alert"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="statusMessage"
      class="alert alert-info"
      role="status"
    >
      {{ statusMessage }}
    </div>

    <div
      v-if="routeInfo"
      class="alert alert-success"
      role="status"
    >
      <strong>Route Information</strong>
      <div>Distance: {{ routeInfo.distance }} km</div>
      <div>Estimated driving time: {{ routeInfo.duration }} minutes</div>
    </div>

    <div
      ref="mapElement"
      class="map-container"
      aria-label="Interactive location map"
    ></div>

    <p class="small text-muted mt-2">
      Map data © OpenStreetMap contributors.
      Search powered by Nominatim.
      Routing powered by OSRM.
    </p>

    <div class="text-center mt-4">
      <button
        class="btn btn-primary"
        @click="$emit('back-home')"
      >
        Back to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

defineEmits(['back-home'])

const mapElement = ref(null)
const searchText = ref('')
const results = ref([])
const selectedIndex = ref(0)
const destination = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const routeInfo = ref(null)

const MELBOURNE = {
  lat: -37.8136,
  lng: 144.9631,
}

let map = null
let destinationMarker = null
let startMarker = null
let routeLayer = null
let startPoint = { ...MELBOURNE }

function clearMessages() {
  errorMessage.value = ''
  statusMessage.value = ''
}

function showError(error, fallback) {
  errorMessage.value = error instanceof Error
    ? error.message
    : fallback
}

function addMarker(point, label, existingMarker) {
  if (existingMarker) {
    map.removeLayer(existingMarker)
  }

  const marker = L.circleMarker(
    [point.lat, point.lng],
    {
      radius: 9,
      color: '#0d6efd',
      fillColor: '#0d6efd',
      fillOpacity: 0.85,
    }
  )

  marker.addTo(map).bindPopup(label)

  return marker
}

async function searchLocation() {
  if (!searchText.value || loading.value) return

  loading.value = true
  clearMessages()
  results.value = []

  try {
    const url = new URL(
      'https://nominatim.openstreetmap.org/search'
    )

    url.searchParams.set('q', searchText.value)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '5')

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Location search is currently unavailable.')
    }

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      statusMessage.value = 'No matching locations were found.'
      return
    }

    results.value = data
    selectedIndex.value = 0
    selectLocation()
  } catch (error) {
    showError(error, 'Unable to search for locations.')
  } finally {
    loading.value = false
  }
}

function selectLocation() {
  if (!map || !results.value.length) return

  const place = results.value[selectedIndex.value]

  if (!place) return

  const lat = Number(place.lat)
  const lng = Number(place.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    errorMessage.value = 'The selected location is invalid.'
    return
  }

  destination.value = {
    lat,
    lng,
    name: place.display_name,
  }

  clearRoute()

  destinationMarker = addMarker(
    destination.value,
    destination.value.name,
    destinationMarker
  )

  map.setView([lat, lng], 14)
  destinationMarker.openPopup()

  statusMessage.value = 'Destination selected. You can now plan a route.'
}

function useMyLocation() {
  clearMessages()

  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by this browser.'
    return
  }

  loading.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      startPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      if (map) {
        startMarker = addMarker(
          startPoint,
          'Your current location',
          startMarker
        )

        map.setView([startPoint.lat, startPoint.lng], 14)
      }

      clearRoute()
      statusMessage.value = 'Your current location is now the route starting point.'
      loading.value = false
    },
    () => {
      errorMessage.value =
        'Unable to access your location. Please check browser permissions.'
      loading.value = false
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    }
  )
}

function clearRoute() {
  if (map && routeLayer) {
    map.removeLayer(routeLayer)
    routeLayer = null
  }

  routeInfo.value = null
}

async function planRoute() {
  if (!destination.value || loading.value || !map) return

  loading.value = true
  clearMessages()
  clearRoute()

  try {
    const start = `${startPoint.lng},${startPoint.lat}`
    const end = `${destination.value.lng},${destination.value.lat}`

    const url =
      `https://router.project-osrm.org/route/v1/driving/${start};${end}` +
      '?overview=full&geometries=geojson'

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('The routing service is currently unavailable.')
    }

    const data = await response.json()

    if (
      data.code !== 'Ok' ||
      !Array.isArray(data.routes) ||
      !data.routes.length
    ) {
      throw new Error('No driving route was found for these locations.')
    }

    const route = data.routes[0]

    routeLayer = L.geoJSON(
      route.geometry,
      {
        style: {
          color: '#198754',
          weight: 5,
          opacity: 0.85,
        },
      }
    ).addTo(map)

    startMarker = addMarker(
      startPoint,
      'Route starting point',
      startMarker
    )

    map.fitBounds(routeLayer.getBounds(), {
      padding: [30, 30],
    })

    routeInfo.value = {
      distance: (route.distance / 1000).toFixed(2),
      duration: Math.ceil(route.duration / 60),
    }

    statusMessage.value = 'Driving route calculated successfully.'
  } catch (error) {
    showError(error, 'Unable to calculate the route.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  map = L.map(mapElement.value).setView(
    [MELBOURNE.lat, MELBOURNE.lng],
    12
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }
  ).addTo(map)

  startMarker = addMarker(
    startPoint,
    'Default starting point: Melbourne CBD',
    null
  )
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 520px;
  min-height: 350px;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  z-index: 0;
}

@media (max-width: 576px) {
  .map-container {
    height: 380px;
  }
}
</style>
