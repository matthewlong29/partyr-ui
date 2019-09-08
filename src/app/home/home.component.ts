import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  title = "Demo";
  greeting = {};

  constructor(
    private authentication: AuthenticationService,
    private http: HttpClient
  ) {
    http.get("/partyr-api/welcome").subscribe(data => (this.greeting = data));
  }
  ngOnInit() {}

  authenticated() {
    return this.authentication.authenticated;
  }
}
