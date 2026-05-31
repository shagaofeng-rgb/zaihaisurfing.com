const paymentBadges = ['Visa', 'Mastercard', 'American Express', 'JCB', 'Discover', 'Diners Club', 'PayPal'];

export default function PaymentBadges() {
  return (
    <div className="payment-badges" aria-label="Accepted payment methods">
      {paymentBadges.map((name) => (
        <span className="payment-badge" key={name}>
          {name}
        </span>
      ))}
    </div>
  );
}
