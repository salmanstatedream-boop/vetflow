import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Muted,
  PrimaryButton,
  SecondaryButton,
  SegmentedControl,
  Sheet,
  Subtitle,
  Title,
} from '@/components/ui';
import { Colors } from '@/constants/theme';
import DateTimeFields, { toDateString, toTimeString } from '@/components/DateTimeFields';
import { ownerApi, type OwnerAppointment, type OwnerPet } from '@/lib/api';

const SERVICES = [
  'General Consultation',
  'Vaccination',
  'Follow-up',
  'Surgery',
  'Grooming',
  'Dental',
  'Emergency',
];

export default function VisitsScreen() {
  const params = useLocalSearchParams<{ book?: string }>();
  const [tab, setTab] = useState('Upcoming');
  const [items, setItems] = useState<OwnerAppointment[]>([]);
  const [pets, setPets] = useState<OwnerPet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bookOpen, setBookOpen] = useState(params.book === '1');
  const [step, setStep] = useState(0);
  const [petId, setPetId] = useState<string | null>(null);
  const [service, setService] = useState(SERVICES[0]!);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [a, p] = await Promise.all([ownerApi.appointments(), ownerApi.pets()]);
      setItems(a.appointments);
      setPets(p.pets);
      setPetId((cur) => cur || p.pets[0]?.id || null);
      setLoadError(null);
    } catch (err: unknown) {
      setItems([]);
      setLoadError(err instanceof Error ? err.message : 'Could not load visits');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const s = a.status.toLowerCase();
      if (tab === 'Cancelled') return s.includes('cancel');
      if (tab === 'Past')
        return ['completed', 'no_show', 'checked_in'].includes(s) || s === 'done';
      return !['cancelled', 'completed', 'no_show'].includes(s);
    });
  }, [items, tab]);

  const canModify = (status: string) =>
    ['requested', 'confirmed', 'rescheduled'].includes(status.toLowerCase());

  const submit = async () => {
    if (!petId) {
      Alert.alert('Select a pet');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      Alert.alert('Use date YYYY-MM-DD');
      return;
    }
    if (!time.trim()) {
      Alert.alert('Enter time HH:MM');
      return;
    }
    setLoading(true);
    try {
      const reason = notes.trim() ? `${service}: ${notes.trim()}` : service;
      await ownerApi.book({
        patientId: petId,
        preferredDate: date.trim(),
        preferredTime: time.trim().length === 5 ? `${time.trim()}:00` : time.trim(),
        reason,
      });
      setBookOpen(false);
      setStep(0);
      setNotes('');
      await load();
      Alert.alert('Request sent', 'Your clinic will confirm the appointment.');
    } catch (err: unknown) {
      Alert.alert('Booking failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppt = (item: OwnerAppointment) => {
    Alert.alert('Cancel appointment?', `${item.reason} on ${item.preferredDate}`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await ownerApi.cancelAppointment(item.id);
            await load();
          } catch (err: unknown) {
            Alert.alert('Failed', err instanceof Error ? err.message : 'Try again');
          }
        },
      },
    ]);
  };

  const submitReschedule = async () => {
    if (!rescheduleId) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate.trim()) || !rescheduleTime.trim()) {
      Alert.alert('Enter date YYYY-MM-DD and time HH:MM');
      return;
    }
    setLoading(true);
    try {
      await ownerApi.rescheduleAppointment(
        rescheduleId,
        rescheduleDate.trim(),
        rescheduleTime.trim()
      );
      setRescheduleId(null);
      await load();
      Alert.alert('Reschedule requested');
    } catch (err: unknown) {
      Alert.alert('Failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 12 }}>
            <Title>Appointments</Title>
            {loadError ? (
              <ErrorBanner message={loadError} onRetry={() => void load()} />
            ) : null}
            <SegmentedControl
              options={['Upcoming', 'Past', 'Cancelled']}
              value={tab}
              onChange={setTab}
            />
            <PrimaryButton
              label="+ Book Appointment"
              onPress={() => {
                const now = new Date();
                setDate(toDateString(now));
                setTime(toTimeString(now));
                setBookOpen(true);
                setStep(0);
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <Card>
            <EmptyState title="No appointments" body="Book a visit to see it listed here." />
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={styles.cardTop}>
              <Badge label={item.status} />
              <Text style={styles.when}>
                {item.preferredDate} · {String(item.preferredTime).slice(0, 5)}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{item.reason}</Text>
            <View style={styles.metaRow}>
              <FontAwesome name="user" size={12} color={Colors.textMuted} />
              <Muted>
                {item.patientName}
                {item.patientSpecies ? ` · ${item.patientSpecies}` : ''}
              </Muted>
            </View>
            <View style={styles.metaRow}>
              <FontAwesome name="map-marker" size={12} color={Colors.textMuted} />
              <Muted>{item.clinicName}</Muted>
            </View>
            {canModify(item.status) ? (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => {
                    setRescheduleId(item.id);
                    setRescheduleDate(item.preferredDate);
                    setRescheduleTime(String(item.preferredTime).slice(0, 5));
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>Reschedule</Text>
                </Pressable>
                <Pressable onPress={() => cancelAppt(item)} style={styles.actionBtn}>
                  <Text style={[styles.actionText, { color: Colors.danger }]}>Cancel</Text>
                </Pressable>
              </View>
            ) : null}
          </Card>
        )}
      />

      <Sheet visible={bookOpen} onClose={() => setBookOpen(false)}>
        <Text style={styles.stepLabel}>STEP {step + 1} OF 4</Text>
        <Subtitle>
          {step === 0
            ? 'Choose pet'
            : step === 1
              ? 'Choose service'
              : step === 2
                ? 'Date & time'
                : 'Confirm'}
        </Subtitle>
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.progSeg, i <= step && styles.progSegOn]} />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.wrap}>
            {pets.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setPetId(p.id)}
                style={[styles.chip, petId === p.id && styles.chipOn]}
              >
                <Text style={[styles.chipText, petId === p.id && { color: '#fff' }]}>
                  {p.name} · {p.clinicName}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {step === 1 && (
          <View style={styles.wrap}>
            {SERVICES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setService(s)}
                style={[styles.service, service === s && styles.serviceOn]}
              >
                <Text style={[styles.chipText, service === s && { color: Colors.primaryDark }]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {step === 2 && (
          <DateTimeFields
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            notes={notes}
            onNotesChange={setNotes}
            showNotes
          />
        )}
        {step === 3 && (
          <Card>
            <Muted>Pet: {pets.find((p) => p.id === petId)?.name || '—'}</Muted>
            <Muted>Service: {service}</Muted>
            <Muted>
              When: {date} {time}
            </Muted>
            {notes ? <Muted>Notes: {notes}</Muted> : null}
          </Card>
        )}

        <View style={{ height: 16 }} />
        <PrimaryButton
          label={step < 3 ? 'Continue' : 'Request appointment'}
          loading={loading}
          onPress={() => {
            if (step < 3) setStep((s) => s + 1);
            else void submit();
          }}
        />
      </Sheet>

      <Sheet visible={Boolean(rescheduleId)} onClose={() => setRescheduleId(null)}>
        <Title>Reschedule</Title>
        <View style={{ height: 12 }} />
        <DateTimeFields
          date={rescheduleDate}
          time={rescheduleTime}
          onDateChange={setRescheduleDate}
          onTimeChange={setRescheduleTime}
        />
        <View style={{ height: 16 }} />
        <PrimaryButton label="Save" loading={loading} onPress={submitReschedule} />
        <View style={{ height: 8 }} />
        <SecondaryButton label="Close" onPress={() => setRescheduleId(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  when: { fontWeight: '700', color: Colors.text, fontSize: 13 },
  cardTitle: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 12 },
  actionBtn: { paddingVertical: 6 },
  actionText: { fontWeight: '700', color: Colors.primary },
  stepLabel: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  progress: { flexDirection: 'row', gap: 6, marginVertical: 12 },
  progSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progSegOn: { backgroundColor: Colors.primary },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceMuted,
  },
  chipOn: { backgroundColor: Colors.primary },
  chipText: { fontWeight: '700', color: Colors.text, fontSize: 13 },
  service: {
    width: '48%',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
  },
  serviceOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
});
