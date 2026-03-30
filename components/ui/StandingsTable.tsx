import { View, Text } from 'react-native';
import type { Standing } from '@/lib/types';

interface StandingsTableProps { standings: Standing[]; }

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <View className="bg-surface border border-border rounded-2xl overflow-hidden">
      <View className="flex-row px-4 py-2 border-b border-border">
        <Text className="text-muted text-xs w-8">#</Text>
        <Text className="text-muted text-xs flex-1">Team</Text>
        <Text className="text-muted text-xs w-8 text-center">P</Text>
        <Text className="text-muted text-xs w-8 text-center">W</Text>
        <Text className="text-muted text-xs w-8 text-center">D</Text>
        <Text className="text-muted text-xs w-8 text-center">L</Text>
        <Text className="text-muted text-xs w-10 text-center font-bold">Pts</Text>
      </View>
      {standings.map((s, index) => (
        <View key={s.id} className={`flex-row px-4 py-3 items-center ${index < standings.length - 1 ? 'border-b border-border' : ''}`}>
          <Text className="text-muted text-sm w-8">{String(s.position)}</Text>
          <Text className="text-primary text-sm flex-1 font-medium" numberOfLines={1}>{s.team?.short_name ?? s.team_id}</Text>
          <Text className="text-muted text-sm w-8 text-center">{String(s.played)}</Text>
          <Text className="text-muted text-sm w-8 text-center">{String(s.won)}</Text>
          <Text className="text-muted text-sm w-8 text-center">{String(s.drawn)}</Text>
          <Text className="text-muted text-sm w-8 text-center">{String(s.lost)}</Text>
          <Text className="text-primary text-sm w-10 text-center font-bold">{String(s.points)}</Text>
        </View>
      ))}
    </View>
  );
}
