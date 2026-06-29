export type MosqueReminderContext = 'dashboard' | 'imamContribution' | 'whatsapp' | 'receipt' | 'monthlyReport';

export type MosqueSpiritualReminder = {
  id: string;
  kind: 'quran' | 'douaa';
  reference: string;
  ar: string;
  contexts: MosqueReminderContext[];
};

export const mosqueSpiritualReminders: MosqueSpiritualReminder[] = [
  {
    id: 'maidah-2',
    kind: 'quran',
    reference: 'سورة المائدة - 2',
    ar: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾',
    contexts: ['dashboard', 'whatsapp', 'monthlyReport'],
  },
  {
    id: 'baqara-245',
    kind: 'quran',
    reference: 'سورة البقرة - 245',
    ar: '﴿ مَنْ ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ ﴾',
    contexts: ['imamContribution', 'receipt'],
  },
  {
    id: 'baqara-261',
    kind: 'quran',
    reference: 'سورة البقرة - 261',
    ar: '﴿ مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾',
    contexts: ['dashboard', 'imamContribution', 'monthlyReport'],
  },
  {
    id: 'douaa-community',
    kind: 'douaa',
    reference: 'دعاء',
    ar: 'اللهم تقبل منا، وأصلح نياتنا، واجعل هذا العمل خالصا لوجهك الكريم.',
    contexts: ['dashboard', 'whatsapp', 'receipt', 'monthlyReport'],
  },
];
