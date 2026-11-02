import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { AuthLayoutComponent } from './components/auth/auth-layout/auth-layout.component';
import { AuthFormComponent } from './components/auth/auth-form/auth-form.component';
import { ConsoleShellComponent } from './components/console/console-shell/console-shell.component';
import { MapComponent } from './components/map/map.component';
import { PickupsComponent } from './components/pickups/pickups.component';
import { PublishComponent } from './components/publish/publish.component';
import { PublicationsComponent } from './components/publications/publications.component';
import { ChatsComponent } from './components/chats/chats.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SupportComponent } from './components/support/support.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: AuthFormComponent, data: { mode: 'login' }, title: 'Iniciar sesión · QhuriNet' },
      { path: 'registro', component: AuthFormComponent, data: { mode: 'register' }, title: 'Crear cuenta · QhuriNet' },
    ],
  },
  {
    path: 'app',
    component: ConsoleShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'mapa', pathMatch: 'full' },
      { path: 'mapa', component: MapComponent, data: { tab: 'mapa' }, title: 'Mapa · QhuriNet' },
      { path: 'recojos', component: PickupsComponent, data: { tab: 'recojos' }, title: 'Recojos · QhuriNet' },
      { path: 'publicar', component: PublishComponent, data: { tab: 'publicar' }, title: 'Publicar · QhuriNet' },
      { path: 'publicaciones', component: PublicationsComponent, data: { tab: 'publicaciones' }, title: 'Anuncios · QhuriNet' },
      { path: 'chats', component: ChatsComponent, data: { tab: 'chats' }, title: 'Chats · QhuriNet' },
      { path: 'perfil', component: ProfileComponent, data: { tab: 'perfil' }, title: 'Perfil · QhuriNet' },
      { path: 'soporte', component: SupportComponent, data: { tab: 'soporte' }, title: 'Soporte · QhuriNet' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
