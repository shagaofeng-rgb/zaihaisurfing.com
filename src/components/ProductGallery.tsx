type ProductGalleryProps = {
  images: string[];
  mainAlt: string;
  productName: string;
};

export default function ProductGallery({images, mainAlt, productName}: ProductGalleryProps) {
  const galleryId = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="product-gallery product-gallery-interactive">
      {images.map((image, index) => (
        <input
          className="product-gallery-radio"
          defaultChecked={index === 0}
          id={`${galleryId}-image-${index}`}
          key={`radio-${image}`}
          name={`${galleryId}-gallery`}
          type="radio"
        />
      ))}
      <div className="product-main-stack">
        {images.map((image, index) => (
          <img
            className="main-product-image gallery-main-image"
            src={image}
            alt={index === 0 ? mainAlt : `${productName} detail view ${index + 1}`}
            key={`main-${image}`}
          />
        ))}
      </div>
      <div className="product-thumbs" role="group" aria-label="Product detail images">
        {images.map((image, index) => (
          <label
            aria-label={`View ${productName} image ${index + 1}`}
            className="product-thumb-button"
            htmlFor={`${galleryId}-image-${index}`}
            key={`thumb-${image}`}
          >
            <img src={image} alt={`${productName} detail view ${index + 1}`} />
          </label>
        ))}
      </div>
    </div>
  );
}
