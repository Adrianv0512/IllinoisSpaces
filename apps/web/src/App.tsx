import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { sampleReviews, spots, type Review, type Spot } from './data/spots'

type NoiseFilter = 'Any' | Spot['noise']
type Sort = 'Original order' | 'Highest rated' | 'Most reviewed' | 'Name'

const reviewsKey = 'illinois-spaces-prototype-reviews'
const viewerKey = 'illinois-spaces-prototype-viewer'

function readReviews(): Review[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(reviewsKey) ?? '[]')
    return Array.isArray(value)
      ? value.filter(
          (review) =>
            review &&
            typeof review.spotId === 'string' &&
            typeof review.body === 'string' &&
            Number.isInteger(review.rating) &&
            review.rating >= 1 &&
            review.rating <= 5,
        )
      : []
  } catch {
    return []
  }
}

function readViewer() {
  try {
    return localStorage.getItem(viewerKey) ?? ''
  } catch {
    return ''
  }
}

function ratingFor(spot: Spot, reviews: Review[]) {
  const added = reviews.filter((review) => review.spotId === spot.id)
  return (
    (spot.rating * spot.reviewCount + added.reduce((sum, review) => sum + review.rating, 0)) /
    (spot.reviewCount + added.length)
  ).toFixed(1)
}

function countFor(spot: Spot, reviews: Review[]) {
  return spot.reviewCount + reviews.filter((review) => review.spotId === spot.id).length
}

export default function App() {
  const [query, setQuery] = useState('')
  const [noise, setNoise] = useState<NoiseFilter>('Any')
  const [outlets, setOutlets] = useState(false)
  const [wifi, setWifi] = useState(false)
  const [late, setLate] = useState(false)
  const [sort, setSort] = useState<Sort>('Original order')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [mapFocusId, setMapFocusId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewer, setViewer] = useState(readViewer)
  const [nameDraft, setNameDraft] = useState('')
  const [showSignIn, setShowSignIn] = useState(false)
  const [pendingReview, setPendingReview] = useState(false)
  const [ownReviews, setOwnReviews] = useState<Review[]>(readReviews)
  const [editingReview, setEditingReview] = useState(false)
  const [ratingDraft, setRatingDraft] = useState(0)
  const [bodyDraft, setBodyDraft] = useState('')
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    localStorage.setItem(reviewsKey, JSON.stringify(ownReviews))
  }, [ownReviews])
  useEffect(() => {
    if (viewer) localStorage.setItem(viewerKey, viewer)
    else localStorage.removeItem(viewerKey)
  }, [viewer])
  useEffect(() => {
    if (selectedId) document.getElementById('location-details')?.scrollIntoView()
  }, [selectedId])

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return spots
      .filter(
        (spot) =>
          (!search ||
            `${spot.name} ${spot.area} ${spot.kind} ${spot.bestFor}`
              .toLowerCase()
              .includes(search)) &&
          (noise === 'Any' || spot.noise === noise) &&
          (!outlets || spot.outlets === 'Plenty') &&
          (!wifi || spot.wifi === 'Strong') &&
          (!late || spot.openLate),
      )
      .sort((a, b) => {
        if (sort === 'Highest rated')
          return Number(ratingFor(b, ownReviews)) - Number(ratingFor(a, ownReviews))
        if (sort === 'Most reviewed') return countFor(b, ownReviews) - countFor(a, ownReviews)
        if (sort === 'Name') return a.name.localeCompare(b.name)
        return 0
      })
  }, [query, noise, outlets, wifi, late, sort, ownReviews])

  const selected = spots.find((spot) => spot.id === selectedId) ?? null
  const mapFocus = filtered.find((spot) => spot.id === mapFocusId) ?? null
  const myReview =
    selected && viewer
      ? ownReviews.find((review) => review.spotId === selected.id && review.author === viewer)
      : undefined

  function clearFilters() {
    setQuery('')
    setNoise('Any')
    setOutlets(false)
    setWifi(false)
    setLate(false)
    setSort('Original order')
    setMapFocusId(null)
  }

  function openDetails(id: string) {
    setSelectedId(id)
    setEditingReview(false)
    setShowSignIn(false)
    setStatus('')
  }

  function startReview() {
    if (!selected) return
    if (!viewer) {
      setPendingReview(true)
      setShowSignIn(true)
      setNameDraft('')
      return
    }
    setRatingDraft(myReview?.rating ?? 0)
    setBodyDraft(myReview?.body ?? '')
    setFormError('')
    setEditingReview(true)
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = nameDraft.trim()
    if (!name) return
    setViewer(name)
    setShowSignIn(false)
    if (pendingReview) {
      setRatingDraft(0)
      setBodyDraft('')
      setEditingReview(true)
    }
    setPendingReview(false)
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !viewer) return
    if (ratingDraft === 0) {
      setFormError('Select a rating.')
      return
    }
    if (bodyDraft.trim().length < 10) {
      setFormError('Write at least 10 characters.')
      return
    }
    const review: Review = {
      id: myReview?.id ?? crypto.randomUUID(),
      spotId: selected.id,
      author: viewer,
      rating: ratingDraft,
      body: bodyDraft.trim(),
      date: 'Just now',
      own: true,
    }
    setOwnReviews((current) =>
      myReview
        ? current.map((item) => (item.id === myReview.id ? review : item))
        : [review, ...current],
    )
    setEditingReview(false)
    setFormError('')
    setStatus('Review saved. It appears below.')
  }

  function signInForm() {
    return (
      <form onSubmit={signIn}>
        <h3>Demo sign in</h3>
        <p>This is a prototype account. Enter any display name; no password is needed.</p>
        <label htmlFor="display-name">Display name: </label>
        <input
          id="display-name"
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          maxLength={40}
          required
        />{' '}
        <button type="submit">Continue</button>{' '}
        <button type="button" onClick={() => setShowSignIn(false)}>
          Cancel
        </button>
      </form>
    )
  }

  return (
    <main>
      <h1>Illinois Spaces - prototype</h1>
      <p>
        Test the steps below. Location details, ratings, and reviews are sample data. The map is a
        rough placeholder.
      </p>
      <p>
        {viewer ? (
          <>
            Demo user: {viewer}{' '}
            <button type="button" onClick={() => setViewer('')}>
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setPendingReview(false)
              setShowSignIn(true)
            }}
          >
            Demo sign in
          </button>
        )}
      </p>
      {showSignIn && !selected && signInForm()}
      <hr />

      <h2>1. Find a study space</h2>
      <p>
        <label htmlFor="spot-search">Search by name or area: </label>
        <input
          id="spot-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Grainger"
        />
      </p>
      <fieldset>
        <legend>Filters</legend>
        <label htmlFor="noise-filter">Noise level: </label>
        <select
          id="noise-filter"
          value={noise}
          onChange={(event) => setNoise(event.target.value as NoiseFilter)}
        >
          <option>Any</option>
          <option>Quiet</option>
          <option>Moderate</option>
          <option>Lively</option>
        </select>{' '}
        <label>
          <input
            type="checkbox"
            checked={outlets}
            onChange={(event) => setOutlets(event.target.checked)}
          />
          Plenty of outlets
        </label>{' '}
        <label>
          <input
            type="checkbox"
            checked={wifi}
            onChange={(event) => setWifi(event.target.checked)}
          />
          Strong Wi-Fi
        </label>{' '}
        <label>
          <input
            type="checkbox"
            checked={late}
            onChange={(event) => setLate(event.target.checked)}
          />
          Open late (sample)
        </label>
      </fieldset>
      <p>
        <button type="button" onClick={clearFilters}>
          Clear search and filters
        </button>
      </p>
      <p>
        {filtered.length} of {spots.length} spaces shown.{' '}
        <label htmlFor="sort-spots">Sort by: </label>
        <select
          id="sort-spots"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
        >
          <option>Original order</option>
          <option>Highest rated</option>
          <option>Most reviewed</option>
          <option>Name</option>
        </select>
      </p>
      <p className="mobile-switch">
        View:{' '}
        <button
          type="button"
          onClick={() => setMobileView('list')}
          aria-pressed={mobileView === 'list'}
        >
          List
        </button>{' '}
        <button
          type="button"
          onClick={() => setMobileView('map')}
          aria-pressed={mobileView === 'map'}
        >
          Map
        </button>
      </p>

      <div className={`results view-${mobileView}`}>
        <section className="location-list" aria-label="Study spaces">
          <h3>Results</h3>
          {filtered.length === 0 ? (
            <p>No locations match. Try clearing a filter.</p>
          ) : (
            <ol>
              {filtered.map((spot) => (
                <li key={spot.id}>
                  <button type="button" onClick={() => openDetails(spot.id)}>
                    {spot.name}
                  </button>{' '}
                  — {spot.area}; {spot.noise.toLowerCase()}; {spot.outlets.toLowerCase()} outlets;{' '}
                  {ratingFor(spot, ownReviews)}/5 ({countFor(spot, ownReviews)} sample ratings)
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="map-section" aria-label="Rough campus map">
          <h3>Map placeholder</h3>
          <p>Numbered markers are clickable. Positions are approximate.</p>
          <div className="map-board">
            <span className="map-label map-label-top">North campus</span>
            <span className="map-label map-label-middle">Main quad</span>
            <span className="map-label map-label-bottom">South campus</span>
            {filtered.map((spot, index) => (
              <button
                type="button"
                key={spot.id}
                className="map-marker"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                title={spot.name}
                aria-label={`Marker ${index + 1}: ${spot.name}`}
                onClick={() => setMapFocusId(spot.id)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {mapFocus && (
            <p>
              Selected marker: <strong>{mapFocus.name}</strong>.{' '}
              <button type="button" onClick={() => openDetails(mapFocus.id)}>
                View details
              </button>
            </p>
          )}
        </section>
      </div>

      {selected && (
        <section id="location-details">
          <hr />
          <h2>2. Location details</h2>
          <p>
            <button type="button" onClick={() => setSelectedId(null)}>
              Close details
            </button>
          </p>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <ul>
            <li>Area: {selected.area}</li>
            <li>Noise: {selected.noise}</li>
            <li>Outlets: {selected.outlets}</li>
            <li>Wi-Fi: {selected.wifi}</li>
            <li>Seating: {selected.seating}</li>
            <li>Best for: {selected.bestFor}</li>
          </ul>
          <p>
            Sample rating: {ratingFor(selected, ownReviews)}/5 ({countFor(selected, ownReviews)}{' '}
            ratings)
          </p>

          <h3>Sample reviews</h3>
          <ul>
            {[
              ...ownReviews.filter((review) => review.spotId === selected.id),
              ...sampleReviews.filter((review) => review.spotId === selected.id),
            ].map((review) => (
              <li key={review.id}>
                <strong>{review.author}</strong> — {review.rating}/5 — {review.date}
                <p>{review.body}</p>
                {review.own && review.author === viewer && (
                  <>
                    <button type="button" onClick={startReview}>
                      Edit review
                    </button>{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setOwnReviews((current) => current.filter((item) => item.id !== review.id))
                        setStatus('Review deleted.')
                      }}
                    >
                      Delete review
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>

          <h2>3. Leave a review</h2>
          <p>Reviews you submit in this prototype are saved in this browser only.</p>
          {!editingReview && !showSignIn && (
            <button type="button" onClick={startReview}>
              {myReview ? 'Edit your review' : 'Write a review'}
            </button>
          )}
          {showSignIn && signInForm()}
          {editingReview && (
            <form onSubmit={submitReview}>
              <fieldset>
                <legend>Rating</legend>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={ratingDraft === value}
                      onChange={() => setRatingDraft(value)}
                    />
                    {value}{' '}
                  </label>
                ))}
              </fieldset>
              <p>
                <label htmlFor="review-body">Your review:</label>
                <br />
                <textarea
                  id="review-body"
                  rows={5}
                  cols={45}
                  maxLength={2000}
                  value={bodyDraft}
                  onChange={(event) => setBodyDraft(event.target.value)}
                />
              </p>
              <p>
                <button type="submit">{myReview ? 'Save changes' : 'Post review'}</button>{' '}
                <button type="button" onClick={() => setEditingReview(false)}>
                  Cancel
                </button>
              </p>
              {formError && <p role="alert">{formError}</p>}
            </form>
          )}
          {status && <p role="status">{status}</p>}
        </section>
      )}
      <hr />
      <p>
        <small>
          CS409 prototype. Sample content; no live map, database, or real authentication yet.
        </small>
      </p>
    </main>
  )
}
