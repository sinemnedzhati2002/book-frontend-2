import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BookList from '../BookList.vue'

type Book = {
  id: number
  title: string
  author: string
  genre: string | null
  rating: number | null
  plannedOn: string | null
  finishedOn: string | null
  status: 'TO_READ' | 'READING' | 'FINISHED'
}

const mockBooks: Book[] = [
  {
    id: 1,
    title: 'The Wrong Bride',
    author: 'Catharina Maura',
    genre: 'Romance',
    rating: 5,
    plannedOn: '2022-06-01',
    finishedOn: '2022-06-10',
    status: 'FINISHED'
  },
  {
    id: 2,
    title: 'Twisted Love',
    author: 'Ana Huang',
    genre: 'Romance',
    rating: null,
    plannedOn: '2026-01-12',
    finishedOn: null,
    status: 'TO_READ'
  }
]

function mockFetchJson(data: any) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data
  })
}

async function flushPromises() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

describe('BookList.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('lädt Bücher beim Mount und rendert sie', async () => {
    globalThis.fetch = mockFetchJson(mockBooks) as any

    const wrapper = mount(BookList)

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(globalThis.fetch).toHaveBeenCalled()
    expect(wrapper.text()).toContain('The Wrong Bride')
    expect(wrapper.text()).toContain('Catharina Maura')
  })

  it('Tab "To-Read" triggert Request auf /toread', async () => {
    globalThis.fetch = mockFetchJson(mockBooks) as any

    const wrapper = mount(BookList)

    await flushPromises()
    await wrapper.vm.$nextTick()

    const toReadBtn = wrapper.findAll('button').find((b) => b.text() === 'To-Read')
    expect(toReadBtn).toBeTruthy()

    await toReadBtn!.trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    const lastCallUrl = (globalThis.fetch as any).mock.calls.at(-1)[0] as string
    expect(lastCallUrl).toContain('/toread')
  })

  it('Bearbeiten füllt Formularfelder', async () => {
    globalThis.fetch = mockFetchJson(mockBooks) as any

    const wrapper = mount(BookList)

    await flushPromises()
    await wrapper.vm.$nextTick()

    const editBtn = wrapper.findAll('button').find((b) => b.text() === 'Bearbeiten')
    expect(editBtn).toBeTruthy()

    await editBtn!.trigger('click')
    await wrapper.vm.$nextTick()

    const titleInput = wrapper.find('input#title')
    const authorInput = wrapper.find('input#author')

    expect((titleInput.element as HTMLInputElement).value).toBe('The Wrong Bride')
    expect((authorInput.element as HTMLInputElement).value).toBe('Catharina Maura')
  })
})
