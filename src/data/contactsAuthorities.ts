import type { InternalContact } from '../types/contactsAuthorities';

export const contactsAuthoritiesStorageKey = 'agadirnetguida.contactsAuthorities.v1';

const today = new Date().toISOString().slice(0, 10);

export const initialInternalContacts: InternalContact[] = [
  {
    id: 'CNT-001',
    name: 'عمالة إقليم سيدي إفني',
    role: 'عمالة إقليم',
    organization: 'عمالة إقليم سيدي إفني',
    category: 'local_authority',
    phone: '',
    whatsapp: '',
    email: '',
    address: 'ساحة الحسن الثاني، سيدي إفني',
    zone: 'إقليم سيدي إفني',
    associationRelation: 'الجهة الإدارية المشرفة على الإقليم',
    priority: 'urgent',
    nextAction: 'التواصل مع مصلحة الشؤون الجمعوية لمعرفة المتطلبات الإدارية.',
    nextActionDate: today,
    notes: 'لا تدخل أي معطيات شخصية أو وثائق رسمية في هذا الكرنيت.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CNT-002',
    name: 'جماعة بوطروش',
    role: 'جماعة ترابية',
    organization: 'جماعة بوطروش',
    category: 'commune',
    phone: '',
    whatsapp: '',
    email: '',
    address: 'مقر الجماعة، بوطروش، إقليم سيدي إفني',
    zone: 'جماعة بوطروش',
    associationRelation: 'الجماعة الترابية التي ينتمي إليها الدوار',
    priority: 'high',
    nextAction: 'التواصل مع الرئيس أو الكاتب العام للجماعة لتسليم الملف الإداري.',
    nextActionDate: today,
    notes: 'لا تدخل وثائق رسمية أو معطيات حساسة في هذا السجل.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CNT-003',
    name: 'قيادة تيغيرت',
    role: 'قائد',
    organization: 'قيادة تيغيرت',
    category: 'local_authority',
    phone: '',
    whatsapp: '',
    email: '',
    address: 'تيغيرت، إقليم سيدي إفني',
    zone: 'تيغيرت',
    associationRelation: 'القيادة المسؤولة على المنطقة الإدارية للدوار',
    priority: 'medium',
    nextAction: 'تأكيد القائد المسؤول وتحديد موعد لتسليم وثائق الجمعية.',
    nextActionDate: today,
    notes: 'راجع الجهة الرسمية قبل أي إرسال.',
    updatedAt: new Date().toISOString(),
  },
];

export function readInternalContacts(): InternalContact[] {
  const stored = localStorage.getItem(contactsAuthoritiesStorageKey);
  if (!stored) return initialInternalContacts;
  try {
    return JSON.parse(stored) as InternalContact[];
  } catch {
    return initialInternalContacts;
  }
}

export function saveInternalContacts(contacts: InternalContact[]) {
  localStorage.setItem(contactsAuthoritiesStorageKey, JSON.stringify(contacts));
}
