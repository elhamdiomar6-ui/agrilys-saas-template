import { ArrowLeft, BookOpen, CircleDollarSign, EyeOff, FileText, HandHeart, Landmark, LockKeyhole, MessageCircle, Moon, ReceiptText, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import CardListenButton from '../components/CardListenButton';
import { buildDemoMosqueReport, emptyMosqueReport, mosqueDemoImam, mosqueDemoMode, mosqueDemoNotice, mosqueDemoStudents } from '../data/mosqueData';
import { mosqueSpiritualReminders, type MosqueSpiritualReminder } from '../data/mosqueSpiritualReminders';
import type { MosqueReport } from '../types/mosque';

type MosqueCopy = {
  back: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  internalOnly: string;
  dignityRule: string;
  spiritualTitle: string;
  spiritualDesc: string;
  quranLabel: string;
  douaaLabel: string;
  dashboardUse: string;
  imamContributionTitle: string;
  imamContributionDesc: string;
  usageTitle: string;
  usageDesc: string;
  whatsappTitle: string;
  whatsappText: string;
  receiptTitle: string;
  receiptText: string;
  monthlyReportTitle: string;
  monthlyReportText: string;
  transparencyTitle: string;
  transparencyDesc: string;
  expected: string;
  collected: string;
  paidToImam: string;
  remaining: string;
  households: string;
  paid: string;
  pending: string;
  exempted: string;
  publicSafety: string;
  imamTitle: string;
  imamDesc: string;
  childrenTitle: string;
  childrenDesc: string;
  reportsTitle: string;
  reportsDesc: string;
  privateTitle: string;
  privateDesc: string;
  demoOnly: string;
  monthlyHonorarium: string;
  quranTeaching: string;
};

const t: MosqueCopy = {
  back: 'رجوع',
  eyebrow: 'وحدة داخلية محترمة',
  title: 'المسجد والتعليم القرآني',
  subtitle: 'تنظيم هادئ لمساهمات الإمام والتعليم القرآني التقليدي للأطفال.',
  internalOnly: 'وحدة داخلية للمكتب والرئيس فقط',
  dignityRule: 'لا توجد بيانات حقيقية حاليا. لا يتم عرض أي معطيات خاصة أو مالية للعموم.',
  spiritualTitle: 'تذكير طيب',
  spiritualDesc: 'تذكيرات قصيرة تشجع الصدقة والتعاون ودعم الأطفال، بدون ضغط وبدون إحراج.',
  quranLabel: 'القرآن الكريم',
  douaaLabel: 'دعاء',
  dashboardUse: 'يعرض في لوحة المسجد',
  imamContributionTitle: 'مساهمات الإمام',
  imamContributionDesc: 'قسم داخلي لتسجيل الأداءات بعد اعتماد المكتب، مع احترام كرامة الأسر وحفظ السرية.',
  usageTitle: 'رسائل التذكير والتقارير',
  usageDesc: 'نفس التذكيرات يمكن استعمالها في رسائل واتساب، والوصولات، والتقارير الشهرية مع إظهار المرجع.',
  whatsappTitle: 'رسالة واتساب',
  whatsappText: 'تذكير لطيف: وتعاونوا على البر والتقوى. مساهمة هذا الشهر تدعم الإمام وتعليم الأطفال. تقبل الله من الجميع.',
  receiptTitle: 'وصل المساهمة',
  receiptText: 'نسأل الله أن يتقبل هذه المساهمة وأن يجعلها سببا للخير في الدوار. يظهر المرجع في الوصل.',
  monthlyReportTitle: 'التقرير الشهري',
  monthlyReportText: 'يبقى التقرير عاما: المبلغ المتوصل به، ما سلم للإمام، دعم الأطفال، وتذكير بالتعاون بدون أسماء حساسة.',
  transparencyTitle: 'الشفافية العامة',
  transparencyDesc: 'نظرة عامة للسكان بدون أسماء الأسر وبدون ملاحظات خاصة.',
  expected: 'إجمالي المساهمات',
  collected: 'المساهمات المستلمة',
  paidToImam: 'المبالغ المصروفة للإمام',
  remaining: 'حالة الشهر الحالية',
  households: 'الأسر المشاركة',
  paid: 'تم الأداء',
  pending: 'في الانتظار',
  exempted: 'الإعفاءات',
  publicSafety: 'لا يتم عرض أسماء الأسر في الانتظار أو المعفاة أو أي مشاكل مالية خاصة للعموم.',
  imamTitle: 'الإمام والتعليم القرآني',
  imamDesc: 'ملف مخصص لتتبع تاريخ الخدمة، واجبات الإمام الشهرية، والأطفال المشاركين في التعليم القرآني.',
  childrenTitle: 'الأطفال المشاركون',
  childrenDesc: 'تتبع بسيط للحضور والملاحظات العامة دون ترتيب محرج أو مقارنة بين الأطفال.',
  reportsTitle: 'التقارير',
  reportsDesc: 'تقرير شهري يشمل إجمالي المساهمات، إجمالي المصاريف، عدد الأسر المشاركة وعدد الإعفاءات.',
  privateTitle: 'فضاء داخلي محمي',
  privateDesc: 'الأداءات الفردية والملاحظات الداخلية وأسباب الإعفاء لا تظهر إلا للمكتب المخول.',
  demoOnly: 'لا تستعمل كبيانات حقيقية قبل اعتماد المكتب.',
  monthlyHonorarium: 'واجبات الإمام الشهرية',
  quranTeaching: 'التعليم القرآني',
};

function formatMoney(value: number) {
  return `${value.toLocaleString('fr-FR')} MAD`;
}

function StatCard({ label, value, tone = 'green' }: { label: string; value: string | number; tone?: 'green' | 'gold' | 'soft' }) {
  return (
    <div className={`mosque-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReminderCard({ reminder, label }: { reminder: MosqueSpiritualReminder; label: string }) {
  return (
    <article className="reminder-card">
      <div className="reminder-meta">
        <span>{label}</span>
        <strong>{reminder.reference}</strong>
      </div>
      <p className="reminder-ar" dir="rtl">{reminder.ar}</p>
    </article>
  );
}

function buildReport(): MosqueReport {
  return mosqueDemoMode ? buildDemoMosqueReport() : emptyMosqueReport;
}

export default function MosqueePage({ onBack }: { onBack: () => void }) {
  const report = buildReport();
  const dashboardReminders = mosqueSpiritualReminders.filter((item) => item.contexts.includes('dashboard'));
  const imamReminder = mosqueSpiritualReminders.find((item) => item.contexts.includes('imamContribution')) ?? mosqueSpiritualReminders[0];
  const whatsappReminder = mosqueSpiritualReminders.find((item) => item.contexts.includes('whatsapp')) ?? mosqueSpiritualReminders[0];
  const receiptReminder = mosqueSpiritualReminders.find((item) => item.contexts.includes('receipt')) ?? mosqueSpiritualReminders[0];
  const reportReminder = mosqueSpiritualReminders.find((item) => item.contexts.includes('monthlyReport')) ?? mosqueSpiritualReminders[0];

  return (
    <section className="panel mosque-page" dir="rtl">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>

      <div className="mosque-hero">
        <div className="mosque-mark"><Landmark size={34} /></div>
        <p className="badge mosque-badge"><Moon size={14} /> {t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="intro">{t.subtitle}</p>
      </div>

      <div className="production-state">
        <ShieldCheck size={20} />
        <div>
          <strong>{t.internalOnly}</strong>
          <span>{t.dignityRule}</span>
        </div>
      </div>

      <div className="mosque-section spiritual-section">
        <div className="section-heading">
          <Sparkles size={22} />
          <div>
            <h2>{t.spiritualTitle}</h2>
            <p>{t.spiritualDesc}</p>
          </div>
        </div>
        <div className="reminder-grid">
          {dashboardReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} label={reminder.kind === 'quran' ? t.quranLabel : t.douaaLabel} />
          ))}
        </div>
        <p className="privacy-note"><HandHeart size={18} /> {t.dashboardUse}</p>
      </div>

      <div className="mosque-section">
        <div className="section-heading">
          <HandHeart size={22} />
          <div>
            <h2>{t.transparencyTitle}</h2>
            <p>{t.transparencyDesc}</p>
          </div>
        </div>
        <div className="mosque-grid">
          <StatCard label={t.expected} value={formatMoney(report.totalExpected)} tone="gold" />
          <StatCard label={t.collected} value={formatMoney(report.totalCollected)} />
          <StatCard label={t.paidToImam} value={formatMoney(report.totalPaidToImam)} />
          <StatCard label={t.remaining} value={formatMoney(report.remaining)} tone="soft" />
          <StatCard label={t.households} value={report.householdsEligible} tone="soft" />
          <StatCard label={t.paid} value={report.householdsPaid} />
          <StatCard label={t.pending} value={report.householdsPending} tone="gold" />
          <StatCard label={t.exempted} value={report.householdsExempted} tone="soft" />
        </div>
        <p className="privacy-note"><EyeOff size={18} /> {t.publicSafety}</p>
      </div>

      <div className="mosque-section contribution-section">
        <div className="section-heading">
          <CircleDollarSign size={22} />
          <div>
            <h2>{t.imamContributionTitle}</h2>
            <p>{t.imamContributionDesc}</p>
          </div>
        </div>
        <ReminderCard reminder={imamReminder} label={imamReminder.kind === 'quran' ? t.quranLabel : t.douaaLabel} />
      </div>

      <div className="mosque-section usage-section">
        <div className="section-heading">
          <FileText size={22} />
          <div>
            <h2>{t.usageTitle}</h2>
            <p>{t.usageDesc}</p>
          </div>
        </div>
        <div className="usage-grid">
          <article>
            <MessageCircle size={21} />
            <h3>{t.whatsappTitle}</h3>
            <p>{t.whatsappText}</p>
            <CardListenButton text={`${t.whatsappTitle}. ${t.whatsappText}`} lang="ar" />
            <strong>{whatsappReminder.reference}</strong>
          </article>
          <article>
            <ReceiptText size={21} />
            <h3>{t.receiptTitle}</h3>
            <p>{t.receiptText}</p>
            <CardListenButton text={`${t.receiptTitle}. ${t.receiptText}`} lang="ar" />
            <strong>{receiptReminder.reference}</strong>
          </article>
          <article>
            <FileText size={21} />
            <h3>{t.monthlyReportTitle}</h3>
            <p>{t.monthlyReportText}</p>
            <CardListenButton text={`${t.monthlyReportTitle}. ${t.monthlyReportText}`} lang="ar" />
            <strong>{reportReminder.reference}</strong>
          </article>
        </div>
      </div>

      <div className="mosque-section internal-preview">
        <div className="section-heading">
          <LockKeyhole size={22} />
          <div>
            <h2>{t.privateTitle}</h2>
            <p>{t.privateDesc}</p>
          </div>
        </div>
        <p className="demo-note">{mosqueDemoNotice}. {t.demoOnly}</p>
        <div className="internal-cards">
          <article>
            <CircleDollarSign size={22} />
            <h3>{t.imamTitle}</h3>
            <p>{t.imamDesc}</p>
            <CardListenButton text={`${t.imamTitle}. ${t.imamDesc}`} lang="ar" />
            <strong>{t.monthlyHonorarium}: {mosqueDemoMode ? formatMoney(mosqueDemoImam.monthlyHonorarium) : formatMoney(0)}</strong>
          </article>
          <article>
            <BookOpen size={22} />
            <h3>{t.childrenTitle}</h3>
            <p>{t.childrenDesc}</p>
            <CardListenButton text={`${t.childrenTitle}. ${t.childrenDesc}`} lang="ar" />
            <strong>{t.quranTeaching}: {mosqueDemoMode ? mosqueDemoStudents.length : 0}</strong>
          </article>
          <article>
            <FileText size={22} />
            <h3>{t.reportsTitle}</h3>
            <p>{t.reportsDesc}</p>
            <CardListenButton text={`${t.reportsTitle}. ${t.reportsDesc}`} lang="ar" />
            <strong>{report.month}/{report.year}</strong>
          </article>
          <article>
            <UsersRound size={22} />
            <h3>{t.households}</h3>
            <p>{t.publicSafety}</p>
            <CardListenButton text={`${t.households}. ${t.publicSafety}`} lang="ar" />
            <strong>{report.householdsEligible}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}
