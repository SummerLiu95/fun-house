// 路由器相关模块导入
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// 路由相关组件导入
import { MainComponent } from './main/main.component';
import { WorkspaceComponent } from './workspace.component';

const routes: Routes = [
  {
    path: 'workspace',
    component: WorkspaceComponent,
    children: [
      {
        path: 'main',
        component: MainComponent
      },
      {
        path: '',
        redirectTo: '/workspace/main',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
