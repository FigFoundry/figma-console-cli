import { useEffect, useState } from 'react';
import { PluginMessage } from '../types/messages';

export const usePlugin = () => {
  const [selection, setSelection] = useState<any[]>([]);

  useEffect(() => {
    // Set up message handler
    window.onmessage = (event) => {
      const message = event.data.pluginMessage as PluginMessage;
      
      if (message.type === 'selection-data') {
        setSelection(message.data);
      }
    };
    
    // Get initial selection
    parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
  }, []);

  const sendMessage = (message: PluginMessage) => {
    parent.postMessage({ pluginMessage: message }, '*');
  };

  return {
    selection,
    sendMessage
  };
};