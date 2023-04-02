import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.SERVER_PORT

function writeInstruction() {
  console.log('##### Place this code in "Tab Reloader" #####\n\n');
  console.log(`async function letsGo() { \n\n  let response = await fetch('${process.env.ZENDESK_URL}');\n\n  if (response.ok) { // если HTTP-статус в диапазоне 200-299\n    let json = await response.json();\n    let data = { "text": json.rows }\n    fetch("http://localhost:${PORT}/api/tickets", {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n      },\n      body: JSON.stringify(data),\n    })\n  } else {\n    alert("Ошибка HTTP: " + response.status);\n  }\n}\n\nletsGo()`);
  console.log('\n\n##### ##### ##### ##### ##### #### ##### #####\n\n');
}

export default {
  writeInstruction
}

/*
  Установить расширение "Tab Reloader":
    Лисичка - https://addons.mozilla.org/ru/firefox/addon/tab-reloader/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search
    Хром - https://chrome.google.com/webstore/detail/tab-reloader-page-auto-re/dejobinhdiimklegodgbmbifijpppopn/related?hl=en
  Выполнить настройки, аналогичную: https://disk.yandex.ru/i/Xii2xtN-6Kz9mw, ("Обходить отправку формы" - позволит избегать ситуацию когда при обновлении вкладки, в тикете были внесены изменения и вылезет оповещение "Уверены что хотите отменить изменения") вставив скрипт в зеленую зону, далее нажав "Сохранить как своё задание"
    значение в < 15 секунд вызывает 429 ошибку (rate-limiter)
    комфортным значением для работы будет не менее 1 минуты
  Запустить расширение.
  Выполнить настройку файла .env (инструкция в файле envExample)
  Запустить сервер с ботом

  Команды для бота:
    /start - включает оповещения и настраивает сотрудника в домене
    /stop - отключает оповещения и убирает настройку сотрудника в домене
    /ack 123456 - "Подтверждает" тикет и отменяет звонки по нему
*/

// Скрипт для вставки:

// PORT (30002) изменить в скрипте на SERVER_PORT из файла конфигурации
/*
async function letsGo() { 

  let response = await fetch('${process.env.ZENDESK_URL}');
  
  if (response.ok) { // если HTTP-статус в диапазоне 200-299
    // получаем тело ответа и отправляем его на локальный сервер
    let json = await response.json();
    let data = { "text": json.rows }
    fetch("http://localhost:3002/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  } else {
    alert("Ошибка HTTP: " + response.status);
  }
}

letsGo()
*/
