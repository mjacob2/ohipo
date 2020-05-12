import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpOfertyService {
  constructor(private http: HttpClient) { }

  pobierzOferty() {
    return this.http.get('https://ohipo.pl/oferty/oferty.json')
  }


}






