import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonAvatar, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonAvatar, IonCard, IonCardHeader, IonCardContent, IonCardTitle, FormsModule, IonButton],
})
export class Tab2Page {
  propietarios: any[] = [];
  propietariosFiltrados: any[] = [];
  searchTerm: string = ''; // Término de búsqueda

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit() {
    this.obtenerPropietarios();
  }

  obtenerPropietarios() {
    this.usersService.getPropietarios().subscribe((response: any) => {
      if (response.Respuesta) {
        this.propietarios = response.Respuesta;
        this.propietariosFiltrados = [...this.propietarios]; // Inicializar con todos los propietarios
      }
    });
  }

  // Método para filtrar propietarios por nombre o ID
  filtrarPropietarios() {
    const term = this.searchTerm.toLowerCase();
    this.propietariosFiltrados = this.propietarios.filter(propietario =>
      propietario.nombre.toLowerCase().includes(term) || 
      propietario.id.includes(term)
    );
  }

  verDetalles() {
    console.log("Medidor seleccionado:");
    // Aquí puedes navegar a otra página o mostrar un modal
    this.router.navigate(['/dashboard']);
  }
  
}
