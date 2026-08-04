/** Clinic UI uses Fahrenheit; DB column `temperature_c` stays Celsius. */

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function roundTemp(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Celsius from DB/draft → Fahrenheit for form inputs. */
export function celsiusToFahrenheitInput(
  celsius: number | null | undefined
): number | undefined {
  if (celsius == null || Number.isNaN(celsius)) return undefined;
  return roundTemp(celsiusToFahrenheit(celsius), 1);
}

/** Fahrenheit from form → Celsius for persistence. */
export function fahrenheitToCelsiusStored(
  fahrenheit: number | null | undefined
): number | null | undefined {
  if (fahrenheit == null || Number.isNaN(fahrenheit)) return fahrenheit;
  return roundTemp(fahrenheitToCelsius(fahrenheit), 2);
}

/** Display helper for stored Celsius values. */
export function formatTemperatureFFromC(
  celsius: number | null | undefined,
  digits = 1
): string {
  if (celsius == null || Number.isNaN(celsius)) return '—';
  return `${roundTemp(celsiusToFahrenheit(celsius), digits)}°F`;
}
