<template>
  <section>
    <h2>Meine Bücher</h2>
    <ul>
      <li v-for="b in books" :key="b.id">
        {{ b.title }} — {{ b.author }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
type Book = { id: number; title: string; author: string }
const books = ref<Book[]>([
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 2, title: 'Der Prozess', author: 'Franz Kafka' },
  { id: 3, title: 'The Pragmatic Programmer', author: 'Andrew Hunt' }
])
</script>
