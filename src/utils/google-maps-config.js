import axios from 'axios'

// Deployment-owned configuration is excluded from Git and build output.
export async function loadGoogleMapsApiKey() {
  const { data } = await axios.get('/maps-config.json', { timeout: 5000 })
  const key = data && typeof data.googleMapsApiKey === 'string'
    ? data.googleMapsApiKey.trim()
    : ''
  if (!key) throw new Error('Google Maps runtime configuration is missing')
  return key
}
