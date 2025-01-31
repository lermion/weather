import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { IWeather } from '../interfaces/weather.interface';
import { environment } from '../../environments/environment';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeatherService]
    });

    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  it('should fetch weather data for a city', () => {
    const mockWeatherData: IWeather = {
      base: 'stations',
      clouds: { all: 20 },
      cod: 200,
      coord: { lat: 49.84, lon: 24.03 },
      dt: 1700000000,
      id: 702550,
      main: {
        feels_like: 18,
        grnd_level: 1005,
        humidity: 55,
        pressure: 1012,
        sea_level: 1015,
        temp: 19,
        temp_max: 21,
        temp_min: 17
      },
      name: 'Lviv',
      sys: {
        country: 'UA',
        sunrise: 1700025000,
        sunset: 1700065000
      },
      timezone: 7200,
      visibility: 10000,
      weather: [{ description: 'Cloudy', icon: '02d', id: 801, main: 'Clouds' }],
      wind: { deg: 150, gust: 4, speed: 2 }
    };

    service.search('Lviv').subscribe((data: IWeather): void => {
      expect(data).toEqual(mockWeatherData);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}?q=Lviv&appid=${environment.apiKey}&units=metric`);
    expect(req.request.method).toBe('GET');
    req.flush(mockWeatherData);
  });

  it('should handle errors correctly', () => {
    const mockErrorMessage = 'City not found';

    service.search('UnknownCity').subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.error.message).toBe(mockErrorMessage);
      }
    });

    const req: TestRequest = httpMock.expectOne(`${service['apiUrl']}?q=UnknownCity&appid=${environment.apiKey}&units=metric`);
    req.flush({ message: mockErrorMessage }, { status: 404, statusText: 'Not Found' });
  });
});
