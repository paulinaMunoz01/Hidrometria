import { Component } from '@angular/core';
import { UsersService } from '../services/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardContent]
})
export class LogInPage  {

  usuario = '';
  contrasena = '';

  constructor(private usersService: UsersService, private router: Router) { }

  redirigirRegistro(){
    this.router.navigate(['registro'])
  }

  iniciarSesion() {
    const data = {
      usuario: this.usuario,
      pass: this.contrasena
    };
  
    this.usersService.loginUser(data).subscribe(response => {
      console.log(response);
      if (response.Mensaje === "Login exitoso") {
        alert('Inicio de sesión exitoso');
        
        // Guardar el ID del usuario en localStorage
        localStorage.setItem('userId', response.idUsuario); 
  
        this.router.navigate(['tabs/tabs/tab1']);
      } else {
        alert('Credenciales incorrectas');
      }
    }, error => {
      console.error(error);
      alert('Error al iniciar sesión');
    });
  }  
}