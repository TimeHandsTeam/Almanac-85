import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Article } from '@/lib/types';

interface ArticleCardProps { article: Article; onPress?: () => void; }

export function ArticleCard({ article, onPress }: ArticleCardProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  return (
    <TouchableOpacity onPress={onPress} className="bg-surface border border-border rounded-2xl overflow-hidden mb-3" activeOpacity={0.7}>
      {article.image_url && (
        <Image source={{ uri: article.image_url }} className="w-full h-40" resizeMode="cover" />
      )}
      <View className="p-4">
        <Text className="text-primary font-bold text-base leading-5 mb-2" numberOfLines={2}>{article.title}</Text>
        {article.summary && <Text className="text-muted text-sm mb-2" numberOfLines={2}>{article.summary}</Text>}
        <Text className="text-muted text-xs">{timeAgo(article.published_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}
