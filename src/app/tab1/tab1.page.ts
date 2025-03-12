import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service'; // Importar el servicio
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItemDivider, IonLabel, IonAccordionGroup, IonAccordion, IonItem } from '@ionic/angular/standalone';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CommonModule, GoogleChartsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItemDivider, IonLabel, IonAccordionGroup, IonAccordion, IonItem],
})
export class Tab1Page implements OnInit {
  totalConsumo = 0; // Litros en el mes
  promedioDiario = 0; // Promedio de litros al día
  diasCriticos = 0; // Días con consumo alto

  // Datos para las gráficas
  chartType: ChartType = ChartType.PieChart;
  chartColumns = ['Día', 'Litros'];
  chartData: any[] = [];

  comparisonChartType: ChartType = ChartType.ColumnChart;
  comparisonChartColumns = ['Mes', 'Litros Consumidos'];
  comparisonChartData: any[] = [];

  radarChartType: ChartType = ChartType.LineChart;
  radarChartColumns = ['Día', 'Consumo Real (L)', 'Consumo Promedio (L)'];
  radarChartData: any[] = [];

  historialMensual: any[] = [];

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.usersService.getFlujoAgua().subscribe((data: any) => {
      const flujoAgua = data.Respuesta; // Datos de la API

      // Calcular total de consumo
      this.totalConsumo = flujoAgua.reduce((sum: number, flujo: any) => sum + flujo.litros, 0);

      // Calcular promedio diario
      this.promedioDiario = this.totalConsumo / 30; // Suponiendo 30 días

      // Calcular días críticos (ejemplo: días con más de 50 litros)
      this.diasCriticos = flujoAgua.filter((flujo: any) => flujo.litros > 50).length;

      // Actualizar gráfica de consumo diario
      this.chartData = flujoAgua.map((flujo: any) => [flujo.fecha, flujo.litros]);

      // Actualizar gráfica de comparativa mensual (agrupando por mes)
      const consumoMensual = this.agruparPorMes(flujoAgua);
      this.comparisonChartData = consumoMensual.map((mes: any) => [mes.mes, mes.total_litros]);

      // Actualizar gráfica de radar (consumo diario vs. promedio)
      this.radarChartData = flujoAgua.map((flujo: any) => [flujo.fecha, flujo.litros, this.promedioDiario]);

      // Actualizar historial de consumo
      this.historialMensual = this.agruparHistorialPorMes(flujoAgua);
    });
  }

  // Función para agrupar datos por mes
  agruparPorMes(flujoAgua: any[]): any[] {
    const meses: { [key: string]: number } = {};
    flujoAgua.forEach((flujo: any) => {
      const mes = flujo.fecha.split('-')[1]; // Suponiendo formato de fecha YYYY-MM-DD
      if (!meses[mes]) {
        meses[mes] = 0;
      }
      meses[mes] += flujo.litros;
    });
    return Object.keys(meses).map((mes) => ({ mes, total_litros: meses[mes] }));
  }

  // Función para agrupar historial por mes
  agruparHistorialPorMes(flujoAgua: any[]): any[] {
    const historial: { [key: string]: any } = {};
    flujoAgua.forEach((flujo: any) => {
      const mes = flujo.fecha.split('-')[1]; // Suponiendo formato de fecha YYYY-MM-DD
      if (!historial[mes]) {
        historial[mes] = {
          mes: `Mes ${mes}`,
          consumo: [],
          abierto: false
        };
      }
      historial[mes].consumo.push(`Día ${flujo.fecha.split('-')[2]}: ${flujo.litros}L`);
    });
    return Object.values(historial);
  }

  toggleHistorial(mes: any) {
    mes.abierto = !mes.abierto;
  }
}