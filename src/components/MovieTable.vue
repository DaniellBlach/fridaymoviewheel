<template>
  <div v-if="open" class="movie-table-overlay" @click.self="close">
    <section class="movie-table-panel" role="dialog" aria-modal="true" aria-labelledby="movie-table-title">
      <header class="movie-table-header">
        <h2 id="movie-table-title">Lista filmów</h2>
        <button class="movie-table-close" type="button" @click="close" aria-label="Zamknij tabelę">✕</button>
      </header>

      <div class="movie-status-toggle" role="group" aria-label="Filtruj filmy według statusu">
        <button
          type="button"
          :class="{ active: !watched }"
          :aria-pressed="!watched"
          @click="watched = false"
        >Nieobejrzane</button>
        <button
          type="button"
          :class="{ active: watched }"
          :aria-pressed="watched"
          @click="watched = true"
        >Obejrzane</button>
      </div>

      <div class="movie-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Tytuł</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(movie, index) in filteredMovies" :key="movie.id" :class="{ 'sequel-row': movie.isSequel }">
              <td>{{ index + 1 }}</td>
              <td class="movie-title-cell">
                <FontAwesomeIcon v-if="movie.isSequel" class="sequel-marker" :icon="faArrowTurnUp" aria-hidden="true" />
                {{ movie.title }}
              </td>
              <td>
                <span :class="['movie-status', movie.watched ? 'watched' : 'unwatched']">
                  {{ movie.watched ? 'Obejrzany' : 'Nieobejrzany' }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredMovies.length === 0">
              <td colspan="3" class="empty-state">Brak filmów o tym statusie.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getMoviesByWatchedStatus, type Movie } from './movieService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowTurnUp } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{ open: boolean; movies: Movie[] }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const watched = ref(false)

const filteredMovies = computed(() => getMoviesByWatchedStatus(props.movies, watched.value))

watch(() => props.open, (open) => {
  if (open) watched.value = false
})

function close() {
  emit('update:open', false)
}
</script>
