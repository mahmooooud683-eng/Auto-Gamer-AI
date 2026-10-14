
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
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
  const [serviceEnabled, setServiceEnabled] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await AutoGamer.getInstalledGames();
      setGames(result);
    } catch (error) {
      Alert.alert(
        'تعذّر تحميل الألعاب',
        'تأكد من إعداد الموديول وبناء التطبيق بشكل صحيح.'
      );
    } finally {
      setLoading(false);
    }

    try {
      setServiceEnabled(
        AutoGamer.isAccessibilityServiceConnected()
      );
    } catch {
      setServiceEnabled(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          refresh();
        }
      }
    );

    return () => subscription.remove();
  }, [refresh]);

  const openSettings = () => {
    try {
      AutoGamer.openAccessibilitySettings();
    } catch {
      Alert.alert('خطأ', 'تعذّر فتح إعدادات إمكانية الوصول.');
    }
  };

  const launchGame = async (game) => {
    setOpening(game.packageName);

    try {
      await AutoGamer.launchGame(game.packageName);
    } catch (error) {
      Alert.alert(
        'تعذّر فتح اللعبة',
        error?.message || 'تأكد أن اللعبة مثبّتة.'
      );
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
        onPress={() => launchGame(item)}
        disabled={opening !== null}
      >
        {opening === item.packageName ? (
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.playText}>فتح اللعبة</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar
        backgroundColor="#0A0A0A"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <Text style={styles.logo}>AUTO GAMER AI</Text>
        <Text style={styles.title}>مساعد الألعاب الذكي</Text>
        <Text style={styles.subtitle}>
          ألعابك بمكان واحد
        </Text>
      </View>

      <View style={styles.controlCard}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              serviceEnabled && styles.statusDotOn,
            ]}
          />
          <Text style={styles.statusText}>
            {serviceEnabled
              ? 'خدمة التحكم متصلة'
              : 'خدمة التحكم غير مفعّلة'}
          </Text>
        </View>

        <Pressable
          style={styles.settingsButton}
          onPress={openSettings}
        >
          <Text style={styles.settingsButtonText}>
            إعدادات التحكم
          </Text>
        </Pressable>

        <Text style={styles.hint}>
          فعّل الخدمة يدوياً من إعدادات أندرويد.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ألعاب الجهاز</Text>
        <Pressable onPress={refresh} disabled={loading}>
          <Text style={styles.refreshText}>تحديث ↻</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D6AD55" />
          <Text style={styles.hint}>جارٍ تحميل القائمة...</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.packageName}
          renderItem={renderGame}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>
                ما لقينا ألعاب
              </Text>
              <Text style={styles.hint}>
                تأكد من تثبيت ألعاب قابلة للتشغيل.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>AUTO GAMER AI</Text>
        <Text style={styles.footerSubtitle}>
          اكتشاف الألعاب وفتحها والتحكم الأساسي
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#302719',
  },
  logo: {
    color: '#D6AD55',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  title: {
    color: '#FFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 13,
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 7,
  },
  controlCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#493A20',
    borderRadius: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#777',
  },
  statusDotOn: {
    backgroundColor: '#5BD48A',
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  settingsButton: {
    marginTop: 15,
    backgroundColor: '#D6AD55',
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 15,
  },
  hint: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  refreshText: {
    color: '#D6AD55',
    fontSize: 14,
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
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#393024',
    borderRadius: 14,
  },
  gameInfo: {
    flex: 1,
    marginEnd: 12,
  },
  gameName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  packageName: {
    color: '#888',
    fontSize: 10,
    marginTop: 5,
  },
  playButton: {
    backgroundColor: '#D6AD55',
    paddingHorizontal: 13,
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: {
    color: '#111',
    fontSize: 12,
    fontWeight: '900',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#292319',
  },
  footerTitle: {
    color: '#D6AD55',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footerSubtitle: {
    color: '#777',
    fontSize: 10,
    marginTop: 5,
  },
});
