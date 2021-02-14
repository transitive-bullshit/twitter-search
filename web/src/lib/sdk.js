const host = 'http://localhost:4000'

export async function getIndex() {
  return fetch(`${host}/`).then((res) => res.json())
}

export async function syncIndex() {
  return fetch(`${host}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json())
}
