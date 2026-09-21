'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUserSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return {
    email: user.email,
    id: user.id,
    profile: profile || {
      company_name: user.user_metadata?.company_name || 'My Company',
      role: user.user_metadata?.role || (user.email?.includes('admin') ? 'admin' : 'seller'),
      approval_status: 'approved',
      industry: '',
      phone: '',
      company_address: '',
      id_proof_number: '',
    }
  };
}

export async function updateProfileSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User is not authenticated' };
  }

  const companyName = (formData.get('company_name') as string)?.trim();
  const industry = (formData.get('industry') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const companyAddress = (formData.get('company_address') as string)?.trim();
  const idProofNumber = (formData.get('id_proof_number') as string)?.trim();

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        company_name: companyName,
        industry,
        phone,
        company_address: companyAddress,
        id_proof_number: idProofNumber,
      });

    if (error) {
      // Fallback if some columns don't exist
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          company_name: companyName,
        });
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/buyer');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update profile' };
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const newPassword = (formData.get('new_password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password' };
  }
}
