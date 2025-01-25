import { useState, useEffect } from 'react';
import NativeNearSend from '../components/NativeNear/NativeNearSend';
import ChainSignatureSend from '../components/ChainSignature/ChainSignatureSend';

export default function Send() {
  const [mode, setMode] = useState('native');

  useEffect(() => {
    // Get mode from Chrome storage
    chrome.storage.local.get(['mode'], (result) => {
      if (result.mode) {
        setMode(result.mode);
      }
    });
  }, []);

  return mode === 'chain' ? <ChainSignatureSend /> : <NativeNearSend />;
} 