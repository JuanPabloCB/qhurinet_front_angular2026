// Cuentas, roles, pestañas y cabeceras. Fiel al prototipo: dos tipos de cuenta,
// dos roles, sin backend ni autenticación real.

export type AccountType = 'ciudadano' | 'bodega';
export type Role = 'reciclador' | 'generador';
export type AuthMode = 'login' | 'register';
export type Tab = 'mapa' | 'recojos' | 'chats' | 'publicar' | 'publicaciones' | 'perfil' | 'soporte';

export interface AccountTypeInfo {
  readonly key: AccountType;
  readonly label: string;
  readonly hint: string;
  readonly role: Role;
}

export interface AuthForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type AuthErrorField = keyof AuthForm | 'account';
export type AuthErrors = Partial<Record<AuthErrorField, string>>;

export interface Session {
  readonly account: AccountType;
  readonly role: Role;
}

export const ACCOUNT_TYPES: Record<AccountType, AccountTypeInfo> = {
  ciudadano: { key: 'ciudadano', label: 'Ciudadano', hint: 'Recojo materiales en mi zona', role: 'reciclador' },
  bodega: { key: 'bodega', label: 'Bodega o comercio', hint: 'Genero residuos aprovechables', role: 'generador' },
};

export const ACCOUNT_TYPE_LIST: readonly AccountTypeInfo[] = Object.values(ACCOUNT_TYPES);

// Pestañas exclusivas de un rol: deducen el rol inicial a partir del tab.
export const TAB_ROLE: Partial<Record<Tab, Role>> = {
  mapa: 'reciclador',
  recojos: 'reciclador',
  publicar: 'generador',
  publicaciones: 'generador',
};

// Pestañas por rol, en orden de la barra lateral.
export const RECICLADOR_TABS: readonly Tab[] = ['mapa', 'recojos', 'chats', 'perfil', 'soporte'];
export const GENERADOR_TABS: readonly Tab[] = ['publicar', 'publicaciones', 'chats', 'perfil', 'soporte'];

export const TAB_LABELS: Record<Tab, string> = {
  mapa: 'MAPA',
  recojos: 'RECOJOS',
  chats: 'CHATS',
  publicar: 'PUBLICAR',
  publicaciones: 'ANUNCIOS',
  perfil: 'PERFIL',
  soporte: 'SOPORTE',
};

// Título y subtítulo de la cabecera por pestaña.
export const HEADERS: Record<Tab, readonly [string, string]> = {
  mapa: ['Materiales disponibles', '14 anuncios activos · radio 5 km · San Isidro'],
  recojos: ['Mis recojos', '2 activos · 30 completados este mes'],
  chats: ['Mensajes', '3 conversaciones abiertas'],
  publicar: ['Anunciar material', 'Publica en menos de un minuto'],
  publicaciones: ['Mis publicaciones', '3 activos · 12 completados este mes'],
  perfil: ['Mi perfil', 'Reciclador verificado · Lima Centro'],
  soporte: ['Soporte', 'Respuesta promedio 12 min · llamada 24/7'],
};
