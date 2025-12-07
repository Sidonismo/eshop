"use client";

import React, { useState } from 'react';

interface Props {
  images: string[];
  alt?: string;
}

export default function ProductGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg aspect-[3/4] placeholder-img">
        <div className="text-center p-8">
          <div className="text-9xl mb-4 text-gold/40">✡</div>
          <div className="text-sage/60">No image</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-[3/4] bg-gradient-to-br from-sage/10 to-gold/10 overflow-hidden">
          <img
            src={images[index]}
            alt={alt ?? 'Product image'}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-20 h-20 rounded-md overflow-hidden border ${i === index ? 'border-gold' : 'border-transparent'} focus:outline-none`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt={`${alt ?? 'Product'} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
