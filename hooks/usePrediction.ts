import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PredictionResult } from '@/lib/types'

export type PredictionRequest =
  | { type: 'outcome'; sport: string; homeTeam: string; awayTeam: string; matchId?: string }
  | { type: 'prop'; sport: string; propDescription: string; matchId?: string }

interface UsePredictionReturn {
  predict: (req: PredictionRequest) => Promise<PredictionResult | null>
  result: PredictionResult | null
  loading: boolean
  error: string | null
  reset: () => void
}

export function usePrediction(): UsePredictionReturn {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = async (req: PredictionRequest): Promise<PredictionResult | null> => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-predict', {
        body: req,
      })

      if (fnError) {
        const msg = fnError.message ?? 'Prediction failed'
        setError(msg)
        return null
      }

      if (data?.error) {
        setError(data.error)
        return null
      }

      const predResult: PredictionResult = data?.result
      setResult(predResult)
      return predResult
    } catch (err) {
      setError(String(err))
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return { predict, result, loading, error, reset }
}
