
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DndModule } from '@churchs19/ng2-dnd';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import {
  OBarMenuGroupModule,
  OBarMenuItemModule,
  OBarMenuModule,
  OBarMenuNestedModule,
  OBarMenuSeparatorModule,
  OBreadcrumbModule,
  OButtonModule,
  OButtonToggleModule,
  OCardMenuItemModule,
  OCheckboxModule,
  OColumnCollapsibleModule,
  OColumnModule,
  OComboModule,
  OContextMenuModule,
  OCurrencyInputModule,
  ODateInputModule,
  ODialogModule,
  OEmailInputModule,
  OErrorModule,
  OFileInputModule,
  OFilterBuilderModule,
  OFormContainerModule,
  OFormModule,
  OGridModule,
  OHourInputModule,
  OHTMLInputModule,
  OImageModule,
  OIntegerInputModule,
  OLanguageSelectorModule,
  OListItemAvatarModule,
  OListItemCardImageModule,
  OListItemCardModule,
  OListItemModule,
  OListItemTextModule,
  OListModule,
  OListPickerModule,
  OLocaleBarMenuItemModule,
  ONIFInputModule,
  OPasswordInputModule,
  OPercentInputModule,
  ORadioModule,
  ORealInputModule,
  ORowCollapsibleModule,
  ORowModule,
  OSearchInputModule,
  OSliderModule,
  OSlideToggleModule,
  OSnackBarModule,
  OTableModule,
  OTextareaInputModule,
  OTextInputModule,
  OTimeInputModule,
  OUserInfoModule,
  OValidatorModule,
} from '../components';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { OAppLayoutModule, OCardMenuLayoutModule, OFormLayoutManagerModule } from '../layouts';
import { OTranslateHttpLoader, OTranslateService } from '../services';
import { OPermissionsModule } from '../services/permissions/o-permissions.module';
import { OTranslateParser } from '../services/translate/o-translate.parser';
import { OSharedModule } from '../shared';
import { Util } from '../utils';
import { appInitializerFactory } from './o-providers';

export const INTERNAL_ONTIMIZE_MODULES_EXPORTED: any = [
  // Standard modules
  HttpClientModule,
  OSharedModule,

  // Ontimize modules
  OBarMenuModule,
  OBarMenuGroupModule,
  OBarMenuItemModule,
  OLocaleBarMenuItemModule,
  OBarMenuSeparatorModule,
  OBarMenuNestedModule,
  OBreadcrumbModule,
  OButtonModule,
  OButtonToggleModule,
  OCheckboxModule,
  OComboModule,
  OColumnModule,
  OColumnCollapsibleModule,
  OContextMenuModule,
  ORowModule,
  ORowCollapsibleModule,
  ODialogModule,
  OSnackBarModule,
  OFilterBuilderModule,
  OFormModule,
  OFormContainerModule,
  OImageModule,
  OCurrencyInputModule,
  ODateInputModule,
  OEmailInputModule,
  OFileInputModule,
  OHTMLInputModule,
  OIntegerInputModule,
  OListPickerModule,
  ONIFInputModule,
  OPasswordInputModule,
  OPercentInputModule,
  ORealInputModule,
  OTextInputModule,
  OTextareaInputModule,
  OValidatorModule,
  OErrorModule,
  OListModule,
  OListItemModule,
  OListItemAvatarModule,
  OListItemTextModule,
  OListItemCardModule,
  OListItemCardImageModule,
  OSearchInputModule,
  OTableModule,
  OAppLayoutModule,
  OFormLayoutManagerModule,
  OUserInfoModule,
  OLanguageSelectorModule,
  OCardMenuItemModule,
  OCardMenuLayoutModule,
  OHourInputModule,
  OTimeInputModule,
  OGridModule,
  ORadioModule,
  OSlideToggleModule,
  OSliderModule
];

// AoT requires an exported function for factories
export function OHttpLoaderFactory(http: HttpClient, injector: Injector, appConfig: AppConfig) {
  let i18nConf = appConfig.getI18nAssetsConfiguration();
  let i18nPath = undefined;
  let i18nExtension = undefined;
  if (Util.isDefined(i18nConf)) {
    if (Util.isDefined(i18nConf.path)) {
      i18nPath = i18nConf.path;
    }
    if (Util.isDefined(i18nConf.extension)) {
      i18nExtension = i18nConf.extension;
    }
  }
  return new OTranslateHttpLoader(http, i18nPath, i18nExtension, injector);
}

export function OTranslateParserFactory() {
  return new OTranslateParser();
}

export const INTERNAL_ONTIMIZE_MODULES: any = [
  HttpClientModule,

  // Ngx-translate
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: OHttpLoaderFactory,
      deps: [HttpClient, Injector, AppConfig]
    },
    parser: {
      provide: TranslateParser,
      useFactory: OTranslateParserFactory
    }
  }),
  DndModule.forRoot(),
  NgxMaterialTimepickerModule.forRoot(),
  OSharedModule,

  // Ontimize modules
  OBarMenuModule,
  OBarMenuGroupModule,
  OBarMenuItemModule,
  OLocaleBarMenuItemModule,
  OBarMenuSeparatorModule,
  OBarMenuNestedModule,
  OBreadcrumbModule,
  OButtonModule,
  OButtonToggleModule,
  OCheckboxModule,
  OComboModule,
  OColumnModule,
  OColumnCollapsibleModule,
  OContextMenuModule,
  ORowModule,
  ORowCollapsibleModule,
  ODialogModule,
  OSnackBarModule,
  OFilterBuilderModule,
  OFormModule,
  OFormContainerModule,
  OImageModule,
  OCurrencyInputModule,
  ODateInputModule,
  OEmailInputModule,
  OFileInputModule,
  OHTMLInputModule,
  OIntegerInputModule,
  OListPickerModule,
  ONIFInputModule,
  OPasswordInputModule,
  OPercentInputModule,
  ORealInputModule,
  OTextInputModule,
  OTextareaInputModule,
  OValidatorModule,
  OErrorModule,
  OListModule,
  OListItemModule,
  OListItemAvatarModule,
  OListItemTextModule,
  OListItemCardModule,
  OListItemCardImageModule,
  OSearchInputModule,
  OTableModule,
  OAppLayoutModule,
  OFormLayoutManagerModule,
  OUserInfoModule,
  OLanguageSelectorModule,
  OCardMenuItemModule,
  OCardMenuLayoutModule,
  OHourInputModule,
  OTimeInputModule,
  OGridModule,
  ORadioModule,
  OSlideToggleModule
];

@NgModule({
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [Injector, APP_CONFIG, OTranslateService],
    multi: true
  }]
})
export class OntimizeWebTranslateModule { }

export const ONTIMIZE_MODULES: any = [
  BrowserModule,
  BrowserAnimationsModule,
  OntimizeWebTranslateModule,
  OPermissionsModule
];
