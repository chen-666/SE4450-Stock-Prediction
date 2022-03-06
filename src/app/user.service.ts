import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Stock } from "./stock";
import { StockInfo } from "./user";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string) {
    return this.http.post(`${environment.api}/login`, {
      username,
      password
    })
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${environment.api}/users`, {
      username,
      email,
      password
    })
  }

  watch(uid: number, stock: StockInfo) {
    return this.http.post(`${environment.api}/users/${uid}/stock`, stock)
  }

  unwatch(uid: number, sid: number) {
    return this.http.delete(`${environment.api}/users/${uid}/stock/${sid}`)
  }

  get(uid: number) {
    return this.http.get(`${environment.api}/users/${uid}`)
  }
}
