import * as R from 'ramda';
//import log from 'Utilities/logutils';

//const displayName = 'yhoutils';

const setExplanation  = function(profile) { 
  const { paymentWord, itemWord, deliverWord, noteWord } = profile;
  const _paymentWord = paymentWord || '支払詳細'
  const _itemWord    = itemWord    || '商品詳細'
  const _deliverWord = deliverWord || '配送詳細'
  const _noteWord    = noteWord    || '注意事項' 
  //log.info(displayName, { _paymentWord, _itemWord, _deliverWord, _noteWord });
  return function(_obj) {
    const input = _obj.explanation;
    const title = _obj.title;
    const len = R.length(input);
    const words = [ _paymentWord, _itemWord, _deliverWord, _noteWord ];
    let num1 = R.length(words), idx = 0, pairs = [];
    while(num1--) {
      idx = indexTitle(words[num1], input)
      if(idx !== -1) pairs[num1] = { name: words[num1], from: idx };
    }
    pairs = R.compose(R.sortBy(R.prop('from')), R.filter(__obj => !R.isNil(__obj)))(pairs);
    const max = R.length(pairs);
    let num2 = max;
    while(num2--) {
      if(num2 === max - 1)  pairs[num2] = R.merge(pairs[num2], { to: len });
      else                  pairs[num2] = R.merge(pairs[num2], { to: pairs[num2+1].from - 1 });
    }
    const subString     = __obj => input.substring(__obj.from, __obj.to);
    const setSubStr     = __obj => R.merge(__obj, { string: subString(__obj) });
    const setItem       = R.find(__obj => __obj.name === _itemWord);
    const setPayment    = R.find(__obj => __obj.name === _paymentWord);
    const setShipment   = R.find(__obj => __obj.name === _deliverWord);
    const setNotes      = R.find(__obj => __obj.name === _noteWord);
    const setExplan     = __obj => ({ 
      title:    title
    , item:     setItem(__obj)
    , payment:  setPayment(__obj)
    , shipment: setShipment(__obj)
    , notes:    setNotes(__obj) 
    });
    const explanation   = R.compose(render(profile), setExplan, R.map(setSubStr))(pairs);
    //log.info('explanation =', explanation);
    return R.merge(_obj, { explanation }); 
  };
};

const indexTitle = function(words, title)  {
  //log.info('words =', words, 'title =', title);
  const split       = str => R.map(R.trim, R.split(',', str));
  const join        = str => R.join('|', str);
  const regexp      = str => new RegExp(str);
  const test        = str => R.test(str, title);
  const isTitle     = R.compose(test, regexp, join, split);
  const index       = str => R.indexOf(str, title);
  const indexs      = R.map(index);
  const hasIndex    = R.find(val => val !== -1)
  const indexString = R.compose(hasIndex, indexs, split);
  return isTitle(words) ? indexString(words) : -1;
};

const trimBody = function(words, body) {
  const split         = str => R.map(R.trim, R.split(',', str));
  const join          = str => R.join('|', str);
  const joinString    = R.compose(join, split)(words);
  const regexp        = str => new RegExp(str);
  const repTitle      = R.replace(regexp(joinString), '');
  const repRetBR      = R.replace(/\r?\n/g, '<br>');
  const replaceString = R.compose(repTitle, repRetBR);
  return replaceString(body);
};

const render = function(profile) {
  const { paymentWord, itemWord, deliverWord, noteWord } = profile;
  const _paymentWord = paymentWord || '支払詳細'
  const _itemWord    = itemWord    || '商品詳細'
  const _deliverWord = deliverWord || '配送詳細'
  const _noteWord    = noteWord    || '注意事項' 
  return function(params) {
    const title     = params.title ? params.title : '';
    const item      = params.item     && params.item.string     ? trimBody(_itemWord   , params.item.string)     : '';
    const payment   = params.payment  && params.payment.string  ? trimBody(_paymentWord, params.payment.string)  : '';
    const shipment  = params.shipment && params.shipment.string ? trimBody(_deliverWord, params.shipment.string) : '';
    const notes     = params.notes    && params.notes.string    ? trimBody(_noteWord   , params.notes.string)    : '';
    return item === '' ? '-' : `<center>
        <img src= width=500><br>
        <img src= width=500><br>
        <img src= width=500><br>
        <img src= width=500><br>
        <img src= width=500><br>
        <img src= width=500><br>
        <img src= width=500><br>
      </center>
      <br>
      <center>

      <font color=#336600 size=4><b>${ title }</b></font>

      <br>
      <br>

      <table width=500 cellspacing=0 border=0 cellpadding=5>

      <tr>
        <td width=3%></td>
        <td width=27%></td>
        <td width=67%></td>
        <td width=3%></td>
      </tr>

      <tr>
        <td bgcolor=#336600></td>
        <td bgcolor=#FFFFCC colspan=3><font color=#336600 size=3><b>商品詳細</b></font></td>
      </tr>

      <tr>
        <td colspan=4 height=10></td>
      </tr>

      <tr>
        <td></td>
        <td colspan=2 align=left><font color=#336600 size=2>${ item }</font></td>
        <td></td>
      </tr>

      <tr>
        <td colspan=4 height=25></td>
      </tr>

      <tr>
        <td bgcolor=#336600></td>
        <td bgcolor=#FFFFCC colspan=3><font color=#336600 size=3><b>支払詳細</b></font></td>
      </tr>

      <tr>
        <td colspan=4 height=10></td>
      </tr>

      <tr>
        <td></td>
        <td colspan=2 align=left><font color=#336600 size=2>${ payment }</font></td>
        <td></td>
      </tr>

      <tr>
        <td colspan=4 height=25></td>
      </tr>

      <tr>
        <td bgcolor=#336600></td>
        <td bgcolor=#FFFFCC colspan=3><font color=#336600 size=3><b>発送詳細</b></font></td>
      </tr>

      <tr>
        <td colspan=4 height=10></td>
      </tr>

      <tr>
        <td></td>
        <td colspan=2 align=left><font color=#336600 size=2>${ shipment }</font></td>
        <td></td>
      </tr>

      <tr>
        <td colspan=4 height=25></td>
      </tr>

      <tr>
        <td bgcolor=#336600></td>
        <td bgcolor=#FFFFCC colspan=3><font color=#336600 size=3><b>注意事項</b></font></td>
      </tr>

      <tr>
        <td colspan=4 height=10></td>
      </tr>

      <tr>
        <td></td>
        <td colspan=2 align=left><font color=#336600 size=2>${ notes }</font></td>
        <td></td>
      </tr>

      <tr>
        <td colspan=4 height=25></td>
      </tr>

      </table>
      <br>
      <br>
      <br>
      </center>`;
  }
};

export default { setExplanation };
