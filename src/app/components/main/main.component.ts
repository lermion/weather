import { Component, ViewEncapsulation } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, Observable, of, switchMap, takeUntil } from 'rxjs';
import { SubscriptionHandler } from '../../subscription-handler';
import { WeatherService } from '../../services/weather.service';
import { IWeather } from '../../interfaces/weather.interface';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  imports: [
    CommonModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatError,
    MatButton,
    MatIconButton
  ],
  styleUrl: './main.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainComponent extends SubscriptionHandler {
  public cityName: FormControl<string | null> = new FormControl('', Validators.required);
  public weather: IWeather | undefined;
  public cities: string[] = [];
  private cache: Map<string, {data: IWeather; timestamp: number}> =
    new Map<string, { data: IWeather, timestamp: number }>();
  private cacheDuration: number = 3600000;
  constructor(
    private readonly weatherService: WeatherService
  ) {
    super();
    this.cities = this.weatherService.getCities();
    this.cityName.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.ngUnsubscribe),
      distinctUntilChanged(),
      switchMap((query: string | null) => this.getWeather(query || ''))
    ).subscribe((data: IWeather) => this.weather = data);
  }

  private getWeather(city: string): Observable<IWeather> {
    const cachedData: {data: IWeather; timestamp: number} | undefined = this.cache.get(city);
    const now: number = Date.now();
    if (cachedData && now - cachedData.timestamp < this.cacheDuration) {
      return of(cachedData.data);
    }
    return this.weatherService.search(city).pipe(
      catchError(error => {
        this.cityName.setErrors({message: error.error.message});
        this.weather = undefined;
        return EMPTY;
      }),
      switchMap((data: IWeather) => {
        this.cache.set(city, {data, timestamp: now});
        return of(data);
      })
    );
  }

  public addCity(): void {
    if (this.weather?.name) {
      this.weatherService.addCity(this.weather.name);
      this.cities = this.weatherService.getCities();
    }
  }

  public removeCity(city: string): void {
    this.weatherService.removeCity(city);
    this.cities = this.weatherService.getCities();
  }

  public loadWeatherForCity(city: string): void {
    this.cityName.setValue(city);
  }
}
