import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserService } from "../user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "../user";

enum SIGN {
  SIGNIN,
  SIGNUP
}

@Component({
  selector: 'app-signin',
  template: `
    <div>
      <nav>
        <button mat-button routerLink="/">
          {{environment.title}}
        </button>
      </nav>
      <main style="margin-top: 60px">
        <mat-card style="margin:0 auto; max-width: 600px">
          <mat-card-title class="center"
                          style="margin-top: 60px"
          >Sign in to {{environment.title}} Finance
          </mat-card-title>
          <mat-card-subtitle class="center">using your {{environment.title}} account</mat-card-subtitle>
          <mat-card-content style="margin-top: 60px; padding: 20px">
            <form>
              <mat-form-field class="full-width"
                              appearance="fill">
                <mat-label>Username</mat-label>
                <input type="text" matInput
                       placeholder=""
                       name="username"
                       [(ngModel)]="username"
                >
              </mat-form-field>
              <mat-form-field *ngIf="mode===1" class="full-width"
                              appearance="fill">
                <mat-label>Email</mat-label>
                <input type="email" matInput
                       placeholder=""
                       name="email"
                       [(ngModel)]="email"
                >
              </mat-form-field>
              <mat-form-field class="full-width"
                              appearance="fill">
                <mat-label>Password</mat-label>
                <input type="password" matInput
                       placeholder=""
                       name="password"
                       [(ngModel)]="password"
                >
              </mat-form-field>
              <div style="display: flex;justify-content: space-around">
                <button *ngIf="mode===0" style="display: flex"
                        mat-raised-button color="primary"
                        (click)="$event.preventDefault();signin()">
                  Sign in
                </button>
                <button style="display: flex"
                        mat-raised-button color="primary"
                        (click)="$event.preventDefault();signup()">
                  Sign up
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </main>

    </div>
  `,
  styles: [
    `.center {
      text-align: center;
    }`,
    `div {
      margin: 0 auto;
      padding: 20px;
      max-width: 900px;
    }`
  ]
})
export class SigninComponent implements OnInit {
  environment = environment
  username = ""
  email = ""
  password = ""
  mode: SIGN = SIGN.SIGNIN

  constructor(private userService: UserService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.url.subscribe(value => {
        if (value[0].path === 'signin')
          this.mode = SIGN.SIGNIN
        else
          this.mode = SIGN.SIGNUP
      }
    )
  }

  signin() {
    console.log(this.username, this.password)
    this.userService.login(this.username, this.password)
      .subscribe(value => {
        localStorage.setItem('uid', String((value as User).id))
        this.router.navigate(['/'])
      }, ({error}) => {
        alert(error.detail || error)
      })
  }

  signup() {
    if (this.mode === SIGN.SIGNIN) {
      this.router.navigate(['/signup'])
    } else {
      this.userService.register(this.username, this.email, this.password)
        .subscribe(value => {
          localStorage.setItem('uid', String((value as User).id))
          this.router.navigate(['/'])
        }, ({error}) => {
          alert(error.detail || error)
        })
    }
  }
}
