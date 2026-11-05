'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {ArrowsOutIcon, XIcon} from '@phosphor-icons/react';

export default function ProductGallery({images, mainAlt, productName}: {
  images: string[];
  mainAlt: string;
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const image = images[selectedIndex] || images[0];
  const alt = selectedIndex === 0 ? mainAlt : `${productName} detail view ${selectedIndex + 1}`;

  if (!image) return null;

  return (
    <div className="model-media">
      <div className="model-main-photo">
        <Image src={image} unoptimized={!image.startsWith('/') || image.startsWith('//')} alt={alt} fill sizes="(max-width: 760px) 92vw, (max-width: 1080px) 55vw, 680px" loading={selectedIndex === 0 ? 'eager' : undefined} fetchPriority={selectedIndex === 0 ? 'high' : undefined} />
        <button type="button" className="model-expand" onClick={() => {setExpanded(true); dialog.current?.showModal();}} aria-label="Enlarge product photo">
          <ArrowsOutIcon size={22} />
        </button>
      </div>
      <div className="model-thumbs" role="group" aria-label="Product gallery">
        {images.map((source, index) => (
          <button type="button" key={`${source}-${index}`} aria-label={`View ${productName} image ${index + 1}`} aria-pressed={selectedIndex === index} onClick={() => setSelectedIndex(index)}>
            <Image src={source} unoptimized={!source.startsWith('/') || source.startsWith('//')} alt="" width={90} height={64} sizes="80px" />
          </button>
        ))}
      </div>
      <p className="model-caption">Model photography · {images.length} views</p>
      <dialog className="model-lightbox" ref={dialog} aria-label="Product photo" onClose={() => setExpanded(false)}>
        <button type="button" className="button ghost" onClick={() => dialog.current?.close()}><XIcon size={17} /> Close</button>
        {expanded ? <Image src={image} unoptimized={!image.startsWith('/') || image.startsWith('//')} alt={alt} width={1100} height={800} sizes="85vw" /> : null}
      </dialog>
    </div>
  );
}
