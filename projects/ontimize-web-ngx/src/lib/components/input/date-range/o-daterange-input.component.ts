import { Component, ElementRef, forwardRef, Inject, Injector, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';

import { InputConverter } from '../../../decorators/input-converter';
import { MomentService } from '../../../services/moment.service';
import { OTranslateService } from '../../../services/translate/o-translate.service';
import { OntimizeMomentDateAdapter } from '../../../shared/material/date/ontimize-moment-date-adapter';
import { FormValueOptions } from '../../../types/form-value-options.type';
import { ODateValueType } from '../../../types/o-date-value.type';
import { Util } from '../../../util/util';
import { OFormComponent } from '../../form/o-form.component';
import { OFormDataComponent } from '../../o-form-data-component.class';
import { OValueChangeEvent } from '../../o-value-change-event.class';
import { DEFAULT_INPUTS_O_DATE_INPUT } from '../date-input/o-date-input.component';
import { DEFAULT_OUTPUTS_O_TEXT_INPUT } from '../text-input/o-text-input.component';
import { ODaterangepickerDirective } from './o-daterange-input.directive';
import { DaterangepickerComponent } from './o-daterange-picker.component';

export const DEFAULT_OUTPUTS_O_DATERANGE_INPUT = [
  ...DEFAULT_OUTPUTS_O_TEXT_INPUT
];

export const DEFAULT_INPUTS_O_DATERANGE_INPUT = [
  'separator',
  'showWeekNumbers:show-week-numbers',
  'showRanges:show-ranges',
  'olocale:locale',
  'startKey',
  'endKey',
  'valueType: value-type',
  ...DEFAULT_INPUTS_O_DATE_INPUT
];

const moment = _moment;

@Component({
  selector: 'o-daterange-input',
  templateUrl: './o-daterange-input.component.html',
  styleUrls: ['./o-daterange-input.component.scss'],
  outputs: DEFAULT_OUTPUTS_O_DATERANGE_INPUT,
  inputs: DEFAULT_INPUTS_O_DATERANGE_INPUT
})
export class ODateRangeInputComponent extends OFormDataComponent implements OnDestroy, OnInit {

  @ViewChild(ODaterangepickerDirective, { static: true }) pickerDirective: ODaterangepickerDirective;
  picker!: DaterangepickerComponent;

  @ViewChild('matInputRef', { read: ElementRef, static: true })
  private matInputRef!: ElementRef;

  @InputConverter()
  public textInputEnabled: boolean = true;

  @InputConverter()
  public showWeekNumbers: boolean = false;

  @InputConverter()
  public oTouchUi: boolean = false;

  @InputConverter()
  public showRanges: boolean = false;

  protected _oMinDate: _moment.Moment;
  get oMinDate() {
    return this._oMinDate;
  }
  set oMinDate(value) {
    this._oMinDate = moment(value, this.oformat);
  }

  protected _oMaxDate: _moment.Moment;
  get oMaxDate() {
    return this._oMaxDate;
  }
  set oMaxDate(value) {
    this._oMaxDate = moment(value, this.oformat);
  }

  protected _startKey: string = 'startDate';
  get startKey() {
    return this._startKey;
  }
  set startKey(value) {
    this._startKey = value;
  }

  protected _endKey: string = 'endDate';
  get endKey() {
    return this._endKey;
  }
  set endKey(value) {
    this._endKey = value;
  }

  protected _valueType: ODateValueType = 'timestamp';

  protected _separator = ' - ';
  get separator() {
    return this._separator;
  }

  set separator(value) {
    this._separator = value;
    if (this.getFormControl() && this.getFormControl().value) {
      this.updateElement();
    }
  }

  get showClearButton(): boolean {
    return this.clearButton && !this.isReadOnly && this.enabled && this.matInputRef.nativeElement.value;
  }

  get localeOptions() {
    return this._localeOptions;
  }

  public oformat: string = 'L';
  protected _localeOptions: any;
  protected olocale: string;

  private momentSrv: MomentService;
  private oTranslate: OTranslateService;
  private momentDateAdapter: DateAdapter<MomentDateAdapter>;


  constructor(
    @Optional() @Inject(forwardRef(() => OFormComponent)) form: OFormComponent,
    elRef: ElementRef,
    injector: Injector,
    dateAdapter: DateAdapter<OntimizeMomentDateAdapter>
  ) {
    super(form, elRef, injector);
    this.oTranslate = this.injector.get(OTranslateService);
    this.momentSrv = this.injector.get(MomentService);
    this._localeOptions = {
      direction: 'ltr',
      separator: ' - ',
      weekLabel: this.oTranslate.get('DATERANGE.W'),
      applyLabel: this.oTranslate.get('DATERANGE.APPLYLABEL'),
      cancelLabel: this.oTranslate.get('CANCEL'),
      customRangeLabel: 'Custom range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek(),
      format: 'L'
    };
  }

  ngOnInit() {
    super.ngOnInit();

    if (!this.olocale) {
      this.olocale = this.momentSrv.getLocale();
      moment.locale(this.olocale);

    }
    if (this.oformat) {
      this._localeOptions.format = this.oformat;
    }
  }

  public openPicker() {
    this.pickerDirective.open();
  }

  public onChangeEvent(event: any): void {
    let objectValue;
    if (event instanceof Event) {
      const value = (event.target as HTMLInputElement).value;
      if (value !== '') {
        objectValue = this.getDateRangeToString(value);
      }
    } else {
      objectValue = event;
    }

    this.setValue(objectValue, {
      changeType: OValueChangeEvent.USER_CHANGE,
      emitEvent: false,
      emitModelToViewChange: false
    });

  }

  public setValue(val: any, options: FormValueOptions = {}, setDirty: boolean = false) {
    super.setValue(val, options, setDirty);
    this.updateElement();
  }

  public onClickClearValue(e: Event): void {
    super.onClickClearValue(e);
    this.pickerDirective.value = undefined;
    this.pickerDirective.datesUpdated.emit();
  }

  datesUpdated(range) {
    this.pickerDirective.close();
    this.setValue(range,
      {
        changeType: OValueChangeEvent.USER_CHANGE,
        emitEvent: false,
        emitModelToViewChange: false
      });
  }

  public setData(newValue: any): void {
    super.setData(newValue);
    this.pickerDirective.datesUpdated.emit(newValue);
    this.updateElement();
  }

  updateElement() {
    let chosenLabel: any;
    if (Util.isDefined(this.value.value) && !this.isObjectDataRangeNull(this.value)) {
      if (this.value.value[this.pickerDirective.startKey] && this.value.value[this.pickerDirective.endKey]) {
        this.value.value[this.pickerDirective.startKey] = Util.ensureDateRangeValue(this.value.value[this.pickerDirective.startKey], this._valueType);
        this.value.value[this.pickerDirective.endKey]  = Util.ensureDateRangeValue(this.value.value[this.pickerDirective.endKey], this._valueType);
        chosenLabel = this.value.value[this.pickerDirective.startKey].format(this.oformat) +
          this.separator + this.value.value[this.pickerDirective.endKey].format(this.oformat);
      } else {
        chosenLabel = null;
      }
    } else {
      chosenLabel = null;
    }
    this.pickerDirective._el.nativeElement.value = chosenLabel;
  }


  getDateRangeToString(valueToString: string) {
    const value = {};
    const range = valueToString.split(this.separator);
    value[this._startKey] = moment(range[0].trim(), this.oformat);
    value[this._endKey] = moment(range[1].trim(), this.oformat);
    return value;
  }


  resolveValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = super.resolveValidators();

    validators.push(this.rangeDateValidator.bind(this));
    if (Util.isDefined(this._oMinDate)) {
      validators.push(this.minDateValidator.bind(this));
    }
    if (Util.isDefined(this._oMaxDate)) {
      validators.push(this.maxDateValidator.bind(this));
    }

    validators.push(this.parseDateValidator.bind(this));
    return validators;
  }

  isObjectDataRangeNull(objectValue): boolean {
    return objectValue !== null && objectValue.value !== null &&
      !Util.isDefined(objectValue.value[this.pickerDirective.startKey]) &&
      !Util.isDefined(objectValue.value[this.pickerDirective.endKey]);
  }


  protected rangeDateValidator(control: FormControl): ValidationErrors {

    if ((control.value instanceof Object)
      && !this.isObjectDataRangeNull(control) && control.value[this._endKey].isSameOrBefore(control.value[this._startKey])) {
      return {
        dateRange: true
      };
    }
    return {};
  }

  protected minDateValidator(control: FormControl): ValidationErrors {
    const mindate = moment(this._oMinDate);
    if ((control.value instanceof Object)
      && !this.isObjectDataRangeNull(control) && control.value[this._startKey].isBefore(mindate)) {
      return {
        dateRangeMin: {
          dateMin: mindate.format(this.oformat)
        }
      };
    }
    return {};
  }

  protected maxDateValidator(control: FormControl): ValidationErrors {
    const maxdate = moment(this._oMaxDate);
    if ((control.value instanceof Object)
      && !this.isObjectDataRangeNull(control) && control.value[this._endKey].isAfter(maxdate)) {
      return {
        dateRangeMax: {
          dateMax: maxdate.format(this.oformat)
        }
      };
    }
    return {};
  }
  protected parseDateValidator(control: FormControl): ValidationErrors {
    if ((control.value instanceof Object)
      && !this.isObjectDataRangeNull(control)
      && ((control.value[this._startKey] && !control.value[this._startKey].isValid())
        || (control.value[this._endKey] && !control.value[this._endKey].isValid()))) {
      return {
        dateRangeParse: {
          format: this.oformat + this._localeOptions.separator + this.oformat
        }
      };
    }
    return {};
  }

  set valueType(val: any) {
    this._valueType = Util.convertToODateValueType(val);
  }

  get valueType(): any {
    return this._valueType;
  }
}
