import { Component, inject } from '@angular/core';
import {
  faSun,
  faCloud,
  faCloudRain,
  faBolt,
  faSnowflake,
} from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from './service/weather.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, FontAwesomeModule, CommonModule],
  styles: ``,
  template: `
  <div class="container">
    <h1>Weather Forecast</h1>
    <input [(ngModel)]="zipCode" placeholder="Enter ZIP code" />
    <button mat-button color="primary" (click)="fetchWeather()">
      Get Forecast
    </button>

    <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

    <div *ngIf="weatherData">
      <h2>5-Day Forecast</h2>
      <div class="forecast-container">
        <mat-card
          *ngFor="let period of weatherData.properties.periods"
          class="forecast-card"
        >
          <mat-card-header>
            <mat-card-title>{{ period.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <fa-icon [icon]="getWeatherIcon(period.shortForecast)"></fa-icon>
            <p><strong>Temp:</strong> {{ period.temperature }}°F</p>
            <p><strong>Condition:</strong> {{ period.shortForecast }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  </div>
`
})
export class AppComponent {
  zipCode: string = '';
  weatherData: any;
  errorMessage: string = '';

  weatherService = inject(WeatherService);

  constructor() {}

  fetchWeather() {
    this.weatherService.getCoordinates(this.zipCode).subscribe(
      (geoData) => {
        if (geoData.length > 0) {
          const { lat, lon } = geoData[0];
          this.weatherService.getWeather(lat, lon).subscribe(
            (weatherResponse) => {
              const { properties } = weatherResponse;
              this.weatherService.getForecast(properties.forecast).subscribe(
                (forecastData) => (this.weatherData = forecastData),
                (error) => (this.errorMessage = 'Error fetching forecast data')
              );
            },
            (error) => (this.errorMessage = 'Error fetching weather data')
          );
        } else {
          this.errorMessage = 'Invalid ZIP code';
        }
      },
      (error) => (this.errorMessage = 'Error fetching coordinates')
    );
  }

  getWeatherIcon(condition: string) {
    if (condition.toLowerCase().includes('sunny')) return faSun;
    if (condition.toLowerCase().includes('cloud')) return faCloud;
    if (condition.toLowerCase().includes('rain')) return faCloudRain;
    if (
      condition.toLowerCase().includes('storm') ||
      condition.toLowerCase().includes('thunder')
    )
      return faBolt;
    if (condition.toLowerCase().includes('snow')) return faSnowflake;
    return faCloud;
  }
}
