import { View, Text } from 'react-native';
import type { PredictionResult } from '@/lib/types';
import { COLORS } from '@/lib/constants';

interface PredictionCardProps {
  result: PredictionResult;
  homeTeamName: string;
  awayTeamName: string;
}

export function PredictionCard({ result, homeTeamName, awayTeamName }: PredictionCardProps) {
  const confidence = result.confidence;
  const confidenceColor = confidence >= 7 ? COLORS.gold : confidence >= 4 ? '#F59E0B' : COLORS.muted;
  return (
    <View className="bg-surface border border-border rounded-2xl p-4">
      <View className="flex-row items-center mb-4">
        <Text className="text-gold font-bold text-base mr-2">📈🧮</Text>
        <Text className="text-primary font-bold text-base">AI Prediction</Text>
        <View className="ml-auto flex-row items-center">
          <Text className="text-muted text-xs mr-1">Confidence</Text>
          <Text style={{ color: confidenceColor }} className="font-bold text-sm">{String(confidence)}/10</Text>
        </View>
      </View>
      {result.type === 'outcome' && (
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 items-center bg-elevated rounded-xl p-3 mr-2">
            <Text className="text-muted text-xs mb-1" numberOfLines={1}>{homeTeamName}</Text>
            <Text className="text-gold font-bold text-xl">{String(result.home_win_pct)}%</Text>
          </View>
          {result.draw_pct !== undefined && result.draw_pct > 0 && (
            <View className="items-center bg-elevated rounded-xl p-3 mr-2 w-20">
              <Text className="text-muted text-xs mb-1">Draw</Text>
              <Text className="text-muted font-bold text-xl">{String(result.draw_pct)}%</Text>
            </View>
          )}
          <View className="flex-1 items-center bg-elevated rounded-xl p-3">
            <Text className="text-muted text-xs mb-1" numberOfLines={1}>{awayTeamName}</Text>
            <Text className="text-gold font-bold text-xl">{String(result.away_win_pct)}%</Text>
          </View>
        </View>
      )}
      {result.type === 'prop' && (
        <View className="bg-elevated rounded-xl p-3 mb-4 items-center">
          <Text className="text-gold font-bold text-3xl">{String(result.prop_probability)}%</Text>
          <Text className="text-muted text-xs mt-1">Probability • {result.prop_hit_rate} historical hit rate</Text>
        </View>
      )}
      <Text className="text-muted text-sm leading-5">{result.reasoning}</Text>
    </View>
  );
}
