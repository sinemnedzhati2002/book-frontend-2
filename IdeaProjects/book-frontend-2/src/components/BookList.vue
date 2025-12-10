<template>
  <section>
    <h2>Meine Bücher</h2>

    <!-- Filter -->
    <div class="filters">
      <input
        v-model="filters.title"
        placeholder="Nach Titel filtern"
        @input="loadBooks"
      />
      <input
        v-model="filters.author"
        placeholder="Nach Autor filtern"
        @input="loadBooks"
      />
      <input
        v-model="filters.genre"
        placeholder="Nach Genre filtern"
        @input="loadBooks"
      />
    </div>

    <p v-if="isLoading">Lade Daten...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Bücherliste -->
    <table v-if="books.length > 0" class="book-table">
      <thead>
      <tr>
        <th>Titel</th>
        <th>Autor</th>
        <th>Genre</th>
        <th>Bewertung</th>
        <th>Fertig am</th>
        <th>Aktionen</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="b in books" :key="b.id">
        <td>{{ b.title }}</td>
        <td>{{ b.author }}</td>
        <td>{{ b.genre }}</td>
        <td>
          <span v-if="b.rating !== null">{{ b.rating }} ⭐</span>
          <span v-else>–</span>
        </td>
        <td>
          <span v-if="b.finishedOn">{{ formatDateForDisplay(b.finishedOn) }}</span>
          <span v-else>–</span>
        </td>
        <td class="actions">
          <button @click="startEdit(b)">Bearbeiten</button>
          <button class="danger" @click="deleteBook(b.id)">Löschen</button>
        </td>
      </tr>
      </tbody>
    </table>

    <p v-else-if="!isLoading">Keine Bücher gefunden.</p>

    <!-- Formular: Neues Buch oder Bearbeiten -->
    <section class="form-section">
      <h3>{{ isEditing ? 'Buch bearbeiten' : 'Neues Buch hinzufügen' }}</h3>
      <form @submit.prevent="submitForm">
        <div class="form-row">
          <label for="title">Titel</label>
          <input id="title" v-model="form.title" required />
        </div>

        <div class="form-row">
          <label for="author">Autor</label>
          <input id="author" v-model="form.author" required />
        </div>

        <div class="form-row">
          <label for="genre">Genre</label>
          <input id="genre" v-model="form.genre" />
        </div>

        <div class="form-row">
          <label for="rating">Bewertung (1–5)</label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            v-model.number="form.rating"
          />
        </div>

        <div class="form-row">
          <label for="finishedOn">Fertig gelesen am</label>
          <input
            id="finishedOn"
            type="date"
            v-model="form.finishedOn"
          />
        </div>

        <div class="buttons">
          <button type="submit">
            {{ isEditing ? 'Änderungen speichern' : 'Buch hinzufügen' }}
          </button>
          <button
            v-if="isEditing"
            type="button"
            class="secondary"
            @click="resetForm"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const API_BASE = 'https://book-backend-2-ba5q.onrender.com/api/books'

type Book = {
  id: number
  title: string
  author: string
  genre: string | null
  rating: number | null
  finishedOn: string | null // ISO-String von Backend, z.B. "2025-12-04"
}

type BookForm = {
  title: string
  author: string
  genre: string
  rating: number | null
  finishedOn: string | null // hier yyyy-MM-dd für <input type="date">
}

const books = ref<Book[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = ref({
  title: '',
  author: '',
  genre: ''
})

const isEditing = ref(false)
const editId = ref<number | null>(null)

const form = ref<BookForm>({
  title: '',
  author: '',
  genre: '',
  rating: null,
  finishedOn: null
})

function formatDateForDisplay(dateStr: string | null): string {
  if (!dateStr) return ''
  // Backend liefert LocalDate, z.B. "2025-12-04"
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('de-DE')
  } catch {
    return dateStr
  }
}

async function loadBooks() {
  isLoading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    if (filters.value.title.trim()) params.append('title', filters.value.title)
    if (filters.value.author.trim()) params.append('author', filters.value.author)
    if (filters.value.genre.trim()) params.append('genre', filters.value.genre)

    const url =
      params.toString().length > 0 ? `${API_BASE}?${params.toString()}` : API_BASE

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Fehler beim Laden: ${res.status}`)
    }
    books.value = await res.json()
  } catch (e: any) {
    error.value = e.message ?? 'Unbekannter Fehler beim Laden'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  form.value = {
    title: '',
    author: '',
    genre: '',
    rating: null,
    finishedOn: null
  }
  isEditing.value = false
  editId.value = null
}

async function submitForm() {
  error.value = null

  const payload = {
    title: form.value.title,
    author: form.value.author,
    genre: form.value.genre || null,
    rating: form.value.rating,
    finishedOn: form.value.finishedOn || null
  }

  try {
    let res: Response
    if (isEditing.value && editId.value !== null) {
      // PUT /api/books/{id}
      res = await fetch(`${API_BASE}/${editId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } else {
      // POST /api/books
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) {
      throw new Error(`Fehler beim Speichern: ${res.status}`)
    }

    // Nach dem Speichern Liste neu laden
    await loadBooks()
    resetForm()
  } catch (e: any) {
    error.value = e.message ?? 'Unbekannter Fehler beim Speichern'
  }
}

function startEdit(book: Book) {
  isEditing.value = true
  editId.value = book.id
  form.value.title = book.title
  form.value.author = book.author
  form.value.genre = book.genre ?? ''
  form.value.rating = book.rating

  // Backend-Format (LocalDate) ist "yyyy-MM-dd", das passt direkt ins date-Input
  form.value.finishedOn = book.finishedOn
}

async function deleteBook(id: number) {
  if (!confirm('Buch wirklich löschen?')) return
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      throw new Error(`Fehler beim Löschen: ${res.status}`)
    }
    books.value = books.value.filter(b => b.id !== id)
  } catch (e: any) {
    error.value = e.message ?? 'Unbekannter Fehler beim Löschen'
  }
}

onMounted(loadBooks)
</script>

<style scoped>
.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filters input {
  flex: 1;
  padding: 0.4rem 0.6rem;
}

.book-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background-color: #222; /* dunkles Grau */
  color: #ffffff;         /* weiße Schrift */
}

.book-table th {
  background-color: #444;
  color: #ffffff;
}

.book-table td {
  color: #ffffff;
}

.book-table th,
.book-table td {
  border: 1px solid #555;
  padding: 0.5rem 0.75rem;
}


.actions {
  display: flex;
  gap: 0.4rem;
}

button {
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #f3f3f3;
  cursor: pointer;
}

button:hover {
  background: #e2e2e2;
}

button.danger {
  border-color: #e74c3c;
  color: #e74c3c;
}

button.danger:hover {
  background: #fdecea;
}

button.secondary {
  border-color: #888;
  color: #444;
}

.form-section {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.6rem;
}

.form-row label {
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.form-row input {
  padding: 0.3rem 0.5rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.error {
  color: #c0392b;
  margin-bottom: 0.5rem;
}
</style>
