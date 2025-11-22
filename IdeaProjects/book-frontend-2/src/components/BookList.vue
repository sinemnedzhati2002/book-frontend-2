<template>
  <section>
    <h2>Meine Bücher</h2>

    <p v-if="isLoading">Lade Daten...</p>
    <p v-else-if="error">Fehler: {{ error }}</p>

    <ul v-else>
      <li v-for="b in books" :key="b.id">
        {{ b.title }} — {{ b.author }}
      </li>
    </ul>
  </section>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Der genaue Typ deiner Books
type Book = { id: number; title: string; author: string }

// Vue-States
const books = ref<Book[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Hier die Backend-URL:
const API = 'https://book-backend-2-ba5q.onrender.com/api/books'

onMounted(async () => {
  try {
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error('HTTP Error ' + response.status)
    }
    books.value = await response.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
})
</script>

