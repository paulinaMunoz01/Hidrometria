import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  public postRegistro(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData).pipe(
      catchError(error => {
        if (error.status === 409) {
          throw { message: 'El usuario ya existe' };
        }
        if (error.status === 400) {
          throw { message: 'Faltan campos obligatorios' };
        }
        throw { message: 'Error en el servidor' };
      })
    );
  }

  public loginUser(data: { usuario: string, pass: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  public recibirFlujo(flujo: number, litros: number): Observable<any> {
    const data = { flujo: flujo, litros: litros };
    return this.http.post(`${this.apiUrl}/flujo`, data);
  }

  public getFlujoAgua(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/flujo-agua`);
  }

  public postReporte(reporteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/incidencias`, reporteData);
  }

  public getIncidenciasAdmin(): Observable<any> {
    const url = `${this.apiUrl}/api/getIncidenciasAdmin`;
    console.log('URL de incidencias admin:', url);
    return this.http.get(url);
  }

  public getIncidenciasPorUsuario(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getIncidencias/${id}`);
  }

  public updateIncidencia(idIncidencia: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/updateIncidencia/${idIncidencia}`, {});
  }

  public deleteIncidencia(idIncidencia: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/incidencias/${idIncidencia}`);
  }

  public getUserComplete(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user/complete/${id}`);
  }
}