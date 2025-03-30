import { Component, inject } from '@angular/core';
import {
  faSun,
  faCloud,
  faCloudRain,
  faBolt,
  faSnowflake,
  faArrowLeft,
  faArrowRight,
  faCloudMoonRain,
  faCloudMoon,
  faMoon
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
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    FontAwesomeModule,
    CommonModule,
  ],
  styles: `
.container {
  text-align: center;
  font-family: 'Arial', sans-serif;
  color: #333;
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.forecast-carousel {
  display: flex;
  overflow: hidden;
  width: 70%;
}

.forecast-wrapper {
  display: flex;
  gap: 15px;
  transition: transform 0.3s ease-in-out;
}

.forecast-card {
  width: 250px;
  height: 300px;
  flex: 0 0 auto;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  background-color: #007BFF;
  color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
  font-weight: bold;
}

.card-content {
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.weather-icon {
  font-size: 2rem;
  margin: 10px 0;
}


  `,
  template: `
    <div class="container">
      <h1>Weather Forecast</h1>
      <input [(ngModel)]="zipCode" placeholder="Enter ZIP code" />
      <button mat-button color="primary" (click)="fetchWeather()">
        Get Forecast
      </button>

      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

      <div *ngIf="weatherData">
        <h2>5-Day Forecast for: {{ city }}, {{ state }}</h2>
        <div class="carousel-container">
          <button
            mat-icon-button
            (click)="prevSlide()"
            [disabled]="currentIndex === 0"
          >
            <fa-icon [icon]="arrowLeftDef"></fa-icon>
          </button>
          <div class="forecast-carousel">
            <div class="forecast-wrapper">
              <mat-card
                *ngFor="let period of visibleForecasts"
                class="forecast-card"
              >
                <mat-card-header class="card-header">
                  <mat-card-title>{{ period.name }}</mat-card-title>
                </mat-card-header>
                <mat-card-content class="card-content">
                  <fa-icon
                    [icon]="getWeatherIcon(period.shortForecast, period.name)"
                    [ngStyle]="{ color: getWeatherColor(period.shortForecast) }"
                    class="weather-icon"
                  ></fa-icon>
                  <p><strong>Temp:</strong> {{ period.temperature }}°F</p>
                  <p><strong>Condition:</strong> {{ period.shortForecast }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
          <button
            mat-icon-button
            (click)="nextSlide()"
            [disabled]="
              currentIndex + 3 >= weatherData.properties.periods.length
            "
          >
            <fa-icon [icon]="arrowRightDef"></fa-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AppComponent {
  zipCode: string = '';
  weatherData: any;
  city: string = '';
  state: string = '';
  errorMessage: string = '';
  currentIndex: number = 0;

  arrowLeftDef = faArrowLeft;
  arrowRightDef = faArrowRight;

  constructor(private weatherService: WeatherService) {}

  fetchWeather() {
    this.weatherService.getCoordinates(this.zipCode).subscribe(
      (geoData) => {
        if (geoData.length > 0) {
          const { lat, lon, display_name } = geoData[0];
          const parts = display_name.split(',').map((part: any) => part.trim());
          this.city = parts[1] || '';
          this.state = parts[3] || '';
          this.weatherService.getWeather(lat, lon).subscribe(
            (weatherResponse) => {
              const { properties } = weatherResponse;
              this.weatherService.getForecast(properties.forecast).subscribe(
                (forecastData) => {
                  this.weatherData = forecastData;
                  this.currentIndex = 0;
                },
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

  get visibleForecasts() {
    return this.weatherData
      ? this.weatherData.properties.periods.slice(
          this.currentIndex,
          this.currentIndex + 3
        )
      : [];
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
    }
  }

  nextSlide() {
    if (this.currentIndex + 3 < this.weatherData.properties.periods.length) {
      this.currentIndex += 1;
    }
  }

  getWeatherColor(condition: string) {
    if (
      condition.toLowerCase().includes('sunny') ||
      condition.toLowerCase().includes('clear')
    )
      return '#f2ce16';
    if (condition.toLowerCase().includes('cloud')) return '#676789';
    if (
      condition.toLowerCase().includes('storm') ||
      condition.toLowerCase().includes('thunder') ||
      condition.toLowerCase().includes('rain')
    )
      return '#007BFF';
    if (condition.toLowerCase().includes('snow')) return '#87d4e7';
    return '#007BFF';
  }

  getWeatherIcon(condition: string, name: string) {
    if (name.toLowerCase().includes('night')) {
      if (
        condition.toLowerCase().includes('clear')
      )
        return faMoon;
      if (condition.toLowerCase().includes('cloud')) return faCloudMoon;
      if (condition.toLowerCase().includes('rain')) return faCloudMoonRain;
      if (
        condition.toLowerCase().includes('storm') ||
        condition.toLowerCase().includes('thunder')
      )
        return faBolt;
      if (condition.toLowerCase().includes('snow')) return faSnowflake;
      return faCloud;
    } else {
      if (
        condition.toLowerCase().includes('sunny') ||
        condition.toLowerCase().includes('clear')
      )
        return faSun;
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
}
