const paymentBadges = [
  {id: 'visa', name: 'Visa'},
  {id: 'mastercard', name: 'Mastercard'},
  {id: 'amex', name: 'American Express'},
  {id: 'jcb', name: 'JCB'},
  {id: 'discover', name: 'Discover'},
  {id: 'diners', name: 'Diners Club'},
  {id: 'paypal', name: 'PayPal'}
];

export default function PaymentBadges() {
  return (
    <div className="payment-badges" aria-label="Accepted payment methods">
      {paymentBadges.map((badge) => (
        <span className={`payment-badge payment-${badge.id}`} key={badge.id}>
          {badge.name}
        </span>
      ))}
    </div>
  );
}
