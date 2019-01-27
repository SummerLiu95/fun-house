import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError = <T> (messageID?: string, operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(
    private message: NzMessageService
  ) { }

  createErrorHandler = (serviceName: string = '') => <T> (messageID: string, operation = 'operation', result = {} as T) =>
    this.handleError(messageID, serviceName, operation, result)

  handleError<T> (messageID = '', serviceName = '', operation = 'operation', result = {} as T) {
    return (error: HttpErrorResponse): Observable<T> => {
      if (messageID !== '') {
        this.message.remove(messageID);
      }

      if (operation !== 'operation') {
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

        const message = (error.error instanceof ErrorEvent) ?
          error.error.message :
          `服务端返回错误码 ${error.status}，错误信息为 "${error.error.msg}"`;

        this.message.error(`${serviceName}: ${operation} failed: ${message}`);

        // TODO: send the error to remote logging infrastructure
        // console.error(`${serviceName}: ${operation} failed: ${message}`); // log to console instead
      }

      // Let the app keep running by returning a safe result.
      return of(result);
    };
  }
}
