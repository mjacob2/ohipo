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

  wibors: Wibor[] = [];

  // getWiborObjects() {

  //   var listaObiektowJSON = this.http.get('https://ohipo.pl/assets/wiborObjects.json');
  //   listaObiektowJSON.forEach(element => {
  //     var el = new Wibor(element['name'], element['value'])
  //     this.wibors.push(el);


  //   });

  //   return this.wibors;

  // }




}
