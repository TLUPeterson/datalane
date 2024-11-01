import { useState, useEffect } from "react"

interface CacheEntry<T> {
  date: T
  timestamp: number
}

const globalCache: Record<string, CacheEntry<any>> = {}

interface FetchConfig {
  url: string
  cacheKey: string
  cacheDuration: number
  pollInterval: number
  transformData?: (data: any) => any
}

export function useDataFetching<T>({
  url,
  cacheKey,
  cacheDuration,
  pollInterval,
  transformData
}: FetchConfig) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Don't fetch if URL is empty
    if (!url) {
      setLoading(false)
      setData(null)
      return
    }

    const fetchData = async () => {
      // Check cache first
      const cachedEntry = globalCache[cacheKey]
      if (cachedEntry) {
        const now = Date.now()
        if (now - cachedEntry.timestamp < cacheDuration) {
          setData(cachedEntry.data)
          setLoading(false)
          return
        }
      }

      // Fetch new data if cache is expired or empty
      try {
        const response = await fetch(url)
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`)
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        let result = await response.json()
        
        // Check if result is empty or invalid
        if (!result || (Array.isArray(result) && result.length === 0)) {
          setData(null)
          setLoading(false)
          return
        }

        // Apply transformation if provided
        if (transformData) {
          result = transformData(result)
        }

        // Update cache
        globalCache[cacheKey] = {
          data: result,
          timestamp: Date.now()
        }
        
        setData(result)
        setError(null)
      } catch (error) {
        console.error(`Error fetching ${cacheKey} data:`, error)
        setError(error instanceof Error ? error : new Error('Failed to fetch data'))
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
  }, [url, cacheKey, cacheDuration, pollInterval, transformData])

  return { data, loading, error }
}