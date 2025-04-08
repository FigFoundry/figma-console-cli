import React from 'react';
import { createRoot } from 'react-dom/client';
import DefaultView from './components/DefaultView';
import './styles/base.scss';

const container = document.getElementById('root') as HTMLElement;
if (container) {
  const root = createRoot(container);
  root.render(<DefaultView />);
} else {
  console.error('Root container not found');
}