/**
 * Advanced Device Fingerprinting System
 * Supports 12+ detection methods for desktop, laptop, and mobile
 */

export interface DeviceFingerprintData {
  screen: string;
  browser: string;
  canvas: string;
  webgl: string;
  audio: string;
  hardware: string;
  fonts: string;
  timezone: string;
  touch: string;
  battery: string;
  network: string;
  permissions: string;
}

// Screen and display fingerprinting
const getScreenFingerprint = (): string => {
  const screen = window.screen;
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    screen.pixelDepth,
    window.devicePixelRatio || 1,
    screen.availWidth,
    screen.availHeight,
    window.innerWidth,
    window.innerHeight
  ].join('|');
};

// Browser and navigator fingerprinting
const getBrowserFingerprint = (): string => {
  const nav = navigator;
  return [
    nav.userAgent,
    nav.language,
    nav.languages?.join(',') || '',
    nav.platform,
    nav.cookieEnabled,
    nav.doNotTrack || '',
    nav.hardwareConcurrency || 0,
    (nav as any).deviceMemory || 0,
    nav.maxTouchPoints || 0
  ].join('|');
};

// Canvas fingerprinting with multiple patterns
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 400;
    canvas.height = 200;

    // Pattern 1: Text rendering
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device fingerprint 🌟', 2, 15);

    // Pattern 2: Geometric shapes
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Pattern 3: Gradients
    const gradient = ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(100, 100, 200, 50);

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
};

// WebGL fingerprinting
const getWebGLFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    const extensions = gl.getSupportedExtensions()?.join(',') || '';
    const params = [
      gl.getParameter(gl.VERSION),
      gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      vendor,
      renderer,
      extensions.slice(0, 100) // Limit length
    ];

    return params.join('|');
  } catch (e) {
    return 'webgl-error';
  }
};

// Audio context fingerprinting
const getAudioFingerprint = (): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        resolve('no-audio');
        return;
      }

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);

      gain.gain.setValueAtTime(0, context.currentTime);
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(context.destination);

      oscillator.start(0);

      let audioData = '';
      scriptProcessor.onaudioprocess = (e) => {
        const buffer = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += Math.abs(buffer[i]);
        }
        audioData = sum.toString();
        oscillator.stop();
        context.close();
        resolve(audioData);
      };

      // Fallback timeout
      setTimeout(() => {
        try {
          oscillator.stop();
          context.close();
        } catch (e) {}
        resolve(audioData || 'audio-timeout');
      }, 1000);
    } catch (e) {
      resolve('audio-error');
    }
  });
};

// Hardware detection
const getHardwareFingerprint = (): string => {
  return [
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    screen.width * screen.height,
    window.devicePixelRatio || 1,
    navigator.maxTouchPoints || 0
  ].join('|');
};

// Font detection and measurement
const getFontFingerprint = (): string => {
  const testFonts = [
    'Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia', 'Palatino',
    'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'
  ];

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'no-font-canvas';

  // Baseline measurement
  ctx.font = `${testSize} monospace`;
  const baselineWidth = ctx.measureText(testString).width;

  const availableFonts: string[] = [];
  testFonts.forEach(font => {
    ctx.font = `${testSize} ${font}, monospace`;
    const width = ctx.measureText(testString).width;
    if (width !== baselineWidth) {
      availableFonts.push(font);
    }
  });

  return availableFonts.join(',');
};

// Timezone and locale detection
const getTimezoneFingerprint = (): string => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language;
  const timezoneOffset = new Date().getTimezoneOffset();
  
  return [timezone, locale, timezoneOffset].join('|');
};

// Touch and input detection
const getTouchFingerprint = (): string => {
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const pointerSupport = 'onpointerdown' in window;
  const msTouchSupport = 'onmspointerdown' in window;
  
  return [touchSupport, pointerSupport, msTouchSupport, navigator.maxTouchPoints].join('|');
};

// Battery API fingerprinting
const getBatteryFingerprint = (): Promise<string> => {
  return new Promise((resolve) => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const data = [
          battery.charging,
          battery.chargingTime,
          battery.dischargingTime,
          Math.round(battery.level * 100)
        ].join('|');
        resolve(data);
      }).catch(() => resolve('battery-error'));
    } else {
      resolve('no-battery-api');
    }
  });
};

// Network information fingerprinting
const getNetworkFingerprint = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!connection) return 'no-network-api';

  return [
    connection.effectiveType || '',
    connection.downlink || '',
    connection.rtt || '',
    connection.saveData || false
  ].join('|');
};

// Permissions fingerprinting
const getPermissionsFingerprint = (): Promise<string> => {
  return new Promise(async (resolve) => {
    if (!navigator.permissions) {
      resolve('no-permissions-api');
      return;
    }

    const permissions = ['camera', 'microphone', 'geolocation', 'notifications'];
    const results: string[] = [];

    try {
      for (const permission of permissions) {
        try {
          const result = await navigator.permissions.query({ name: permission as PermissionName });
          results.push(`${permission}:${result.state}`);
        } catch (e) {
          results.push(`${permission}:unknown`);
        }
      }
      resolve(results.join('|'));
    } catch (e) {
      resolve('permissions-error');
    }
  });
};

// Generate comprehensive device hash
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    const fingerprintData: DeviceFingerprintData = {
      screen: getScreenFingerprint(),
      browser: getBrowserFingerprint(),
      canvas: getCanvasFingerprint(),
      webgl: getWebGLFingerprint(),
      audio: await getAudioFingerprint(),
      hardware: getHardwareFingerprint(),
      fonts: getFontFingerprint(),
      timezone: getTimezoneFingerprint(),
      touch: getTouchFingerprint(),
      battery: await getBatteryFingerprint(),
      network: getNetworkFingerprint(),
      permissions: await getPermissionsFingerprint()
    };

    // Combine all fingerprint data
    const combined = Object.values(fingerprintData).join('||');
    
    // Create hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex.slice(0, 16); // Return first 16 characters
  } catch (error) {
    console.error('Device fingerprinting failed:', error);
    // Fallback to basic fingerprint
    return btoa(
      `${navigator.userAgent}_${screen.width}x${screen.height}_${Date.now()}`
    ).slice(0, 16);
  }
};

// Cache fingerprint for session with enhanced persistence
let cachedFingerprint: string | null = null;
const FINGERPRINT_CACHE_KEY = 'device_fingerprint_cache';
const FINGERPRINT_SESSION_KEY = 'device_fingerprint_session';

export const getCachedDeviceFingerprint = async (): Promise<string> => {
  // First check memory cache
  if (cachedFingerprint) {
    return cachedFingerprint;
  }
  
  // Then check sessionStorage for current session
  const sessionStored = sessionStorage.getItem(FINGERPRINT_SESSION_KEY);
  if (sessionStored) {
    cachedFingerprint = sessionStored;
    return cachedFingerprint;
  }
  
  // Then check localStorage cache for persistence
  const stored = localStorage.getItem(FINGERPRINT_CACHE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      // Check if fingerprint is less than 24 hours old
      if (parsed.timestamp && (now - parsed.timestamp) < 24 * 60 * 60 * 1000) {
        cachedFingerprint = parsed.fingerprint;
        
        // Store in session for faster access
        sessionStorage.setItem(FINGERPRINT_SESSION_KEY, cachedFingerprint);
        
        return cachedFingerprint;
      }
    } catch (e) {
      console.error('Error parsing stored fingerprint:', e);
    }
  }
  
  // Generate new fingerprint
  cachedFingerprint = await generateDeviceFingerprint();
  
  // Store in both localStorage and sessionStorage
  const storageData = {
    fingerprint: cachedFingerprint,
    timestamp: Date.now()
  };
  
  localStorage.setItem(FINGERPRINT_CACHE_KEY, JSON.stringify(storageData));
  sessionStorage.setItem(FINGERPRINT_SESSION_KEY, cachedFingerprint);
  
  return cachedFingerprint;
};

export const clearFingerprintCache = (): void => {
  cachedFingerprint = null;
  localStorage.removeItem(FINGERPRINT_CACHE_KEY);
  sessionStorage.removeItem(FINGERPRINT_SESSION_KEY);
};

// Enhanced sync across tabs
export const syncFingerprintAcrossTabs = (): void => {
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('device-fingerprint-sync');
    
    // Listen for fingerprint updates from other tabs
    channel.onmessage = (event) => {
      if (event.data.type === 'fingerprint-update' && event.data.fingerprint) {
        cachedFingerprint = event.data.fingerprint;
        sessionStorage.setItem(FINGERPRINT_SESSION_KEY, cachedFingerprint);
      }
    };
    
    // If we have a cached fingerprint, broadcast it to other tabs
    if (cachedFingerprint) {
      channel.postMessage({
        type: 'fingerprint-update',
        fingerprint: cachedFingerprint
      });
    }
  }
};

// Initialize sync on module load
if (typeof window !== 'undefined') {
  syncFingerprintAcrossTabs();
}
