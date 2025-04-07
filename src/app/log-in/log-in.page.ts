// Importaciones de módulos y componentes necesarios para la funcionalidad del componente.
import { Component } from '@angular/core';
import { UsersService } from '../services/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, IonCardContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

// Decorador que define el componente 'app-log-in' con su plantilla, estilos e importaciones.
@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonContent, 
    IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule, IonCard, IonCardContent]
})
export class LogInPage {

  // Propiedades para almacenar los datos 
  usuario = '';
  contrasena = '';
  esAdmin: boolean = false;
  userId: string = '';

  // Constructor que inyecta los servicios 'UsersService' 
  // para la autenticación y 'Router' para la navegación.
  constructor(private usersService: UsersService, private router: Router) { }

  // Esto limpia los campos de usuario y contraseña para evitar que se queden datos anteriores.
  ionViewWillEnter() {
    this.usuario = '';
    this.contrasena = '';
  }

  // Método para redirigir al usuario a la página de registro.
  redirigirRegistro() {
    this.router.navigate(['registro']);
  }

  // Método principal para iniciar la sesión del usuario. 
  iniciarSesion() {
    // Crea un objeto con los datos del usuario 
    // y la contraseña para enviar al servicio de autenticación.
    const data = {
      usuario: this.usuario,
      pass: this.contrasena
    };

    // Llama al servicio 'loginUser' del 'usersService' 
    this.usersService.loginUser(data).subscribe(response => {
      console.log('Respuesta del servidor:', response);

      // Verifica si la respuesta del servidor indica un 
      // inicio de sesión exitoso (código 200) 
      if (response?.intResponse === "200" && response?.Usuario?.id) {
        alert('Inicio de sesión exitoso');
        this.userId = response.Usuario.id;
        this.esAdmin = response.Usuario.admin ?? false;

        // Guarda el ID del usuario y el estado de administrador en 
        // el almacenamiento local del navegador.
        localStorage.setItem('userId', this.userId);
        localStorage.setItem('esAdmin', JSON.stringify(this.esAdmin));
        console.log('Guardado en localStorage:', {
          userId: localStorage.getItem('userId'),
          esAdmin: localStorage.getItem('esAdmin')
        });

        // Navega a la página principal de la aplicación 
        // después del inicio de sesión exitoso.
        this.router.navigate(['tabs/tabs/tab1']);
      } else {
        // Muestra una alerta si las credenciales son incorrectas 
        alert('Credenciales incorrectas');
      }
    }, error => {
      console.error('Error en la petición:', error);
      alert('Error al iniciar sesión');
    });
  }
}