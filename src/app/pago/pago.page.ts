// Importaciones necesarias de Angular e Ionic
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Componentes individuales de Ionic utilizados en esta página
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonLabel,
  IonButton, IonIcon, IonCard, IonInput, IonItem,
  IonButtons, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';

// Servicio personalizado para interactuar con la API
import { UsersService } from '../services/users.service';

// Decorador que define el componente
@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
  standalone: true, // Uso de componentes standalone de Angular
  imports: [
    // Módulos y componentes importados para usar en la vista
    IonItem, IonCard, IonIcon,
    IonButton, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar,
    IonSelect, IonSelectOption, CommonModule, FormsModule
  ]
})
export class PagoPage implements OnInit {

  // Variables del componente
  selectedMes: string = ''; // Mes seleccionado actualmente
  datosMes: any = {};       // Datos asociados al mes seleccionado
  meses: any[] = [];        // Lista de trimestres generados

  constructor(private usersService: UsersService) {}

  // Hook de ciclo de vida: se llama cuando se inicializa el componente
  ngOnInit() {
    this.obtenerDatosReales();
  }

  // Obtiene los datos de consumo de agua desde la API
  async obtenerDatosReales() {
    try {
      const response = await this.usersService.getFlujoAgua().toPromise();
      const flujoAgua = response?.Respuesta || [];

      // Agrupa los datos por trimestre
      const trimestres = this.agruparPorTrimestre(flujoAgua);
      this.meses = trimestres;

      // Establece el primer trimestre como seleccionado por defecto
      if (this.meses.length > 0) {
        this.selectedMes = this.meses[0].nombre;
        this.datosMes = this.meses[0];
      }

    } catch (error) {
      console.error('Error al obtener flujo de agua:', error);
    }
  }

  // Agrupa los datos por trimestre y calcula saldos y niveles
  agruparPorTrimestre(flujoAgua: any[]) {
    const trimestres: { [key: string]: any } = {};
    const tarifa = 0.013; // Tarifa por litro

    flujoAgua.forEach(flujo => {
      const fecha = new Date(flujo.fecha);
      const mes = fecha.getMonth(); // 0 = Enero
      const año = fecha.getFullYear();

      let trimestreNombre = '';
      let fechaPago = '';
      let key = '';

      // Determina a qué trimestre pertenece la fecha
      if (mes <= 2) {
        trimestreNombre = `Enero - Marzo ${año}`;
        fechaPago = `10/Marzo/${año}`;
        key = `${año}-Q1`;
      } else if (mes <= 5) {
        trimestreNombre = `Abril - Junio ${año}`;
        fechaPago = `10/Junio/${año}`;
        key = `${año}-Q2`;
      } else if (mes <= 8) {
        trimestreNombre = `Julio - Septiembre ${año}`;
        fechaPago = `10/Septiembre/${año}`;
        key = `${año}-Q3`;
      } else {
        trimestreNombre = `Octubre - Diciembre ${año}`;
        fechaPago = `10/Diciembre/${año}`;
        key = `${año}-Q4`;
      }

      // Si aún no existe el trimestre, lo inicializa
      if (!trimestres[key]) {
        trimestres[key] = {
          nombre: trimestreNombre,
          fechaPago,
          consumo: 0,
          saldo: 0,
          nivel: '',
          pagado: false
        };
      }

      // Suma los litros consumidos al trimestre correspondiente
      trimestres[key].consumo += flujo.litros;
    });

    // Calcula el saldo (en pesos) y el nivel de consumo
    for (const key in trimestres) {
      const t = trimestres[key];
      t.saldo = parseFloat((t.consumo * tarifa).toFixed(2)); // Redondeado a 2 decimales

      // Clasifica el nivel de consumo
      if (t.consumo < 13333) t.nivel = 'Bajo';
      else if (t.consumo < 26666) t.nivel = 'Medio';
      else t.nivel = 'Alto';
    }

    // Retorna los trimestres ordenados por nombre
    return Object.values(trimestres).sort((a: any, b: any) =>
      a.nombre.localeCompare(b.nombre)
    );
  }

  // Carga los datos del trimestre seleccionado
  cargarDatosMes() {
    this.datosMes = this.meses.find(m => m.nombre === this.selectedMes) || this.meses[0];
  }

  // Calcula el porcentaje de consumo respecto a un máximo de 40,000 litros
  calcularPorcentaje(consumo: number): number {
    const maxLitros = 40000;
    const porcentaje = (consumo / maxLitros) * 100;
    return Math.min(Math.max(porcentaje, 2), 100); // Limita el rango de 2% a 100%
  }

  // Determina el color basado en el porcentaje de consumo
  obtenerColor(consumo: number): string {
    const porcentaje = (consumo / 40000) * 100;
    if (porcentaje < 33) return '#003a80'; // Azul (bajo consumo)
    if (porcentaje < 66) return 'yellow';  // Amarillo (consumo medio)
    return 'red';                          // Rojo (alto consumo)
  }
}