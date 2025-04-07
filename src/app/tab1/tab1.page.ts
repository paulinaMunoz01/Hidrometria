// Importaciones básicas de Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de componentes Ionic
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonList, IonItemDivider, 
  IonLabel, IonAccordionGroup, IonAccordion, IonItem, 
  IonNote, IonBadge, IonButtons, IonButton, IonIcon,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';

// Importaciones para gráficas y servicios
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-tab1', // Selector del componente
  templateUrl: 'tab1.page.html', // Plantilla asociada
  styleUrls: ['tab1.page.scss'], // Estilos asociados
  standalone: true, // Componente autónomo (Angular 15+)
  imports: [ // Módulos y componentes necesarios
    CommonModule, 
    GoogleChartsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonList, IonItemDivider, 
    IonLabel, IonAccordionGroup, IonAccordion, IonItem,
    IonNote, IonBadge, IonButtons, IonButton, IonIcon,
    IonRefresher, IonRefresherContent
  ],
})
export class Tab1Page implements OnInit {
  // Variables para métricas principales
  totalConsumo = 0; // Litros totales consumidos
  promedioDiario = 0; // Promedio diario de consumo
  diasCriticos = 0; // Días con consumo alto

  // Configuración para gráfica de pastel
  chartType: ChartType = ChartType.PieChart;
  chartColumns = ['Mes', 'Litros'];
  chartData: any[] = [];

  // Configuración para gráfica de barras
  comparisonChartType: ChartType = ChartType.ColumnChart;
  comparisonChartColumns = ['Mes', 'Litros Consumidos'];
  comparisonChartData: any[] = [];

  // Configuración para gráfica de línea
  radarChartType: ChartType = ChartType.LineChart;
  radarChartColumns = ['Día', 'Consumo Real (L)', 'Consumo Promedio (L)'];
  radarChartData: any[] = [];

  // Historial de consumo organizado por meses
  historialMensual: any[] = [];

  // Nombres de los meses para mostrar
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(private usersService: UsersService) {}

  /**
   * Método del ciclo de vida: se ejecuta al inicializar el componente
   */
  ngOnInit() {
    this.loadWaterData(); // Cargar datos al iniciar
  }

  /**
   * Maneja el evento de refresh (tanto del botón como del pull-to-refresh)
   * @param event Evento opcional del refresher
   */
  async handleRefresh(event?: any) {
    try {
      await this.loadWaterData(); // Recargar los datos
      
      // Si el evento viene del refresher, lo completamos
      if (event) {
        event.target.complete(); // Finalizar animación de refresh
      }
    } catch (error) {
      console.error('Error al refrescar datos:', error);
      if (event) {
        event.target.complete(); // Asegurar que se complete incluso con error
      }
    }
  }

  /**
   * Carga los datos de consumo de agua desde el servicio
   */
  async loadWaterData() {
    try {
      // Obtener datos del servicio
      const response = await this.usersService.getFlujoAgua().toPromise();
      const flujoAgua = response?.Respuesta || [];
      
      // Procesar los datos recibidos
      this.processWaterData(flujoAgua);
    } catch (error) {
      console.error('Error loading water data:', error);
      throw error; // Relanzar el error para manejarlo en handleRefresh
    }
  }

  /**
   * Procesa los datos de consumo y actualiza las propiedades del componente
   * @param flujoAgua Array con los datos de consumo
   */
  processWaterData(flujoAgua: any[]) {
    // Calcular el total consumido sumando todos los litros
    this.totalConsumo = flujoAgua.reduce((sum, flujo) => sum + flujo.litros, 0);
    
    // Calcular días únicos para el promedio diario
    const diasUnicos = new Set(flujoAgua.map(f => f.fecha.split(' ')[0])).size;
    this.promedioDiario = diasUnicos > 0 ? this.totalConsumo / diasUnicos : 0;
    
    // Contar días con consumo mayor a 50L como "críticos"
    this.diasCriticos = flujoAgua.filter(f => f.litros > 50).length;

    // Preparar datos para gráficas
    const consumoMensual = this.agruparPorMes(flujoAgua);
    this.chartData = consumoMensual.map(mes => [mes.mes, mes.total_litros]);
    this.comparisonChartData = [...this.chartData];
    
    // Preparar datos para gráfica de últimos 7 días vs promedio
    this.radarChartData = flujoAgua.slice(0, 7).map(flujo => [
      flujo.fecha.split('-')[2], // Día del mes
      flujo.litros, // Consumo real
      this.promedioDiario // Consumo promedio
    ]);

    // Generar historial detallado por mes
    this.historialMensual = this.agruparHistorialPorMes(flujoAgua);
  }

  /**
   * Agrupa los datos de consumo por mes para las gráficas
   * @param flujoAgua Array con los datos de consumo
   * @returns Array de objetos agrupados por mes
   */
  agruparPorMes(flujoAgua: any[]): any[] {
    const meses: { [key: string]: any } = {};

    flujoAgua.forEach(flujo => {
      const [fullDate] = flujo.fecha.split(' ');
      const [year, monthNum] = fullDate.split('-');
      const key = `${year}-${monthNum}`;
      
      if (!meses[key]) {
        meses[key] = {
          year,
          monthNum,
          mes: `${this.monthNames[parseInt(monthNum)-1]} ${year}`,
          total_litros: 0
        };
      }
      meses[key].total_litros += flujo.litros;
    });

    // Ordenar cronológicamente
    return Object.values(meses).sort((a, b) => 
      `${a.year}-${a.monthNum}`.localeCompare(`${b.year}-${b.monthNum}`)
    );
  }

  /**
   * Organiza el historial detallado por mes y día
   * @param flujoAgua Array con los datos de consumo
   * @returns Array de objetos con historial por mes
   */
  agruparHistorialPorMes(flujoAgua: any[]): any[] {
    const historial: { [key: string]: any } = {};

    flujoAgua.forEach(flujo => {
      const [fullDate] = flujo.fecha.split(' ');
      const [year, monthNum, day] = fullDate.split('-');
      const key = `${year}-${monthNum}`;
      
      if (!historial[key]) {
        historial[key] = {
          mes: `${this.monthNames[parseInt(monthNum)-1]} ${year}`,
          year,
          monthNum,
          consumo: [],
          total_litros: 0,
          abierto: false
        };
      }
      
      historial[key].consumo.push({
        fecha: fullDate,
        dia: day,
        litros: flujo.litros,
        texto: `Día ${day}: ${flujo.litros}L`
      });
      historial[key].total_litros += flujo.litros;
    });

    // Ordenar de más reciente a más antiguo
    return Object.values(historial).sort((a, b) => 
      `${b.year}-${b.monthNum}`.localeCompare(`${a.year}-${a.monthNum}`)
    );
  }

  /**
   * Obtiene el nombre del día a partir de una fecha YYYY-MM-DD
   * @param fecha String con formato YYYY-MM-DD
   * @returns Nombre abreviado del día (Dom, Lun, Mar, etc.)
   */
  getDiaNombre(fecha: string): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const [year, month, day] = fecha.split('-');
    const date = new Date(parseInt(year), parseInt(month)-1, parseInt(day));
    return dias[date.getDay()];
  }
}