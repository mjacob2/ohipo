import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class wiborObjectService {
  constructor(private http: HttpClient) {}

  getWibor() {
    return this.http.get("https://middlers.pl/ohipo/assets/wiborObjects.json");
  }
}
