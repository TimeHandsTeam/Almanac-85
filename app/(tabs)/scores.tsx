import { useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { SportTab } from '@/components/ui/SportTab';
import { MatchCard } from '@/components/ui/MatchCard';
import { StandingsTable } from '@/components/ui/StandingsTable';
import { useScores } from '@/hooks/useScores';
import { useStandings } from '@/hooks/useStandings';

type ViewMode = 'scores' | 'standings';

export default function ScoresScreen() {
  const [selectedSport, setSelectedSport] = useState('basketball');
  const [viewMode, setViewMode] = useState<ViewMode>('scores');
  const { matches, loading: scoresLoading, refresh } = useScores(selectedSport);
  const { standings, loading: standingsLoading } = useStandings(selectedSport);

  const loading = viewMode === 'scores' ? scoresLoading : standingsLoading;

  return (
    <ScreenWrapper>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-primary">Scores</Text>
      </View>
      <SportTab selectedSlug={selectedSport} onSelect={setSelectedSport} />
      <View className="flex-row mx-4 mb-3 bg-surface rounded-xl p-1">
        {(['scores', 'standings'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setViewMode(mode)}
            className={`flex-1 py-2 rounded-lg items-center ${viewMode === mode ? 'bg-gold' : ''}`}
          >
            <Text className={`text-sm font-semibold capitalize ${viewMode === mode ? 'text-background' : 'text-muted'}`}>
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C9A84C" size="large" />
        </View>
      ) : viewMode === 'scores' ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchCard match={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={scoresLoading} onRefresh={refresh} tintColor="#C9A84C" />}
          ListEmptyComponent={<View className="items-center py-12"><Text className="text-muted text-base">No matches today</Text></View>}
        />
      ) : (
        <View className="px-4 pt-2">
          {standings.length > 0
            ? <StandingsTable standings={standings} />
            : <Text className="text-muted text-center py-12">No standings available</Text>}
        </View>
      )}
    </ScreenWrapper>
  );
}
