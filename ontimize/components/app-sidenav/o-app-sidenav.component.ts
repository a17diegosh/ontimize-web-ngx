import { AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Injector, NgModule, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material';
import { Router, RouterModule } from '@angular/router';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';

import { Util } from '../../util/util';
import { OSharedModule } from '../../shared';
import { InputConverter } from '../../decorators';
import { OAppSidenavImageModule } from './image/o-app-sidenav-image.component';
import { OAppSidenavMenuItemModule } from './menu-item/o-app-sidenav-menu-item.component';
import { OAppSidenavMenuGroupModule } from './menu-group/o-app-sidenav-menu-group.component';
import { OAppLayoutComponent, OAppLayoutMode, OSidenavMode } from '../../layouts/app-layout/o-app-layout.component';
import { AppMenuService, MenuRootItem, MenuItemUserInfo, MenuGroup, OUserInfoService, UserInfo } from '../../services';

export const DEFAULT_INPUTS_O_APP_SIDENAV = [
  'opened',
  'showUserInfo: show-user-info',
  'showToggleButton: show-toggle-button',
  'openedSidenavImg: opened-sidenav-image',
  'closedSidenavImg: closed-sidenav-image',
  'layoutMode: layout-mode',
  'sidenavMode: sidenav-mode'
];

export const DEFAULT_OUTPUTS_O_APP_SIDENAV = [
  'onSidenavToggle',
  'afterSidenavToggle'
];

@Component({
  moduleId: module.id,
  selector: 'o-app-sidenav',
  inputs: DEFAULT_INPUTS_O_APP_SIDENAV,
  outputs: DEFAULT_OUTPUTS_O_APP_SIDENAV,
  templateUrl: './o-app-sidenav.component.html',
  styleUrls: ['./o-app-sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-app-sidenav]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OAppSidenavComponent implements OnInit, OnDestroy, AfterViewInit {

  public static DEFAULT_INPUTS_O_APP_LAYOUT = DEFAULT_INPUTS_O_APP_SIDENAV;
  public static DEFAULT_OUTPUTS_O_APP_LAYOUT = DEFAULT_OUTPUTS_O_APP_SIDENAV;

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  protected routerSubscription: Subscription;
  appMenuService: AppMenuService;
  protected _menuRootArray: MenuRootItem[] = [];
  protected _layoutMode: OAppLayoutMode;
  protected _sidenavMode: OSidenavMode;
  @InputConverter()
  protected opened: boolean = true;
  _showUserInfo: boolean = true;
  _showToggleButton: boolean = true;
  openedSidenavImg: string;
  closedSidenavImg: string;

  onSidenavToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  afterSidenavToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected oUserInfoService: OUserInfoService;
  protected userInfoSubscription: Subscription;
  protected userInfo: UserInfo;

  protected mediaWatch: Subscription;
  protected manuallyClosed: boolean = false;

  constructor(
    protected injector: Injector,
    protected router: Router,
    protected elRef: ElementRef,
    protected cd: ChangeDetectorRef,
    protected media: MediaObserver
  ) {
    this.appMenuService = this.injector.get(AppMenuService);
    this.menuRootArray = this.appMenuService.getMenuRoots();
    this.oUserInfoService = this.injector.get(OUserInfoService);
    const self = this;
    this.mediaWatch = this.media.media$.subscribe((change: MediaChange) => {
      if (self.isScreenSmall() && self.sidenav) {
        self.sidenav.close();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (!this.manuallyClosed && !this.isScreenSmall() && !this.isMobileMode()) {
      this.sidenav.open();
    }
  }

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe(() => {
      if (this.isScreenSmall()) {
        this.sidenav.close();
      }
    });
  }

  ngAfterViewInit() {
    if (this.showUserInfo && this.showToggleButton) {
      this.userInfo = this.oUserInfoService.getUserInfo();
      this.userInfoSubscription = this.oUserInfoService.getUserInfoObservable().subscribe(res => {
        this.userInfo = res;
        this.refreshMenuRoots();
      });
    }
    this.refreshMenuRoots();
  }

  get layoutMode(): OAppLayoutMode {
    return this._layoutMode;
  }

  set layoutMode(val: OAppLayoutMode) {
    let m = OAppLayoutComponent.OAppLayoutModes.find(e => e === val);
    if (Util.isDefined(m)) {
      this._layoutMode = m;
    }
  }

  get sidenavMode(): OSidenavMode {
    return this._sidenavMode;
  }

  set sidenavMode(val: OSidenavMode) {
    let m = OAppLayoutComponent.OSidenavModes.find(e => e === val);
    if (Util.isDefined(m)) {
      this._sidenavMode = m;
    }
  }

  protected refreshMenuRoots() {
    if (this.showUserInfo && this.userInfo && this._showToggleButton) {
      const firstRoot = this.menuRootArray[0];
      const alreadyExistsUserInfo = firstRoot ? firstRoot.id === 'user-info' : false;
      if (alreadyExistsUserInfo) {
        const userInfoItem: MenuItemUserInfo = (this.menuRootArray[0] as MenuGroup).items[0] as MenuItemUserInfo;
        userInfoItem.id = this.userInfo.username;
        userInfoItem.name = this.userInfo.username;
        userInfoItem.user = this.userInfo.username;
        userInfoItem.avatar = this.userInfo.avatar;
      } else {
        const userInfoItem: MenuItemUserInfo = {
          id: this.userInfo.username,
          name: this.userInfo.username,
          user: this.userInfo.username,
          avatar: this.userInfo.avatar
        };
        const menuGroupUserInfo: MenuGroup = {
          id: 'user-info',
          name: 'APP_LAYOUT.USER_PROFILE',
          items: [userInfoItem],
          opened: true,
          icon: 'person_pin'
        };
        this.menuRootArray.unshift(menuGroupUserInfo);
      }
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userInfoSubscription) {
      this.userInfoSubscription.unsubscribe();
    }
  }

  isScreenSmall(): boolean {
    return !this.manuallyClosed && this.media.isActive('lt-sm');
  }

  isMobileMode(): boolean {
    return this._layoutMode === 'mobile';
  }

  isSidenavOpened(): boolean {
    return this.opened && !this.isMobileMode() && !this.isScreenSmall();
  }

  get menuRootArray(): MenuRootItem[] {
    return this._menuRootArray;
  }

  set menuRootArray(val: MenuRootItem[]) {
    this._menuRootArray = val;
  }

  toggleSidenav() {
    const promise = this.sidenav.opened ? this.sidenav.close() : this.sidenav.open();
    const self = this;
    promise.then(() => {
      self.afterSidenavToggle.emit(self.sidenav.opened);
    });
    this.cd.detectChanges();
    this.opened = this.sidenav.opened;
    this.manuallyClosed = !this.opened;
    this.onSidenavToggle.emit(this.sidenav.opened);
  }

  get showUserInfo(): boolean {
    return this._showUserInfo;
  }

  set showUserInfo(arg: boolean) {
    this._showUserInfo = arg;
  }

  get showToggleButton(): boolean {
    return this._showToggleButton;
  }

  set showToggleButton(arg: boolean) {
    this._showToggleButton = arg;
  }

  onMenuItemClick(e: Event): void {
    if (this.isMobileMode()) {
      this.sidenav.close();
    }
  }

}

@NgModule({
  imports: [CommonModule, OAppSidenavMenuGroupModule, OAppSidenavImageModule, OAppSidenavMenuItemModule, OSharedModule, RouterModule],
  declarations: [OAppSidenavComponent],
  exports: [OAppSidenavComponent]
})
export class OAppSidenavModule { }
