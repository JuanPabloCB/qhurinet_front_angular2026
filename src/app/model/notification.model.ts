import { Role } from './account.model';

// Centro de notificaciones: seis fijas por rol.

export interface AppNotification {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly time: string;
}

export const NOTIFICATIONS: Record<Role, readonly AppNotification[]> = {
  reciclador: [
    { id: 'nr1', title: 'Recolección aceptada', text: 'Juan Flores aceptó tu reclamo de 24 kg de cartón plegado.', time: 'HOY · 13:40' },
    { id: 'nr2', title: 'Recolección coordinada', text: 'Camila Salazar confirmó el recojo de botellas PET para mañana a las 09:00.', time: 'HOY · 11:32' },
    { id: 'nr3', title: 'En camino', text: 'Estás en ruta a Minimarket H&J. Confirma la entrega con el QR al llegar.', time: 'HOY · 14:05' },
    { id: 'nr4', title: 'Entrega confirmada', text: '9 kg de bolsas de plástico recuperados con Emilia Valencia.', time: 'AYER · 17:10' },
    { id: 'nr5', title: 'Recolección cancelada', text: 'Rest. La Huerta canceló la recolección de vidrio mixto del jueves.', time: 'HACE 2 D' },
    { id: 'nr6', title: 'Documento por vencer', text: 'Tu constancia municipal vence en 15 días. Renuévala desde Documentos.', time: 'HACE 3 D' },
  ],
  generador: [
    { id: 'ng1', title: 'Recolección aceptada', text: 'Marco Quispe aceptó tu anuncio de 30 kg de cartón plegado.', time: 'HOY · 13:40' },
    { id: 'ng2', title: 'Recolección coordinada', text: 'Rosa Huamán coordinó el recojo de papel de oficina para hoy 16:00–19:00.', time: 'HOY · 12:05' },
    { id: 'ng3', title: 'Recolector en camino', text: 'Marco Quispe está en camino a Av. Pershing 345. Llega en 18 min.', time: 'HOY · 14:10' },
    { id: 'ng4', title: 'Entrega confirmada', text: '18 kg de vidrio mixto entregados a Luis Ttito. Ya puedes valorarlo.', time: 'HACE 2 D' },
    { id: 'ng5', title: 'Recolección cancelada', text: 'El reciclador canceló el recojo de botellas PET del martes.', time: 'HACE 3 D' },
    { id: 'ng6', title: 'Anuncio sin reclamar', text: 'Tu anuncio de 6 kg de botellas PET lleva un día sin reclamar.', time: 'HACE 3 D' },
  ],
};

export const NOTIF_IDS: readonly string[] = [...NOTIFICATIONS.reciclador, ...NOTIFICATIONS.generador].map((n) => n.id);

export const DEFAULT_READ: readonly string[] = ['nr4', 'nr5', 'nr6', 'ng4', 'ng5', 'ng6'];
