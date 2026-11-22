export type Lang = 'uk' | 'ru'
export const LANGS: Lang[] = ['uk', 'ru']
export const LOCALE: Record<Lang, string> = { uk: 'uk-UA', ru: 'ru-RU' }

const LANG_KEY = 'offonsvitlo_lang'

const uk = {
  'meta.title': `offonsvitlo — графік відключень ДТЕК`,
  'lang.label': `Мова`,
  'lang.ui': `Мова інтерфейсу та сповіщень`,
  'lang.uk': `Українська`,
  'lang.ru': `Русский`,

  'app.loading': `Завантаження графіка…`,
  'app.errorTitle': `Не вдалося завантажити дані`,
  'app.errorRetryHint': `Спробуйте ще раз`,
  'app.retry': `Повторити`,
  'err.server': `Сервер недоступний`,
  'err.generic': `Помилка`,
  'header.demo': `Демо-дані`,

  'nav.aria': `Основна навігація`,
  'nav.home': `Головна`,
  'nav.addresses': `Адреси`,
  'nav.alerts': `Повідомлення`,
  'nav.settings': `Налаштування`,

  'home.refresh': `Оновити ДТЕК`,
  'home.updated': `Оновлено ДТЕК: {v}`,
  'home.addTitle': `Додайте свою адресу`,
  'home.addDesc': `Оберіть місто, вулицю та будинок, і ми покажемо, чи є світло зараз, графік на добу та надішлемо сповіщення в Telegram.`,
  'home.addBtn': `Додати адресу`,
  'queue.word': `Черга`,

  'status.aria': `Поточний статус світла`,
  'status.off': `Світла немає`,
  'status.on': `Світло є`,
  'status.maybe': `Можливе відключення`,
  'status.unknown': `Немає даних`,
  'status.subUnknown': `Графік ДТЕК для цієї черги ще не опубліковано`,
  'status.subOffNoPlan': `Увімкнення за графіком не заплановано`,
  'status.subOnTomorrow': `Без відключень до кінця завтра`,
  'status.subOnDay': `Без відключень до кінця доби`,
  'status.onIn': `Увімкнення через {d} (о {t})`,
  'status.offIn': `Вимкнення через {d} (о {t})`,
  'status.withLight': `Зі світлом`,
  'status.withoutLight': `Без світла`,
  'status.now': `Зараз`,
  'unit.h': `год`,
  'unit.m': `хв`,
  'unit.d': `дн`,

  'strip.aria': `Ваші адреси`,
  'strip.off': `Відключено`,
  'strip.on': `Світло є`,
  'strip.unknown': `Немає даних`,
  'strip.notPublished': `Графік не опубліковано`,
  'strip.noChange': `Без змін до кінця доби`,
  'strip.untilOn': `До увімкнення`,
  'strip.untilOff': `До вимкнення`,

  'grid.title': `Графік відключень`,
  'grid.tomorrow': `Завтра`,
  'grid.tomorrowAria': `Показати графік на завтра`,
  'grid.scale': `24-годинна шкала ({q})`,
  'grid.scaleTomorrow': ` · завтра`,
  'grid.listAria': `Графік по годинах, {q}`,
  'grid.nowAria': `, зараз`,
  'grid.emptyToday': `Графік на сьогодні ще не опубліковано`,
  'grid.emptyTomorrow': `Графік на завтра ще не опубліковано`,
  'grid.legend': `Легенда`,
  'grid.legendOn': `є`,
  'grid.legendOff': `вимк.`,
  'grid.legendHalf': `пів години`,
  'grid.theme': `Світло/Темно`,
  'grid.darkAria': `Темна тема`,
  'kind.on': `є`,
  'kind.off': `Вимк.`,
  'kind.offFirst': `до :30`,
  'kind.offSecond': `з :30`,
  'kind.maybe': `Можл.`,
  'kind.unknown': `—`,
  'kindLabel.on': `світло є`,
  'kindLabel.off': `відключення`,
  'kindLabel.offFirst': `відключення перші 30 хвилин`,
  'kindLabel.offSecond': `відключення другі 30 хвилин`,
  'kindLabel.maybe': `можливе відключення`,
  'kindLabel.unknown': `немає даних`,

  'hist.title': `Історія відключень та подій`,
  'hist.viewAria': `Вигляд історії`,
  'hist.byDays': `За днями`,
  'hist.events': `Події ({n})`,
  'hist.tomorrow': `Завтра`,
  'hist.today': `Сьогодні`,
  'hist.yesterday': `Вчора`,
  'hist.notPublished': `Графік не опубліковано`,
  'hist.noOutages': `Без відключень · 0 {h}`,
  'hist.noEvents': `Подій поки немає`,

  'addrs.title': `Адреси`,
  'addrs.used': `Використано {n} з {max}`,
  'addrs.add': `Додати`,
  'addrs.empty': `Ще немає жодної адреси. Додайте першу, щоб отримувати сповіщення.`,
  'addrs.openAria': `Відкрити {label} на головній`,
  'addrs.notifyFor': `Сповіщення для {label}`,
  'addrs.notifySettings': `Налаштування сповіщень`,
  'addrs.beforeOff': `Попередити до вимкнення`,
  'addrs.beforeOn': `Попередити до увімкнення`,
  'addrs.scheduleChange': `Зміни графіка ДТЕК`,
  'addrs.emergency': `Аварійні відключення`,
  'addrs.confirmDelete': `Так, видалити`,
  'addrs.cancel': `Скасувати`,
  'addrs.delete': `Видалити адресу`,
  'addrs.leadOff': `Вимк.`,
  'addrs.limitReached': `Досягнуто ліміту адрес`,

  'sheet.title': `Нова адреса`,
  'sheet.close': `Закрити`,
  'sheet.name': `Назва`,
  'sheet.defaultName': `Дім`,
  'sheet.city': `Населений пункт`,
  'sheet.cityPh': `Почніть вводити, напр. Дніпро`,
  'sheet.street': `Вулиця`,
  'sheet.streetPh': `Назва вулиці (необов'язково)`,
  'sheet.house': `Будинок`,
  'sheet.housesLoading': `Завантаження будинків…`,
  'sheet.housePh': `Номер будинку`,
  'sheet.dtekDown': `Сайт ДТЕК недоступний — просто оберіть чергу нижче.`,
  'sheet.pickQueue': `Оберіть чергу нижче.`,
  'sheet.queue': `Черга`,
  'sheet.queueAuto': `Чергу визначено автоматично за адресою. За потреби змініть її.`,
  'sheet.noQueueForHouse': `ДТЕК не повернув чергу для цього будинку, оберіть її вручну.`,
  'sheet.houseFilter': `Пошук будинку`,
  'sheet.houseNone': `Будинок не знайдено`,
  'sheet.change': `Змінити`,
  'sheet.options': `Варіанти`,
  'sheet.needCityQueue': `Оберіть місто та чергу`,
  'sheet.limit': `Досягнуто ліміту безкоштовних адрес.`,
  'sheet.saveFail': `Не вдалося зберегти адресу`,
  'sheet.trialFail': `Не вдалося активувати тестовий режим`,
  'sheet.invoiceFail': `Не вдалося створити рахунок`,
  'sheet.tryTrial': `Спробувати 3-тю адресу на {n} {days} безкоштовно`,
  'sheet.buySlot': `Купити +1 адресу за {n} зірок`,
  'sheet.save': `Зберегти адресу`,

  'alerts.title': `Повідомлення`,
  'alerts.linked': `Сповіщення в Telegram увімкнено`,
  'alerts.notLinked': `Telegram не підключено`,
  'alerts.linkedDesc': `Попередимо перед вимкненням та увімкненням світла за вашими адресами.`,
  'alerts.notLinkedDesc': `Натисніть /start у боті, щоб отримувати особисті сповіщення.`,
  'alerts.test': `Тест сповіщення`,
  'alerts.openBot': `Відкрити бота`,
  'alerts.testSent': `Тестове сповіщення надіслано в Telegram`,
  'alerts.testNotDelivered': `Подію створено, але в Telegram не доставлено`,
  'alerts.recent': `Останні події ({n})`,
  'alerts.none': `Подій поки немає`,
  'alerts.demoTitle': `Тест сповіщення`,
  'alerts.demoMsg': `Демо-режим: у Telegram повідомлення не надсилається`,

  'set.title': `Налаштування`,
  'set.dark': `Темна тема`,
  'set.quiet': `Тихі години`,
  'set.quietDesc': `Без звуку сповіщень у цей час`,
  'set.from': `Від`,
  'set.to': `До`,
  'set.starsOnlyTg': `Оплата зірками доступна лише в Telegram`,
  'set.paid': `Дякуємо! Оплату зараховано.`,
  'set.proActive': `Pro активний`,
  'set.proTitle': `offonsvitlo Pro`,
  'set.proUntil': `Діє до {d}`,
  'set.proDesc': `До {n} {addr} і без реклами · {p} ⭐ / {days}`,
  'set.proBuy': `Оформити Pro`,
  'set.donate': `Підтримати проєкт`,
  'set.donated': `Ви вже підтримали на {n} ⭐ — дякуємо!`,
  'set.footer': `Дані: ДТЕК Дніпровські електромережі · оновлено {v}`,

  'perk.shareText': `Стеж за відключеннями світла за графіком ДТЕК:`,
  'perk.trialAria': `Тестовий режим`,
  'perk.trialActive': `Бонусна адреса активна`,
  'perk.trialUntil': `Діє до {d}`,
  'perk.trialLeft': `Залишок тестового періоду`,
  'perk.trialTitle': `3-тя адреса на {n} {days}`,
  'perk.trialDesc': `Тестовий режим: безкоштовно додайте ще одну адресу та перевірте сповіщення. Активується один раз.`,
  'perk.trialBtn': `Спробувати безкоштовно`,
  'perk.refTitle': `Запросити друга`,
  'perk.refDesc': `За кожного нового друга +1 адреса на {n} {days} (разом до {max} {maxDays}).`,
  'perk.loading': `Завантаження…`,
  'perk.copyAria': `Скопіювати реферальне посилання`,
  'perk.share': `Поділитися`,
  'perk.copy': `Копіювати`,
  'perk.invited': `Запрошено:`,
  'perk.bonusUntil': `Бонус до {d}`,
  'perk.noBonus': `Бонусу ще немає`,
  'perk.onlyTg': `Реферальне посилання доступне лише в Telegram.`,
  'perk.copied': `Посилання скопійовано`,
  'perk.copyFail': `Не вдалося скопіювати`,
  'perk.sharedHint': `Посилання скопійовано. Якщо вікно вибору чату не відкрилось, надішліть його вручну.`,

  'rem.title': `Нагадування`,
  'rem.tapHint': `Торкніться години, щоб додати нагадування`,
  'rem.cellSet': `, нагадування встановлено`,
  'rem.cellTap': `, торкніться, щоб додати нагадування`,
  'rem.when': `{day}, {from}–{to}`,
  'rem.lead': `Нагадати за`,
  'rem.leadNow': `У момент початку`,
  'rem.save': `Зберегти нагадування`,
  'rem.delete': `Видалити нагадування`,
  'rem.exists': `Нагадування вже встановлено, за потреби змініть час.`,
  'rem.tgHint': `Нагадування надходять у Telegram-бот. Натисніть /start у боті, щоб підключити.`,
  'rem.past': `Цей час уже минув`,
  'rem.limit': `Досягнуто ліміту нагадувань (20)`,
  'rem.fail': `Не вдалося зберегти нагадування`,
  'rem.demoNote': `Демо-режим: нагадування не надсилатимуться`,
  'rem.listTitle': `Нагадування`,

  'ads.fallbackText': `Реклама не відкрилась?`,
  'ads.fallbackOpen': `Відкрити`,
  'set.adsDebugOn': `Діагностику реклами увімкнено`,
  'set.adsDebugOff': `Діагностику реклами вимкнено`,

  'reward.title': `Безкоштовна 3-тя адреса`,
  'reward.desc': `Перегляньте {goal} реклам за день, і 3-тя адреса працюватиме {n} {days}. Лічильник скидається щодня о 00:00.`,
  'reward.progress': `Сьогодні переглянуто: {n} з {goal}`,
  'reward.watch': `Дивитись рекламу`,
  'reward.extend': `Продовжити ще на {n} {days}`,
  'reward.granted': `Готово! 3-тя адреса активна ще {n} {days}.`,
  'reward.adFail': `Реклама не завантажилась. Спробуйте ще раз.`,
  'reward.tooFast': `Зачекайте кілька секунд перед наступною рекламою.`,
  'sheet.rewardHint': `Ліміт адрес досягнуто. Отримайте 3-тю адресу за перегляд реклами:`,
}

export type Key = keyof typeof uk

const ru: Record<Key, string> = {
  'meta.title': `offonsvitlo — график отключений ДТЭК`,
  'lang.label': `Язык`,
  'lang.ui': `Язык интерфейса и уведомлений`,
  'lang.uk': `Українська`,
  'lang.ru': `Русский`,

  'app.loading': `Загрузка графика…`,
  'app.errorTitle': `Не удалось загрузить данные`,
  'app.errorRetryHint': `Попробуйте ещё раз`,
  'app.retry': `Повторить`,
  'err.server': `Сервер недоступен`,
  'err.generic': `Ошибка`,
  'header.demo': `Демо-данные`,

  'nav.aria': `Основная навигация`,
  'nav.home': `Главная`,
  'nav.addresses': `Адреса`,
  'nav.alerts': `Сообщения`,
  'nav.settings': `Настройки`,

  'home.refresh': `Обновить ДТЭК`,
  'home.updated': `Обновлено ДТЭК: {v}`,
  'home.addTitle': `Добавьте свой адрес`,
  'home.addDesc': `Выберите город, улицу и дом, и мы покажем, есть ли свет сейчас, график на сутки и отправим уведомления в Telegram.`,
  'home.addBtn': `Добавить адрес`,
  'queue.word': `Очередь`,

  'status.aria': `Текущий статус света`,
  'status.off': `Света нет`,
  'status.on': `Свет есть`,
  'status.maybe': `Возможно отключение`,
  'status.unknown': `Нет данных`,
  'status.subUnknown': `График ДТЭК для этой очереди ещё не опубликован`,
  'status.subOffNoPlan': `Включение по графику не запланировано`,
  'status.subOnTomorrow': `Без отключений до конца завтрашнего дня`,
  'status.subOnDay': `Без отключений до конца суток`,
  'status.onIn': `Включение через {d} (в {t})`,
  'status.offIn': `Отключение через {d} (в {t})`,
  'status.withLight': `Со светом`,
  'status.withoutLight': `Без света`,
  'status.now': `Сейчас`,
  'unit.h': `ч`,
  'unit.m': `мин`,
  'unit.d': `дн`,

  'strip.aria': `Ваши адреса`,
  'strip.off': `Отключено`,
  'strip.on': `Свет есть`,
  'strip.unknown': `Нет данных`,
  'strip.notPublished': `График не опубликован`,
  'strip.noChange': `Без изменений до конца суток`,
  'strip.untilOn': `До включения`,
  'strip.untilOff': `До отключения`,

  'grid.title': `График отключений`,
  'grid.tomorrow': `Завтра`,
  'grid.tomorrowAria': `Показать график на завтра`,
  'grid.scale': `24-часовая шкала ({q})`,
  'grid.scaleTomorrow': ` · завтра`,
  'grid.listAria': `График по часам, {q}`,
  'grid.nowAria': `, сейчас`,
  'grid.emptyToday': `График на сегодня ещё не опубликован`,
  'grid.emptyTomorrow': `График на завтра ещё не опубликован`,
  'grid.legend': `Легенда`,
  'grid.legendOn': `есть`,
  'grid.legendOff': `откл.`,
  'grid.legendHalf': `полчаса`,
  'grid.theme': `Светлая/Тёмная`,
  'grid.darkAria': `Тёмная тема`,
  'kind.on': `есть`,
  'kind.off': `Откл.`,
  'kind.offFirst': `до :30`,
  'kind.offSecond': `с :30`,
  'kind.maybe': `Возм.`,
  'kind.unknown': `—`,
  'kindLabel.on': `свет есть`,
  'kindLabel.off': `отключение`,
  'kindLabel.offFirst': `отключение первые 30 минут`,
  'kindLabel.offSecond': `отключение вторые 30 минут`,
  'kindLabel.maybe': `возможно отключение`,
  'kindLabel.unknown': `нет данных`,

  'hist.title': `История отключений и событий`,
  'hist.viewAria': `Вид истории`,
  'hist.byDays': `По дням`,
  'hist.events': `События ({n})`,
  'hist.tomorrow': `Завтра`,
  'hist.today': `Сегодня`,
  'hist.yesterday': `Вчера`,
  'hist.notPublished': `График не опубликован`,
  'hist.noOutages': `Без отключений · 0 {h}`,
  'hist.noEvents': `Событий пока нет`,

  'addrs.title': `Адреса`,
  'addrs.used': `Использовано {n} из {max}`,
  'addrs.add': `Добавить`,
  'addrs.empty': `Пока нет ни одного адреса. Добавьте первый, чтобы получать уведомления.`,
  'addrs.openAria': `Открыть {label} на главной`,
  'addrs.notifyFor': `Уведомления для {label}`,
  'addrs.notifySettings': `Настройки уведомлений`,
  'addrs.beforeOff': `Предупредить до отключения`,
  'addrs.beforeOn': `Предупредить до включения`,
  'addrs.scheduleChange': `Изменения графика ДТЭК`,
  'addrs.emergency': `Аварийные отключения`,
  'addrs.confirmDelete': `Да, удалить`,
  'addrs.cancel': `Отмена`,
  'addrs.delete': `Удалить адрес`,
  'addrs.leadOff': `Откл.`,
  'addrs.limitReached': `Достигнут лимит адресов`,

  'sheet.title': `Новый адрес`,
  'sheet.close': `Закрыть`,
  'sheet.name': `Название`,
  'sheet.defaultName': `Дом`,
  'sheet.city': `Населённый пункт`,
  'sheet.cityPh': `Начните вводить, напр. Днепр`,
  'sheet.street': `Улица`,
  'sheet.streetPh': `Название улицы (необязательно)`,
  'sheet.house': `Дом`,
  'sheet.housesLoading': `Загрузка домов…`,
  'sheet.housePh': `Номер дома`,
  'sheet.dtekDown': `Сайт ДТЭК недоступен — просто выберите очередь ниже.`,
  'sheet.pickQueue': `Выберите очередь ниже.`,
  'sheet.queue': `Очередь`,
  'sheet.queueAuto': `Очередь определена автоматически по адресу. При необходимости измените её.`,
  'sheet.noQueueForHouse': `ДТЭК не вернул очередь для этого дома, выберите её вручную.`,
  'sheet.houseFilter': `Поиск дома`,
  'sheet.houseNone': `Дом не найден`,
  'sheet.change': `Изменить`,
  'sheet.options': `Варианты`,
  'sheet.needCityQueue': `Выберите город и очередь`,
  'sheet.limit': `Достигнут лимит бесплатных адресов.`,
  'sheet.saveFail': `Не удалось сохранить адрес`,
  'sheet.trialFail': `Не удалось активировать тестовый режим`,
  'sheet.invoiceFail': `Не удалось создать счёт`,
  'sheet.tryTrial': `Попробовать 3-й адрес на {n} {days} бесплатно`,
  'sheet.buySlot': `Купить +1 адрес за {n} звёзд`,
  'sheet.save': `Сохранить адрес`,

  'alerts.title': `Сообщения`,
  'alerts.linked': `Уведомления в Telegram включены`,
  'alerts.notLinked': `Telegram не подключён`,
  'alerts.linkedDesc': `Предупредим перед отключением и включением света по вашим адресам.`,
  'alerts.notLinkedDesc': `Нажмите /start в боте, чтобы получать личные уведомления.`,
  'alerts.test': `Тест уведомления`,
  'alerts.openBot': `Открыть бота`,
  'alerts.testSent': `Тестовое уведомление отправлено в Telegram`,
  'alerts.testNotDelivered': `Событие создано, но в Telegram не доставлено`,
  'alerts.recent': `Последние события ({n})`,
  'alerts.none': `Событий пока нет`,
  'alerts.demoTitle': `Тест уведомления`,
  'alerts.demoMsg': `Демо-режим: в Telegram сообщение не отправляется`,

  'set.title': `Настройки`,
  'set.dark': `Тёмная тема`,
  'set.quiet': `Тихие часы`,
  'set.quietDesc': `Без звука уведомлений в это время`,
  'set.from': `С`,
  'set.to': `До`,
  'set.starsOnlyTg': `Оплата звёздами доступна только в Telegram`,
  'set.paid': `Спасибо! Оплата зачислена.`,
  'set.proActive': `Pro активен`,
  'set.proTitle': `offonsvitlo Pro`,
  'set.proUntil': `Действует до {d}`,
  'set.proDesc': `До {n} {addr} и без рекламы · {p} ⭐ / {days}`,
  'set.proBuy': `Оформить Pro`,
  'set.donate': `Поддержать проект`,
  'set.donated': `Вы уже поддержали на {n} ⭐ — спасибо!`,
  'set.footer': `Данные: ДТЭК Днепровские электросети · обновлено {v}`,

  'perk.shareText': `Следи за отключениями света по графику ДТЭК:`,
  'perk.trialAria': `Тестовый режим`,
  'perk.trialActive': `Бонусный адрес активен`,
  'perk.trialUntil': `Действует до {d}`,
  'perk.trialLeft': `Остаток тестового периода`,
  'perk.trialTitle': `3-й адрес на {n} {days}`,
  'perk.trialDesc': `Тестовый режим: бесплатно добавьте ещё один адрес и проверьте уведомления. Активируется один раз.`,
  'perk.trialBtn': `Попробовать бесплатно`,
  'perk.refTitle': `Пригласить друга`,
  'perk.refDesc': `За каждого нового друга +1 адрес на {n} {days} (всего до {max} {maxDays}).`,
  'perk.loading': `Загрузка…`,
  'perk.copyAria': `Скопировать реферальную ссылку`,
  'perk.share': `Поделиться`,
  'perk.copy': `Копировать`,
  'perk.invited': `Приглашено:`,
  'perk.bonusUntil': `Бонус до {d}`,
  'perk.noBonus': `Бонуса пока нет`,
  'perk.onlyTg': `Реферальная ссылка доступна только в Telegram.`,
  'perk.copied': `Ссылка скопирована`,
  'perk.copyFail': `Не удалось скопировать`,
  'perk.sharedHint': `Ссылка скопирована. Если окно выбора чата не открылось, отправьте её вручную.`,

  'rem.title': `Напоминание`,
  'rem.tapHint': `Коснитесь часа, чтобы добавить напоминание`,
  'rem.cellSet': `, напоминание установлено`,
  'rem.cellTap': `, коснитесь, чтобы добавить напоминание`,
  'rem.when': `{day}, {from}–{to}`,
  'rem.lead': `Напомнить за`,
  'rem.leadNow': `В момент начала`,
  'rem.save': `Сохранить напоминание`,
  'rem.delete': `Удалить напоминание`,
  'rem.exists': `Напоминание уже установлено, при необходимости измените время.`,
  'rem.tgHint': `Напоминания приходят в Telegram-бот. Нажмите /start в боте, чтобы подключить.`,
  'rem.past': `Это время уже прошло`,
  'rem.limit': `Достигнут лимит напоминаний (20)`,
  'rem.fail': `Не удалось сохранить напоминание`,
  'rem.demoNote': `Демо-режим: напоминания отправляться не будут`,
  'rem.listTitle': `Напоминания`,

  'ads.fallbackText': `Реклама не открылась?`,
  'ads.fallbackOpen': `Открыть`,
  'set.adsDebugOn': `Диагностика рекламы включена`,
  'set.adsDebugOff': `Диагностика рекламы выключена`,

  'reward.title': `Бесплатный 3-й адрес`,
  'reward.desc': `Посмотрите {goal} реклам за день, и 3-й адрес будет работать {n} {days}. Счётчик сбрасывается каждый день в 00:00.`,
  'reward.progress': `Сегодня просмотрено: {n} из {goal}`,
  'reward.watch': `Смотреть рекламу`,
  'reward.extend': `Продлить ещё на {n} {days}`,
  'reward.granted': `Готово! 3-й адрес активен ещё {n} {days}.`,
  'reward.adFail': `Реклама не загрузилась. Попробуйте ещё раз.`,
  'reward.tooFast': `Подождите несколько секунд перед следующей рекламой.`,
  'sheet.rewardHint': `Лимит адресов достигнут. Получите 3-й адрес за просмотр рекламы:`,
}

const DICT: Record<Lang, Record<Key, string>> = { uk, ru }

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  const s = DICT[lang]?.[key] ?? DICT.uk[key] ?? key
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export function normalizeLang(v: unknown): Lang {
  return typeof v === 'string' && /^ru/i.test(v) ? 'ru' : 'uk'
}

/** Предпочтение пользователя: выбранный язык, иначе язык Telegram (uk/ru), иначе пусто. */
export function clientPref(): string {
  try {
    const s = window.localStorage.getItem(LANG_KEY)
    if (s === 'uk' || s === 'ru') return s
    const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { language_code?: string } } } } })
      .Telegram?.WebApp?.initDataUnsafe?.user?.language_code
    if (tg && /^(uk|ru)/i.test(tg)) return tg.slice(0, 2).toLowerCase()
  } catch {}
  return ''
}

export function resolveLang(pref: string, serverLang?: string | null): Lang {
  if (pref === 'uk' || pref === 'ru') return pref
  return normalizeLang(serverLang)
}

const listeners = new Set<() => void>()
export function subscribeLang(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
export function setUiLang(l: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, l)
  } catch {}
  listeners.forEach((f) => f())
}

export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}

export function daysWord(lang: Lang, n: number) {
  return plural(n, lang === 'ru' ? ['день', 'дня', 'дней'] : ['день', 'дні', 'днів'])
}

export function addressesWord(lang: Lang, n: number) {
  return plural(n, lang === 'ru' ? ['адреса', 'адресов', 'адресов'] : ['адреси', 'адрес', 'адрес'])
}

/** «Черга 6.2» / «Очередь 6.2» из кода очереди GPV6.2 */
export function queueLabel(lang: Lang, queue: string) {
  return `${translate(lang, 'queue.word')} ${queue.replace(/^GPV/, '')}`
}
