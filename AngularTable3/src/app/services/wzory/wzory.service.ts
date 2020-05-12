import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WzoryService {


  /** odsetki zapłacone w całym okresie
 * 
 * I = cN - P 
 * 
 * I = suma odsetek
 * c = rata
 * N = liczba rat
 * P = kwota kredytu
 */
  static odsetkiZaplaconeWcalymOkresie(rata: number, liczbaLat: number, kwotaKredytu: number) {
    return (rata * (liczbaLat * 12)) - kwotaKredytu
  }




  /** odsetki płatne na koniec N okresu
   * 
   *          ((1 + r)^N - 1)
   * (Pr - c) _____________  + cN
   *                r
   * 
   * P = kwota kredytu
   * r = oprocentowanie
   * c = rata
   * N = liczba rat
   * 
   * */

  static odsetkiZaplaconeNaKoniecNokresu(rata: number, liczbaLat: number, kwotaKredytu: number, r: number) {
    r = r / 1200
    return (((kwotaKredytu * r - rata) * ((((1 + r) ** (liczbaLat * 12)) - 1) / r)) + (rata * liczbaLat * 12))

  }


  // let rataPotem = (element.kwotaKredytuOferty * ((1 + (((+element.WIBORstawka + +element.oprocStaleMarzaPotem) / 100) / 12)) ** (+this.mLiczbaLat * 12)) * ((1 + (((+element.WIBORstawka + +element.oprocStaleMarzaPotem) / 100) / 12)) - 1) / ((1 + (((+element.WIBORstawka + +element.oprocStaleMarzaPotem) / 100) / 12)) ** (+this.mLiczbaLat * 12) - 1));


  /** RATA STAŁA
   * 
   * c = (r / (1 - (1 + r) ^-N)) P
   * 
   * P = kwota kredytu
   * r = oprocentowanie
   * N - liczba rat
   */

  static rata(kwotaKredytu: number, r: number, liczbaLat: number) {
    r = r / 1200
    return (r / (1 - (1 + r) ** (-1 * (liczbaLat * 12)))) * kwotaKredytu
  }



  constructor() { }


  //Weź dzisiejszą datę dla DO-kiedyobowiazuje
  //   var d = new Date();
  //   var curr_date = d.getDate();
  //    var curr_month = d.getMonth();
  //    var curr_year = d.getFullYear()
  //    var months = new Array("01", "02", "03",
  //     "04", "05", "06", "07", "08", "09",
  //     "10", "11", "12");




  // Pokaż element data od kiedy obowiązuje w polu Data Dostepu
  //   var d = mElementOdKiedyObowiazuje;
  //   var curr_date = d.getDate();
  //   var curr_month = d.getMonth();
  //   var curr_year = d.getFullYear()
  //   var months = new Array("01", "02", "03",
  //     "04", "05", "06", "07", "08", "09",
  //     "10", "11", "12");
  //   var mDataDostepu = curr_date + "." + months[curr_month] + "." + curr_year


  /** To jest filtr wyszukiwania - narazie z niego REZYGNACJA 
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      
    }   
      
    applyFilter2(column: string, filterValue: string) {
      this.filterValues[column] = filterValue;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    }    
    */











}





