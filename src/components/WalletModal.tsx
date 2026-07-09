import React, { useState } from 'react';
import { Mail, Shield, Wallet, Chrome, Twitter, Apple, CheckCircle2, ArrowRight } from 'lucide-react';
import { Attendee, WalletType } from '../types';
import { useApp } from '../state/AppProvider';

interface WalletModalProps {
  onOnboardComplete: (attendee: Attendee) => void;
  onClose: () => void;
}

export default function WalletModal({ onOnboardComplete, onClose }: WalletModalProps) {
  const { signInWithGoogle, googleAuthEnabled } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'info' | 'auth' | 'connecting' | 'success'>('info');
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('Privy');
  const [generatedWallet, setGeneratedWallet] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [error, setError] = useState('');

  const generateRandomWallet = () => {
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) {
      addr += chars[Math.floor(Math.random() * 16)];
    }
    return addr;
  };

  const handlePrivyLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!email || !name) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    setStep('connecting');

    // Simulate seedless wallet creation with Privy
    const walletAddress = generateRandomWallet();
    setGeneratedWallet(walletAddress);

    try {
      const response = await fetch('/api/attendees/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          walletAddress,
          walletType: 'Privy'
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar usuario en el servidor.');
      }

      const attendee: Attendee = await response.json();
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onOnboardComplete(attendee);
          onClose();
        }, 1500);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error en la conexión');
      setStep('auth');
    }
  };

  const handleDirectWalletConnect = async (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setStep('connecting');
    const walletAddress = generateRandomWallet();
    setGeneratedWallet(walletAddress);

    try {
      const tempEmail = `${wallet.toLowerCase()}_${walletAddress.substring(2, 8)}@latamprotocol.com`;
      const tempName = `${wallet} User ${walletAddress.substring(2, 6)}`;

      const response = await fetch('/api/attendees/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempName,
          email: tempEmail,
          walletAddress,
          walletType: wallet
        })
      });

      if (!response.ok) {
        throw new Error('Error al conectar billetera.');
      }

      const attendee: Attendee = await response.json();
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onOnboardComplete(attendee);
          onClose();
        }, 1500);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setStep('info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" id="wallet-modal-overlay">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all" id="wallet-modal-container">
        
        {/* Header banner */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
          <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 backdrop-blur-md">
            <Shield className="w-6 h-6 text-indigo-200" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Acceso Rápido con Privy</h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xs mx-auto">
            Billeteras embebidas sin semillas. Conéctate con tus redes o correo y reclama tus Insignias NFT.
          </p>
        </div>

        {/* Modal body */}
        <div className="p-6 bg-zinc-950 text-zinc-100">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          {step === 'info' && (
            <div className="space-y-4">
              {/* Login real con Google (Supabase Auth) */}
              {googleAuthEnabled && (
                <>
                  <button
                    onClick={() => signInWithGoogle()}
                    className="w-full py-3 bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow"
                  >
                    <Chrome className="w-4 h-4 text-[#4285F4]" /> Continuar con Google
                  </button>
                  <div className="relative my-1 text-center">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-zinc-800"></span>
                    <span className="relative bg-zinc-950 px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">o con correo</span>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Ingresar con Correo (Privy Embedded Wallet)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tu Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-500"
                  />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-500"
                  />
                </div>
                <button
                  onClick={() => handlePrivyLogin()}
                  disabled={!name || !email}
                  className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Continuar e Iniciar <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative my-4 text-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-zinc-800"></span>
                <span className="relative bg-zinc-950 px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">o conectar billetera</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDirectWalletConnect('MetaMask')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs text-left font-medium transition-all"
                >
                  <span className="text-lg">🦊</span> MetaMask
                </button>
                <button
                  onClick={() => handleDirectWalletConnect('Phantom')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs text-left font-medium transition-all"
                >
                  <span className="text-lg">👻</span> Phantom
                </button>
                <button
                  onClick={() => handleDirectWalletConnect('Coinbase')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs text-left font-medium transition-all"
                >
                  <span className="text-lg">🔵</span> Coinbase
                </button>
                <button
                  onClick={() => {
                    setName('Hacker Anónimo');
                    setEmail(`social_${Date.now()}@privy.xyz`);
                    setStep('auth');
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs text-left font-medium transition-all"
                >
                  <span className="text-lg">🔑</span> Privy Social
                </button>
              </div>
            </div>
          )}

          {step === 'auth' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-zinc-400">Verifica tu identidad mediante acceso social seguro:</p>
              
              <div className="flex justify-center gap-3 py-2">
                <button 
                  onClick={handlePrivyLogin}
                  className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full flex items-center justify-center text-xl transition-all"
                  title="Google Social"
                >
                  <Chrome className="w-5 h-5 text-red-500" />
                </button>
                <button 
                  onClick={handlePrivyLogin}
                  className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full flex items-center justify-center text-xl transition-all"
                  title="Twitter Social"
                >
                  <Twitter className="w-5 h-5 text-sky-400" />
                </button>
                <button 
                  onClick={handlePrivyLogin}
                  className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full flex items-center justify-center text-xl transition-all"
                  title="Apple Social"
                >
                  <Apple className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={handlePrivyLogin}
                  className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full flex items-center justify-center text-xl transition-all"
                  title="Direct Passcode"
                >
                  <Mail className="w-5 h-5 text-indigo-400" />
                </button>
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-left text-xs space-y-2">
                <div className="font-semibold text-zinc-300">Cuenta creada para:</div>
                <div className="text-zinc-400">Nombre: <span className="text-zinc-200">{name}</span></div>
                <div className="text-zinc-400">Email: <span className="text-zinc-200">{email}</span></div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('info')}
                  className="w-1/3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-xl font-medium text-xs transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePrivyLogin}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-medium text-xs transition-colors"
                >
                  Confirmar e Iniciar
                </button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="py-8 text-center space-y-4">
              <div className="relative mx-auto w-14 h-14">
                <div className="absolute inset-0 border-4 border-indigo-900/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                <Wallet className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-200">Generando Billetera Embebida...</p>
                <p className="text-xs text-zinc-500">Creando clave privada criptográfica asegurada en enclave local.</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4 animate-scale-up">
              <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-200">Billetera Privy Creada Exitosamente</p>
                <p className="font-mono text-[10px] text-emerald-500 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1.5 rounded-lg max-w-xs mx-auto break-all">
                  {generatedWallet}
                </p>
                <p className="text-xs text-zinc-500 pt-2">Se te ha asignado la insignia Pioneer Genesis.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-zinc-600" /> Criptografía de 256 bits</span>
          <span>Bajo protocolo Privy.xyz</span>
        </div>
      </div>
    </div>
  );
}
