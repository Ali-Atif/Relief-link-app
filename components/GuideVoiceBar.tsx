import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/types';
import type { GuideVoiceChunk } from '../services/guideVoiceChunks';
import { getUrduBundledGuideRecording } from '../services/guideUrduBundledAudio';
import { pickUrduTtsOptions } from '../services/pickUrduTtsVoice';
import { flexRowWithDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';

function speechStyleForChunk(tone: GuideVoiceChunk['tone'], engineLang: AppLanguage): { pitch: number; rate: number } {
  const bodyRate = engineLang === 'ur' ? 0.88 : 0.92;
  const bodyPitch = 1;
  if (tone === 'heading') {
    return {
      pitch: 0.9,
      rate: engineLang === 'ur' ? 0.76 : 0.8,
    };
  }
  return { pitch: bodyPitch, rate: bodyRate };
}

type Props = {
  guideId: string;
  chunks: GuideVoiceChunk[];
  /** Same guide in English — used for offline speech when the device has no Urdu TTS voice. */
  fallbackChunks?: GuideVoiceChunk[];
  language: AppLanguage;
  accentColor: string;
  direction: 'ltr' | 'rtl';
  title: string;
  hint: string;
  playA11y: string;
  stopA11y: string;
};

export function GuideVoiceBar({
  guideId,
  chunks,
  fallbackChunks = [],
  language,
  accentColor,
  direction,
  title,
  hint,
  playA11y,
  stopA11y,
}: Props) {
  const [playing, setPlaying] = useState(false);

  const chunksRef = useRef(chunks);
  chunksRef.current = chunks;

  const fallbackChunksRef = useRef(fallbackChunks);
  fallbackChunksRef.current = fallbackChunks;

  const soundRef = useRef<Audio.Sound | null>(null);

  const narrateChunksRef = useRef<GuideVoiceChunk[]>([]);
  const engineLangRef = useRef<AppLanguage>('en');

  const speechOptsRef = useRef<{ language: string; voice?: string }>({
    language: language === 'ur' ? 'ur-PK' : 'en-US',
  });

  const unloadBundledSound = useCallback(async () => {
    const s = soundRef.current;
    soundRef.current = null;
    if (!s) return;
    try {
      await s.stopAsync();
    } catch {
      /* */
    }
    try {
      await s.unloadAsync();
    } catch {
      /* */
    }
  }, []);

  const prepareNarrationSession = useCallback(async () => {
    if (language === 'en') {
      narrateChunksRef.current = chunksRef.current;
      speechOptsRef.current = { language: 'en-US' };
      engineLangRef.current = 'en';
      return;
    }

    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const pick = pickUrduTtsOptions(voices);
      if (pick.hasUrduEngine) {
        narrateChunksRef.current = chunksRef.current;
        speechOptsRef.current = {
          language: pick.language,
          ...(pick.voice ? { voice: pick.voice } : {}),
        };
        engineLangRef.current = 'ur';
        return;
      }
    } catch {
      /* fall through to English */
    }

    const fb = fallbackChunksRef.current;
    if (fb.length > 0) {
      narrateChunksRef.current = fb;
      speechOptsRef.current = { language: 'en-US' };
      engineLangRef.current = 'en';
    } else {
      narrateChunksRef.current = chunksRef.current;
      speechOptsRef.current = { language: 'en-US' };
      engineLangRef.current = 'en';
    }
  }, [language]);

  const speakFromIndexRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    speakFromIndexRef.current = (startIndex: number) => {
      const list = narrateChunksRef.current;
      if (startIndex >= list.length) {
        setPlaying(false);
        return;
      }
      setPlaying(true);
      const segment = list[startIndex];
      const engineLang = engineLangRef.current;
      const { pitch, rate } = speechStyleForChunk(segment.tone, engineLang);
      const { language: lang, voice } = speechOptsRef.current;
      Speech.speak(segment.text, {
        language: lang,
        ...(voice ? { voice } : {}),
        pitch,
        rate,
        onDone: () => {
          speakFromIndexRef.current(startIndex + 1);
        },
        onStopped: () => {
          setPlaying(false);
        },
        onError: () => {
          setPlaying(false);
        },
      });
    };
  }, []);

  const hardStop = useCallback(async () => {
    await unloadBundledSound();
    await Speech.stop();
    setPlaying(false);
  }, [unloadBundledSound]);

  useEffect(() => {
    void hardStop();
  }, [chunks, fallbackChunks, language, guideId, hardStop]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        void unloadBundledSound();
        void Speech.stop();
      };
    }, [unloadBundledSound]),
  );

  const playBundledUrdu = useCallback(async (): Promise<boolean> => {
    const src = getUrduBundledGuideRecording(guideId);
    if (src == null) return false;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        src,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            void unloadBundledSound();
            setPlaying(false);
          }
        },
      );
      soundRef.current = sound;
      setPlaying(true);
      return true;
    } catch {
      await unloadBundledSound();
      return false;
    }
  }, [guideId, unloadBundledSound]);

  const onPressToggle = useCallback(async () => {
    if (playing) {
      await hardStop();
      return;
    }
    if (chunksRef.current.length === 0) return;
    await hardStop();

    if (language === 'ur') {
      const ok = await playBundledUrdu();
      if (ok) return;
    }

    await prepareNarrationSession();
    if (narrateChunksRef.current.length === 0) return;
    speakFromIndexRef.current(0);
  }, [playing, hardStop, language, playBundledUrdu, prepareNarrationSession]);

  const textAlign = direction === 'rtl' ? 'right' : 'left';

  /** RTL: play on the visual start side (native `direction`; web uses `row-reverse`). */
  return (
    <View style={[styles.wrap, flexRowWithDirection(direction)]}>
      <Pressable
        onPress={() => void onPressToggle()}
        style={({ pressed }) => [styles.playHit, pressed && styles.playHitPressed]}
        accessibilityRole="button"
        accessibilityLabel={playing ? stopA11y : playA11y}
      >
        <Ionicons
          name={playing ? 'stop-circle' : 'play-circle'}
          size={50}
          color={playing ? colors.text : accentColor}
        />
      </Pressable>
      <View style={styles.textCol}>
        <Text style={[styles.title, { textAlign }]}>{title}</Text>
        <Text style={[styles.hint, { textAlign }]}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: '#f1f5f9',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playHit: {
    padding: spacing.xs,
  },
  playHitPressed: {
    opacity: 0.75,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    lineHeight: 18,
  },
});
