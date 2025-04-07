// Importación de los módulos y componentes necesarios
import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import {
  IonButton, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonLabel, IonCardHeader, IonCardTitle, IonCardContent, 
  IonText, IonIcon, IonSpinner 
} from '@ionic/angular/standalone';
import { UsersService } from '../services/users.service'; // Servicio personalizado para obtener datos del usuario
import { Router } from '@angular/router'; // Para navegación entre páginas
import { addIcons } from 'ionicons'; // Para agregar iconos personalizados
import { shieldCheckmark } from 'ionicons/icons';

@Component({
  selector: 'app-tab3', // Nombre del selector del componente
  templateUrl: './tab3.page.html', // Ruta al archivo de la plantilla HTML
  styleUrls: ['./tab3.page.scss'], // Ruta al archivo de estilos
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonButton,
    IonCard,
    IonLabel,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonIcon,
    IonSpinner
  ]
})
export class Tab3Page implements OnInit {
  // Variables para almacenar datos del usuario, estado de carga y errores
  userData: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  userId: string = ''; // ID del usuario que se obtiene desde localStorage

  constructor(
    private usersService: UsersService, // Inyección del servicio de usuarios
    private router: Router // Inyección del servicio de navegación
  ) {
    addIcons ({shieldCheckmark}); // Agregar icono personalizado
   }

  // Método que se ejecuta al iniciar el componente
  ngOnInit() {
    // Obtenemos el userId del almacenamiento local
    this.userId = localStorage.getItem('userId') || '';
    
    // Si no hay userId, redirigimos al login
    if (!this.userId) {
      this.router.navigate(['/log-in']);
      return;
    }

    // Si hay userId, cargamos los datos completos del usuario
    this.loadCompleteUserData(this.userId);
  }

  // Método que hace la llamada al servicio para obtener los datos del usuario
  loadCompleteUserData(userId: string) {
    this.isLoading = true; // Mostramos spinner de carga
    this.errorMessage = ''; // Limpiamos mensajes de error anteriores
    
    this.usersService.getUserComplete(userId).subscribe({
      next: (response: any) => {
        // Si la respuesta tiene datos del usuario, los guardamos
        if (response.Usuario) {
          this.userData = response.Usuario;
        } else {
          // Si no, mostramos mensaje de error
          this.errorMessage = 'No se encontraron datos completos del usuario';
        }
        this.isLoading = false; // Ocultamos spinner
      },
      error: (error) => {
        // Si ocurre un error en la solicitud, lo mostramos por consola y en pantalla
        console.error('Error:', error);
        this.errorMessage = 'Error al cargar los datos del usuario';
        this.isLoading = false;
      }
    });
  }

  // Método para volver a cargar los datos del usuario (por ejemplo, al actualizar)
  reloadUserData() {
    if (this.userId) {
      this.loadCompleteUserData(this.userId);
    }
  }

  // Método para cerrar sesión
  cerrarSesion() {
    localStorage.clear(); // Limpiamos el almacenamiento local
    this.router.navigate(['/log-in'], { replaceUrl: true }); // Redirigimos al login
  }
}