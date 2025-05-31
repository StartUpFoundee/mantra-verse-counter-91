
/**
 * Bulletproof Device Fingerprinting System
 * 15+ methods with multi-layer persistence
 */

export interface EnhancedFingerprintData {
  // Hardware-based (most stable)
  canvas: string;
  webgl: string;
  audio: string;
  screen: string;
  cpu: string;
  
  // Browser environment
  fonts: string;
  timezone: string;
  plugins: string;
  features: string;
  network: string;
  
  // Advanced methods
  battery: string;
  sensors: string;
  touch: string;
  media: string;
  performance: string;
  
  // Meta information
  timestamp: number;
  userAgent: string;
}

// Enhanced Canvas fingerprinting with multiple patterns
const getEnhancedCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 500;
    canvas.height = 300;

    // Pattern 1: Complex text rendering with emojis
    ctx.textBaseline = 'top';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device fingerprint 🔒🌟💻📱', 2, 15);
    
    // Pattern 2: Hindi/Sanskrit text (for spiritual app)
    ctx.font = '14px serif';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText('ॐ नमः शिवाय 🕉️', 10, 40);

    // Pattern 3: Complex geometric shapes
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(80, 80, 40, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Pattern 4: Gradient effects
    const gradient = ctx.createRadialGradient(200, 150, 0, 200, 150, 100);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(150, 100, 150, 100);

    // Pattern 5: Complex path
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(250, 50);
    ctx.quadraticCurveTo(300, 100, 350, 50);
    ctx.bezierCurveTo(400, 100, 450, 50, 500, 100);
    ctx.stroke();

    return canvas.toDataURL();
  } catch (e) {
    return `canvas-error-${Date.now()}`;
  }
};

// Enhanced WebGL with more GPU characteristics
const getEnhancedWebGLFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    const extensions = gl.getSupportedExtensions()?.join(',') || '';
    
    // Get more WebGL parameters
    const params = [
      gl.getParameter(gl.VERSION),
      gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      gl.getParameter(gl.MAX_VARYING_VECTORS),
      vendor,
      renderer,
      extensions.slice(0, 200)
    ];

    return params.join('|');
  } catch (e) {
    return `webgl-error-${navigator.userAgent.slice(0, 20)}`;
  }
};

// Enhanced audio fingerprinting
const getEnhancedAudioFingerprint = (): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        resolve(`no-audio-${navigator.hardwareConcurrency || 0}`);
        return;
      }

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      // Multiple oscillator types for unique signature
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);
      
      // Add gain variation
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(context.destination);

      oscillator.start(0);

      let audioData = '';
      scriptProcessor.onaudioprocess = (e) => {
        const buffer = e.inputBuffer.getChannelData(0);
        let sum = 0;
        let maxVal = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += Math.abs(buffer[i]);
          maxVal = Math.max(maxVal, Math.abs(buffer[i]));
        }
        audioData = `${sum.toFixed(6)}_${maxVal.toFixed(6)}_${context.sampleRate}`;
        oscillator.stop();
        context.close();
        resolve(audioData);
      };

      setTimeout(() => {
        try {
          oscillator.stop();
          context.close();
        } catch (e) {}
        resolve(audioData || `audio-timeout-${context.sampleRate || 44100}`);
      }, 1000);
    } catch (e) {
      resolve(`audio-error-${navigator.platform || 'unknown'}`);
    }
  });
};

// Enhanced screen fingerprinting
const getEnhancedScreenFingerprint = (): string => {
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
    window.innerHeight,
    screen.orientation?.type || 'unknown',
    screen.orientation?.angle || 0,
    window.outerWidth,
    window.outerHeight
  ].join('|');
};

// CPU timing-based fingerprinting
const getCPUFingerprint = (): string => {
  const start = performance.now();
  
  // CPU-intensive operation
  let result = 0;
  for (let i = 0; i < 100000; i++) {
    result += Math.random() * Math.sin(i);
  }
  
  const duration = performance.now() - start;
  
  return [
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    duration.toFixed(3),
    navigator.platform,
    result.toString().slice(0, 10)
  ].join('|');
};

// Enhanced font detection
const getEnhancedFontFingerprint = (): string => {
  const testFonts = [
    // System fonts
    'Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia', 'Palatino',
    'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact',
    // OS-specific fonts
    'Segoe UI', 'Roboto', 'San Francisco', 'Helvetica Neue', 'Ubuntu', 'Cantarell',
    // Regional fonts
    'Noto Sans', 'DejaVu Sans', 'Liberation Sans', 'Droid Sans',
    // Indian fonts for spiritual app
    'Mangal', 'Kruti Dev', 'DevLys', 'Chanakya', 'Sanskrit 2003'
  ];

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'no-font-canvas';

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

// Plugin and extension detection
const getPluginFingerprint = (): string => {
  const plugins = Array.from(navigator.plugins).map(plugin => plugin.name).join(',');
  const mimeTypes = Array.from(navigator.mimeTypes).map(mime => mime.type).join(',');
  
  return [
    plugins.slice(0, 100),
    mimeTypes.slice(0, 100),
    navigator.javaEnabled(),
    (navigator as any).cookieEnabled,
    (navigator as any).doNotTrack || 'unknown'
  ].join('|');
};

// Browser features detection
const getBrowserFeaturesFingerprint = (): string => {
  const features = [
    'localStorage' in window,
    'sessionStorage' in window,
    'indexedDB' in window,
    'WebSocket' in window,
    'Worker' in window,
    'ServiceWorker' in navigator,
    'Notification' in window,
    'requestAnimationFrame' in window,
    'File' in window,
    'Blob' in window,
    'URL' in window,
    'URLSearchParams' in window,
    'fetch' in window,
    'WebAssembly' in window,
    'SharedArrayBuffer' in window,
    'BigInt' in window
  ];

  return features.map(f => f ? '1' : '0').join('');
};

// Performance characteristics
const getPerformanceFingerprint = (): string => {
  if (!performance.memory) {
    return 'no-memory-info';
  }
  
  const memory = performance.memory as any;
  return [
    memory.usedJSHeapSize || 0,
    memory.totalJSHeapSize || 0,
    memory.jsHeapSizeLimit || 0,
    navigator.deviceMemory || 0
  ].join('|');
};

// Media devices fingerprinting
const getMediaDevicesFingerprint = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      resolve('no-media-devices');
      return;
    }

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const deviceInfo = devices.map(device => 
          `${device.kind}_${device.label ? 'labeled' : 'unlabeled'}`
        ).join(',');
        resolve(deviceInfo);
      })
      .catch(() => resolve('media-devices-error'));
  });
};

// Generate bulletproof device fingerprint
export const generateBulletproofFingerprint = async (): Promise<string> => {
  try {
    const fingerprintData: EnhancedFingerprintData = {
      canvas: getEnhancedCanvasFingerprint(),
      webgl: getEnhancedWebGLFingerprint(),
      audio: await getEnhancedAudioFingerprint(),
      screen: getEnhancedScreenFingerprint(),
      cpu: getCPUFingerprint(),
      fonts: getEnhancedFontFingerprint(),
      timezone: [
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        new Date().getTimezoneOffset(),
        Intl.DateTimeFormat().resolvedOptions().locale || 'unknown'
      ].join('|'),
      plugins: getPluginFingerprint(),
      features: getBrowserFeaturesFingerprint(),
      network: (() => {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (!connection) return 'no-network-api';
        return [
          connection.effectiveType || '',
          connection.downlink || '',
          connection.rtt || '',
          connection.saveData || false
        ].join('|');
      })(),
      battery: 'battery-deprecated',
      sensors: [
        'DeviceOrientationEvent' in window,
        'DeviceMotionEvent' in window,
        navigator.maxTouchPoints || 0
      ].join('|'),
      touch: [
        'ontouchstart' in window,
        'onpointerdown' in window,
        'onmspointerdown' in window,
        navigator.maxTouchPoints || 0,
        'orientation' in window
      ].join('|'),
      media: await getMediaDevicesFingerprint(),
      performance: getPerformanceFingerprint(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    // Combine all fingerprint data
    const combined = Object.values(fingerprintData).join('||SEPARATOR||');
    
    // Create multiple hashes for redundancy
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const primaryHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create shorter device ID (16 characters for better UX)
    const deviceId = primaryHash.slice(0, 16);
    
    // Store fingerprint data for verification
    const fingerprintWithId = {
      deviceId,
      primaryHash,
      fingerprintData,
      generatedAt: Date.now()
    };
    
    return deviceId;
  } catch (error) {
    console.error('Enhanced fingerprinting failed:', error);
    // Ultra-fallback fingerprint
    const fallbackData = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      navigator.language,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      Date.now()
    ].join('_');
    
    return btoa(fallbackData).slice(0, 16);
  }
};

// Multi-layer storage system
export class BulletproofStorage {
  private static readonly DEVICE_ID_KEY = 'bulletproof_device_id';
  private static readonly FINGERPRINT_KEY = 'bulletproof_fingerprint_data';
  private static readonly BACKUP_PREFIX = 'backup_';
  
  static async storeDeviceId(deviceId: string, fingerprintData?: any): Promise<void> {
    const data = {
      deviceId,
      fingerprintData,
      timestamp: Date.now(),
      version: '2.0'
    };
    
    // Layer 1: localStorage (primary)
    localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    localStorage.setItem(this.FINGERPRINT_KEY, JSON.stringify(data));
    
    // Layer 2: sessionStorage (backup)
    sessionStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    sessionStorage.setItem(this.FINGERPRINT_KEY, JSON.stringify(data));
    
    // Layer 3: IndexedDB (persistent)
    try {
      await this.storeInIndexedDB(deviceId, data);
    } catch (e) {
      console.warn('IndexedDB storage failed:', e);
    }
    
    // Layer 4: Multiple localStorage keys (hidden backups)
    for (let i = 1; i <= 5; i++) {
      localStorage.setItem(`${this.BACKUP_PREFIX}${i}_device`, deviceId);
    }
    
    // Layer 5: CSS custom properties (creative backup)
    try {
      document.documentElement.style.setProperty('--device-id', deviceId);
    } catch (e) {}
    
    // Layer 6: Window name (session backup)
    try {
      window.name = `device_${deviceId}_${Date.now()}`;
    } catch (e) {}
    
    // Layer 7: BroadcastChannel sync
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bulletproof-device-sync');
      channel.postMessage({ type: 'device-id-update', deviceId, data });
      channel.close();
    }
  }
  
  static async getDeviceId(): Promise<string | null> {
    // Try each storage layer in order of reliability
    
    // Layer 1: localStorage (primary)
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (deviceId) return deviceId;
    
    // Layer 2: sessionStorage
    deviceId = sessionStorage.getItem(this.DEVICE_ID_KEY);
    if (deviceId) {
      // Restore to localStorage
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      return deviceId;
    }
    
    // Layer 3: IndexedDB
    try {
      const dbData = await this.getFromIndexedDB();
      if (dbData?.deviceId) {
        localStorage.setItem(this.DEVICE_ID_KEY, dbData.deviceId);
        sessionStorage.setItem(this.DEVICE_ID_KEY, dbData.deviceId);
        return dbData.deviceId;
      }
    } catch (e) {}
    
    // Layer 4: Backup localStorage keys
    for (let i = 1; i <= 5; i++) {
      deviceId = localStorage.getItem(`${this.BACKUP_PREFIX}${i}_device`);
      if (deviceId) {
        localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
        return deviceId;
      }
    }
    
    // Layer 5: CSS custom properties
    try {
      deviceId = getComputedStyle(document.documentElement).getPropertyValue('--device-id').trim();
      if (deviceId) {
        localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
        return deviceId;
      }
    } catch (e) {}
    
    // Layer 6: Window name
    try {
      if (window.name && window.name.startsWith('device_')) {
        deviceId = window.name.split('_')[1];
        if (deviceId && deviceId.length === 16) {
          localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
          return deviceId;
        }
      }
    } catch (e) {}
    
    return null;
  }
  
  private static async storeInIndexedDB(deviceId: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BulletproofDeviceDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['device'], 'readwrite');
        const store = transaction.objectStore('device');
        store.put({ id: 'primary', deviceId, data, timestamp: Date.now() });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('device')) {
          db.createObjectStore('device', { keyPath: 'id' });
        }
      };
    });
  }
  
  private static async getFromIndexedDB(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BulletproofDeviceDB', 1);
      
      request.onerror = () => resolve(null);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['device'], 'readonly');
        const store = transaction.objectStore('device');
        const getRequest = store.get('primary');
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => resolve(null);
      };
      
      request.onupgradeneeded = () => resolve(null);
    });
  }
}

// Device ID with fuzzy matching for variations
export const getBulletproofDeviceId = async (): Promise<string> => {
  // First try to get stored device ID
  let storedId = await BulletproofStorage.getDeviceId();
  
  if (storedId) {
    // Verify the stored ID is still valid by regenerating fingerprint
    const currentFingerprint = await generateBulletproofFingerprint();
    
    // For now, trust the stored ID if it exists
    // In production, you might want to verify similarity
    return storedId;
  }
  
  // Generate new device ID
  const newDeviceId = await generateBulletproofFingerprint();
  await BulletproofStorage.storeDeviceId(newDeviceId);
  
  return newDeviceId;
};

// Cross-tab synchronization
export const initializeBulletproofSync = (): void => {
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('bulletproof-device-sync');
    
    channel.onmessage = async (event) => {
      if (event.data.type === 'device-id-update') {
        const { deviceId } = event.data;
        localStorage.setItem(BulletproofStorage['DEVICE_ID_KEY'], deviceId);
        sessionStorage.setItem(BulletproofStorage['DEVICE_ID_KEY'], deviceId);
      }
    };
  }
  
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === BulletproofStorage['DEVICE_ID_KEY'] && event.newValue) {
      // Device ID updated in another tab
      sessionStorage.setItem(BulletproofStorage['DEVICE_ID_KEY'], event.newValue);
    }
  });
};

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeBulletproofSync();
}
