// Next.js App wrapper component
// Added type annotation for AppProps to strictly type Component and pageProps
import type { AppProps } from 'next/app';
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS
import '@/styles/globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import BackgroundParticles from '@/components/BackgroundParticles';

export default function App({ Component, pageProps }: AppProps) {
  // ThemeProvider wraps the entire app so any component can read/change the theme
  // via useTheme(). It applies data-theme="<theme>" to <html> and persists the
  // preference to localStorage.
  // BackgroundParticles renders decorative animated hearts/stars behind the page
  // content based on the active theme (client-side only, pointer-events: none).
  return (
    <ThemeProvider>
      <BackgroundParticles />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
