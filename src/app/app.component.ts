import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";
import { AuthenticationService } from "./services/authentication.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  constructor(
    private authentication: AuthenticationService,
    private http: HttpClient,
    private router: Router
  ) {
    this.authentication.authenticate(undefined, undefined);
  }
  logout() {
    this.http
      .post("/partyr-api/logout", {})
      .pipe(
        finalize(() => {
          this.authentication.authenticated = false;
          this.router.navigateByUrl("/login");
        })
      )
      .subscribe();
  }
}
