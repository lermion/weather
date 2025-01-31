import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { WeatherService } from '../../services/weather.service';
import { of } from 'rxjs';
import { IWeather } from '../../interfaces/weather.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

describe('MainComponent', (): void => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let weatherService: jasmine.SpyObj<WeatherService>;

  const mockWeatherData: IWeather = {
    base: 'stations',
    clouds: { all: 75 },
    cod: 200,
    coord: { lat: 50.45, lon: 30.52 },
    dt: 1700000000,
    id: 703448,
    main: {
      feels_like: 22,
      grnd_level: 1010,
      humidity: 60,
      pressure: 1015,
      sea_level: 1020,
      temp: 24,
      temp_max: 25,
      temp_min: 22
    },
    name: 'Kyiv',
    sys: {
      country: 'UA',
      sunrise: 1700020000,
      sunset: 1700060000
    },
    timezone: 7200,
    visibility: 10000,
    weather: [{ description: 'Sunny', icon: '01d', id: 800, main: 'Clear' }],
    wind: { deg: 180, gust: 5, speed: 3 }
  };

  beforeEach(async (): Promise<void> => {
    const weatherServiceSpy = jasmine.createSpyObj('WeatherService', ['search', 'getCities']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: WeatherService, useValue: weatherServiceSpy },
        provideHttpClient(withFetch())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update weather data when a valid city is entered', fakeAsync((): void => {
    weatherService.search.and.returnValue(of(mockWeatherData));
    component.cityName.setValue('Kyiv');
    tick(500);
    fixture.detectChanges();
    expect(weatherService.search).toHaveBeenCalledWith('Kyiv');
    expect(component.weather).toEqual(mockWeatherData);
  }));
});
