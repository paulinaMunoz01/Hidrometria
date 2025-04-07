// Importaciones de módulos 
// y componentes necesarios para la funcionalidad del componente de registro.
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardContent, IonInput, IonButton, 
  IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { UsersService } from '../services/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Decorador que define el componente 
//'app-registro' con su plantilla, estilos e importaciones.
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent, IonInput, IonButton,
    IonSelect, IonSelectOption,
    FormsModule, CommonModule
  ]
})
export class RegistroPage {
  // Propiedades para almacenar los datos del formulario de registro 
  // (usuario, nombre, contraseña, dirección) y el tipo de cuenta.
  usuario = '';
  name = '';
  contrasena = '';
  direccion = '';
  tipoCuenta: 'usuario' | 'administrador' = 'usuario';

  // Constructor que inyecta el servicio 'UsersService' 
  // para la comunicación con el backend y el 'Router' para la navegación.
  constructor(private usersService: UsersService, private router: Router) {}

  // Método para redirigir al usuario a la página de inicio de sesión.
  redirigirInicio() {
    this.router.navigate(['log-in']);
  }

  // Método asíncrono para registrar un nuevo usuario. 
  // Valida el formulario, prepara los datos 
  // y llama al servicio de registro. Maneja la respuesta y los posibles errores.
  async registrarUsuario() {
    if (!this.validarFormulario()) return;

    const data = {
      usuario: this.usuario.trim(),
      name: this.name.trim(),
      pass: this.contrasena,
      direccion: this.direccion.trim(),
      admin: this.tipoCuenta === 'administrador'
    };

    try {
      const response = await this.usersService.postRegistro(data).toPromise();
      console.log('Registro exitoso:', response);
      alert('Usuario registrado con éxito');
      this.router.navigate(['log-in']);
    } catch (error) {
      console.error('Error en registro:', error);
      alert(this.obtenerMensajeError(error));
    }
  }

  // Método privado para validar que todos los campos del 
  // formulario estén completos y que la contraseña cumpla con los requisitos.
  private validarFormulario(): boolean {
    if (!this.usuario || !this.name || !this.contrasena || !this.direccion) {
      alert('Por favor complete todos los campos');
      return false;
    }

    if (this.contrasena.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  }

  // Método privado para obtener un mensaje de error específico 
  // basado en el código de estado del error del servidor.
  private obtenerMensajeError(error: any): string {
    if (error.status === 409) {
      return 'El nombre de usuario ya existe';
    }
    return 'El nombre de Usuario ya existe.';
  }
}