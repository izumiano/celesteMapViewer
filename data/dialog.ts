import {newLineTrim} from '../utils/utils.js';

export default class Dialog {
  lines: {[key: string]: string} = {};

  constructor(data: Uint8Array) {
    const decoder = new TextDecoder('utf-8');
    const dialogLines = decoder.decode(data).split(/\r?\n/);

    let str = '';
    for (const line of dialogLines) {
      if (!line.startsWith('#')) {
        str += line + '\n';
      }
    }
    const equalSplitStr = str.split('=');
    let key;
    for (let i = 0; i < equalSplitStr.length; i++) {
      const matches = /(?<value>[\S\s]+)?(?<key>\r?\n.+)/.exec(
        equalSplitStr[i],
      )?.groups;
      if (key && matches && matches.value) {
        const value = matches.value;
        this.lines[key] = newLineTrim(value);
      }
      key = matches?.key.slice(1).trim();
    }
  }

  concat(dialog: Dialog) {
    for (const dialogKey in dialog.lines) {
      const dialogValue = dialog.lines[dialogKey];
      this.lines[dialogKey] = dialogValue;
    }
  }
}
