'use client';

/**
 * Přihlašovací stránka pro administraci
 *
 * Umožňuje admin uživatelům přihlásit se do administračního rozhraní.
 * Po úspěšném přihlášení jsou přesměrováni na dashboard.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Přesměruj na dashboard
        router.push('/admin/dashboard');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Přihlášení se nezdařilo');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Nepodařilo se přihlásit. Zkuste to prosím později.');
      console.error('Chyba:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy/10 to-gold/10 px-6">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Administrace
          </h1>
          <p className="text-sage">
            Přihlaste se pro správu ketubot
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">✗ {errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-navy font-semibold mb-2">
              Uživatelské jméno
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              placeholder="admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-navy font-semibold mb-2">
              Heslo
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gold text-white font-bold py-3 px-6 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Přihlašuji...' : 'Přihlásit se'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-sage/20">
          <p className="text-sage text-sm text-center">
            Pro vytvoření prvního admin účtu použijte API endpoint
            <code className="bg-sage/10 px-2 py-1 rounded text-xs ml-1">
              /api/admin/auth/init
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
