// Angular 核心模块导入
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

// 业务开发模块导入
import { AppRoutingModule } from './app-routing.module';
import { NgZorroAntdModule, NZ_I18N, zh_CN, NZ_ICONS } from 'ng-zorro-antd';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { DelonMockModule } from '@delon/mock';
import * as MOCK_DATA from './mock/index';
import { SearchModule } from './workspace/search/search.module';

// 模块内组件、指令、管道等导入
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { NotFoundComponent } from './workspace/not-found/not-found.component';


registerLocaleData(zh);

// 静态全量引入 Ng-Zorro-Antd icons
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

const MOCK_MODULE = environment.envName === 'dev' ? [ DelonMockModule.forRoot({ data: MOCK_DATA, log: true, delay: 700})] : [];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgZorroAntdModule,
    SearchModule,
    AppRoutingModule,
    ...MOCK_MODULE
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    { provide: NZ_ICONS, useValue: icons}
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router) {
    const replacer = (key, value) => (typeof value === 'function') ? value.name : value;
    console.log('Routes: ' + JSON.stringify(router.config, replacer, 2));
  }
}
