import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, Inject, Injector, NgModule, Optional, ViewEncapsulation } from '@angular/core';
import { OFormComponent } from '../../../components';
import { InputConverter } from '../../../decorators';
import { OSharedModule } from '../../../shared';
import { DEFAULT_INPUTS_O_FORM_DATA_COMPONENT, DEFAULT_OUTPUTS_O_FORM_DATA_COMPONENT, OFormDataComponent } from '../../o-form-data-component.class';


export const DEFAULT_INPUTS_O_SLIDER_INPUT = [
  ...DEFAULT_INPUTS_O_FORM_DATA_COMPONENT,
  'color',
  'invert',
  'max',
  'min',
  'step',
  'thumbLabel:thumb-label',
  'tickInterval:tick-interval',
  'layout',
  'oDisplayWith:display-with'
];

export const DEFAULT_OUTPUTS_O_SLIDER_INPUT = [
  ...DEFAULT_OUTPUTS_O_FORM_DATA_COMPONENT
];

export type SliderDisplayFunction = (value: number | null) => string | number;

@Component({
  moduleId: module.id,
  selector: 'o-slider',
  host: {
    'class': 'o-slider'
  },
  templateUrl: 'o-slider.component.html',
  styleUrls: ['./o-slider.component.scss'],
  inputs: DEFAULT_INPUTS_O_SLIDER_INPUT,
  outputs: DEFAULT_OUTPUTS_O_SLIDER_INPUT,
  encapsulation: ViewEncapsulation.None
})
export class OSliderComponent extends OFormDataComponent {
  public static DEFAULT_INPUTS_O_SLIDER_INPUT = DEFAULT_INPUTS_O_SLIDER_INPUT;
  public static DEFAULT_OUTPUTS_O_SLIDER_INPUT = DEFAULT_OUTPUTS_O_SLIDER_INPUT;

  public color: string;
  public layout: 'row' | 'column' = 'row';

  @InputConverter()
  public vertical: boolean = false;

  @InputConverter()
  public invert: boolean = false;

  @InputConverter()
  public thumbLabel: boolean = false;

  @InputConverter()
  min: number;

  @InputConverter()
  max: number;

  @InputConverter()
  step: number = 1;

  set tickInterval(value: any) {
    this._tickInterval = value;
  }
  get tickInterval() {
    return this._tickInterval;
  }
  _tickInterval: 'auto' | number = 0;


  oDisplayWith: SliderDisplayFunction;

  constructor(
    @Optional() @Inject(forwardRef(() => OFormComponent)) form: OFormComponent,
    elRef: ElementRef,
    injector: Injector
  ) {
    super(form, elRef, injector);
  }

  onClickBlocker(evt: Event) {
    evt.stopPropagation();
  }

}

@NgModule({
  declarations: [OSliderComponent],
  imports: [CommonModule, OSharedModule],
  exports: [OSliderComponent]
})
export class OSliderModule { }
