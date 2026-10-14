
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';

const COLORS = {
  bg: '#090B10',
  card: '#141923',
  gold: '#E8BD62',
  white: '#FFFFFF',
  muted: '#929AAA',
  border: '#272E3B',
};

const GAME_TYPES = [
  { id: 'puzzle', name: 'ألعاب الألغاز', icon: '🧩' },
  { id: 'arcade', name: 'ألعاب المراحل', icon: '🎮' },
  { id: 'racing', name: 'ألعاب السيارات', icon: '🏎️' },
  { id: 'casual', name: 'ألعاب أخرى', icon: '🎯' },
];

export default function App() {
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>AUTO GAMER</Text>
          <Text style={styles.version}>AI GAMING ASSISTANT</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.robot}>🤖</Text>
          <Text style={styles.title}>خلّي الروبوت يلعب عنك</Text>
          <Text style={styles.subtitle}>
            اختر لعبتك، والروبوت يحاول يتعلم كيف يلعبها تلقائياً.
          </Text>
          <View style={styles.status}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>
              {running ? 'بانتظار خدمة التحكم' : 'الروبوت متوقف'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>أنواع الألعاب</Text>

        {GAME_TYPES.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => {
              setSelected(game.id);
              setRunning(false);
            }}
            style={[
              styles.gameCard,
              selected === game.id && styles.selectedCard,
            ]}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>
                {selected === game.id
                  ? 'تم اختيار هذا النوع'
                  : 'اضغط للاختيار'}
              </Text>
            </View>
            <Text style={styles.arrow}>
              {selected === game.id ? '✓' : '›'}
            </Text>
          </Pressable>
        ))}

        <Pressable
          disabled={!selected}
          onPress={() => setRunning(true)}
          style={[
            styles.startButton,
            !selected && styles.disabledButton,
          ]}
        >
          <Text style={styles.startText}>تجهيز الروبوت</Text>
        </Pressable>

        {running && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>تم اختيار نوع الألعاب</Text>
            <Text style={styles.noticeText}>
              الواجهة جاهزة، لكن التحكم التلقائي لم يُفعّل بعد.
              يلزم ربط خدمة أندرويد واكتشاف الألعاب المثبتة.
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          AUTO GAMER AI · OFFLINE GAMES
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 22,
    paddingBottom: 36,
  },
  header: {
    paddingTop: 22,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: {
    color: COLORS.gold,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 3,
  },
  version: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 7,
  },
  hero: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 30,
  },
  robot: {
    fontSize: 54,
    marginBottom: 14,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#202733',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.gold,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'right',
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 11,
  },
  selectedCard: {
    borderColor: COLORS.gold,
    backgroundColor: '#201E19',
  },
  gameIcon: {
    fontSize: 29,
    marginRight: 14,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  gameDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  arrow: {
    color: COLORS.gold,
    fontSize: 24,
    marginLeft: 12,
  },
  startButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 15,
    padding: 17,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.4,
  },
  startText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
  },
  notice: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeTitle: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  noticeText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'right',
  },
  footer: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 30,
    letterSpacing: 1,
  },
});
