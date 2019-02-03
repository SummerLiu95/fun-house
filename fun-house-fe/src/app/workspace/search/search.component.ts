import { Component, OnInit } from '@angular/core';
import { SearchResultItemType } from '../../shared/type/types';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchArray: SearchResultItemType[];

  constructor() { }

  ngOnInit() {
  }

  getResult($event: SearchResultItemType[]) {
    this.searchArray = $event;
  }
}
