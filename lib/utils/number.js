define({
  round: function(number, precision){
    precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
    return Math.round(number * precision) / precision;
  },

  padRight: function (number, padding){
    var text = number + '',
        length = (text.split('.')[1] || []).length;

    if (length === 0) text += '.';

    for (var i = 0, l = padding - length; i < l; i++) {
      text += '0';
    }

    return text;
  }
});