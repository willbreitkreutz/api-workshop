function throttle(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function leftPad(str, len, ch){
    var cache = [
      ' ',
      '  ',
      '   ',
      '    ',
      '     ',
      '      ',
      '       ',
      '        ',
      '         ',
      '          '
    ]

    str = str + '';
    len = len - str.length;

    if(len <= 0) return str;

    if(!ch && ch !== 0) ch = ' ';
    ch = ch + '';

    if(ch === ' ' && len < 10) return cache[len] + str;

    var pad = '';

    while (true){
      if(len & 1) pad += ch;
      len >>= 1;
      if(len) ch += ch;
      else break;
    }

    return pad + str;

  }