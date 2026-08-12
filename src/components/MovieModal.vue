<template>
  <div v-if="open" class="mw-overlay" @click.self="close">
    <div class="mw-modal" role="dialog" aria-modal="true">
        <button class="close-modal" @click="close" aria-label="Zamknij">✕</button>
        <p class="mw-modal-head">Dzisiejszy film to: {{title}}</p>
      </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits(['update:open'])

function close() {
  emit('update:open', false)
}
</script>
