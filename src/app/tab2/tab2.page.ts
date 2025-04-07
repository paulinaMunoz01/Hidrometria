// Importaciones necesarias
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonButton, IonItem, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSelect, IonSelectOption, IonTextarea, IonCard, IonLabel,
  IonCardHeader, IonCardTitle, IonCardContent, IonSpinner, IonCardSubtitle,
  IonIcon
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../services/users.service'; // Servicio para manejar la API
import { AlertController, ToastController } from '@ionic/angular'; // Controladores de alertas y toasts
import { addIcons } from 'ionicons'; // Añadir íconos personalizados
import { trashOutline, checkmarkOutline } from 'ionicons/icons'; // Íconos usados

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true, // Componente independiente
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonButton,
    FormsModule,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonCard,
    IonLabel,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonCardSubtitle,
    IonIcon,
    DatePipe // Para formateo de fechas
  ]
})
export class Tab2Page implements OnInit {
  // Variables del formulario de reporte
  reportType: string = '';
  reportDescription: string = '';
  reportLocation: string = '';

  // Variables del usuario
  userId: string = '';
  esAdmin: boolean = false;
  userName: string = '';

  // Lista de incidencias y estados
  incidencias: any[] = [];
  loading: boolean = false;
  loadingDelete: boolean = false;
  error: string | null = null;

  constructor(
    private usersService: UsersService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    // Añadimos íconos para usar en la plantilla
    addIcons({ trashOutline, checkmarkOutline });
  }

  // Al iniciar el componente, cargamos sesión e incidencias
  ngOnInit() {
    this.loadSessionData();
    this.loadIncidencias();
  }

  // Carga los datos de sesión desde el localStorage
  loadSessionData() {
    const storedUserId = localStorage.getItem('userId');
    const storedEsAdmin = localStorage.getItem('esAdmin');
    const storedUserName = localStorage.getItem('userName');

    if (storedUserId) {
      this.userId = storedUserId;
      this.esAdmin = storedEsAdmin === 'true'; // Convertimos string a boolean
      this.userName = storedUserName || '';
    }
  }

  // Carga las incidencias del usuario o todas si es admin
  loadIncidencias() {
    this.loading = true;
    this.error = null;

    const observable = this.esAdmin 
      ? this.usersService.getIncidenciasAdmin()
      : this.usersService.getIncidenciasPorUsuario(this.userId);

    observable.subscribe({
      next: (response) => {
        this.incidencias = response.Respuesta || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar incidencias:', error);
        this.error = 'Error al cargar incidencias';
        this.loading = false;
      }
    });
  }

  // Envía un nuevo reporte a la API
  submitReport() {
    if (!this.validateReportForm()) {
      this.mostrarMensaje('Por favor completa todos los campos', 'error');
      return;
    }

    const reportData = this.createReportData();
    this.loading = true;

    this.usersService.postReporte(reportData).subscribe({
      next: () => this.handleReportSuccess(),
      error: (error) => this.handleReportError(error)
    });
  }

  // Cambia el estado de una incidencia a "resuelto" (solo admins)
  async cambiarEstadoIncidencia(incidencia: any) {
    if (!this.esAdmin) return;

    const confirmacion = await this.mostrarConfirmacion(
      'Cambiar estado',
      `¿Marcar la incidencia "${incidencia.tipo}" como resuelta?`
    );

    if (!confirmacion) return;

    this.loading = true;
    this.usersService.updateIncidencia(incidencia.id).subscribe({
      next: () => {
        incidencia.resuelto = true;
        this.mostrarMensaje('Incidencia marcada como resuelta');
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('Error al actualizar la incidencia', 'error');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Elimina una incidencia (requiere confirmación)
  async eliminarIncidencia(incidencia: any) {
    const confirmacion = await this.mostrarConfirmacion(
      'Eliminar incidencia',
      `¿Estás seguro de eliminar la incidencia "${incidencia.tipo}"?`
    );

    if (!confirmacion) return;

    this.loadingDelete = true;
    this.usersService.deleteIncidencia(incidencia.id).subscribe({
      next: () => {
        // Eliminamos la incidencia de la lista actual
        this.incidencias = this.incidencias.filter(i => i.id !== incidencia.id);
        this.mostrarMensaje('Incidencia eliminada');
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.mostrarMensaje('Error al eliminar la incidencia', 'error');
      },
      complete: () => {
        this.loadingDelete = false;
      }
    });
  }

  // Muestra un mensaje de confirmación (alerta modal)
  private async mostrarConfirmacion(titulo: string, mensaje: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  // Muestra un toast (mensaje emergente) en la pantalla
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: tipo === 'success' ? 'success' : 'danger',
      position: 'top'
    }).then(toast => toast.present());
  }

  // Valida que el formulario tenga todos los campos completos
  private validateReportForm(): boolean {
    return !!this.reportType && !!this.reportDescription && !!this.reportLocation;
  }

  // Crea el objeto del reporte que se va a enviar a la API
  private createReportData() {
    return {
      tipo: this.reportType,
      descripcion: this.reportDescription,
      ubicacion: this.reportLocation,
      resuelto: false,
      idUsuario: this.userId
    };
  }

  // Manejo después de un envío exitoso del reporte
  private handleReportSuccess() {
    // Limpiar formulario
    this.reportType = '';
    this.reportDescription = '';
    this.reportLocation = '';
    // Recargar la lista de incidencias
    this.loadIncidencias();
    this.mostrarMensaje('Reporte enviado con éxito');
  }

  // Manejo de errores al enviar el reporte
  private handleReportError(error: any) {
    console.error('Error al enviar reporte:', error);
    this.loading = false;
    this.mostrarMensaje('Error al enviar el reporte. Por favor intenta nuevamente.', 'error');
  }
}