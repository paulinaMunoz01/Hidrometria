import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = "https://hidrometriaapi.onrender.com";

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getUsers`);
  }

  public getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getUser/${id}`);
  }

  public postUser(user: { usuario: string; pass: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/postUser`, user);
  }

  public postRegistro(user: { usuario: string; name: string; pass: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, user);
  }

  public getPropietarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getPropietarios`);
  }

  public loginUser(user: { usuario: string; pass: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

   public abrirValvula(tiempo: number): Observable<any> {
    const data = { tiempo: tiempo };
    return this.http.post(`${this.apiUrl}/abrir`, data);
  }

  public cerrarValvula(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cerrar`);
  }

  public recibirFlujo(flujo: number, litros: number): Observable<any> {
    const data = { flujo: flujo, litros: litros };
    return this.http.post(`${this.apiUrl}/flujo`, data);
  }

  public verificarConexionESP32(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ping`);
  }

  public getFlujoAgua(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/flujo-agua`);
  }

  public postReporte(reportData: { tipo: string; descripcion: string; ubicacion: string; resuelto: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/incidencias`, reportData);
  }
  
}