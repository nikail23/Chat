import { Component } from '@angular/core';

export enum Page {
  authorisation = "authorisation",
  chat = "chat"
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public pages = Page;
  public currentPage: Page = Page.chat;

  onEnterClick(){
    this.currentPage = Page.chat;
  }
}
