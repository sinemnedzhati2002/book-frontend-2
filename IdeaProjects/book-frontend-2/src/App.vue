<template>
  <main class="app">
    <h1>Bücherverwaltung</h1>
    <BookList />
  </main>
</template>

<script setup lang="ts">
import BookList from './components/BookList.vue'
</script>

<style scoped>
.app {
  max-width: 900px;
  margin: 2rem auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
h1 {
  margin-bottom: 1.5rem;
}
</style>
