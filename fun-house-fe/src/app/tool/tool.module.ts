import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgZorroAntdModule } from 'ng-zorro-antd';

import { DynamicFormItemComponent } from './components/dynamic-form-item/dynamic-form-item.component';

@NgModule({
  declarations: [DynamicFormItemComponent],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [DynamicFormItemComponent],
  entryComponents: []
})
export class ToolModule { }
