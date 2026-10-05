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
  status: 'active' | 'pending' | 'matched' | 'sold' | 'completed' | 'rejected' | 'archived' | 'suspended';
  seller?: {
    company_name: string;
    company_address?: string;
    phone?: string;
    email?: string;
  };
  created_at: string;
  updated_at?: string;
}

import { sharedStore } from '@/lib/sharedStore'

function isValidUUID(str: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

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

    const { data } = await query;
    if (data && data.length > 0) {
      data.forEach((d: any) => {
        const sellerProfile = sharedStore.getCompanyById(d.seller_id);
        const wasteItem: WasteMaterial = {
          ...d,
          category: d.category || 'General Industrial Waste',
          unit: d.unit || 'KG',
          status: d.status || 'active',
          seller: sellerProfile ? {
            company_name: sellerProfile.company_name,
            company_address: sellerProfile.company_address,
            phone: '+91 98400 11223',
            email: sellerProfile.email
          } : (d.seller || {
            company_name: 'Apex Industrial Recycling Corp',
            company_address: 'Tirupur, Tamil Nadu',
            phone: '+91 98400 11223'
          })
        };
        // Merge into shared store if not already present
        if (!sharedStore.getWasteById(d.id)) {
          sharedStore.addWaste(wasteItem);
        }
      });
    }
  } catch (err) {
    // Non-critical, fallback to sharedStore
  }

  return sharedStore.getWaste('all');
}

export async function addWasteMaterial(formData: FormData): Promise<WasteMaterial> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultSellerId = '0a09b131-3e59-4206-8f62-2f4f75092243';
  const userId = (user?.id && isValidUUID(user.id)) ? user.id : defaultSellerId;
  const sellerCompany = sharedStore.getCompanyById(userId);
  const companyName = user?.user_metadata?.company_name || sellerCompany?.company_name || user?.email?.split('@')[0] || 'Apex Industrial Recycling Corp'

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
    location: (formData.get('location') as string) || sellerCompany?.company_address || 'Tamil Nadu',
    expected_price: Number(formData.get('expected_price')) || 30,
    available_date: (formData.get('available_date') as string) || 'Immediate',
    description: (formData.get('description') as string) || '',
    image_url: image_url,
    status: 'active',
    seller: {
      company_name: companyName,
      company_address: sellerCompany?.company_address || 'Registered Industrial Complex, Tamil Nadu',
      phone: '+91 98400 11223',
      email: sellerCompany?.email || 'apex.textiles@circulon.com'
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
    }
  } catch (err: any) {
    // Non-critical DB fallback
  }

  // Add to central shared store immediately for instant Buyer & Admin visibility
  sharedStore.addWaste(newWaste);

  revalidatePath('/dashboard')
  revalidatePath('/waste')
  revalidatePath('/matches')
  revalidatePath('/buyer')
  revalidatePath('/admin')

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

  sharedStore.updateWasteStatus(id, status);

  revalidatePath('/dashboard')
  revalidatePath('/waste')
  revalidatePath('/matches')
  revalidatePath('/admin')
  revalidatePath('/buyer')
  return { success: true }
}

export async function markWasteAsSold(id: string) {
  return await updateWasteStatus(id, 'sold');
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

  sharedStore.deleteWaste(id);

  revalidatePath('/dashboard')
  revalidatePath('/waste')
  revalidatePath('/buyer')
  revalidatePath('/admin')
}

export async function getMarketplaceWaste(): Promise<WasteMaterial[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('waste_materials')
      .select('*')
      .in('status', ['active', 'matched'])
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      data.forEach((d: any) => {
        if (!sharedStore.getWasteById(d.id)) {
          const sellerProfile = sharedStore.getCompanyById(d.seller_id);
          sharedStore.addWaste({
            ...d,
            seller: sellerProfile ? {
              company_name: sellerProfile.company_name,
              company_address: sellerProfile.company_address,
              phone: '+91 98400 11223',
              email: sellerProfile.email
            } : {
              company_name: 'Apex Industrial Recycling Corp',
              company_address: 'Tirupur, Tamil Nadu',
              phone: '+91 98400 11223'
            }
          });
        }
      });
    }
  } catch (err) {
    // fallback
  }

  // Returns live marketplace items from sharedStore (active & matched only)
  return sharedStore.getWaste('marketplace');
}
