import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private geoApiUrl = 'https://nominatim.openstreetmap.org/search';
  private weatherApiUrl = 'https://api.weather.gov';
  
  constructor(private http: HttpClient) {}

  getCoordinates(zip: string): Observable<any> {
    return this.http.get<any>(`${this.geoApiUrl}?q=${zip},USA&format=json`);
  }

  getWeather(latitude: number, longitude: number): Observable<any> {
    return this.http.get<any>(`${this.weatherApiUrl}/points/${latitude},${longitude}`);
  }

  getForecast(forecastUrl: string): Observable<any> {
    return this.http.get<any>(forecastUrl);
  }
}