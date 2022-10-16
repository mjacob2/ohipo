import { HttpClient } from '@angular/common/http';
import { Injectable, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IOffer } from 'src/app/ioffer';
import { Offer } from 'src/app/offer';

@Injectable()
export class OffersService {
  myData: any;

  constructor(private http: HttpClient) { }

  getOffers() {
    let response = this.http.get('https://ohipo.pl/assets/oferty.json');
    console.log(response);

    return response;
  }

  // getOffers2(): Observable<Offer> {
  //   return this.http.get<IOffer>('https://ohipo.pl/assets/oferty.json').pipe(map(contract => new Offer()));

  // }

  // getOffers3() {
  //   let res = this.http.get('https://ohipo.pl/assets/oferty.json');

  //   this.myData = res.pipe(map((o: any) => Object.assign(new Offer(), o)));
  //   if (this.myData.length > 0) {
  //     this.myData.forEach(x => x.createString());
  //   }
  //   return this.myData;
  // }

  // getOffers4() {
  //   let zneta = this.http.get('https://ohipo.pl/assets/oferty.json');

  //   var beta = zneta.forEach((offer: Offer) => {
  //     offer = Object.assign(new Offer(), offer);
  //     console.log(offer);
  //     console.log(offer.getName());
  //   });

  //   return beta;

  // }
}





