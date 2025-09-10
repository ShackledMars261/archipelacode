import * as vscode from 'vscode';
import * as globals from '../globals';

export function getStatus(currentStatus: globals.APStatus) {
    vscode.window.showInformationMessage(Object.keys(globals.APStatus).filter(key => isNaN(Number(key)))[Number(currentStatus)]);
}