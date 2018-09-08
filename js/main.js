var form = document.querySelector('.form-atributes');
var formControls = form.querySelectorAll('[name]');
var formSubmit = form.querySelector('[type=submit]');

function RemoveEmptyLines(value) {
  var regWhite = /[" "]/g; //remove whitespace
  var regCrLf = /[\n\r\l]{3,}/g; //remove \r\n
  value = value.replace(regWhite, '').replace(regCrLf, '');
  return value;
}


form.addEventListener('submit', function(e){
  e.preventDefault();
  var formatedText = '';
  var textArray = [];
  var isList, isFirstCap = false;

  for (var i = 0; i < formControls.length; i++) {
    if (formControls[i].dataset.formated) {
      // разбираем строку в массив по переносам
      textArray = formControls[i].value.split('\n');

      for (var j = 0; j < textArray.length; j++) {
        var str = textArray[j];

        // обрезаем пробелы в начале/конце строки
        str = str.trim();

        if (str !== '') {
          // заменяем большего > 1 пробела на 1
          str = str.replace(/\s{2,}/g,' ');
          // заменяем табы на пробел
          str = str.replace(/\t/g,' ');

          // Нахождение начала списка по двоеточию и конца по заглавной букве
          if (str.match(/:$/)) {
            isList = true;

            //Удаление строки "Комплектация:", т.к. есть в label
            if (str.match(/Комплектация:/)) {
              isFirstCap = true;
              textArray[j] = "";
              continue;
            }
          } else if (isList && str.match(/^[A-ZА-Я]/)) {
            isList = false;
          } else if (isList) {
            // Оформление элемента всех списков дефисом
            str = str.replace(/^- ?/,'');
            str = '- ' + str;

            //Делаем заглавной первую букву в списке Комплектации
            if (isFirstCap) {
              str = str[2].toUpperCase() + str.slice(3);
              isFirstCap = false;
            }
          }

          // удаляем пунктуацию в конце строки - будет добавлена потом
          if (str.match(/[.;,]$/) ) {
            str = str.slice(0,-1);
          }
          // console.log(str);
        }

        textArray[j] = str;
      }

      // console.log(textArray);

      // удаляем пустые строки из массива
      textArray = textArray.filter(Boolean);
      // собираем строку из массива с переносами
      formControls[i].value = textArray.join('\n');
      // обрабатываем списки
      formControls[i].value = formControls[i].value.replace(/:\n-? ?/g,': ').replace(/^- ?/,'').replace(/\n- ?/g,', ');
      // обрабатываем переносы строк
      formControls[i].value = formControls[i].value.replace(/\n/g,'. ');
      // добавляем точку в конце, т.к. там нет переноса
      formControls[i].value += '.';

      // console.log(formControls[i].value);
    }

    formatedText += formControls[i].dataset.prefix + formControls[i].value;

    if (i < formControls.length - 1) {
      formatedText += '\n';
    }
  }
  console.log(formatedText);
  navigator.clipboard.writeText(formatedText);
});
