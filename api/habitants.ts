import {
  authenticatedUser,
  bearerToken,
  createAdminClient,
  formatMoroccanPhone,
  generatePin,
  hashPin,
  normalizeMoroccanPhone,
  randomAccountPassword,
  requestBody,
  requestIp,
  serverConfigured,
  syntheticEmailForPhone,
  verifiedStaff,
  verifyPin,
  type VercelRequest,
  type VercelResponse,
} from '../server/habitantAuth.js';
import { checkLoginRateLimit, recordFailedLogin, clearLoginAttempts } from '../server/upstashRateLimit.js';
import {
  HabitantActionSchema,
  ApproveHabitantSchema,
  RejectHabitantSchema,
  RecommendHabitantSchema,
  LoginHabitantSchema,
  UpdateProfileSchema,
  ProfileSchema,
} from '../server/validationSchemas.js';

import { z } from 'zod';
type HabitantAction =
  | 'approve'
  | 'reject'
  | 'recommend'
  | 'login'
  | 'profile'
  | 'update-profile';

type HabitantBody = {
  action?: HabitantAction;
  requestId?: string;
  phone?: string;
  pin?: string;
  addressInVillage?: string;
};

function genericLoginError(res: VercelResponse) {
  return res.status(401).json({ error: 'Numéro ou code PIN incorrect.' });
}

async function findAuthUserByEmail(admin: any, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const found = data.users.find((user: { email?: string }) => user.email === email);
    if (found) return found;
    if (data.users.length < 100) break;
  }
  return null;
}

async function ensureAuthUser(
  admin: any,
  email: string,
  phone: string,
  fullName: string,
) {
  const existing = await findAuthUserByEmail(admin, email);
  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      email_confirm: true,
      app_metadata: { ...(existing.app_metadata || {}), role: 'habitant' },
      user_metadata: { ...(existing.user_metadata || {}), phone, full_name: fullName },
    });
    if (error || !data.user) throw error || new Error('Compte Auth introuvable.');
    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomAccountPassword(),
    email_confirm: true,
    app_metadata: { role: 'habitant' },
    user_metadata: { phone, full_name: fullName },
  });
  if (error || !data.user) throw error || new Error('Création du compte Auth impossible.');
  return data.user;
}

async function approveRegistration(
  body: Partial<HabitantBody>,
  req: VercelRequest,
  res: VercelResponse,
) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Session Bureau ou Président requise.' });
  const admin = createAdminClient();
  const staff = await verifiedStaff(token, admin);
  if (!staff) return res.status(403).json({ error: 'Accès réservé au Bureau et au Président.' });

  const requestId = String(body.requestId || '');
  if (!requestId) return res.status(400).json({ error: 'Demande d’inscription manquante.' });

  const { data: registration, error: requestError } = await admin
    .from('registration_requests')
    .select('id,full_name,phone,relationship_to_village,requested_status,status,organization_id,village_id')
    .eq('id', requestId)
    .maybeSingle();

  if (requestError) return res.status(500).json({ error: requestError.message });
  if (!registration) return res.status(404).json({ error: 'Demande introuvable.' });
  if (registration.status === 'rejected' || registration.status === 'archived') {
    return res.status(409).json({ error: 'Cette demande ne peut pas être approuvée.' });
  }

  const phone = normalizeMoroccanPhone(registration.phone || '');
  if (!phone) return res.status(400).json({ error: 'Le numéro doit être un mobile marocain valide.' });

  const pin = generatePin();
  const pinHash = hashPin(pin);
  const pinExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const technicalEmail = syntheticEmailForPhone(phone);

  try {
    const authUser = await ensureAuthUser(admin, technicalEmail, phone, registration.full_name);
    const organizationId = registration.organization_id || staff.profile?.organization_id || null;
    const villageId = registration.village_id || staff.profile?.village_id || null;

    const { data: duplicateProfiles, error: duplicateError } = await admin
      .from('user_profiles')
      .select('id,user_id')
      .eq('phone', phone)
      .limit(2);
    if (duplicateError) throw duplicateError;
    if ((duplicateProfiles || []).some((profile) => profile.user_id && profile.user_id !== authUser.id)) {
      return res.status(409).json({ error: 'Ce numéro est déjà associé à un autre compte.' });
    }
    const reusableProfile = (duplicateProfiles || []).find((profile) => profile.user_id === authUser.id)
      || ((duplicateProfiles || []).length === 1 && !duplicateProfiles?.[0]?.user_id ? duplicateProfiles[0] : null);

    const profilePayload = {
      user_id: authUser.id,
      organization_id: organizationId,
      village_id: villageId,
      full_name: registration.full_name,
      phone,
      role: 'habitant',
      status: 'active',
      visibility: 'private',
      membership_status: 'active',
      pin_code: pinHash,
      pin_expires_at: pinExpiresAt,
      updated_by: staff.user.id,
    };

    const profileQuery = reusableProfile
      ? admin
        .from('user_profiles')
        .update(profilePayload)
        .eq('id', reusableProfile.id)
        .select('id,organization_id,village_id')
        .single()
      : admin
        .from('user_profiles')
        .upsert({ ...profilePayload, created_by: staff.user.id }, { onConflict: 'user_id' })
        .select('id,organization_id,village_id')
        .single();
    const { data: profile, error: profileError } = await profileQuery;
    if (profileError || !profile) throw profileError || new Error('Profil habitant non créé.');

    const { data: activeRole, error: roleReadError } = await admin
      .from('role_assignments')
      .select('id')
      .eq('user_profile_id', profile.id)
      .eq('role', 'habitant')
      .eq('status', 'active')
      .maybeSingle();
    if (roleReadError) throw roleReadError;
    if (!activeRole) {
      const { error: roleError } = await admin.from('role_assignments').insert({
        user_profile_id: profile.id,
        organization_id: profile.organization_id,
        village_id: profile.village_id,
        role: 'habitant',
        status: 'active',
        assigned_by: staff.user.id,
        created_by: staff.user.id,
      });
      if (roleError) throw roleError;
    }

    const { error: registrationError } = await admin
      .from('registration_requests')
      .update({
        status: 'approved',
        decided_by: staff.user.id,
        decided_at: new Date().toISOString(),
        decision_note: 'Compte habitant créé avec PIN temporaire.',
        organization_id: organizationId,
        village_id: villageId,
        updated_by: staff.user.id,
      })
      .eq('id', registration.id);
    if (registrationError) throw registrationError;

    const whatsappMessage = `مرحبا ${registration.full_name}،\n\nتم قبول طلب انضمامك لجمعية أكادير نتغيدة.\nكود الدخول الخاص بك: ${pin}\n\nيرجى عدم مشاركة هذا الكود مع أحد.\nصلاحية الكود: 30 يوم.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;

    // PIN is NOT returned to the response - only in the WhatsApp message
    return res.status(200).json({
      whatsappMessage,
      whatsappUrl,
      phone: formatMoroccanPhone(phone),
      phoneRaw: phone,
      fullName: registration.full_name,
      regenerated: (registration.status as string) === ‘approved’,
    });
  } catch (error) {
    console.error('Habitant approval failed:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Création du compte habitant impossible.',
    });
  }
}

async function rejectRegistration(
  body: Partial<HabitantBody>,
  req: VercelRequest,
  res: VercelResponse,
) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Session Bureau ou Président requise.' });
  const admin = createAdminClient();
  const staff = await verifiedStaff(token, admin);
  if (!staff) return res.status(403).json({ error: 'Accès réservé au Bureau et au Président.' });

  const requestId = String(body.requestId || '');
  if (!requestId) return res.status(400).json({ error: 'Demande d’inscription manquante.' });
  const { data, error } = await admin
    .from('registration_requests')
    .update({
      status: 'rejected',
      decided_by: staff.user.id,
      decided_at: new Date().toISOString(),
      decision_note: 'Demande refusée par le Bureau.',
      updated_by: staff.user.id,
    })
    .eq('id', requestId)
    .in('status', ['pending', 'under_review'])
    .select('id')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(409).json({ error: 'Cette demande a déjà été traitée.' });
  return res.status(200).json({ rejected: true });
}

async function recommendRegistration(
  body: Partial<HabitantBody>,
  req: VercelRequest,
  res: VercelResponse,
) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Session Bureau requise.' });
  const admin = createAdminClient();
  const staff = await verifiedStaff(token, admin);
  if (!staff) return res.status(403).json({ error: 'Accès réservé au Bureau.' });

  const requestId = String(body.requestId || '');
  if (!requestId) return res.status(400).json({ error: 'Demande d\'inscription manquante.' });
  const { data, error } = await admin
    .from('registration_requests')
    .update({ status: 'under_review', updated_by: staff.user.id })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(409).json({ error: 'Cette demande a déjà été traitée ou n\'est plus en attente.' });
  return res.status(200).json({ recommended: true });
}

async function loginWithPin(body: Partial<HabitantBody>, req: VercelRequest, res: VercelResponse) {
  const phone = normalizeMoroccanPhone(String(body.phone || ''));
  const pin = String(body.pin || '');
  if (!phone || !/^\d{4}$/.test(pin)) return genericLoginError(res);

  const attemptKey = `${requestIp(req)}:${phone}`;

  try {
    const allowed = await checkLoginRateLimit(attemptKey);
    if (!allowed) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
    }
  } catch (redisError) {
    console.warn('Rate limit check failed, continuing:', redisError);
  }

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from('user_profiles')
    .select('id,user_id,full_name,phone,status,membership_status,pin_code,pin_expires_at')
    .eq('phone', phone)
    .limit(2);

  const profile = profiles?.length === 1 ? profiles[0] : null;
  const valid = !error
    && profile?.user_id
    && profile.status === 'active'
    && profile.membership_status === 'active'
    && profile.pin_expires_at
    && new Date(profile.pin_expires_at).getTime() > Date.now()
    && verifyPin(pin, profile.pin_code);

  if (!valid) {
    try {
      await recordFailedLogin(attemptKey);
    } catch (redisError) {
      console.warn('Failed login recording failed, continuing:', redisError);
    }
    return genericLoginError(res);
  }

  const { data: authData, error: authError } = await admin.auth.admin.getUserById(profile.user_id);
  const email = authData.user?.email;
  if (authError || !email) return res.status(500).json({ error: 'Compte habitant incomplet. Contactez le Bureau.' });

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    console.error('Habitant session link failed:', linkError);
    return res.status(500).json({ error: 'Création de la session impossible.' });
  }

  try {
    await clearLoginAttempts(attemptKey);
  } catch (redisError) {
    console.warn('Clear login attempts failed, continuing:', redisError);
  }

  return res.status(200).json({
    tokenHash: linkData.properties.hashed_token,
    fullName: profile.full_name,
  });
}

async function requireHabitant(req: VercelRequest, res: VercelResponse) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Session habitant requise.' });
    return null;
  }
  const user = await authenticatedUser(token);
  if (!user) {
    res.status(401).json({ error: 'Session expirée.' });
    return null;
  }
  return user;
}

async function readHabitantProfile(req: VercelRequest, res: VercelResponse) {
  const user = await requireHabitant(req, res);
  if (!user) return;
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from('user_profiles')
    .select('id,full_name,phone,status,membership_status,address_in_village,birth_date,gender,household_id,pin_expires_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!profile) return res.status(404).json({ error: 'Profil habitant introuvable.' });

  const [{ data: reports }, { data: cotisationRows }] = await Promise.all([
    admin
      .from('resident_reports')
      .select('id,category,level,description,status,created_at,updated_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('cotisation_foyers')
      .select('id,telephone,statut,notes')
      .limit(500),
  ]);

  const cotisation = (cotisationRows || []).find((row) => normalizeMoroccanPhone(row.telephone || '') === profile.phone);
  let cotisationStatus = 'a_verifier';
  if (cotisation?.notes) {
    try {
      const notes = JSON.parse(cotisation.notes) as { status?: string };
      if (typeof notes.status === 'string') cotisationStatus = notes.status;
    } catch {
      cotisationStatus = cotisation.statut === 'actif' ? 'a_verifier' : 'inactif';
    }
  }

  return res.status(200).json({
    profile: {
      ...profile,
      phone: formatMoroccanPhone(profile.phone),
      cotisationStatus,
    },
    reports: reports || [],
  });
}

async function updateHabitantProfile(
  body: Partial<HabitantBody>,
  req: VercelRequest,
  res: VercelResponse,
) {
  const user = await requireHabitant(req, res);
  if (!user) return;
  const phone = normalizeMoroccanPhone(String(body.phone || ''));
  const address = String(body.addressInVillage || '').trim();
  if (!phone) return res.status(400).json({ error: 'Numéro de téléphone marocain invalide.' });
  if (address.length > 300) return res.status(400).json({ error: 'Adresse trop longue.' });

  const admin = createAdminClient();
  const { data: duplicate } = await admin
    .from('user_profiles')
    .select('user_id')
    .eq('phone', phone)
    .neq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (duplicate) return res.status(409).json({ error: 'Ce numéro est déjà utilisé.' });

  const { error } = await admin
    .from('user_profiles')
    .update({
      phone,
      address_in_village: address || null,
      updated_by: user.id,
    })
    .eq('user_id', user.id);
  if (error) return res.status(500).json({ error: error.message });

  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...(user.user_metadata || {}), phone },
  });
  return res.status(200).json({ phone: formatMoroccanPhone(phone), addressInVillage: address });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!serverConfigured()) return res.status(500).json({ error: 'Configuration Supabase serveur incomplète.' });

  const body = requestBody<HabitantBody>(req.body);
  // Validate action field
  const actionResult = HabitantActionSchema.safeParse(body.action);
  if (!actionResult.success) {
    return res.status(400).json({ error: 'Action habitant invalide.' });
  }

  try {
  switch (body.action) {
    case 'approve':
      return approveRegistration(body, req, res);
    case 'reject':
      return rejectRegistration(body, req, res);
    case 'recommend':
      return recommendRegistration(body, req, res);
    case 'login':
      return loginWithPin(body, req, res);
    case 'profile':
      return readHabitantProfile(req, res);
    case 'update-profile':
      return updateHabitantProfile(body, req, res);
    default:
      return res.status(400).json({ error: 'Action habitant invalide.' });
  }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: `Validation error: ${messages}` });
    }
    throw error;
  }
}

