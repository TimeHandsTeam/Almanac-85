import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { SportTab } from '@/components/ui/SportTab';
import { PredictionCard } from '@/components/ui/PredictionCard';
import { CreditBadge } from '@/components/ui/CreditBadge';
import { PurchaseSheet } from '@/components/ui/PurchaseSheet';
import { usePrediction } from '@/hooks/usePrediction';
import { useCredits } from '@/hooks/useCredits';
import { COLORS, PREDICTION_COST } from '@/lib/constants';
import type { BottomSheetRef } from '@/components/ui/PurchaseSheet';

type PredictMode = 'outcome' | 'prop';

export default function PredictScreen() {
  const [sport, setSport] = useState('basketball');
  const [mode, setMode] = useState<PredictMode>('outcome');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [propText, setPropText] = useState('');
  const purchaseSheetRef = useRef<BottomSheetRef>(null);

  const { predict, result, loading, error, reset } = usePrediction();
  const { balance } = useCredits();

  const canSubmit = balance >= PREDICTION_COST && !loading && (
    mode === 'outcome' ? homeTeam.trim().length > 0 && awayTeam.trim().length > 0
                       : propText.trim().length > 0
  );

  const handlePredict = async () => {
    reset();
    if (mode === 'outcome') {
      await predict({ type: 'outcome', sport, homeTeam: homeTeam.trim(), awayTeam: awayTeam.trim() });
    } else {
      await predict({ type: 'prop', sport, propDescription: propText.trim() });
    }
  };

  const handleModeChange = (next: PredictMode) => {
    setMode(next);
    reset();
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-2xl font-bold text-primary">📈🧮 Predict</Text>
            <View className="flex-row items-center gap-3">
              <CreditBadge balance={balance} />
              {balance < PREDICTION_COST && (
                <TouchableOpacity
                  onPress={() => purchaseSheetRef.current?.open()}
                  className="bg-gold px-3 py-1.5 rounded-full"
                >
                  <Text className="text-background text-xs font-bold">Buy Credits</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Sport selector */}
          <SportTab selectedSlug={sport} onSelect={(s) => { setSport(s); reset(); }} />

          {/* Mode toggle */}
          <View className="flex-row mx-4 mb-4 bg-surface rounded-xl p-1">
            {(['outcome', 'prop'] as PredictMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => handleModeChange(m)}
                className={`flex-1 py-2 rounded-lg items-center ${mode === m ? 'bg-gold' : ''}`}
              >
                <Text className={`text-sm font-semibold ${mode === m ? 'text-background' : 'text-muted'}`}>
                  {m === 'outcome' ? '🏆 Game Outcome' : '📊 Prop Bet'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input area */}
          <View className="mx-4 mb-4">
            {mode === 'outcome' ? (
              <View className="gap-3">
                <View>
                  <Text className="text-muted text-xs mb-1.5 uppercase tracking-wider">Home Team</Text>
                  <TextInput
                    value={homeTeam}
                    onChangeText={setHomeTeam}
                    placeholder="e.g. Los Angeles Lakers"
                    placeholderTextColor={COLORS.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-primary"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                <View className="items-center">
                  <Text className="text-muted text-sm font-bold">vs</Text>
                </View>
                <View>
                  <Text className="text-muted text-xs mb-1.5 uppercase tracking-wider">Away Team</Text>
                  <TextInput
                    value={awayTeam}
                    onChangeText={setAwayTeam}
                    placeholder="e.g. Boston Celtics"
                    placeholderTextColor={COLORS.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-primary"
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={canSubmit ? handlePredict : undefined}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-muted text-xs mb-1.5 uppercase tracking-wider">Prop Description</Text>
                <TextInput
                  value={propText}
                  onChangeText={setPropText}
                  placeholder={`e.g. LeBron James over 25.5 points`}
                  placeholderTextColor={COLORS.muted}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-primary"
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                  returnKeyType="done"
                />
              </View>
            )}
          </View>

          {/* Submit button */}
          <View className="mx-4 mb-4">
            {balance < PREDICTION_COST ? (
              <TouchableOpacity
                onPress={() => purchaseSheetRef.current?.open()}
                className="bg-gold rounded-xl py-4 items-center"
              >
                <Text className="text-background font-bold text-base">Buy Credits to Predict</Text>
                <Text className="text-background/70 text-xs mt-0.5">Each prediction costs 1 credit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handlePredict}
                disabled={!canSubmit}
                className={`rounded-xl py-4 items-center ${canSubmit ? 'bg-gold' : 'bg-surface'}`}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <>
                    <Text className={`font-bold text-base ${canSubmit ? 'text-background' : 'text-muted'}`}>
                      Analyze with AI
                    </Text>
                    <Text className={`text-xs mt-0.5 ${canSubmit ? 'text-background/70' : 'text-muted'}`}>
                      1 credit · {balance} remaining
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Error */}
          {error ? (
            <View className="mx-4 mb-4 bg-danger/10 border border-danger/30 rounded-xl p-4">
              <Text className="text-danger text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Result */}
          {result ? (
            <View className="mx-4">
              <PredictionCard
                result={result}
                homeTeamName={mode === 'outcome' ? homeTeam : ''}
                awayTeamName={mode === 'outcome' ? awayTeam : ''}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <PurchaseSheet ref={purchaseSheetRef} onPurchaseComplete={() => {}} />
    </ScreenWrapper>
  );
}
