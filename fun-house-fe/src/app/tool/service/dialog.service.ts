import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private deactivateObservable: Observable<boolean>;
  private deactivateObserver: Observer<boolean>;

  constructor(
    private confirmService: NzModalService
  ) {
    this.deactivateObservable = new Observable<boolean>(observer => {
      this.deactivateObserver = observer;
    });
  }

  confirm(): Observable<boolean> {
    this.confirmService.confirm({
      nzContent: '确认是否离开该页面？',
      nzOkText: '是',
      nzOkType: 'danger',
      nzCancelText: '否',
      nzOnOk: () => this.deactivateHandler(true),
      nzOnCancel: () => this.deactivateHandler(false)
    });
    return this.deactivateObservable;
  }

  /**
   * 用户是否离开
   * @param canDeactivate|boolean
   */
  private deactivateHandler(canDeactivate: boolean): void {
    this.deactivateObserver.next(canDeactivate);
  }
}
