
import { useEffect } from 'react';

export const useConfirmExit = (shouldBlock: boolean = true) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = 'Tem certeza que deseja sair? Suas alterações podem ser perdidas.';
        return 'Tem certeza que deseja sair? Suas alterações podem ser perdidas.';
      }
    };

    if (shouldBlock) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock]);
};
