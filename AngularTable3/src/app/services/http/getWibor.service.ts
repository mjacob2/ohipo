import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class WiborService {
  constructor(private http: HttpClient) {}

  getWibor() {
    return this.http.get("https://middlers.pl/ohipo/assets/wibor.json");
  }
}
