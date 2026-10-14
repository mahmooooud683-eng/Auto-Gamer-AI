
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AutoGamer from './modules/auto-gamer';

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(null);
  const [error, setError] = useState('');

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const installedGames = await AutoGamer.getInstalledGames();
      setGames(installedGames);
    } catch (e) {
      setError(
        'تعذّر تحميل الألعاب. تأكد من إعداد الموديول ثم أعد تشغيل التطبيق.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const openGame = async (game) => {
    setOpening(game.packageName);

    try {
      await AutoGamer.launchGame(game.packageName);
    } catch (e) {
      Alert.alert('تعذّر فتح اللعبة', 'تأكد أن اللعبة ما زالت مثبّتة.');
    } finally {
      setOpening(null);
    }
  };

  const renderGame = ({ item }) => (
    <View style={styles.gameCard}>
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        <Text style={styles.packageName} numberOfLines={1}>
          {item.packageName}
        </Text>
      </View>

      <Pressable
        style={styles.playButton}
        onPress={() => openGame(item)}
        disabled={opening !== null}
      >
        {opening === item.packageName ? (
          <ActivityIndicator color="#111111" />
        ) : (
          <Text style={styles.playText}>فتح</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar backgroundColor="#0A0A0A" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>AUTO GAMER</Text>
        <Text style={styles.title}>مساعد الألعاب الذكي</Text>
        <Text style={styles.subtitle}>
          ألعابك المثبّتة بمكان واحد
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ألعاب الجهاز</Text>
        <Pressable onPress={loadGames} disabled={loading}>
          <Text style={styles.refresh}>تحديث القائمة ↻</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D6AD55" />
          <Text style={styles.message}>عم نبحث عن الألعاب...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadGames}>
            <Text style={styles.playText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.packageName}
          renderItem={renderGame}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>ما لقينا ألعاب</Text>
              <Text style={styles.message}>
                تأكد من تثبيت ألعاب فيها أيقونة تشغيل.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>AUTO GAMER AI</Text>
        <Text style={styles.footerText}>
          الإصدار الأول • اكتشاف الألعاب وفتحها
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#292319',
  },
  logo: {
    color: '#D6AD55',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    color: '#A5A5A5',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 9,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  refresh: {
    color: '#D6AD55',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderColor: '#393024',
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 11,
  },
  gameInfo: {
    flex: 1,
    marginEnd: 12,
  },
  gameName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'left',
  },
  packageName: {
    color: '#898989',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'left',
  },
  playButton: {
    backgroundColor: '#D6AD55',
    minWidth: 66,
    minHeight: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  playText: {
    color: '#111111',
    fontWeight: '900',
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  message: {
    color: '#A5A5A5',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
  },
  error: {
    color: '#FF8D8D',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 23,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  retryButton: {
    backgroundColor: '#D6AD55',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 17,
    borderTopWidth: 1,
    borderTopColor: '#292319',
  },
  footerTitle: {
    color: '#D6AD55',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footerText: {
    color: '#777777',
    fontSize: 11,
    marginTop: 5,
  },
});
