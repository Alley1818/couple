'use client'

import { useState } from 'react'

type Idea = { id: string; title: string; category: string; created_by: string; idea_votes: { user_id: string }[] }

const catEmoji: Record<string, string> = { restaurant:'🍽', activity:'🎯', travel:'✈️', home:'🏠', other:'💡' }
const catLabel: Record<string, string> = { restaurant:'Ресторан', activity:'Активность', travel:'Путешествие', home:'Дома', other:'Идея' }

export default function IdeaGrid({ ideas: init, currentUserId, coupleId }: {
  ideas: Idea[]; currentUserId: string; coupleId: string
}) {
  const [ideas, setIdeas] = useState(init)
  const [showAdd, setShowAdd] = useState(false)
  const [newIdea, setNewIdea] = useState({ title: '', category: 'other' })
  const [adding, setAdding] = useState(false)

  async function toggleVote(ideaId: string) {
    const idea = ideas.find(i => i.id === ideaId)!
    const hasVoted = idea.idea_votes.some(v => v.user_id === currentUserId)
    setIdeas(prev => prev.map(i => i.id !== ideaId ? i : {
      ...i,
      idea_votes: hasVoted
        ? i.idea_votes.filter(v => v.user_id !== currentUserId)
        : [...i.idea_votes, { user_id: currentUserId }]
    }))
    const res = await fetch('/api/ideas/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId, action: hasVoted ? 'unvote' : 'vote' }),
    })
    if (res.ok) {
      const { votes } = await res.json()
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, idea_votes: votes } : i))
    }
  }

  async function addIdea() {
    if (!newIdea.title.trim()) return
    setAdding(true)
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIdea, coupleId }),
    })
    if (res.ok) {
      const idea = await res.json()
      setIdeas(prev => [{ ...idea, idea_votes: [] }, ...prev])
      setNewIdea({ title: '', category: 'other' })
      setShowAdd(false)
    }
    setAdding(false)
  }

  const sorted = [...ideas].sort((a, b) => b.idea_votes.length - a.idea_votes.length)

  return (
    <div>
      <button onClick={() => setShowAdd(true)}
        className="w-full mb-4 py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-rose-300 hover:text-rose-400 transition-colors text-sm">
        + Добавить идею
      </button>

      {showAdd && (
        <div className="bg-white rounded-xl p-4 border border-stone-100 mb-4">
          <input type="text" value={newIdea.title} onChange={e => setNewIdea(n => ({...n, title: e.target.value}))}
            placeholder="Что хотим попробовать?" autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 mb-3" />
          <select value={newIdea.category} onChange={e => setNewIdea(n => ({...n, category: e.target.value}))}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 mb-3">
            {Object.entries(catLabel).map(([k, v]) => <option key={k} value={k}>{catEmoji[k]} {v}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={addIdea} disabled={adding || !newIdea.title.trim()}
              className="flex-1 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {adding ? '...' : 'Добавить'}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-stone-200 text-stone-400 text-sm rounded-lg">
              Отмена
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">💡</p>
          <p className="text-stone-500">Добавь первую идею!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(idea => {
            const hasVoted = idea.idea_votes.some(v => v.user_id === currentUserId)
            const bothLike = idea.idea_votes.length >= 2
            return (
              <div key={idea.id} className={`bg-white rounded-xl p-4 border transition-colors ${bothLike ? 'border-rose-200' : 'border-stone-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{catEmoji[idea.category]}</span>
                      {bothLike && <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-medium">Оба хотят</span>}
                    </div>
                    <p className="font-medium text-sm">{idea.title}</p>
                  </div>
                  <button onClick={() => toggleVote(idea.id)}
                    className={`text-2xl transition-transform active:scale-90 ${hasVoted ? '' : 'grayscale opacity-40'}`}>
                    ❤️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
