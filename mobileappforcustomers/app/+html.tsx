import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

const TITLE = 'Phoenix Care — by Phoenix OS';
const DESCRIPTION =
  'Book appointments and view your pets’ medical history across every Phoenix OS clinic you’re linked to.';
const THEME = '#2563EB';
const BG = '#F9FAFB';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="veterinary, pet owner, appointment booking, pet medical records, phoenix care, vet clinic"
        />
        <meta name="theme-color" content={THEME} />
        <meta name="application-name" content="Phoenix Care" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Phoenix Care" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:site_name" content="Phoenix Care" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: ${BG};
  color: #111827;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}
`;
