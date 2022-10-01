<script setup lang="ts">
const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<template>
  <div class="w-96 h-screen flex items-center justify-center relative">
    <div id="slideover" class="w-full bg-white h-full">
      <div @click="emit('close')" class="cursor-pointer text-gray-600 flex items-center justify-end mt-5 p-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      <slot />
    </div>
    <!-- </div> -->
  </div>
</template>
