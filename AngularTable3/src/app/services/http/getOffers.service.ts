import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class OffersService {
  constructor(private http: HttpClient) {}

  getOffers(): Observable<Object> {
    return this.http.get("https://middlers.pl/ohipo/assets/oferty.json");
  }
}
