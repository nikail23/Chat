import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-authorisation',
  templateUrl: './authorisation.component.html',
  styleUrls: ['./authorisation.component.scss']
})
export class AuthorisationComponent implements OnInit {
  @Output() onEnterClick = new EventEmitter<boolean>();
  public name = "";
  public isError = false;
  public error = "";

  constructor() {}

  ngOnInit(): void {
  }

  public enterClick() {
    if (this.name.length >= 3) {
      this.unsetError();
      this.onEnterClick.emit();
    } else {
      this.setError();
    }
  }

  private setError() {
    this.isError = true;
    this.error = "Length of your name must be at least 3 symbols!";
  }

  private unsetError() {
    this.isError = false;
  } 
}
