'use client';

import { useStoreInternal, StoreProvider } from '@/lib/store';
import { App } from '@/components/App';

export default function Page() {
  const store = useStoreInternal();
  return (
    <StoreProvider value={store}>
      <App />
    </StoreProvider>
  );
}
