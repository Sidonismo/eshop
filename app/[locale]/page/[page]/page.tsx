import Link from 'next/link';

type Product = {
	id: string | number;
	name: string;
	description?: string;
	price?: number;
	image?: string;
};

import { products as staticProducts } from '@/data/products';

const PAGE_SIZE = 2;

export default async function Page({ params }: { params: Promise<{ locale: string; page?: string }> }) {
	const resolved = await params;
	const locale = resolved.locale || 'cs';
	const pageNum = Math.max(1, Number(resolved.page || 1));

	const all: Product[] = Array.isArray(staticProducts) ? staticProducts : [];
	const total = all.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const start = (pageNum - 1) * PAGE_SIZE;
	const paged = all.slice(start, start + PAGE_SIZE);

	return (
		<div className="container mx-auto px-6 py-8">
			<h1 className="text-2xl font-bold mb-4">Stránka {pageNum}</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{paged.map((p) => (
					<article key={p.id} className="bg-white rounded shadow p-4">
						<h2 className="font-semibold text-lg mb-2">{p.name}</h2>
						{p.image && (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={p.image} alt={p.name} className="w-full h-40 object-cover mb-2" />
						)}
						<p className="text-sm text-sage mb-2">{p.description}</p>
						<div className="flex justify-between items-center">
							<Link href={`/${locale}/produkt/${p.id}`} className="text-gold font-bold">
								Zobrazit
							</Link>
							{typeof p.price === 'number' && <span className="font-bold">{p.price} Kč</span>}
						</div>
					</article>
				))}
			</div>

			<nav className="mt-6 flex items-center justify-center gap-3">
				{Array.from({ length: totalPages }).map((_, i) => {
					const idx = i + 1;
					return (
						<Link
							key={idx}
							href={`/${locale}/page/${idx}`}
							className={`px-3 py-1 rounded ${idx === pageNum ? 'bg-navy text-white' : 'bg-white border'}`}
						>
							{idx}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}

