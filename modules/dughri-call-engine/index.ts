import { NativeModule, requireNativeModule } from 'expo-modules-core';

export interface Capabilities {
  callDetection: string;
  phoneState: string;
  numberSource: string;
  overlay: string;
  backgroundOperation: string;
}

export interface Snapshot {
  role: string;
  phonePermission: string;
  overlayPermission: string;
  observing: boolean;
  observer: string;
  state: string;
  direction: string;
  maskedNumber: string;
  completion: string;
  overlay: string;
  automatic: string;
  background: string;
  capabilities?: Capabilities;
  engine?: string;
  diagnostic: string;
  whatsapp: boolean;
  business: boolean;
  trace: { at: string; code: string }[];
}
type Events = { diagnosticsChanged: (snapshot: Snapshot) => void };
declare class CallEngine extends NativeModule<Events> {
  getSnapshot(): Promise<Snapshot>;
  getArabic(): Promise<boolean>;
  getAppPreferences(): Promise<string | null>;
  setAppPreferences(payload: string): Promise<void>;
  setArabic(value: boolean): Promise<void>;
  setEngineSettings(enabled: boolean, incoming: boolean, outgoing: boolean, business: boolean, ar: boolean, region: string | null): Promise<void>;
  startObservation(): Promise<string>;
  stopObservation(): Promise<void>;
  requestScreeningRole(): Promise<string>;
  openOverlaySettings(): Promise<string>;
  dismissOverlay(): Promise<void>;
  showOverlayProbe(number: string, business: boolean, ar: boolean): Promise<string>;
  launchWhatsAppTest(number: string, business: boolean): Promise<string>;
}
export default requireNativeModule<CallEngine>('DughriCallEngine');
