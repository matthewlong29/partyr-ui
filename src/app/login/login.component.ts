import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  credentials = { username: "", password: "" };

  constructor(
    private authentication: AuthenticationService,
    private http: HttpClient,
    private router: Router
  ) {}
  ngOnInit() {}
  login() {
    this.authentication.authenticate(this.credentials, () => {
      this.router.navigateByUrl("/");
    });
    return false;
  }
}
