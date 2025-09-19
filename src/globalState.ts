/** @format */
import * as vscode from "vscode";

export type UserDataType = {
  isSignedIn: boolean;
  isPremium: boolean;
  username: string;
  avatar: string;
  isVerified?: boolean;
};

const CookieKey = "archipelacode-lc-cookie";
const UserStatusKey = "archipelacode-lc-user-status";

class GlobalState {
  private context!: vscode.ExtensionContext;
  private _cookie!: string;
  private _state!: vscode.Memento;
  private _userStatus!: UserDataType;

  constructor() {}

  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
    this._state = this.context.globalState;
  }

  public setCookie(cookie: string): any {
    this._cookie = cookie;
    return this._state.update(CookieKey, this._cookie);
  }

  public getCookie(): string | undefined {
    return this._cookie ?? this._state.get(CookieKey);
  }

  public removeCookie(): void {
    this._state.update(CookieKey, undefined);
  }

  public setUserStatus(userStatus: UserDataType): any {
    this._userStatus = userStatus;
    return this._state.update(UserStatusKey, this._userStatus);
  }

  public getUserStatus(): UserDataType | undefined {
    return this._userStatus ?? this._state.get(UserStatusKey);
  }

  public removeAll(): void {
    this._state.update(CookieKey, undefined);
    this._state.update(UserStatusKey, undefined);
  }
}

export const globalState: GlobalState = new GlobalState();
