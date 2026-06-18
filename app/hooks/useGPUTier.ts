'use client';
import { useState, useEffect } from 'react';
export type GPUTier = 'low' | 'medium' | 'high';
export function useGPUTier(): GPUTier {
  const [tier, setTier] = useState<GPUTier>('medium');
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) { setTier('low'); return; }
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debug) { setTier('medium'); return; }
    const renderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
    if (/(Mali-G|Adreno 3|Intel HD)/i.test(renderer)) setTier('low');
    else if (/(RTX|GTX 1[0-9]|Apple M)/i.test(renderer)) setTier('high');
  }, []);
  return tier;
}
