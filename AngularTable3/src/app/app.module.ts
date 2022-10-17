import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent, DialogKontakt, DialogBlad } from './app.component';
import { CookiesComponent } from './cookies/cookies.component';
import { OffersService } from './services/http/getOffers.service';
import { WiborService } from './services/http/getWibor.service';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

registerLocaleData(localeFr, 'fr');

@NgModule({

  declarations: [
    AppComponent,
    DialogKontakt,
    DialogBlad,
    CookiesComponent,
    NavigationBarComponent,
  ],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    MatTableModule,
    BrowserModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    ScrollingModule,
    MatPaginatorModule,
    RouterModule,
    MatSlideToggleModule,
    FlexLayoutModule,
    MatIconModule,
    HttpClientModule,
    MatDialogModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDividerModule,
    MatSliderModule,
    MatButtonToggleModule,
    CommonModule,
    MatListModule,
    AppRoutingModule
  ],

  providers: [CurrencyPipe, OffersService, WiborService],
  bootstrap: [AppComponent]
})
export class AppModule { }
