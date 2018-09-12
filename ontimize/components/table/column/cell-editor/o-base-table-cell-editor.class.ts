import { Injector, EventEmitter, OnInit, HostListener } from '@angular/core';
import { FormControl, ValidatorFn, Validators, FormGroup } from '@angular/forms';

import { InputConverter } from '../../../../decorators';
import { OTableComponent } from '../../o-table.component';
import { ObservableWrapper, Util } from '../../../../utils';
import { OTableColumnComponent } from '../o-table-column.component';
import { OTranslateService, SnackBarService } from '../../../../services';

export class OBaseTableCellEditor implements OnInit {

  public static DEFAULT_INPUTS_O_TABLE_CELL_EDITOR = [
    'orequired: required',
    'showPlaceHolder: show-placeholder',
    'olabel: label',
    'updateRecordOnEdit: update-record-on-edit',
    'showToastOnEdit: show-toast-on-edit'
  ];

  public static DEFAULT_OUTPUTS_O_TABLE_CELL_EDITOR = [
    'editionStarted',
    'editionCancelled',
    'editionCommitted',
    'onPostUpdateRecord'
  ];

  protected translateService: OTranslateService;

  @InputConverter()
  orequired: boolean = false;
  @InputConverter()
  showPlaceHolder: boolean = false;
  olabel: string;
  @InputConverter()
  updateRecordOnEdit: boolean = true;
  @InputConverter()
  showToastOnEdit: boolean = false;

  protected _tableColumnAttr: string;
  protected _tableColumn: OTableColumnComponent;
  protected _table: OTableComponent;

  protected _rowData: any;

  formControl: FormControl;
  controlArgs: any;

  formGroup: FormGroup = new FormGroup({});

  editionStarted: EventEmitter<Object> = new EventEmitter<Object>();
  editionCancelled: EventEmitter<Object> = new EventEmitter<Object>();
  editionCommitted: EventEmitter<Object> = new EventEmitter<Object>();

  onPostUpdateRecord: EventEmitter<Object> = new EventEmitter<Object>();

  @HostListener('document:keyup', ['$event'])
  onDocumentKeyup(event: KeyboardEvent) {
    this.handleKeyup(event);
  }
  inputRef: any;

  protected type: string;
  registerInColumn: boolean = true;

  protected snackBarService: SnackBarService;

  constructor(protected injector: Injector) {
    this.snackBarService = this.injector.get(SnackBarService);
    this.tableColumn = this.injector.get(OTableColumnComponent);
    this.translateService = this.injector.get(OTranslateService);
  }

  ngOnInit(): void {
    this.createFormControl();
    this.registerEditor();
  }

  protected handleKeyup(event: KeyboardEvent) {
    const oColumn = this.table.getOColumn(this._tableColumnAttr);
    if (!oColumn || !oColumn.editing) {
      return;
    }
    if (event.keyCode === 27) {
      this.onEscClicked();
    } else if (event.keyCode === 13 || event.keyCode === 9) {
      this.commitEdition();
    }
  }

  createFormControl() {
    if (!this.formControl) {
      const validators: ValidatorFn[] = this.resolveValidators();
      const cfg = {
        value: undefined,
        disabled: false
      };
      this.formControl = new FormControl(cfg, validators);
      this.formGroup.addControl(Math.random().toString(36), this.formControl);
    }
  }

  registerEditor() {
    if (this.registerInColumn) {
      this.tableColumn.registerEditor(this);
      if (!Util.isDefined(this.type) && Util.isDefined(this.tableColumn.type)) {
        this.type = this.tableColumn.type;
      }
    }
  }

  getCellData(): any {
    return this._rowData[this._tableColumnAttr];
  }

  startEdition(data: any) {
    this.formGroup.reset();
    this.rowData = data;
    if (!this.isSilentControl()) {
      this.editionStarted.emit(this._rowData);
    }
  }

  endEdition(saveChanges) {
    const oColumn = this.table.getOColumn(this._tableColumnAttr);
    if (oColumn) {
      const self = this;
      const updateObserver = this.table.updateCellData(oColumn, this._rowData, saveChanges);
      if (updateObserver) {
        updateObserver.subscribe(res => {
          self.onUpdateSuccess(res);
        }, error => {
          self.table.showDialogError(error, 'MESSAGES.ERROR_UPDATE');
        });
      }
    }
  }

  commitEdition() {
    if (!this.formControl.invalid) {
      this._rowData[this._tableColumnAttr] = this.formControl.value;
      if (!this.isSilentControl()) {
        this.endEdition(true);
        this.editionCommitted.emit(this._rowData);
      }
    }
  }

  get tableColumn(): OTableColumnComponent {
    return this._tableColumn;
  }

  set tableColumn(arg: OTableColumnComponent) {
    this._tableColumn = arg;
    if (arg) {
      this._table = arg.table;
      this.tableColumnAttr = arg.attr;
    }
  }

  set tableColumnAttr(arg: string) {
    this._tableColumnAttr = arg;
  }

  set table(arg: OTableComponent) {
    this._table = arg;
  }

  get table(): OTableComponent {
    return this._table;
  }

  get rowData(): any {
    return this._rowData;
  }

  set rowData(arg: any) {
    this._rowData = arg;
    const cellData = this.getCellData();
    this.formControl.setValue(cellData);
    this.formControl.markAsTouched();

    if (this.inputRef && this.inputRef.nativeElement.type === 'text') {
      this.inputRef.nativeElement.setSelectionRange(0, String(cellData).length);
    }
  }

  resolveValidators(): ValidatorFn[] {
    let validators: ValidatorFn[] = [];
    if (this.orequired) {
      validators.push(Validators.required);
    }
    return validators;
  }

  hasError(error: string): boolean {
    return this.formControl && this.formControl.touched && this.hasErrorExclusive(error);
  }

  hasErrorExclusive(error: string): boolean {
    let hasError = false;
    const errorsOrder = ['matDatepickerMax', 'matDatepickerMin', 'matDatepickerFilter', 'matDatepickerParse', 'required'];
    const errors = this.formControl.errors;
    if (Util.isDefined(errors)) {
      if (Object.keys(errors).length === 1) {
        return errors.hasOwnProperty(error);
      } else {
        for (let i = 0, len = errorsOrder.length; i < len; i++) {
          hasError = errors.hasOwnProperty(errorsOrder[i]);
          if (hasError) {
            hasError = (errorsOrder[i] === error);
            break;
          }
        }
      }
    }
    return hasError;
  }

  getErrorValue(error: string, prop: string): string {
    return this.formControl.hasError(error) ? this.formControl.getError(error)[prop] || '' : '';
  }

  onEscClicked() {
    if (!this.isSilentControl()) {
      this.endEdition(false);
      this.editionCancelled.emit(this._rowData);
    }
  }

  protected isSilentControl(): boolean {
    return this.controlArgs !== undefined && this.controlArgs.silent;
  }

  getPlaceholder(): string {
    return this.showPlaceHolder ?
      this.translateService.get(this.olabel || this.tableColumn ? (this.tableColumn.title || this.tableColumnAttr) : this.tableColumnAttr) :
      undefined;
  }

  protected onUpdateSuccess(res: any) {
    ObservableWrapper.callEmit(this.onPostUpdateRecord, res);
    if (this.showToastOnEdit) {
      this.snackBarService.open('MESSAGES.INSERTED', { icon: 'check_circle' });
    }
  }

}
