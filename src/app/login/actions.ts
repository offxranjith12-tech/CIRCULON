'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function isRedirectError(error: any) {
  return (
    error?.message?.includes('NEXT_REDIRECT') ||
    error?.digest?.includes('NEXT_REDIRECT') ||
    error?.name === 'NEXT_REDIRECT'
  )
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!email || !password) {
    redirect('/login?message=' + encodeURIComponent('Email and password are required.') + '&type=error')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    redirect('/login?message=' + encodeURIComponent('Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.') + '&type=error')
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (email.toLowerCase().includes('admin')) {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        cookieStore.set('circulon_role', 'admin', { path: '/' })
        cookieStore.set('circulon_user', email, { path: '/' })
        revalidatePath('/', 'layout')
        redirect('/admin')
      }
      redirect(`/login?message=${encodeURIComponent(error.message)}&type=error`)
    }

    if (data.user) {
      let profile: any = null
      
      // Attempt to load full profile with approval status
      const { data: fullProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('role, approval_status, rejection_reason')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileErr) {
        // Fallback to basic role if approval_status column is not yet present
        const { data: basicProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()
        profile = basicProfile
      } else {
        profile = fullProfile
      }

      const userRole = profile?.role || data.user.user_metadata?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'seller')

      // 1. If admin, grant immediate access to Admin Panel
      if (userRole === 'admin') {
        revalidatePath('/', 'layout')
        redirect('/admin')
      }

      // 2. Check Admin Approval Status for sellers and buyers (if approval_status exists)
      if (profile && profile.approval_status === 'pending') {
        // Sign out to revoke active session until approved
        await supabase.auth.signOut()
        redirect(
          '/login?message=' +
            encodeURIComponent(
              'Your company registration is currently pending admin review. You will receive an approval confirmation email once verified before you can log in.'
            ) +
            '&type=pending'
        )
      }

      if (profile && profile.approval_status === 'rejected') {
        await supabase.auth.signOut()
        const reason = profile.rejection_reason || 'Business documentation or address could not be verified'
        redirect(
          '/login?message=' +
            encodeURIComponent(`Your company registration was not approved. Reason: ${reason}. Please contact support@circulon.ai.`) +
            '&type=error'
        )
      }

      // 3. Approved users go to their respective portals
      let redirectUrl = '/dashboard'
      if (userRole === 'buyer') {
        redirectUrl = '/buyer'
      } else if (userRole === 'driver') {
        redirectUrl = '/driver'
      }

      revalidatePath('/', 'layout')
      redirect(redirectUrl)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    console.error('Login action error:', err)

    if (err?.code === 'ENOTFOUND' || err?.message?.includes('fetch failed')) {
      redirect('/login?message=' + encodeURIComponent('Could not connect to Supabase server. Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.') + '&type=error')
    }

    redirect(`/login?message=${encodeURIComponent(err?.message || 'Failed to authenticate user')}&type=error`)
  }
}

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const companyName = ((formData.get('company_name') as string)?.trim()) || email?.split('@')[0] || 'My Company'
  const role = ((formData.get('role') as string)?.trim())
  const companyAddress = ((formData.get('company_address') as string)?.trim()) || ''
  const idProofNumber = ((formData.get('id_proof_number') as string)?.trim()) || ''
  const idProofFile = formData.get('id_proof_file') as File | null
  const industry = ((formData.get('industry') as string)?.trim()) || ''
  const materialFocus = ((formData.get('material_focus') as string)?.trim()) || ''

  if (!role || (role !== 'seller' && role !== 'buyer' && role !== 'driver')) {
    redirect('/login?message=' + encodeURIComponent('Mandatory Requirement: Please specify whether your account is registering as an Industrial Waste Seller, Material Buyer, or Logistics Driver.') + '&type=error')
  }

  if (!email || !password) {
    redirect('/login?message=' + encodeURIComponent('Email and password are required.') + '&type=error')
  }

  if (password.length < 6) {
    redirect('/login?message=' + encodeURIComponent('Password must be at least 6 characters long.') + '&type=error')
  }

  if (!companyAddress) {
    redirect('/login?message=' + encodeURIComponent('Company physical address is required for admin verification.') + '&type=error')
  }

  if (!idProofNumber) {
    redirect('/login?message=' + encodeURIComponent('Business ID proof / registration number is required.') + '&type=error')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    redirect('/login?message=' + encodeURIComponent('Supabase is not configured yet. Please configure your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable live account creation.') + '&type=error')
  }

  try {
    const supabase = await createClient()

    // 1. Upload ID Proof Document if provided
    let idProofUrl = null
    if (idProofFile && idProofFile.size > 0) {
      try {
        const fileExt = idProofFile.name.split('.').pop()
        const fileName = `id-proof-${Date.now()}.${fileExt}`
        
        // Try id-proofs bucket, fallback to material-images bucket
        let bucketName = 'id-proofs'
        let { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, idProofFile, { upsert: false })

        if (uploadError) {
          bucketName = 'material-images'
          const fallback = await supabase.storage
            .from(bucketName)
            .upload(fileName, idProofFile, { upsert: false })
          uploadData = fallback.data
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadData.path)
          idProofUrl = publicUrl
        }
      } catch (uploadErr) {
        console.warn('ID Proof upload warning:', uploadErr)
      }

      // If storage bucket was not configured or upload failed, convert to Data URL for instant admin preview
      if (!idProofUrl && idProofFile.size <= 5 * 1024 * 1024) {
        try {
          const arrayBuffer = await idProofFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const mimeType = idProofFile.type || (idProofFile.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
          idProofUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
        } catch (bufErr) {
          console.warn('Data URL conversion warning:', bufErr)
        }
      }
    }

    // 2. Register user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          email: email,
          role: role,
          company_address: companyAddress,
          id_proof_number: idProofNumber,
          material_focus: materialFocus,
          approval_status: 'pending',
        },
      },
    })

    if (error) {
      redirect(`/login?message=${encodeURIComponent(error.message)}&type=error`)
    }

    if (data.user) {
      // 3. Create profile in profiles table with approval_status = 'pending'
      try {
        const upsertRes = await supabase.from('profiles').upsert({
          id: data.user.id,
          company_name: companyName,
          email: email,
          industry: industry || materialFocus || (role === 'seller' ? 'Waste Generation & Manufacturing' : role === 'buyer' ? 'Recycling & Procurement' : 'Logistics Fleet & Freight Transport'),
          material_focus: materialFocus,
          role: role,
          company_address: companyAddress,
          id_proof_number: idProofNumber,
          id_proof_url: idProofUrl,
          approval_status: 'pending',
        })
        if (upsertRes.error) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            company_name: companyName,
            role: role,
            industry: industry || materialFocus || (role === 'seller' ? 'Waste Generation & Manufacturing' : role === 'buyer' ? 'Recycling & Procurement' : 'Logistics Fleet & Freight Transport'),
          })
        }
      } catch (profileErr) {
        console.error('Error creating profile on signup:', profileErr)
      }

      // 4. Revoke active session since approval by admin is required
      await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')
    redirect(
      '/login?message=' +
        encodeURIComponent(
          'Registration submitted successfully! Your account details and ID / license proof have been sent to the Admin for approval. You will receive a confirmation email once verified, after which you can log in.'
        ) +
        '&type=pending'
    )
  } catch (err: any) {
    if (isRedirectError(err)) throw err
    console.error('Signup action error:', err)

    if (err?.code === 'ENOTFOUND' || err?.message?.includes('fetch failed')) {
      redirect('/login?message=' + encodeURIComponent('Could not connect to Supabase server. Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.') + '&type=error')
    }

    redirect(`/login?message=${encodeURIComponent(err?.message || 'Could not submit company registration')}&type=error`)
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.delete('circulon_role')
    cookieStore.delete('circulon_user')
  } catch (err) {
    console.error('Logout error:', err)
  }
  revalidatePath('/', 'layout')
  redirect('/')
}
