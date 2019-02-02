import { Injectable } from '@angular/core';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpResponseType } from './http.service';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError = (result: HttpResponseType, operation: string, messageID?: string) => (error: HttpErrorResponse) => Observable<HttpResponseType>;

/** Handles HttpClient errors */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(
    private message: NzMessageService,
    private notification: NzNotificationService
  ) { }

  createErrorHandler = (serviceName: string = '') => (result: HttpResponseType, operation: string, messageID: string = '') =>
    this.handleError(result, serviceName, operation, messageID)

  handleError(result: HttpResponseType, serviceName: string, operation: string, messageID: string) {
    return (error: HttpErrorResponse): Observable<HttpResponseType> => {
      if (messageID) {
        this.message.remove(messageID);
      }

      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An non-backend error occurred:', error.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }

      if (operation && serviceName) {
        const message = (error.error instanceof ErrorEvent) ?
          error.error.message :
          `服务端返回错误码 ${error.status}，错误信息为 "${error.error.msg}"`;

        this.notification.create('error', `${operation}时网络请求发生了错误`, message);

        // TODO: send the error to remote logging infrastructure
        // console.error(`${serviceName}: ${operation} failed: ${message}`); // log to console instead
      }

      // Let the app keep running by returning a safe result.
      return of(result);
    };
  }
}
