/**
 * Service audio utilisant expo-av.
 * Gère le chargement, la lecture, la pause et le nettoyage des fichiers audio.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';

export async function configureAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export async function loadAudio(source: string | number): Promise<Audio.Sound> {
  const audioSource = typeof source === 'number' ? source : { uri: source };
  const { sound } = await Audio.Sound.createAsync(
    audioSource as any,
    { shouldPlay: false }
  );
  return sound;
}

export async function playAudio(sound: Audio.Sound): Promise<void> {
  await sound.playAsync();
}

export async function pauseAudio(sound: Audio.Sound): Promise<void> {
  await sound.pauseAsync();
}

export async function stopAudio(sound: Audio.Sound): Promise<void> {
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {
    // Sound may already be unloaded
  }
}

export async function seekTo(sound: Audio.Sound, positionMillis: number): Promise<void> {
  await sound.setPositionAsync(positionMillis);
}

export function setOnPlaybackStatusUpdate(
  sound: Audio.Sound,
  callback: (status: AVPlaybackStatus) => void
): void {
  sound.setOnPlaybackStatusUpdate(callback);
}
