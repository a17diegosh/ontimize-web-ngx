import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from '@angular/core';

import { INTERNAL_ONTIMIZE_MODULES, INTERNAL_ONTIMIZE_MODULES_EXPORTED } from './config/o-modules';
import { OntimizeWebComponent } from './ontimize-web-ngx.component';
import { ODialogComponent } from './shared/components/dialog/o-dialog.component';
import { OSnackBarComponent } from './shared/components/snackbar/o-snackbar.component';

@Injectable({
  providedIn: 'root'
})

@NgModule({
  declarations: [OntimizeWebComponent],
  imports: INTERNAL_ONTIMIZE_MODULES,
  exports: [INTERNAL_ONTIMIZE_MODULES_EXPORTED, OntimizeWebComponent],
  entryComponents: [
    ODialogComponent,
    OSnackBarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OntimizeWebModule { }