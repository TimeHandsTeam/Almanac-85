import { useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { SportTab } from '@/components/ui/SportTab';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { useNews } from '@/hooks/useNews';

export default function NewsScreen() {
  const [selectedSport, setSelectedSport] = useState('basketball');
  const { articles, loading, refresh } = useNews(selectedSport);

  return (
    <ScreenWrapper>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-primary">News</Text>
      </View>
      <SportTab selectedSlug={selectedSport} onSelect={setSelectedSport} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C9A84C" size="large" />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArticleCard article={item} onPress={() => Linking.openURL(item.source_url)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#C9A84C" />}
          ListEmptyComponent={<View className="items-center py-12"><Text className="text-muted text-base">No articles yet</Text></View>}
        />
      )}
    </ScreenWrapper>
  );
}
