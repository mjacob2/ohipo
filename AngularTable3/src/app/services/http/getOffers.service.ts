import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OffersService {
  constructor(private http: HttpClient) { }

  getOffers() {
    return this.http.get('https://ohipo.pl/assets/oferty.json');
  }
}





