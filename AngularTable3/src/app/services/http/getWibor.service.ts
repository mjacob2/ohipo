import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IWibor } from '../../IWibor';
import { Wibor } from 'src/app/wibor';


@Injectable({
  providedIn: 'root',
})
export class wiborService {
  constructor(
    private http: HttpClient) { }

  getWibor() {
    return this.http.get('https://ohipo.pl/assets/wiborObjects.json');
  }
}
