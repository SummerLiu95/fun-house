import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { DataService } from '../../service/data.service';
import { SearchResultItemType } from '../../type/types';


interface FormItem  {
  id: number;
  controlInstance: string;
}

interface ForumItem {
  name: string;
  URL: string;
}

@Component({
  selector: 'app-dynamic-form-item',
  templateUrl: './dynamic-form-item.component.html',
  styleUrls: ['./dynamic-form-item.component.scss']
})
export class DynamicFormItemComponent implements OnInit {
  @Input() defaultSize: number;
  @Input() maxFormItemSize: number;
  @Output() search: EventEmitter<SearchResultItemType[]> = new EventEmitter<SearchResultItemType[]>();
  currentFormItemSize = 0;
  validateForm: FormGroup;
  controlArray: Array<FormItem> = [];
  forumList: ForumItem[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private message: NzMessageService,
    private dataService: DataService
  ) {
    this.forumList = [
      {
        name: '广州租房',
        URL: 'https://www.douban.com/group/gz020/'
      },
      {
        name: '广州天河租房',
        URL: 'https://www.douban.com/group/tianhezufang/'
      },
      {
        name: '广州荔湾租房',
        URL: 'https://www.douban.com/group/liwanzufang/'
      },
      {
        name: '广州海珠租房',
        URL: 'https://www.douban.com/group/haizhuzufang/'
      },
      {
        name: '广州越秀租房',
        URL: 'https://www.douban.com/group/yuexiuzufang/'
      },
      {
        name: '广州番禺租房',
        URL: 'https://www.douban.com/group/panyuzufang/'
      },
      {
        name: '广州白云租房',
        URL: 'https://www.douban.com/group/baiyunzufang/'
      },
      {
        name: '上海租房',
        URL: 'https://www.douban.com/group/shanghaizufang/'
      },
      {
        name: '北京租房',
        URL: 'https://www.douban.com/group/beijingzufang/'
      }
    ];
  }

  ngOnInit() {
    this.validateForm = this.formBuilder.group({});
    this.validateForm.addControl('selection', new FormControl(null, Validators.required));
    while (this.currentFormItemSize < this.defaultSize) {
      this.addField();
      this.currentFormItemSize++;
    }
  }

  /**
   * 添加新的表单控件
   * @param e|Object 鼠标事件
   */
  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    if (this.controlArray.length > this.maxFormItemSize - 1) {
      this.message.create('warning', `关键词选项不能超过${this.maxFormItemSize}个`);
      return;
    }
    const id = (this.controlArray.length > 0) ? this.controlArray[this.controlArray.length - 1].id + 1 : 0;

    const control = {
      id,
      controlInstance: `keyword${id}`
    };
    const index = this.controlArray.push(control);
    console.log(this.controlArray[this.controlArray.length - 1]);
    this.validateForm.addControl(this.controlArray[index - 1].controlInstance, new FormControl(null, Validators.required));
  }

  /**
   * 删除某个表单控件
   * @param i|Object 表单控件对象
   * @param e|Object 鼠标事件
   */
  removeField(i: FormItem, e: MouseEvent): void {
    e.preventDefault();
    if (this.controlArray.length === 1) {
      this.message.create('warning', `关键词选项最少要有1个`);
      return;
    } else if (this.controlArray.length > 1) {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1);
      console.log(this.controlArray);
      this.validateForm.removeControl(i.controlInstance);
    }
  }

  /**
   * 获取特定的表单控件
   * @param name|string 表单控件名字
   */
  getFormControl(name: string): AbstractControl {
    return this.validateForm.controls[name];
  }

  /**
   * 提交表单数据
   */
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(i)) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
    console.log(this.validateForm.value);
    let queryParams = { ...this.validateForm.value};
    queryParams = Object.assign(queryParams, {
      pages: 1,
      isProxy: 0
    });
    console.log(queryParams);
    this.dataService.getSearchResult(queryParams).subscribe((res) => {
      this.search.emit(res);
    });
  }
}
