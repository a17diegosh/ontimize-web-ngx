import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, Inject, Injector, NgModule, Optional, ViewEncapsulation } from '@angular/core';

import { OSharedModule } from '../../../shared/shared.module';
import { OFormComponent } from '../../form/form-components';
import { OContainerCollapsibleComponent } from '../o-container-collapsible-component.class';

export const DEFAULT_INPUTS_O_ROW_COLLAPSIBLE = [
  ...OContainerCollapsibleComponent.DEFAULT_INPUTS_O_CONTAINER_COLLAPSIBLE
];

@Component({
  moduleId: module.id,
  selector: 'o-row-collapsible',
  templateUrl: './o-row-collapsible.component.html',
  styleUrls: ['./o-row-collapsible.component.scss'],
  inputs: DEFAULT_INPUTS_O_ROW_COLLAPSIBLE,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-row-collapsible]': 'true'
  }
})
export class ORowCollapsibleComponent extends OContainerCollapsibleComponent {

  public static DEFAULT_INPUTS_O_ROW_COLLAPSIBLE = DEFAULT_INPUTS_O_ROW_COLLAPSIBLE;

  constructor(
    @Optional() @Inject(forwardRef(() => OFormComponent)) protected form: OFormComponent,
    protected elRef: ElementRef,
    protected injector: Injector
  ) {
    super(form, elRef, injector);
  }

}

@NgModule({
  declarations: [ORowCollapsibleComponent],
  imports: [CommonModule, OSharedModule],
  exports: [ORowCollapsibleComponent]
})
export class ORowCollapsibleModule { }