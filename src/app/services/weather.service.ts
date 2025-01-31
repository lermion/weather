import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IWeather } from '../interfaces/weather.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  private apiUrl: string = 'https://api.openweathermap.org/data/2.5/weather';
  private apiKey: string = environment.apiKey;

  search(query: string): Observable<IWeather> {
    const params: HttpParams = new HttpParams()
      .set('q', query)
      .set('appid', this.apiKey)
      .set('units', 'metric');

    return this.http.get<IWeather>(this.apiUrl, { params });
  }

  getCities(): string[] {
    return JSON.parse(localStorage.getItem('cities') || '[]');
  }

  addCity(city: string): void {
    const favorites: string[] = this.getCities();
    if (!favorites.includes(city)) {
      favorites.push(city);
      localStorage.setItem('cities', JSON.stringify(favorites));
    }
  }

  removeCity(city: string): void {
    const favorites: string[] = this.getCities().filter((fav: string): boolean => fav !== city);
    localStorage.setItem('cities', JSON.stringify(favorites));
  }
}
