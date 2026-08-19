import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Field, Label } from '@/components/ui';
import { Colors } from '@/constants/theme';

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  if (y && m && d) {
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  }
  return new Date();
}

type Props = {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  notes?: string;
  onNotesChange?: (value: string) => void;
  showNotes?: boolean;
};

export default function DateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  notes,
  onNotesChange,
  showNotes = false,
}: Props) {
  const when = useMemo(
    () => parseDateTime(date || toDateString(new Date()), time || '09:00'),
    [date, time]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDatePicked = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed' || !selected) return;
    onDateChange(toDateString(selected));
    if (Platform.OS === 'ios') setShowDatePicker(false);
  };

  const onTimePicked = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed' || !selected) return;
    onTimeChange(toTimeString(selected));
    if (Platform.OS === 'ios') setShowTimePicker(false);
  };

  const displayDate = date || toDateString(new Date());
  const displayTime = time || '09:00';

  return (
    <View style={{ gap: 10 }}>
      <Label>Date</Label>
      <Pressable onPress={() => setShowDatePicker(true)} accessibilityRole="button">
        <Field
          value={displayDate}
          editable={false}
          pointerEvents="none"
          placeholder="Select date"
        />
      </Pressable>
      {showDatePicker ? (
        <DateTimePicker
          value={when}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDatePicked}
        />
      ) : null}

      <Label>Time</Label>
      <Pressable onPress={() => setShowTimePicker(true)} accessibilityRole="button">
        <Field
          value={displayTime}
          editable={false}
          pointerEvents="none"
          placeholder="Select time"
        />
      </Pressable>
      {showTimePicker ? (
        <DateTimePicker
          value={when}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimePicked}
        />
      ) : null}

      {showNotes && onNotesChange ? (
        <>
          <Label>Notes (optional)</Label>
          <Field
            value={notes || ''}
            onChangeText={onNotesChange}
            placeholder="Anything the clinic should know"
            multiline
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({});
