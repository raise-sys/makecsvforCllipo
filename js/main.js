
let sortitems = [];
var strShirushi='○';

const table = document.querySelector('table');
const input = document.querySelector('[name="filechoose"]');
const reader = new FileReader();

var iCol_shipPostalCode=22;
var iCol_recipientName=16;
var iCol_productName=8;

const make_col = (label, tag) => {
    const col = document.createElement(tag);

    if (label !== null){
      if(label === ''){
        if(tag === 'td'){
          col.classList.add("check");
          col.setAttribute("name","check");
          col.addEventListener('click', () => {
            if(col.innerHTML == '○'){
              col.innerHTML = '';
            }else{
              col.innerHTML ='○';
            }
          });
        }else if(tag === 'th'){
          col.classList.add("allcheck");
          col.addEventListener('click', () => {
            eletdA = document.getElementsByName("check");
            for(i=0;i<eletdA.length;i++){
              eletd = eletdA[i];
              eletd.innerHTML=strShirushi;
            }
            if (strShirushi=='○'){
              strShirushi='';
            }else{
              strShirushi='○';
            }
          });
        }
      }
      col.innerHTML = label.replace('\n', '<br />').replace('\x22\x22', '\x22');
    }
    return col;
}
const make_hrow = (line, tag) => {
  i=0;
  const tr = document.createElement('tr');
  line.forEach(label => {
      if(label==='ship-postal-code'){
        tr.appendChild(make_col('', tag));
        tr.appendChild(make_col('郵便番号', tag));
        iCol_shipPostalCode = i;
      }
      i++;
  });
  i=0;
  line.forEach(label => {
      if(label==='recipient-name'){
        tr.appendChild(make_col('お客様名', tag));
        iCol_recipientName = i;
      }
      i++;
  });
  i=0;
  line.forEach(label => {
      if(label==='product-name'){
        tr.appendChild(make_col('商品名', tag));
        iCol_productName = i;
      }
      i++;
  });
  return tr;
}
const make_row = (line, tag) => {
    i=0;
    const tr = document.createElement('tr');
    line.forEach(label => {
        if(i===iCol_shipPostalCode){
          tr.appendChild(make_col('', tag));
          tr.appendChild(make_col(label, tag));
        }
        i++;
    });
    i=0;
    line.forEach(label => {
        if(i===iCol_recipientName){
          tr.appendChild(make_col(label, tag));
        }
        i++;
    });
    i=0;
    line.forEach(label => {
        if(i===iCol_productName){
          tr.appendChild(make_col(label, tag));
        }
        i++;
    });
    return tr;
}

// 画面出力
const show = (header) => {
    table.innerHTML = '';
    table.appendChild(make_hrow(header, 'th'));
    // 値
    sortitems.forEach(line => {
        table.appendChild(make_row(line, 'td'));
    });
}

// ファイル選択確認
const file_choosed = () => {
    if (input.files.length === 0) return;
    const file = input.files[0];
    reader.readAsText(file,'sjis');
}

// 文字列から，Unicodeコードポイントの配列を作る
function str_to_unicode_array( str ){
	var arr = [];
	for( var i = 0; i < str.length; i ++ ){
		arr.push( str.charCodeAt( i ) );
	}
	return arr;
};


// CSVダウンロードリンクを生成する
function f(){

  // CSVの内容
  let csv_header ="お届け先郵便番号,お届け先氏名,お届け先敬称,お届け先住所1行目,お届け先住所2行目,お届け先住所3行目,お届け先住所4行目,内容品";

  var elements = document.getElementsByClassName("check");

  let csv_body = "";
  console.log(sortitems);
  for(i=0;i < elements.length;i++){
    if(elements[i].innerHTML === "○"){
      if(sortitems[i][18] == null){
        sortitems[i][18] = "";
      }
      if(sortitems[i][19] == null){
        sortitems[i][19] = "";
      }
      csv_body += `\r\n${sortitems[i][22]},${sortitems[i][16]},様,${sortitems[i][21]},${sortitems[i][17]},${sortitems[i][18]},${sortitems[i][19]},Amazon販売書籍`;
    }
  }

	var csv_line = csv_header + csv_body;

	// Unicodeコードポイントの配列に変換する
	var unicode_array = str_to_unicode_array( csv_line );
	
	// SJISコードポイントの配列に変換
	var sjis_code_array = Encoding.convert( 
		unicode_array, // ※文字列を直接渡すのではない点に注意
		'SJIS',  // to
		'UNICODE' // from
	);
	
	// 文字コード配列をTypedArrayに変換する
	var uint8_array = new Uint8Array( sjis_code_array );
	
	// 指定されたデータを保持するBlobを作成する
	var blob = new Blob([ uint8_array ], { type: 'text/csv' });

	// Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
	window.URL = window.URL || window.webkitURL;
	document.getElementById("hoge").href = window.URL.createObjectURL(blob);
	document.getElementById("hoge").download = "ClickPost.csv";
	
}



// ファイル読み込み
const file_load = () => {
    let csv = reader.result;
    // 空データなら処理しない
    if (csv.length === 0) return false;

    // Excel出力されたCSVの最終行の空行を無視
    // Excel出力されたセル中の改行は\n、行末の改行は\r\n(macは行末\nかも...)
    csv = csv.replace('"', ' ');
    csv = csv.replace(/\r\n$/, '');
    // console.log(csv);

    // 改行区切りしたデータ
    const parse = csv.split(/\r\n/m);
    let data = [];

    // 行データごとにまとめる
    let line = [];
    let quot = 0;
    for (const current of parse) {
        const this_quots = current.match(/\x22/g);
        if (this_quots == null && line.length == 0) {
            data.push(current);
        } else if (this_quots == null) {
            line.push(current);
        } else {
            quot += this_quots.length;
            line.push(current);
            if (quot % 2 == 0) {
                data.push(line.join('\r\n'));
                quot = 0;
                line = [];
            }
        }
    }

    /**
     * セル区切りパターン
     */
    // 空セル
    const pt_1 = new RegExp(/^\x22?[,\t]\x22?/, 'm');
    // ダブルクォーテーションつきのセルはダブルクォーテーション後カンマ、タブが出てくるまで
    const pt_2 = new RegExp(/^\x22([^\x22]+)\x22(\,|\t)/, 'm');
    // ダブルクォーテーションなしのタブ区切りでカンマが出てくるパターン
    const pt_3 = new RegExp(/^([^\t]+)(\t)/);
    // ダブルクォーテーションで囲まれていない場合はカンマかタブが出現するまで
    const pt_4 = new RegExp(/^([^\,\t]+)(\,|\t|$)/);

    // ヘッダ、内容出力データ用配列
    const header = [];
    const items = [];
    before = null;
    data.forEach((v, i) => {
        cell = null;
        while (v.length > 0) {
            if (pt_1.exec(v)) {
                cell = [pt_1.exec(v)[0], null, null];
            } else if (pt_2.exec(v)) {
                cell = pt_2.exec(v);
            } else if (pt_3.exec(v)) {
                cell = pt_3.exec(v);
            } else if (pt_4.exec(v)) {
                cell = pt_4.exec(v);
            } else {
                // 最終行
                cell = [v, v, v];
            }
            if (i === 0) {
                header.push(cell[1]);
            } else {
                if (typeof(items[i - 1]) === 'undefined') items[i - 1] = [];
                items[i - 1].push(cell[1]);
            }
            v = v.substring(cell[0].length, v.length);
        }
    });

    for(i = 0;i < items.length;i++){
      let s = items[i][22] + '';
      items[i][22] = s.replace('-','');
    }
    
    sortitems = items.sort((a, b) => a[22] - b[22]);
    
    for(i = 0;i < items.length;i++){
      let s = items[i][22] + '';
      if (items[i][22].length===7){
        items[i][22] = s.substring(0,3) + '-' + s.substring(3) ;
      }
    }


    // 画面出力
    show(header);

    //
}

// Events
input.addEventListener('change', file_choosed, false);
reader.addEventListener('load', file_load, false);
// document.getElementById("csvoutput").addEventListener('click', function(e){
//   // downloadText();
//   e.preventDefault();
// }, false);
