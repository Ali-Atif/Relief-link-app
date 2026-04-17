import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioSource, type AudioStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/types';
import type { GuideVoiceChunk } from '../services/guideVoiceChunks';
import { getUrduBundledGuideRecording } from '../services/guideUrduBundledAudio';
import { pickUrduTtsOptions } from '../services/pickUrduTtsVoice';
import { flexRowWithDirection } from '../utils/layoutRtl';
import { colors, radii, spacing } from '../utils/constants';

async function resolveBundledMp3Asset(moduleId: number): Promise<AudioSource | null> {
  try {
    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) return null;
    return { uri, assetId: moduleId };
  } catch {
    return null;
  }
}

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

  const playerRef = useRef<AudioPlayer | null>(null);
  const playbackSubRef = useRef<{ remove: () => void } | null>(null);

  /** When false, TTS `onDone` must not chain (native may still fire `speakingDone` after `Speech.stop()`). */
  const narrationActiveRef = useRef(false);
  /** Mirrors `playing` for press handling so stop works on first tap (state updates are async). */
  const playingRef = useRef(false);

  const narrateChunksRef = useRef<GuideVoiceChunk[]>([]);
  const engineLangRef = useRef<AppLanguage>('en');

  const speechOptsRef = useRef<{ language: string; voice?: string }>({
    language: language === 'ur' ? 'ur-PK' : 'en-US',
  });

  const disposeBundledPlayer = useCallback(() => {
    const sub = playbackSubRef.current;
    playbackSubRef.current = null;
    if (sub) {
      try {
        sub.remove();
      } catch {
        /* */
      }
    }
    const player = playerRef.current;
    playerRef.current = null;
    if (!player) return;
    try {
      player.pause();
    } catch {
      /* */
    }
    try {
      player.remove();
    } catch {
      /* */
    }
  }, []);

  /** Stops TTS and tears down the MP3 player immediately (important on native). */
  const stopAllPlayback = useCallback(() => {
    narrationActiveRef.current = false;
    playingRef.current = false;
    try {
      void Speech.stop();
    } catch {
      /* */
    }
    disposeBundledPlayer();
    setPlaying(false);
  }, [disposeBundledPlayer]);

  const prepareNarrationSession = useCallback(async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        allowsRecording: false,
      });
    } catch {
      /* still attempt TTS */
    }

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
        narrationActiveRef.current = false;
        playingRef.current = false;
        setPlaying(false);
        return;
      }
      if (!narrationActiveRef.current) {
        return;
      }
      playingRef.current = true;
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
          if (!narrationActiveRef.current) return;
          speakFromIndexRef.current(startIndex + 1);
        },
        onStopped: () => {
          narrationActiveRef.current = false;
          playingRef.current = false;
          setPlaying(false);
        },
        onError: () => {
          narrationActiveRef.current = false;
          playingRef.current = false;
          setPlaying(false);
        },
      });
    };
  }, []);

  useEffect(() => {
    stopAllPlayback();
  }, [chunks, fallbackChunks, language, guideId, stopAllPlayback]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAllPlayback();
      };
    }, [stopAllPlayback]),
  );

  const playBundledUrdu = useCallback(async (): Promise<boolean> => {
    const assetModule = getUrduBundledGuideRecording(guideId);
    if (assetModule == null) return false;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        allowsRecording: false,
      });
      const source = await resolveBundledMp3Asset(assetModule);
      if (source == null) return false;
      const player = createAudioPlayer(source, { updateInterval: 500, keepAudioSessionActive: false });
      playerRef.current = player;
      playbackSubRef.current = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          disposeBundledPlayer();
          playingRef.current = false;
          setPlaying(false);
        }
      });
      playingRef.current = true;
      player.play();
      setPlaying(true);
      return true;
    } catch {
      disposeBundledPlayer();
      return false;
    }
  }, [guideId, disposeBundledPlayer]);

  const onPressToggle = useCallback(async () => {
    if (playingRef.current) {
      stopAllPlayback();
      return;
    }
    if (chunksRef.current.length === 0) return;
    stopAllPlayback();

    if (language === 'ur') {
      const ok = await playBundledUrdu();
      if (ok) return;
    }

    await prepareNarrationSession();
    if (narrateChunksRef.current.length === 0) return;
    narrationActiveRef.current = true;
    speakFromIndexRef.current(0);
  }, [stopAllPlayback, language, playBundledUrdu, prepareNarrationSession]);

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
