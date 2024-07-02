'use client';

import React from 'react';
import { GlobalStateProvider } from '../context/GlobalStateContext';

export default function GlobalStateProviderClient({ children }) {
  return <GlobalStateProvider>{children}</GlobalStateProvider>;
}