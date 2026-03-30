import { View, Text, FlatList, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { MatchCard } from '@/components/ui/MatchCard';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { CreditBadge } from '@/components/ui/CreditBadge';
import { useScores } from '@/hooks/useScores';
import { useNews } from '@/hooks/useNews';
import { useCredits } from '@/hooks/useCredits';

type FeedItem =
  | { kind: 'header'; title: string; key: string }
  | { kind: 'match'; data: any; key: string }
  | { kind: 'article'; data: any; key: string };

export default function HomeScreen() {
  const { matches, loading: scoresLoading, refresh: refreshScores } = useScores('basketball');
  const { articles, loading: newsLoading, refresh: refreshNews } = useNews('basketball');
  const { balance } = useCredits();

  const loading = scoresLoading && newsLoading;

  const feed: FeedItem[] = [
    { kind: 'header', title: 'Live & Upcoming', key: 'h-scores' },
    ...matches.slice(0, 3).map((m) => ({ kind: 'match' as const, data: m, key: `match-${m.id}` })),
    { kind: 'header', title: 'Latest News', key: 'h-news' },
    ...articles.slice(0, 5).map((a) => ({ kind: 'article' as const, data: a, key: `article-${a.id}` })),
  ];

  const refresh = () => { refreshScores(); refreshNews(); };

  return (
    <ScreenWrapper>
      <View className="flex-row items-center px-4 pt-4 pb-2 justify-between">
        <View>
          <Text className="text-2xl font-bold text-primary">Sports</Text>
          <Text className="text-2xl font-bold text-gold">Almanac85</Text>
        </View>
        <CreditBadge balance={balance} />
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C9A84C" size="large" />
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            if (item.kind === 'header') {
              return <Text className="text-lg font-bold text-primary px-4 pt-4 pb-2">{item.title}</Text>;
            }
            if (item.kind === 'match') {
              return <View className="px-4"><MatchCard match={item.data} /></View>;
            }
            return (
              <View className="px-4">
                <ArticleCard article={item.data} onPress={() => Linking.openURL(item.data.source_url)} />
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={scoresLoading || newsLoading} onRefresh={refresh} tintColor="#C9A84C" />}
        />
      )}
    </ScreenWrapper>
  );
}
