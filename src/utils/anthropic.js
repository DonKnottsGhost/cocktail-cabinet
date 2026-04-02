const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export async function callClaude(apiKey, systemPrompt, userMessage) {
  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export function buildCabinetContext(cabinet) {
  const spirits = cabinet.filter(i => i.category === 'spirit').map(i => i.name)
  const mixers  = cabinet.filter(i => i.category === 'mixer').map(i => i.name)
  const other   = cabinet.filter(i => !['spirit','mixer'].includes(i.category)).map(i => i.name)

  let ctx = ''
  if (spirits.length) ctx += `Spirits on hand: ${spirits.join(', ')}.\n`
  if (mixers.length)  ctx += `Mixers on hand: ${mixers.join(', ')}.\n`
  if (other.length)   ctx += `Other ingredients: ${other.join(', ')}.\n`
  return ctx
}

export function buildTasteContext(ratings) {
  if (!ratings.length) return ''
  const liked    = ratings.filter(r => r.rating >= 4).map(r => r.cocktailName)
  const disliked = ratings.filter(r => r.rating <= 2).map(r => r.cocktailName)
  let ctx = ''
  if (liked.length)    ctx += `Cocktails the user loved: ${liked.join(', ')}.\n`
  if (disliked.length) ctx += `Cocktails the user disliked: ${disliked.join(', ')}.\n`
  return ctx
}

export const SUGGESTION_SYSTEM = `You are a master mixologist and speakeasy bartender with encyclopedic knowledge of cocktails — classic, modern, and forgotten. You have a refined, slightly theatrical voice, like a bartender from 1920s Chicago.

When asked to suggest cocktails, respond ONLY with valid JSON — no preamble, no markdown fences. The schema is:
{
  "suggestions": [
    {
      "name": string,
      "type": "classic" | "original",
      "description": string (1-2 sentences, evocative),
      "ingredients": string[],
      "instructions": string (brief method),
      "flavourProfile": string[],
      "whyThisOne": string (1 sentence personalised reason)
    }
  ]
}

Always return exactly 3 suggestions. Vary between classic and original. If taste history is provided, lean toward flavour profiles the user has enjoyed.`

export const RECOMMENDATION_SYSTEM = `You are a master mixologist advising a home bar enthusiast on what bottles to acquire next.

Respond ONLY with valid JSON — no preamble, no markdown fences. The schema is:
{
  "recommendations": [
    {
      "name": string,
      "category": string,
      "priceRange": "$" | "$$" | "$$$",
      "reason": string (2 sentences — why this fits their taste and what it unlocks),
      "cocktailsUnlocked": string[]
    }
  ]
}

Return exactly 4 recommendations. Base them on taste history and current cabinet gaps.`
