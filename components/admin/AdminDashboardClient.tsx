"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ketuba {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sourceLocale?: 'cs' | 'en' | 'he';
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [ketubas, setKetubas] = useState<Ketuba[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingKetuba, setEditingKetuba] = useState<Ketuba | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
  });

  useEffect(() => {
    loadKetubas();
  }, []);

  const loadKetubas = async () => {
    try {
      const response = await fetch('/api/admin/ketubas');
      const data = await response.json();
      if (response.ok) {
        const mapped = (data.ketubas || []).map((k: any) => {
          const name = k.name_cs || k.name_en || k.name_he || '';
          const description = k.description_cs || k.description_en || k.description_he || '';
          const category = k.category_cs || k.category_en || k.category_he || '';
          const sourceLocale: Ketuba['sourceLocale'] = k.name_cs ? 'cs' : k.name_en ? 'en' : k.name_he ? 'he' : undefined;

          return {
            id: k.id,
            name,
            description,
            price: k.price || 0,
            image: k.image || '',
            category,
            sourceLocale,
          };
        });
        setKetubas(mapped);
      }
    } catch (error) {
      console.error('Chyba při načítání ketubot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingKetuba
      ? `/api/admin/ketubas/${editingKetuba.id}`
      : '/api/admin/ketubas';

    const method = editingKetuba ? 'PUT' : 'POST';

    const payload = {
      name_cs: formData.name || '',
      description_cs: formData.description || '',
      category_cs: formData.category || '',
      name_en: formData.name || '',
      description_en: formData.description || '',
      category_en: formData.category || '',
      name_he: '',
      description_he: '',
      category_he: '',
      price: parseFloat(formData.price) || 0,
      image: formData.image || '',
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingKetuba(null);
        setFormData({ name: '', description: '', price: '', image: '', category: '' });
        loadKetubas();
      } else {
        const data = await response.json().catch(() => ({}));
        console.error('Server response:', data);
      }
    } catch (error) {
      console.error('Chyba při ukládání ketuboty:', error);
    }
  };

  const handleEdit = (ketuba: Ketuba) => {
    setEditingKetuba(ketuba);
    setFormData({
      name: ketuba.name || '',
      description: ketuba.description || '',
      price: ketuba.price != null ? ketuba.price.toString() : '',
      image: ketuba.image || '',
      category: ketuba.category || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tuto ketubu?')) return;

    try {
      const response = await fetch(`/api/admin/ketubas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadKetubas();
      }
    } catch (error) {
      console.error('Chyba při mazání ketuboty:', error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingKetuba(null);
    setFormData({ name: '', description: '', price: '', image: '', category: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-navy">Načítám...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-navy/5 to-gold/5">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Odhlásit se
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-gold text-white font-bold rounded-lg hover:bg-gold/90 transition-colors"
          >
            + Přidat novou ketubu
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">
              {editingKetuba ? 'Upravit ketubu' : 'Přidat novou ketubu'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-navy font-semibold mb-2">Název *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold mb-2">Popis</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold mb-2">Cena (Kč) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold mb-2">URL obrázku</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-4">
                    <p className="text-sm text-sage mb-2">Náhled:</p>
                    <div className="border-2 border-sage/20 rounded-lg overflow-hidden max-w-md">
                      <img
                        src={formData.image}
                        alt={formData.name || 'Náhled obrázku'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="p-4 text-center text-red-500">Nepodařilo se načíst obrázek</div>';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-navy font-semibold mb-2">Kategorie</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="např. Tradiční, Moderní, Custom"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="px-6 py-3 bg-gold text-white font-bold rounded-lg hover:bg-gold/90 transition-colors">
                  {editingKetuba ? 'Uložit změny' : 'Přidat ketubu'}
                </button>
                <button type="button" onClick={handleCancelForm} className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-colors">
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-navy text-white font-bold">Všechny ketuboty ({ketubas.length})</div>

          {ketubas.length === 0 ? (
            <div className="p-6 text-center text-sage">Zatím nejsou žádné ketuboty. Přidejte první!</div>
          ) : (
            <div className="divide-y divide-sage/20">
              {ketubas.map((ketuba) => (
                <div key={ketuba.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4 items-start">
                    {ketuba.image ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border-2 border-sage/20">
                        <img
                          src={ketuba.image}
                          alt={ketuba.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-sage/10 text-sage text-xs">Chyba</div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-sage/10 shrink-0 flex items-center justify-center border-2 border-sage/20">
                        <span className="text-gold text-2xl">✡</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-navy mb-2">{ketuba.name}</h3>
                        {ketuba.sourceLocale && (
                          <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-sage/10 text-sage">{ketuba.sourceLocale}</span>
                        )}
                      </div>
                      {ketuba.description && <p className="text-sage mb-2">{ketuba.description}</p>}
                      <div className="flex gap-4 text-sm">
                        <span className="text-gold font-bold">{ketuba.price.toLocaleString('cs-CZ')} Kč</span>
                        {ketuba.category && <span className="text-sage">Kategorie: {ketuba.category}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4 shrink-0">
                      <button onClick={() => handleEdit(ketuba)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">Upravit</button>
                      <button onClick={() => handleDelete(ketuba.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">Smazat</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
