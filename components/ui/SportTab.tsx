import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { SPORTS } from '@/lib/constants';

interface SportTabProps { selectedSlug: string; onSelect: (slug: string) => void; }

export function SportTab({ selectedSlug, onSelect }: SportTabProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3" contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
      {SPORTS.map((sport) => {
        const isSelected = sport.slug === selectedSlug;
        return (
          <TouchableOpacity
            key={sport.id}
            onPress={() => onSelect(sport.slug)}
            className={`flex-row items-center px-4 py-2 rounded-full border ${isSelected ? 'bg-gold border-gold' : 'bg-surface border-border'}`}
          >
            <Text className="mr-1">{sport.icon}</Text>
            <Text className={`text-sm font-semibold ${isSelected ? 'text-background' : 'text-muted'}`}>{sport.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
