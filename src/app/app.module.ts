import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { SigninComponent } from './signin/signin.component';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { SearchResultComponent } from './search-result/search-result.component';
import { ResultComponent } from './search-result/result/result.component';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { PredictionComponent } from './prediction/prediction.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonToggleModule } from "@angular/material/button-toggle";

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SearchResultComponent,
    ResultComponent,
    PredictionComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        NgxEchartsModule.forRoot({
            echarts: () => import('echarts')
        }),
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatIconModule,
        MatCardModule,
        MatAutocompleteModule,
        MatSidenavModule,
        MatTableModule,
        FormsModule,
        MatDialogModule,
        MatDividerModule,
        NgbModule,
        MatButtonToggleModule,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
