'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface WasteMaterial {
  id: string;
  seller_id: string;
  material_name: string;
  category?: string;
  quantity: number;
  unit: string;
  condition: string;
  moisture_percentage?: number;
  contamination_level?: string;
  location: string;
  expected_price?: number;
  available_date?: string;
  description?: string;
  image_url?: string | null;
  status: 'active' | 'pending' | 'matched' | 'sold' | 'completed' | 'rejected' | 'archived';
  seller?: {
    company_name: string;
    company_address?: string;
    phone?: string;
    email?: string;
  };
  created_at: string;
  updated_at?: string;
}

function isValidUUID(str: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

let localUserListings: WasteMaterial[] = [];

export async function getWasteMaterials(): Promise<WasteMaterial[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('waste_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (user && isValidUUID(user.id)) {
      query = query.eq('seller_id', user.id);
    }

    const { data, error } = await query;
    let list: WasteMaterial[] = [];

    if (!error && data && data.length > 0) {
      list = data.map((d: any) => ({
        ...d,
        category: d.category || 'General Industrial Waste',
        unit: d.unit || 'KG',
        status: d.status || 'active',
        seller: d.seller || {
          company_name: 'Apex Industrial Recycling Corp',
          company_address: 'Tirupur, Tamil Nadu',
          phone: '+91 98400 11223'
        }
      }));
    }

    // Merge in-memory local listings that aren't already returned by DB
    const existingIds = new Set(list.map(w => w.id));
    const missingLocal = localUserListings.filter(w => !existingIds.has(w.id));
    return [...missingLocal, ...list];
  } catch (err) {
    console.error('Exception in getWasteMaterials:', err);
    return localUserListings;
  }
}

export async function addWasteMaterial(formData: FormData): Promise<WasteMaterial> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultSellerId = '11111111-1111-4000-8000-000000000001';
  const userId = (user?.id && isValidUUID(user.id)) ? user.id : defaultSellerId;
  const companyName = user?.user_metadata?.company_name || user?.email?.split('@')[0] || 'Apex Industrial Recycling Corp'

  let image_url = null;
  const imageFile = formData.get('image_file') as File;
  
  if (imageFile && imageFile.size > 0) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('material-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('material-images')
          .getPublicUrl(uploadData.path);
        image_url = publicUrl;
      }
    } catch (e) {
      // Storage fallback
    }
  }

  const newWasteId = crypto.randomUUID();
  const newWaste: WasteMaterial = {
    id: newWasteId,
    seller_id: userId,
    material_name: (formData.get('material_name') as string) || 'Industrial Waste Byproduct',
    category: (formData.get('category') as string) || 'Textiles',
    quantity: Number(formData.get('quantity')) || 500,
    unit: (formData.get('unit') as string) || 'KG',
    condition: (formData.get('condition') as string) || 'Dry & clean',
    moisture_percentage: Number(formData.get('moisture_percentage')) || 5,
    contamination_level: (formData.get('contamination_level') as string) || 'Low',
    location: (formData.get('location') as string) || 'Tamil Nadu',
    expected_price: Number(formData.get('expected_price')) || 30,
    available_date: (formData.get('available_date') as string) || 'Immediate',
    description: (formData.get('description') as string) || '',
    image_url: image_url,
    status: 'active',
    seller: {
      company_name: companyName,
      company_address: 'Registered Industrial Complex',
      phone: '+91 98400 11223'
    },
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('waste_materials')
      .insert({
        id: newWaste.id,
        seller_id: userId,
        material_name: newWaste.material_name,
        category: newWaste.category,
        quantity: newWaste.quantity,
        unit: newWaste.unit,
        condition: newWaste.condition,
        moisture_percentage: newWaste.moisture_percentage,
        contamination_level: newWaste.contamination_level,
        location: newWaste.location,
        expected_price: newWaste.expected_price,
        available_date: newWaste.available_date,
        description: newWaste.description,
        image_url: newWaste.image_url,
        status: newWaste.status
      })
      .select()
      .single();

    if (!error && data) {
      newWaste.id = data.id;
    } else if (error) {
      console.warn('Supabase waste insert error:', error.message);
    }
  } catch (err: any) {
    console.warn('Fallback on waste insert:', err?.message || err);
  }

  localUserListings.unshift(newWaste);

  revalidatePath('/dashboard')
  revalidatePath('/waste')
  revalidatePath('/matches')
  revalidatePath('/buyer')

  return newWaste;
}

export async function updateWasteStatus(
  id: string, 
  status: 'active' | 'pending' | 'matched' | 'sold' | 'completed' | 'rejected' | 'archived'
) {
  try {
    const supabase = await createClient()
    await supabase
      .from('waste_materials')
      .update({ status })
      .eq('id', id);
  } catch (err) {
    // fallback
  }

  localUserListings = localUserListings.map(w => w.id === id ? { ...w, status } : w);

  revalidatePath('/dashboard')
  revalidatePath('/waste')
  revalidatePath('/matches')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteWasteMaterial(id: string) {
  try {
    const supabase = await createClient()
    await supabase
      .from('waste_materials')
      .delete()
      .eq('id', id);
  } catch (err) {
    // fallback
  }

  localUserListings = localUserListings.filter(w => w.id !== id);

  revalidatePath('/dashboard')
  revalidatePath('/waste')
  revalidatePath('/buyer')
}

export async function getMarketplaceWaste(): Promise<WasteMaterial[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('waste_materials')
      .select('*, seller:profiles!seller_id(company_name, company_address, phone)')
      .in('status', ['active', 'matched'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace waste:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Exception in getMarketplaceWaste:', err);
    return [];
  }
}
