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

  useEffect(() => {
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
        if (!response.ok) throw new Error(`Failed to fetch ${cacheKey} data`)
        let result = await response.json()
        
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
      } catch (error) {
        console.error(`Error fetching ${cacheKey} data:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
  }, [url, cacheKey, cacheDuration, pollInterval, transformData])

  return { data, loading }
}