'use client';

import Image from 'next/image';
import {useState} from 'react';

type ProductGalleryProps = {
  images: string[];
  mainAlt: string;
  productName: string;
};

export default function ProductGallery({images, mainAlt, productName}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] || images[0];

  if (!selectedImage) return null;

  return (
    <div className="product-gallery product-gallery-interactive">
      <div className="product-main-stack">
        <Image
          className="main-product-image"
          src={selectedImage}
          alt={selectedIndex === 0 ? mainAlt : `${productName} detail view ${selectedIndex + 1}`}
          width={1400}
          height={1400}
          priority={selectedIndex === 0}
          sizes="(max-width: 760px) calc(100vw - 64px), (max-width: 1100px) 55vw, 700px"
        />
      </div>
      <div className="product-thumbs" role="group" aria-label="Product detail images">
        {images.map((image, index) => (
          <button
            type="button"
            aria-label={`View ${productName} image ${index + 1}`}
            aria-pressed={selectedIndex === index}
            className={`product-thumb-button${selectedIndex === index ? ' is-active' : ''}`}
            onClick={() => setSelectedIndex(index)}
            key={`thumb-${image}`}
          >
            <Image
              src={image}
              alt={`${productName} detail view ${index + 1}`}
              width={240}
              height={218}
              sizes="(max-width: 760px) 28vw, 180px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
