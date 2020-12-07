import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WiborService {
  constructor(private http: HttpClient) { }

  downloadWIBOR() {
    return this.http.get('https://ohipo.pl/assets/wibor.json');
  }
}
