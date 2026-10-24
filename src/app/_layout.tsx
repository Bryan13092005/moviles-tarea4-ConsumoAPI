import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { MAX_AGE, clienteConsulta, persistidorAlmacenamiento } from '@/config/queryClient';
import { clavesConsulta } from '@/config/queryKeys';
import { log } from '@/utils/log';

SplashScreen.preventAutoHideAsync();
log('APP', 'App iniciada');

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <PersistQueryClientProvider
      client={clienteConsulta}
      persistOptions={{ persister: persistidorAlmacenamiento, maxAge: MAX_AGE }}
      onSuccess={() => {
        const pausadas = clienteConsulta
          .getMutationCache()
          .getAll()
          .filter((m) => m.state.isPaused).length;
        log(
          'CACHÉ',
          `Restaurada desde AsyncStorage: ${clienteConsulta.getQueryCache().getAll().length} consultas, ${
            clienteConsulta.getMutationCache().getAll().length
          } mutaciones pendientes`,
        );
        log('SYNC', `Reanudando ${pausadas} mutaciones pausadas`);
        clienteConsulta
          .resumePausedMutations()
          .then(() => {
            log('SYNC', 'Sincronización terminada');
            return clienteConsulta.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.todas });
          });
      }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
