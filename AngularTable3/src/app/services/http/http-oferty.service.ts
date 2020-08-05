import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get('https://ohipo.pl/assets/oferty.json');
  }
}





