// Hilos de chat y conversaciones de muestra.

export interface Thread {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly time: string;
  readonly preview: string;
  readonly tag: string;
}

export interface Message {
  readonly from: 'me' | 'them';
  readonly text: string;
  readonly time: string;
}

export const THREADS: readonly Thread[] = [
  { id: 't1', name: 'Juan Flores', initials: 'JF', time: '14:02', preview: 'Te dejo las cajas en la puerta lateral.', tag: '24 KG · CARTÓN' },
  { id: 't2', name: 'Camila Salazar', initials: 'CS', time: '11:40', preview: 'Mañana a las 9 está perfecto.', tag: '8,5 KG · PET' },
  { id: 't3', name: 'Emilia Valencia', initials: 'EV', time: 'Ayer', preview: 'Gracias por la puntualidad.', tag: 'COMPLETADO' },
];

export const CONVOS: Record<string, readonly Message[]> = {
  t1: [
    { from: 'them', text: 'Hola Marco, ya reclamaste el cartón. ¿A qué hora pasas?', time: '13:48' },
    { from: 'me', text: 'Buenas tardes. Estoy llegando a las 14:35 aprox.', time: '13:52' },
    { from: 'them', text: 'Perfecto. Te dejo las cajas en la puerta lateral, toca el timbre 2.', time: '14:02' },
  ],
  t2: [
    { from: 'them', text: 'Las botellas están listas, son unas 8 kilos.', time: '11:20' },
    { from: 'me', text: 'Genial. ¿Te parece mañana a las 9?', time: '11:32' },
    { from: 'them', text: 'Mañana a las 9 está perfecto.', time: '11:40' },
  ],
  t3: [
    { from: 'them', text: 'Gracias por la puntualidad, te dejé 5 estrellas.', time: 'Ayer 18:10' },
    { from: 'me', text: 'Gracias a ti, nos vemos la próxima semana.', time: 'Ayer 18:22' },
  ],
};
