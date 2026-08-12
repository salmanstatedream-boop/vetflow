import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Label,
  Muted,
  PrimaryButton,
  SegmentedControl,
  Sheet,
  Subtitle,
  Title,
} from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import {
  ownerApi,
  type ExternalPrescription,
  type HistoryVisit,
} from '@/lib/api';

export default function MedicalRecordScreen() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const initial =
    tabParam === 'vaccinations'
      ? 'Vaccinations'
      : tabParam === 'deworming'
        ? 'Deworming'
        : 'Medications';
  const [tab, setTab] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryVisit[]>([]);
  const [external, setExternal] = useState<ExternalPrescription[]>([]);
  const [petName, setPetName] = useState('Pet');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [notes, setNotes] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [file, setFile] = useState<{
    base64: string;
    name: string;
    type: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([ownerApi.history(id), ownerApi.externalPrescriptions(id)])
      .then(([hist, ext]) => {
        setHistory(hist.history);
        setPetName(hist.pet.name);
        setExternal(ext.prescriptions);
      })
      .catch((err: unknown) => {
        setHistory([]);
        setExternal([]);
        setError(err instanceof Error ? err.message : 'Could not load medical record');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [id]);

  const meds = useMemo(() => {
    const rows: { key: string; name: string; detail: string; when: string }[] = [];
    for (const visit of history) {
      for (const rx of visit.prescriptions) {
        for (const [i, item] of (rx.items || []).entries()) {
          rows.push({
            key: `${rx.id}-${i}`,
            name: item.medicineName || 'Medication',
            detail: [item.dosage, item.frequency, item.duration, item.instructions]
              .filter(Boolean)
              .join(' · '),
            when: new Date(rx.createdAt || visit.checkedInAt).toLocaleDateString(),
          });
        }
      }
    }
    return rows;
  }, [history]);

  const vax = useMemo(() => {
    const rows: { key: string; name: string; detail: string; when: string }[] = [];
    for (const visit of history) {
      for (const [i, vaccine] of (visit.vaccines || []).entries()) {
        rows.push({
          key: `${visit.id}-vax-${i}`,
          name: vaccine.name,
          detail: [
            vaccine.lotNumber ? `Lot ${vaccine.lotNumber}` : null,
            vaccine.nextDueDate ? `Next due ${vaccine.nextDueDate}` : null,
          ]
            .filter(Boolean)
            .join(' · '),
          when: vaccine.administeredAt
            ? new Date(vaccine.administeredAt).toLocaleDateString()
            : new Date(visit.checkedInAt).toLocaleDateString(),
        });
      }
    }
    return rows;
  }, [history]);

  const deworm = useMemo(() => {
    const rows: { key: string; name: string; detail: string; when: string }[] = [];
    for (const visit of history) {
      for (const [i, d] of (visit.deworming || []).entries()) {
        rows.push({
          key: `${visit.id}-dw-${i}`,
          name: d.name,
          detail: d.detail || '',
          when: d.administeredAt
            ? new Date(d.administeredAt).toLocaleDateString()
            : new Date(visit.checkedInAt).toLocaleDateString(),
        });
      }
      if (
        (visit.visitPurpose || '').toLowerCase() === 'deworming' &&
        !(visit.deworming || []).length
      ) {
        rows.push({
          key: `${visit.id}-purpose`,
          name: visit.reason || 'Deworming visit',
          detail: 'Recorded as deworming visit',
          when: new Date(visit.checkedInAt).toLocaleDateString(),
        });
      }
    }
    return rows;
  }, [history]);

  const list =
    tab === 'Vaccinations' ? vax : tab === 'Deworming' ? deworm : meds;

  const pickFile = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const asset = res.assets[0];
    setFile({
      base64: asset.base64!,
      name: asset.fileName || 'prescription.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const saveExternal = async () => {
    if (!id || !clinicName.trim()) return;
    setSaving(true);
    try {
      await ownerApi.addExternalPrescription(id, {
        clinicName: clinicName.trim(),
        notes: notes.trim() || undefined,
        takenAt: takenAt.trim() || undefined,
        fileBase64: file?.base64,
        fileName: file?.name,
        contentType: file?.type,
      });
      setSheetOpen(false);
      setClinicName('');
      setNotes('');
      setTakenAt('');
      setFile(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Medical record',
          headerLeft: () => (
            <Pressable
              onPress={() => setSheetOpen(true)}
              hitSlop={10}
              style={{ marginLeft: 4, padding: 6 }}
            >
              <FontAwesome name="plus" size={18} color={Colors.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title>{petName}</Title>
          <Muted>Medical files from your clinic, plus external prescriptions you add.</Muted>
          <View style={{ height: Spacing.lg }} />
          <SegmentedControl
            options={['Medications', 'Vaccinations', 'Deworming']}
            value={tab}
            onChange={setTab}
          />
          <View style={{ height: Spacing.lg }} />
          {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
          ) : (
            <>
              {tab === 'Medications' && external.length > 0 ? (
                <View style={{ marginBottom: 16, gap: 8 }}>
                  <Subtitle>From other clinics</Subtitle>
                  {external.map((rx) => (
                    <Card key={rx.id}>
                      <Text style={styles.itemTitle}>{rx.clinicName}</Text>
                      <Muted>
                        {[rx.takenAt, rx.fileName, rx.notes].filter(Boolean).join(' · ')}
                      </Muted>
                    </Card>
                  ))}
                </View>
              ) : null}
              {list.length === 0 ? (
                <Card>
                  <EmptyState
                    title={`No ${tab.toLowerCase()} yet`}
                    body="Records appear after clinic visits."
                  />
                </Card>
              ) : (
                list.map((row) => (
                  <Card key={row.key} style={{ marginBottom: 8 }}>
                    <Text style={styles.itemTitle}>{row.name}</Text>
                    {row.detail ? <Muted>{row.detail}</Muted> : null}
                    <Muted>{row.when}</Muted>
                  </Card>
                ))
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Subtitle>Add external prescription</Subtitle>
        <Muted>Upload a prescription from another veterinary clinic.</Muted>
        <View style={{ height: 14 }} />
        <Label>Clinic name</Label>
        <Field value={clinicName} onChangeText={setClinicName} placeholder="Other vet clinic" />
        <View style={{ height: 10 }} />
        <Label>Date (YYYY-MM-DD)</Label>
        <Field value={takenAt} onChangeText={setTakenAt} placeholder="2026-08-01" />
        <View style={{ height: 10 }} />
        <Label>Notes</Label>
        <Field
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional details"
          multiline
        />
        <View style={{ height: 12 }} />
        <PrimaryButton
          label={file ? `Photo: ${file.name}` : 'Attach photo'}
          onPress={() => void pickFile()}
        />
        <View style={{ height: 10 }} />
        <PrimaryButton
          label="Save prescription"
          loading={saving}
          disabled={!clinicName.trim()}
          onPress={() => void saveExternal()}
        />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  itemTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
});
