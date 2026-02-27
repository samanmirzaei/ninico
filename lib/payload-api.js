/**
 * Minimal helper for calling the Payload "public delivery pack" endpoints.
 *
 * Backend endpoints (Payload repo):
 * - GET /api/public/pages/:slug
 * - GET /api/public/posts
 * - GET /api/public/posts/:slug
 * - GET /api/public/products
 * - GET /api/public/products/:slug
 */
const getBaseURL = () =>
  process.env.PAYLOAD_API_URL ||
  process.env.NEXT_PUBLIC_PAYLOAD_API_URL ||
  'http://localhost:3000'

const joinURL = (base, path) => `${String(base).replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`

async function fetchJSON(path, init) {
  const res = await fetch(joinURL(getBaseURL(), path), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init && init.headers ? init.headers : {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err = new Error(`Request failed (${res.status}) for ${path}${body ? `: ${body}` : ''}`)
    err.status = res.status
    throw err
  }

  return res.json()
}

export const getPageBySlug = (slug) => fetchJSON(`/api/public/pages/${encodeURIComponent(slug)}`)

export const getPostsList = (params = {}) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.category) qs.set('category', String(params.category))
  if (params.q) qs.set('q', String(params.q))
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchJSON(`/api/public/posts${suffix}`)
}

export const getPostBySlug = (slug) => fetchJSON(`/api/public/posts/${encodeURIComponent(slug)}`)

export const getProductsList = (params = {}) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.category) qs.set('category', String(params.category))
  if (params.q) qs.set('q', String(params.q))
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchJSON(`/api/public/products${suffix}`)
}

export const getProductBySlug = (slug) => fetchJSON(`/api/public/products/${encodeURIComponent(slug)}`)

