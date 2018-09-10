var form = document.querySelector('.form-attributes');
var formContainer = document.querySelector('.form-attributes__container');
var formControls = form.querySelectorAll('[name]');
var formSubmit = form.querySelector('[type=submit]');
var formClear = form.querySelector('[type=reset]');
var clipboardModal = document.querySelector('.clipboard-modal');
var clipboardModalBody = clipboardModal.querySelector('.modal-body pre');

var formLoad = document.querySelector('.form-load');
var formLoadAttributes = formLoad.querySelector('[name=attributes]');
var formLoadWrapper = formLoad.querySelector('.form-group');

var makeElement = function (tagName, className, text, attributes) {
  var element = document.createElement(tagName);

  if (name) {
    element.name = name;
  }

  if (className) {
    element.classList.add(className);
  }

  if (text) {
    if (tagName === 'input') {
        element.value = text;
    } else {
      element.textContent = text;
    }
  }
  if (attributes) {
    for (var key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
  }

  // element.dataset.prefix = 'Основные характеристики|Тип|';

  return element;
};

var createControl = function(controlData, index){
  var type = '';
  var typeAbbr = controlData[controlData.length - 1];
  var params = [];
  var title = '';
  var attributes = {};
  var options = [];
  var controlFull;

  if (typeAbbr === 'T') {
    type = 'textarea'
    controlData = controlData.slice(0,-1);
  } else if (typeAbbr === '|') {
    type = 'input'
  } else {
    type = 'select';
  }

  params = controlData.split('|');
  title = params[1];
  prefix = params[0] + '|' + params[1] + '|';
  attributes = {
    'name': 'attribute_' + index,
    'id': 'attributes_control_' + index,
    'data-prefix': prefix,
    'required': 'required'
  }

  if (type ==='textarea') {
    attributes.rows = '5';
  } else if (type ==='select') {
    options = params[2].split('; ');

    if (options.length === 1) {
      attributes.disabled = 'disabled';
    }
  }

  var row = makeElement('div', 'row');
  var col = makeElement('div', 'col');
  var group = makeElement('div', 'form-group')

  var label = makeElement('label', undefined, title, {'for' : 'attributes_control_' + index});
  var control = makeElement(type, 'form-control', undefined, attributes);

  if (type ==='select') {
    for (var i = 0; i < options.length; i++) {
      var option = makeElement('option', undefined, options[i]);
      control.appendChild(option);
    }
  }

  group.appendChild(label);
  group.appendChild(control);
  row.appendChild(col).appendChild(group);
  controlFull = row;

  return controlFull;
}

formLoad.addEventListener('submit', function(e){
  e.preventDefault();
  var attributes = formLoadAttributes.value.trim().split('\n');

  for (var i = 0; i < attributes.length; i++) {
    var attribute = attributes[i].trim();
    var controlItem =  createControl(attribute, i);
    formContainer.appendChild(controlItem);
  }

});

form.addEventListener('submit', function(e){
  e.preventDefault();
  var formatedText = '';
  var textArray = [];
  var isList, isFirstCap = false;

  for (var i = 0; i < formControls.length; i++) {
    if (formControls[i].type == 'textarea') {
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

  // Вывод форматированного текста в попап и буфер обмена
  clipboardModalBody.textContent = formatedText;
  navigator.clipboard.writeText(formatedText);
  $('#clipboardModal').modal('show');
});

window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    e.preventDefault();
    formSubmit.click();
  } else if (e.ctrlKey && e.shiftKey && e.keyCode === 88) {
    e.preventDefault();
    formSubmit.click();
    formClear.click();
  }
});
