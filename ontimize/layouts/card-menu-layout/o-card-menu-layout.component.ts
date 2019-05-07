import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, NgModule, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AppMenuService, OTranslateService } from '../../services';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MenuGroup, MenuRootItem } from '../../services/app-menu.service';

import { CommonModule } from '@angular/common';
import { OCardMenuItemModule } from '../../components/card-menu-item/o-card-menu-item.component';
import { OSharedModule } from '../../shared/shared.module';
import { Subscription } from 'rxjs';

export const DEFAULT_INPUTS_O_MENU_LAYOUT = [
  'parentMenuId : parent-menu-id'
];

export const DEFAULT_OUTPUTS_O_MENU_LAYOUT = [
];

@Component({
  moduleId: module.id,
  selector: 'o-card-menu-layout',
  templateUrl: './o-card-menu-layout.component.html',
  styleUrls: ['./o-card-menu-layout.component.scss'],
  inputs: DEFAULT_INPUTS_O_MENU_LAYOUT,
  outputs: DEFAULT_OUTPUTS_O_MENU_LAYOUT,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-menu-layout]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OCardMenuLayoutComponent implements AfterViewInit, OnDestroy {

  public static DEFAULT_INPUTS_O_MENU_LAYOUT = DEFAULT_INPUTS_O_MENU_LAYOUT;
  public static DEFAULT_OUTPUTS_O_MENU_LAYOUT = DEFAULT_OUTPUTS_O_MENU_LAYOUT;

  protected mediaWatch: Subscription;
  protected media: MediaObserver;
  protected translateService: OTranslateService;
  protected translateServiceSubscription: Subscription;
  protected appMenuService: AppMenuService;
  protected menuRoots: MenuRootItem[];
  protected cardItemsArray: MenuRootItem[];
  protected parentMenuId: string;

  get isSmallScreen(): boolean {
    return this._isSmallScreen;
  }
  set isSmallScreen(val: boolean) {
    this._isSmallScreen = val;
    this.cd.detectChanges();
  }
  protected _isSmallScreen: boolean = false;
  
  constructor(
    private injector: Injector,
    private cd: ChangeDetectorRef
  ) {
    this.media = this.injector.get(MediaObserver);
    this.translateService = this.injector.get(OTranslateService);
    this.appMenuService = this.injector.get(AppMenuService);
    this.menuRoots = this.appMenuService.getMenuRoots();

    this.translateServiceSubscription = this.translateService.onLanguageChanged.subscribe(() => {
      this.cd.detectChanges();
    });
  }

  public ngAfterViewInit(): void {
    this.setCardMenuItems();
  }

  ngAfterViewChecked(): void {
    this.mediaWatch = this.media.media$.subscribe((change: MediaChange) => {
      if (['xs', 'sm'].indexOf(change.mqAlias) !== -1) {
        this.isSmallScreen = true;
      }
      if (['md', 'lg', 'xl'].indexOf(change.mqAlias) !== -1) {
        this.isSmallScreen = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.mediaWatch) {
      this.mediaWatch.unsubscribe();
    }
    if (this.translateServiceSubscription) {
      this.translateServiceSubscription.unsubscribe();
    }
  }

  public setCardMenuItems(): void {
    let cardItemsAux = [];
    if (!this.parentMenuId) {
      cardItemsAux = this.menuRoots.filter(item => !this.appMenuService.isMenuGroup(item));
    } else {
      cardItemsAux = this.getItemsFilteredByParentId(this.menuRoots);
    }

    this.cardItems = cardItemsAux;
  }

  get cardItems(): MenuRootItem[] {
    return this.cardItemsArray;
  }

  set cardItems(val: MenuRootItem[]) {
    this.cardItemsArray = val;
    this.cd.detectChanges();
  }

  protected getItemsFilteredByParentId(array: MenuRootItem[]): MenuRootItem[] {
    let result: MenuRootItem[];
    const groups = array.filter(item => this.appMenuService.isMenuGroup(item));

    for (let i = 0, len = groups.length; i < len; i++) {
      const menuGroup = (groups[i] as MenuGroup);
      if (menuGroup.id === this.parentMenuId) {
        result = menuGroup.items;
        break;
      } else {
        result = this.getItemsFilteredByParentId(menuGroup.items);
      }
    }
    return result;
  }

}

@NgModule({
  declarations: [OCardMenuLayoutComponent],
  imports: [CommonModule, OCardMenuItemModule, OSharedModule],
  exports: [OCardMenuLayoutComponent]
})
export class OCardMenuLayoutModule { }
