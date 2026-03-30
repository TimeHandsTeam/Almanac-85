import { View, Text, TouchableOpacity } from 'react-native';
import type { Match } from '@/lib/types';

interface MatchCardProps { match: Match; onPress?: () => void; }

export function MatchCard({ match, onPress }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  return (
    <TouchableOpacity onPress={onPress} className="bg-surface border border-border rounded-2xl p-4 mb-3" activeOpacity={0.7}>
      {isLive && (
        <View className="flex-row items-center mb-3">
          <View className="w-2 h-2 bg-danger rounded-full mr-2" />
          <Text className="text-danger text-xs font-bold">LIVE</Text>
        </View>
      )}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 items-center">
          <Text className="text-primary font-bold text-base" numberOfLines={1}>{match.home_team?.name ?? 'Home'}</Text>
        </View>
        <View className="flex-row items-center mx-4">
          {(isLive || isFinished) ? (
            <>
              <Text className="text-primary font-bold text-2xl">{String(match.home_score ?? 0)}</Text>
              <Text className="text-muted mx-2 text-xl">-</Text>
              <Text className="text-primary font-bold text-2xl">{String(match.away_score ?? 0)}</Text>
            </>
          ) : (
            <Text className="text-muted text-sm">
              {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        <View className="flex-1 items-center">
          <Text className="text-primary font-bold text-base" numberOfLines={1}>{match.away_team?.name ?? 'Away'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
