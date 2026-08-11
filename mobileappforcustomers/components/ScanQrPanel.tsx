import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import { Muted, PrimaryButton, SecondaryButton } from '@/components/ui';
import { decodeQrFromImageUri } from '@/lib/decode-qr-image';
import { parsePhoenixCareQr, type PhoenixCareQrPayload } from '@/lib/qr';

type Props = {
  title?: string;
  hint?: string;
  onResult: (payload: PhoenixCareQrPayload, raw: string) => void;
  onCancel: () => void;
};

export default function ScanQrPanel({
  title = 'Scan QR code',
  hint = 'Point at a Phoenix Care login or invite QR, or choose a saved image.',
  onResult,
  onCancel,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [picking, setPicking] = useState(false);
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  const handled = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse, reduceMotion]);

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.85 + (pulse.value - 1) * 2,
  }));

  const deliver = (raw: string) => {
    if (handled.current) return;
    const parsed = parsePhoenixCareQr(raw);
    if (!parsed) {
      Alert.alert('Unrecognized QR', 'Use a Phoenix Care login or invite QR from your clinic.');
      setLocked(false);
      handled.current = false;
      return;
    }
    handled.current = true;
    setLocked(true);
    onResult(parsed, raw);
  };

  const pickFromGallery = async () => {
    setPicking(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photo access needed', 'Allow photo library access to scan a downloaded QR.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const raw = await decodeQrFromImageUri(result.assets[0].uri);
      if (!raw) {
        Alert.alert('No QR found', 'Try a clearer screenshot or the original downloaded QR PNG.');
        return;
      }
      deliver(raw);
    } catch (err: unknown) {
      Alert.alert(
        'Could not read image',
        err instanceof Error ? err.message : 'Try another photo'
      );
    } finally {
      setPicking(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Muted>Camera permission is required to scan live QR codes.</Muted>
        <View style={{ height: 16 }} />
        <PrimaryButton label="Allow camera" onPress={() => void requestPermission()} />
        <View style={{ height: 10 }} />
        <SecondaryButton label="Choose from photos" onPress={() => void pickFromGallery()} />
        <View style={{ height: 10 }} />
        <SecondaryButton label="Cancel" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Muted>{hint}</Muted>
      <View style={{ height: 16 }} />
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            locked
              ? undefined
              : ({ data }) => {
                  setLocked(true);
                  deliver(data);
                }
          }
        />
        <Animated.View style={[styles.frame, frameStyle]} pointerEvents="none">
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </Animated.View>
        {picking ? (
          <View style={styles.pickingOverlay}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.pickingText}>Reading QR…</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.galleryBtn}
          onPress={() => void pickFromGallery()}
          disabled={picking || locked}
        >
          <FontAwesome name="image" size={16} color={Colors.primary} />
          <Text style={styles.galleryText}>Choose from photos</Text>
        </Pressable>
        <SecondaryButton
          label="Cancel"
          onPress={() => {
            handled.current = false;
            setLocked(false);
            onCancel();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  cameraWrap: {
    height: 300,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    marginBottom: Spacing.md,
  },
  frame: {
    position: 'absolute',
    top: '16%',
    left: '12%',
    right: '12%',
    bottom: '16%',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.cyan,
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  pickingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pickingText: { color: '#fff', fontFamily: Fonts.semiBold, fontSize: 14 },
  actions: { gap: 10, marginTop: 4 },
  galleryBtn: {
    minHeight: 50,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    backgroundColor: Colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  galleryText: {
    color: Colors.primaryDark,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
});
