export async function getIndex() {
  return fetch('/api/get-index').then((res) => res.json())
}

export async function syncIndex() {
  return fetch('/api/sync-index', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json())
}
