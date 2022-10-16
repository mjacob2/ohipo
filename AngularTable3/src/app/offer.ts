export class Offer {
    id: number;
    bank: string;
    ofertaNazwa: string;
    ofertaNazwaDopisek: string;
    marza: number;
    pomostoweStawkaMiesieczna: number;
    ubezpNieruchStawkaRok: number;
    ubezpZycieStawkaMiesieczna: number;
    ubezpZycieSuma: number;
    wTrakcieBudowy: string;
    WIBOR: string;
    WIBORstawka: number;
    prowizjaStawka: number;
    warunkiOferty: string;
    wycenaMieszkanie: number;
    ubezpZycieTOTAL: number;
    maxLTV: number;
    minLTV: number;
    ubezpZycieIleLat: number;
    ubezpNieruchOdCzegoLicz: string;
    pomostoweJakLiczone: string;
    oprocStale: string;
    oprocStaleIleLat: number;
    oprocStaleMarzaPotem: number;
    doKiedyObowiazuje: any;
    odKiedyObowiazuje: string;
    maxLTVsave: string;
    minLTVsave: string;
    ubezZycieNaStart: number;
    ubezZycieNaStartSuma: number;
    ubezpZycieOdKtoregoMiesiaca: number;
    upezpPracaNaStart: number;
    upezpPracaNaStartSuma: number;
    minKwotaKredytu: number;
    minKwotaKredytuFILTR: string;
    maxKwotaKredytu: number;
    maxKwotaKredytuFILTR: string;
    doKiedyObowiazujeStatus: string;
    minimalneWpływy: number;
    minimalneWplywyStatus: string;
    minimalneWpływy2xRata: string;
    logoURL: string;
    oplatyZawszeKredytowane: number;
    maxLiczbaLat: number;
    maxWiek: number;
    maxWiekStatus: string;
    alternatywnyOpisOferty: string;
    kosztyPoczatkowe: number;
    kwotaKredytuOferty: number;
    LTVobliczone: number;
    pomostoweTOTAL: number;
    kosztyCalkowite: number;
    oplatyMiesieczne: number;
    odsetkiSuma: number;
    ubezpNieruchSuma: number;
    ubezpNieruchTOTAL: number;
    prowizjaSuma: number;
    pomostoweSuma: number;
    rata: number;



    writeId() {
        console.log("************");
        console.log(this.id);
    }
}