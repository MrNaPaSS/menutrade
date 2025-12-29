export interface PromoCode {
  id: string;
  code: string;
  bonus: string;
  minDeposit: string;
  description?: string;
  registrationUrl: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface LevelInfo {
  id: number;
  name: string;
  title: string;
  description: string;
  features: string[];
  actions: {
    label: string;
    url: string;
    type: 'link' | 'button';
  }[];
}

export const promoCodes: PromoCode[] = [
  {
    id: 'welcome50',
    code: 'WELCOME50',
    bonus: '+50%',
    minDeposit: '$20',
    description: 'Бонус на первый депозит',
    registrationUrl: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50'
  },
  {
    id: '50start',
    code: '50START',
    bonus: '+50%',
    minDeposit: '$50',
    description: 'Стартовый бонус',
    registrationUrl: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=50START'
  },
  {
    id: 'ouj012',
    code: 'OUJ012',
    bonus: '+60%',
    minDeposit: '$50',
    description: 'Увеличенный бонус',
    registrationUrl: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=OUJ012'
  },
  {
    id: 'denchik60',
    code: 'DENCHIK60',
    bonus: 'Промо от Дэнчика',
    minDeposit: '$50',
    description: 'Специальный промокод',
    registrationUrl: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=DENCHIK60'
  },
  {
    id: 'vdn436',
    code: 'VDN436',
    bonus: 'BlackMirror Ultra TEST',
    minDeposit: '$100',
    description: 'Тестовый доступ к индикатору',
    registrationUrl: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=VDN436'
  }
];

export const faqItems: FAQItem[] = [
  {
    id: 'how-to-start',
    question: 'Как начать?',
    answer: 'Для начала работы вам необходимо зарегистрироваться на торговой платформе PocketOptions, используя один из доступных промокодов. После регистрации вы получите доступ к бесплатным сигналам (Level 1). Для получения доступа к более высоким уровням свяжитесь с менеджером.'
  },
  {
    id: 'existing-account',
    question: 'У меня уже есть аккаунт',
    answer: 'Если у вас уже есть аккаунт на PocketOptions, вы можете использовать его для доступа к бесплатным сигналам. Для получения доступа к PRO, MENTOR или ELITE уровням свяжитесь с менеджером для активации подписки.'
  },
  {
    id: 'get-indicator',
    question: 'Как получить индикатор?',
    answer: 'Индикатор BlackMirror Ultra доступен для пользователей уровня PRO и выше. После получения доступа к уровню PRO, вы сможете установить индикатор на TradingView. Ссылка на индикатор будет предоставлена после активации подписки.'
  }
];

export const levels: LevelInfo[] = [
  {
    id: 1,
    name: 'FREE',
    title: 'Level 1 (FREE)',
    description: 'Бесплатные торговые сигналы для начинающих трейдеров',
    features: [
      'Доступ к бесплатным торговым сигналам',
      'Базовая информация о рынке',
      'Обучение основам трейдинга'
    ],
    actions: [
      {
        label: 'Посмотреть в действии',
        url: 'https://t.me/NeKnopkaBabl0/a/6',
        type: 'link'
      },
      {
        label: 'Получить доступ',
        url: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50',
        type: 'button'
      }
    ]
  },
  {
    id: 2,
    name: 'PRO',
    title: 'Level 2 (PRO)',
    description: 'Софт и индикаторы для профессиональной торговли',
    features: [
      'Доступ к индикатору BlackMirror Ultra',
      'Расширенные торговые сигналы',
      'Примеры использования в канале',
      'Поддержка менеджера'
    ],
    actions: [
      {
        label: 'Black Mirror Ultra',
        url: 'https://ru.tradingview.com/script/3eVmzktt-black-mirror-predictor/',
        type: 'link'
      },
      {
        label: 'Посмотреть в действии',
        url: 'https://t.me/NeKnopkaBabl0/a/5',
        type: 'link'
      }
    ]
  },
  {
    id: 3,
    name: 'MENTOR',
    title: 'Level 3 (MENTOR)',
    description: 'Персональное менторство и обучение',
    features: [
      'Персональное менторство',
      'Индивидуальные консультации',
      'Разбор ваших сделок',
      'Стратегии управления капиталом'
    ],
    actions: []
  },
  {
    id: 4,
    name: 'ELITE',
    title: 'Level 4 (ELITE)',
    description: 'Закрытый канал и Live-торговля',
    features: [
      'Доступ к закрытому каналу',
      'Live-торговля с ментором',
      'Эксклюзивные стратегии',
      'Приоритетная поддержка'
    ],
    actions: []
  }
];

export const platformLinks = {
  pocketOptions: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50',
  blackMirrorUltra: 'https://ru.tradingview.com/script/3eVmzktt-black-mirror-predictor/',
  channel: 'https://t.me/+avD8ncMHBp4zMzhi'
};

