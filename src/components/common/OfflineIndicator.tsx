import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 text-white px-3 py-2 text-xs font-medium shadow-lg animate-fade-in border border-amber-600 select-none">
      <WifiOff className="w-4 h-4 shrink-0 text-white" />
      <div>
        <span className="font-bold">Modo Offline Ativo</span>
        <span className="hidden sm:inline text-amber-100 ml-1">
          — A utilizar dados em cache local (todas as operações mantêm-se funcionais).
        </span>
      </div>
    </div>
  );
};
