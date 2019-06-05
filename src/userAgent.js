// From https://stackoverflow.com/a/13348618/2902013
// please note,
// that IE11 now returns undefined again for window.chrome
// and new Opera 30 outputs true for window.chrome
// but needs to check if window.opr is not undefined
// and new IE Edge outputs to true now for window.chrome
// and if not iOS Chrome check
// so use the below updated condition

// we return true for electron as well as electron also does not immediately correct scroll
// similar to chrome and loads another set of posts.
// chromimum seems to work fine so mostly in near future chrome fixes the issue

export function isBrowserChrome() {
  const isChromium = window.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof window.opr !== 'undefined';
  const isIEedge = winNav.userAgent.indexOf('Edge') > -1;
  const isIOSChrome = winNav.userAgent.match('CriOS');
  const isElectron = winNav.userAgent.toLowerCase().indexOf(' electron/') > -1;

  if (isIOSChrome || isElectron) {
    return true;
  } else if (
    isChromium !== null &&
    typeof isChromium !== 'undefined' &&
    vendorName === 'Google Inc.' &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  }
  return false;
}

export function isBrowserSafari() {
  const userAgent = window.navigator.userAgent;
  return (
    userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1
  );
}
