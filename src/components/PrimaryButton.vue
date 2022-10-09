<template>
  <button class="justify-center 
    rounded shadow-sm 
    px-4 py-2 
    bg-yellow-600 text-base font-medium text-white 
    hover:bg-yellow-700 hover:cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 
    sm:text-sm 
    disabled:opacity-50 disabled:cursor-not-allowed">
    <slot />
  </button>
</template>