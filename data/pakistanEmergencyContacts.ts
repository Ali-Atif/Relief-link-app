import { Ionicons } from '@expo/vector-icons';

export type PakEmergencyIcon = keyof typeof Ionicons.glyphMap;

export type PakistanEmergencyRow = {
  id: string;
  /** Digits and optional + for tel: — shown only to dialer, not in UI */
  dial: string;
  icon: PakEmergencyIcon;
  nameKey: string;
};

export const PAKISTAN_EMERGENCY_CONTACTS: readonly PakistanEmergencyRow[] = [
  { id: 'police', dial: '15', icon: 'shield', nameKey: 'emergencyContacts.service.police' },
  { id: 'edhi', dial: '115', icon: 'medical', nameKey: 'emergencyContacts.service.edhi' },
  { id: 'rescue1122', dial: '1122', icon: 'medkit', nameKey: 'emergencyContacts.service.rescue1122' },
  { id: 'fire', dial: '16', icon: 'flame', nameKey: 'emergencyContacts.service.fire' },
  { id: 'pme', dial: '1166', icon: 'heart', nameKey: 'emergencyContacts.service.pme' },
  { id: 'chhipa', dial: '1020', icon: 'car-sport', nameKey: 'emergencyContacts.service.chhipa' },
  { id: 'aman', dial: '1021', icon: 'pulse', nameKey: 'emergencyContacts.service.aman' },
  { id: 'motorway', dial: '130', icon: 'car', nameKey: 'emergencyContacts.service.motorway' },
  { id: 'railway', dial: '117', icon: 'train', nameKey: 'emergencyContacts.service.railway' },
  { id: 'suiGas', dial: '1199', icon: 'flash-off', nameKey: 'emergencyContacts.service.suiGas' },
  { id: 'wapda', dial: '118', icon: 'flash', nameKey: 'emergencyContacts.service.wapda' },
  { id: 'ptcl', dial: '1218', icon: 'headset', nameKey: 'emergencyContacts.service.ptcl' },
  { id: 'child', dial: '1121', icon: 'people', nameKey: 'emergencyContacts.service.child' },
  { id: 'ndma', dial: '051-111-157-157', icon: 'globe', nameKey: 'emergencyContacts.service.ndma' },
] as const;
