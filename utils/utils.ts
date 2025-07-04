export function newLineTrim(str: string) {
  let startIndex = str.length - 1;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char !== '\r' && char !== '\n') {
      startIndex = i;
      break;
    }
  }
  let endIndex = str.length - 1;
  for (let i = str.length - 1; i >= startIndex + 1; i--) {
    const char = str[i];
    if (char !== '\r' && char !== '\n') {
      endIndex = i;
      break;
    }
  }
  return str.slice(startIndex, endIndex + 1);
}

export function dialogKeyify(key: string) {
  return key
    .replaceAll('-', '_')
    .replaceAll('/', '_')
    .replaceAll('+', '_')
    .replaceAll(' ', '_');
}
