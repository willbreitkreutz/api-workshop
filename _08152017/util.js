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

  function formatDuration (seconds) {
    function getDays(seconds){
      return Math.floor(days = seconds / 60 / 60 / 24);
    }
    function getHours(seconds){
      return Math.floor(seconds / 60 / 60);
    }
    function getMinutes(seconds){
      return Math.floor(seconds / 60);
    }
    var days = getDays(seconds);
    var hours = getHours(seconds);
    var minutes = getMinutes(seconds);
    var formattedDuration = '';
    if(days){
      formattedDuration = days + ' days, ' + hours % days + ' hours';
    }else if(hours){
      formattedDuration = hours + ' hours, ' + minutes % hours + ' minutes';
    }else if(minutes){
      formattedDuration = minutes + ' min';
    }
    return formattedDuration;
  }