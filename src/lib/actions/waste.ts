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

// Realistic seed listings for instant circular marketplace browsing & matching
const DEFAULT_MARKETPLACE_WASTE: WasteMaterial[] = [
  {
    id: 'sample-waste-1',
    seller_id: 'seller-apex-1',
    material_name: 'Post-Industrial Cotton Comber Scraps',
    category: 'Textiles',
    quantity: 4500,
    unit: 'KG',
    condition: 'Dry, Clean, Baled, 100% Ring Spun Comber',
    moisture_percentage: 6,
    contamination_level: 'Low',
    location: 'Tirupur, Tamil Nadu',
    expected_price: 38,
    available_date: 'Immediate Dispatch',
    description: 'Uniform short-staple cotton fiber byproduct from spinning mill. Zero polyester contamination. Excellent for open-end rotor yarn or acoustic insulation.',
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    seller: {
      company_name: 'Apex Industrial Recycling Corp',
      company_address: 'Plot 42, Textile Industrial Estate, Tirupur - 641604',
      phone: '+91 98765 43210',
      email: 'operations@apextextile.in'
    },
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'sample-waste-2',
    seller_id: 'seller-apex-1',
    material_name: 'High-Density Polyethylene (HDPE) Regrind Flakes',
    category: 'Plastics & Polymers',
    quantity: 12000,
    unit: 'KG',
    condition: 'Shredded 8-12mm Flakes, Washed & Degassed',
    moisture_percentage: 1,
    contamination_level: 'Low',
    location: 'Coimbatore, Tamil Nadu',
    expected_price: 28,
    available_date: 'Ready in Bins',
    description: 'Post-industrial blow molding drum scrap. High melt flow index. Ideal for corrugated drainage pipe extrusion and heavy crate manufacturing.',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    seller: {
      company_name: 'Apex Industrial Recycling Corp',
      company_address: 'Peenya Extension, Coimbatore - 641001',
      phone: '+91 98765 43210',
      email: 'plastics@apexrecycling.in'
    },
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'sample-waste-3',
    seller_id: 'seller-coir-3',
    material_name: 'Coconut Coir Pith (Desalinated Coco Peat)',
    category: 'Biomass & Agriculture',
    quantity: 18000,
    unit: 'KG',
    condition: 'Aged, Washed EC < 0.5 mS/cm, Sun-Dried',
    moisture_percentage: 14,
    contamination_level: 'Low',
    location: 'Pollachi, Tamil Nadu',
    expected_price: 14,
    available_date: 'Available Now',
    description: 'Washed and de-salted high organic matter coco peat blocks. High expansion volume (15L/kg). Ideal for horticulture and organic compost substrate.',
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    seller: {
      company_name: 'Pollachi Agro Coir Processors',
      company_address: 'Kovai Road, Pollachi, Tamil Nadu - 642002',
      phone: '+91 94433 77102',
      email: 'trade@pollachicoir.com'
    },
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'sample-waste-4',
    seller_id: 'seller-sugar-4',
    material_name: 'Dry Sugarcane Bagasse Pulp Fiber',
    category: 'Biomass & Agriculture',
    quantity: 25000,
    unit: 'KG',
    condition: 'Depithed, Baled, High Cellulose Content',
    moisture_percentage: 12,
    contamination_level: 'Low',
    location: 'Erode, Tamil Nadu',
    expected_price: 9,
    available_date: 'Immediate Dispatch',
    description: 'Crushed and depithed sugarcane stalks after juice extraction. Ready for biodegradable tableware compression or bioenergy briquetting.',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    seller: {
      company_name: 'Cauvery Bio-Renewables Ltd',
      company_address: 'Sugar Mill Corridor, Erode - 638001',
      phone: '+91 98421 99201',
      email: 'materials@cauverybio.in'
    },
    created_at: new Date(Date.now() - 3600000 * 64).toISOString(),
  },
  {
    id: 'sample-waste-5',
    seller_id: 'seller-rice-5',
    material_name: 'Paddy Rice Husk Ash & Raw Husk',
    category: 'Agricultural Residue',
    quantity: 15000,
    unit: 'KG',
    condition: 'Clean, Silo-Stored, Free from Grit',
    moisture_percentage: 8,
    contamination_level: 'Low',
    location: 'Thanjavur, Tamil Nadu',
    expected_price: 7,
    available_date: 'Next Week',
    description: 'High-silica agricultural byproduct from rice milling. Calorific value > 3000 kcal/kg. Superb feedstock for biomass gasifiers or green silica extraction.',
    image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    seller: {
      company_name: 'Delta Modern Rice Mills',
      company_address: 'Kumbakonam Main Road, Thanjavur - 613001',
      phone: '+91 94432 44199',
      email: 'procure@deltamills.com'
    },
    created_at: new Date(Date.now() - 3600000 * 80).toISOString(),
  },
  {
    id: 'sample-waste-6',
    seller_id: 'seller-pet-6',
    material_name: 'Clear Polyethylene Terephthalate (PET) Flakes',
    category: 'Plastics & Polymers',
    quantity: 8000,
    unit: 'KG',
    condition: 'Hot Caustic Washed, Float-Sink Separated, <100ppm PVC',
    moisture_percentage: 0.5,
    contamination_level: 'Low',
    location: 'Chennai, Tamil Nadu',
    expected_price: 42,
    available_date: 'Immediate Dispatch',
    description: 'Post-consumer clear transparent bottle flakes. De-labeled and sanitized. Ready for direct spinning into recycled polyester yarn (rPSF).',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    status: 'active',
    seller: {
      company_name: 'Metropolitan Circular Polymers',
      company_address: 'Ambattur Industrial Estate, Chennai - 600058',
      phone: '+91 98402 11988',
      email: 'supply@metrocircular.in'
    },
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  }
];

let localUserListings: WasteMaterial[] = [...DEFAULT_MARKETPLACE_WASTE.slice(0, 2)];

export async function getWasteMaterials(): Promise<WasteMaterial[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return localUserListings;
    }

    const { data, error } = await supabase
      .from('waste_materials')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localUserListings;
    }

    return data.map((d: any) => ({
      ...d,
      category: d.category || 'General Industrial Waste',
      unit: d.unit || 'KG',
      status: d.status || 'active',
    }));
  } catch (err) {
    return localUserListings;
  }
}

export async function addWasteMaterial(formData: FormData): Promise<WasteMaterial> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id || 'demo-seller-id'
  const companyName = user?.user_metadata?.company_name || user?.email?.split('@')[0] || 'Apex Industrial Recycling'

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

  const newWaste: WasteMaterial = {
    id: `waste-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    seller_id: userId,
    material_name: formData.get('material_name') as string,
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
      company_address: 'Registered Facility Address',
      phone: '+91 98765 43210'
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
        quantity: newWaste.quantity,
        unit: newWaste.unit,
        condition: newWaste.condition,
        location: newWaste.location,
        image_url: newWaste.image_url,
        status: newWaste.status
      })
      .select()
      .single();

    if (!error && data) {
      newWaste.id = data.id;
    }
  } catch (err) {
    // Graceful fallback to local store
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

    if (!error && data && data.length > 0) {
      // Merge with default marketplace waste if few listings
      const merged = [...data];
      DEFAULT_MARKETPLACE_WASTE.forEach(dw => {
        if (!merged.some(m => m.id === dw.id || m.material_name?.toLowerCase() === dw.material_name.toLowerCase())) {
          merged.push(dw);
        }
      });
      return merged;
    }
    return DEFAULT_MARKETPLACE_WASTE;
  } catch (err) {
    return DEFAULT_MARKETPLACE_WASTE;
  }
}
