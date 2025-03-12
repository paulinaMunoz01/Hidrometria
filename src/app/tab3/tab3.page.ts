import { Component } from '@angular/core';
import {
  IonButton,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonCard, 
  IonLabel
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../services/users.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  imports: [
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
    IonLabel
  ],
  standalone: true,
})
export class Tab3Page {
  reportType: string = '';
  reportDescription: string = '';
  reportLocation: string = '';

  constructor(private usersService: UsersService) {}

  ngOnInit() {}

  submitReport() {
    // Valida que todos los campos tengan valor
    if (!this.reportType || !this.reportDescription || !this.reportLocation) {
      console.error('Por favor, completa todos los campos.');
      return;
    }

    const reportData = {
      tipo: this.reportType,
      descripcion: this.reportDescription,
      ubicacion: this.reportLocation,
      resuelto: false
    };

    this.usersService.postReporte(reportData).subscribe(
      (response) => {
        console.log('Reporte enviado exitosamente', response);
        // Aquí puedes mostrar una notificación (toast, alert, etc.) al usuario
      },
      (error) => {
        console.error('Error al enviar el reporte', error);
      }
    );
  }
}