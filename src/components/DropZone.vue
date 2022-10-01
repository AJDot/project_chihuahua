<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
const emit = defineEmits<{
  (event: 'files-dropped', payload: FileList): void,
}>()

let active = ref(false)
let inactiveTimeout: number | null = null

function setActive() {
  active.value = true
  if (inactiveTimeout) clearTimeout(inactiveTimeout)
}
function setInactive() {
  inactiveTimeout = window.setTimeout(() => {
    active.value = false
  }, 50)
}

function onDrop(e: DragEvent) {
  setInactive()
  if (!e.dataTransfer?.files) return

  emit('files-dropped', e.dataTransfer.files)
}

function preventDefaults(e: Event) {
  e.preventDefault()

}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})
</script>

<template>
  <div @drop.prevent="onDrop" :data-active="active" @dragenter.prevent="setActive" @dragover.prevent="setActive"
    @dragleave.prevent="setInactive">
    <slot :active="active" />
  </div>
</template>