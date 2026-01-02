<template>
  <section>
    <h2>Meine Bücher</h2>

    <!-- Tabs: Use Case "To-Read Liste" + "Finished Liste" -->
    <div class="tabs">
      <button :class="{ active: view === 'ALL' }" @click="setView('ALL')">Alle</button>
      <button :class="{ active: view === 'TO_READ' }" @click="setView('TO_READ')">To-Read</button>
      <button :class="{ active: view === 'FINISHED' }" @click="setView('FINISHED')">Fertig</button>
    </div>

    <!-- Filter (nur sinnvoll bei ALL) -->
    <div class="filters" v-if="view === 'ALL'">
      <input v-model="filters.title" placeholder="Nach Titel filtern" @input="loadBooks" />
      <input v-model="filters.author" placeholder="Nach Autor filtern" @input="loadBooks" />
      <input v-model="filters.genre" placeholder="Nach Genre filtern" @input="loadBooks" />
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
        <th>Status</th>
        <th>Geplant am</th>
        <th>Bewertung</th>
        <th>Fertig am</th>
        <th>Aktionen</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="b in books" :key="b.id">
        <td>{{ b.title }}</td>
        <td>{{ b.author }}</td>
        <td>{{ b.genre ?? '–' }}</td>
        <td>
            <span class="badge" :class="b.status.toLowerCase()">
              {{ statusLabel(b.status) }}
            </span>
        </td>
        <td>
          <span v-if="b.plannedOn">{{ formatDateForDisplay(b.plannedOn) }}</span>
          <span v-else>–</span>
        </td>
        <td>
          <span v-if="b.rating !== null">{{ b.rating }} ⭐</span>
          <span v-else>–</span>
        </td>
        <td>
          <span v-if="b.finishedOn">{{ formatDateForDisplay(b.finishedOn) }}</span>
          <span v-else>–</span>
        </td>
        <td class="actions">
          <button class="secondary" @click="startEdit(b)">Bearbeiten</button>

          <!-- Use Case: Status ändern (PATCH) -->
          <button
            class="secondary"
            v-if="b.status !== 'FINISHED'"
            @click="setStatus(b.id, 'FINISHED')"
          >
            Als fertig
          </button>

          <button
            class="secondary"
            v-if="b.status !== 'TO_READ'"
            @click="setStatus(b.id, 'TO_READ')"
          >
            Zur Leseliste
          </button>

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

        <!-- Datum-Input: plannedOn -->
        <div class="form-row">
          <label for="plannedOn">Geplant am</label>
          <input id="plannedOn" type="date" v-model="form.plannedOn" />
        </div>

        <!-- Status Auswahl -->
        <div class="form-row">
          <label for="status">Status</label>
          <select id="status" v-model="form.status">
            <option value="TO_READ">To-Read</option>
            <option value="READING">Reading</option>
            <option value="FINISHED">Finished</option>
          </select>
        </div>

        <div class="form-row">
          <label for="rating">Bewertung (1–5)</label>
          <input id="rating" type="number" min="1" max="5" v-model.number="form.rating" />
        </div>

        <!-- finishedOn nur anzeigen, wenn FINISHED -->
        <div class="form-row" v-if="form.status === 'FINISHED'">
          <label for="finishedOn">Fertig gelesen am</label>
          <input id="finishedOn" type="date" v-model="form.finishedOn" />
        </div>

        <div class="buttons">
          <button type="submit">
            {{ isEditing ? 'Änderungen speichern' : 'Buch hinzufügen' }}
          </button>

          <button v-if="isEditing" type="button" class="secondary" @click="resetForm">
            Abbrechen
          </button>
        </div>
      </form>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const API_BASE = 'https://book-backend-2-ba5q.onrender.com/api/books'

type ReadingStatus = 'TO_READ' | 'READING' | 'FINISHED'

type Book = {
  id: number
  title: string
  author: string
  genre: string | null
  rating: number | null
  plannedOn: string | null
  finishedOn: string | null
  status: ReadingStatus
}

type BookForm = {
  title: string
  author: string
  genre: string
  rating: number | null
  plannedOn: string | null
  finishedOn: string | null
  status: ReadingStatus
}

const books = ref<Book[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const view = ref<'ALL' | 'TO_READ' | 'FINISHED'>('ALL')

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
  plannedOn: null,
  finishedOn: null,
  status: 'TO_READ'
})

function setView(v: typeof view.value) {
  view.value = v
  loadBooks()
}

function statusLabel(s: ReadingStatus) {
  if (s === 'TO_READ') return 'To-Read'
  if (s === 'READING') return 'Reading'
  return 'Finished'
}

function formatDateForDisplay(dateStr: string | null): string {
  if (!dateStr) return ''
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
    let url = API_BASE

    if (view.value === 'TO_READ') url = `${API_BASE}/toread`
    if (view.value === 'FINISHED') url = `${API_BASE}/finished`

    if (view.value === 'ALL') {
      const params = new URLSearchParams()
      if (filters.value.title.trim()) params.append('title', filters.value.title)
      if (filters.value.author.trim()) params.append('author', filters.value.author)
      if (filters.value.genre.trim()) params.append('genre', filters.value.genre)
      if (params.toString()) url = `${API_BASE}?${params.toString()}`
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Fehler beim Laden: ${res.status}`)
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
    plannedOn: null,
    finishedOn: null,
    status: 'TO_READ'
  }
  isEditing.value = false
  editId.value = null
}

async function submitForm() {
  error.value = null

  // Payload muss zu deinem Backend-Book passen:
  const payload = {
    title: form.value.title,
    author: form.value.author,
    genre: form.value.genre || null,
    rating: form.value.rating,
    plannedOn: form.value.plannedOn || null,
    finishedOn: form.value.status === 'FINISHED' ? (form.value.finishedOn || null) : null,
    status: form.value.status
  }

  try {
    let res: Response
    if (isEditing.value && editId.value !== null) {
      res = await fetch(`${API_BASE}/${editId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } else {
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) throw new Error(`Fehler beim Speichern: ${res.status}`)

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
  form.value.plannedOn = book.plannedOn
  form.value.status = book.status
  form.value.finishedOn = book.finishedOn
}

async function setStatus(id: number, status: ReadingStatus) {
  try {
    const res = await fetch(`${API_BASE}/${id}/status?status=${status}`, { method: 'PATCH' })
    if (!res.ok) throw new Error(`Fehler beim Status-Update: ${res.status}`)
    await loadBooks()
  } catch (e: any) {
    error.value = e.message ?? 'Unbekannter Fehler beim Status-Update'
  }
}

async function deleteBook(id: number) {
  if (!confirm('Buch wirklich löschen?')) return
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Fehler beim Löschen: ${res.status}`)
    books.value = books.value.filter(b => b.id !== id)
  } catch (e: any) {
    error.value = e.message ?? 'Unbekannter Fehler beim Löschen'
  }
}

onMounted(loadBooks)
</script>

<style scoped>
/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tabs button {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  border: 1px solid #555;
  background: #2a2a2a;
  color: #f5f5f5;
  cursor: pointer;
}

.tabs button:hover {
  background: #3b3b3b;
}

.tabs button.active {
  border-color: #fff;
  background: #444;
}

/* Filter */
.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filters input {
  flex: 1;
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #3a3a3a;
  background-color: #1f1f1f;
  color: #f5f5f5;
}

.filters input::placeholder {
  color: #9b9b9b;
}

/* Table */
.book-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background-color: #181818;
  color: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
}

.book-table thead {
  background-color: #232323;
}

.book-table th,
.book-table td {
  border-bottom: 1px solid #333;
  padding: 0.6rem 0.8rem;
  text-align: left;
}

.book-table tr:nth-child(even) td {
  background-color: #161616;
}

.book-table tr:hover td {
  background-color: #242424;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #555;
  font-size: 0.85rem;
}

.badge.to_read {
  border-color: #7f8c8d;
}

.badge.reading {
  border-color: #f1c40f;
}

.badge.finished {
  border-color: #2ecc71;
}

/* Actions */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

/* Buttons */
button {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  border: 1px solid #555;
  background: #2a2a2a;
  color: #f5f5f5;
  cursor: pointer;
  transition: background 0.15s ease;
}

button:hover {
  background: #3b3b3b;
}

button.danger {
  border-color: #e74c3c;
  background: #3b1b1b;
  color: #ff8373;
}

button.danger:hover {
  background: #5b2220;
}

button.secondary {
  border-color: #888;
  color: #f5f5f5;
}

/* Form */
.form-section {
  border-top: 1px solid #333;
  padding-top: 1rem;
  margin-top: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.7rem;
}

.form-row label {
  font-size: 0.85rem;
  margin-bottom: 0.15rem;
  color: #cccccc;
}

.form-row input,
.form-row select {
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #3a3a3a;
  background-color: #1f1f1f;
  color: #f5f5f5;
}

.buttons {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

.error {
  color: #ff6b6b;
  margin-bottom: 0.6rem;
}
</style>
