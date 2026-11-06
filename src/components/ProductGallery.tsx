'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {ArrowsOutIcon, XIcon} from '@phosphor-icons/react';
import {fastCatalogImage} from '@/lib/catalogImages';

export default function ProductGallery({images, mainAlt, productName, french = false}: {
  images: string[];
  mainAlt: string;
  productName: string;
  french?: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const enlarge = useRef<HTMLButtonElement>(null);
  const image = images[selectedIndex] || images[0];
  const alt = selectedIndex === 0 ? mainAlt : french ? `${productName}, vue ${selectedIndex + 1}` : `${productName} detail view ${selectedIndex + 1}`;
  const sizes = '(max-width: 760px) 92vw, (max-width: 1080px) 55vw, 680px';
  const fastImage = image && fastCatalogImage(image);

  if (!image) return null;

  return (
    <div className="model-media">
      <div className="model-main-photo">
        {fastImage ? <img {...fastImage} alt={alt} sizes={sizes} className="catalog-fast-photo" loading="eager" fetchPriority={selectedIndex === 0 ? 'high' : 'auto'} />
          : <Image src={image} unoptimized={!image.startsWith('/') || image.startsWith('//')} alt={alt} fill sizes={sizes} loading="eager" fetchPriority={selectedIndex === 0 ? 'high' : 'auto'} />}
        <button ref={enlarge} type="button" className="model-expand" onClick={() => {setExpanded(true); dialog.current?.showModal();}}
          aria-label={french ? 'Agrandir la photo du produit' : 'Enlarge product photo'}>
          <ArrowsOutIcon size={22} aria-hidden />
        </button>
      </div>
      <div className="model-thumbs" role="group" aria-label={french ? 'Galerie de photos' : 'Product gallery'}>
        {images.map((source, index) => (
          <button type="button" key={`${source}-${index}`} aria-label={french ? `Voir ${productName}, photo ${index + 1}` : `View ${productName} image ${index + 1}`} aria-pressed={selectedIndex === index} onClick={() => setSelectedIndex(index)}>
            <Image src={source} unoptimized={!source.startsWith('/') || source.startsWith('//')} alt="" width={90} height={64} sizes="80px" />
          </button>
        ))}
      </div>
      <p className="model-caption">{french ? `Photos du modèle · ${images.length} vues` : `Model photography · ${images.length} views`}</p>
      <dialog className="model-lightbox" ref={dialog} aria-label={french ? 'Photo du produit' : 'Product photo'} onClose={() => {setExpanded(false); enlarge.current?.focus();}}
        onClick={(event) => {if (event.target === event.currentTarget) dialog.current?.close();}}>
        <button type="button" className="button ghost" onClick={() => dialog.current?.close()}><XIcon size={17} aria-hidden /> {french ? 'Fermer' : 'Close'}</button>
        {expanded ? <Image src={image} unoptimized={!image.startsWith('/') || image.startsWith('//')} alt={alt} width={1100} height={800} sizes="85vw" /> : null}
      </dialog>
    </div>
  );
}
