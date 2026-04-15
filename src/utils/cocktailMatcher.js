import { COCKTAILS } from '../data/cocktails.js'

// ── Normalisation ─────────────────────────────────────────────────────────

const norm = s =>
  s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()

// Known aliases so that e.g. "Bourbon" in a recipe matches "Bourbon" in cabinet
// and "Triple Sec / Cointreau" matches "Triple Sec"
const ALIASES = {
  bourbon:               ['bourbon', 'bourbon whiskey', 'american whiskey'],
  'rye whiskey':         ['rye', 'rye whiskey', 'rye whisky'],
  scotch:                ['scotch', 'scotch whisky', 'whisky'],
  gin:                   ['gin', 'london dry gin'],
  vodka:                 ['vodka'],
  'dark rum':            ['dark rum', 'aged rum', 'jamaican rum'],
  'white rum':           ['white rum', 'light rum', 'silver rum', 'blanco rum'],
  tequila:               ['tequila', 'blanco tequila', 'silver tequila'],
  mezcal:                ['mezcal'],
  'brandy / cognac':     ['brandy', 'cognac', 'vsop', 'armagnac', 'brandy cognac'],
  'sweet vermouth':      ['sweet vermouth', 'rosso vermouth', 'red vermouth'],
  'dry vermouth':        ['dry vermouth', 'white vermouth', 'extra dry vermouth'],
  amaretto:              ['amaretto', 'disaronno'],
  'triple sec / cointreau': ['triple sec', 'cointreau', 'orange liqueur', 'orange curacao', 'triple sec cointreau'],
  campari:               ['campari'],
  aperol:                ['aperol'],
  'kahlúa':              ['kahlua', 'kahlúa', 'coffee liqueur'],
  'st-germain':          ['st germain', 'st-germain', 'elderflower liqueur', 'elderflower cordial'],
  'angostura bitters':   ['angostura', 'angostura bitters'],
  'orange bitters':      ['orange bitters'],
  "peychaud's bitters":  ['peychaud', "peychaud's", 'peychauds'],
  'club soda':           ['club soda', 'soda water', 'sparkling water', 'seltzer'],
  'tonic water':         ['tonic', 'tonic water'],
  'ginger beer':         ['ginger beer'],
  'ginger ale':          ['ginger ale'],
  cola:                  ['cola', 'coke', 'coca cola', 'pepsi'],
  'lemon juice':         ['lemon juice', 'fresh lemon juice'],
  'lime juice':          ['lime juice', 'fresh lime juice'],
  'simple syrup':        ['simple syrup', 'sugar syrup', 'syrup', 'gomme'],
  grenadine:             ['grenadine', 'pomegranate syrup'],
  lemon:                 ['lemon'],
  lime:                  ['lime'],
  orange:                ['orange'],
  'maraschino cherries': ['maraschino', 'maraschino cherries', 'cocktail cherries', 'cherries'],
  mint:                  ['mint', 'fresh mint'],
  olives:                ['olives', 'cocktail olives'],
}

function getAliases(name) {
  const key = norm(name)
  return ALIASES[key] || ALIASES[name.toLowerCase()] || [key]
}

export function hasIngredient(cabinet, ingredient) {
  const recipeAliases = getAliases(ingredient)
  return cabinet.some(item => {
    const itemAliases = getAliases(item.name)
    return recipeAliases.some(ra =>
      itemAliases.some(ia => ia === ra || ia.includes(ra) || ra.includes(ia))
    )
  })
}

// ── Mood matching ─────────────────────────────────────────────────────────

const MOOD_KEYWORDS = {
  smoky:      ['smoky'],
  refreshing: ['refreshing', 'light'],
  strong:     ['strong', 'dry'],
  sweet:      ['sweet'],
  sour:       ['sour'],
  bitter:     ['bitter'],
  fruity:     ['fruity'],
  herbal:     ['herbal'],
  floral:     ['floral'],
  spicy:      ['spicy'],
  'low abv':  ['light', 'refreshing'],
  dry:        ['dry'],
  rich:       ['rich'],
  nutty:      ['nutty'],
  light:      ['light'],
}

function matchesMood(cocktail, moodPrompt) {
  if (!moodPrompt) return true
  const m = norm(moodPrompt)

  // Direct flavour profile match
  if (cocktail.flavourProfile.some(f => m.includes(f))) return true

  // Keyword mapping
  for (const [keyword, tags] of Object.entries(MOOD_KEYWORDS)) {
    if (m.includes(keyword) && tags.some(t => cocktail.flavourProfile.includes(t))) return true
  }

  // Name match
  if (norm(cocktail.name).includes(m)) return true

  return false
}

// ── Why this one ──────────────────────────────────────────────────────────

function whyThisOne(cocktail, ratings, moodPrompt) {
  const likedProfiles = ratings
    .filter(r => r.rating >= 4)
    .flatMap(r => r.flavourProfile || [])

  const matches = cocktail.flavourProfile.filter(f => likedProfiles.includes(f))

  if (matches.length > 0) {
    return `You've enjoyed ${matches[0]} cocktails before — this one delivers exactly that.`
  }
  if (moodPrompt) {
    const short = moodPrompt.trim().replace(/\.$/, '').slice(0, 40).toLowerCase()
    return `This fits your mood for something ${short}.`
  }
  return 'A well-loved classic that suits your cabinet perfectly.'
}

// ── Suggestions ───────────────────────────────────────────────────────────

export function getSuggestions(cabinet, ratings, moodPrompt) {
  const likedProfiles = ratings
    .filter(r => r.rating >= 4)
    .flatMap(r => r.flavourProfile || [])

  const scored = COCKTAILS.map(cocktail => {
    const missing = cocktail.ingredients.filter(ing => !hasIngredient(cabinet, ing))
    // Garnish items don't block a suggestion
    const canMake = missing.length === 0
    const moodMatch = matchesMood(cocktail, moodPrompt)
    const tasteScore = cocktail.flavourProfile.filter(f => likedProfiles.includes(f)).length

    return {
      ...cocktail,
      missingIngredients: missing,
      canMake,
      score: (canMake ? 100 : 0) + (moodMatch ? 20 : 0) + tasteScore * 5,
    }
  })

  const canMake = scored
    .filter(c => c.canMake)
    .filter(c => !moodPrompt || matchesMood(c, moodPrompt))
    .sort((a, b) => b.score - a.score)

  // If mood filtered and fewer than 3, fall back to any makeable
  const pool =
    canMake.length >= 3
      ? canMake
      : [...canMake, ...scored.filter(c => c.canMake && !canMake.includes(c))]

  // Fill to 3 with "almost there" (missing exactly 1 ingredient)
  const almostThere = scored
    .filter(c => !c.canMake && c.missingIngredients.length === 1)
    .sort((a, b) => b.score - a.score)

  const results = [...pool.slice(0, 3)]
  if (results.length < 3) results.push(...almostThere.slice(0, 3 - results.length))

  // Deduplicate and attach whyThisOne
  return results.slice(0, 3).map(c => ({
    name: c.name,
    type: c.type,
    description: c.description,
    ingredients: c.ingredients,
    instructions: c.instructions,
    flavourProfile: c.flavourProfile,
    whyThisOne: whyThisOne(c, ratings, moodPrompt),
    missingIngredients: c.missingIngredients,
  }))
}

// ── Recommendations ───────────────────────────────────────────────────────

// Rough price bands — spirits are $$, liqueurs $$, bitters $, mixers $
const PRICE_MAP = {
  spirit:  '$$',
  liqueur: '$$',
  bitters: '$',
  mixer:   '$',
  garnish: '$',
  other:   '$$',
}

const INGREDIENT_CATEGORIES = {
  bourbon:                  'spirit',
  'rye whiskey':            'spirit',
  scotch:                   'spirit',
  gin:                      'spirit',
  vodka:                    'spirit',
  'dark rum':               'spirit',
  'white rum':              'spirit',
  tequila:                  'spirit',
  mezcal:                   'spirit',
  'brandy / cognac':        'spirit',
  'sweet vermouth':         'liqueur',
  'dry vermouth':           'liqueur',
  amaretto:                 'liqueur',
  'triple sec / cointreau': 'liqueur',
  campari:                  'liqueur',
  aperol:                   'liqueur',
  'kahlúa':                 'liqueur',
  'st-germain':             'liqueur',
  'angostura bitters':      'bitters',
  'orange bitters':         'bitters',
  "peychaud's bitters":     'bitters',
  'club soda':              'mixer',
  'tonic water':            'mixer',
  'ginger beer':            'mixer',
  'ginger ale':             'mixer',
  cola:                     'mixer',
  'lemon juice':            'mixer',
  'lime juice':             'mixer',
  'simple syrup':           'mixer',
  grenadine:                'mixer',
  lemon:                    'garnish',
  lime:                     'garnish',
  orange:                   'garnish',
  'maraschino cherries':    'garnish',
  mint:                     'garnish',
  olives:                   'garnish',
}

function ingredientCategory(name) {
  return INGREDIENT_CATEGORIES[norm(name)] || INGREDIENT_CATEGORIES[name.toLowerCase()] || 'other'
}

function recommendationReason(name, cocktailsUnlocked, ratings) {
  const likedProfiles = ratings.filter(r => r.rating >= 4).flatMap(r => r.flavourProfile || [])
  const count = cocktailsUnlocked.length

  const base =
    count === 1
      ? `Adding ${name} unlocks ${cocktailsUnlocked[0]}.`
      : `Adding ${name} unlocks ${count} new cocktails including ${cocktailsUnlocked.slice(0, 2).join(' and ')}.`

  // Find flavour overlap
  const relatedCocktails = COCKTAILS.filter(c => cocktailsUnlocked.includes(c.name))
  const profiles = [...new Set(relatedCocktails.flatMap(c => c.flavourProfile))]
  const matching = profiles.filter(p => likedProfiles.includes(p))

  if (matching.length > 0) {
    return `${base} These lean ${matching[0]}, which you've enjoyed before.`
  }
  return `${base} A worthwhile addition that broadens your range considerably.`
}

export function getRecommendations(cabinet, ratings, budget) {
  // All unique recipe ingredients
  const allIngredients = [...new Set(COCKTAILS.flatMap(c => c.ingredients))]

  // Only ingredients not already in cabinet
  const missing = allIngredients.filter(ing => !hasIngredient(cabinet, ing))

  const scored = missing.map(ingredient => {
    // Cocktails this ingredient would unlock (all other ingredients already owned)
    const unlocked = COCKTAILS.filter(cocktail => {
      if (!cocktail.ingredients.includes(ingredient)) return false
      const otherMissing = cocktail.ingredients
        .filter(i => i !== ingredient)
        .filter(i => !hasIngredient(cabinet, i))
      return otherMissing.length === 0
    })

    const category = ingredientCategory(ingredient)
    const priceRange = PRICE_MAP[category] || '$$'

    return {
      name: ingredient,
      category,
      priceRange,
      cocktailsUnlocked: unlocked.map(c => c.name),
      score: unlocked.length,
    }
  })

  // Filter by budget preference
  let filtered = scored
  if (budget === '$')   filtered = scored.filter(r => r.priceRange === '$')
  if (budget === '$$$') filtered = [...scored.filter(r => r.priceRange === '$$$'), ...scored]

  const top = (filtered.length > 0 ? filtered : scored)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // take top 8 then diversify

  // Diversify by category — prefer at most 2 of the same
  const result = []
  const categoryCounts = {}
  for (const rec of top) {
    if (result.length >= 4) break
    const c = rec.category
    if ((categoryCounts[c] || 0) >= 2) continue
    categoryCounts[c] = (categoryCounts[c] || 0) + 1
    result.push({
      ...rec,
      reason: recommendationReason(rec.name, rec.cocktailsUnlocked, ratings),
    })
  }

  // Pad to 4 if diversification left gaps
  for (const rec of scored.sort((a, b) => b.score - a.score)) {
    if (result.length >= 4) break
    if (!result.find(r => r.name === rec.name)) {
      result.push({
        ...rec,
        reason: recommendationReason(rec.name, rec.cocktailsUnlocked, ratings),
      })
    }
  }

  return result.slice(0, 4)
}

// ── Cabinet context helpers (kept for compatibility) ──────────────────────

export function buildCabinetContext(cabinet) {
  const spirits = cabinet.filter(i => i.category === 'spirit').map(i => i.name)
  const mixers  = cabinet.filter(i => i.category === 'mixer').map(i => i.name)
  const other   = cabinet.filter(i => !['spirit', 'mixer'].includes(i.category)).map(i => i.name)
  let ctx = ''
  if (spirits.length) ctx += `Spirits on hand: ${spirits.join(', ')}.\n`
  if (mixers.length)  ctx += `Mixers on hand: ${mixers.join(', ')}.\n`
  if (other.length)   ctx += `Other ingredients: ${other.join(', ')}.\n`
  return ctx
}
