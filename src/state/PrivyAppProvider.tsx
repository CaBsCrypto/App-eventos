import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { avalancheFuji } from 'viem/chains';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

/** ¿Está configurado el login con Privy (wallet embebida real)? */
export const isPrivyEnabled = (): boolean => Boolean(PRIVY_APP_ID);

/**
 * Envuelve la app con PrivyProvider (wallets embebidas reales en Avalanche
 * Fuji) SOLO si hay App ID configurado. Sin config, es un passthrough — la
 * app sigue funcionando con el onboarding simulado existente (email/Google).
 */
export default function PrivyAppProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) return <>{children}</>;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1',
          logo: undefined,
        },
        defaultChain: avalancheFuji,
        supportedChains: [avalancheFuji],
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
