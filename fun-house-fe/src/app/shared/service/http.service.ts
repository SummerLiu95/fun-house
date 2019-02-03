import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { HandleError, HttpErrorHandlerService } from './http-error-handler.service';

// http 响应体类型
export interface HttpResponseType<T = any> {
  code: number;
  msg: string;
  data: T;
}

export enum StateCode {
  error =  400,
  ok = 200,
  timeout = 408,
  serviceError = 500
}

export enum PostContentType {
  default = 0,
  JSON = 1,
  FormData = 2
}

// 参数类型声明
export interface ParamsType  {
  [propName: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private handleError: HandleError;

  constructor(
    private message: NzMessageService,
    private httpClient: HttpClient,
    httpErrorHandler: HttpErrorHandlerService
  ) {
    this.handleError = httpErrorHandler.createErrorHandler('数据获取服务类');
  }


  /**
   * Post 请求参数处理成 FormData 函数
   * @param _params|any
   */
  private toFormData(_params: any): FormData {
    if (!_params) {
      return new FormData();
    }
    if (_params.constructor === FormData) {
      return _params;
    }
    const formData = new FormData();
    for (const key in _params) {
      if (_params.hasOwnProperty(key)) {
        formData.append(key, _params[key]);
      }
    }
    return formData;
  }

  /**
   * GET 请求
   * @param _url|string 请求地址
   * @param _params|ParamsType 参数对象
   * @param safeResponse|HttpResponseType 请求错误时的返回值
   * @param errorSource|string 引起错误的操作来源
   */
  Get(_url: string, _params: ParamsType = {}, safeResponse: HttpResponseType, errorSource: string = '', ): Observable<HttpResponseType> {
    const URL = environment.baseURL + _url;
    const params = new HttpParams({
      fromObject: _params
    });
    return this.httpClient.get(URL, {
      params
    }).pipe(
      map((response: HttpResponseType) => response),
      catchError(this.handleError(safeResponse, errorSource))
    );
  }

  /**
   * 请求主体可以为 urlencoding、JSON、FormData 的 POST 请求
   * @param _url|string 请求地址
   * @param _params|ParamsType 参数对象
   * @param contentType|ContentType Post请求body编码格式
   * @param safeResponse|HttpResponseType 请求错误时的返回值
   * @param userNotification|boolean 是否显示操作提示弹框
   * @param errorSource|string 引起错误的操作来源
   */
  Post(_url: string, _params: ParamsType, contentType: PostContentType, safeResponse: HttpResponseType,
       userNotification: boolean = true, errorSource: string = ''): Observable<HttpResponseType> {
    const URL = environment.baseURL + _url;
    const contentTypeArray = [new HttpParams({fromObject: _params}), _params, this.toFormData(_params)];
    let messageID = '';
    if (userNotification) {
      messageID = this.message.loading('添加中...', { nzDuration: 0 }).messageId;
    }
    return this.httpClient.post(URL, contentTypeArray[contentType], {
      
    }).pipe(
      map((response: HttpResponseType) => {
        return this.responseHandler(response, messageID);
        }),
      catchError(this.handleError(safeResponse, errorSource, messageID))
    );
  }

  /**
   * 请求主体为 JSON 的 PUT 请求
   * @param _url|string 请求地址
   * @param _params|ParamsType 参数对象
   * @param safeResponse|HttpResponseType 请求错误时的返回值
   * @param userNotification|boolean 是否显示操作提示弹框
   * @param errorSource|string 引起错误的操作来源
   */
  Put(_url: string, _params: ParamsType, safeResponse: HttpResponseType, userNotification: boolean = true,
      errorSource: string = ''): Observable<HttpResponseType> {
    const URL = environment.baseURL + _url;
    let messageID = '';
    if (userNotification) {
      messageID = this.message.loading('更新中...', { nzDuration: 0 }).messageId;
    }
    return this.httpClient.put(URL, _params, {

    }).pipe(
      map((response: HttpResponseType) => {
        return this.responseHandler(response, messageID);
        }),
      catchError(this.handleError(safeResponse, errorSource, messageID))
    );
  }

  /**
   * DELETE 请求
   * @param _url|string API接口地址
   * @param _params|ParamsType 参数对象
   * @param safeResponse|HttpResponseType 请求错误时的返回值
   * @param userNotification|boolean 是否显示操作提示弹框
   * @param errorSource|string 引起错误的操作来源
   */
  Delete(_url: string, _params: ParamsType, safeResponse: HttpResponseType, userNotification: boolean = true,
         errorSource: string = ''): Observable<HttpResponseType> {
    const URL = environment.baseURL + _url;
    const params = new HttpParams({
      fromObject: _params
    });
    let messageID = '';
    if (userNotification) {
      messageID = this.message.loading('删除中...', { nzDuration: 0 }).messageId;
    }
    return this.httpClient.delete(URL, {
      params
    }).pipe(
      map((response: HttpResponseType) => {
        return this.responseHandler(response, messageID);
        }),
      catchError(this.handleError(safeResponse, errorSource, messageID))
    );
  }

  /**
   * 请求成功情况处理
   * @param response|HttpResponseType
   * @param messageID|string
   */
  private responseHandler(response: HttpResponseType, messageID: string): HttpResponseType {
    this.message.remove(messageID);
    if (response.code === StateCode.ok) {
      // 请求成功
      this.message.success(response.msg);
    } else {
      // 请求异常以外的非成功状态码，如状态码 3XX
      this.message.warning(response.msg);
    }
    return response;
  }
}
