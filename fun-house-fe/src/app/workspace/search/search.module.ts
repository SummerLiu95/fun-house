import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { SharedModule } from '../../shared/shared.module';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';


@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    NgZorroAntdModule,
    SharedModule
  ]
})
export class SearchModule { }
