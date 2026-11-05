'use client';

import {useState} from 'react';
import {MapPinIcon, ArrowSquareOutIcon} from '@phosphor-icons/react';

export default function ContactMap({src, url, label, address, company}: {src: string; url: string; label: string; address: string; company: string}) {
  const [open,setOpen] = useState(false);
  return <div className="contact-location">
    <div className="contact-location-copy"><MapPinIcon size={35} aria-hidden="true" /><strong>Visit ZAIHAI</strong><span>{company}</span><a className="contact-map-address" href={url} target="_blank" rel="noopener noreferrer">{address}</a><a href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowSquareOutIcon size={18} aria-hidden="true" /></a></div>
    <details onToggle={event=>setOpen(event.currentTarget.open)}><summary>View interactive Google map</summary>{open ? <iframe title="ZAIHAI SURFING location" src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : null}</details>
  </div>;
}
