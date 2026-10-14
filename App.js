
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AutoGamer from './modules/auto-gamer';

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [screen, setScreen] = useState(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [installed, enabled] = await Promise.all([
        AutoGamer.getInstalledGames(),
        Promise.resolve(
          AutoGamer.isAccessibilityServiceConnected()
        ),
      ]);

      setGames(installed);
      setAccessibilityEnabled(enabled);
    } catch (e) {
      setError(e?.message || 'تعذّر تحميل التطبيقات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const subscription = AppState.addEventListener(
      'change',
      state => {
        if (state === 'active') refresh();
      }
    );

    return () => subscription.remove();
  }, [refresh]);

  const launchGame = async game => {
    try {
      setError('');
      setScreen(null);
      setSelectedGame(game);
      await AutoGamer.launchGame(game.packageName);
    } catch (e) {
      setError(e?.message || 'تعذّر فتح اللعبة');
    }
  };

  const openAccessibility = () => {
    try {
      AutoGamer.openAccessibilitySettings();
    } catch (e) {
      setError(e?.message || 'تعذّر فتح الإعدادات');
    }
  };

  const analyzeScreen = () => {
    try {
      setError('');

      if (!AutoGamer.isAccessibilityServiceConnected()) {
        setAccessibilityEnabled(false);
        setError('فعّل خدمة Auto Gamer AI من إعدادات إمكانية الوصول أولاً.');
        return;
      }

      const result = AutoGamer.readCurrentScreen();
      setScreen(result);

      if (!result.success) {
        setError(result.message || 'تعذّر تحليل الشاشة');
      }
    } catch (e) {
      setError(e?.message || 'فشل تحليل الشاشة');
    }
  };

  const renderGame = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        selectedGame?.packageName === item.packageName &&
          styles.selectedCard,
      ]}
      onPress={() => launchGame(item)}
      activeOpacity={0.8}
    >
      <View style={styles.gameIcon}>
        <Text style={styles.gameIconText}>🎮</Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        <Text style={styles.packageName} numberOfLines={1}>
          {item.packageName}
        </Text>
      </View>

      <Text style={styles.launchText}>فتح</Text>
    </TouchableOpacity>
  );

  const renderElement = ({ item, index }) => (
    <View style={styles.elementCard}>
      <Text style={styles.elementTitle}>
        {index + 1}. {item.text || item.description || 'عنصر بدون نص'}
      </Text>

      <Text style={styles.elementMeta}>
        {item.className || 'عنصر واجهة'}
      </Text>

      <Text style={styles.elementMeta}>
        الموقع: ({item.centerX}, {item.centerY}) ·
        {item.width}×{item.height}
      </Text>

      <Text style={styles.elementMeta}>
        {item.clickable ? 'قابل للنقر' : 'غير قابل للنقر'}
        {' · '}
        {item.enabled ? 'مفعّل' : 'معطّل'}
        {item.scrollable ? ' · قابل للتمرير' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090B10" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>AG</Text>
          </View>

          <Text style={styles.title}>AUTO GAMER AI</Text>
          <Text style={styles.subtitle}>
            مساعد ذكي لتحليل الألعاب والتحكم بها
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                accessibilityEnabled
                  ? styles.statusOn
                  : styles.statusOff,
              ]}
            />
            <Text style={styles.statusText}>
              {accessibilityEnabled
                ? 'خدمة التحكم مفعّلة'
                : 'خدمة التحكم غير مفعّلة'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={openAccessibility}
          >
            <Text style={styles.secondaryButtonText}>
              إعدادات إمكانية الوصول
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>التطبيقات والألعاب</Text>

          <TouchableOpacity onPress={refresh}>
            <Text style={styles.refreshText}>تحديث القائمة ↻</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            color="#D9B46B"
            size="large"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={games}
            renderItem={renderGame}
            keyExtractor={item => item.packageName}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                ما لقينا تطبيقات قابلة للتشغيل.
              </Text>
            }
          />
        )}

        {selectedGame && (
          <View style={styles.analysisCard}>
            <Text style={styles.sectionTitle}>تحليل الشاشة</Text>

            <Text style={styles.selectedGameText}>
              التطبيق المحدد: {selectedGame.name}
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={analyzeScreen}
            >
              <Text style={styles.primaryButtonText}>
                تحليل الشاشة الحالية
              </Text>
            </TouchableOpacity>

            {screen && (
              <View style={styles.resultSummary}>
                <Text style={styles.resultText}>
                  {screen.message}
                </Text>
                <Text style={styles.resultText}>
                  عدد العناصر: {screen.totalElements}
                </Text>
                <Text style={styles.resultText}>
                  العناصر المعروضة: {screen.elements.length}
                </Text>

                {screen.truncated && (
                  <Text style={styles.warningText}>
                    تم بلوغ حد القراءة؛ بعض العناصر لم تُقرأ.
                  </Text>
                )}

                {screen.elements.length === 0 ? (
                  <Text style={styles.emptyText}>
                    ما ظهرت عناصر قابلة للقراءة. هاللعبة ممكن تحتاج
                    تحليل صور منفصل.
                  </Text>
                ) : (
                  screen.elements.map((item, index) => (
                    <View key={`${index}-${item.centerX}-${item.centerY}`}>
                      {renderElement({ item, index })}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {!!error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          التحليل الحالي يقرأ عناصر الواجهة التي يتيحها أندرويد؛
          لا يشغّل لعباً مستقلاً ولا يضمن الفوز.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B10',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 26,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#D9B46B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    color: '#D9B46B',
    fontSize: 25,
    fontWeight: '900',
  },
  title: {
    color: '#F5F2EA',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  subtitle: {
    color: '#9298A5',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#131720',
    borderColor: '#282D39',
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 26,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 9,
  },
  statusOn: {
    backgroundColor: '#55D69E',
  },
  statusOff: {
    backgroundColor: '#E2A65C',
  },
  statusText: {
    color: '#E7E8EC',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#414653',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#D9B46B',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: '#F4F1E9',
    fontSize: 17,
    fontWeight: '800',
  },
  refreshText: {
    color: '#D9B46B',
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 28,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131720',
    borderWidth: 1,
    borderColor: '#282D39',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: '#D9B46B',
  },
  gameIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#202532',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconText: {
    fontSize: 22,
  },
  gameInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  gameName: {
    color: '#F5F2EA',
    fontSize: 14,
    fontWeight: '700',
  },
  packageName: {
    color: '#858B99',
    fontSize: 10,
    marginTop: 5,
  },
  launchText: {
    color: '#D9B46B',
    fontWeight: '800',
    paddingHorizontal: 6,
  },
  analysisCard: {
    marginTop: 18,
    padding: 15,
    backgroundColor: '#131720',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#282D39',
  },
  selectedGameText: {
    color: '#A7ADBA',
    marginTop: 9,
    marginBottom: 15,
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#D9B46B',
    borderRadius: 11,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#15130F',
    fontWeight: '900',
    fontSize: 14,
  },
  resultSummary: {
    marginTop: 15,
  },
  resultText: {
    color: '#C9CED8',
    fontSize: 12,
    marginBottom: 6,
  },
  warningText: {
    color: '#F0BD70',
    fontSize: 12,
    marginVertical: 8,
  },
  elementCard: {
    backgroundColor: '#1A1F2A',
    padding: 11,
    borderRadius: 10,
    marginTop: 8,
  },
  elementTitle: {
    color: '#F4F1E9',
    fontSize: 13,
    fontWeight: '700',
  },
  elementMeta: {
    color: '#9BA2B1',
    fontSize: 11,
    marginTop: 5,
  },
  emptyText: {
    color: '#939AA8',
    textAlign: 'center',
    lineHeight: 21,
    marginVertical: 15,
  },
  errorCard: {
    backgroundColor: '#321C22',
    borderColor: '#71343D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  errorText: {
    color: '#FFC2C7',
    fontSize: 12,
    lineHeight: 19,
  },
  footer: {
    color: '#737A88',
    fontSize: 10,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 25,
  },
});
