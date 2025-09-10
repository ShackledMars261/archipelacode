import * as vscode from 'vscode';
import * as globals from '../globals';

export async function setStatus(currentStatus: globals.APStatus) {
    let items: vscode.QuickPickItem[] = [];


    Object.keys(globals.APStatus).filter(key => isNaN(Number(key))).forEach((value) => {
        items.push({label: String(value)});
    });
    
    let result = await vscode.window.showQuickPick(items, {
        placeHolder: 'What should the new status be?',
        canPickMany: false
    })

    return globals.APStatus[(result ? result.label : currentStatus.toString()) as keyof typeof globals.APStatus];
}