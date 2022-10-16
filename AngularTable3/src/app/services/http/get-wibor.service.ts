import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IWibor } from '../../IWibor';

@Injectable({
  providedIn: 'root',
})
export class wiborObjectService {
  constructor(
    private http: HttpClient) { }

  getWibor() {
    return this.http.get('https://ohipo.pl/assets/wiborObjects.json');
  }
}