import { Component, OnInit } from '@angular/core';
import { AdalService } from 'adal-angular4';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  salutatio: string;
  userinfo: adal.User;
  cacheduser: any;
  cachedtoken: string;

  constructor(private adalService: AdalService, protected http: HttpClient) { }

  ngOnInit() {
    this.setSalutatio();
    this.setUserInfo();
    this.setCachedUser();
    this.setCachedToken();    
  }

  public setSalutatio() {
    this.getSalutatio(this.getCachedToken())
      .subscribe({
        next: result => {
          this.salutatio = result as string;
        }
      });
  }

  public setUserInfo() {
    this.userinfo = this.getUserInfo();
  }

  public setCachedUser() {
    this.getCachedUser().subscribe({
      next: result => {
        this.cacheduser = result;
      }
    });
  }

  public setCachedToken() {    
    this.cachedtoken = this.getCachedToken();
  }

  public getSalutatio(token: string): Observable<Object> {
    // Content-Type op 'application/json' zetten indien JSON wordt verwacht!!
    const headers = new HttpHeaders()
      .set('Content-Type', 'text/plain')
      .set('Authorization', 'Bearer ' + token);

    // responseType: 'json' (default) indien JSON waarde wordt verwacht,
    // en anders responseType: 'text' gebruiken, want anders gaat Angular 'onder water' de waarde proberen te parsen naar JSON,
    // wat dus mislukt, waarna er een (gegenereerde?) vendor.js bestand wordt geprobeerd te openen,
    // zodat uiteindelijk in de console een (zeer misleidende) CORS error wordt getoond!!
    // De catchError(..) zorgt ervoor dat de 'daadwerkelijke' foutomschrijving wordt verkregen.
    
    return this.http.post(
      'https://func-wvz-officium.azurewebsites.net/api/salutatio',
      null,
      { headers, responseType: 'text' })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  handleError(error) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    window.alert(errorMessage);

    return throwError(errorMessage);
  }

  public getUserInfo() {
    return this.adalService.userInfo;
  }

  public getCachedUser() {
    return this.adalService.getUser();
  }

  public getCachedToken() {
    return this.adalService.getCachedToken(environment.config.clientId);
  }

  // #region button click

  public salutatioClicked() {
    this.setSalutatio();
  }

  public userinfoClicked() {
    this.setUserInfo();
  }

  public cacheduserClicked() {
    this.setCachedUser();
  }

  public tokenClicked() {
    this.setCachedToken();
  }

  // #endregion
}
