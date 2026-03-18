'use client'

import { useState, useEffect } from 'react'

type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'idle' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: 'unavailable' })
      return
    }

    setState({ status: 'loading' })

    navigator.geolocation.getCurrentPosition(
      pos => setState({ status: 'success', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setState({ status: 'denied' })
        } else {
          setState({ status: 'unavailable' })
        }
      },
      { timeout: 8000, maximumAge: 5 * 60_000 },
    )
  }, [])

  return state
}
